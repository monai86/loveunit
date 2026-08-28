import { NextRequest, NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { account, staffInvitations, staffProfiles, user } from '@/db/schema';
import { hashPassword } from 'better-auth/crypto';
import { hashInvitationToken, isInvitationUsable } from '@/lib/auth/invitation-token';

export const dynamic = 'force-dynamic';

function tokenFromContext(context: { params: Promise<{ token: string }> }) {
  return context.params.then(({ token }) => token);
}

export async function GET(_req: NextRequest, context: { params: Promise<{ token: string }> }) {
  if (!db) return NextResponse.json({ success: false, message: 'Database unconfigured' }, { status: 503 });
  const token = await tokenFromContext(context);
  const [invitation] = await db.select().from(staffInvitations).where(eq(staffInvitations.tokenHash, hashInvitationToken(token))).limit(1);
  if (!invitation || !isInvitationUsable(invitation, token)) {
    return NextResponse.json({ success: false, message: 'คำเชิญไม่ถูกต้อง หมดอายุ หรือถูกใช้งานแล้ว' }, { status: 404 });
  }
  return NextResponse.json({ success: true, invitation: { email: invitation.email, displayName: invitation.displayName, team: invitation.team } });
}

export async function POST(req: NextRequest, context: { params: Promise<{ token: string }> }) {
  if (!db) return NextResponse.json({ success: false, message: 'Database unconfigured' }, { status: 503 });
  const token = await tokenFromContext(context);
  const body = await req.json();
  const password = typeof body.password === 'string' ? body.password : '';
  if (password.length < 8) {
    return NextResponse.json({ success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
  }

  const [invitation] = await db.select().from(staffInvitations).where(eq(staffInvitations.tokenHash, hashInvitationToken(token))).limit(1);
  if (!invitation || !isInvitationUsable(invitation, token)) {
    return NextResponse.json({ success: false, message: 'คำเชิญไม่ถูกต้อง หมดอายุ หรือถูกใช้งานแล้ว' }, { status: 400 });
  }
  const [existingUser] = await db.select().from(user).where(eq(user.email, invitation.email)).limit(1);
  if (existingUser) {
    return NextResponse.json({ success: false, message: 'อีเมลนี้มีบัญชีอยู่แล้ว กรุณาติดต่อผู้ดูแลระบบ' }, { status: 409 });
  }

  const userId = crypto.randomUUID().replace(/-/g, '');
  const accountId = crypto.randomUUID().replace(/-/g, '');
  const passwordHash = await hashPassword(password);
  const now = new Date();
  try {
    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(staffInvitations)
        .set({ acceptedAt: now, updatedAt: now })
        .where(and(eq(staffInvitations.id, invitation.id), isNull(staffInvitations.acceptedAt)))
        .returning({ id: staffInvitations.id });
      if (!updated) throw new Error('INVITATION_ALREADY_USED');

      await tx.insert(user).values({ id: userId, email: invitation.email, name: invitation.displayName, emailVerified: true, mustChangePassword: false });
      await tx.insert(account).values({ id: accountId, accountId: invitation.email, providerId: 'credential', userId, password: passwordHash });
      await tx.insert(staffProfiles).values({ userId, displayName: invitation.displayName, role: 'STAFF', team: invitation.team, isActive: true });
    });
  } catch (error) {
    const message = error instanceof Error && error.message === 'INVITATION_ALREADY_USED'
      ? 'คำเชิญนี้ถูกใช้งานแล้ว'
      : 'ไม่สามารถเปิดใช้งานบัญชีได้';
    return NextResponse.json({ success: false, message }, { status: 409 });
  }

  return NextResponse.json({ success: true, message: 'เปิดใช้งานบัญชีเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ' });
}
