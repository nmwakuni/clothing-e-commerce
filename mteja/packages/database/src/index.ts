import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

export * from './schema';

// Configure Neon for edge runtime compatibility
neonConfig.fetchConnectionCache = true;

// Create database connection
export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

// Default export for convenience
export const db =
  process.env.DATABASE_URL ? createDb(process.env.DATABASE_URL) : null;

export type Database = ReturnType<typeof createDb>;
