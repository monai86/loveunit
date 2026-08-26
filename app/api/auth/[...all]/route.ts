import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handlers = toNextJsHandler(auth);

export async function GET(req: NextRequest) {
  try {
    return await handlers.GET(req);
  } catch (err: any) {
    console.error('❌ Auth GET Error:', err);
    return NextResponse.json({ error: err?.message || 'Auth internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handlers.POST(req);
  } catch (err: any) {
    console.error('❌ Auth POST Error:', err);
    return NextResponse.json({ error: err?.message || 'Auth internal error' }, { status: 500 });
  }
}
