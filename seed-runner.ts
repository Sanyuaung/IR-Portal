import { seedDatabase } from './src/server/seed.ts';
import dotenv from 'dotenv';
dotenv.config();

console.log("Starting forced seed...");
seedDatabase().then(() => {
  console.log("Seed complete. Exiting...");
  process.exit(0);
}).catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
