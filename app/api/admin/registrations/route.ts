import { NextResponse } from 'next/server';
import { getEventBySlug, getAllRegistrations } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth/server';

export async function GET() {
  try {
    // Enforce Admin Server Authorization Guard
    try {
      await requireAdmin();
    } catch (err: any) {
      const status = err.message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงรายการลงทะเบียนทั้งหมด' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const registrations = await getAllRegistrations(event.id);

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
