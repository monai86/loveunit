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
 * Supports simulation flags (NEXT_PUBLIC_FORCE_EVENT_DAY, query params, or localStorage) when called without an explicit date.
 */
export function isEventDay(date?: Date): boolean {
  if (date) {
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

  if (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_FORCE_EVENT_DAY === 'true' || process.env.FORCE_EVENT_DAY === 'true')) {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('eventDay') === 'true' || urlParams.get('mode') === 'walkin' || window.localStorage.getItem('FORCE_EVENT_DAY') === 'true') {
        return true;
      }
    } catch {}
  }

  const now = new Date();
  try {
    const bangkokDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    return bangkokDateStr === '2026-09-16';
  } catch {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
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
 * Evaluates whether a given registration is eligible for the souvenir under the fair 2-tier distribution model:
 * 
 * Total Event Souvenirs = 200 items (onlineQuota + onSiteQuota).
 * 
 * 1. Tier 1 (Online Top 100 Reserved: LVU26-001 to LVU26-100):
 *    - Must be an Online registration with numeric sequence <= 100.
 *    - Must not be CANCELLED.
 *    - Must check in on-time (checkedInAt <= slot.endAt). If not yet checked in, slot end time has not passed.
 *    - Receives guaranteed online souvenir upon completing donation.
 * 
 * 2. Spillover / Unclaimed Online Slots:
 *    - If any of LVU26-001..100 is CANCELLED, misses checkin time (late), or does not complete,
 *      that reserved spot automatically rolls over into the On-Site Souvenir Pool.
 * 
 * 3. Tier 2 (On-Site Pool: All Walk-in Donors + Online LVU26-101+):
 *    - Competes for the On-Site Souvenir Pool (Base 100 + Spillover from Tier 1).
 *    - Priority is determined strictly by CHRONOLOGICAL DONATION COMPLETION TIME (completedAt).
 *    - Who completes donation first gets the on-site souvenir first.
 */
export function isRegistrationEligibleForSouvenir(
  targetReg: SouvenirCandidate,
  allCandidates: SouvenirCandidate[],
  onlineQuota = 100,
  onSiteQuota = 100
): boolean {
  const getCode = (r: SouvenirCandidate) => r.registrationCode || r.registration_code || '';
  const getSource = (r: SouvenirCandidate) => r.source || (isWalkInRecord(getCode(r)) ? 'WALK_IN' : 'ONLINE');
  const getStatus = (r: SouvenirCandidate) => r.status || 'REGISTERED';
  const getCheckin = (r: SouvenirCandidate) => r.checkedInAt || r.checked_in_at || null;
  const getCompleted = (r: SouvenirCandidate) => r.completedAt || r.completed_at || null;
  const getSlotEnd = (r: SouvenirCandidate): string | Date | null => {
    if (r.slotEndAt) return r.slotEndAt;
    if (r.slot_end_at) return r.slot_end_at;
    const slot = r.timeSlot || r.time_slot;
    return slot ? (slot.endAt || slot.end_at || null) : null;
  };

  const isOnline = (r: SouvenirCandidate) => getSource(r) === 'ONLINE' && !isWalkInRecord(getCode(r));
  const getSeq = (r: SouvenirCandidate) => extractQueueNumber(getCode(r)) ?? 999999;

  // Helper to check if a Tier 1 online registration (001-100) is holding/consuming a reserved slot
  const isTier1Candidate = (r: SouvenirCandidate) => isOnline(r) && getSeq(r) <= onlineQuota;

  const isHoldingTier1Slot = (r: SouvenirCandidate): boolean => {
    if (!isTier1Candidate(r)) return false;
    const status = getStatus(r);
    if (status === 'CANCELLED') return false;
    const checkin = getCheckin(r);
    const slotEnd = getSlotEnd(r);
    if (checkin) {
      if (!slotEnd) return true;
      return isCheckinOnTime(checkin, slotEnd);
    }
    // If not checked in yet, only holds slot if slot end hasn't passed
    if (slotEnd) {
      return Date.now() <= new Date(slotEnd).getTime();
    }
    return true;
  };

  const targetStatus = getStatus(targetReg);
  const targetCheckin = getCheckin(targetReg);
  const targetSlotEnd = getSlotEnd(targetReg);

  // --- Case A: Target is Tier 1 Online (001 - 100) ---
  if (isTier1Candidate(targetReg)) {
    if (targetStatus === 'CANCELLED') return false;
    const isLate = Boolean(targetCheckin && targetSlotEnd && !isCheckinOnTime(targetCheckin, targetSlotEnd));
    if (!isLate) {
      if (targetStatus === 'COMPLETED' || targetStatus === 'CHECKED_IN') {
        return true;
      }
      if (targetStatus === 'REGISTERED') {
        if (!targetSlotEnd) return true;
        return Date.now() <= new Date(targetSlotEnd).getTime();
      }
      return false;
    }
  }

  // --- Case B: Target is Tier 2 (Walk-in OR Online 101+ OR Late Online 001-100) ---
  // Must be COMPLETED to claim an On-Site souvenir
  if (targetStatus !== 'COMPLETED') {
    return false;
  }

  // Calculate dynamic On-Site pool size: Total Event Quota - Active Tier 1 Slot Holders
  const activeTier1Holders = allCandidates.filter(isHoldingTier1Slot).length;
  const totalEventQuota = onlineQuota + onSiteQuota;
  const dynamicOnSitePoolSize = Math.max(onSiteQuota, totalEventQuota - activeTier1Holders);

  // Collect all Tier 2 candidates that have COMPLETED donation
  const completedTier2Candidates = allCandidates.filter((r) => {
    if (getStatus(r) !== 'COMPLETED') return false;
    if (getSource(r) === 'WALK_IN' || isWalkInRecord(getCode(r))) return true;
    if (isOnline(r)) {
      if (getSeq(r) > onlineQuota) return true;
      const chk = getCheckin(r);
      const slEnd = getSlotEnd(r);
      if (chk && slEnd && !isCheckinOnTime(chk, slEnd)) return true;
    }
    return false;
  });

  // Sort chronologically by completedAt, tie-break by registration code
  completedTier2Candidates.sort((a, b) => {
    const timeA = new Date(getCompleted(a) || getCheckin(a) || 0).getTime();
    const timeB = new Date(getCompleted(b) || getCheckin(b) || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return getSeq(a) - getSeq(b);
  });

  const targetIndex = completedTier2Candidates.findIndex((r) => r.id === targetReg.id);
  if (targetIndex === -1) return false;

  return targetIndex < dynamicOnSitePoolSize;
}

/**
 * Returns rich display metadata regarding souvenir eligibility for staff UI.
 */
export function getSouvenirEligibilityDetails(
  targetReg: SouvenirCandidate,
  allCandidates: SouvenirCandidate[],
  onlineQuota = 100,
  onSiteQuota = 100
): SouvenirEligibilityDetails {
  const getCode = (r: SouvenirCandidate) => r.registrationCode || r.registration_code || '';
  const getSource = (r: SouvenirCandidate) => r.source || (isWalkInRecord(getCode(r)) ? 'WALK_IN' : 'ONLINE');
  const getStatus = (r: SouvenirCandidate) => r.status || 'REGISTERED';
  const getCheckin = (r: SouvenirCandidate) => r.checkedInAt || r.checked_in_at || null;
  const getCompleted = (r: SouvenirCandidate) => r.completedAt || r.completed_at || null;
  const getSlotEnd = (r: SouvenirCandidate): string | Date | null => {
    if (r.slotEndAt) return r.slotEndAt;
    if (r.slot_end_at) return r.slot_end_at;
    const slot = r.timeSlot || r.time_slot;
    return slot ? (slot.endAt || slot.end_at || null) : null;
  };

  const isOnline = (r: SouvenirCandidate) => getSource(r) === 'ONLINE' && !isWalkInRecord(getCode(r));
  const getSeq = (r: SouvenirCandidate) => extractQueueNumber(getCode(r)) ?? 999999;
  const isTier1Candidate = (r: SouvenirCandidate) => isOnline(r) && getSeq(r) <= onlineQuota;

  const isHoldingTier1Slot = (r: SouvenirCandidate): boolean => {
    if (!isTier1Candidate(r)) return false;
    const status = getStatus(r);
    if (status === 'CANCELLED') return false;
    const checkin = getCheckin(r);
    const slotEnd = getSlotEnd(r);
    if (checkin) {
      if (!slotEnd) return true;
      return isCheckinOnTime(checkin, slotEnd);
    }
    if (slotEnd) {
      return Date.now() <= new Date(slotEnd).getTime();
    }
    return true;
  };

  const targetStatus = getStatus(targetReg);
  const targetCheckin = getCheckin(targetReg);
  const targetSlotEnd = getSlotEnd(targetReg);

  // --- Tier 1 Online (001 - 100) ---
  if (isTier1Candidate(targetReg)) {
    const isLate = Boolean(targetCheckin && targetSlotEnd && !isCheckinOnTime(targetCheckin, targetSlotEnd));
    if (!isLate && targetStatus !== 'CANCELLED') {
      const isEligible = isRegistrationEligibleForSouvenir(targetReg, allCandidates, onlineQuota, onSiteQuota);
      if (isEligible) {
        return {
          eligible: true,
          quotaType: 'ONLINE',
          quotaLimit: onlineQuota,
          badgeText: 'ได้รับของที่ระลึกออนไลน์ (100 สิทธิ์แรก)',
          subText: 'ผู้ลงทะเบียนออนไลน์ 100 ท่านแรกและเช็กอินตรงเวลาตามรอบนัดหมาย',
          colorClass: 'from-amber-50 to-orange-50/40 border-amber-200/80 text-amber-950',
        };
      }
    }
  }

  // --- Tier 2 (Walk-in and Online 101+) ---
  const activeTier1Holders = allCandidates.filter(isHoldingTier1Slot).length;
  const totalEventQuota = onlineQuota + onSiteQuota;
  const dynamicOnSitePoolSize = Math.max(onSiteQuota, totalEventQuota - activeTier1Holders);

  const completedTier2Candidates = allCandidates.filter((r) => {
    if (getStatus(r) !== 'COMPLETED') return false;
    if (getSource(r) === 'WALK_IN' || isWalkInRecord(getCode(r))) return true;
    if (isOnline(r)) {
      if (getSeq(r) > onlineQuota) return true;
      const chk = getCheckin(r);
      const slEnd = getSlotEnd(r);
      if (chk && slEnd && !isCheckinOnTime(chk, slEnd)) return true;
    }
    return false;
  });

  completedTier2Candidates.sort((a, b) => {
    const timeA = new Date(getCompleted(a) || getCheckin(a) || 0).getTime();
    const timeB = new Date(getCompleted(b) || getCheckin(b) || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return getSeq(a) - getSeq(b);
  });

  const targetIndex = completedTier2Candidates.findIndex((r) => r.id === targetReg.id);

  if (targetStatus === 'COMPLETED') {
    if (targetIndex !== -1 && targetIndex < dynamicOnSitePoolSize) {
      const isW = getSource(targetReg) === 'WALK_IN' || isWalkInRecord(getCode(targetReg));
      return {
        eligible: true,
        quotaType: isW ? 'WALK_IN' : 'ONLINE',
        rank: targetIndex + 1,
        quotaLimit: dynamicOnSitePoolSize,
        badgeText: `ได้รับของที่ระลึกหน้างาน (ลำดับบริจาคเสร็จที่ #${targetIndex + 1}/${dynamicOnSitePoolSize})`,
        subText: isW ? 'ผู้บริจาค Walk-in ที่บริจาคสำเร็จตามลำดับเวลา' : 'ผู้ลงทะเบียนออนไลน์ที่บริจาคสำเร็จในโควตาหน้างาน',
        colorClass: 'from-purple-50 to-pink-50/40 border-purple-200 text-purple-950',
      };
    }
    return {
      eligible: false,
      quotaType: 'NONE',
      rank: targetIndex !== -1 ? targetIndex + 1 : undefined,
      quotaLimit: dynamicOnSitePoolSize,
      badgeText: `บริจาคสำเร็จ (เกินโควตาของที่ระลึกหน้างาน ${dynamicOnSitePoolSize} สิทธิ์)`,
      subText: 'ครบโควตาของที่ระลึกแล้ว',
      colorClass: 'from-gray-50 to-slate-50 border-gray-200 text-gray-700',
    };
  }

  // Not yet completed
  const isW = getSource(targetReg) === 'WALK_IN' || isWalkInRecord(getCode(targetReg));
  return {
    eligible: false,
    isPending: true,
    quotaType: isW ? 'WALK_IN' : 'ONLINE',
    quotaLimit: dynamicOnSitePoolSize,
    badgeText: 'โควตาของที่ระลึกหน้างาน (นับตามลำดับที่บริจาคเสร็จสมบูรณ์)',
    subText: 'ตัดสินสิทธิ์ตามลำดับที่บริจาคเสร็จสมบูรณ์ (First Completed)',
    colorClass: 'from-amber-50 to-orange-50/40 border-amber-200 text-amber-950',
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
      return { label: 'บริจาคสำเร็จ (COMPLETED)', colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
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
