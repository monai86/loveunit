import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { getAuditLogs, getAuditActions } from '@/services/audit-service';

export async function GET(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch (err: unknown) {
      const status = (err as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงบันทึกการใช้งาน' }, { status });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action') || undefined;
    const limit = Number(url.searchParams.get('limit')) || 200;

    const [logs, actions] = await Promise.all([
      getAuditLogs({ action, limit }),
      getAuditActions(),
    ]);

    return NextResponse.json({ success: true, logs, actions });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
