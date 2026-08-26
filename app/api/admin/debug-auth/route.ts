import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, staffProfiles, account } from '@/db/schema';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const diagnostics: Record<string, any> = {};

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  let dbHost = 'unknown';
  let dbName = 'unknown';
  try {
    const parsed = new URL(dbUrl);
    dbHost = parsed.host;
    dbName = parsed.pathname;
  } catch {}

  diagnostics.env = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    dbHost,
    dbName,
    hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
    betterAuthSecretLen: process.env.BETTER_AUTH_SECRET?.length,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    vercelUrl: process.env.VERCEL_URL,
    vercelProjectProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    if (!db) {
      diagnostics.db = 'DB client is null';
    } else {
      const users = await db.select().from(user);
      const profiles = await db.select().from(staffProfiles);
      const accounts = await db.select().from(account);
      diagnostics.db = {
        status: 'CONNECTED',
        userCount: users.length,
        users: users.map(u => ({ id: u.id, email: u.email, name: u.name })),
        profileCount: profiles.length,
        profiles: profiles.map(p => ({ userId: p.userId, role: p.role, active: p.isActive })),
        accountCount: accounts.length,
        accounts: accounts.map(a => ({ userId: a.userId, accountId: a.accountId, hasPass: !!a.password })),
      };
    }
  } catch (err: any) {
    diagnostics.dbError = {
      message: err?.message,
      cause: err?.cause ? {
        message: err.cause?.message,
        code: err.cause?.code,
        detail: err.cause?.detail,
        hint: err.cause?.hint,
      } : null,
      stack: err?.stack,
    };
  }

  try {
    const signInTest = await auth.api.signInEmail({
      body: {
        email: 'admin@mahidol.ac.th',
        password: 'Admin@MUMT2026',
      },
    });
    diagnostics.signInTest = {
      success: true,
      user: signInTest?.user?.email,
      id: signInTest?.user?.id,
    };
  } catch (err: any) {
    diagnostics.signInTest = {
      success: false,
      error: err?.message || String(err),
      cause: err?.cause ? {
        message: err.cause?.message,
        code: err.cause?.code,
        detail: err.cause?.detail,
      } : null,
      status: err?.status,
    };
  }

  return NextResponse.json(diagnostics);
}
