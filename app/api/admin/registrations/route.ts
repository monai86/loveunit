import { NextResponse } from 'next/server';
import { getEventBySlug } from '@/services/event-service';
import { deleteDonorRegistration, getAllRegistrations, updateDonorRegistration } from '@/services/admin-service';
import { requireAdmin, requireReadOnlyAdmin } from '@/lib/auth/server';
import { getErrorMessage, pickField } from '@/lib/utils/format';
import { adminRegistrationUpdateSchema } from '@/lib/validation/schemas';

export async function GET(request: Request) {
  try {
    try {
      await requireReadOnlyAdmin();
    } catch (err: unknown) {
      const status = getErrorMessage(err) === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงรายการลงทะเบียนทั้งหมด' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    let registrations = await getAllRegistrations(event.id);

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');

    if (q) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registrations = (registrations as any[]).filter((r) => {
        const firstName = String(pickField(r, 'firstName', 'first_name') || '').toLowerCase();
        const lastName = String(pickField(r, 'lastName', 'last_name') || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const code = String(pickField(r, 'registrationCode', 'registration_code') || '').toLowerCase();
        const phone = String(pickField(r, 'phone', 'phone') || '').toLowerCase();
        const phoneDigits = phone.replace(/\D/g, '');
        const faculty = String(pickField(r, 'faculty', 'faculty') || '').toLowerCase();
        const email = String(pickField(r, 'email', 'email') || '').toLowerCase();

        const matchesText =
          fullName.includes(q) ||
          firstName.includes(q) ||
          lastName.includes(q) ||
          code.includes(q) ||
          phone.includes(q) ||
          faculty.includes(q) ||
          email.includes(q);

        const matchesPhone = qDigits.length >= 3 && phoneDigits.includes(qDigits);

        return matchesText || matchesPhone;
      });
    }

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
