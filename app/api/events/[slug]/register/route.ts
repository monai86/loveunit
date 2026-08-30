import { NextResponse } from 'next/server';
import { publicRegistrationSchema } from '@/lib/validation/schemas';
import { getEventBySlug, getTimeSlots } from '@/services/event-service';
import { registerDonorAtomic } from '@/services/registration-service';
import { sendRegistrationConfirmation } from '@/services/email-service';
import { pickField, isEventDay } from '@/lib/utils/format';
import { ParticipantType, DonationExperience } from '@/lib/types/database';
import { checkRateLimit, rateLimitedResponse } from '@/lib/rate-limit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Anti-abuse: public registration rate limiter adjusted for high-density campus Wi-Fi NAT (200+ concurrent donors)
    if (!checkRateLimit(request, { limit: 500, windowMs: 60 * 1000 })) {
      return rateLimitedResponse(60);
    }

    const { slug } = await params;
    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรมบริจาคโลหิต' }, { status: 404 });
    }

    const now = new Date();
    const openAt = new Date(pickField<string>(event, 'registrationOpenAt', 'registration_open_at') || '');
    const closeAt = new Date(pickField<string>(event, 'registrationCloseAt', 'registration_close_at') || '');
    const isStatusOpen = ['REGISTRATION_OPEN', 'PUBLISHED'].includes(event.status);
    const isEventDayNow = isEventDay();
    const isWithinWindow = (now >= openAt && now <= closeAt) || isEventDayNow;

    if (!isStatusOpen || !isWithinWindow) {
      return NextResponse.json({
        success: false,
        message: 'ระบบไม่ได้เปิดให้ลงทะเบียนในขณะนี้ หรือเลยช่วงเวลาจัดกิจกรรมแล้ว',
      }, { status: 400 });
    }

    const body = await request.json();
    const parseResult = publicRegistrationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: 'ข้อมูลการลงทะเบียนไม่ถูกต้อง',
        errors: parseResult.error.flatten(),
      }, { status: 400 });
    }

    const input = parseResult.data;
    const isWalkIn = input.source === 'WALK_IN' || (isEventDayNow && !input.slotId);
    const source = isWalkIn ? 'WALK_IN' : (input.source || 'ONLINE');

    let targetSlotId = input.slotId;
    if (!targetSlotId) {
      const activeSlots = await getTimeSlots(event.id);
      targetSlotId = activeSlots[0]?.id || '';
    }

    const result = await registerDonorAtomic({
      eventId: event.id,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: (input.email || '').trim() || undefined,
      participantType: input.participantType as ParticipantType,
      faculty: input.faculty || undefined,
      academicYear: input.academicYear || undefined,
      donationExperience: input.donationExperience as DonationExperience,
      slotId: targetSlotId,
      source: source as 'ONLINE' | 'WALK_IN',
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        errorCode: result.errorCode,
        message: result.message,
        registrationCode: pickField<string>(result.registration, 'registrationCode', 'registration_code'),
      }, { status: 400 });
    }

    const reg = result.registration;
    const regEmail = (pickField<string>(reg, 'email', 'email') || '').trim();
    if (regEmail) {
      const regSlot = pickField<{ startAt?: string; endAt?: string; start_at?: string; end_at?: string }>(reg, 'timeSlot', 'time_slot');
      const emailPayload = {
        to: regEmail,
        firstName: pickField<string>(reg, 'firstName', 'first_name') || '',
        lastName: pickField<string>(reg, 'lastName', 'last_name') || '',
        phone: pickField<string>(reg, 'phone', 'phone') || '',
        faculty: pickField<string>(reg, 'faculty', 'faculty') || null,
        registrationCode: pickField<string>(reg, 'registrationCode', 'registration_code') || '',
        qrToken: pickField<string>(reg, 'qrToken', 'qr_token') || '',
        slot: regSlot ? { startAt: regSlot.startAt, endAt: regSlot.endAt, start_at: regSlot.start_at, end_at: regSlot.end_at } : null,
        venueName: pickField<string>(event, 'venueName', 'venue_name'),
        eventDateLabel: 'พุธ 16 กันยายน 2569 (09:00 – 14:00 น.)',
      };

      // Non-blocking asynchronous dispatch so the HTTP response returns immediately (<50ms)
      // while SMTP delivers in the background without freezing the client.
      sendRegistrationConfirmation(emailPayload).then((delivery) => {
        if (delivery.status !== 'sent') {
          console.warn('[email] Registration confirmation was not delivered', {
            registrationCode: emailPayload.registrationCode,
            status: delivery.status,
            ...(delivery.status === 'skipped' ? { reason: delivery.reason } : { error: delivery.error }),
          });
        }
      }).catch((err) => {
        console.error('[email] Async email dispatch error:', err);
      });
    }

    return NextResponse.json({
      success: true,
      registration: result.registration,
    });

  } catch (error) {
    console.error('Error handling public registration:', error);
    return NextResponse.json({
      success: false,
      message: 'การลงทะเบียนยังไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
    }, { status: 500 });
  }
}
