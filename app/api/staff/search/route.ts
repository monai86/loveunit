import { NextResponse } from 'next/server';
import { searchRegistrations } from '@/services/checkin-service';
import { requireStaff } from '@/lib/auth/server';
import { getErrorMessage } from '@/lib/utils/format';

export async function GET(request: Request) {
  try {
    try {
      await requireStaff();
    } catch (err: unknown) {
      const status = getErrorMessage(err) === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ค้นหาข้อมูลผู้ลงทะเบียน' }, { status });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json({ success: true, registrations: [] });
    }

    const registrations = await searchRegistrations(q);
    return NextResponse.json({ success: true, registrations });
  } catch (error) {
    console.error('Error searching registrations:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
