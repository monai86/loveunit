import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/server';
import { getEventBySlug } from '@/services/event-service';
import { getDonorQueue, callNextDonor } from '@/services/queue-service';
import { formatTimeRange } from '@/lib/utils/format';

const callNextSchema = z.object({
  slotId: z.string().min(1, 'กรุณาระบุช่วงเวลา'),
});

export async function GET() {
  try {
    try {
      await requireStaff();
    } catch (err: unknown) {
      const status = (err as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงคิว' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const queue = await getDonorQueue(event.id);

    // Group by slot with a human-readable label.
    const bySlot = new Map<string, { slotLabel: string; donors: typeof queue }>();
    for (const entry of queue) {
      const label = entry.timeSlot
        ? formatTimeRange(entry.timeSlot.startAt, entry.timeSlot.endAt)
        : 'ไม่ระบุรอบ';
      const key = entry.slotId || 'unknown';
      if (!bySlot.has(key)) bySlot.set(key, { slotLabel: label, donors: [] });
      bySlot.get(key)!.donors.push(entry);
    }

    const slots = [...bySlot.entries()].map(([slotId, value]) => ({
      slotId,
      slotLabel: value.slotLabel,
      waiting: value.donors.filter((d) => d.status === 'REGISTERED').length,
      donors: value.donors,
    }));

    return NextResponse.json({ success: true, queue: slots });
  } catch (error) {
    console.error('Error fetching queue:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    try {
      await requireStaff();
    } catch (err: unknown) {
      const status = (err as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์จัดการคิว' }, { status });
    }

    const body = await request.json();
    const parseResult = callNextSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const result = await callNextDonor(parseResult.data.slotId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'เรียกผู้บริจาคคนถัดไปแล้ว',
      registration: result.registration,
    });
  } catch (error) {
    console.error('Error calling next donor:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
