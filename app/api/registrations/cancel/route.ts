import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getRegistrationByCode, getRegistrationByAccessToken } from '@/services/registration-service';
import { cancelRegistration } from '@/services/checkin-service';
import { pickField } from '@/lib/utils/format';
import { checkRateLimitAsync, rateLimitedResponse } from '@/lib/rate-limit';

const cancelSchema = z.object({
  registrationCode: z.string().min(1, 'กรุณาระบุรหัสลงทะเบียน').max(50).optional(),
  token: z.string().min(1, 'กรุณาระบุ Access Token').max(255).optional(),
  accessToken: z.string().min(1).max(255).optional(),
  qrToken: z.string().optional(),
  reason: z.string().max(255).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = cancelSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues?.[0];
      return NextResponse.json({
        success: false,
        message: issue?.message || 'ข้อมูลการยกเลิกไม่ถูกต้อง',
      }, { status: 400 });
    }

    const { registrationCode, token, accessToken, qrToken, reason } = parseResult.data;

    // Reject attempt to cancel using qrToken
    if (qrToken && !token && !accessToken) {
      return NextResponse.json({
        success: false,
        message: 'QR Token เป็นสิทธิ์สำหรับสแกนเช็กอินหน้างานเท่านั้น ไม่สามารถใช้ยกเลิกการลงทะเบียนได้',
      }, { status: 401 });
    }

    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const cookieHeader = request.headers.get('cookie') || '';
    const matchRegCookie = registrationCode ? cookieHeader.match(new RegExp(`(?:^|;\\s*)lvu_pass_${registrationCode}=([^;]*)`)) : null;
    const matchSessionCookie = cookieHeader.match(/(?:^|;\s*)lvu_pass_session=([^;]*)/);
    const cookieToken = matchRegCookie ? decodeURIComponent(matchRegCookie[1]) : (matchSessionCookie ? decodeURIComponent(matchSessionCookie[1]) : '');

    const providedToken = (token || accessToken || bearerToken || cookieToken || '').trim();

    if (!providedToken) {
      return NextResponse.json({
        success: false,
        message: 'ข้อมูลการยกเลิกไม่ถูกต้อง ต้องระบุ Access Token หรือมี Session ที่ได้รับสิทธิ์',
      }, { status: 400 });
    }

    // Distributed rate limiting (PostgreSQL-backed shared state across instances)
    const isAllowed = await checkRateLimitAsync(request, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
      targetIdentifier: registrationCode || providedToken,
      scope: '/api/registrations/cancel',
    });

    if (!isAllowed) {
      return rateLimitedResponse(60);
    }

    let reg = null;
    if (registrationCode) {
      reg = await getRegistrationByCode(registrationCode);
    } else if (providedToken) {
      reg = await getRegistrationByAccessToken(providedToken);
    }

    if (!reg) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบข้อมูลการลงทะเบียนที่ต้องการยกเลิก',
      }, { status: 404 });
    }

    const expectedAccessToken = (pickField<string>(reg, 'accessToken', 'access_token') || '').trim();

    // Verify possession: sequential code alone or qrToken alone MUST NOT authorize cancellation
    const isAuthorized = Boolean(providedToken && providedToken === expectedAccessToken);

    if (!isAuthorized) {
      return NextResponse.json({
        success: false,
        message: 'สิทธิ์ไม่ถูกต้อง: การยกเลิกต้องใช้ Access Token ของผู้ลงทะเบียน หรือเข้าสู่ระบบผ่าน Magic Link',
      }, { status: 401 });
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
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการยกเลิก กรุณาลองใหม่อีกครั้ง',
    }, { status: 500 });
  }
}
