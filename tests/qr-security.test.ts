process.env.DATA_BACKEND = 'memory';

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { inMemoryRegistrations } from '../lib/db/store';
import { POST as cancelHandler } from '../app/api/registrations/cancel/route';

describe('QR Token Authorization & Cancellation Boundary', () => {
  const demoReg = inMemoryRegistrations[0];

  it('should reject cancellation attempts using QR token without access token', async () => {
    const req = new Request('http://localhost/api/registrations/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationCode: demoReg.registration_code,
        qrToken: demoReg.qr_token,
      }),
    });

    const res = await cancelHandler(req);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('QR Token เป็นสิทธิ์สำหรับสแกนเช็กอินหน้างานเท่านั้น'));
  });

  it('should reject cancellation without access token or session', async () => {
    const req = new Request('http://localhost/api/registrations/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationCode: demoReg.registration_code,
      }),
    });

    const res = await cancelHandler(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  it('should reject cancellation when wrong access token is provided', async () => {
    const req = new Request('http://localhost/api/registrations/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationCode: demoReg.registration_code,
        token: 'lvu_sec_wrong_token_1234567890',
      }),
    });

    const res = await cancelHandler(req);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('สิทธิ์ไม่ถูกต้อง'));
  });
});
