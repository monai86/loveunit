import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export const auth = betterAuth({
  database: db ? drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }) : undefined,
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
  secret: process.env.BETTER_AUTH_SECRET || 'dev-better-auth-secret-change-in-prod-123456789',
  baseURL: getBaseURL(),
  trustedOrigins: (request?: Request) => {
    try {
      if (request) {
        const url = new URL(request.url);
        if (url.hostname.endsWith('.vercel.app') || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          return [url.origin];
        }
      }
    } catch {
      // ignore
    }
    const list = ['http://localhost:3000'];
    if (process.env.BETTER_AUTH_URL) list.push(process.env.BETTER_AUTH_URL);
    if (process.env.NEXT_PUBLIC_APP_URL) list.push(process.env.NEXT_PUBLIC_APP_URL);
    if (process.env.VERCEL_URL) list.push(`https://${process.env.VERCEL_URL}`);
    return list;
  },
});
