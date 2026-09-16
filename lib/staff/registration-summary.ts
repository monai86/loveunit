import type { RegistrationStatus } from '@/lib/types/database';

type RegistrationStatusRecord = { status: RegistrationStatus };

/**
 * Produces the operational set of metrics shown to floor staff.
 * Like the admin dashboard, 'checkedIn' represents the cumulative total of participants
 * who have arrived / checked in to the event (CHECKED_IN, IN_PROCESS, COMPLETED),
 * so that the count does not decrease when a participant completes donation.
 * 'inQueue' represents participants currently waiting for service.
 */
export function summarizeStaffRegistrations(registrations: RegistrationStatusRecord[]) {
  const waiting = registrations.filter((registration) => registration.status === 'REGISTERED').length;
  const inQueue = registrations.filter((registration) => registration.status === 'CHECKED_IN' || registration.status === 'IN_PROCESS').length;
  const completed = registrations.filter((registration) => registration.status === 'COMPLETED').length;
  const cancelled = registrations.filter((registration) => registration.status === 'CANCELLED').length;
  const total = registrations.length - cancelled;

  // Cumulative checked-in count matching admin dashboard checkedInCount (does not decrease on donation completion)
  const checkedIn = registrations.filter(
    (registration) =>
      registration.status === 'CHECKED_IN' ||
      registration.status === 'IN_PROCESS' ||
      registration.status === 'COMPLETED'
  ).length;

  return {
    total,
    waiting,
    inQueue,
    checkedIn,
    completed,
    cancelled,
    attendanceRatePercent: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
  };
}
