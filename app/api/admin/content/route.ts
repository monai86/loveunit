import { NextResponse } from 'next/server';
import { getEventBySlug } from '@/services/event-service';
import { getAdminContentBlocks, updateEventContentBlock } from '@/services/content-service';
import { recordAuditLog } from '@/services/admin-service';
import { requireAdmin } from '@/lib/auth/server';

export async function GET() {
  try {
    try {
      await requireAdmin();
    } catch (err: any) {
      const status = err.message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงส่วนจัดการเนื้อหา' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const contentBlocks = await getAdminContentBlocks(event.id);
    return NextResponse.json({ success: true, contentBlocks });
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    let currentUser;
    try {
      currentUser = await requireAdmin();
    } catch (err: any) {
      const status = err.message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์แก้ไขเนื้อหา' }, { status });
    }

    const body = await request.json();
    const { id, title, description, imageUrl, altText, isVisible, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุ Content Block ID' }, { status: 400 });
    }

    const res = await updateEventContentBlock(id, {
      title,
      description,
      imageUrl,
      altText,
      isVisible,
      displayOrder,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, message: 'ไม่สามารถอัปเดตเนื้อหาได้' }, { status: 400 });
    }

    await recordAuditLog({
      actorId: currentUser.profile.user_id,
      action: 'UPDATE_CONTENT_BLOCK',
      entityType: 'event_content_blocks',
      entityId: id,
      metadata: { title, is_visible: isVisible },
    });

    return NextResponse.json({ success: true, message: 'อัปเดตเนื้อหาเรียบร้อยแล้ว', block: res.block });
  } catch (error) {
    console.error('Error updating content block:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
