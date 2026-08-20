import { seedDatabase } from './seed.js';
import { pool } from './db.js';

async function main() {
  await seedDatabase();
  const users = await pool.query('SELECT id, email, name FROM "User"');
  console.log('Seeded Users in Neon PostgreSQL:', users.rows);
  await pool.end();
}

main().catch(console.error);
