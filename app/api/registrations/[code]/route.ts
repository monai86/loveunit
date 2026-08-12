import { NextResponse } from 'next/server';
import { getRegistrationByCode } from '@/lib/db/store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const registration = await getRegistrationByCode(code);

    if (!registration) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลการลงทะเบียน' }, { status: 404 });
    }

    const safeRegistration = {
      id: registration.id,
      registration_code: registration.registration_code,
      qr_token: registration.qr_token,
      first_name: registration.first_name,
      last_name_initial: registration.last_name ? registration.last_name.slice(0, 1) + '.' : '',
      participant_type: registration.participant_type,
      faculty: registration.faculty,
      donation_experience: registration.donation_experience,
      status: registration.status,
      time_slot: registration.time_slot,
      event: registration.event,
      registered_at: registration.registered_at,
    };

    return NextResponse.json({ success: true, registration: safeRegistration });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
