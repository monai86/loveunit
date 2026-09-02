import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getEventBySlug } from '@/services/event-service';
import { requestPhoneOtpRecovery } from '@/services/registration-service';
import { normalizePhoneNumber, isValidThaiPhoneNumber } from '@/services/sms-service';
import { checkRateLimitAsync, rateLimitedResponse } from '@/lib/rate-limit';

const requestOtpSchema = z.object({
  phone: z.string().min(8, 'กรุณากรอกหมายเลขโทรศัพท์').max(30),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = requestOtpSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกหมายเลขโทรศัพท์มือถือ 9-10 หลักให้ถูกต้อง',
        },
        { status: 400 }
      );
    }

    const { phone } = parseResult.data;
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!isValidThaiPhoneNumber(normalizedPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: 'รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง (กรุณากรอกเบอร์มือถือ 9-10 หลัก เช่น 0812345678)',
        },
        { status: 400 }
      );
    }

    // Distributed rate limiting (max 5 requests per 10 minutes per phone/IP)
    const isAllowed = await checkRateLimitAsync(request, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
      targetIdentifier: normalizedPhone,
      scope: '/api/lookup/request-otp',
    });

    if (!isAllowed) {
      return rateLimitedResponse(60);
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลกิจกรรม' }, { status: 404 });
    }

    const result = await requestPhoneOtpRecovery(normalizedPhone, event.id);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('Error in request-otp:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการส่งรหัสยืนยัน กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
