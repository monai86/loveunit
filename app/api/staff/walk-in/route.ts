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

    // Walk-in registration is closed for today per organizer announcement
    return NextResponse.json({
      success: false,
      message: 'ขณะนี้ปิดรับลงทะเบียน Walk-in สำหรับวันนี้แล้ว เนื่องจากคิวเต็มความจุ ทางโครงการขอขอบพระคุณทุกท่านที่ให้ความสนใจเป็นอย่างยิ่ง',
    }, { status: 400 });

  } catch (error) {
    console.error('Error handling walk-in registration:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
