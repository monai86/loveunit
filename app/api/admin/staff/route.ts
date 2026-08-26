import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { getAllStaffMembers, updateStaffRoleAndTeam, recordAuditLog } from '@/services/admin-service';
import { db } from '@/db';
import { staffProfiles, user, account } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { isMemoryBackendAllowed, upsertInMemoryStaff } from '@/lib/db/store';
import { hashPassword } from 'better-auth/crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const staffList = await getAllStaffMembers();
    return NextResponse.json({ success: true, staff: staffList });
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
    const { email, password, displayName, team } = body;

    if (!email || !displayName) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (Email, ชื่อ-นามสกุล)' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (db) {
      // Check if user already exists
      const [existingUser] = await db.select().from(user).where(eq(user.email, normalizedEmail)).limit(1);
      let userId = existingUser?.id;
      const hashedPassword = await hashPassword(password);

      if (!userId) {
        try {
          const created = await auth.api.signUpEmail({
            body: {
              email: normalizedEmail,
              password,
              name: displayName,
            },
          });
          if (created?.user?.id) {
            userId = created.user.id;
          }
        } catch {
          // Direct DB fallback
          const newUserId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().replace(/-/g, '')
            : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
          await db.insert(user).values({
            id: newUserId,
            email: normalizedEmail,
            name: displayName,
            emailVerified: true,
            mustChangePassword: false,
          });
          userId = newUserId;

          const newAccId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID().replace(/-/g, '')
            : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
          await db.insert(account).values({
            id: newAccId,
            accountId: normalizedEmail,
            providerId: 'credential',
            userId,
            password: hashedPassword,
          });
        }
      } else {
        // Update existing user's password
        const [accRecord] = await db
          .select()
          .from(account)
          .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
          .limit(1);

        if (accRecord) {
          await db.update(account).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(account.id, accRecord.id));
        } else {
          const newAccId = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
          await db.insert(account).values({
            id: newAccId,
            accountId: normalizedEmail,
            providerId: 'credential',
            userId,
            password: hashedPassword,
          });
        }
      }

      if (userId) {
        await db.update(user).set({ mustChangePassword: false, name: displayName, updatedAt: new Date() }).where(eq(user.id, userId));

        // Upsert staff profile
        const [existingProfile] = await db.select().from(staffProfiles).where(eq(staffProfiles.userId, userId)).limit(1);

        if (existingProfile) {
          await db.update(staffProfiles).set({
            displayName,
            role: 'ADMIN',
            team: team || existingProfile.team,
            isActive: true,
            updatedAt: new Date(),
          }).where(eq(staffProfiles.userId, userId));
        } else {
          await db.insert(staffProfiles).values({
            userId,
            displayName,
            role: 'ADMIN',
            team: team || 'Management',
            isActive: true,
          });
        }
      }

      await recordAuditLog({
        actorId: adminUser.id,
        action: 'CREATE_OR_UPDATE_ADMIN',
        entityType: 'staff_profile',
        entityId: userId,
        metadata: { email: normalizedEmail, displayName, role: 'ADMIN', team },
      });

      return NextResponse.json({ success: true, message: `สร้าง/อัปเดตบัญชีผู้ดูแลระบบ ${displayName} สำเร็จ` });
    }

    if (isMemoryBackendAllowed()) {
      const staffRecord = await upsertInMemoryStaff({
        email: normalizedEmail,
        displayName,
        role: 'ADMIN',
        team,
        isActive: true,
      });

      await recordAuditLog({
        actorId: adminUser.id,
        action: 'CREATE_OR_UPDATE_ADMIN',
        entityType: 'staff_profile',
        entityId: staffRecord.user_id,
        metadata: { email: normalizedEmail, displayName, role: 'ADMIN', team },
      });

      return NextResponse.json({ success: true, message: `สร้าง/อัปเดตบัญชี Admin ${displayName} สำเร็จ`, staff: staffRecord });
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
        role: 'ADMIN',
        team,
        isActive,
        actorId: adminUser.id,
      });

      if (res.success) {
        return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลผู้ดูแลระบบและรหัสผ่านเรียบร้อย' });
      } else {
        return NextResponse.json({ success: false, message: res.message || 'ไม่พบผู้ดูแลระบบ' }, { status: 404 });
      }
    }

    if (isMemoryBackendAllowed()) {
      await updateStaffRoleAndTeam({
        userId,
        role: 'ADMIN',
        team,
        isActive,
        actorId: adminUser.id,
      });
      return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลผู้ดูแลระบบเรียบร้อย' });
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
