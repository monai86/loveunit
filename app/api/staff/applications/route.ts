import { NextRequest, NextResponse } from 'next/server';
import { staffApplicationSubmissionSchema } from '@/lib/validation/staff-applications';
import { submitStaffApplication } from '@/services/staff-application-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const parsed = staffApplicationSubmissionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: parsed.error.issues[0]?.message ?? 'ข้อมูลการสมัครไม่ถูกต้อง',
      }, { status: 400 });
    }

    const result = await submitStaffApplication(parsed.data);
    if (!result.success) {
      const message = result.code === 'PENDING_APPLICATION_EXISTS'
        ? 'อีเมลนี้มีคำขอที่รอการอนุมัติอยู่แล้ว'
        : 'อีเมลนี้มีบัญชีเจ้าหน้าที่อยู่แล้ว กรุณาเข้าสู่ระบบหรือติดต่อผู้ดูแลระบบ';
      return NextResponse.json({ success: false, code: result.code, message }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: 'ส่งคำขอสมัคร Staff เรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ',
      application: result.application,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }
    console.error('Unable to submit staff application:', error);
    return NextResponse.json({ success: false, message: 'ไม่สามารถส่งคำขอสมัครได้ในขณะนี้' }, { status: 500 });
  }
}
