import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

export function createNeonClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

export const db = createNeonClient();
