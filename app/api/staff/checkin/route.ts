import { NextResponse } from 'next/server';
import { checkInDonor } from '@/services/checkin-service';
import { getRegistrationByQRToken, getRegistrationByCode } from '@/services/registration-service';
import { requireStaff } from '@/lib/auth/server';

export async function POST(request: Request) {
  try {
    let currentUser;
    try {
      currentUser = await requireStaff();
    } catch (err: any) {
      const status = err.message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงระบบเช็คอินเจ้าหน้าที่' }, { status });
    }

    const body = await request.json();
    const { registrationId, qrToken, registrationCode } = body;

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

    const result = await checkInDonor(targetId, currentUser.profile.user_id);

    if (!result.success) {
      return NextResponse.json({ success: false, message: (result as any).message || 'ไม่สามารถเช็คอินได้' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'เช็คอินผู้บริจาคเรียบร้อยแล้ว',
      registration: result.registration,
    });

  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
