import { NextResponse } from 'next/server';
import { cancelRegistration } from '@/services/checkin-service';
import { getRegistrationByQRToken, getRegistrationByCode } from '@/services/registration-service';
import { requireStaff } from '@/lib/auth/server';
import { getErrorMessage } from '@/lib/utils/format';

// Staff-only cancel endpoint. Unlike a raw status flip, this releases the
// donor's time-slot seat (booked_count − 1) and promotes the next WAITING
// donor for that slot (FIFO) into the freed seat. See
// services/checkin-service.cancelRegistration.
export async function POST(request: Request) {
  try {
    let currentUser;
    try {
      currentUser = await requireStaff();
    } catch (err: unknown) {
      const status = getErrorMessage(err) === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ยกเลิกการลงทะเบียน' }, { status });
    }

    const body = await request.json();
    const { registrationId, qrToken, registrationCode, reason } = body;

    let targetId = registrationId;

    if (!targetId && qrToken) {
      const reg = await getRegistrationByQRToken(qrToken);
      if (!reg) {
        return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลการลงทะเบียนจาก QR Code นี้' }, { status: 404 });
      }
      targetId = reg.id;
    } else if (!targetId && registrationCode) {
      const reg = await getRegistrationByCode(registrationCode);
      if (!reg) {
        return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลการลงทะเบียนจากรหัสนี้' }, { status: 404 });
      }
      targetId = reg.id;
    }

    if (!targetId) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ Registration ID, QR Token หรือ Registration Code' }, { status: 400 });
    }

    const cancelReason = typeof reason === 'string' && reason.trim() ? reason.trim() : undefined;

    const result = (await cancelRegistration(targetId, currentUser.profile.user_id, cancelReason)) as {
      success: boolean;
      registration?: unknown;
      message?: string;
      promoted?: { registration: unknown; entry: unknown } | null;
    };

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message || 'ไม่สามารถยกเลิกได้' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'ยกเลิกรายการเรียบร้อยแล้ว',
      registration: result.registration,
      promoted: result.promoted ?? null,
    });

  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
