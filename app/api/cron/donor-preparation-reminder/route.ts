import { NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/cron';
import { getEventBySlug } from '@/services/event-service';
import { sendPreparationRemindersForEvent } from '@/services/preparation-reminder-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const event = await getEventBySlug('mumt-2026');
    if (!event) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });

    const result = await sendPreparationRemindersForEvent(event.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[cron] Donor preparation reminder failed:', error);
    return NextResponse.json({ success: false, message: 'Reminder delivery failed' }, { status: 500 });
  }
}
