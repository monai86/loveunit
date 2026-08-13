import { NextResponse } from 'next/server';
import { getRegistrationByCode } from '@/services/registration-service';
import { pickField } from '@/lib/utils/format';

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

    const regObj = registration;

    const lastName = pickField<string>(regObj, 'lastName', 'last_name') || '';
    const safeRegistration = {
      id: regObj.id,
      registration_code: pickField<string>(regObj, 'registrationCode', 'registration_code'),
      qr_token: pickField<string>(regObj, 'qrToken', 'qr_token'),
      first_name: pickField<string>(regObj, 'firstName', 'first_name'),
      last_name_initial: lastName ? lastName.slice(0, 1) + '.' : '',
      participant_type: pickField<string>(regObj, 'participantType', 'participant_type'),
      faculty: pickField<string>(regObj, 'faculty', 'faculty'),
      donation_experience: pickField<string>(regObj, 'donationExperience', 'donation_experience'),
      status: regObj.status,
      time_slot: pickField(regObj, 'timeSlot', 'time_slot'),
      event: pickField(regObj, 'event', 'event'),
      registered_at: pickField<string>(regObj, 'registeredAt', 'registered_at'),
    };

    return NextResponse.json({ success: true, registration: safeRegistration });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
