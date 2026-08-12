import { NextResponse } from 'next/server';
import { getEventBySlug, getDashboardKPIs, getForecastByTimeSlot, getRegistrationsByParticipantType } from '@/lib/db/store';
import { requireTeamLead } from '@/lib/auth/server';

export async function GET() {
  try {
    // Enforce Team Lead / Admin Authorization Guard
    try {
      await requireTeamLead();
    } catch (err: any) {
      const status = err.message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง Dashboard' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const kpis = await getDashboardKPIs(event.id);
    const forecast = await getForecastByTimeSlot(event.id);
    const demographics = await getRegistrationsByParticipantType(event.id);

    return NextResponse.json({
      success: true,
      event,
      kpis,
      forecast,
      demographics,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard KPIs:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
