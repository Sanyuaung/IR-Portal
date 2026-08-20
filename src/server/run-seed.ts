import { seedDatabase } from './seed';
import { pool } from './db';

async function main() {
  await seedDatabase();
  const users = await pool.query('SELECT id, email, name FROM "User"');
  console.log('Seeded Users in Neon PostgreSQL:', users.rows);
  await pool.end();
}

main().catch(console.error);
