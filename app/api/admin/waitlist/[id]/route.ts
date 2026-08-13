import { NextResponse } from 'next/server';
import { removeFromWaitlist, promoteFromWaitlist } from '@/services/waitlist-service';
import { getEventBySlug } from '@/services/event-service';
import { requireAdmin } from '@/lib/auth/server';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    try {
      await requireAdmin();
    } catch (err: unknown) {
      const status = (err as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์จัดการรายการรอ' }, { status });
    }

    const { id } = await params;
    const result = await removeFromWaitlist(id);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'ไม่พบรายการรอที่ระบุ' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'นำออกจากรายการรอแล้ว' });
  } catch (error) {
    console.error('Error removing waitlist entry:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    try {
      await requireAdmin();
    } catch (err: unknown) {
      const status = (err as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เลื่อนรายการรอ' }, { status });
    }

    const { id } = await params;
    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    // Resolve the entry's slot first so promoteFromWaitlist can target it.
    // Entries may be Drizzle (camelCase) or memory-backend (snake_case).
    const { getWaitlist } = await import('@/services/waitlist-service');
    const entries = await getWaitlist(event.id);
    const entry = entries.find(
      (e: { id: string; status?: string; slotId?: string; slot_id?: string }) =>
        e.id === id && e.status === 'WAITING'
    );
    if (!entry) {
      return NextResponse.json({ success: false, message: 'ไม่พบรายการรอที่ระบุ' }, { status: 404 });
    }

    const entryAny = entry as { slotId?: string; slot_id?: string };
    const slotId = entryAny.slotId || entryAny.slot_id || '';
    const result = await promoteFromWaitlist(slotId, event.id);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    const reg = result.registration as { registrationCode?: string; registration_code?: string };
    return NextResponse.json({
      success: true,
      message: 'เลื่อนขึ้นเป็นผู้ลงทะเบียนแล้ว',
      registration_code: reg.registrationCode || reg.registration_code,
    });
  } catch (error) {
    console.error('Error promoting waitlist entry:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
