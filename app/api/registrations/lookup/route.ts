import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getEventBySlug } from '@/services/event-service';
import { findRegistrationByPhoneAndName, findRegistrationsByPhone } from '@/services/registration-service';
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
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
});

function sanitizeRegistration(reg: RegistrationView) {
  const slot = reg.timeSlot || reg.time_slot;
  const lastName = (reg.lastName || reg.last_name || '').trim();
  return {
    registration_code: reg.registrationCode || reg.registration_code || '',
    qr_token: reg.qrToken || reg.qr_token || '',
    first_name: reg.firstName || reg.first_name || '',
    last_name: lastName,
    last_name_initial: lastName ? lastName.slice(0, 1) + '.' : '',
    participant_type: reg.participantType || reg.participant_type || '',
    faculty: (reg as { faculty?: string }).faculty || null,
    status: reg.status || 'REGISTERED',
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
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = lookupSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง' }, { status: 400 });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const input = parseResult.data;
    
    // If first & last name are provided, try exact lookup first
    if (input.firstName?.trim() && input.lastName?.trim()) {
      const exactMatch = await findRegistrationByPhoneAndName({
        eventId: event.id,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
      });
      if (exactMatch) {
        return NextResponse.json({
          success: true,
          count: 1,
          registration: sanitizeRegistration(exactMatch as RegistrationView),
          matches: [sanitizeRegistration(exactMatch as RegistrationView)],
        });
      }
    }

    // Phone-only search
    const results = await findRegistrationsByPhone({
      eventId: event.id,
      phone: input.phone,
    });

    if (!results || results.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบข้อมูลการลงทะเบียนที่ตรงกับเบอร์โทรศัพท์นี้ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง',
      }, { status: 404 });
    }

    const sanitizedMatches = (results as RegistrationView[]).map((r) => sanitizeRegistration(r));

    if (sanitizedMatches.length === 1) {
      return NextResponse.json({
        success: true,
        count: 1,
        registration: sanitizedMatches[0],
        matches: sanitizedMatches,
      });
    }

    // Multiple registrations found with the same phone
    return NextResponse.json({
      success: true,
      count: sanitizedMatches.length,
      registration: null,
      matches: sanitizedMatches,
      message: `พบผู้ลงทะเบียนด้วยเบอร์นี้ ${sanitizedMatches.length} ท่าน`,
    });
  } catch (error) {
    console.error('Error in registration lookup:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
