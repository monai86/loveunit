import { NextResponse } from 'next/server';
import { publicRegistrationSchema } from '@/lib/validation/schemas';
import { getEventBySlug } from '@/services/event-service';
import { registerDonorAtomic } from '@/services/registration-service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรมบริจาคโลหิต' }, { status: 404 });
    }

    const now = new Date();
    const openAt = new Date((event as any).registrationOpenAt || (event as any).registration_open_at);
    const closeAt = new Date((event as any).registrationCloseAt || (event as any).registration_close_at);
    const isStatusOpen = ['REGISTRATION_OPEN', 'PUBLISHED'].includes(event.status);
    const isWithinWindow = now >= openAt && now <= closeAt;

    if (!isStatusOpen || !isWithinWindow) {
      return NextResponse.json({
        success: false,
        message: 'ระบบไม่ได้เปิดให้ลงทะเบียนล่วงหน้าในขณะนี้ หรือเลยช่วงเวลาลงทะเบียนแล้ว',
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

    const result = await registerDonorAtomic({
      eventId: event.id,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email || undefined,
      participantType: input.participantType as any,
      faculty: input.faculty || undefined,
      academicYear: input.academicYear || undefined,
      donationExperience: input.donationExperience as any,
      slotId: input.slotId,
      source: 'ONLINE',
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        errorCode: result.errorCode,
        message: result.message,
        registrationCode: (result.registration as any)?.registrationCode || (result.registration as any)?.registration_code,
      }, { status: 400 });
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
