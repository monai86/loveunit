import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export interface InvitationTokenRecord {
  tokenHash: string;
  expiresAt: Date;
  acceptedAt: Date | null;
}

export function createInvitationToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashInvitationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isInvitationUsable(record: InvitationTokenRecord, token: string, now = new Date()): boolean {
  if (record.acceptedAt || record.expiresAt <= now) return false;

  const received = Buffer.from(hashInvitationToken(token), 'hex');
  const expected = Buffer.from(record.tokenHash, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}
