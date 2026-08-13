import { NextResponse } from 'next/server';
import { getEventBySlug } from '@/services/event-service';
import { getDashboardKPIs } from '@/services/admin-service';
import { requireStaff } from '@/lib/auth/server';

export async function GET() {
  try {
    try {
      await requireStaff();
    } catch (err: unknown) {
      const status = (err as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงสถิติ' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const kpis = await getDashboardKPIs(event.id);

    return NextResponse.json({ success: true, kpis });
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
