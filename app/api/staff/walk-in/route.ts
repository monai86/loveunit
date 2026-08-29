import { NextResponse } from 'next/server';
import { walkInRegistrationSchema } from '@/lib/validation/schemas';
import { getEventBySlug, getTimeSlots } from '@/services/event-service';
import { registerDonorAtomic } from '@/services/registration-service';
import { checkInDonor } from '@/services/checkin-service';
import { requireStaff } from '@/lib/auth/server';
import { getErrorMessage } from '@/lib/utils/format';
import { ParticipantType, DonationExperience } from '@/lib/types/database';

export async function POST(request: Request) {
  try {
    let currentUser;
    try {
      currentUser = await requireStaff();
    } catch (err: unknown) {
      const status = getErrorMessage(err) === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ลงทะเบียน Walk-in' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const body = await request.json();
    const parseResult = walkInRegistrationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        message: 'ข้อมูลลงทะเบียนไม่ถูกต้อง',
        errors: parseResult.error.flatten(),
      }, { status: 400 });
    }

    const input = parseResult.data;

    const activeSlots = await getTimeSlots(event.id);
    const targetSlotId = activeSlots[0]?.id || '';

    const regResult = await registerDonorAtomic({
      eventId: event.id,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      participantType: input.participantType as ParticipantType,
      faculty: input.faculty || undefined,
      academicYear: input.academicYear || undefined,
      donationExperience: input.donationExperience as DonationExperience,
      slotId: targetSlotId,
      source: 'WALK_IN',
    });

    if (!regResult.success || !regResult.registration) {
      return NextResponse.json({
        success: false,
        errorCode: regResult.errorCode,
        message: regResult.message || 'ไม่สามารถลงทะเบียน Walk-in ได้',
      }, { status: 400 });
    }

    const checkinRes = await checkInDonor(regResult.registration.id, currentUser.profile.user_id);

    return NextResponse.json({
      success: true,
      message: 'ลงทะเบียน Walk-in และเช็คอินสำเร็จแล้ว',
      registration: checkinRes.registration || regResult.registration,
    });

  } catch (error) {
    console.error('Error handling walk-in registration:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
