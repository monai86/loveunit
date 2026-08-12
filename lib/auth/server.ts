// Server-side Authorization & Role-Based Access Control (RBAC) Guards

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StaffProfile, StaffRole } from '@/lib/types/database';
import { isMemoryBackendAllowed } from '@/lib/db/store';

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: StaffProfile;
}

// In-Memory Dev Staff Profiles for local testing without Supabase Auth
const devProfiles: Record<string, StaffProfile> = {
  'staff@mahidol.ac.th': { user_id: 'u-staff', display_name: 'เจ้าหน้าที่จุดเช็คอิน', role: 'STAFF', team: 'Checkin Flow', is_active: true, created_at: '', updated_at: '' },
  'lead@mahidol.ac.th': { user_id: 'u-lead', display_name: 'หัวหน้าทีมปฏิบัติการ', role: 'TEAM_LEAD', team: 'Flow Team', is_active: true, created_at: '', updated_at: '' },
  'admin@mahidol.ac.th': { user_id: 'u-admin', display_name: 'ผู้ดูแลระบบ MUMT', role: 'ADMIN', team: 'Management', is_active: true, created_at: '', updated_at: '' },
  'superadmin@mahidol.ac.th': { user_id: 'u-superadmin', display_name: 'Super Admin', role: 'SUPER_ADMIN', team: 'System', is_active: true, created_at: '', updated_at: '' },
};

/**
 * Reads authenticated server session and loads staff profile from database.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user || !user.email) return null;

    const { data: profile } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email,
      profile: profile as StaffProfile,
    };
  }

  // Fallback for local development/testing when allowed
  if (isMemoryBackendAllowed()) {
    // Return default admin profile for local dev testing
    const devProfile = devProfiles['admin@mahidol.ac.th'];
    return {
      id: devProfile.user_id,
      email: 'admin@mahidol.ac.th',
      profile: devProfile,
    };
  }

  return null;
}

/**
 * Authorization Guard: Requires active user with at least STAFF role.
 */
export async function requireStaff(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  const allowedRoles: StaffRole[] = ['STAFF', 'TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(user.profile.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

/**
 * Authorization Guard: Requires active user with at least TEAM_LEAD role.
 */
export async function requireTeamLead(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  const allowedRoles: StaffRole[] = ['TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(user.profile.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

/**
 * Authorization Guard: Requires active user with ADMIN or SUPER_ADMIN role.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  const allowedRoles: StaffRole[] = ['ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(user.profile.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

/**
 * Authorization Guard: Requires active user with SUPER_ADMIN role.
 */
export async function requireSuperAdmin(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  if (user.profile.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
