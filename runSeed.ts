import { seedDatabase } from './src/server/seed';
import { pool } from './src/server/db';

seedDatabase().then(async () => {
    await pool.end();
    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
