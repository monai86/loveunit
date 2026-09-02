// TypeScript Definitions for MUMT Blood Donation 2026

export type ParticipantType = 'STUDENT' | 'STAFF' | 'GENERAL_PUBLIC';
export type DonationExperience = 'FIRST_TIME' | 'RETURNING';
export type RegistrationSource = 'ONLINE' | 'WALK_IN' | 'ADMIN';
export type RegistrationStatus = 'REGISTERED' | 'CHECKED_IN' | 'IN_PROCESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type StaffRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'COMPLETED' | 'ARCHIVED';

export interface Event {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  start_at: string;
  end_at: string;
  venue_name: string;
  venue_detail: string;
  registration_open_at: string;
  registration_close_at: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventContentBlock {
  id: string;
  event_id: string;
  content_key: string;
  title: string;
  description: string | null;
  image_url: string | null;
  alt_text: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  event_id: string;
  start_at: string;
  end_at: string;
  capacity: number;
  booked_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  registration_code: string;
  qr_token: string;
  access_token: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone_normalized: string;
  email: string | null;
  participant_type: ParticipantType;
  faculty: string | null;
  academic_year: string | null;
  donation_experience: DonationExperience;
  pr_channel?: string | null;
  slot_id: string | null;
  status: RegistrationStatus;
  source: RegistrationSource;
  privacy_accepted: boolean;
  registered_at: string;
  checked_in_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation fields for convenience
  time_slot?: TimeSlot | null;
  event?: Event | null;
}

export interface VerificationToken {
  id: string;
  registration_id: string;
  token: string;
  contact_target: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface StaffProfile {
  user_id: string;
  display_name: string;
  role: StaffRole;
  team: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckinEvent {
  id: string;
  event_id: string;
  registration_id: string;
  action: string;
  performed_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface EventFeedback {
  id: string;
  event_id: string;
  registration_id: string | null;
  rating: number;
  knowledge_rating: number | null;
  experience_rating: number | null;
  comment: string | null;
  created_at: string;
}

export interface DashboardKPIs {
  totalRegistrations: number;
  expectedAttendance: number;
  firstTimeDonors: number;
  returningDonors: number;
  studentsCount: number;
  staffCount: number;
  generalPublicCount: number;
  checkedInCount: number;
  walkInCount: number;
  inProcessCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  attendanceRatePercent: number;
  slotBreakdown: Array<{
    slotId: string;
    timeLabel: string;
    capacity: number;
    bookedCount: number;
    checkedInCount: number;
  }>;
  prChannelBreakdown?: Record<string, number>;
}
