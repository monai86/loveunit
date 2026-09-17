import { NextResponse } from 'next/server';
import { getSiteTheme } from '@/services/theme-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const theme = await getSiteTheme();
    return NextResponse.json(
      { success: true, theme },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get public theme:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
