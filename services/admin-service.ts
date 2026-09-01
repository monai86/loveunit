import { db } from '@/db';
import { registrations, timeSlots, auditLogs, staffProfiles, user } from '@/db/schema';
import { and, eq, desc, sql } from 'drizzle-orm';
import { 
  isMemoryBackendAllowed, 
  getDashboardKPIs as memoryGetKPIs, 
  getAllRegistrations as memoryGetAllRegs, 
  inMemoryRegistrations,
  defaultSlots,
  logAuditAction as memoryLogAudit,
  getInMemoryStaffProfiles
} from '@/lib/db/store';
import { resolveActorId } from '@/lib/auth/server';
import { StaffRole } from '@/lib/types/database';
import { normalizePhoneNumber } from '@/lib/utils/format';
import type { AdminRegistrationUpdateInput } from '@/lib/validation/schemas';
import { promoteFromWaitlist } from '@/services/waitlist-service';
import { isLegacyPlaceholderStaffEmail } from '@/lib/auth/staff-account-policy';

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

export async function updateDonorRegistration(params: AdminRegistrationUpdateInput & { registrationId: string; actorId: string }) {
  const values = {
    firstName: params.firstName.trim(),
    lastName: params.lastName.trim(),
    phone: params.phone.trim(),
    phoneNormalized: normalizePhoneNumber(params.phone),
    email: params.email?.trim() || null,
    participantType: params.participantType,
    faculty: params.faculty?.trim() || null,
    academicYear: params.academicYear?.trim() || null,
    donationExperience: params.donationExperience,
    updatedAt: new Date(),
  };
  if (db) {
    try {
      return await db.transaction(async (tx) => {
        const [updated] = await tx.update(registrations).set(values).where(eq(registrations.id, params.registrationId)).returning();
        if (!updated) return { success: false as const, message: 'ไม่พบผู้ลงทะเบียน' };
        await tx.insert(auditLogs).values({
          actorId: resolveActorId(params.actorId), action: 'UPDATE_DONOR_REGISTRATION', entityType: 'registration', entityId: params.registrationId,
          metadata: { changedFields: ['firstName', 'lastName', 'phone', 'email', 'participantType', 'faculty', 'academicYear', 'donationExperience'] },
        });
        return { success: true as const, registration: updated };
      });
    } catch (error) {
      if (error instanceof Error && /unique|duplicate/i.test(error.message)) return { success: false as const, message: 'เบอร์โทรศัพท์นี้ลงทะเบียนในงานนี้แล้ว' };
      throw error;
    }
  }
  if (isMemoryBackendAllowed()) {
    const found = inMemoryRegistrations.find((registration) => registration.id === params.registrationId);
    if (!found) return { success: false as const, message: 'ไม่พบผู้ลงทะเบียน' };
    Object.assign(found, {
      first_name: values.firstName, last_name: values.lastName, phone: values.phone, phone_normalized: values.phoneNormalized,
      email: values.email, participant_type: values.participantType, faculty: values.faculty, academic_year: values.academicYear,
      donation_experience: values.donationExperience, updated_at: values.updatedAt.toISOString(),
    });
    await recordAuditLog({ actorId: params.actorId, action: 'UPDATE_DONOR_REGISTRATION', entityType: 'registration', entityId: params.registrationId });
    return { success: true as const, registration: found };
  }
  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function deleteDonorRegistration(registrationId: string, actorId: string) {
  if (db) {
    const [current] = await db.select({ id: registrations.id, eventId: registrations.eventId, slotId: registrations.slotId, status: registrations.status })
      .from(registrations).where(eq(registrations.id, registrationId)).limit(1);
    if (!current) return { success: false as const, message: 'ไม่พบผู้ลงทะเบียน' };
    if (current.status === 'COMPLETED') return { success: false as const, message: 'ไม่สามารถลบรายการที่บริจาคสำเร็จแล้ว' };
    await db.transaction(async (tx) => {
      await tx.delete(registrations).where(eq(registrations.id, registrationId));
      if (current.slotId) {
        await tx.update(timeSlots).set({ bookedCount: sql`GREATEST(${timeSlots.bookedCount} - 1, 0)` })
          .where(and(eq(timeSlots.id, current.slotId), eq(timeSlots.eventId, current.eventId)));
      }
      await tx.insert(auditLogs).values({ actorId: resolveActorId(actorId), action: 'DELETE_DONOR_REGISTRATION', entityType: 'registration', entityId: registrationId });
    });
    const promoted = current.slotId ? await promoteFromWaitlist(current.slotId, current.eventId) : null;
    return { success: true as const, promoted: promoted?.success ? promoted : null };
  }
  if (isMemoryBackendAllowed()) {
    const index = inMemoryRegistrations.findIndex((registration) => registration.id === registrationId);
    const current = inMemoryRegistrations[index];
    if (!current) return { success: false as const, message: 'ไม่พบผู้ลงทะเบียน' };
    if (current.status === 'COMPLETED') return { success: false as const, message: 'ไม่สามารถลบรายการที่บริจาคสำเร็จแล้ว' };
    if (current.slot_id) {
      const slot = defaultSlots.find((candidate) => candidate.id === current.slot_id);
      if (slot) slot.booked_count = Math.max(0, slot.booked_count - 1);
    }
    inMemoryRegistrations.splice(index, 1);
    await recordAuditLog({ actorId, action: 'DELETE_DONOR_REGISTRATION', entityType: 'registration', entityId: registrationId });
    const promoted = current.slot_id ? await promoteFromWaitlist(current.slot_id, current.event_id) : null;
    return { success: true as const, promoted: promoted?.success ? promoted : null };
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

    const formatBangkokHour = (date: Date) => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(date);
      const hour = parts.find(p => p.type === 'hour')?.value || '00';
      const minute = parts.find(p => p.type === 'minute')?.value || '00';
      return `${hour}:${minute}`;
    };

    const slotBreakdown = slots.map(s => {
      const start = new Date(s.startAt);
      const end = new Date(s.endAt);
      const startStr = formatBangkokHour(start);
      const endStr = formatBangkokHour(end);
      
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

    const prChannelBreakdown: Record<string, number> = {};
    for (const r of regs) {
      if (r.status !== 'CANCELLED') {
        if (!r.prChannel) {
          prChannelBreakdown['ไม่ได้ระบุ'] = (prChannelBreakdown['ไม่ได้ระบุ'] || 0) + 1;
        } else {
          const channels = r.prChannel.split(',').map(s => s.trim()).filter(Boolean);
          for (const ch of channels) {
            prChannelBreakdown[ch] = (prChannelBreakdown[ch] || 0) + 1;
          }
        }
      }
    }

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
      prChannelBreakdown,
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
      actorId: resolveActorId(params.actorId),
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

export interface StaffListItem {
  userId: string;
  email: string;
  displayName: string;
  role: StaffRole;
  team: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAllStaffMembers(): Promise<StaffListItem[]> {
  if (db) {
    const rows = await db
      .select({
        userId: staffProfiles.userId,
        email: user.email,
        displayName: staffProfiles.displayName,
        role: staffProfiles.role,
        team: staffProfiles.team,
        isActive: staffProfiles.isActive,
        createdAt: staffProfiles.createdAt,
        updatedAt: staffProfiles.updatedAt,
      })
      .from(staffProfiles)
      .innerJoin(user, eq(staffProfiles.userId, user.id))
      .orderBy(desc(staffProfiles.createdAt));

    return rows.filter((r) => !isLegacyPlaceholderStaffEmail(r.email)).map((r) => ({
      userId: r.userId,
      email: r.email,
      displayName: r.displayName,
      role: r.role as StaffRole,
      team: r.team,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  if (isMemoryBackendAllowed()) {
    const inMem = await getInMemoryStaffProfiles();
    return inMem.filter((m) => !isLegacyPlaceholderStaffEmail(m.email)).map((m) => ({
      userId: m.user_id,
      email: m.email,
      displayName: m.display_name,
      role: m.role,
      team: m.team,
      isActive: m.is_active,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function updateStaffRoleAndTeam(params: {
  userId: string;
  role: StaffRole;
  team?: string | null;
  isActive?: boolean;
  actorId?: string;
}) {
  if (db) {
    await db
      .update(staffProfiles)
      .set({
        role: params.role,
        team: params.team,
        isActive: params.isActive !== undefined ? params.isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(staffProfiles.userId, params.userId));

    await recordAuditLog({
      actorId: params.actorId,
      action: 'UPDATE_STAFF_ROLE',
      entityType: 'staff_profile',
      entityId: params.userId,
      metadata: { newRole: params.role, newTeam: params.team, isActive: params.isActive },
    });

    return { success: true };
  }

  if (isMemoryBackendAllowed()) {
    const memStaff = await getInMemoryStaffProfiles();
    const found = memStaff.find((s) => s.user_id === params.userId);
    if (found) {
      found.role = params.role;
      if (params.team !== undefined) found.team = params.team;
      if (params.isActive !== undefined) found.is_active = params.isActive;
      found.updated_at = new Date().toISOString();

      await recordAuditLog({
        actorId: params.actorId,
        action: 'UPDATE_STAFF_ROLE',
        entityType: 'staff_profile',
        entityId: params.userId,
        metadata: { newRole: params.role, newTeam: params.team, isActive: params.isActive },
      });

      return { success: true, staff: found };
    }
  }

  return { success: false, message: 'Staff profile not found' };
}
