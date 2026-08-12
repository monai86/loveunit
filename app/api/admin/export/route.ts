import { NextResponse } from 'next/server';
import { getEventBySlug, getAllRegistrations, recordAuditLog } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth/server';

export async function GET() {
  try {
    // Enforce Admin Server Authorization Guard
    let currentUser;
    try {
      currentUser = await requireAdmin();
    } catch (err: any) {
      const status = err.message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ส่งออกข้อมูลผู้ลงทะเบียน' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const registrations = await getAllRegistrations(event.id);

    // Audit Log the sensitive export action
    await recordAuditLog({
      actorId: currentUser.profile.user_id,
      action: 'EXPORT_REGISTRATIONS_DATA',
      entityType: 'registrations',
      entityId: event.id,
      metadata: { record_count: registrations.length, format: 'CSV' },
    });

    const headers = [
      'Registration Code',
      'First Name',
      'Last Name',
      'Phone',
      'Email',
      'Participant Type',
      'Faculty',
      'Academic Year',
      'Donation Experience',
      'Arrival Slot Start',
      'Arrival Slot End',
      'Status',
      'Source',
      'Registered At',
      'Checked In At'
    ].join(',');

    const rows = registrations.map(r => [
      `"${r.registration_code}"`,
      `"${r.first_name}"`,
      `"${r.last_name}"`,
      `"${r.phone}"`,
      `"${r.email || ''}"`,
      `"${r.participant_type}"`,
      `"${r.faculty || ''}"`,
      `"${r.academic_year || ''}"`,
      `"${r.donation_experience}"`,
      `"${r.time_slot?.start_at || ''}"`,
      `"${r.time_slot?.end_at || ''}"`,
      `"${r.status}"`,
      `"${r.source}"`,
      `"${r.registered_at}"`,
      `"${r.checked_in_at || ''}"`
    ].join(','));

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="MUMT_Blood_Donation_Registrations_${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });

  } catch (error) {
    console.error('Error exporting registrations:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
