import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the connection
const sql = neon(process.env.DATABASE_URL);

// Create the drizzle database instance
export const db = drizzle(sql, { schema });

// Export all schema tables and types
export * from './schema';

// Export the sql instance for raw queries if needed
export { sql };
