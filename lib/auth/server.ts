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
  mustChangePassword: boolean;
}

/**
 * Dev-fallback staff profiles use synthetic user ids (e.g. 'u-admin') that do
 * not exist in the `user` table. Persisting them as FK values would violate
 * the foreign key constraint, so they are resolved to null (no actor recorded).
 * Real authenticated sessions carry real user ids and are kept as-is.
 */
export function resolveActorId(actorId?: string | null): string | null {
  if (!actorId) return null;
  if (actorId.startsWith('u-')) return null;
  return actorId;
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
            mustChangePassword: session.user.mustChangePassword === true,
          };
        }
      }
    }
  } catch {
    // Session read error
  }

  // Dev fallback for local testing / memory backend: only when there is no real
  // database configured (or memory backend is explicitly requested). If a real DB
  // exists (even in development) we require a real session — no synthetic admin.
  if (!db || process.env.DATA_BACKEND === 'memory' || process.env.NODE_ENV === 'test') {
    if (isMemoryBackendAllowed()) {
      const devProfile = devProfiles['admin@mahidol.ac.th'];
      return {
        id: devProfile.user_id,
        email: 'admin@mahidol.ac.th',
        profile: devProfile,
        mustChangePassword: false,
      };
    }
  }

  return null;
}

/**
 * Role check shared by all guards. `userOverride` lets tests inject a synthetic
 * user instead of hitting the session/DB layer.
 */
function assertRole(user: AuthenticatedUser | null, allowedRoles: StaffRole[], _label?: string): AuthenticatedUser {
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  if (!allowedRoles.includes(user.profile.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export async function requireStaff(userOverride?: AuthenticatedUser | null): Promise<AuthenticatedUser> {
  const user = userOverride !== undefined ? userOverride : await getAuthenticatedUser();
  return assertRole(user, ['STAFF', 'TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN'], 'STAFF');
}

export async function requireTeamLead(userOverride?: AuthenticatedUser | null): Promise<AuthenticatedUser> {
  const user = userOverride !== undefined ? userOverride : await getAuthenticatedUser();
  return assertRole(user, ['TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN'], 'TEAM_LEAD');
}

export async function requireAdmin(userOverride?: AuthenticatedUser | null): Promise<AuthenticatedUser> {
  const user = userOverride !== undefined ? userOverride : await getAuthenticatedUser();
  return assertRole(user, ['ADMIN', 'SUPER_ADMIN'], 'ADMIN');
}

export async function requireSuperAdmin(userOverride?: AuthenticatedUser | null): Promise<AuthenticatedUser> {
  const user = userOverride !== undefined ? userOverride : await getAuthenticatedUser();
  return assertRole(user, ['SUPER_ADMIN'], 'SUPER_ADMIN');
}
