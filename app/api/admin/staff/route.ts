import { NextRequest, NextResponse } from 'next/server';
import { canDeleteManagedAccount, requireAdmin, requireReadOnlyAdmin } from '@/lib/auth/server';
import { getAllStaffMembers, updateStaffRoleAndTeam, recordAuditLog } from '@/services/admin-service';
import { db } from '@/db';
import { auditLogs, staffProfiles, staffInvitations, user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { isMemoryBackendAllowed, upsertInMemoryStaff } from '@/lib/db/store';
import { hashPassword } from 'better-auth/crypto';
import { createInvitationToken, hashInvitationToken } from '@/lib/auth/invitation-token';
import { sendStaffInvitation } from '@/services/email-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireReadOnlyAdmin();
    const staffList = await getAllStaffMembers();
    const invitations = db
      ? await db.select({
        id: staffInvitations.id,
        email: staffInvitations.email,
        displayName: staffInvitations.displayName,
        team: staffInvitations.team,
        expiresAt: staffInvitations.expiresAt,
        acceptedAt: staffInvitations.acceptedAt,
      }).from(staffInvitations)
      : [];
    return NextResponse.json({ success: true, staff: staffList, invitations });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await req.json();
    const { email, displayName, team } = body;

    if (!email || !displayName) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (Email, ชื่อ-นามสกุล)' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === adminUser.email.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'ไม่สามารถส่งคำเชิญให้บัญชี Admin หลักได้' }, { status: 400 });
    }

    if (db) {
      const [existingUser] = await db.select().from(user).where(eq(user.email, normalizedEmail)).limit(1);
      if (existingUser) return NextResponse.json({ success: false, message: 'อีเมลนี้มีบัญชีอยู่แล้ว' }, { status: 409 });

      const token = createInvitationToken();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);
      await db.insert(staffInvitations).values({
        email: normalizedEmail,
        displayName,
        team: team || null,
        tokenHash: hashInvitationToken(token),
        expiresAt,
        invitedBy: adminUser.id,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: staffInvitations.email,
        set: { displayName, team: team || null, tokenHash: hashInvitationToken(token), expiresAt, acceptedAt: null, invitedBy: adminUser.id, updatedAt: now },
      });

      await recordAuditLog({
        actorId: adminUser.id,
        action: 'CREATE_STAFF_INVITATION',
        entityType: 'staff_invitation',
        entityId: normalizedEmail,
        metadata: { email: normalizedEmail, displayName, role: 'STAFF', team, expiresAt: expiresAt.toISOString() },
      });
      try {
        await sendStaffInvitation({ to: normalizedEmail, displayName, token });
      } catch {
        return NextResponse.json({ success: false, message: 'บันทึกคำเชิญแล้ว แต่ส่งอีเมลไม่สำเร็จ กรุณาตั้งค่า SMTP และส่งคำเชิญใหม่' }, { status: 503 });
      }
      return NextResponse.json({ success: true, message: `ส่งคำเชิญ Staff ถึง ${displayName} สำเร็จ` });
    }

    if (isMemoryBackendAllowed()) {
      const staffRecord = await upsertInMemoryStaff({
        email: normalizedEmail,
        displayName,
        role: 'STAFF',
        team,
        isActive: true,
      });

      await recordAuditLog({
        actorId: adminUser.id,
        action: 'CREATE_STAFF_INVITATION',
        entityType: 'staff_profile',
        entityId: staffRecord.user_id,
        metadata: { email: normalizedEmail, displayName, role: 'STAFF', team },
      });

      return NextResponse.json({ success: true, message: `เพิ่ม Staff ${displayName} สำเร็จ`, staff: staffRecord });
    }

    return NextResponse.json({ success: false, message: 'Database unconfigured' }, { status: 500 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await req.json();
    const { userId, displayName, team, isActive, password } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    if (db) {
      // If password is provided, update password in account table
      if (password && password.length >= 6) {
        const hashedPassword = await hashPassword(password);
        const [accRecord] = await db
          .select()
          .from(account)
          .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
          .limit(1);

        if (accRecord) {
          await db.update(account).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(account.id, accRecord.id));
        } else {
          const [u] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
          if (u) {
            const newAccId = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
            await db.insert(account).values({
              id: newAccId,
              accountId: u.email,
              providerId: 'credential',
              userId,
              password: hashedPassword,
            });
          }
        }
        await db.update(user).set({ mustChangePassword: false, updatedAt: new Date() }).where(eq(user.id, userId));
      }

      if (displayName) {
        await db.update(user).set({ name: displayName, updatedAt: new Date() }).where(eq(user.id, userId));
        await db.update(staffProfiles).set({ displayName, updatedAt: new Date() }).where(eq(staffProfiles.userId, userId));
      }

      const res = await updateStaffRoleAndTeam({
        userId,
        role: 'STAFF',
        team,
        isActive,
        actorId: adminUser.id,
      });

      if (res.success) {
        return NextResponse.json({ success: true, message: 'อัปเดตข้อมูล Staff และรหัสผ่านเรียบร้อย' });
      } else {
        return NextResponse.json({ success: false, message: res.message || 'ไม่พบ Staff' }, { status: 404 });
      }
    }

    if (isMemoryBackendAllowed()) {
      await updateStaffRoleAndTeam({
        userId,
        role: 'STAFF',
        team,
        isActive,
        actorId: adminUser.id,
      });
      return NextResponse.json({ success: true, message: 'อัปเดตข้อมูล Staff เรียบร้อย' });
    }

    return NextResponse.json({ success: false, message: 'Database unconfigured' }, { status: 500 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const { userId } = await req.json();
    if (typeof userId !== 'string' || !userId) return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });

    if (db) {
      const [target] = await db.select({ id: user.id, email: user.email }).from(user).where(eq(user.id, userId)).limit(1);
      if (!target) return NextResponse.json({ success: false, message: 'ไม่พบบัญชีที่ต้องการลบ' }, { status: 404 });
      if (!canDeleteManagedAccount(adminUser, target)) return NextResponse.json({ success: false, message: 'ไม่สามารถลบบัญชี Admin หลักหรือบัญชีของตนเองได้' }, { status: 403 });
      await db.transaction(async (tx) => {
        await tx.delete(user).where(eq(user.id, target.id));
        await tx.insert(auditLogs).values({
          actorId: adminUser.id, action: 'DELETE_STAFF_ACCOUNT', entityType: 'user', entityId: target.id, metadata: { email: target.email },
        });
      });
      return NextResponse.json({ success: true, message: `ลบบัญชี ${target.email} เรียบร้อยแล้ว` });
    }

    if (isMemoryBackendAllowed()) {
      const { inMemoryStaffProfiles } = await import('@/lib/db/store');
      const targetIndex = inMemoryStaffProfiles.findIndex((staff) => staff.user_id === userId);
      const target = inMemoryStaffProfiles[targetIndex];
      if (!target) return NextResponse.json({ success: false, message: 'ไม่พบบัญชีที่ต้องการลบ' }, { status: 404 });
      if (!canDeleteManagedAccount(adminUser, { id: target.user_id, email: target.email })) return NextResponse.json({ success: false, message: 'ไม่สามารถลบบัญชี Admin หลักหรือบัญชีของตนเองได้' }, { status: 403 });
      inMemoryStaffProfiles.splice(targetIndex, 1);
      return NextResponse.json({ success: true, message: `ลบบัญชี ${target.email} เรียบร้อยแล้ว` });
    }
    return NextResponse.json({ success: false, message: 'Database unconfigured' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
