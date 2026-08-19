import crypto from 'crypto';

const ENCRYPTION_SALT = process.env.AUTH_SALT || 'KBZ_IR_PORTAL_SECURE_SALT_2026';
const JWT_SECRET = process.env.JWT_SECRET || 'KBZ_JWT_SECRET_SUPER_SECURE_KEY_2026';

export interface TokenPayload {
  sub: string;
  email: string;
  requiresOtp?: boolean;
  exp?: number;
  iat?: number;
}

export class AuthUtils {
  /**
   * Hashes plain text password with SHA-256 and secure salt
   */
  public static async hashPassword(password: string): Promise<string> {
    return crypto.createHash('sha256').update(password + ENCRYPTION_SALT).digest('hex');
  }

  /**
   * Compares plain password with stored hash
   */
  public static async comparePassword(plain: string, hash: string): Promise<boolean> {
    const hashed = await this.hashPassword(plain);
    return hashed === hash || hash === plain;
  }

  /**
   * Generates a temporary token for 2FA verification challenge
   */
  public static generateTempToken(payload: { sub: string; email: string; requiresOtp: boolean }): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60, // 10 minutes
      })
    ).toString('base64url');
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  /**
   * Generates a full access token for authenticated session
   */
  public static generateAccessToken(payload: { sub: string; email: string; requiresOtp: boolean }): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      })
    ).toString('base64url');
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  /**
   * Verifies and decodes a token
   */
  public static verifyToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');

      if (signature !== expectedSignature) return null;
      const decoded: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
      return decoded;
    } catch {
      return null;
    }
  }
}
