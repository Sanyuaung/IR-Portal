import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4SwEzqo1GRMZ@ep-mute-cake-a1eppdph-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  },
});
