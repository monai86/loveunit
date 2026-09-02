import { NextResponse } from 'next/server';
import { getRegistrationByCode } from '@/services/registration-service';
import { pickField } from '@/lib/utils/format';
import { checkRateLimit, rateLimitedResponse } from '@/lib/rate-limit';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    if (!checkRateLimit(request, { limit: 60, windowMs: 60 * 1000 })) {
      return rateLimitedResponse(60);
    }

    const { code } = await params;
    const url = new URL(request.url);
    const tokenParam = url.searchParams.get('token');
    const authHeader = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const token = (tokenParam || authHeader || '').trim();

    const registration = await getRegistrationByCode(code);

    if (!registration) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลการลงทะเบียน' }, { status: 404 });
    }

    const regObj = registration;
    const expectedToken = (pickField<string>(regObj, 'accessToken', 'access_token') || '').trim();

    // Enforce private token verification: registration code alone is NOT an authorization secret
    if (!token || token !== expectedToken) {
      return NextResponse.json({
        success: false,
        message: 'สิทธิ์การเข้าถึงไม่ถูกต้อง ต้องระบุ Access Token เพื่อเปิดดูข้อมูลตั๋ว',
      }, { status: 401 });
    }

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
