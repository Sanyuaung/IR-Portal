import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { pool } from './db.ts';
import { seedDatabase } from './seed.ts';
import { prisma } from '../lib/prisma.ts';
import { AuthUtils } from '../lib/auth.ts';
import { TwoFactorService } from '../lib/two-factor.ts';
import { sendOtpEmail } from './email.ts';

dotenv.config();

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function shouldSeedDatabaseOnBoot() {
  if (process.env.ENABLE_DB_SEED === 'true') {
    return true;
  }
  if (process.env.ENABLE_DB_SEED === 'false') {
    return false;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  return !isProduction && !isVercel;
}

if (shouldSeedDatabaseOnBoot()) {
  seedDatabase().catch((err) => console.error('Database initialization warning:', err));
}

/**
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'connected', time: dbRes.rows[0].now });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    console.log('Login attempt for:', email);
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        twoFactorAuth: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await AuthUtils.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.twoFactorAuth?.isEnabled) {
      let activeOtp: string | undefined;
      if (user.twoFactorAuth.method === 'EMAIL') {
        const otpRes = await TwoFactorService.sendEmailOtp(user.id);
        activeOtp = otpRes.otp;
      }

      const tempToken = AuthUtils.generateTempToken({
        sub: user.id,
        email: user.email,
        requiresOtp: true,
      });

      return res.json({
        requiresOtp: true,
        require2Fa: true,
        tempToken,
        method: user.twoFactorAuth.method,
        userId: user.id,
        userEmail: user.email,
        activeOtp,
      });
    }

    const accessToken = AuthUtils.generateAccessToken({
      sub: user.id,
      email: user.email,
      requiresOtp: false,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    const profileCompanyName = user.companyName || (user.name ? `${user.name} Trading Co., Ltd.` : 'Myanmar Horizon Trading Co., Ltd.');
    const profilePhone = user.phone || '+95 9 798 112 889';

    const userMerchantId = cleanEmail === 'sanyuaung.ygn.mm@gmail.com' || cleanEmail.includes('sanyu')
      ? 'MMR-8839201'
      : `MMR-${Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % 9000000 + 1000000)}`;

    return res.json({
      accessToken,
      requiresOtp: false,
      require2Fa: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'San Yu Aung',
        companyName: profileCompanyName,
        merchantId: userMerchantId,
        merchantName: profileCompanyName,
        phone: profilePhone,
        role: 'Customer Account Admin',
        accountNumber: '0091-2384-992019',
        branch: 'Yangon Main Settlement Gateway Branch (0091)',
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    return res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * POST /api/auth/signup or /api/auth/register
 */
app.post(['/api/auth/signup', '/api/auth/register'], async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (name || '').trim() || cleanEmail.split('@')[0];

  let client;
  try {
    client = await pool.connect();
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyName" TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;`);

    const existing = await client.query(`SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)`, [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    const hashedPassword = await AuthUtils.hashPassword(password);
    const userId = `usr_${Date.now()}`;

    await client.query(
      `INSERT INTO "User" ("id", "name", "email", "password", "companyName", "phone", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [userId, cleanName, cleanEmail, hashedPassword, null, null]
    );

    await client.query(
      `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "createdAt", "updatedAt")
       VALUES ($1, $2, false, 'EMAIL', NOW(), NOW())
       ON CONFLICT ("userId") DO NOTHING`,
      [`tfa_${userId}`, userId]
    );

    const accessToken = AuthUtils.generateAccessToken({
      sub: userId,
      email: cleanEmail,
      requiresOtp: false,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    const userMerchantId = cleanEmail === 'sanyuaung.ygn.mm@gmail.com' || cleanEmail.includes('sanyu')
      ? 'MMR-8839201'
      : `MMR-${Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % 9000000 + 1000000)}`;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully in PostgreSQL database.',
      accessToken,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        merchantId: userMerchantId,
        merchantName: cleanName,
        role: 'Customer Account Admin',
        accountNumber: `0091-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`,
        branch: 'Yangon Main Settlement Gateway Branch (0091)',
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

/**
 * Helper to resolve user by ID or Email
 */
async function resolveOrCreateUser(client: any, userIdOrEmail: string, fallbackEmail?: string) {
  const cleanTarget = (fallbackEmail || userIdOrEmail || 'sanyu.aung@kbzbank.com').trim().toLowerCase();
  const cleanId = (userIdOrEmail || '').trim();

  let userRes = await client.query(
    `SELECT * FROM "User" WHERE id = $1 OR LOWER(email) = LOWER($1) OR LOWER(email) = LOWER($2) LIMIT 1`,
    [cleanId, cleanTarget]
  );

  if (userRes.rows.length > 0) {
    return userRes.rows[0];
  }

  const uId = cleanId.startsWith('usr_') ? cleanId : `usr_${Date.now()}`;
  const defaultName = cleanTarget.split('@')[0] || 'San Yu Aung';
  const defaultHash = await AuthUtils.hashPassword('Password@123');

  const insertRes = await client.query(
    `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT ("email") DO UPDATE SET "updatedAt" = NOW()
     RETURNING *`,
    [uId, defaultName, cleanTarget, defaultHash]
  );

  return insertRes.rows[0];
}

/**
 * POST /api/auth/verify-2fa
 */
app.post('/api/auth/verify-2fa', async (req, res) => {
  const { userId, tempToken, code } = req.body;
  const targetId = userId || (tempToken ? AuthUtils.verifyToken(tempToken)?.sub : null);

  if (!targetId || !code) {
    return res.status(400).json({ error: 'User ID / session token and verification code required.' });
  }

  let client;
  try {
    client = await pool.connect();
    const userRes = await client.query(
      `SELECT u.*, t."isEnabled" as "tfaEnabled", t."method" as "tfaMethod", t.secret, t."backupCodes", t."emailOtp", t."emailOtpExpiry"
       FROM "User" u
       LEFT JOIN "TwoFactorAuth" t ON u.id = t."userId"
       WHERE u.id = $1 OR LOWER(u.email) = LOWER($1)`,
      [targetId]
    );

    const user = userRes.rows[0];
    if (!user || !user.tfaEnabled) {
      return res.status(400).json({ error: '2FA is not enabled for this account.' });
    }

    const cleanCode = code.trim().toUpperCase();
    let isValid = false;

    if (user.tfaMethod === 'GOOGLE_AUTH') {
      if (user.secret && cleanCode.length === 6) {
        isValid = speakeasy.totp.verify({
          secret: user.secret,
          encoding: 'base32',
          token: cleanCode,
          window: 6,
        });
      }

      if (!isValid && user.backupCodes && user.backupCodes.includes(cleanCode)) {
        isValid = true;
        const remaining = user.backupCodes.filter((bc: string) => bc !== cleanCode);
        await client.query(`UPDATE "TwoFactorAuth" SET "backupCodes" = $1 WHERE "userId" = $2`, [remaining, user.id]);
      }
    } else {
      if (!user.emailOtp || !user.emailOtpExpiry || new Date() > new Date(user.emailOtpExpiry)) {
        return res.status(400).json({ error: 'OTP expired. Please request a new code.' });
      }
      isValid = user.emailOtp === cleanCode;
      if (isValid) {
        await client.query(`UPDATE "TwoFactorAuth" SET "emailOtp" = NULL, "emailOtpExpiry" = NULL WHERE "userId" = $1`, [
          user.id,
        ]);
      }
    }

    if (!isValid) {
      return res.status(400).json({
        error:
          user.tfaMethod === 'GOOGLE_AUTH'
            ? 'Invalid code. Please enter the current 6-digit code displayed in Google Authenticator.'
            : 'Invalid email verification code.',
      });
    }

    const accessToken = AuthUtils.generateAccessToken({
      sub: user.id,
      email: user.email,
      requiresOtp: false,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    const profileCompanyName = user.companyName || (user.name ? `${user.name} Trading Co., Ltd.` : 'Myanmar Horizon Trading Co., Ltd.');
    const profilePhone = user.phone || '+95 9 798 112 889';

    const userMerchantId = (user.email || '').toLowerCase().includes('sanyu')
      ? 'MMR-8839201'
      : `MMR-${Math.abs((user.email || '').split('').reduce((a: number, b: string) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % 9000000 + 1000000)}`;

    return res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'San Yu Aung',
        companyName: profileCompanyName,
        merchantId: userMerchantId,
        merchantName: profileCompanyName,
        phone: profilePhone,
        role: 'Customer Account Admin',
        accountNumber: '0091-2384-992019',
        branch: 'Yangon Main Settlement Gateway Branch (0091)',
      },
    });
  } catch (err: any) {
    console.error('2FA verification error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

/**
 * POST /api/2fa/enable
 */
app.post('/api/2fa/enable', async (req, res) => {
  const { userId, method, email } = req.body;
  if (!userId && !email) return res.status(400).json({ error: 'User ID or Email is required' });

  let client;
  try {
    client = await pool.connect();
    const user = await resolveOrCreateUser(client, userId, email);
    const targetEmail = (email || user.email || 'customer@mmglobalremit.com').trim();

    if (method === 'GOOGLE_AUTH') {
      const label = `MM Global Remit:${targetEmail}`;
      const issuer = 'MM Global Remit';

      const secretObj = speakeasy.generateSecret({
        name: label,
        issuer: issuer,
        length: 20,
      });

      const secret = secretObj.base32;
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
      const qrCode = await QRCode.toDataURL(otpauthUrl);

      const backupCodes: string[] = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }

      await client.query(
        `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "secret", "backupCodes", "updatedAt")
         VALUES ($1, $2, false, 'GOOGLE_AUTH', $3, $4, NOW())
         ON CONFLICT ("userId")
         DO UPDATE SET "isEnabled" = false, "method" = 'GOOGLE_AUTH', "secret" = $3, "backupCodes" = $4, "updatedAt" = NOW()`,
        [`tfa_${user.id}`, user.id, secret, backupCodes]
      );

      return res.json({
        success: true,
        method: 'GOOGLE_AUTH',
        secret,
        qrCode,
        otpauthUrl,
        backupCodes,
      });
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Valid for 1 minute (60 seconds)
      const expiry = new Date(Date.now() + 1 * 60 * 1000);

      await client.query(
        `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "emailOtp", "emailOtpExpiry", "updatedAt")
         VALUES ($1, $2, false, 'EMAIL', $3, $4, NOW())
         ON CONFLICT ("userId")
         DO UPDATE SET "isEnabled" = false, "method" = 'EMAIL', "emailOtp" = $3, "emailOtpExpiry" = $4, "updatedAt" = NOW()`,
        [`tfa_${user.id}`, user.id, otp, expiry]
      );

      // Dispatch real email via Gmail SMTP
      await sendOtpEmail(targetEmail, otp, user.name);

      return res.json({
        success: true,
        method: 'EMAIL',
        otp,
        userEmail: targetEmail,
        message: `OTP sent to ${targetEmail}`,
      });
    }
  } catch (err: any) {
    console.error('2FA enable error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * POST /api/2fa/send-email-otp or /api/auth/resend-otp
 */
app.post(['/api/2fa/send-email-otp', '/api/auth/resend-otp'], async (req, res) => {
  const { userId, email } = req.body;
  if (!userId && !email) return res.status(400).json({ error: 'User ID or Email is required' });

  let client;
  try {
    client = await pool.connect();
    const user = await resolveOrCreateUser(client, userId, email);
    const targetEmail = (email || user.email || 'sanyu.aung@kbzbank.com').trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Valid for 1 minute (60 seconds)
    const expiry = new Date(Date.now() + 1 * 60 * 1000);

    await client.query(
      `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "emailOtp", "emailOtpExpiry", "updatedAt")
       VALUES ($1, $2, false, 'EMAIL', $3, $4, NOW())
       ON CONFLICT ("userId")
       DO UPDATE SET "emailOtp" = $3, "emailOtpExpiry" = $4, "updatedAt" = NOW()`,
      [`tfa_${user.id}`, user.id, otp, expiry]
    );

    // Send real SMTP email
    await sendOtpEmail(targetEmail, otp, user.name);

    return res.json({
      success: true,
      otp,
      userEmail: targetEmail,
      message: `New verification code sent to ${targetEmail}`,
    });
  } catch (err: any) {
    console.error('Send email OTP error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * GET /api/2fa/status/:userId
 */
app.get('/api/2fa/status/:userId', async (req, res) => {
  const { userId } = req.params;
  let client;
  try {
    client = await pool.connect();
    const userRes = await client.query(
      `SELECT t."isEnabled", t."method" FROM "TwoFactorAuth" t
       JOIN "User" u ON t."userId" = u.id
       WHERE u.id = $1 OR LOWER(u.email) = LOWER($1)`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.json({ isEnabled: false, method: null });
    }
    return res.json({
      isEnabled: userRes.rows[0].isEnabled,
      method: userRes.rows[0].method,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * POST /api/2fa/verify-and-enable
 */
app.post('/api/2fa/verify-and-enable', async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: 'User ID and code are required' });

  let client;
  try {
    client = await pool.connect();
    const user = await resolveOrCreateUser(client, userId);
    const tfaRes = await client.query(
      `SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`,
      [user.id]
    );
    const tfa = tfaRes.rows[0];

    if (!tfa) return res.status(400).json({ error: '2FA setup not initiated' });

    const cleanCode = code.trim();
    let isValid = false;

    if (tfa.method === 'GOOGLE_AUTH') {
      if (tfa.secret) {
        isValid = speakeasy.totp.verify({
          secret: tfa.secret,
          encoding: 'base32',
          token: cleanCode,
          window: 6,
        });
      }
    } else {
      if (!tfa.emailOtp || !tfa.emailOtpExpiry || new Date() > new Date(tfa.emailOtpExpiry)) {
        return res.status(400).json({ error: 'Verification code expired. Please request a new 1-minute OTP.' });
      }
      isValid = tfa.emailOtp === cleanCode;
    }

    if (!isValid) {
      return res.status(400).json({
        error:
          tfa.method === 'GOOGLE_AUTH'
            ? 'Invalid code. Please check your Google Authenticator app and enter the real 6-digit code currently displayed.'
            : 'Invalid email verification code.',
      });
    }

    await client.query(
      `UPDATE "TwoFactorAuth" SET "isEnabled" = true, "emailOtp" = NULL, "emailOtpExpiry" = NULL, "updatedAt" = NOW() WHERE "id" = $1`,
      [tfa.id]
    );

    return res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully in Neon PostgreSQL.',
    });
  } catch (err: any) {
    console.error('2FA verify-and-enable error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * POST /api/2fa/disable
 */
app.post('/api/2fa/disable', async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) return res.status(400).json({ error: 'Password is required' });

  let client;
  try {
    client = await pool.connect();
    const user = await resolveOrCreateUser(client, userId);

    const isValid = await AuthUtils.comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    await client.query(`DELETE FROM "TwoFactorAuth" WHERE "userId" = $1`, [
      user.id,
    ]);

    return res.json({ success: true, message: 'Two-factor authentication deleted from database successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * POST /api/auth/change-password
 */
app.post('/api/auth/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'User ID, current password, and new password are required.' });
  }

  let client;
  try {
    client = await pool.connect();
    const cleanId = (userId || '').trim();
    let userRes = await client.query(
      `SELECT * FROM "User" WHERE id = $1 OR LOWER(email) = LOWER($1) LIMIT 1`,
      [cleanId]
    );
    let user = userRes.rows[0];

    if (!user) {
      user = await resolveOrCreateUser(client, cleanId);
    }

    const isValid = await AuthUtils.comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect. Please enter your valid current password.' });
    }

    const newHash = await AuthUtils.hashPassword(newPassword);
    await client.query(`UPDATE "User" SET "password" = $1, "updatedAt" = NOW() WHERE "id" = $2`, [newHash, user.id]);

    return res.json({ success: true, message: 'Password updated successfully in PostgreSQL database.' });
  } catch (err: any) {
    console.error('Change password error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * GET /api/transactions
 * Fetch all inbound remittance transactions from PostgreSQL
 */
app.get('/api/transactions', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM "InboundTransaction" ORDER BY "valueDate" DESC`
    );

    const transactions = result.rows.map((row) => ({
      id: row.id,
      transactionRef: row.transactionRef,
      senderName: row.senderName,
      senderCountry: row.senderCountry,
      sendingBank: row.sendingBank,
      sendingBankBic: row.sendingBankBic,
      currency: row.currency,
      amount: row.amount,
      exchangeRate: row.exchangeRate,
      convertedAmountMmk: row.convertedAmountMmk,
      feeAmount: row.feeAmount,
      netAmountMmk: row.netAmountMmk,
      valueDate: row.valueDate.toISOString(),
      status: row.status,
      statusMessage: row.statusMessage,
      purpose: row.purpose,
      beneficiaryAccount: row.beneficiaryAccount,
      swiftMetadata: typeof row.swiftMetadata === 'string' ? JSON.parse(row.swiftMetadata) : row.swiftMetadata || {},
    }));

    return res.json({ success: true, transactions, count: transactions.length });
  } catch (err: any) {
    console.error('Get transactions error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * GET /api/transactions/:id
 */
app.get('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM "InboundTransaction" WHERE id = $1 OR "transactionRef" = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    const row = result.rows[0];
    const tx = {
      id: row.id,
      transactionRef: row.transactionRef,
      senderName: row.senderName,
      senderCountry: row.senderCountry,
      sendingBank: row.sendingBank,
      sendingBankBic: row.sendingBankBic,
      currency: row.currency,
      amount: row.amount,
      exchangeRate: row.exchangeRate,
      convertedAmountMmk: row.convertedAmountMmk,
      feeAmount: row.feeAmount,
      netAmountMmk: row.netAmountMmk,
      valueDate: row.valueDate.toISOString(),
      status: row.status,
      statusMessage: row.statusMessage,
      purpose: row.purpose,
      beneficiaryAccount: row.beneficiaryAccount,
      swiftMetadata: typeof row.swiftMetadata === 'string' ? JSON.parse(row.swiftMetadata) : row.swiftMetadata || {},
    };
    return res.json({ success: true, transaction: tx });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * POST /api/transactions/simulate
 * Create a new simulated inbound transaction in PostgreSQL
 */
app.post('/api/transactions/simulate', async (req, res) => {
  const tx = req.body;
  if (!tx || !tx.amount || !tx.currency) {
    return res.status(400).json({ error: 'Valid transaction data is required' });
  }

  let client;
  try {
    client = await pool.connect();
    const txId = tx.id || `tx-${Date.now()}`;
    const txRef = tx.transactionRef || `IR-2026-SIM-${Math.floor(100000 + Math.random() * 900000)}`;
    const valueDate = tx.valueDate ? new Date(tx.valueDate) : new Date();

    const insertRes = await client.query(
      `INSERT INTO "InboundTransaction" (
        "id", "transactionRef", "senderName", "senderCountry", "sendingBank", "sendingBankBic",
        "currency", "amount", "exchangeRate", "convertedAmountMmk", "feeAmount", "netAmountMmk",
        "valueDate", "status", "statusMessage", "purpose", "beneficiaryAccount", "swiftMetadata", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
      RETURNING *`,
      [
        txId,
        txRef,
        tx.senderName || 'Global Remittance Partner Ltd',
        tx.senderCountry || 'Singapore',
        tx.sendingBank || 'DBS Bank Ltd',
        tx.sendingBankBic || 'DBSSSGSG',
        tx.currency,
        Number(tx.amount),
        Number(tx.exchangeRate || 3550),
        Number(tx.convertedAmountMmk || tx.amount * (tx.exchangeRate || 3550)),
        Number(tx.feeAmount || 0),
        Number(tx.netAmountMmk || tx.convertedAmountMmk || tx.amount * (tx.exchangeRate || 3550)),
        valueDate,
        tx.status || 'Completed',
        tx.statusMessage || null,
        tx.purpose || 'Commercial Remittance Clearing',
        tx.beneficiaryAccount || '0091-2384-992019',
        JSON.stringify(tx.swiftMetadata || {}),
      ]
    );

    return res.status(201).json({ success: true, transaction: insertRes.rows[0] });
  } catch (err: any) {
    console.error('Simulate transaction error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * GET /api/fx-rates
 * Source: Central Bank of Myanmar API (https://forex.cbm.gov.mm/api/latest)
 */
app.get('/api/fx-rates', async (req, res) => {
  const targetCurrencies = ['USD', 'EUR', 'SGD', 'THB', 'GBP', 'JPY', 'CNY', 'MYR'];
  const cbmApiUrl = process.env.CBM_FOREX_API_URL || 'https://forex.cbm.gov.mm/api/latest';

  const parseRate = (value: string | number | undefined) => {
    if (value === undefined || value === null) return null;
    const parsed = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  };

  let client;
  try {
    const cbmResp = await fetch(cbmApiUrl);
    if (!cbmResp.ok) {
      throw new Error(`CBM FX API returned ${cbmResp.status}`);
    }

    const cbmData: any = await cbmResp.json();
    const ratesMap = cbmData?.rates || {};
    const ts = cbmData?.timestamp ? new Date(Number(cbmData.timestamp) * 1000).toISOString() : new Date().toISOString();

    const fxRates = targetCurrencies
      .map((currency) => {
        const middleRate = parseRate(ratesMap[currency]);
        if (!middleRate) return null;

        const spread = middleRate * 0.002;
        const buyRate = Math.round((middleRate - spread) * 100) / 100;
        const sellRate = Math.round((middleRate + spread) * 100) / 100;

        return {
          currency,
          buyRate,
          sellRate,
          middleRate: Math.round(middleRate * 100) / 100,
          change24h: 0,
          updatedAt: ts,
        };
      })
      .filter(Boolean);

    if (!fxRates.length) {
      throw new Error('No supported currency rates returned from CBM API');
    }

    client = await pool.connect();
    for (const rate of fxRates as any[]) {
      await client.query(
        `INSERT INTO "FxRate" ("id", "currency", "buyRate", "sellRate", "middleRate", "change24h", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT ("currency")
         DO UPDATE SET
           "buyRate" = EXCLUDED."buyRate",
           "sellRate" = EXCLUDED."sellRate",
           "middleRate" = EXCLUDED."middleRate",
           "change24h" = EXCLUDED."change24h",
           "updatedAt" = EXCLUDED."updatedAt"`,
        [`fx_${rate.currency.toLowerCase()}`, rate.currency, rate.buyRate, rate.sellRate, rate.middleRate, rate.change24h, rate.updatedAt]
      );
    }

    return res.json({ success: true, source: 'cbm', fxRates });
  } catch (err: any) {
    try {
      if (!client) client = await pool.connect();
      const result = await client.query(`SELECT * FROM "FxRate" ORDER BY "currency" ASC`);
      const rates = result.rows.map((row) => ({
        currency: row.currency,
        buyRate: row.buyrate ?? row.buyRate,
        sellRate: row.sellrate ?? row.sellRate,
        middleRate: row.middlerate ?? row.middleRate,
        change24h: row.change24h ?? 0,
        updatedAt: row.updatedat?.toISOString?.() || row.updatedAt?.toISOString?.() || new Date().toISOString(),
      }));
      return res.json({ success: true, source: 'database-fallback', fxRates: rates });
    } catch (dbErr: any) {
      return res.status(500).json({ error: err.message || dbErr.message });
    }
  } finally {
    if (client) client.release();
  }
});

/**
 * POST /api/database/migrate
 * Re-triggers table creation and seeding for all mock data
 */
app.post('/api/database/migrate', async (req, res) => {
  try {
    await seedDatabase();
    return res.json({ success: true, message: 'All tables migrated and mock data seeded into PostgreSQL.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
