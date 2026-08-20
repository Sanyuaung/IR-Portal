import { pool } from './src/server/db';
import { AuthUtils } from './src/lib/auth';

async function test() {
  const client = await pool.connect();
  const res = await client.query('SELECT * FROM "User" WHERE email=$1', ['sanyu.aung@kbzbank.com']);
  console.log("DB User:", res.rows[0]);
  const expectedHash = await AuthUtils.hashPassword('password');
  console.log("Expected hash:", expectedHash);
  if (res.rows[0]) {
    console.log("Matches?", expectedHash === res.rows[0].password);
  }
  process.exit(0);
}
test();
