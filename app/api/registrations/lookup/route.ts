import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getEventBySlug } from '@/services/event-service';
import { findRegistrationByEmail, createVerificationToken } from '@/services/registration-service';
import { sendMagicLinkEmail } from '@/services/email-service';
import { checkRateLimitAsync, rateLimitedResponse } from '@/lib/rate-limit';

const lookupSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง').max(150),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = lookupSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: 'กรุณากรอกอีเมลที่ใช้ลงทะเบียนให้ถูกต้อง',
      }, { status: 400 });
    }

    const { email } = parseResult.data;

    // Distributed rate limiting (PostgreSQL-backed shared state across instances, max 10/15min)
    const isAllowed = await checkRateLimitAsync(request, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
      targetIdentifier: email,
      scope: '/api/registrations/lookup',
    });

    if (!isAllowed) {
      return rateLimitedResponse(60);
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const reg = await findRegistrationByEmail({ eventId: event.id, email });

    let testToken: string | undefined = undefined;

    if (reg) {
      const regId = (reg as { id: string }).id;
      const regEmail = (reg as { email?: string }).email || email;
      const regFirstName = (reg as { firstName?: string; first_name?: string }).firstName ||
        (reg as { first_name?: string }).first_name || '';
      const regCode = (reg as { registrationCode?: string; registration_code?: string }).registrationCode ||
        (reg as { registration_code?: string }).registration_code || '';

      const verificationToken = await createVerificationToken(regId, regEmail);
      testToken = verificationToken;

      // Dispatch magic link email asynchronously
      sendMagicLinkEmail({
        to: regEmail,
        token: verificationToken,
        firstName: regFirstName,
        registrationCode: regCode,
      }).catch((err) => {
        console.error('[email] Error sending magic link email:', err);
      });
    }

    // Enumeration Resistance: Always return an identical generic response
    // regardless of whether the email was found in the database or not.
    const genericResponse: Record<string, unknown> = {
      success: true,
      message: 'หากอีเมลนี้ตรงกับข้อมูลในระบบ เราได้ส่งลิงก์ยืนยันตัวตนสำหรับเปิดดูตั๋วไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องข้อความ (และโฟลเดอร์ Junk/Spam)',
    };

    // In automated testing environments, return testToken for programmatic validation
    if (process.env.NODE_ENV === 'test' || process.env.DATA_BACKEND === 'memory') {
      genericResponse.testToken = testToken;
    }

    return NextResponse.json(genericResponse, { status: 200 });
  } catch (error) {
    console.error('Error in registration lookup:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
