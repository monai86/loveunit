import { db } from '@/db';
import { registrations, timeSlots, auditLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { isMemoryBackendAllowed, getDashboardKPIs as memoryGetKPIs, getAllRegistrations as memoryGetAllRegs, logAuditAction as memoryLogAudit } from '@/lib/db/store';

export async function getAllRegistrations(eventId: string) {
  if (db) {
    return await db.query.registrations.findMany({
      where: eq(registrations.eventId, eventId),
      orderBy: [desc(registrations.registeredAt)],
      with: {
        timeSlot: true,
      },
    });
  }

  if (isMemoryBackendAllowed()) {
    return await memoryGetAllRegs(eventId);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function getDashboardKPIs(eventId: string) {
  if (db) {
    const regs = await db.select().from(registrations).where(eq(registrations.eventId, eventId));
    const slots = await db.select().from(timeSlots).where(eq(timeSlots.eventId, eventId));

    const totalRegistrations = regs.filter(r => r.status !== 'CANCELLED').length;
    const checkedInCount = regs.filter(r => r.status === 'CHECKED_IN' || r.status === 'IN_PROCESS' || r.status === 'COMPLETED').length;
    const walkInCount = regs.filter(r => r.source === 'WALK_IN').length;
    const firstTimeDonors = regs.filter(r => r.donationExperience === 'FIRST_TIME' && r.status !== 'CANCELLED').length;
    const returningDonors = regs.filter(r => r.donationExperience === 'RETURNING' && r.status !== 'CANCELLED').length;
    const studentsCount = regs.filter(r => r.participantType === 'STUDENT' && r.status !== 'CANCELLED').length;
    const staffCount = regs.filter(r => r.participantType === 'STAFF' && r.status !== 'CANCELLED').length;
    const generalPublicCount = regs.filter(r => r.participantType === 'GENERAL_PUBLIC' && r.status !== 'CANCELLED').length;
    const inProcessCount = regs.filter(r => r.status === 'IN_PROCESS').length;
    const completedCount = regs.filter(r => r.status === 'COMPLETED').length;
    const cancelledCount = regs.filter(r => r.status === 'CANCELLED').length;
    const noShowCount = regs.filter(r => r.status === 'NO_SHOW').length;

    const attendanceRatePercent = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;

    const slotBreakdown = slots.map(s => {
      const start = new Date(s.startAt);
      const end = new Date(s.endAt);
      const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
      const endStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
      
      const slotRegs = regs.filter(r => r.slotId === s.id && r.status !== 'CANCELLED');
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

  if (isMemoryBackendAllowed()) {
    return await memoryGetKPIs(eventId);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function recordAuditLog(params: {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  if (db) {
    await db.insert(auditLogs).values({
      actorId: params.actorId || null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata || null,
    });
    return;
  }

  if (isMemoryBackendAllowed()) {
    await memoryLogAudit(params.action, params.entityType, params.entityId, params.actorId, params.metadata);
    return;
  }
}
