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
 * Format:
 * - Online: LVU26-XXX (e.g. LVU26-001, LVU26-002, LVU26-100)
 * - Walk-in: LVU26-WXXX (e.g. LVU26-W001, LVU26-W002, LVU26-W100)
 */
export function generateRegistrationCode(seq?: number, source?: 'ONLINE' | 'WALK_IN' | 'ADMIN' | string): string {
  const isWalkIn = source === 'WALK_IN';
  const prefix = isWalkIn ? 'LVU26-W' : 'LVU26-';
  if (typeof seq === 'number' && seq > 0) {
    const padded = String(seq).padStart(3, '0');
    return `${prefix}${padded}`;
  }
  // Fallback if no seq provided: generate random 3-digit number
  const randomNum = Math.floor(1 + Math.random() * 999);
  return `${prefix}${String(randomNum).padStart(3, '0')}`;
}

/** Returns the next sequence after the largest existing event registration code for the given source. */
export function nextRegistrationSequence(codes: string[], source: 'ONLINE' | 'WALK_IN' | 'ADMIN' | string = 'ONLINE'): number {
  const isWalkIn = source === 'WALK_IN';
  const regex = isWalkIn ? /^LVU26-W(\d+)$/i : /^LVU26-(?!W)(\d+)$/i;
  const largest = codes.reduce((max, code) => {
    const match = code.match(regex);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return largest + 1;
}

/**
 * Determines whether the given date (or current time) falls on the MUMT LoveUnit event day (2026-09-16 in Bangkok timezone).
 */
export function isEventDay(date: Date = new Date()): boolean {
  try {
    const bangkokDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
    return bangkokDateStr === '2026-09-16';
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}` === '2026-09-16';
  }
}

/**
 * Extracts numeric queue number from a registration code (e.g. "LVU26-042" -> 42, "LVU26-W005" -> 5).
 */
export function extractQueueNumber(code: string): number | null {
  const match = code.match(/LVU26-W?(\d+)/i) || code.match(/MBD26-(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Checks if a code or record represents a Walk-in donor.
 */
export function isWalkInRecord(input?: { source?: string; registrationCode?: string; registration_code?: string } | string | null): boolean {
  if (!input) return false;
  if (typeof input === 'string') {
    return input.toUpperCase().includes('LVU26-W') || input.toUpperCase() === 'WALK_IN';
  }
  return (
    input.source === 'WALK_IN' ||
    (input.registrationCode?.toUpperCase().includes('LVU26-W') ?? false) ||
    (input.registration_code?.toUpperCase().includes('LVU26-W') ?? false)
  );
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
  completedAt?: string | Date | null;
  completed_at?: string | Date | null;
  slotEndAt?: string | Date | null;
  slot_end_at?: string | Date | null;
  timeSlot?: { endAt?: string | Date; end_at?: string | Date } | null;
  time_slot?: { endAt?: string | Date; end_at?: string | Date } | null;
}

export interface SouvenirEligibilityDetails {
  eligible: boolean;
  quotaType: 'ONLINE' | 'WALK_IN' | 'NONE';
  isPending?: boolean;
  rank?: number;
  quotaLimit: number;
  badgeText: string;
  subText: string;
  colorClass: string;
}

/**
 * Evaluates whether a given registration is eligible for the souvenir (default quota: 100 for online, 100 for walk-in).
 * 
 * Rules:
 * 1. ONLINE Donors (Quota: 100):
 *    - source === 'ONLINE'
 *    - status !== 'CANCELLED'
 *    - Checked in on-time (checkedInAt <= slot.endAt) or if not yet checked in, slot end time has not passed.
 *    - Ranked in top 100 on-time online registrations by sequence code.
 * 
 * 2. WALK-IN Donors (Quota: 100):
 *    - source === 'WALK_IN'
 *    - Sequence code does NOT determine priority.
 *    - Determined strictly by who completes donation first (status === 'COMPLETED').
 *    - Top 100 walk-ins with status === 'COMPLETED' sorted chronologically by completedAt.
 */
export function isRegistrationEligibleForSouvenir(
  targetReg: SouvenirCandidate,
  allCandidates: SouvenirCandidate[],
  quotaLimit = 100
): boolean {
  const getCode = (r: SouvenirCandidate) => r.registrationCode || r.registration_code || '';
  const getSource = (r: SouvenirCandidate) => r.source || (isWalkInRecord(getCode(r)) ? 'WALK_IN' : 'ONLINE');
  const getStatus = (r: SouvenirCandidate) => r.status || 'REGISTERED';
  const getCheckin = (r: SouvenirCandidate) => r.checkedInAt || r.checked_in_at || null;
  const getCompleted = (r: SouvenirCandidate) => r.completedAt || r.completed_at || r.checkedInAt || r.checked_in_at || null;
  const getSlotEnd = (r: SouvenirCandidate): string | Date | null => {
    if (r.slotEndAt) return r.slotEndAt;
    if (r.slot_end_at) return r.slot_end_at;
    const slot = r.timeSlot || r.time_slot;
    return slot ? (slot.endAt || slot.end_at || null) : null;
  };

  const isWalkIn = getSource(targetReg) === 'WALK_IN' || isWalkInRecord(getCode(targetReg));

  // --- Case A: Walk-in Donor Evaluation ---
  if (isWalkIn) {
    const targetStatus = getStatus(targetReg);
    // Walk-in souvenir is strictly awarded to donors who complete donation (COMPLETED)
    if (targetStatus !== 'COMPLETED') {
      return false;
    }

    // Filter all completed walk-in candidates and sort chronologically by completedAt
    const completedWalkIns = allCandidates.filter((r) => {
      const s = getSource(r);
      const isW = s === 'WALK_IN' || isWalkInRecord(getCode(r));
      return isW && getStatus(r) === 'COMPLETED';
    });

    completedWalkIns.sort((a, b) => {
      const timeA = new Date(getCompleted(a) || 0).getTime();
      const timeB = new Date(getCompleted(b) || 0).getTime();
      if (timeA !== timeB) return timeA - timeB;
      const seqA = extractQueueNumber(getCode(a)) ?? 999999;
      const seqB = extractQueueNumber(getCode(b)) ?? 999999;
      return seqA - seqB;
    });

    const targetIndex = completedWalkIns.findIndex((r) => r.id === targetReg.id);
    if (targetIndex === -1) return false;
    return targetIndex < quotaLimit;
  }

  // --- Case B: Online Donor Evaluation ---
  const isEligibleOnlineCandidate = (r: SouvenirCandidate): boolean => {
    const status = getStatus(r);
    if (status === 'CANCELLED') return false;
    const source = getSource(r);
    if (source !== 'ONLINE' && isWalkInRecord(getCode(r))) return false;

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

  if (!isEligibleOnlineCandidate(targetReg)) {
    return false;
  }

  // Filter all online candidates that are eligible, sort by queue number or sequence
  const eligibleOnlineList = allCandidates.filter(isEligibleOnlineCandidate);
  eligibleOnlineList.sort((a, b) => {
    const seqA = extractQueueNumber(getCode(a)) ?? 999999;
    const seqB = extractQueueNumber(getCode(b)) ?? 999999;
    return seqA - seqB;
  });

  const targetIndex = eligibleOnlineList.findIndex((r) => r.id === targetReg.id);
  if (targetIndex === -1) return false;

  return targetIndex < quotaLimit;
}

/**
 * Returns rich display metadata regarding souvenir eligibility for staff UI.
 */
export function getSouvenirEligibilityDetails(
  targetReg: SouvenirCandidate,
  allCandidates: SouvenirCandidate[],
  onlineQuota = 100,
  walkInQuota = 100
): SouvenirEligibilityDetails {
  const getCode = (r: SouvenirCandidate) => r.registrationCode || r.registration_code || '';
  const getSource = (r: SouvenirCandidate) => r.source || (isWalkInRecord(getCode(r)) ? 'WALK_IN' : 'ONLINE');
  const getStatus = (r: SouvenirCandidate) => r.status || 'REGISTERED';
  const getCompleted = (r: SouvenirCandidate) => r.completedAt || r.completed_at || r.checkedInAt || r.checked_in_at || null;

  const isWalkIn = getSource(targetReg) === 'WALK_IN' || isWalkInRecord(getCode(targetReg));

  if (isWalkIn) {
    const targetStatus = getStatus(targetReg);
    const completedWalkIns = allCandidates.filter((r) => {
      const isW = getSource(r) === 'WALK_IN' || isWalkInRecord(getCode(r));
      return isW && getStatus(r) === 'COMPLETED';
    });

    completedWalkIns.sort((a, b) => {
      const timeA = new Date(getCompleted(a) || 0).getTime();
      const timeB = new Date(getCompleted(b) || 0).getTime();
      if (timeA !== timeB) return timeA - timeB;
      const seqA = extractQueueNumber(getCode(a)) ?? 999999;
      const seqB = extractQueueNumber(getCode(b)) ?? 999999;
      return seqA - seqB;
    });

    const targetIndex = completedWalkIns.findIndex((r) => r.id === targetReg.id);

    if (targetStatus === 'COMPLETED') {
      if (targetIndex !== -1 && targetIndex < walkInQuota) {
        return {
          eligible: true,
          quotaType: 'WALK_IN',
          rank: targetIndex + 1,
          quotaLimit: walkInQuota,
          badgeText: `ได้รับของที่ระลึก Walk-in (ลำดับบริจาคเสร็จที่ #${targetIndex + 1}/${walkInQuota})`,
          subText: 'ผู้บริจาค Walk-in ที่บริจาคสำเร็จ 100 ท่านแรก',
          colorClass: 'from-purple-50 to-pink-50/40 border-purple-200 text-purple-950',
        };
      }
      return {
        eligible: false,
        quotaType: 'WALK_IN',
        rank: targetIndex !== -1 ? targetIndex + 1 : undefined,
        quotaLimit: walkInQuota,
        badgeText: `บริจาคสำเร็จ (เกินโควตา Walk-in ${walkInQuota} สิทธิ์แรก)`,
        subText: 'ครบโควตาของที่ระลึก Walk-in แล้ว',
        colorClass: 'from-gray-50 to-slate-50 border-gray-200 text-gray-700',
      };
    }

    // Not yet completed
    return {
      eligible: false,
      isPending: true,
      quotaType: 'WALK_IN',
      quotaLimit: walkInQuota,
      badgeText: `ผู้บริจาค Walk-in (โควตาของที่ระลึก 100 ท่านแรกที่บริจาคเสร็จ)`,
      subText: 'ตัดสินสิทธิ์ตามลำดับที่บริจาคเสร็จสมบูรณ์ (ไม่ใช่ลำดับรหัสลงทะเบียน)',
      colorClass: 'from-amber-50 to-orange-50/40 border-amber-200 text-amber-950',
    };
  }

  // Online Donor
  const isEligible = isRegistrationEligibleForSouvenir(targetReg, allCandidates, onlineQuota);
  if (isEligible) {
    return {
      eligible: true,
      quotaType: 'ONLINE',
      quotaLimit: onlineQuota,
      badgeText: `ได้รับของที่ระลึกออนไลน์ (100 สิทธิ์แรก)`,
      subText: 'ผู้บริจาคลงทะเบียนออนไลน์และเช็กอินตรงเวลาตามรอบนัดหมาย',
      colorClass: 'from-amber-50 to-orange-50/40 border-amber-200/80 text-amber-950',
    };
  }

  return {
    eligible: false,
    quotaType: 'ONLINE',
    quotaLimit: onlineQuota,
    badgeText: 'ไม่มีสิทธิ์รับของที่ระลึกออนไลน์',
    subText: 'ลงทะเบียนเกิน 100 สิทธิ์แรก หรือมาไม่ตรงรอบเวลา',
    colorClass: 'from-gray-50 to-slate-50 border-gray-200 text-gray-700',
  };
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
