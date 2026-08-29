import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/server';
import {
  staffApplicationApprovalSchema,
  staffApplicationRejectionSchema,
} from '@/lib/validation/staff-applications';
import {
  approveStaffApplication,
  rejectStaffApplication,
} from '@/services/staff-application-service';

export const dynamic = 'force-dynamic';

function failureResponse(code: string) {
  if (code === 'APPLICATION_NOT_FOUND') {
    return NextResponse.json({ success: false, code, message: 'ไม่พบคำขอสมัคร Staff' }, { status: 404 });
  }
  if (code === 'APPLICATION_NOT_PENDING' || code === 'EMAIL_ALREADY_REGISTERED') {
    return NextResponse.json({
      success: false,
      code,
      message: code === 'EMAIL_ALREADY_REGISTERED'
        ? 'อีเมลนี้มีบัญชีอยู่แล้ว ไม่สามารถอนุมัติซ้ำได้'
        : 'คำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติ',
    }, { status: 409 });
  }
  return NextResponse.json({ success: false, code, message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await context.params;
    const body = await request.json();

    if (body?.action === 'APPROVE') {
      const parsed = staffApplicationApprovalSchema.safeParse({ initialPassword: body.initialPassword });
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message }, { status: 400 });
      }
      const result = await approveStaffApplication({
        applicationId: id,
        actorId: admin.id,
        initialPassword: parsed.data.initialPassword,
      });
      if (!result.success) return failureResponse(result.code);
      return NextResponse.json({
        success: true,
        message: 'อนุมัติคำขอและสร้างบัญชี Staff เรียบร้อยแล้ว',
        application: result.application,
        user: result.user,
      });
    }

    if (body?.action === 'REJECT') {
      const parsed = staffApplicationRejectionSchema.safeParse({ reason: body.reason });
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message }, { status: 400 });
      }
      const result = await rejectStaffApplication({
        applicationId: id,
        actorId: admin.id,
        reason: parsed.data.reason,
      });
      if (!result.success) return failureResponse(result.code);
      return NextResponse.json({
        success: true,
        message: 'ปฏิเสธคำขอสมัคร Staff เรียบร้อยแล้ว',
        application: result.application,
      });
    }

    return NextResponse.json({ success: false, message: 'กรุณาระบุ action เป็น APPROVE หรือ REJECT' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, message: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 });
    console.error('Unable to review staff application:', error);
    return NextResponse.json({ success: false, message: 'ไม่สามารถดำเนินการกับคำขอสมัครได้' }, { status: 500 });
  }
}
