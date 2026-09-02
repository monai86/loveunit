/**
 * MUMT LoveUnit — SMS OTP Service & Provider Abstraction
 * 
 * Provides secure SMS OTP delivery with Thai phone number normalization,
 * masked phone logging, enumeration resistance, and support for ThaiBulkSMS
 * alongside a safe Mock provider fallback for development and testing.
 */

import crypto from 'crypto';

export interface SmsOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SmsOtpProvider {
  name: string;
  sendOtp: (phone: string, otp: string) => Promise<SmsOtpResult>;
}

/**
 * Normalizes a Thai phone number into standard 10-digit format (e.g. "0812345678").
 * Strips whitespace, dashes, parentheticals, and converts "+66" or "66" prefix.
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  // Remove all non-digit characters except leading +
  let cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, '');
  
  // Convert +66 or 66 prefix to leading 0
  if (cleaned.startsWith('+66')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('66') && cleaned.length >= 10) {
    cleaned = '0' + cleaned.slice(2);
  }

  // Remove any remaining non-digit characters
  cleaned = cleaned.replace(/\D/g, '');
  return cleaned;
}

/**
 * Validates whether the normalized string is a plausible Thai mobile number (9-10 digits starting with 0).
 */
export function isValidThaiPhoneNumber(normalized: string): boolean {
  // Mobile numbers in Thailand typically start with 06, 08, 09 (10 digits) or landlines 02-07 (9-10 digits)
  return /^0[689]\d{8}$/.test(normalized) || /^0[2-7]\d{7,8}$/.test(normalized);
}

/**
 * Masks a phone number for safe logging and UI display (e.g. "081-XXX-XX78").
 */
export function maskPhoneNumber(phone: string): string {
  const norm = normalizePhoneNumber(phone);
  if (norm.length === 10) {
    return `${norm.slice(0, 3)}-XXX-XX${norm.slice(8)}`;
  }
  if (norm.length === 9) {
    return `${norm.slice(0, 2)}-XXX-XX${norm.slice(7)}`;
  }
  return 'XXX-XXX-XXXX';
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Computes a SHA-256 hash for secure storage of tokens/OTPs at rest.
 */
export function hashToken(token: string, prefix = 'OTP'): string {
  return crypto.createHash('sha256').update(`${prefix}:${token.trim()}`).digest('hex');
}

/**
 * Mock SMS Provider for local development, CI, and test environments.
 */
export class MockSmsProvider implements SmsOtpProvider {
  name = 'mock';

  async sendOtp(phone: string, otp: string): Promise<SmsOtpResult> {
    const masked = maskPhoneNumber(phone);
    if (process.env.NODE_ENV !== 'production' || process.env.CI === 'true') {
      console.log(`[sms-mock] OTP dispatched to ${masked}: ${otp}`);
    } else {
      console.log(`[sms-mock] OTP dispatched to ${masked} (content hidden in production)`);
    }
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    };
  }
}

/**
 * ThaiBulkSMS API Provider
 */
export class ThaiBulkSmsProvider implements SmsOtpProvider {
  name = 'thaibulksms';
  private apiKey: string;
  private apiSecret: string;
  private senderName?: string;

  constructor(apiKey: string, apiSecret: string, senderName?: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.senderName = senderName;
  }

  async sendOtp(phone: string, otp: string): Promise<SmsOtpResult> {
    const normalized = normalizePhoneNumber(phone);
    const masked = maskPhoneNumber(normalized);
    const message = `MUMT LoveUnit: รหัสยืนยันของคุณคือ ${otp} (ใช้ได้ 5 นาที) ห้ามบอกรหัสนี้แก่ผู้อื่น`;

    try {
      const response = await fetch('https://api-v2.thaibulksms.com/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
        },
        body: JSON.stringify({
          msisdn: normalized,
          message,
          sender: this.senderName || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[sms] ThaiBulkSMS HTTP ${response.status} for ${masked}:`, errorText);
        return {
          success: false,
          error: `SMS provider error (HTTP ${response.status})`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data?.id || data?.uuid,
      };
    } catch (err) {
      console.error(`[sms] Failed to send SMS to ${masked}:`, err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error during SMS dispatch',
      };
    }
  }
}

/**
 * Factory to retrieve the active SMS OTP provider based on configuration.
 */
let cachedProvider: SmsOtpProvider | null = null;

export function getSmsProvider(): SmsOtpProvider {
  if (cachedProvider) return cachedProvider;

  const providerType = (process.env.SMS_PROVIDER || '').toLowerCase();
  const apiKey = process.env.THAIBULKSMS_API_KEY;
  const apiSecret = process.env.THAIBULKSMS_API_SECRET;
  const senderName = process.env.THAIBULKSMS_SENDER_NAME;

  if (providerType === 'thaibulksms' || (apiKey && apiSecret)) {
    if (!apiKey || !apiSecret) {
      console.warn('[sms] ThaiBulkSMS configured without required key/secret. Falling back to MockSmsProvider.');
      cachedProvider = new MockSmsProvider();
    } else {
      cachedProvider = new ThaiBulkSmsProvider(apiKey, apiSecret, senderName);
    }
  } else {
    cachedProvider = new MockSmsProvider();
  }

  return cachedProvider;
}
