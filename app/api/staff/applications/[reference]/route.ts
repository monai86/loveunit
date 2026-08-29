import { NextRequest, NextResponse } from 'next/server';
import { getPublicStaffApplicationStatus } from '@/services/staff-application-service';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: { params: Promise<{ reference: string }> }) {
  try {
    const { reference } = await context.params;
    const application = await getPublicStaffApplicationStatus(reference);
    if (!application) {
      return NextResponse.json({ success: false, message: 'ไม่พบคำขอสมัครนี้' }, { status: 404 });
    }
    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Unable to read staff application status:', error);
    return NextResponse.json({ success: false, message: 'ไม่สามารถตรวจสอบสถานะได้ในขณะนี้' }, { status: 500 });
  }
}
