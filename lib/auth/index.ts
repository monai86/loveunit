import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

const getBaseURL = () => {
  // If running on Vercel or in production, prefer actual deployed production URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://mumt-loveunit.vercel.app';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes('localhost')) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  return 'http://localhost:3000';
};

export const auth = betterAuth({
  database: db ? drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }) : undefined,
  rateLimit: {
    enabled: process.env.NODE_ENV === 'production' && !process.env.CI,
    window: 60,
    max: 100,
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      mustChangePassword: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || 'mumt-blood-donation-super-secret-key-2026-auth-32chars',
  baseURL: getBaseURL(),
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },
  },
  trustedOrigins: (request?: Request) => {
    const list = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'https://mumt-loveunit.vercel.app',
      'https://mumtloveunit.vercel.app',
    ];
    if (process.env.BETTER_AUTH_URL) list.push(process.env.BETTER_AUTH_URL);
    if (process.env.NEXT_PUBLIC_APP_URL) list.push(process.env.NEXT_PUBLIC_APP_URL);
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) list.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
    if (process.env.VERCEL_URL) list.push(`https://${process.env.VERCEL_URL}`);
    try {
      if (request) {
        const url = new URL(request.url);
        list.push(url.origin);
      }
    } catch {
      // ignore
    }
    return Array.from(new Set(list));
  },
});
