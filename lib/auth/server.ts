// Server-side Authorization & Role-Based Access Control (RBAC) Guards

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { staffProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { StaffProfile, StaffRole } from '@/lib/types/database';
import { isMemoryBackendAllowed } from '@/lib/db/store';

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: StaffProfile;
}

const devProfiles: Record<string, StaffProfile> = {
  'staff@mahidol.ac.th': { user_id: 'u-staff', display_name: 'เจ้าหน้าที่จุดเช็คอิน', role: 'STAFF', team: 'Checkin Flow', is_active: true, created_at: '', updated_at: '' },
  'lead@mahidol.ac.th': { user_id: 'u-lead', display_name: 'หัวหน้าทีมปฏิบัติการ', role: 'TEAM_LEAD', team: 'Flow Team', is_active: true, created_at: '', updated_at: '' },
  'admin@mahidol.ac.th': { user_id: 'u-admin', display_name: 'ผู้ดูแลระบบ MUMT', role: 'ADMIN', team: 'Management', is_active: true, created_at: '', updated_at: '' },
  'superadmin@mahidol.ac.th': { user_id: 'u-superadmin', display_name: 'Super Admin', role: 'SUPER_ADMIN', team: 'System', is_active: true, created_at: '', updated_at: '' },
};

/**
 * Reads Better Auth authenticated server session and loads staff profile from Drizzle DB.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session && session.user && session.user.id) {
      if (db) {
        const [profile] = await db
          .select()
          .from(staffProfiles)
          .where(and(eq(staffProfiles.userId, session.user.id), eq(staffProfiles.isActive, true)))
          .limit(1);

        if (profile) {
          return {
            id: session.user.id,
            email: session.user.email,
            profile: {
              user_id: profile.userId,
              display_name: profile.displayName,
              role: profile.role as StaffRole,
              team: profile.team || null,
              is_active: profile.isActive,
              created_at: profile.createdAt.toISOString(),
              updated_at: profile.updatedAt.toISOString(),
            },
          };
        }
      }
    }
  } catch (err) {
    // Session read error
  }

  // Fallback for local testing / memory backend when allowed
  if (isMemoryBackendAllowed()) {
    const devProfile = devProfiles['admin@mahidol.ac.th'];
    return {
      id: devProfile.user_id,
      email: 'admin@mahidol.ac.th',
      profile: devProfile,
    };
  }

  return null;
}

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
