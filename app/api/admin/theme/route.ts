import { NextResponse } from 'next/server';
import { getSiteTheme, updateSiteTheme } from '@/services/theme-service';
import { recordAuditLog } from '@/services/admin-service';
import { requireAdmin, requireReadOnlyAdmin } from '@/lib/auth/server';
import { getErrorMessage } from '@/lib/utils/format';

export async function GET() {
  try {
    try {
      await requireReadOnlyAdmin();
    } catch (err: unknown) {
      const status = getErrorMessage(err) === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลธีม' }, { status });
    }

    const theme = await getSiteTheme();
    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error('Failed to get admin theme:', error);
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
      return NextResponse.json({ success: false, message: 'ต้องใช้สิทธิ์ Super Admin ในการแก้ไขธีมเว็บไซต์' }, { status });
    }

    const body = await request.json();
    const res = await updateSiteTheme(body);

    if (!res.success) {
      return NextResponse.json({ success: false, message: 'บันทึกการตั้งค่าธีมไม่สำเร็จ' }, { status: 400 });
    }

    await recordAuditLog({
      actorId: currentUser.profile.user_id,
      action: 'UPDATE_SITE_THEME',
      entityType: 'site_themes',
      entityId: res.theme?.id || 'default',
      metadata: { preset_name: res.theme?.preset_name, primary_color: res.theme?.primary_color },
    });

    return NextResponse.json({ success: true, message: 'อัปเดตธีมเว็บไซต์เรียบร้อยแล้ว', theme: res.theme });
  } catch (error) {
    console.error('Failed to update theme:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
