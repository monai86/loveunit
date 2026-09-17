import { NextResponse } from 'next/server';
import { getSiteTheme } from '@/services/theme-service';

export async function GET() {
  try {
    const theme = await getSiteTheme();
    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error('Failed to get public theme:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
