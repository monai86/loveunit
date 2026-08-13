import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getEventBySlug } from '@/services/event-service';
import { findRegistrationByPhoneAndName } from '@/services/registration-service';
import { formatTimeRange } from '@/lib/utils/format';

// Registration may arrive from either the Drizzle backend (camelCase) or the
// legacy in-memory backend (snake_case); this view type covers both shapes.
interface RegistrationView {
  registrationCode?: string;
  registration_code?: string;
  qrToken?: string;
  qr_token?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  participantType?: string;
  participant_type?: string;
  status?: string;
  timeSlot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string; id?: string } | null;
  time_slot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string; id?: string } | null;
  event?: { name?: string; short_name?: string; startAt?: string; start_at?: string; venueName?: string; venue_name?: string } | null;
}

const lookupSchema = z.object({
  phone: z.string().min(9, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง').max(15),
  firstName: z.string().min(1, 'กรุณากรอกชื่อจริง').max(100),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล').max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = lookupSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const input = parseResult.data;
    const registration = await findRegistrationByPhoneAndName({
      eventId: event.id,
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    if (!registration) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบข้อมูลการลงทะเบียน กรุณาตรวจสอบเบอร์โทรและชื่อ-นามสกุลให้ตรงกับที่ลงทะเบียนไว้',
      }, { status: 404 });
    }

    const reg = registration as RegistrationView;
    const slot = reg.timeSlot || reg.time_slot;

    // Public response is sanitized: no phone number, no email, only last-name initial.
    const safe = {
      registration_code: reg.registrationCode || reg.registration_code,
      qr_token: reg.qrToken || reg.qr_token,
      first_name: reg.firstName || reg.first_name,
      last_name_initial: ((reg.lastName || reg.last_name) || '').slice(0, 1) + '.',
      participant_type: reg.participantType || reg.participant_type,
      status: reg.status,
      time_slot: slot
        ? {
            id: slot.id,
            start_at: slot.startAt || slot.start_at,
            end_at: slot.endAt || slot.end_at,
            time_label: formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || ''),
          }
        : null,
      event: {
        name: reg.event?.name || reg.event?.short_name,
        start_at: reg.event?.startAt || reg.event?.start_at,
        venue_name: reg.event?.venueName || reg.event?.venue_name,
      },
    };

    return NextResponse.json({ success: true, registration: safe });
  } catch (error) {
    console.error('Error in registration lookup:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
