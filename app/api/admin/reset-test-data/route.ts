import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth/server';
import { getEventBySlug } from '@/services/event-service';
import { resetTestData } from '@/services/test-data-service';

export async function POST() {
  try {
    const admin = await requireSuperAdmin();
    const event = await getEventBySlug('mumt-2026');
    if (!event) return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    const result = await resetTestData(admin.id, event.id);
    return NextResponse.json({ success: true, message: 'ล้างข้อมูลทดสอบและเริ่มเลข Registration Code ใหม่ที่ 001 แล้ว', ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    if (message === 'FORBIDDEN') return NextResponse.json({ success: false, message: 'เฉพาะ Super Admin เท่านั้น' }, { status: 403 });
    return NextResponse.json({ success: false, message: 'ไม่สามารถล้างข้อมูลทดสอบได้' }, { status: 500 });
  }
}
