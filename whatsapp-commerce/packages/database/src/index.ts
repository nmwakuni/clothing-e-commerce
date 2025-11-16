import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

export * from './schema';

// Create database connection
export const createDb = (connectionString: string) => {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
};

// For use in apps with env variable
export const db = (typeof process !== 'undefined' && process.env?.DATABASE_URL)
  ? createDb(process.env.DATABASE_URL)
  : null;
