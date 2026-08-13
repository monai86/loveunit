import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getEventBySlug } from '@/services/event-service';
import { joinWaitlist } from '@/services/waitlist-service';
import { checkRateLimit, rateLimitedResponse } from '@/lib/rate-limit';

const waitlistSchema = z.object({
  slotId: z.string().min(1, 'กรุณาเลือกช่วงเวลา'),
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง').max(100),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล').max(100),
  phone: z.string().min(9, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง').max(15),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Anti-abuse: waitlist joins are public POSTs too.
    if (!checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 })) {
      return rateLimitedResponse(60);
    }

    const { slug } = await params;
    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const body = await request.json();
    const parseResult = waitlistSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const result = await joinWaitlist({
      eventId: event.id,
      slotId: parseResult.data.slotId,
      firstName: parseResult.data.firstName,
      lastName: parseResult.data.lastName,
      phone: parseResult.data.phone,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'ลงชื่อในรายการรอเรียบร้อยแล้ว ระบบจะแจ้งเตือนเมื่อมีที่ว่าง',
    });
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
