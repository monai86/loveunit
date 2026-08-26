// In-Memory Data Access Layer with State Machine and Fail-Closed Production Storage
// Used ONLY for local development and automated tests when a real database is not configured.

import { 
  Event, 
  EventContentBlock, 
  TimeSlot, 
  Registration, 
  CheckinEvent, 
  AuditLog, 
  DashboardKPIs,
  ParticipantType,
  DonationExperience,
  RegistrationStatus,
  StaffProfile,
  StaffRole
} from '@/lib/types/database';
import { normalizePhoneNumber, generateRegistrationCode, generateQRToken } from '@/lib/utils/format';

// Collision-safe id generator for in-memory records. Date.now() alone collides
// when several records are created within the same millisecond (fast machines
// create the donor, waitlist entries, cancel + promotion all in one ms), which
// made id-based lookups return the wrong row.
let memoryIdSeq = 0;
function nextMemoryId(prefix: string): string {
  memoryIdSeq += 1;
  return `${prefix}-${Date.now()}-${memoryIdSeq}`;
}

/**
 * Memory backend is ONLY allowed when DATA_BACKEND=memory is explicitly set
 * or in non-production environments. In production it FAILS CLOSED.
 */
export function isMemoryBackendAllowed(): boolean {
  if (process.env.DATA_BACKEND === 'memory') return true;
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') return true;
  return false;
}

// ==========================================
// SINGLE SOURCE OF TRUTH — MUMT 2026 OFFICIAL EVENT METADATA
// ==========================================

export const defaultEvent: Event = {
  id: 'e1111111-1111-1111-1111-111111111111',
  slug: 'mumt-2026',
  name: 'MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”',
  short_name: 'MUMT Blood Donation 2026 (ครั้งที่ 9)',
  description: 'ขอเชิญชวนทุกคนมาร่วมเป็นส่วนหนึ่งในการส่งต่อโอกาสและช่วยเหลือผู้ป่วยที่ต้องการโลหิตในกิจกรรม “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ” ครั้งที่ 9 โดยคณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี เพียงการบริจาคโลหิตของคุณ 1 ครั้ง อาจช่วยต่อชีวิตใครอีกหลายคน ✨',
  start_at: '2026-09-16T09:00:00+07:00',
  end_at: '2026-09-16T14:00:00+07:00',
  venue_name: 'ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา',
  venue_detail: 'ห้องประชุม 217 ชั้น 2 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา',
  registration_open_at: '2026-08-01T00:00:00+07:00',
  registration_close_at: '2026-09-16T14:00:00+07:00',
  status: 'REGISTRATION_OPEN',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const defaultContentBlocks: EventContentBlock[] = [
  {
    id: 'cb-1',
    event_id: defaultEvent.id,
    content_key: 'hero_poster',
    title: 'โปสเตอร์ประชาสัมพันธ์โครงการ',
    description: 'โปสเตอร์หลัก MUMT Blood Donation 2026 ครั้งที่ 9',
    image_url: null,
    alt_text: 'โปสเตอร์หลัก MUMT Blood Donation 2026',
    display_order: 1,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb-2',
    event_id: defaultEvent.id,
    content_key: 'location_infographic',
    title: 'แผนที่สถานที่จัดงาน อาคารสิริวิทยา คณะศิลปศาสตร์',
    description: 'ผังห้องประชุม 217 ชั้น 2 อาคารสิริวิทยา',
    image_url: null,
    alt_text: 'แผนที่สถานที่จัดงาน อาคารสิริวิทยา',
    display_order: 2,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb-3',
    event_id: defaultEvent.id,
    content_key: 'transportation_infographic',
    title: 'การเดินทางและจุดจอดรถ',
    description: 'ข้อมูลการเดินทางด้วยรถสาธารณะ รถรางมหิดล และจุดจอดรถยนต์',
    image_url: null,
    alt_text: 'ข้อมูลการเดินทาง',
    display_order: 3,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb-4',
    event_id: defaultEvent.id,
    content_key: 'preparation_infographic',
    title: 'การเตรียมตัวก่อนบริจาคโลหิต',
    description: 'ข้อปฏิบัติ พักผ่อน 6-8 ชม. ดื่มน้ำ 3-4 แก้ว และงดอาหารไขมันสูง',
    image_url: null,
    alt_text: 'การเตรียมตัวก่อนบริจาคโลหิต',
    display_order: 4,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb-5',
    event_id: defaultEvent.id,
    content_key: 'what_to_bring',
    title: 'สิ่งที่ต้องเตรียมมาในวันงาน',
    description: 'บัตรประจำตัวประชาชน หรือบัตรผู้บริจาคโลหิตสภากาชาดไทย',
    image_url: null,
    alt_text: 'สิ่งที่ต้องเตรียมมาในวันงาน',
    display_order: 5,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb-6',
    event_id: defaultEvent.id,
    content_key: 'booth_infographic',
    title: 'นิทรรศการบูธกิจกรรมให้ความรู้',
    description: 'กิจกรรมความรู้หมู่เลือด นิทรรศการเทคนิคการแพทย์',
    image_url: null,
    alt_text: 'บูธกิจกรรมให้ความรู้',
    display_order: 6,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cb-7',
    event_id: defaultEvent.id,
    content_key: 'sponsor_banner',
    title: 'ผู้สนับสนุนโครงการ',
    description: 'ขอขอบคุณผู้สนับสนุนกิจกรรมบริจาคโลหิต MUMT ครั้งที่ 9',
    image_url: null,
    alt_text: 'ผู้สนับสนุนโครงการ',
    display_order: 7,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const defaultSlots: TimeSlot[] = [
  // Official event window 09:00–14:00 น.: five 1-hour slots (Unlimited capacity).
  { id: 'ts-1', event_id: defaultEvent.id, start_at: '2026-09-16T09:00:00+07:00', end_at: '2026-09-16T10:00:00+07:00', capacity: 9999, booked_count: 12, is_active: true, created_at: new Date().toISOString() },
  { id: 'ts-2', event_id: defaultEvent.id, start_at: '2026-09-16T10:00:00+07:00', end_at: '2026-09-16T11:00:00+07:00', capacity: 9999, booked_count: 28, is_active: true, created_at: new Date().toISOString() },
  { id: 'ts-3', event_id: defaultEvent.id, start_at: '2026-09-16T11:00:00+07:00', end_at: '2026-09-16T12:00:00+07:00', capacity: 9999, booked_count: 35, is_active: true, created_at: new Date().toISOString() },
  { id: 'ts-4', event_id: defaultEvent.id, start_at: '2026-09-16T12:00:00+07:00', end_at: '2026-09-16T13:00:00+07:00', capacity: 9999, booked_count: 18, is_active: true, created_at: new Date().toISOString() },
  { id: 'ts-5', event_id: defaultEvent.id, start_at: '2026-09-16T13:00:00+07:00', end_at: '2026-09-16T14:00:00+07:00', capacity: 9999, booked_count: 15, is_active: true, created_at: new Date().toISOString() },
];

export const inMemoryRegistrations: Registration[] = [
  {
    id: 'reg-demo-1',
    event_id: defaultEvent.id,
    registration_code: 'MBD26-DEMO01',
    qr_token: 'MBD26_QR_MBD26-DEMO01_test123',
    first_name: 'สมชาย',
    last_name: 'ใจดี',
    phone: '081-234-5678',
    phone_normalized: '0812345678',
    email: 'somchai@mahidol.ac.th',
    participant_type: 'STUDENT',
    faculty: 'คณะเทคนิคการแพทย์',
    academic_year: 'ปี 3',
    donation_experience: 'FIRST_TIME',
    slot_id: 'ts-1',
    status: 'REGISTERED',
    source: 'ONLINE',
    privacy_accepted: true,
    registered_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    checked_in_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'reg-demo-2',
    event_id: defaultEvent.id,
    registration_code: 'MBD26-DEMO02',
    qr_token: 'MBD26_QR_MBD26-DEMO02_test456',
    first_name: 'สมหญิง',
    last_name: 'รักเรียน',
    phone: '089-876-5432',
    phone_normalized: '0898765432',
    email: 'somying@gmail.com',
    participant_type: 'GENERAL_PUBLIC',
    faculty: null,
    academic_year: null,
    donation_experience: 'RETURNING',
    slot_id: 'ts-2',
    status: 'CHECKED_IN',
    source: 'ONLINE',
    privacy_accepted: true,
    registered_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    checked_in_at: new Date(Date.now() - 1800000).toISOString(),
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const inMemoryAuditLogs: AuditLog[] = [];
const inMemoryCheckinEvents: CheckinEvent[] = [];

export interface InMemoryStaffUser extends StaffProfile {
  email: string;
}

export const inMemoryStaffProfiles: InMemoryStaffUser[] = [
  {
    user_id: 'u-admin',
    email: 'admin@mahidol.ac.th',
    display_name: 'ผู้ดูแลระบบ MUMT',
    role: 'ADMIN',
    team: 'Management & Ops',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getInMemoryStaffProfiles(): Promise<InMemoryStaffUser[]> {
  return inMemoryStaffProfiles;
}

export async function upsertInMemoryStaff(params: {
  userId?: string;
  email: string;
  displayName: string;
  role: StaffRole;
  team?: string | null;
  isActive?: boolean;
}): Promise<InMemoryStaffUser> {
  const existing = inMemoryStaffProfiles.find(
    (s) => (params.userId && s.user_id === params.userId) || s.email.toLowerCase() === params.email.toLowerCase()
  );

  if (existing) {
    existing.display_name = params.displayName;
    existing.role = params.role;
    existing.team = params.team ?? existing.team;
    if (params.isActive !== undefined) existing.is_active = params.isActive;
    existing.updated_at = new Date().toISOString();
    return existing;
  }

  const newStaff: InMemoryStaffUser = {
    user_id: params.userId || nextMemoryId('u-staff'),
    email: params.email,
    display_name: params.displayName,
    role: params.role,
    team: params.team || null,
    is_active: params.isActive !== undefined ? params.isActive : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryStaffProfiles.push(newStaff);
  return newStaff;
}

/** Read-only accessors for the audit-log viewer (memory backend). */
export function getInMemoryCheckinEvents(): readonly CheckinEvent[] {
  return inMemoryCheckinEvents;
}

export function getInMemoryAuditLogs(): readonly AuditLog[] {
  return inMemoryAuditLogs;
}

// ==========================================
// REGISTRATION STATE MACHINE CONTROLS
// ==========================================
const ALLOWED_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  REGISTERED: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['COMPLETED', 'IN_PROCESS', 'CANCELLED'],
  IN_PROCESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: ['CHECKED_IN', 'CANCELLED'],
};

export function isTransitionAllowed(currentStatus: RegistrationStatus, targetStatus: RegistrationStatus): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

// ==========================================
// MEMORY STORE FUNCTIONS
// ==========================================

/**
 * P0-4 FIX: Fix Event Slug Lookup Bug.
 * Return null for unknown event slugs instead of returning default event.
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  const cleanSlug = slug.trim().toLowerCase();

  if (isMemoryBackendAllowed()) {
    return cleanSlug === defaultEvent.slug ? defaultEvent : null;
  }

  throw new Error('Database connection unconfigured in production environment.');
}

export async function getEventContentBlocks(_eventId: string): Promise<EventContentBlock[]> {
  if (isMemoryBackendAllowed()) {
    return defaultContentBlocks.filter(b => b.is_visible).sort((a, b) => a.display_order - b.display_order);
  }

  throw new Error('Database connection unconfigured in production environment.');
}

export async function updateEventContentBlock(id: string, updates: Partial<EventContentBlock>): Promise<{ success: boolean; block?: EventContentBlock }> {
  if (isMemoryBackendAllowed()) {
    const block = defaultContentBlocks.find(b => b.id === id || b.content_key === id);
    if (block) {
      Object.assign(block, updates);
      return { success: true, block };
    }
  }

  return { success: false };
}

export async function getTimeSlots(_eventId: string): Promise<TimeSlot[]> {
  if (isMemoryBackendAllowed()) {
    return defaultSlots.filter(s => s.is_active).sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }

  throw new Error('Database connection unconfigured in production environment.');
}

export async function registerDonorAtomic(input: {
  eventId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  participantType: ParticipantType;
  faculty?: string;
  academicYear?: string;
  donationExperience: DonationExperience;
  slotId: string;
  source?: 'ONLINE' | 'WALK_IN' | 'ADMIN';
}): Promise<{ success: boolean; registration?: Registration; errorCode?: string; message?: string }> {
  const phoneNormalized = normalizePhoneNumber(input.phone);
  const source = input.source || 'ONLINE';

  if (isMemoryBackendAllowed()) {
    const duplicate = inMemoryRegistrations.find(
      r => r.event_id === input.eventId && r.phone_normalized === phoneNormalized && r.status !== 'CANCELLED'
    );
    if (duplicate) {
      return {
        success: false,
        errorCode: 'DUPLICATE_REGISTRATION',
        message: 'พบการลงทะเบียนสำหรับหมายเลขโทรศัพท์นี้แล้ว',
        registration: duplicate,
      };
    }

    const slot = defaultSlots.find(s => s.id === input.slotId);
    if (slot) {
      if (slot.booked_count >= slot.capacity) {
        return {
          success: false,
          errorCode: 'SLOT_FULL',
          message: 'ช่วงเวลานี้เพิ่งเต็ม กรุณาเลือกช่วงเวลาอื่น',
        };
      }
      slot.booked_count += 1;
    }

    const code = generateRegistrationCode();
    const token = generateQRToken(code);
    const newReg: Registration = {
      id: nextMemoryId('reg'),
      event_id: input.eventId,
      registration_code: code,
      qr_token: token,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      phone_normalized: phoneNormalized,
      email: input.email || null,
      participant_type: input.participantType,
      faculty: input.faculty || null,
      academic_year: input.academicYear || null,
      donation_experience: input.donationExperience,
      slot_id: input.slotId,
      status: 'REGISTERED',
      source: source,
      privacy_accepted: true,
      registered_at: new Date().toISOString(),
      checked_in_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      time_slot: slot || null,
    };

    inMemoryRegistrations.push(newReg);
    return { success: true, registration: newReg };
  }

  throw new Error('Database connection unconfigured in production environment.');
}

export async function getRegistrationByCode(code: string): Promise<Registration | null> {
  const codeClean = code.trim().toUpperCase();
  if (isMemoryBackendAllowed()) {
    const reg = inMemoryRegistrations.find(r => r.registration_code.toUpperCase() === codeClean);
    if (!reg) return null;
    const slot = defaultSlots.find(s => s.id === reg.slot_id);
    return { ...reg, time_slot: slot || null, event: defaultEvent };
  }

  throw new Error('Database connection unconfigured in production environment.');
}

export async function getRegistrationByQRToken(token: string): Promise<Registration | null> {
  const tokenClean = token.trim();
  if (isMemoryBackendAllowed()) {
    const reg = inMemoryRegistrations.find(r => r.qr_token === tokenClean);
    if (!reg) return null;
    const slot = defaultSlots.find(s => s.id === reg.slot_id);
    return { ...reg, time_slot: slot || null };
  }

  throw new Error('Database connection unconfigured in production environment.');
}

export async function searchRegistrations(query: string): Promise<Registration[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  if (isMemoryBackendAllowed()) {
    const normPhone = normalizePhoneNumber(q);
    return inMemoryRegistrations.filter(r => 
      q === ' ' ||
      r.registration_code.toLowerCase().includes(q) ||
      r.first_name.toLowerCase().includes(q) ||
      r.last_name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      (normPhone.length >= 4 && r.phone_normalized.includes(normPhone))
    ).map(r => ({ ...r, time_slot: defaultSlots.find(s => s.id === r.slot_id) || null }));
  }

  throw new Error('Database connection unconfigured in production environment.');
}

export async function updateRegistrationStatus(
  registrationId: string, 
  targetStatus: RegistrationStatus,
  performedBy?: string
): Promise<{ success: boolean; registration?: Registration; message?: string }> {
  
  let targetReg: Registration | null = null;

  if (isMemoryBackendAllowed()) {
    targetReg = inMemoryRegistrations.find(r => r.id === registrationId) || null;
  } else {
    throw new Error('Database connection unconfigured in production environment.');
  }

  if (!targetReg) {
    return { success: false, message: 'ไม่พบข้อมูลการลงทะเบียน' };
  }

  // Enforce Registration State Machine Transition
  if (!isTransitionAllowed(targetReg.status, targetStatus)) {
    return {
      success: false,
      message: `ไม่สามารถเปลี่ยนสถานะจาก "${targetReg.status}" เป็น "${targetStatus}" ได้`,
    };
  }

  const now = new Date().toISOString();
  targetReg.status = targetStatus;
  targetReg.updated_at = now;
  if (targetStatus === 'CHECKED_IN') targetReg.checked_in_at = now;
  if (targetStatus === 'COMPLETED') targetReg.completed_at = now;

  inMemoryCheckinEvents.push({
    id: nextMemoryId('chk'),
    event_id: targetReg.event_id,
    registration_id: targetReg.id,
    action: `STATUS_CHANGE_${targetStatus}`,
    performed_by: performedBy || null,
    metadata: null,
    created_at: now,
  });

  return { success: true, registration: { ...targetReg, time_slot: defaultSlots.find(s => s.id === targetReg?.slot_id) || null } };
}

export async function checkInDonor(registrationId: string, performedBy?: string) {
  return updateRegistrationStatus(registrationId, 'CHECKED_IN', performedBy);
}

/**
 * Memory-backend cancel: status → CANCELLED, frees the slot's booked_count,
 * and records an audit event. Waitlist promotion is handled by the service
 * layer (checkin-service.cancelRegistration), mirroring the DB flow.
 */
export async function cancelRegistration(
  registrationId: string,
  performedBy?: string,
  reason?: string
): Promise<{ success: boolean; registration?: Registration; message?: string; eventId?: string; slotId?: string | null }> {
  if (!isMemoryBackendAllowed()) {
    throw new Error('Database connection unconfigured in production environment.');
  }

  const targetReg = inMemoryRegistrations.find(r => r.id === registrationId) || null;
  if (!targetReg) {
    return { success: false, message: 'ไม่พบข้อมูลการลงทะเบียน' };
  }

  if (!isTransitionAllowed(targetReg.status, 'CANCELLED')) {
    return {
      success: false,
      message: `ไม่สามารถยกเลิกรายการที่มีสถานะ "${targetReg.status}" ได้`,
    };
  }

  const now = new Date().toISOString();
  targetReg.status = 'CANCELLED';
  targetReg.updated_at = now;

  if (targetReg.slot_id) {
    const slot = defaultSlots.find(s => s.id === targetReg.slot_id);
    if (slot) slot.booked_count = Math.max(0, slot.booked_count - 1);
  }

  inMemoryCheckinEvents.push({
    id: nextMemoryId('chk'),
    event_id: targetReg.event_id,
    registration_id: targetReg.id,
    action: 'STATUS_CHANGE_CANCELLED',
    performed_by: performedBy || null,
    metadata: reason ? { reason } : null,
    created_at: now,
  });

  return {
    success: true,
    registration: { ...targetReg, time_slot: defaultSlots.find(s => s.id === targetReg?.slot_id) || null },
    eventId: targetReg.event_id,
    slotId: targetReg.slot_id,
  };
}

export async function getDashboardKPIs(_eventId: string): Promise<DashboardKPIs> {
  const regs = inMemoryRegistrations;
  const slots = defaultSlots;

  if (!isMemoryBackendAllowed()) {
    throw new Error('Database connection unconfigured in production environment.');
  }

  const totalRegistrations = regs.filter(r => r.status !== 'CANCELLED').length;
  const checkedInCount = regs.filter(r => r.status === 'CHECKED_IN' || r.status === 'IN_PROCESS' || r.status === 'COMPLETED').length;
  const walkInCount = regs.filter(r => r.source === 'WALK_IN').length;
  const firstTimeDonors = regs.filter(r => r.donation_experience === 'FIRST_TIME' && r.status !== 'CANCELLED').length;
  const returningDonors = regs.filter(r => r.donation_experience === 'RETURNING' && r.status !== 'CANCELLED').length;
  const studentsCount = regs.filter(r => r.participant_type === 'STUDENT' && r.status !== 'CANCELLED').length;
  const staffCount = regs.filter(r => r.participant_type === 'STAFF' && r.status !== 'CANCELLED').length;
  const generalPublicCount = regs.filter(r => r.participant_type === 'GENERAL_PUBLIC' && r.status !== 'CANCELLED').length;
  const inProcessCount = regs.filter(r => r.status === 'IN_PROCESS').length;
  const completedCount = regs.filter(r => r.status === 'COMPLETED').length;
  const cancelledCount = regs.filter(r => r.status === 'CANCELLED').length;
  const noShowCount = regs.filter(r => r.status === 'NO_SHOW').length;

  const attendanceRatePercent = totalRegistrations > 0 
    ? Math.round((checkedInCount / totalRegistrations) * 100) 
    : 0;

  const slotBreakdown = slots.map(s => {
    const start = new Date(s.start_at);
    const end = new Date(s.end_at);
    const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    const endStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    
    const slotRegs = regs.filter(r => r.slot_id === s.id && r.status !== 'CANCELLED');
    const slotCheckedIn = slotRegs.filter(r => r.status === 'CHECKED_IN' || r.status === 'IN_PROCESS' || r.status === 'COMPLETED').length;

    return {
      slotId: s.id,
      timeLabel: `${startStr}–${endStr}`,
      capacity: s.capacity,
      bookedCount: slotRegs.length,
      checkedInCount: slotCheckedIn,
    };
  });

  return {
    totalRegistrations,
    expectedAttendance: totalRegistrations,
    firstTimeDonors,
    returningDonors,
    studentsCount,
    staffCount,
    generalPublicCount,
    checkedInCount,
    walkInCount,
    inProcessCount,
    completedCount,
    cancelledCount,
    noShowCount,
    attendanceRatePercent,
    slotBreakdown,
  };
}

export async function logAuditAction(action: string, entityType: string, entityId: string, actorId?: string, metadata?: Record<string, unknown>) {
  if (isMemoryBackendAllowed()) {
    inMemoryAuditLogs.push({
      id: nextMemoryId('audit'),
      actor_id: actorId || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata || null,
      created_at: new Date().toISOString(),
    });
  }
}

export async function getAllRegistrations(eventId: string): Promise<Registration[]> {
  if (isMemoryBackendAllowed()) {
    return inMemoryRegistrations
      .filter(r => r.event_id === eventId)
      .map(r => ({ ...r, time_slot: defaultSlots.find(s => s.id === r.slot_id) || null }));
  }
  throw new Error('Database connection unconfigured in production environment.');
}

export async function getForecastByTimeSlot(eventId: string) {
  const kpis = await getDashboardKPIs(eventId);
  return kpis.slotBreakdown;
}

export async function getRegistrationsByParticipantType(eventId: string) {
  const kpis = await getDashboardKPIs(eventId);
  return {
    students: kpis.studentsCount,
    staff: kpis.staffCount,
    generalPublic: kpis.generalPublicCount,
  };
}

export async function recordAuditLog(params: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  return logAuditAction(params.action, params.entityType, params.entityId, params.actorId, params.metadata);
}
