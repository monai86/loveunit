import { ParticipantType, DonationExperience, RegistrationStatus } from '@/lib/types/database';

/**
 * Reads a field that may exist under a camelCase or snake_case key (dual-shape
 * records from Drizzle vs. the in-memory store). Type-safe alternative to `as any`.
 */
export function pickField<T>(obj: unknown, camelKey: string, snakeKey: string): T | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const record = obj as Record<string, unknown>;
  const value = record[camelKey] ?? record[snakeKey];
  return value as T | undefined;
}

/** Normalizes an unknown thrown value into a readable message. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return String(err ?? '');
}

/**
 * Normalizes a Thai phone number for duplicate checking.
 * e.g., "081-234-5678" -> "0812345678"
 * e.g., "+66 81 234 5678" -> "0812345678"
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('66')) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Generates a sequential running registration code.
 * Format: LVU26-XXX (e.g. LVU26-001, LVU26-002, LVU26-100)
 */
export function generateRegistrationCode(seq?: number): string {
  if (typeof seq === 'number' && seq > 0) {
    const padded = String(seq).padStart(3, '0');
    return `LVU26-${padded}`;
  }
  // Fallback if no seq provided: generate random 3-digit number
  const randomNum = Math.floor(1 + Math.random() * 999);
  return `LVU26-${String(randomNum).padStart(3, '0')}`;
}

/** Returns the next sequence after the largest existing event registration code. */
export function nextRegistrationSequence(codes: string[]): number {
  const largest = codes.reduce((max, code) => {
    const match = code.match(/^LVU26-(\d+)$/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return largest + 1;
}

/**
 * Extracts numeric queue number from a registration code (e.g. "LVU26-042" -> 42).
 */
export function extractQueueNumber(code: string): number | null {
  const match = code.match(/LVU26-(\d+)/i) || code.match(/MBD26-(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Generates a random opaque QR token for secure server-side validation using cryptographically secure randomness.
 * No PII (personally identifiable information) is stored inside the QR code.
 */
export function generateQRToken(registrationCode: string): string {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);
  return `LVU26_QR_${registrationCode}_${uuid.replace(/-/g, '')}`;
}

/**
 * Formats a Date object or ISO string into Thai date string in Bangkok timezone.
 * e.g., "18 กันยายน 2569"
 */
export function formatThaiDate(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(d);

  const day = parts.find((p) => p.type === 'day')?.value || '1';
  const monthIdx = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10) - 1;
  const yearCE = parseInt(parts.find((p) => p.type === 'year')?.value || '2026', 10);
  const yearBE = yearCE + 543;
  
  return `${day} ${thaiMonths[monthIdx] || ''} ${yearBE}`;
}

/**
 * Formats time range into HH:MM–HH:MM น. in Bangkok timezone.
 */
export function formatTimeRange(startIso: string, endIso: string): string {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(d);
    const hours = parts.find((p) => p.type === 'hour')?.value || '00';
    const mins = parts.find((p) => p.type === 'minute')?.value || '00';
    return `${hours}:${mins}`;
  };
  
  return `${formatTime(startIso)}–${formatTime(endIso)} น.`;
}

/**
 * Formats a Date object or ISO string into HH:MM น. in Bangkok timezone.
 * e.g., "09:15 น."
 */
export function formatBangkokTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const hours = parts.find((p) => p.type === 'hour')?.value || '00';
  const mins = parts.find((p) => p.type === 'minute')?.value || '00';
  return `${hours}:${mins} น.`;
}

/**
 * Checks whether a registration is on-time based on check-in time and time slot end time.
 * Strict rule: Must check in before or at the time slot's endAt.
 */
export function isCheckinOnTime(checkedInAt?: string | Date | null, slotEndAt?: string | Date | null): boolean {
  if (!checkedInAt || !slotEndAt) return false;
  const checkinTime = typeof checkedInAt === 'string' ? new Date(checkedInAt).getTime() : checkedInAt.getTime();
  const endTime = typeof slotEndAt === 'string' ? new Date(slotEndAt).getTime() : slotEndAt.getTime();
  if (isNaN(checkinTime) || isNaN(endTime)) return false;
  return checkinTime <= endTime;
}

export interface SouvenirCandidate {
  id: string;
  registrationCode?: string;
  registration_code?: string;
  source?: string;
  status?: string;
  checkedInAt?: string | Date | null;
  checked_in_at?: string | Date | null;
  slotEndAt?: string | Date | null;
  slot_end_at?: string | Date | null;
  timeSlot?: { endAt?: string | Date; end_at?: string | Date } | null;
  time_slot?: { endAt?: string | Date; end_at?: string | Date } | null;
}

/**
 * Evaluates whether a given registration is eligible for the souvenir (default quota: 100).
 * Rule:
 * 1. source === 'ONLINE' (registered online)
 * 2. status !== 'CANCELLED'
 * 3. Checked in on-time (checkedInAt <= slot.endAt) or if not yet checked in, slot end time has not passed yet.
 * 4. Ranked in top 100 on-time online registrations by sequence code.
 */
export function isRegistrationEligibleForSouvenir(
  targetReg: SouvenirCandidate,
  allCandidates: SouvenirCandidate[],
  quotaLimit = 100
): boolean {
  const getCode = (r: SouvenirCandidate) => r.registrationCode || r.registration_code || '';
  const getSource = (r: SouvenirCandidate) => r.source || 'ONLINE';
  const getStatus = (r: SouvenirCandidate) => r.status || 'REGISTERED';
  const getCheckin = (r: SouvenirCandidate) => r.checkedInAt || r.checked_in_at || null;
  const getSlotEnd = (r: SouvenirCandidate): string | Date | null => {
    if (r.slotEndAt) return r.slotEndAt;
    if (r.slot_end_at) return r.slot_end_at;
    const slot = r.timeSlot || r.time_slot;
    return slot ? (slot.endAt || slot.end_at || null) : null;
  };

  const isEligibleCandidate = (r: SouvenirCandidate): boolean => {
    const status = getStatus(r);
    if (status === 'CANCELLED') return false;
    const source = getSource(r);
    if (source !== 'ONLINE') return false;

    const checkin = getCheckin(r);
    const slotEnd = getSlotEnd(r);

    if (checkin) {
      if (!slotEnd) return true; // If no slot specified, default on-time
      return isCheckinOnTime(checkin, slotEnd);
    }

    if (status === 'COMPLETED' || status === 'IN_PROCESS' || status === 'CHECKED_IN') {
      return true;
    }

    // If not checked in yet and status is REGISTERED:
    if (status === 'REGISTERED') {
      if (!slotEnd) return true;
      // If slot end has already passed and they haven't checked in, they missed their slot
      return Date.now() <= new Date(slotEnd).getTime();
    }

    return false;
  };

  if (!isEligibleCandidate(targetReg)) {
    return false;
  }

  // Filter all candidates that are eligible, sort by queue number or sequence
  const eligibleList = allCandidates.filter(isEligibleCandidate);
  eligibleList.sort((a, b) => {
    const seqA = extractQueueNumber(getCode(a)) ?? 999999;
    const seqB = extractQueueNumber(getCode(b)) ?? 999999;
    return seqA - seqB;
  });

  const targetIndex = eligibleList.findIndex((r) => r.id === targetReg.id);
  if (targetIndex === -1) return false;

  return targetIndex < quotaLimit;
}

/**
 * Readable labels in Thai
 */
export function getParticipantTypeLabel(type: ParticipantType): string {
  switch (type) {
    case 'STUDENT':
      return 'นักศึกษามหาวิทยาลัยมหิดล';
    case 'STAFF':
      return 'บุคลากรมหาวิทยาลัยมหิดล';
    case 'GENERAL_PUBLIC':
      return 'บุคคลทั่วไป';
    default:
      return type;
  }
}

export function getDonationExperienceLabel(exp: DonationExperience): string {
  switch (exp) {
    case 'FIRST_TIME':
      return 'บริจาคครั้งแรก';
    case 'RETURNING':
      return 'เคยบริจาคแล้ว';
    default:
      return exp;
  }
}

export function getRegistrationStatusBadge(status: RegistrationStatus): { label: string; colorClass: string } {
  switch (status) {
    case 'REGISTERED':
      return { label: 'ลงทะเบียนแล้ว', colorClass: 'bg-amber-50 text-amber-800 border-amber-200' };
    case 'CHECKED_IN':
      return { label: 'เช็คอินแล้ว', colorClass: 'bg-blue-50 text-blue-800 border-blue-200' };
    case 'IN_PROCESS':
      return { label: 'กำลังบริจาค', colorClass: 'bg-purple-50 text-purple-800 border-purple-200' };
    case 'COMPLETED':
      return { label: 'บริจาคสำเร็จ · รับของที่ระลึกแล้ว', colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    case 'CANCELLED':
      return { label: 'ยกเลิกแล้ว', colorClass: 'bg-gray-100 text-gray-700 border-gray-200' };
    case 'NO_SHOW':
      return { label: 'ไม่ได้เข้าร่วม', colorClass: 'bg-rose-50 text-rose-800 border-rose-200' };
    default:
      return { label: status, colorClass: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
}

/** Human-readable Thai labels for common audit/checkin actions. */
export function formatActionLabel(action: string): string {
  const labels: Record<string, string> = {
    STATUS_CHANGE_CHECKED_IN: 'เช็คอิน (CHECKED IN)',
    STATUS_CHANGE_IN_PROCESS: 'เริ่มกระบวนการบริจาค',
    STATUS_CHANGE_COMPLETED: 'จบกระบวนการบริจาค',
    STATUS_CHANGE_CANCELLED: 'ยกเลิก',
    STATUS_CHANGE_NO_SHOW: 'ไม่มาตามนัด (NO SHOW)',
    STATUS_CHANGE_REGISTERED: 'ลงทะเบียน',
  };
  return labels[action] || action;
}

export function getStaffRoleLabel(role?: string): string {
  if (role === 'SUPER_ADMIN') return 'Super Admin';
  if (role === 'ADMIN') return 'Admin (ดูอย่างเดียว)';
  return 'Staff';
}
