import { NextResponse } from 'next/server';
import { getEventBySlug, getTimeSlots } from '@/services/event-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const slots = await getTimeSlots(event.id);
    return NextResponse.json({ event, slots }, {
      headers: {
        'Cache-Control': 'public, max-age=5, s-maxage=5, stale-while-revalidate=10',
      },
    });

  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
