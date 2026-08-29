import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth/server';
import { getEventBySlug } from '@/services/event-service';
import { getAllRegistrations } from '@/services/admin-service';

/** Read-only operational list for staff. Mutations remain guarded by admin APIs. */
export async function GET() {
  try {
    try {
      await requireStaff();
    } catch (error: unknown) {
      const status = (error as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ดูรายชื่อผู้ลงทะเบียน' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });

    const registrations = await getAllRegistrations(event.id);
    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error('Error fetching staff registrations:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
