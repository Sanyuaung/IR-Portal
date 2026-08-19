import CryptoJS from 'crypto-js';

// Secret salt for client-side password transmission encryption
const ENCRYPTION_SALT = 'KBZ_IR_PORTAL_SECURE_SALT_2026';

/**
 * Encrypts password using SHA-256 with salt before state submission
 */
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password + ENCRYPTION_SALT).toString(CryptoJS.enc.Hex);
}

/**
 * Generates AES encrypted payload for secure mock transmission
 */
export function encryptPayload(data: object): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_SALT).toString();
}

/**
 * Generates a valid Base32 secret string compatible with Google Authenticator / standard TOTP apps (16 uppercase chars)
 */
export function generateMockTotpSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(array[i] % chars.length);
    }
  } else {
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}

/**
 * RFC 4648 Base32 decoder to Uint8Array for RFC 6238 TOTP calculation
 */
export function base32Decode(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = (base32 || '').toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
      value &= (1 << bits) - 1;
    }
  }
  return new Uint8Array(output);
}

/**
 * Generates exact RFC 6238 6-digit TOTP token using HMAC-SHA1
 */
export async function generateTotpCode(secretBase32: string, timestampMs = Date.now()): Promise<string> {
  try {
    const keyBytes = base32Decode(secretBase32);
    if (keyBytes.length === 0) return '000000';

    const epochSeconds = Math.floor(timestampMs / 1000);
    const counter = Math.floor(epochSeconds / 30);

    // 8-byte big endian buffer for counter (RFC 4226)
    const counterBuffer = new Uint8Array(8);
    let temp = counter;
    for (let i = 7; i >= 0; i--) {
      counterBuffer[i] = temp & 0xff;
      temp = Math.floor(temp / 256);
    }

    // Import key for HMAC-SHA1 using Web Crypto API
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
    const hmacBytes = new Uint8Array(signature);

    // Dynamic truncation (RFC 4226)
    const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
    const binary =
      ((hmacBytes[offset] & 0x7f) << 24) |
      ((hmacBytes[offset + 1] & 0xff) << 16) |
      ((hmacBytes[offset + 2] & 0xff) << 8) |
      (hmacBytes[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (err) {
    console.error('TOTP calculation error:', err);
    return '000000';
  }
}

/**
 * Real RFC 6238 TOTP verification with time-drift tolerance (windows ±1 to ±6 steps, i.e., ±180s)
 */
export async function verifyTotpToken(secretBase32: string, token: string): Promise<boolean> {
  if (!token || token.trim().length !== 6) return false;
  const cleanToken = token.trim();
  const now = Date.now();

  // Test current window (0) and extended tolerance windows (±30s to ±180s)
  const windows = [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6];

  for (const w of windows) {
    const expected = await generateTotpCode(secretBase32, now + w * 30000);
    if (expected === cleanToken) {
      return true;
    }
  }
  return false;
}
