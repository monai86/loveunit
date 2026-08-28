import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = body as { currentPassword?: string; newPassword?: string };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    const h = await headers();

    // Verify a real session exists before doing anything.
    const session = await auth.api.getSession({ headers: h });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Change password — verifies currentPassword against the stored hash and
    // rotates the session cookie in the response.
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: h,
    });

    // Clear the must-change flag now that the password is updated.
    if (db) {
      await db
        .update(user)
        .set({ mustChangePassword: false })
        .where(eq(user.id, session.user.id));
    }

    const me = await getAuthenticatedUser();
    return NextResponse.json({
      success: true,
      redirect: me?.profile?.role === 'ADMIN' ? '/mt70' : '/staff/checkin',
    });
  } catch (err) {
    const message = (err as Error)?.message || '';
    if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('incorrect')) {
      return NextResponse.json({ success: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }, { status: 400 });
    }
    console.error('complete-password-change error:', err);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
