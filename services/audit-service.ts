// Audit log service — admin viewer over checkin_events + audit_logs.

import { db } from '@/db';
import { checkinEvents, registrations } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { isMemoryBackendAllowed, getInMemoryCheckinEvents, inMemoryRegistrations } from '@/lib/db/store';
import type { CheckinEvent } from '@/lib/types/database';
import { formatActionLabel } from '@/lib/utils/format';

export { formatActionLabel };

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  action: string;
  performedBy: string | null;
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
        metadata: checkinEvents.metadata,
        registrationCode: registrations.registrationCode,
        firstName: registrations.firstName,
        lastName: registrations.lastName,
      })
      .from(checkinEvents)
      .leftJoin(registrations, eq(checkinEvents.registrationId, registrations.id))
      .where(options.action ? eq(checkinEvents.action, options.action) : undefined)
      .orderBy(desc(checkinEvents.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      action: r.action,
      performedBy: r.performedBy,
      metadata: r.metadata,
      registrationCode: r.registrationCode,
      donorName: r.firstName ? `${r.firstName} ${r.lastName ?? ''}`.trim() : null,
    })) as AuditLogEntry[];
  }

  if (isMemoryBackendAllowed()) {
    const events = getInMemoryCheckinEvents();
    return events
      .filter((e: CheckinEvent) => (options.action ? e.action === options.action : true))
      .sort((a: CheckinEvent, b: CheckinEvent) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map((e: CheckinEvent) => {
        const reg = inMemoryRegistrations.find((r) => r.id === e.registration_id);
        return {
          id: e.id,
          createdAt: e.created_at,
          action: e.action,
          performedBy: e.performed_by,
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

