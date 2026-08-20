import { pool } from '../server/db.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { sendOtpEmail } from '../server/email.js';

export class TwoFactorService {
  /**
   * Generates and stores a 6-digit email OTP for the user in Neon DB and sends real email via SMTP
   */
  public static async sendEmailOtp(userId: string, targetEmail?: string) {
    const client = await pool.connect();
    try {
      // Find user info if email not provided
      let email = targetEmail;
      let name = '';
      if (!email) {
        const uRes = await client.query(`SELECT email, name FROM "User" WHERE id = $1 OR email = $1`, [userId]);
        if (uRes.rows.length > 0) {
          email = uRes.rows[0].email;
          name = uRes.rows[0].name;
        }
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

      await client.query(
        `UPDATE "TwoFactorAuth"
         SET "emailOtp" = $1, "emailOtpExpiry" = $2, "updatedAt" = NOW()
         WHERE "userId" = $3`,
        [otp, expiry, userId]
      );

      // Send real email via Gmail SMTP
      if (email) {
        await sendOtpEmail(email, otp, name);
      }

      return {
        success: true,
        otp,
        expiry,
        message: `Security OTP sent to ${email || userId}`,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Verifies OTP or Google Authenticator TOTP code
   */
  public static async verifyCode(userId: string, code: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const res = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [userId]);
      const tfa = res.rows[0];
      if (!tfa || !tfa.isEnabled) return false;

      const cleanCode = code.trim().toUpperCase();

      if (tfa.method === 'GOOGLE_AUTH') {
        if (tfa.secret && cleanCode.length === 6) {
          const valid = speakeasy.totp.verify({
            secret: tfa.secret,
            encoding: 'base32',
            token: cleanCode,
            window: 6,
          });
          if (valid) return true;
        }

        // Backup codes
        if (tfa.backupCodes && tfa.backupCodes.includes(cleanCode)) {
          const remaining = tfa.backupCodes.filter((c: string) => c !== cleanCode);
          await client.query(`UPDATE "TwoFactorAuth" SET "backupCodes" = $1 WHERE "id" = $2`, [remaining, tfa.id]);
          return true;
        }
        return false;
      } else {
        // EMAIL OTP
        if (!tfa.emailOtp || !tfa.emailOtpExpiry || new Date() > new Date(tfa.emailOtpExpiry)) {
          return false;
        }
        const valid = tfa.emailOtp === cleanCode;
        if (valid) {
          await client.query(`UPDATE "TwoFactorAuth" SET "emailOtp" = NULL, "emailOtpExpiry" = NULL WHERE "id" = $1`, [
            tfa.id,
          ]);
        }
        return valid;
      }
    } finally {
      client.release();
    }
  }
}
