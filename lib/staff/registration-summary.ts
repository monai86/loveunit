import type { RegistrationStatus } from '@/lib/types/database';

type RegistrationStatusRecord = { status: RegistrationStatus };

/**
 * Produces the small, operational set of metrics shown to floor staff.  Cancelled
 * registrations do not count toward the working total or attendance rate.
 */
export function summarizeStaffRegistrations(registrations: RegistrationStatusRecord[]) {
  const waiting = registrations.filter((registration) => registration.status === 'REGISTERED').length;
  const checkedIn = registrations.filter((registration) => registration.status === 'CHECKED_IN' || registration.status === 'IN_PROCESS').length;
  const completed = registrations.filter((registration) => registration.status === 'COMPLETED').length;
  const cancelled = registrations.filter((registration) => registration.status === 'CANCELLED').length;
  const total = registrations.length - cancelled;

  return {
    total,
    waiting,
    checkedIn,
    completed,
    cancelled,
    attendanceRatePercent: total > 0 ? Math.round(((checkedIn + completed) / total) * 100) : 0,
  };
}
