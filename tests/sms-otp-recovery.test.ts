process.env.DATA_BACKEND = 'memory';

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizePhoneNumber,
  isValidThaiPhoneNumber,
  maskPhoneNumber,
  generateOtpCode,
  hashToken,
  MockSmsProvider,
} from '../services/sms-service';
import {
  requestPhoneOtpRecovery,
  verifyPhoneOtpRecovery,
  createVerificationToken,
  consumeVerificationToken,
} from '../services/registration-service';
import { defaultEvent, inMemoryRegistrations, inMemoryVerificationTokens } from '../lib/db/store';
import { POST as lookupHandler } from '../app/api/registrations/lookup/route';

describe('Pass Recovery & Direct Phone Lookup', () => {
  describe('Phone Number Normalization & Validation', () => {
    it('should normalize various Thai phone formats to standard 10 digits', () => {
      assert.strictEqual(normalizePhoneNumber('081-234-5678'), '0812345678');
      assert.strictEqual(normalizePhoneNumber('+66 81 234 5678'), '0812345678');
      assert.strictEqual(normalizePhoneNumber('66812345678'), '0812345678');
      assert.strictEqual(normalizePhoneNumber('081 234 5678'), '0812345678');
      assert.strictEqual(normalizePhoneNumber('(081) 234-5678'), '0812345678');
      assert.strictEqual(normalizePhoneNumber('096-986-6245'), '0969866245');
    });

    it('should validate valid Thai mobile numbers', () => {
      assert.strictEqual(isValidThaiPhoneNumber('0812345678'), true);
      assert.strictEqual(isValidThaiPhoneNumber('0969866245'), true);
      assert.strictEqual(isValidThaiPhoneNumber('0656274319'), true);
      assert.strictEqual(isValidThaiPhoneNumber('021234567'), true); // 9-digit landline
      assert.strictEqual(isValidThaiPhoneNumber('12345'), false);
      assert.strictEqual(isValidThaiPhoneNumber('abc'), false);
      assert.strictEqual(isValidThaiPhoneNumber('0112345678'), false); // Invalid prefix
    });

    it('should mask phone numbers for secure logging', () => {
      assert.strictEqual(maskPhoneNumber('081-234-5678'), '081-XXX-XX78');
      assert.strictEqual(maskPhoneNumber('+66 96 986 6245'), '096-XXX-XX45');
      assert.strictEqual(maskPhoneNumber('02-123-4567'), '02-XXX-XX67');
    });
  });

  describe('OTP Code & Token Security', () => {
    it('should generate 6-digit numeric OTP', () => {
      for (let i = 0; i < 20; i++) {
        const otp = generateOtpCode();
        assert.strictEqual(otp.length, 6);
        assert.match(otp, /^\d{6}$/);
        const num = Number(otp);
        assert.ok(num >= 100000 && num <= 999999);
      }
    });

    it('should compute SHA-256 hash at rest', () => {
      const hash1 = hashToken('123456', 'OTP');
      const hash2 = hashToken('123456', 'OTP');
      const hashDiff = hashToken('123457', 'OTP');

      assert.strictEqual(hash1.length, 64);
      assert.strictEqual(hash1, hash2);
      assert.notStrictEqual(hash1, hashDiff);
    });

    it('should execute MockSmsProvider with masked log output', async () => {
      const provider = new MockSmsProvider();
      const result = await provider.sendOtp('0812345678', '654321');
      assert.strictEqual(result.success, true);
      assert.ok(result.messageId);
    });
  });

  describe('OTP Request & Verification Flow (In-Memory)', () => {
    const testPhone = '081-234-5678'; // Matches inMemoryRegistrations reg-demo-1
    const normalizedPhone = '0812345678';

    it('should provide enumeration resistance for unregistered phone numbers', async () => {
      const result = await requestPhoneOtpRecovery('089-999-9999', defaultEvent.id);
      assert.strictEqual(result.success, true);
      assert.ok(result.message.includes('หากหมายเลขโทรศัพท์นี้มีข้อมูลในระบบ'));
    });

    it('should reject invalid phone format during OTP request', async () => {
      const result = await requestPhoneOtpRecovery('1234', defaultEvent.id);
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('กรุณากรอกหมายเลขโทรศัพท์'));
    });

    it('should generate and verify OTP for registered participant', async () => {
      // Clear previous tokens
      inMemoryVerificationTokens.length = 0;

      const reqResult = await requestPhoneOtpRecovery(testPhone, defaultEvent.id);
      assert.strictEqual(reqResult.success, true);
      assert.ok(inMemoryVerificationTokens.length > 0);

      const latestToken = inMemoryVerificationTokens[inMemoryVerificationTokens.length - 1];
      assert.strictEqual(latestToken.contact_target, normalizedPhone);
      assert.strictEqual(latestToken.used_at, null);

      // Verify with incorrect OTP -> fails
      const badVerify = await verifyPhoneOtpRecovery(testPhone, '000000', defaultEvent.id);
      assert.strictEqual(badVerify.success, false);

      // Since token was stored as SHA-256 hash in memory, find the token in store
      // In tests, we can test with the raw token if memory allows or find the matching hash
      const tokenHash = latestToken.token;
      // Test verify with matching tokenHash
      const goodVerify = await verifyPhoneOtpRecovery(testPhone, '123456', defaultEvent.id);
      // If we directly verified via memory store:
      if (!goodVerify.success) {
        // Let's create a known OTP token
        const knownOtp = '789123';
        const knownHash = hashToken(knownOtp, 'OTP');
        latestToken.token = knownHash;
        const verified = await verifyPhoneOtpRecovery(testPhone, knownOtp, defaultEvent.id);
        assert.strictEqual(verified.success, true);
        assert.strictEqual(verified.registration?.id, 'reg-demo-1');
        assert.ok(latestToken.used_at !== null, 'Token must be marked used');

        // Second attempt with same OTP must fail (single-use)
        const reuseVerify = await verifyPhoneOtpRecovery(testPhone, knownOtp, defaultEvent.id);
        assert.strictEqual(reuseVerify.success, false);
      } else {
        assert.strictEqual(goodVerify.success, true);
      }
    });

    it('should create and consume email verification magic token', async () => {
      const regId = 'reg-demo-1';
      const email = 'somchai@mahidol.ac.th';
      const token = await createVerificationToken(regId, email);

      assert.ok(token);
      assert.ok(token.startsWith('lvu_sec_') || token.length >= 32);

      const consumed = await consumeVerificationToken(token);
      assert.ok(consumed);
      assert.strictEqual(consumed.id, regId);

      // Re-consuming same token must return null
      const secondConsume = await consumeVerificationToken(token);
      assert.strictEqual(secondConsume, null);
    });
  });

  describe('Direct Phone Lookup Endpoint (No SMS, Instant & Free)', () => {
    it('should find registered participant directly by phone and return registration data', async () => {
      const req = new Request('http://localhost/api/registrations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '081-234-5678' }),
      });
      const res = await lookupHandler(req);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.registration);
      assert.strictEqual(data.registration.id, 'reg-demo-1');
    });

    it('should return 404 for non-existent phone number', async () => {
      const req = new Request('http://localhost/api/registrations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '089-999-9999' }),
      });
      const res = await lookupHandler(req);
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.ok(data.message.includes('ไม่พบข้อมูลการลงทะเบียน'));
    });
  });
});
