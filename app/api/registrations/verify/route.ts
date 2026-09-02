import { NextResponse } from 'next/server';
import { z } from 'zod';
import { consumeVerificationToken } from '@/services/registration-service';
import { formatTimeRange, pickField } from '@/lib/utils/format';
import { checkRateLimitAsync, rateLimitedResponse } from '@/lib/rate-limit';

const verifySchema = z.object({
  token: z.string().min(10, 'รหัสยืนยันตัวตนไม่ถูกต้อง').max(255),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = verifySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: 'โทเค็นยืนยันตัวตนไม่ถูกต้อง',
      }, { status: 400 });
    }

    const { token } = parseResult.data;

    // Distributed rate limiting (PostgreSQL-backed shared state, max 15 attempts per 15 min)
    const isAllowed = await checkRateLimitAsync(request, {
      limit: 15,
      windowMs: 15 * 60 * 1000,
      targetIdentifier: token.slice(0, 32),
      scope: '/api/registrations/verify',
    });

    if (!isAllowed) {
      return rateLimitedResponse(60);
    }

    const registration = await consumeVerificationToken(token);

    if (!registration) {
      return NextResponse.json({
        success: false,
        message: 'ลิงก์ยืนยันตัวตนไม่ถูกต้อง หมดอายุ (15 นาที) หรือถูกใช้งานไปแล้ว',
      }, { status: 401 });
    }

    const regObj = registration;
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

    // Exchange verification token for a secure, HttpOnly participant session cookie
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
    console.error('Error in magic token verification:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการยืนยันตัวตน' }, { status: 500 });
  }
}
