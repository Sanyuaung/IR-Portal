import { pool } from './db';
import crypto from 'crypto';
import { mockTransactions, mockFxRates } from '../data/mockTransactions';

// Salt matching client-side encryption
const ENCRYPTION_SALT = 'KBZ_IR_PORTAL_SECURE_SALT_2026';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + ENCRYPTION_SALT).digest('hex');
}

export async function ensureDatabaseSchema(existingClient?: any) {
  const client = existingClient || (await pool.connect());
  try {
    // 1. Enum types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "TwoFactorMethod" AS ENUM ('EMAIL', 'GOOGLE_AUTH');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "companyName" TEXT,
        "phone" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyName" TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordStrength" TEXT DEFAULT 'Moderate';`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3);`);

    // Ensure UNIQUE constraint on email
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE ("email");
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN duplicate_table THEN null;
      END $$;
    `);

    // 3. TwoFactorAuth table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "TwoFactorAuth" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "isEnabled" BOOLEAN NOT NULL DEFAULT false,
        "method" "TwoFactorMethod" NOT NULL DEFAULT 'EMAIL',
        "secret" TEXT,
        "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "emailOtp" TEXT,
        "emailOtpExpiry" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "TwoFactorAuth" ADD CONSTRAINT "TwoFactorAuth_userId_unique" UNIQUE ("userId");
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN duplicate_table THEN null;
      END $$;
    `);

    // 4. InboundTransaction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "InboundTransaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "transactionRef" TEXT NOT NULL,
        "senderName" TEXT NOT NULL,
        "senderCountry" TEXT NOT NULL,
        "sendingBank" TEXT NOT NULL,
        "sendingBankBic" TEXT NOT NULL,
        "currency" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "exchangeRate" DOUBLE PRECISION NOT NULL,
        "convertedAmountMmk" DOUBLE PRECISION NOT NULL,
        "feeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "netAmountMmk" DOUBLE PRECISION NOT NULL,
        "valueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'success',
        "statusMessage" TEXT,
        "purpose" TEXT NOT NULL,
        "beneficiaryAccount" TEXT NOT NULL,
        "swiftMetadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. TransactionAuditLog table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "TransactionAuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "transactionId" TEXT NOT NULL,
        "oldStatus" TEXT,
        "newStatus" TEXT NOT NULL,
        "changedBy" TEXT NOT NULL DEFAULT 'SYSTEM',
        "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "remarks" TEXT
      );
    `);

    // We do not enforce fkey to avoid potential issues with simple seed data dropping, but it's good practice.
    // Ensure index on transactionId
    await client.query(`CREATE INDEX IF NOT EXISTS "TransactionAuditLog_transactionId_idx" ON "TransactionAuditLog"("transactionId");`);

    // 5. FxRate table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "FxRate" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "currency" TEXT NOT NULL,
        "buyRate" DOUBLE PRECISION NOT NULL,
        "sellRate" DOUBLE PRECISION NOT NULL,
        "middleRate" DOUBLE PRECISION NOT NULL,
        "change24h" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "FxRate" ADD CONSTRAINT "FxRate_currency_unique" UNIQUE ("currency");
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN duplicate_table THEN null;
      END $$;
    `);

    // 6. AuditLog table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "details" JSONB,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Safe index creation
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorAuth_userId_idx" ON "TwoFactorAuth"("userId");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "InboundTransaction_txRef_idx" ON "InboundTransaction"("transactionRef");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "FxRate_curr_idx" ON "FxRate"("currency");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "InboundTransaction_status_idx" ON "InboundTransaction"("status");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "InboundTransaction_currency_idx" ON "InboundTransaction"("currency");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "InboundTransaction_valueDate_idx" ON "InboundTransaction"("valueDate");`);
  } catch (schemaErr: any) {
    console.warn('[SCHEMA_ENSURE_WARN]', schemaErr?.message || schemaErr);
  } finally {
    if (!existingClient) {
      try {
        client.release();
      } catch (relErr) {
        // ignore
      }
    }
  }
}

export async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('⚡ Initializing and migrating PostgreSQL database tables...');
    await ensureDatabaseSchema(client);


    console.log('Cleaning existing tables...');
    await client.query('TRUNCATE TABLE "InboundTransaction" CASCADE;');
    await client.query('TRUNCATE TABLE "FxRate" CASCADE;');
    await client.query('TRUNCATE TABLE "TwoFactorAuth" CASCADE;');
    await client.query('TRUNCATE TABLE "User" CASCADE;');
    
    // 7. Seed Default Users

    const encryptedPassword = hashPassword('password');
    const defaultUsers = [
      {
        id: 'usr_sanyuaung_01',
        name: 'SanYuAung',
        email: 'sanyuaung.ygn.mm@gmail.com',
        companyName: 'Myanmar Horizon Trading Co., Ltd.',
        phone: '+95 9 798 112 889',
        password: encryptedPassword,
      },
      {
        id: 'usr_sya_kbz_02',
        name: 'SYA_KBZ',
        email: 'sanyu.aung@kbzbank.com',
        companyName: 'KBZ Bank Co., Ltd.',
        phone: '+95 9 798 112 889',
        password: encryptedPassword,
      },
      {
        id: 'usr_sya_kbz_03',
        name: 'SYA_KBZ',
        email: 'sanyu.aung.kbzbank.com',
        companyName: 'KBZ Bank Co., Ltd.',
        phone: '+95 9 798 112 889',
        password: encryptedPassword,
      },
    ];

    for (const u of defaultUsers) {
      const userRes = await client.query(
        `
        INSERT INTO "User" ("id", "name", "email", "password", "companyName", "phone", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT ("email")
        DO UPDATE SET "password" = $4, "name" = $2, "companyName" = $5, "phone" = $6, "updatedAt" = NOW()
        RETURNING "id";
      `,
        [u.id, u.name, u.email, u.password, u.companyName, u.phone]
      );

      const actualUserId = userRes.rows[0].id;
      await client.query(
        `
        INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "updatedAt")
        VALUES ($1, $2, false, 'EMAIL', NOW())
        ON CONFLICT ("userId") DO NOTHING;
      `,
        [`tfa_${actualUserId}`, actualUserId]
      );
    }

    // 8. Seed FX Rates
    for (const fx of mockFxRates) {
      await client.query(
        `
        INSERT INTO "FxRate" ("id", "currency", "buyRate", "sellRate", "middleRate", "change24h", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT ("currency")
        DO UPDATE SET
          "buyRate" = $3,
          "sellRate" = $4,
          "middleRate" = $5,
          "change24h" = $6,
          "updatedAt" = $7;
      `,
        [
          `fx_${fx.currency.toLowerCase()}`,
          fx.currency,
          fx.buyRate,
          fx.sellRate,
          fx.middleRate,
          fx.change24h,
          new Date(fx.updatedAt),
        ]
      );
    }

    // 9. Seed Inbound Transactions
    for (const tx of mockTransactions) {
      await client.query(
        `
        INSERT INTO "InboundTransaction" (
          "id",
          "transactionRef",
          "senderName",
          "senderCountry",
          "sendingBank",
          "sendingBankBic",
          "currency",
          "amount",
          "exchangeRate",
          "convertedAmountMmk",
          "feeAmount",
          "netAmountMmk",
          "valueDate",
          "status",
          "statusMessage",
          "purpose",
          "beneficiaryAccount",
          "swiftMetadata",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
        ON CONFLICT ("id")
        DO UPDATE SET
          "transactionRef" = $2,
          "senderName" = $3,
          "senderCountry" = $4,
          "sendingBank" = $5,
          "sendingBankBic" = $6,
          "currency" = $7,
          "amount" = $8,
          "exchangeRate" = $9,
          "convertedAmountMmk" = $10,
          "feeAmount" = $11,
          "netAmountMmk" = $12,
          "valueDate" = $13,
          "status" = $14,
          "statusMessage" = $15,
          "purpose" = $16,
          "beneficiaryAccount" = $17,
          "swiftMetadata" = $18,
          "updatedAt" = NOW();
      `,
        [
          tx.id,
          tx.transactionRef,
          tx.senderName,
          tx.senderCountry,
          tx.sendingBank,
          tx.sendingBankBic,
          tx.currency,
          tx.amount,
          tx.exchangeRate,
          tx.convertedAmountMmk,
          tx.feeAmount || 0,
          tx.netAmountMmk,
          new Date(tx.valueDate),
          tx.status,
          tx.statusMessage || null,
          tx.purpose,
          tx.beneficiaryAccount,
          JSON.stringify(tx.swiftMetadata || {}),
        ]
      );
    }

    console.log(`✅ Database migration complete: Seeded ${mockTransactions.length} transactions, ${mockFxRates.length} FX rates, and default users.`);
  } catch (error) {
    console.error('Database migration/seed error:', error);
  } finally {
    client.release();
  }
}
