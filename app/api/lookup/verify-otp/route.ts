import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getEventBySlug } from '@/services/event-service';
import { verifyPhoneOtpRecovery } from '@/services/registration-service';
import { normalizePhoneNumber } from '@/services/sms-service';
import { checkRateLimitAsync, rateLimitedResponse } from '@/lib/rate-limit';
import { formatTimeRange, pickField } from '@/lib/utils/format';

const verifyOtpSchema = z.object({
  phone: z.string().min(8, 'กรุณากรอกหมายเลขโทรศัพท์').max(30),
  otp: z.string().length(6, 'รหัส OTP ต้องมี 6 หลัก').regex(/^\d{6}$/, 'รหัส OTP ต้องเป็นตัวเลข 6 หลัก'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = verifyOtpSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกรหัสยืนยันตัวเลข 6 หลักให้ถูกต้อง',
        },
        { status: 400 }
      );
    }

    const { phone, otp } = parseResult.data;
    const normalizedPhone = normalizePhoneNumber(phone);

    // Distributed rate limiting (max 10 verify attempts per 15 min per phone/IP)
    const isAllowed = await checkRateLimitAsync(request, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
      targetIdentifier: normalizedPhone,
      scope: '/api/lookup/verify-otp',
    });

    if (!isAllowed) {
      return rateLimitedResponse(60);
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลกิจกรรม' }, { status: 404 });
    }

    const result = await verifyPhoneOtpRecovery(normalizedPhone, otp, event.id);

    if (!result.success || !result.registration) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'รหัสยืนยัน OTP ไม่ถูกต้องหรือหมดอายุ',
        },
        { status: 401 }
      );
    }

    const regObj = result.registration;
    const slot = pickField<{ startAt?: string; endAt?: string; start_at?: string; end_at?: string }>(regObj, 'timeSlot', 'time_slot');
    const lastName = pickField<string>(regObj, 'lastName', 'last_name') || '';
    const regCode = pickField<string>(regObj, 'registrationCode', 'registration_code') || '';
    const accessToken = pickField<string>(regObj, 'accessToken', 'access_token') || '';

    const safeRegistration = {
      id: regObj.id,
      registration_code: regCode,
      qr_token: pickField<string>(regObj, 'qrToken', 'qr_token'),
      access_token: accessToken,
      first_name: pickField<string>(regObj, 'firstName', 'first_name'),
      last_name: lastName,
      last_name_initial: lastName ? lastName.slice(0, 1) + '.' : '',
      participant_type: pickField<string>(regObj, 'participantType', 'participant_type'),
      faculty: pickField<string>(regObj, 'faculty', 'faculty'),
      donation_experience: pickField<string>(regObj, 'donationExperience', 'donation_experience'),
      status: regObj.status,
      time_slot: slot
        ? {
            start_at: slot.startAt || slot.start_at,
            end_at: slot.endAt || slot.end_at,
            time_label: formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || ''),
          }
        : null,
      event: pickField(regObj, 'event', 'event'),
      registered_at: pickField<string>(regObj, 'registeredAt', 'registered_at'),
    };

    const response = NextResponse.json({
      success: true,
      registration: safeRegistration,
      accessToken: safeRegistration.access_token,
      registrationCode: safeRegistration.registration_code,
      redirectUrl: `/registration/${encodeURIComponent(regCode)}`,
    });

    // Issue secure HttpOnly participant session cookie
    if (regCode && accessToken) {
      response.cookies.set(`lvu_pass_${regCode}`, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 3600, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสยืนยัน' },
      { status: 500 }
    );
  }
}
