import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/server';
import { getAllStaffMembers, updateStaffRoleAndTeam, recordAuditLog } from '@/services/admin-service';
import { db } from '@/db';
import { staffProfiles, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { isMemoryBackendAllowed, upsertInMemoryStaff } from '@/lib/db/store';
import { StaffRole } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const staffList = await getAllStaffMembers();
    return NextResponse.json({ success: true, staff: staffList });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await req.json();
    const { email, password, displayName, role, team } = body;

    if (!email || !displayName || !role) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (Email, ชื่อ-สกุล, บทบาท)' }, { status: 400 });
    }

    const validRoles: StaffRole[] = ['STAFF', 'TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, message: 'บทบาท (Role) ไม่ถูกต้อง' }, { status: 400 });
    }

    // Only SUPER_ADMIN can create or grant SUPER_ADMIN role
    if (role === 'SUPER_ADMIN' && adminUser.profile.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'เฉพาะ Super Admin เท่านั้นที่สามารถมอบสิทธิ์ Super Admin ได้' }, { status: 403 });
    }

    if (db) {
      // Check if user already exists
      const [existingUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
      let userId = existingUser?.id;

      if (!userId) {
        if (!password || password.length < 8) {
          return NextResponse.json({ success: false, message: 'รหัสผ่านเริ่มต้นต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
        }

        const created = await auth.api.signUpEmail({
          body: {
            email,
            password,
            name: displayName,
          },
        });

        if (!created?.user?.id) {
          return NextResponse.json({ success: false, message: 'ไม่สามารถสร้างผู้ใช้งานในระบบ Better-Auth ได้' }, { status: 500 });
        }
        userId = created.user.id;
      }

      // Upsert staff profile
      const [existingProfile] = await db.select().from(staffProfiles).where(eq(staffProfiles.userId, userId)).limit(1);

      if (existingProfile) {
        await db.update(staffProfiles).set({
          displayName,
          role,
          team: team || existingProfile.team,
          isActive: true,
          updatedAt: new Date(),
        }).where(eq(staffProfiles.userId, userId));
      } else {
        await db.insert(staffProfiles).values({
          userId,
          displayName,
          role,
          team: team || null,
          isActive: true,
        });
      }

      await recordAuditLog({
        actorId: adminUser.id,
        action: 'CREATE_OR_UPDATE_STAFF',
        entityType: 'staff_profile',
        entityId: userId,
        metadata: { email, displayName, role, team },
      });

      return NextResponse.json({ success: true, message: `สร้าง/อัปเดตบทบาท [${role}] ให้ ${displayName} สำเร็จ` });
    }

    if (isMemoryBackendAllowed()) {
      const staffRecord = await upsertInMemoryStaff({
        email,
        displayName,
        role,
        team,
        isActive: true,
      });

      await recordAuditLog({
        actorId: adminUser.id,
        action: 'CREATE_OR_UPDATE_STAFF',
        entityType: 'staff_profile',
        entityId: staffRecord.user_id,
        metadata: { email, displayName, role, team },
      });

      return NextResponse.json({ success: true, message: `สร้าง/อัปเดตบทบาท [${role}] ในหน่วยความจำสำเร็จ`, staff: staffRecord });
    }

    return NextResponse.json({ success: false, message: 'Database unconfigured' }, { status: 500 });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await req.json();
    const { userId, role, team, isActive } = body;

    if (!userId || !role) {
      return NextResponse.json({ success: false, message: 'Missing userId or role' }, { status: 400 });
    }

    // Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (role === 'SUPER_ADMIN' && adminUser.profile.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'เฉพาะ Super Admin เท่านั้นที่สามารถมอบสิทธิ์ Super Admin ได้' }, { status: 403 });
    }

    const res = await updateStaffRoleAndTeam({
      userId,
      role,
      team,
      isActive,
      actorId: adminUser.id,
    });

    if (res.success) {
      return NextResponse.json({ success: true, message: 'อัปเดตบทบาทและทีมเรียบร้อย' });
    } else {
      return NextResponse.json({ success: false, message: res.message || 'ไม่พบเจ้าหน้าที่' }, { status: 404 });
    }
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error?.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}
