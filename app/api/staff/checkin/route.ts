import { NextResponse } from 'next/server';
import { updateRegistrationStatus } from '@/services/checkin-service';
import { getRegistrationByQRToken, getRegistrationByCode } from '@/services/registration-service';
import { requireStaff } from '@/lib/auth/server';
import { RegistrationStatus } from '@/lib/types/database';

export async function POST(request: Request) {
  try {
    let currentUser;
    try {
      currentUser = await requireStaff();
    } catch (err: unknown) {
      const status = (err as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงระบบเช็คอินเจ้าหน้าที่' }, { status });
    }

    const body = await request.json();
    const { registrationId, qrToken, registrationCode, status } = body;

    // Target status to transition to. Defaults to CHECKED_IN when not specified.
    const VALID_TARGETS: RegistrationStatus[] = ['CHECKED_IN', 'IN_PROCESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    let targetStatus: RegistrationStatus = 'CHECKED_IN';
    if (status) {
      if (!VALID_TARGETS.includes(status)) {
        return NextResponse.json({ success: false, message: 'สถานะปลายทางไม่ถูกต้อง' }, { status: 400 });
      }
      targetStatus = status;
    }

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

    const result = (await updateRegistrationStatus(targetId, targetStatus, currentUser.profile.user_id)) as {
      success: boolean;
      registration?: unknown;
      message?: string;
    };

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message || 'ไม่สามารถดำเนินการได้' }, { status: 400 });
    }

    const actionMessages: Record<RegistrationStatus, string> = {
      REGISTERED: 'ลงทะเบียนแล้ว',
      CHECKED_IN: 'เช็คอินผู้บริจาคเรียบร้อยแล้ว',
      IN_PROCESS: 'เริ่มขั้นตอนบริจาคโลหิตเรียบร้อยแล้ว',
      COMPLETED: 'บันทึกการบริจาคเสร็จสมบูรณ์แล้ว',
      CANCELLED: 'ยกเลิกรายการเรียบร้อยแล้ว',
      NO_SHOW: 'บันทึกสถานะไม่เข้าร่วมแล้ว',
    };

    return NextResponse.json({
      success: true,
      message: actionMessages[targetStatus] || 'ดำเนินการเรียบร้อยแล้ว',
      registration: result.registration,
    });

  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
