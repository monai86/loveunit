/**
 * Legacy accounts that were shipped as demo data. They must never be
 * recreated by seeds or shown in staff management after the production
 * account cleanup migration runs.
 */
export const LEGACY_PLACEHOLDER_STAFF_EMAILS = [
  'superadmin@mahidol.ac.th',
  'your-email@mahidol.ac.th',
  'staff@mahidol.ac.th',
  'lead@mahidol.ac.th',
  'admin@mahidol.ac.th',
] as const;

export function isLegacyPlaceholderStaffEmail(email: string): boolean {
  return LEGACY_PLACEHOLDER_STAFF_EMAILS.includes(email.trim().toLowerCase() as (typeof LEGACY_PLACEHOLDER_STAFF_EMAILS)[number]);
}
