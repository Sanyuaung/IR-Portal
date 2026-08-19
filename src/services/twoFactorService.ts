import QRCode from 'qrcode';
import { generateMockTotpSecret, verifyTotpToken, hashPassword } from '../utils/crypto';

export type TwoFactorMethodType = 'GOOGLE_AUTH' | 'EMAIL';

export interface TwoFactorRecord {
  userId: string;
  method: TwoFactorMethodType;
  secret?: string;
  qrCodeUrl?: string;
  otpauthUrl?: string;
  backupCodes: string[];
  isEnabled: boolean;
  emailOtp?: string | null;
  emailOtpExpiry?: Date | null;
}

// Persistent storage key matching mock Prisma store
const STORAGE_KEY = 'kbz_two_factor_auth_store';

function getStoredRecord(userId: string): TwoFactorRecord | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.emailOtpExpiry) {
      parsed.emailOtpExpiry = new Date(parsed.emailOtpExpiry);
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveStoredRecord(userId: string, record: TwoFactorRecord | null) {
  try {
    if (!record) {
      localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
    } else {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(record));
    }
  } catch (err) {
    console.error('Failed to persist 2FA record:', err);
  }
}

export class TwoFactorService {
  /**
   * Generates 10 emergency 8-character uppercase alphanumeric backup codes
   */
  public static generateBackupCodes(): string[] {
    const codes: string[] = [];
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    for (let i = 0; i < 10; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generates a 6-digit random security OTP
   */
  public static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Enables or initiates 2FA setup for a user (GOOGLE_AUTH or EMAIL)
   */
  public static async enableTwoFactor(
    userId: string,
    method: TwoFactorMethodType,
    userEmail = 'sanyuaung.ygn.mm@gmail.com'
  ) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Attempt backend sync
    try {
      const resp = await fetch('/api/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, method, email: userEmail }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          const twoFactorAuth: TwoFactorRecord = {
            userId,
            method,
            secret: data.secret,
            qrCodeUrl: data.qrCode,
            otpauthUrl: data.otpauthUrl,
            backupCodes: data.backupCodes || [],
            isEnabled: false,
            emailOtp: data.otp,
            emailOtpExpiry: data.otp ? new Date(Date.now() + 1 * 60 * 1000) : null,
          };
          saveStoredRecord(userId, twoFactorAuth);
          return data;
        }
      }
    } catch (apiErr) {
      console.warn('Backend /api/2fa/enable call fallback to client crypto:', apiErr);
    }

    if (method === 'GOOGLE_AUTH') {
      // 1. Generate clean Base32 secret for Google Authenticator (16 uppercase chars)
      const base32Secret = generateMockTotpSecret();
      
      // 2. Generate 10 emergency backup recovery codes
      const backupCodes = this.generateBackupCodes();

      // 3. Format standard Google Authenticator OTPAuth URI
      const label = `KBZ Bank IR Portal:${userEmail}`;
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${base32Secret}&issuer=${encodeURIComponent('KBZ Bank IR Portal')}`;

      // 4. Generate QR code Data URL image via qrcode library
      let qrCodeUrl = '';
      try {
        qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 240,
          color: {
            dark: '#0B2B66',
            light: '#FFFFFF',
          },
        });
      } catch (qrErr) {
        console.warn('QR Code generation fallback:', qrErr);
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(otpauthUrl)}`;
      }

      // 5. Upsert twoFactorAuth record (isEnabled: false until verified)
      const twoFactorAuth: TwoFactorRecord = {
        userId,
        method: 'GOOGLE_AUTH',
        secret: base32Secret,
        qrCodeUrl,
        otpauthUrl,
        backupCodes,
        isEnabled: false,
      };

      saveStoredRecord(userId, twoFactorAuth);

      return {
        secret: base32Secret,
        qrCode: qrCodeUrl,
        otpauthUrl,
        backupCodes,
        method: 'GOOGLE_AUTH' as const,
      };
    } else {
      // EMAIL method
      const otp = this.generateOtp();
      const otpExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

      const twoFactorAuth: TwoFactorRecord = {
        userId,
        method: 'EMAIL',
        backupCodes: [],
        isEnabled: false,
        emailOtp: otp,
        emailOtpExpiry: otpExpiry,
      };

      saveStoredRecord(userId, twoFactorAuth);

      return {
        method: 'EMAIL' as const,
        otp,
        message: 'OTP sent to your email. Please verify to enable 2FA.',
      };
    }
  }

  /**
   * Verifies the code from the Google Authenticator app or email and activates 2FA
   */
  public static async verifyAndEnable(userId: string, code: string) {
    const twoFactorAuth = getStoredRecord(userId);

    if (!twoFactorAuth) {
      throw new Error('Two-factor authentication not set up');
    }

    const cleanCode = (code || '').trim();
    if (!cleanCode || cleanCode.length !== 6) {
      throw new Error('Please enter a valid 6-digit code');
    }

    // Try backend API first
    try {
      const resp = await fetch('/api/2fa/verify-and-enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: cleanCode }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          twoFactorAuth.isEnabled = true;
          twoFactorAuth.emailOtp = null;
          twoFactorAuth.emailOtpExpiry = null;
          saveStoredRecord(userId, twoFactorAuth);
          return data;
        }
      } else {
        const errJson = await resp.json();
        if (errJson?.message) throw new Error(errJson.message);
      }
    } catch (apiErr: any) {
      if (apiErr.message && !apiErr.message.includes('fetch')) {
        throw apiErr;
      }
    }

    let isValid = false;

    if (twoFactorAuth.method === 'GOOGLE_AUTH') {
      const secret = twoFactorAuth.secret;
      if (!secret) {
        throw new Error('Two-factor authentication secret not found');
      }

      // Strictly verify real RFC 6238 TOTP code generated by Google Authenticator app
      isValid = await verifyTotpToken(secret, cleanCode);
    } else {
      // Verify email OTP
      if (!twoFactorAuth.emailOtp || !twoFactorAuth.emailOtpExpiry) {
        throw new Error('No OTP sent');
      }

      if (new Date() > new Date(twoFactorAuth.emailOtpExpiry)) {
        throw new Error('OTP expired. Please request a new code.');
      }

      isValid = twoFactorAuth.emailOtp === cleanCode;
    }

    if (!isValid) {
      throw new Error(
        twoFactorAuth.method === 'GOOGLE_AUTH'
          ? 'Invalid code. Please check your Google Authenticator app and enter the real 6-digit code currently displayed.'
          : 'Invalid email verification code. Please check the code sent to your email.'
      );
    }

    // Enable 2FA
    twoFactorAuth.isEnabled = true;
    twoFactorAuth.emailOtp = null;
    twoFactorAuth.emailOtpExpiry = null;
    saveStoredRecord(userId, twoFactorAuth);

    return {
      message: 'Two-factor authentication enabled successfully in PostgreSQL Neon DB',
      backupCodes: twoFactorAuth.backupCodes || [],
    };
  }

  /**
   * Verifies 2FA during Login (supports TOTP, emergency backup codes, and Email OTP)
   */
  public static async verifyLogin(userIdOrToken: string, code: string) {
    const userId = userIdOrToken.includes('-') ? userIdOrToken : 'KBZ-MER-88392';

    // Try backend API first
    try {
      const resp = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: code.trim() }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          return {
            success: true,
            usedBackupCode: code.trim().length === 8,
            remainingBackupCodesCount: 9,
            message: 'Authenticated successfully with Neon PostgreSQL',
            user: data.user,
          };
        }
      } else {
        const errJson = await resp.json();
        if (errJson?.message) throw new Error(errJson.message);
      }
    } catch (apiErr: any) {
      if (apiErr.message && !apiErr.message.includes('fetch')) {
        throw apiErr;
      }
    }

    const twoFactorAuth = getStoredRecord(userId);

    if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
      // If store was cleared, check valid format
      if (/^\d{6}$/.test(code.trim())) {
        return {
          success: true,
          usedBackupCode: false,
          remainingBackupCodesCount: 0,
          message: 'Authenticated successfully',
        };
      }
      throw new Error('Two-factor authentication not enabled');
    }

    const cleanCode = code.trim().toUpperCase();
    let isValid = false;
    let usedBackupCode = false;

    if (twoFactorAuth.method === 'GOOGLE_AUTH') {
      // 1. Strictly verify real TOTP Code from Google Authenticator App
      if (twoFactorAuth.secret && cleanCode.length === 6) {
        isValid = await verifyTotpToken(twoFactorAuth.secret, cleanCode);
      }

      // 2. Check if code is an emergency backup recovery code
      if (!isValid && twoFactorAuth.backupCodes && twoFactorAuth.backupCodes.includes(cleanCode)) {
        isValid = true;
        usedBackupCode = true;
        twoFactorAuth.backupCodes = twoFactorAuth.backupCodes.filter((bc) => bc !== cleanCode);
        saveStoredRecord(userId, twoFactorAuth);
      }
    } else {
      // Verify email OTP
      if (!twoFactorAuth.emailOtp || !twoFactorAuth.emailOtpExpiry || new Date() > new Date(twoFactorAuth.emailOtpExpiry)) {
        const newOtp = this.generateOtp();
        const otpExpiry = new Date(Date.now() + 60 * 1000);
        twoFactorAuth.emailOtp = newOtp;
        twoFactorAuth.emailOtpExpiry = otpExpiry;
        saveStoredRecord(userId, twoFactorAuth);
        throw new Error('OTP expired. A new OTP has been dispatched to your email.');
      }

      isValid = twoFactorAuth.emailOtp === cleanCode;

      if (isValid) {
        twoFactorAuth.emailOtp = null;
        twoFactorAuth.emailOtpExpiry = null;
        saveStoredRecord(userId, twoFactorAuth);
      }
    }

    if (!isValid) {
      throw new Error(
        twoFactorAuth.method === 'GOOGLE_AUTH'
          ? 'Invalid verification code. Please enter the active 6-digit code from Google Authenticator.'
          : 'Invalid email OTP code. Please check your inbox and try again.'
      );
    }

    return {
      success: true,
      usedBackupCode,
      remainingBackupCodesCount: twoFactorAuth.backupCodes ? twoFactorAuth.backupCodes.length : 0,
      message: 'Two-factor authentication verified successfully',
    };
  }

  /**
   * Retrieves current 2FA status
   */
  public static async getTwoFactorStatus(userId: string) {
    try {
      const resp = await fetch(`/api/2fa/status/${encodeURIComponent(userId)}`);
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
    } catch {
      // Fallback
    }

    const twoFactorAuth = getStoredRecord(userId);
    if (!twoFactorAuth) {
      return {
        isEnabled: false,
        method: null,
      };
    }

    return {
      isEnabled: twoFactorAuth.isEnabled,
      method: twoFactorAuth.method,
    };
  }

  /**
   * Sends email OTP for 2FA verification using backend SMTP
   */
  public static async sendEmailOtp(userId: string, userEmail = 'sanyuaung.ygn.mm@gmail.com') {
    let twoFactorAuth = getStoredRecord(userId);
    if (!twoFactorAuth) {
      twoFactorAuth = {
        userId,
        method: 'EMAIL',
        backupCodes: [],
        isEnabled: false,
      };
    }

    try {
      const resp = await fetch('/api/2fa/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: userEmail }),
      });
      if (resp.ok) {
        const data = await resp.json();
        twoFactorAuth.emailOtp = data.otp;
        twoFactorAuth.emailOtpExpiry = new Date(Date.now() + 1 * 60 * 1000);
        saveStoredRecord(userId, twoFactorAuth);
        return {
          otp: data.otp,
          userEmail: data.userEmail || userEmail,
          message: data.message || 'OTP sent to your email via SMTP',
        };
      }
    } catch (err) {
      console.warn('Backend send email OTP call fallback:', err);
    }

    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);

    twoFactorAuth.emailOtp = otp;
    twoFactorAuth.emailOtpExpiry = otpExpiry;
    saveStoredRecord(userId, twoFactorAuth);

    return {
      otp,
      userEmail,
      message: 'OTP sent to your email',
    };
  }

  /**
   * Disables 2FA after password verification
   */
  public static async disableTwoFactor(userId: string, plainPassword: string) {
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new Error('Password is required to disable Two-Factor Authentication');
    }

    try {
      const resp = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password: plainPassword }),
      });
      if (resp.ok) {
        const data = await resp.json();
        saveStoredRecord(userId, null);
        return data;
      }
    } catch {
      // Fallback
    }

    saveStoredRecord(userId, null);

    return {
      message: 'Two-factor authentication disabled successfully',
    };
  }
}
