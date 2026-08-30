import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRegistrationByCode, getRegistrationByQRToken } from '@/services/registration-service';
import { cancelRegistration } from '@/services/checkin-service';
import { normalizePhoneNumber } from '@/lib/utils/format';

const cancelSchema = z.object({
  registrationCode: z.string().min(1, 'กรุณาระบุรหัสลงทะเบียน').max(50).optional(),
  qrToken: z.string().min(1).max(255).optional(),
  phone: z.string().min(9, 'กรุณาระบุเบอร์โทรศัพท์ที่ใช้ลงทะเบียน').max(15),
  reason: z.string().max(255).optional(),
}).refine(data => data.registrationCode || data.qrToken, {
  message: 'กรุณาระบุรหัสลงทะเบียน หรือ QR Token',
  path: ['registrationCode'],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = cancelSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues?.[0];
      return NextResponse.json({
        success: false,
        message: issue?.message || 'ข้อมูลไม่ถูกต้อง',
      }, { status: 400 });
    }

    const { registrationCode, qrToken, phone, reason } = parseResult.data;
    const phoneNormalized = normalizePhoneNumber(phone);

    let reg = null;
    if (registrationCode) {
      reg = await getRegistrationByCode(registrationCode);
    } else if (qrToken) {
      reg = await getRegistrationByQRToken(qrToken);
    }

    if (!reg) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบข้อมูลการลงทะเบียนที่ต้องการยกเลิก',
      }, { status: 404 });
    }

    const regPhone = (reg as { phoneNormalized?: string; phone_normalized?: string; phone?: string }).phoneNormalized ||
      (reg as { phone_normalized?: string }).phone_normalized ||
      (reg as { phone?: string }).phone || '';
    const regPhoneNorm = normalizePhoneNumber(regPhone);

    if (!regPhoneNorm || regPhoneNorm !== phoneNormalized) {
      return NextResponse.json({
        success: false,
        message: 'เบอร์โทรศัพท์ไม่ตรงกับข้อมูลที่ลงทะเบียนไว้ ไม่สามารถยกเลิกได้',
      }, { status: 403 });
    }

    const status = (reg as { status: string }).status;
    if (status === 'CANCELLED') {
      return NextResponse.json({
        success: false,
        message: 'รายการนี้ได้รับการยกเลิกไปแล้ว',
      }, { status: 400 });
    }

    if (status !== 'REGISTERED') {
      return NextResponse.json({
        success: false,
        message: `ไม่สามารถยกเลิกรายการที่มีสถานะ "${status}" ได้ (ยกเลิกได้เฉพาะรายการที่ยังไม่ได้เช็กอินเท่านั้น)`,
      }, { status: 400 });
    }

    const regId = (reg as { id: string }).id;
    const cancelReason = reason?.trim() || 'ผู้บริจาคขอยกเลิกด้วยตนเองผ่านหน้าเว็บ';
    const result = await cancelRegistration(regId, 'DONOR_SELF', cancelReason);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message || 'ไม่สามารถยกเลิกได้',
      }, { status: 400 });
    }

    const finalCode = (reg as { registrationCode?: string; registration_code?: string }).registrationCode ||
      (reg as { registration_code?: string }).registration_code ||
      registrationCode;

    return NextResponse.json({
      success: true,
      message: 'ยกเลิกการลงทะเบียนเรียบร้อยแล้ว',
      registrationCode: finalCode,
    });
  } catch (error) {
    console.error('Error in donor self-cancellation:', error);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการยกเลิก กรุณาลองใหม่อีกครั้ง',
    }, { status: 500 });
  }
}
