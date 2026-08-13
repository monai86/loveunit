import { NextResponse } from 'next/server';
import { getEventBySlug } from '@/services/event-service';
import { getWaitlist } from '@/services/waitlist-service';
import { requireAdmin } from '@/lib/auth/server';

export async function GET() {
  try {
    try {
      await requireAdmin();
    } catch (err: unknown) {
      const status = (err as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงรายการรอ' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const entries = await getWaitlist(event.id);
    return NextResponse.json({ success: true, waitlist: entries });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
