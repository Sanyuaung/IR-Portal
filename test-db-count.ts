import { pool } from './src/server/db.ts';

async function test() {
  const client = await pool.connect();
  const res = await client.query('SELECT COUNT(*) FROM "User"');
  console.log("Total users in DB:", res.rows[0].count);
  const userRes = await client.query('SELECT email FROM "User"');
  console.log("Users:", userRes.rows);
  process.exit(0);
}
test();
