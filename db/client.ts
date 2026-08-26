import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

const ACTIVE_DATABASE_URL = 'postgresql://neondb_owner:npg_OwkeQf9jz8nH@ep-wild-king-azkezpma-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export function createNeonClient() {
  let connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  // Fallback if Vercel has stale/broken ep-fancy-forest database URL or unconfigured
  if (!connectionString || connectionString.includes('ep-fancy-forest')) {
    connectionString = ACTIVE_DATABASE_URL;
  }

  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

export const db = createNeonClient();
