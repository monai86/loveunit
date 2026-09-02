import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getEventBySlug } from '@/services/event-service';
import { findRegistrationByEmail, findRegistrationsByPhone, createVerificationToken } from '@/services/registration-service';
import { sendMagicLinkEmail } from '@/services/email-service';
import { checkRateLimitAsync, rateLimitedResponse } from '@/lib/rate-limit';
import { normalizePhoneNumber } from '@/lib/utils/format';

const lookupSchema = z.object({
  phone: z.string().max(30).optional(),
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง').max(150).optional(),
}).refine(data => Boolean(data.phone?.trim() || data.email?.trim()), {
  message: 'กรุณากรอกหมายเลขโทรศัพท์หรืออีเมล',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = lookupSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: 'กรุณากรอกหมายเลขโทรศัพท์ที่ใช้ลงทะเบียนให้ถูกต้อง',
      }, { status: 400 });
    }

    const { phone, email } = parseResult.data;
    const targetIdentifier = phone?.trim() || email?.trim() || 'anon';

    // Distributed rate limiting (PostgreSQL-backed shared state across instances, max 15/10min)
    const isAllowed = await checkRateLimitAsync(request, {
      limit: 15,
      windowMs: 10 * 60 * 1000,
      targetIdentifier,
      scope: '/api/registrations/lookup',
    });

    if (!isAllowed) {
      return rateLimitedResponse(60);
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    // Direct Phone Lookup (Instant, Free, No SMS needed)
    if (phone?.trim()) {
      const phoneNormalized = normalizePhoneNumber(phone);
      if (!phoneNormalized || phoneNormalized.length < 9) {
        return NextResponse.json({
          success: false,
          message: 'กรุณากรอกหมายเลขโทรศัพท์มือถือ 9-10 หลักให้ถูกต้อง',
        }, { status: 400 });
      }

      const regs = await findRegistrationsByPhone({ eventId: event.id, phone: phoneNormalized });

      if (!regs || regs.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'ไม่พบข้อมูลการลงทะเบียนที่ตรงกับหมายเลขโทรศัพท์นี้ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง หรือลงทะเบียนใหม่',
        }, { status: 404 });
      }

      const activeReg = regs[0];
      const regCode = (activeReg as { registrationCode?: string; registration_code?: string }).registrationCode ||
        (activeReg as { registration_code?: string }).registration_code || '';
      const accessToken = (activeReg as { accessToken?: string; access_token?: string }).accessToken ||
        (activeReg as { access_token?: string }).access_token || '';

      const response = NextResponse.json({
        success: true,
        message: 'พบข้อมูลการลงทะเบียน',
        registration: activeReg,
        registrations: regs,
      }, { status: 200 });

      // Set secure HttpOnly session cookie for seamless private pass access
      const isProd = process.env.NODE_ENV === 'production';

      if (regCode && accessToken) {
        response.cookies.set(`lvu_pass_${regCode}`, accessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        response.cookies.set('lvu_pass_session', accessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
      }

      return response;
    }

    // Email Magic Link Fallback
    if (email?.trim()) {
      const reg = await findRegistrationByEmail({ eventId: event.id, email: email.trim() });

      let testToken: string | undefined = undefined;

      if (reg) {
        const regId = (reg as { id: string }).id;
        const regEmail = (reg as { email?: string }).email || email.trim();
        const regFirstName = (reg as { firstName?: string; first_name?: string }).firstName ||
          (reg as { first_name?: string }).first_name || '';
        const regCode = (reg as { registrationCode?: string; registration_code?: string }).registrationCode ||
          (reg as { registration_code?: string }).registration_code || '';

        const verificationToken = await createVerificationToken(regId, regEmail);
        testToken = verificationToken;

        // Dispatch magic link email
        try {
          await sendMagicLinkEmail({
            to: regEmail,
            token: verificationToken,
            firstName: regFirstName,
            registrationCode: regCode,
          });
        } catch (err) {
          console.error('[email] Error sending magic link email:', err);
        }
      }

      // Enumeration Resistance for Email
      const genericResponse: Record<string, unknown> = {
        success: true,
        message: 'หากอีเมลนี้ตรงกับข้อมูลในระบบ เราได้ส่งลิงก์ยืนยันตัวตนสำหรับเปิดดูตั๋วไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องข้อความ',
      };

      if (process.env.NODE_ENV === 'test' || process.env.DATA_BACKEND === 'memory') {
        genericResponse.testToken = testToken;
      }

      return NextResponse.json(genericResponse, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      message: 'กรุณากรอกหมายเลขโทรศัพท์หรืออีเมล',
    }, { status: 400 });
  } catch (error) {
    console.error('Error in registration lookup:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
