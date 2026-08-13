import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/server';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'UNAUTHORIZED' }, { status: 401 });
  }
  return NextResponse.json({ success: true, user });
}
