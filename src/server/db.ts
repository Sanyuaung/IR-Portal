import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_4SwEzqo1GRMZ@ep-mute-cake-a1eppdph-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});
