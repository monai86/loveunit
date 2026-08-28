import { NextResponse } from 'next/server';
import { getEventBySlug } from '@/services/event-service';
import { deleteDonorRegistration, getAllRegistrations, updateDonorRegistration } from '@/services/admin-service';
import { requireAdmin } from '@/lib/auth/server';
import { getErrorMessage } from '@/lib/utils/format';
import { adminRegistrationUpdateSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    try {
      await requireAdmin();
    } catch (err: unknown) {
      const status = getErrorMessage(err) === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงรายการลงทะเบียนทั้งหมด' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const registrations = await getAllRegistrations(event.id);

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const registrationId = typeof body.registrationId === 'string' ? body.registrationId : '';
    const parsed = adminRegistrationUpdateSchema.safeParse(body);
    if (!registrationId || !parsed.success) {
      return NextResponse.json({ success: false, message: 'ข้อมูลผู้ลงทะเบียนไม่ถูกต้อง' }, { status: 400 });
    }
    const result = await updateDonorRegistration({ registrationId, actorId: admin.id, ...parsed.data });
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    const status = getErrorMessage(error) === 'UNAUTHORIZED' ? 401 : getErrorMessage(error) === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: 'ไม่สามารถแก้ไขข้อมูลผู้ลงทะเบียนได้' }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    if (typeof body.registrationId !== 'string' || !body.registrationId) {
      return NextResponse.json({ success: false, message: 'Missing registrationId' }, { status: 400 });
    }
    const result = await deleteDonorRegistration(body.registrationId, admin.id);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    const status = getErrorMessage(error) === 'UNAUTHORIZED' ? 401 : getErrorMessage(error) === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, message: 'ไม่สามารถลบผู้ลงทะเบียนได้' }, { status });
  }
}
