import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const rawDbUrl = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '');
const connectionString =
  rawDbUrl && (rawDbUrl.startsWith('postgres://') || rawDbUrl.startsWith('postgresql://'))
    ? rawDbUrl
    : 'postgresql://neondb_owner:npg_4SwEzqo1GRMZ@ep-mute-cake-a1eppdph-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[DB_POOL_ERROR] Unexpected database pool error:', err?.message || err);
});
