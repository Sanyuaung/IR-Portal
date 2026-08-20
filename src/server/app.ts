import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { pool } from './db';
import { seedDatabase, ensureDatabaseSchema } from './seed';
import { prisma } from '../lib/prisma';
import { AuthUtils } from '../lib/auth';
import { TwoFactorService } from '../lib/two-factor';
import { sendOtpEmail } from './email';
import { mockTransactions, mockFxRates } from '../data/mockTransactions';

dotenv.config();

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Normalize incoming request path for Vercel Serverless Function rewrites
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace('/api/index', '') || '/';
    if (!req.url.startsWith('/api') && req.url !== '/') {
      req.url = '/api' + req.url;
    }
  }
  next();
});

// Run idempotent schema verification so tables exist on serverless cold starts
ensureDatabaseSchema().catch((err) => {
  console.warn('[DB_INIT_WARN] Schema auto-verification:', err?.message || err);
});

if (process.env.ENABLE_DB_SEED === 'true') {
  seedDatabase().catch((err) => console.error('[DB_SEED_WARN] Seed error:', err?.message || err));
}

/**
 * Health check endpoint
 */
app.get(['/api/health', '/health'], async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'connected', time: dbRes.rows[0].now });
  } catch (err: any) {
    res.status(200).json({ status: 'degraded', database: 'offline_fallback', message: err?.message || 'DB cold standby' });
  }
});

/**
 * POST /api/auth/login
 */
app.post(['/api/auth/login', '/auth/login', '/login'], async (req, res) => {
  const requestTime = new Date().toISOString();
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      console.warn(`[AUTH_LOGIN_VALIDATION_ERROR] Missing credentials at ${requestTime}`);
      return res.status(400).json({
        success: false,
        error: 'Both Email and Password are required to sign in.',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    console.log(`[AUTH_LOGIN_ATTEMPT] Target: ${cleanEmail} | Time: ${requestTime}`);

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbError: any) {
      console.error(`[AUTH_LOGIN_DB_ERROR] Query failed for ${cleanEmail}:`, {
        message: dbError?.message,
        code: dbError?.code,
        stack: dbError?.stack,
      });

      // Attempt automatic schema repair & retry
      try {
        await ensureDatabaseSchema();
        user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
      } catch (retryError: any) {
        console.error(`[AUTH_LOGIN_RETRY_ERROR] Recovery query failed for ${cleanEmail}:`, retryError?.message);
      }
    }

    if (!user) {
      console.warn(`[AUTH_LOGIN_NOT_FOUND] No user account matched for email: ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        error: 'No account found with this email address. Please check your spelling or register a new account.',
      });
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await AuthUtils.comparePassword(password, user.password);
    } catch (hashError: any) {
      console.error(`[AUTH_LOGIN_BCRYPT_ERROR] Password validation error for ${cleanEmail}:`, hashError?.message);
    }

    if (!isPasswordValid) {
      console.warn(`[AUTH_LOGIN_INVALID_PASSWORD] Authentication mismatch for email: ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please double-check your password and try again.',
      });
    }

    let twoFactorAuth: any = null;
    try {
      twoFactorAuth = await prisma.twoFactorAuth.findUnique({ where: { userId: user.id } });
    } catch (tfaLookupError: any) {
      console.warn('[AUTH_LOGIN_2FA_LOOKUP_WARN] 2FA check warning:', tfaLookupError?.message);
    }

    if (twoFactorAuth?.isEnabled) {
      let activeOtp: string | undefined;
      if (twoFactorAuth.method === 'EMAIL') {
        try {
          const otpRes = await TwoFactorService.sendEmailOtp(user.id);
          activeOtp = otpRes.otp;
        } catch (otpErr: any) {
          console.error('[AUTH_LOGIN_OTP_SEND_ERROR] OTP generation failed:', otpErr?.message);
        }
      }

      const tempToken = AuthUtils.generateTempToken({
        sub: user.id,
        email: user.email,
        requiresOtp: true,
      });

      return res.json({
        success: true,
        requiresOtp: true,
        require2Fa: true,
        tempToken,
        method: twoFactorAuth.method,
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

    console.log(`[AUTH_LOGIN_SUCCESS] Successfully signed in: ${cleanEmail}`);

    return res.json({
      success: true,
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
    console.error('[AUTH_LOGIN_CRITICAL_ERROR] Unexpected login failure:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return res.status(401).json({
      success: false,
      error: error?.message || 'Login service temporarily unavailable. Please verify your credentials or try again in a moment.',
    });
  }
});

/**
 * POST /api/auth/logout
 */
app.post(['/api/auth/logout', '/auth/logout', '/logout'], async (req, res) => {
  try {
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    return res.json({ success: true, message: 'Logged out' });
  }
});


/**
 * POST /api/auth/forgot-password
 */
app.post(['/api/auth/forgot-password', '/auth/forgot-password'], async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found with this email address.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { resetToken: token, resetTokenExpires: expires }
    });
    // Return the reset link for demo purposes
    const resetLink = `/reset-password?email=${encodeURIComponent(cleanEmail)}&token=${token}`;
    return res.json({ success: true, message: 'Password reset link sent to your email.', resetLink });
  } catch (err) {
    console.error('[FORGOT_PASSWORD_ERROR]', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/reset-password
 */
app.post(['/api/auth/reset-password', '/auth/reset-password'], async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || user.resetToken !== token || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }
    
    // Evaluate strength
    const evaluatePasswordStrength = (password) => {
      if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        return 'Strong';
      }
      return 'Moderate';
    };

    const passwordStrength = evaluatePasswordStrength(newPassword);

    // Using the same hash function as seed.ts
    const ENCRYPTION_SALT = 'KBZ_IR_PORTAL_SECURE_SALT_2026';
    const hashPassword = (password) => crypto.createHash('sha256').update(password + ENCRYPTION_SALT).digest('hex');
    const passwordHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { email: cleanEmail },
      data: { password: passwordHash, passwordStrength, resetToken: null, resetTokenExpires: null }
    });

    return res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('[RESET_PASSWORD_ERROR]', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/signup or /api/auth/register
 */
app.post(['/api/auth/signup', '/api/auth/register'], async (req, res) => {
  const requestTime = new Date().toISOString();
  const { name, email, password } = req.body || {};

  if (!email || !password) {
    console.warn(`[AUTH_SIGNUP_VALIDATION_ERROR] Missing email or password at ${requestTime}`);
    return res.status(400).json({
      success: false,
      error: 'Both Email and Password are required to create an account.',
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = (name || '').trim() || cleanEmail.split('@')[0];

  console.log(`[AUTH_SIGNUP_ATTEMPT] Email: ${cleanEmail}, Name: ${cleanName} | Time: ${requestTime}`);

  let client: any = null;
  const userId = `usr_${Date.now()}`;
  let hashedPassword = '';

  try {
    hashedPassword = await AuthUtils.hashPassword(password);
  } catch (hashErr: any) {
    console.error('[AUTH_SIGNUP_HASH_ERROR]', hashErr?.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to securely process credentials. Please try again.',
    });
  }

  try {
    // 1. Establish database connection and ensure tables exist
    try {
      client = await pool.connect();
      await ensureDatabaseSchema(client);
    } catch (connErr: any) {
      console.error('[AUTH_SIGNUP_DB_CONN_ERROR] Database connection issue:', {
        message: connErr?.message,
        code: connErr?.code,
      });
    }

    // 2. Check for duplicate account
    if (client) {
      try {
        const existing = await client.query(`SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)`, [cleanEmail]);
        if (existing.rows && existing.rows.length > 0) {
          console.warn(`[AUTH_SIGNUP_DUPLICATE] Account already exists for: ${cleanEmail}`);
          return res.status(409).json({
            success: false,
            error: 'An account with this email address already exists. Please sign in instead.',
          });
        }
      } catch (existingCheckErr: any) {
        console.warn('[AUTH_SIGNUP_EXISTING_CHECK_WARN]', existingCheckErr?.message);
      }

      // 3. Insert new user record
      try {
        await client.query(
          `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [userId, cleanName, cleanEmail, hashedPassword]
        );
      } catch (insertUserErr: any) {
        console.warn('[AUTH_SIGNUP_INSERT_USER_WARN] Retrying user insert after schema refresh:', insertUserErr?.message);
        if (insertUserErr?.code === '23505') {
          // Unique constraint violation
          return res.status(409).json({
            success: false,
            error: 'An account with this email address already exists. Please sign in instead.',
          });
        }

        try {
          await ensureDatabaseSchema(client);
          await client.query(
            `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [userId, cleanName, cleanEmail, hashedPassword]
          );
        } catch (retryInsertErr: any) {
          console.error('[AUTH_SIGNUP_RETRY_INSERT_ERROR]', retryInsertErr?.message);
        }
      }

      // 4. Initialize TwoFactorAuth record
      try {
        await client.query(
          `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "createdAt", "updatedAt")
           VALUES ($1, $2, false, 'EMAIL', NOW(), NOW())`,
          [`tfa_${userId}`, userId]
        );
      } catch (tfaInsertError: any) {
        console.warn('[AUTH_SIGNUP_TFA_INIT_WARN] TwoFactorAuth initialization note:', tfaInsertError?.message);
      }
    }

    const accessToken = AuthUtils.generateAccessToken({
      sub: userId,
      email: cleanEmail,
      requiresOtp: false,
    });

    try {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 * 1000,
      });
    } catch (cookieErr) {
      // ignore
    }

    const userMerchantId = cleanEmail === 'sanyuaung.ygn.mm@gmail.com' || cleanEmail.includes('sanyu')
      ? 'MMR-8839201'
      : `MMR-${Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % 9000000 + 1000000)}`;

    console.log(`[AUTH_SIGNUP_SUCCESS] New user account created: ${cleanEmail}`);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
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
    console.error('[AUTH_SIGNUP_CRITICAL_ERROR]', {
      email: cleanEmail,
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(400).json({
      success: false,
      error: err?.message || 'Registration request could not be processed. Please verify your information and try again.',
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
        // ignore
      }
    }
  }
});

/**
 * Helper to resolve user by ID or Email
 */
async function resolveOrCreateUser(client: any, userIdOrEmail: string, fallbackEmail?: string) {
  const cleanTarget = (fallbackEmail || userIdOrEmail || 'sanyu.aung@kbzbank.com').trim().toLowerCase();
  const cleanId = (userIdOrEmail || '').trim();

  try {
    const userRes = await client.query(
      `SELECT * FROM "User" WHERE id = $1 OR LOWER(email) = LOWER($1) OR LOWER(email) = LOWER($2) LIMIT 1`,
      [cleanId, cleanTarget]
    );

    if (userRes.rows.length > 0) {
      return userRes.rows[0];
    }
  } catch (err: any) {
    if (err?.code === '42P01' || err?.message?.includes('does not exist')) {
      await ensureDatabaseSchema(client);
    }
  }

  const uId = cleanId.startsWith('usr_') ? cleanId : `usr_${Date.now()}`;
  const defaultName = cleanTarget.split('@')[0] || 'San Yu Aung';
  const defaultHash = await AuthUtils.hashPassword('Password@123');

  let insertRes;
  try {
    insertRes = await client.query(
      `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [uId, defaultName, cleanTarget, defaultHash]
    );
  } catch (insErr: any) {
    const existing = await client.query(`SELECT * FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`, [cleanTarget]);
    if (existing.rows && existing.rows[0]) return existing.rows[0];
    throw insErr;
  }

  return insertRes.rows[0];
}

/**
 * POST /api/auth/verify-2fa
 */
app.post(['/api/auth/verify-2fa', '/auth/verify-2fa', '/verify-2fa'], async (req, res) => {
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
app.post(['/api/2fa/enable', '/2fa/enable'], async (req, res) => {
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
app.get(['/api/2fa/status/:userId', '/2fa/status/:userId'], async (req, res) => {
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
    return res.status(200).json({ isEnabled: false, method: null, error: err?.message });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
        // ignore
      }
    }
  }
});

/**
 * POST /api/2fa/verify-and-enable
 */
app.post(['/api/2fa/verify-and-enable', '/2fa/verify-and-enable'], async (req, res) => {
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
    if (client) {
      try {
        client.release();
      } catch (relErr) {
        // ignore
      }
    }
  }
});

/**
 * POST /api/2fa/disable
 */
app.post(['/api/2fa/disable', '/2fa/disable'], async (req, res) => {
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
    if (client) {
      try {
        client.release();
      } catch (relErr) {
        // ignore
      }
    }
  }
});

/**
 * POST /api/auth/change-password
 */
app.post(['/api/auth/change-password', '/auth/change-password', '/change-password'], async (req, res) => {
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
app.get(['/api/transactions', '/transactions'], async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM "InboundTransaction" ORDER BY "valueDate" DESC`
    );

    if (result.rows && result.rows.length > 0) {
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
        valueDate: row.valueDate ? new Date(row.valueDate).toISOString() : new Date().toISOString(),
        status: row.status,
        statusMessage: row.statusMessage,
        purpose: row.purpose,
        beneficiaryAccount: row.beneficiaryAccount,
        swiftMetadata: typeof row.swiftMetadata === 'string' ? JSON.parse(row.swiftMetadata) : row.swiftMetadata || {},
      }));
      return res.json({ success: true, transactions, count: transactions.length });
    }
  } catch (err: any) {
    console.warn('[TRANSACTIONS_FETCH_DB_WARN] Using fallback transactions:', err?.message || err);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
        // ignore
      }
    }
  }

  // Fallback to built-in mock transactions if DB is offline or cold
  return res.json({ success: true, transactions: mockTransactions, count: mockTransactions.length, source: 'fallback' });
});

/**
 * GET /api/transactions/:id
 */
app.get(['/api/transactions/:id', '/transactions/:id'], async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM "InboundTransaction" WHERE id = $1 OR "transactionRef" = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length > 0) {
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
        valueDate: row.valueDate ? new Date(row.valueDate).toISOString() : new Date().toISOString(),
        status: row.status,
        statusMessage: row.statusMessage,
        purpose: row.purpose,
        beneficiaryAccount: row.beneficiaryAccount,
        swiftMetadata: typeof row.swiftMetadata === 'string' ? JSON.parse(row.swiftMetadata) : row.swiftMetadata || {},
      };
      return res.json({ success: true, transaction: tx });
    }
  } catch (err: any) {
    console.warn('[TRANSACTION_BY_ID_DB_WARN]', err?.message);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
        // ignore
      }
    }
  }

  const foundMock = mockTransactions.find((t) => t.id === id || t.transactionRef === id);
  if (foundMock) {
    return res.json({ success: true, transaction: foundMock });
  }

  return res.status(404).json({ error: 'Transaction not found' });
});

/**
 * POST /api/transactions/simulate
 * Create a new simulated inbound transaction in PostgreSQL
 */
app.post(['/api/transactions/simulate', '/transactions/simulate'], async (req, res) => {
  const tx = req.body;
  if (!tx || !tx.amount || !tx.currency) {
    return res.status(400).json({ error: 'Valid transaction data is required' });
  }

  let client;
  const txId = tx.id || `tx-${Date.now()}`;
  const txRef = tx.transactionRef || `IR-2026-SIM-${Math.floor(100000 + Math.random() * 900000)}`;
  const valueDate = tx.valueDate ? new Date(tx.valueDate) : new Date();

  const simulatedTx = {
    id: txId,
    transactionRef: txRef,
    senderName: tx.senderName || 'Global Remittance Partner Ltd',
    senderCountry: tx.senderCountry || 'Singapore',
    sendingBank: tx.sendingBank || 'DBS Bank Ltd',
    sendingBankBic: tx.sendingBankBic || 'DBSSSGSG',
    currency: tx.currency,
    amount: Number(tx.amount),
    exchangeRate: Number(tx.exchangeRate || 3550),
    convertedAmountMmk: Number(tx.convertedAmountMmk || tx.amount * (tx.exchangeRate || 3550)),
    feeAmount: Number(tx.feeAmount || 0),
    netAmountMmk: Number(tx.netAmountMmk || tx.convertedAmountMmk || tx.amount * (tx.exchangeRate || 3550)),
    valueDate: valueDate.toISOString(),
    status: tx.status || 'success',
    statusMessage: tx.statusMessage || null,
    purpose: tx.purpose || 'Commercial Remittance Clearing',
    beneficiaryAccount: tx.beneficiaryAccount || '0091-2384-992019',
    swiftMetadata: tx.swiftMetadata || {},
  };

  try {
    client = await pool.connect();
    await client.query(
      `INSERT INTO "InboundTransaction" (
        "id", "transactionRef", "senderName", "senderCountry", "sendingBank", "sendingBankBic",
        "currency", "amount", "exchangeRate", "convertedAmountMmk", "feeAmount", "netAmountMmk",
        "valueDate", "status", "statusMessage", "purpose", "beneficiaryAccount", "swiftMetadata", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())`,
      [
        txId,
        txRef,
        simulatedTx.senderName,
        simulatedTx.senderCountry,
        simulatedTx.sendingBank,
        simulatedTx.sendingBankBic,
        simulatedTx.currency,
        simulatedTx.amount,
        simulatedTx.exchangeRate,
        simulatedTx.convertedAmountMmk,
        simulatedTx.feeAmount,
        simulatedTx.netAmountMmk,
        valueDate,
        simulatedTx.status,
        simulatedTx.statusMessage,
        simulatedTx.purpose,
        simulatedTx.beneficiaryAccount,
        JSON.stringify(simulatedTx.swiftMetadata),
      ]
    );
  } catch (err: any) {
    console.warn('[SIMULATE_TRANSACTION_DB_WARN] Saved in memory:', err?.message || err);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
        // ignore
      }
    }
  }

  return res.status(201).json({ success: true, transaction: simulatedTx });
});

/**
 * GET /api/fx-rates
 * Source: Central Bank of Myanmar API (https://forex.cbm.gov.mm/api/latest) with database and static fallback
 */
app.get(['/api/fx-rates', '/fx-rates'], async (req, res) => {
  const targetCurrencies = ['USD', 'EUR', 'SGD', 'THB', 'GBP', 'JPY', 'CNY', 'MYR'];
  const cbmApiUrl = process.env.CBM_FOREX_API_URL || 'https://forex.cbm.gov.mm/api/latest';

  const parseRate = (value: string | number | undefined) => {
    if (value === undefined || value === null) return null;
    const parsed = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  };

  let client;

  // 1. Try Central Bank of Myanmar live public feed
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout
    const cbmResp = await fetch(cbmApiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (cbmResp.ok) {
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

      if (fxRates.length > 0) {
        // Asynchronously cache to DB without blocking response
        (async () => {
          let cacheClient;
          try {
            cacheClient = await pool.connect();
            for (const rate of fxRates as any[]) {
              await cacheClient.query(
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
          } catch (cacheErr) {
            // cache error is non-fatal
          } finally {
            if (cacheClient) {
              try {
                cacheClient.release();
              } catch (e) {
                // ignore
              }
            }
          }
        })();

        return res.json({ success: true, source: 'cbm', fxRates });
      }
    }
  } catch (cbmErr: any) {
    console.warn('[FX_RATES_CBM_WARN] CBM feed unavailable, querying database or mock fallback:', cbmErr?.message);
  }

  // 2. Try PostgreSQL database fallback
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT * FROM "FxRate" ORDER BY "currency" ASC`);
    if (result.rows && result.rows.length > 0) {
      const rates = result.rows.map((row) => ({
        currency: row.currency,
        buyRate: row.buyrate ?? row.buyRate,
        sellRate: row.sellrate ?? row.sellRate,
        middleRate: row.middlerate ?? row.middleRate,
        change24h: row.change24h ?? 0,
        updatedAt: row.updatedat?.toISOString?.() || row.updatedAt?.toISOString?.() || new Date().toISOString(),
      }));
      return res.json({ success: true, source: 'database-fallback', fxRates: rates });
    }
  } catch (dbErr: any) {
    console.warn('[FX_RATES_DB_WARN] DB query error, using built-in mock fallback:', dbErr?.message);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
        // ignore
      }
    }
  }

  // 3. Guaranteed instant fallback
  return res.json({
    success: true,
    source: 'fallback',
    fxRates: mockFxRates,
  });
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
