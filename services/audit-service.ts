// Audit log service — admin viewer over checkin_events + audit_logs.

import { db } from '@/db';
import { checkinEvents, registrations, user, staffProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { isMemoryBackendAllowed, getInMemoryCheckinEvents, inMemoryRegistrations, inMemoryStaffProfiles } from '@/lib/db/store';
import type { CheckinEvent } from '@/lib/types/database';
import { formatActionLabel } from '@/lib/utils/format';

export { formatActionLabel };

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  action: string;
  performedBy: string | null;
  performedById?: string | null;
  performedByEmail?: string | null;
  performedByRole?: string | null;
  registrationCode: string | null;
  donorName: string | null;
  metadata: unknown;
}

export async function getAuditLogs(options: { action?: string; limit?: number } = {}) {
  const limit = Math.min(options.limit ?? 200, 500);

  if (db) {
    const rows = await db
      .select({
        id: checkinEvents.id,
        createdAt: checkinEvents.createdAt,
        action: checkinEvents.action,
        performedBy: checkinEvents.performedBy,
        staffDisplayName: staffProfiles.displayName,
        userName: user.name,
        userEmail: user.email,
        staffRole: staffProfiles.role,
        metadata: checkinEvents.metadata,
        registrationCode: registrations.registrationCode,
        firstName: registrations.firstName,
        lastName: registrations.lastName,
      })
      .from(checkinEvents)
      .leftJoin(registrations, eq(checkinEvents.registrationId, registrations.id))
      .leftJoin(user, eq(checkinEvents.performedBy, user.id))
      .leftJoin(staffProfiles, eq(checkinEvents.performedBy, staffProfiles.userId))
      .where(options.action ? eq(checkinEvents.action, options.action) : undefined)
      .orderBy(desc(checkinEvents.createdAt))
      .limit(limit);

    return rows.map((r) => {
      let performerName = r.staffDisplayName || r.userName;
      if (!performerName) {
        const meta = (r.metadata && typeof r.metadata === 'object' ? r.metadata : {}) as Record<string, unknown>;
        if (meta.actor === 'DONOR_SELF') performerName = 'ผู้บริจาค (ตนเอง)';
        else if (meta.actor === 'ADMIN') performerName = 'ผู้ดูแลระบบ (Admin)';
        else if (typeof meta.reason === 'string' && meta.reason.includes('WALK_IN')) performerName = 'ระบบ (Walk-in)';
        else if (r.performedBy) performerName = `Staff (${r.performedBy.slice(0, 8)})`;
        else performerName = 'ระบบ';
      }

      return {
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        action: r.action,
        performedBy: performerName,
        performedById: r.performedBy,
        performedByEmail: r.userEmail,
        performedByRole: r.staffRole,
        metadata: r.metadata,
        registrationCode: r.registrationCode,
        donorName: r.firstName ? `${r.firstName} ${r.lastName ?? ''}`.trim() : null,
      };
    }) as AuditLogEntry[];
  }

  if (isMemoryBackendAllowed()) {
    const events = getInMemoryCheckinEvents();
    return events
      .filter((e: CheckinEvent) => (options.action ? e.action === options.action : true))
      .sort((a: CheckinEvent, b: CheckinEvent) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map((e: CheckinEvent) => {
        const reg = inMemoryRegistrations.find((r) => r.id === e.registration_id);
        const staff = inMemoryStaffProfiles.find((s) => s.user_id === e.performed_by);
        let performerName = staff?.display_name;
        if (!performerName) {
          const meta = (e.metadata && typeof e.metadata === 'object' ? e.metadata : {}) as Record<string, unknown>;
          if (meta.actor === 'DONOR_SELF') performerName = 'ผู้บริจาค (ตนเอง)';
          else if (meta.actor === 'ADMIN') performerName = 'ผู้ดูแลระบบ (Admin)';
          else if (typeof meta.reason === 'string' && meta.reason.includes('WALK_IN')) performerName = 'ระบบ (Walk-in)';
          else if (e.performed_by) performerName = `Staff (${e.performed_by.slice(0, 8)})`;
          else performerName = 'ระบบ';
        }

        return {
          id: e.id,
          createdAt: e.created_at,
          action: e.action,
          performedBy: performerName,
          performedById: e.performed_by,
          performedByRole: staff?.role,
          metadata: e.metadata,
          registrationCode: reg?.registration_code ?? null,
          donorName: reg ? `${reg.first_name} ${reg.last_name}`.trim() : null,
        };
      }) as AuditLogEntry[];
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

/** Distinct actions seen in the log, for the filter dropdown. */
export async function getAuditActions(): Promise<string[]> {
  if (db) {
    const rows = await db
      .selectDistinct({ action: checkinEvents.action })
      .from(checkinEvents)
      .orderBy(checkinEvents.action);
    return rows.map((r) => r.action);
  }
  if (isMemoryBackendAllowed()) {
    return [...new Set(getInMemoryCheckinEvents().map((e) => e.action))].sort();
  }
  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

