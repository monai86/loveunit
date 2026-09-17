import { NextResponse } from 'next/server';
import { 
  getEventBySlug, 
  getAllTimeSlots, 
  updateEventSettings, 
  updateTimeSlotDetails,
  createTimeSlot,
  deleteTimeSlot
} from '@/services/event-service';
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

    const [rawSlots, contentBlocks] = await Promise.all([
      getAllTimeSlots(event.id),
      getAdminContentBlocks(event.id),
    ]);

    const slots = (rawSlots as Array<Record<string, unknown>>).map((s) => {
      const startAtVal = s.startAt || s.start_at;
      const endAtVal = s.endAt || s.end_at;
      const startAt = startAtVal instanceof Date ? startAtVal.toISOString() : String(startAtVal || '');
      const endAt = endAtVal instanceof Date ? endAtVal.toISOString() : String(endAtVal || '');
      const isActive = s.isActive !== undefined ? Boolean(s.isActive) : (s.is_active !== undefined ? Boolean(s.is_active) : true);
      const capacity = Number(s.capacity ?? 35);
      const bookedCount = Number(s.bookedCount ?? s.booked_count ?? 0);
      return {
        id: String(s.id),
        eventId: String(s.eventId || s.event_id || event.id),
        startAt,
        endAt,
        start_at: startAt,
        end_at: endAt,
        capacity,
        bookedCount,
        booked_count: bookedCount,
        isActive,
        is_active: isActive,
      };
    });

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
    const { eventUpdates, slotUpdates, createdSlots, deletedSlotIds, contentBlockUpdates } = body;

    let updatedEvent = null;
    if (eventUpdates) {
      const res = await updateEventSettings('mumt-2026', eventUpdates);
      if (res.success) {
        updatedEvent = res.event;
      }
    }

    const currentEvent = await getEventBySlug('mumt-2026');
    if (currentEvent) {
      // 1. Delete slots if any
      if (deletedSlotIds && Array.isArray(deletedSlotIds)) {
        for (const slotId of deletedSlotIds) {
          if (slotId && typeof slotId === 'string') {
            await deleteTimeSlot(slotId, currentEvent.id);
          }
        }
      }

      // 2. Create new slots if any
      if (createdSlots && Array.isArray(createdSlots)) {
        for (const slot of createdSlots) {
          if (slot.startAt && slot.endAt) {
            await createTimeSlot(currentEvent.id, {
              startAt: slot.startAt,
              endAt: slot.endAt,
              capacity: Number(slot.capacity || 35),
              isActive: slot.isActive !== undefined ? Boolean(slot.isActive) : true,
            });
          }
        }
      }

      // 3. Update existing slots
      if (slotUpdates && Array.isArray(slotUpdates)) {
        for (const slot of slotUpdates) {
          if (slot.id) {
            await updateTimeSlotDetails(slot.id, currentEvent.id, {
              startAt: slot.startAt || slot.start_at,
              endAt: slot.endAt || slot.end_at,
              capacity: typeof slot.capacity === 'number' ? slot.capacity : undefined,
              isActive: slot.isActive !== undefined ? Boolean(slot.isActive) : (slot.is_active !== undefined ? Boolean(slot.is_active) : undefined),
            });
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
