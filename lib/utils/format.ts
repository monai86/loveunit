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
 * Generates a unique user-friendly registration code.
 * Format: MBD26-XXXXXX (6 alphanumeric chars)
 */
export function generateRegistrationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(bytes[i] % chars.length);
    }
  } else {
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return `MBD26-${code}`;
}

/**
 * Generates a random opaque QR token for secure server-side validation using cryptographically secure randomness.
 * No PII (personally identifiable information) is stored inside the QR code.
 */
export function generateQRToken(registrationCode: string): string {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);
  return `MBD26_QR_${registrationCode}_${uuid.replace(/-/g, '')}`;
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

export function getStaffRoleLabel(_role?: string): string {
  return 'ผู้ดูแลระบบ (Admin)';
}
