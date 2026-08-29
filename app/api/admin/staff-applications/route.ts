import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/server';
import { listStaffApplications } from '@/services/staff-application-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireSuperAdmin();
    const applications = await listStaffApplications();
    return NextResponse.json({ success: true, applications });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    console.error('Unable to list staff applications:', error);
    return NextResponse.json({ success: false, message: 'ไม่สามารถโหลดคำขอสมัคร Staff ได้' }, { status: 500 });
  }
}
