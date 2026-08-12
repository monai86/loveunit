import { NextResponse } from 'next/server';
import { getRegistrationByCode } from '@/services/registration-service';

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

    const regObj = registration as any;

    const safeRegistration = {
      id: regObj.id,
      registration_code: regObj.registrationCode || regObj.registration_code,
      qr_token: regObj.qrToken || regObj.qr_token,
      first_name: regObj.firstName || regObj.first_name,
      last_name_initial: (regObj.lastName || regObj.last_name) ? (regObj.lastName || regObj.last_name).slice(0, 1) + '.' : '',
      participant_type: regObj.participantType || regObj.participant_type,
      faculty: regObj.faculty,
      donation_experience: regObj.donationExperience || regObj.donation_experience,
      status: regObj.status,
      time_slot: regObj.timeSlot || regObj.time_slot,
      event: regObj.event,
      registered_at: regObj.registeredAt || regObj.registered_at,
    };

    return NextResponse.json({ success: true, registration: safeRegistration });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
