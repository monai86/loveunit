import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: db ? drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }) : undefined,
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'dev-better-auth-secret-change-in-prod-123456789',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});
