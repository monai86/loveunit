import { NextResponse } from 'next/server';
import { getEventBySlug, getTimeSlots, updateEventSettings, updateTimeSlotSettings } from '@/services/event-service';
import { getAdminContentBlocks, updateEventContentBlock } from '@/services/content-service';
import { recordAuditLog } from '@/services/admin-service';
import { requireAdmin, requireReadOnlyAdmin } from '@/lib/auth/server';
import { getErrorMessage } from '@/lib/utils/format';

export async function GET() {
  try {
    try {
      await requireReadOnlyAdmin();
    } catch (err: unknown) {
      const status = getErrorMessage(err) === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลการตั้งค่าเว็บไซต์' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลกิจกรรม' }, { status: 404 });
    }

    const [slots, contentBlocks] = await Promise.all([
      getTimeSlots(event.id),
      getAdminContentBlocks(event.id),
    ]);

    return NextResponse.json({
      success: true,
      event,
      slots,
      contentBlocks,
    });
  } catch (error) {
    console.error('Failed to get site settings:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    let currentUser;
    try {
      currentUser = await requireAdmin();
    } catch (err: unknown) {
      const status = getErrorMessage(err) === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ต้องใช้สิทธิ์ Super Admin ในการแก้ไขการตั้งค่าเว็บไซต์' }, { status });
    }

    const body = await request.json();
    const { eventUpdates, slotUpdates, contentBlockUpdates } = body;

    let updatedEvent = null;
    if (eventUpdates) {
      const res = await updateEventSettings('mumt-2026', eventUpdates);
      if (res.success) {
        updatedEvent = res.event;
      }
    }

    if (slotUpdates && Array.isArray(slotUpdates)) {
      const currentEvent = await getEventBySlug('mumt-2026');
      if (currentEvent) {
        for (const slot of slotUpdates) {
          if (slot.id && typeof slot.capacity === 'number') {
            await updateTimeSlotSettings(slot.id, currentEvent.id, slot.capacity, slot.isActive);
          }
        }
      }
    }

    if (contentBlockUpdates && Array.isArray(contentBlockUpdates)) {
      for (const block of contentBlockUpdates) {
        if (block.id) {
          await updateEventContentBlock(block.id, {
            title: block.title,
            description: block.description,
            imageUrl: block.imageUrl,
            altText: block.altText,
            isVisible: block.isVisible,
            displayOrder: block.displayOrder,
          });
        }
      }
    }

    await recordAuditLog({
      actorId: currentUser.profile.user_id,
      action: 'UPDATE_SITE_SETTINGS',
      entityType: 'events',
      entityId: 'mumt-2026',
      metadata: {
        hasEventUpdates: Boolean(eventUpdates),
        slotUpdatesCount: slotUpdates?.length || 0,
        contentBlockUpdatesCount: contentBlockUpdates?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Failed to update site settings:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
