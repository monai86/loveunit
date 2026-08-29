import { and, desc, eq, lte } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';
import { db } from '@/db';
import { account, auditLogs, staffApplications, staffProfiles, user } from '@/db/schema';
import type { StaffApplicationStatus } from '@/db/schema/staff-applications';
import {
  inMemoryStaffApplications,
  inMemoryStaffProfiles,
  isMemoryBackendAllowed,
  logAuditAction,
  provisionInMemoryStaffAccount,
} from '@/lib/db/store';

const REVIEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export interface StaffApplicationInput {
  email: string;
  displayName: string;
  team: string;
}

export interface PublicStaffApplication {
  id: string;
  referenceCode: string;
  status: StaffApplicationStatus;
  rejectionReason: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface AdminStaffApplication extends PublicStaffApplication {
  email: string;
  displayName: string;
  team: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

type ApplicationFailureCode =
  | 'PENDING_APPLICATION_EXISTS'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'APPLICATION_NOT_FOUND'
  | 'APPLICATION_NOT_PENDING'
  | 'INVALID_INITIAL_PASSWORD'
  | 'REJECTION_REASON_REQUIRED';

type ApplicationFailure = { success: false; code: ApplicationFailureCode };

export type SubmitStaffApplicationResult =
  | { success: true; application: PublicStaffApplication }
  | ApplicationFailure;

export type ReviewStaffApplicationResult =
  | {
    success: true;
    application: PublicStaffApplication;
    user: { id: string; email: string; role: 'STAFF'; isActive: true; mustChangePassword: true };
  }
  | ApplicationFailure;

export type RejectStaffApplicationResult =
  | { success: true; application: PublicStaffApplication }
  | ApplicationFailure;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createReferenceCode() {
  return `STF-${crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
}

function toPublicApplication(application: {
  id: string;
  referenceCode: string;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
  expiresAt: Date;
}): PublicStaffApplication {
  return {
    id: application.id,
    referenceCode: application.referenceCode,
    status: application.status as StaffApplicationStatus,
    rejectionReason: application.status === 'REJECTED' ? application.rejectionReason : null,
    createdAt: application.createdAt.toISOString(),
    expiresAt: application.expiresAt.toISOString(),
  };
}

function toPublicMemoryApplication(application: (typeof inMemoryStaffApplications)[number]): PublicStaffApplication {
  return {
    id: application.id,
    referenceCode: application.reference_code,
    status: application.status,
    rejectionReason: application.status === 'REJECTED' ? application.rejection_reason : null,
    createdAt: application.created_at,
    expiresAt: application.expires_at,
  };
}

function toAdminApplication(application: {
  id: string;
  referenceCode: string;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
  expiresAt: Date;
  email: string;
  displayName: string;
  team: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
}): AdminStaffApplication {
  return {
    ...toPublicApplication(application),
    email: application.email,
    displayName: application.displayName,
    team: application.team,
    reviewedBy: application.reviewedBy,
    reviewedAt: application.reviewedAt?.toISOString() ?? null,
  };
}

function toAdminMemoryApplication(application: (typeof inMemoryStaffApplications)[number]): AdminStaffApplication {
  return {
    ...toPublicMemoryApplication(application),
    email: application.email,
    displayName: application.display_name,
    team: application.team,
    reviewedBy: application.reviewed_by,
    reviewedAt: application.reviewed_at,
  };
}

export async function expirePendingStaffApplications(now = new Date()): Promise<number> {
  if (db) {
    const expired = await db
      .update(staffApplications)
      .set({ status: 'EXPIRED', updatedAt: now })
      .where(and(eq(staffApplications.status, 'PENDING'), lte(staffApplications.expiresAt, now)))
      .returning({ id: staffApplications.id });
    return expired.length;
  }

  if (isMemoryBackendAllowed()) {
    let count = 0;
    for (const application of inMemoryStaffApplications) {
      if (application.status === 'PENDING' && new Date(application.expires_at).getTime() <= now.getTime()) {
        application.status = 'EXPIRED';
        application.updated_at = now.toISOString();
        count += 1;
      }
    }
    return count;
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function submitStaffApplication(input: StaffApplicationInput): Promise<SubmitStaffApplicationResult> {
  const email = normalizeEmail(input.email);
  const displayName = input.displayName.trim();
  const team = input.team.trim();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REVIEW_WINDOW_MS);

  if (db) {
    const [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
    if (existingUser) return { success: false, code: 'EMAIL_ALREADY_REGISTERED' };

    const [pending] = await db
      .select({ id: staffApplications.id })
      .from(staffApplications)
      .where(and(eq(staffApplications.email, email), eq(staffApplications.status, 'PENDING')))
      .limit(1);
    if (pending) return { success: false, code: 'PENDING_APPLICATION_EXISTS' };

    try {
      const [application] = await db.insert(staffApplications).values({
        referenceCode: createReferenceCode(),
        email,
        displayName,
        team,
        expiresAt,
        updatedAt: now,
      }).returning();
      return { success: true, application: toPublicApplication(application) };
    } catch (error) {
      if (error instanceof Error && /staff_applications_pending_email_unique|unique/i.test(error.message)) {
        return { success: false, code: 'PENDING_APPLICATION_EXISTS' };
      }
      throw error;
    }
  }

  if (isMemoryBackendAllowed()) {
    if (inMemoryStaffProfiles.some((staff) => staff.email.toLowerCase() === email)) {
      return { success: false, code: 'EMAIL_ALREADY_REGISTERED' };
    }
    if (inMemoryStaffApplications.some((application) => application.email === email && application.status === 'PENDING')) {
      return { success: false, code: 'PENDING_APPLICATION_EXISTS' };
    }
    const application = {
      id: crypto.randomUUID(),
      reference_code: createReferenceCode(),
      email,
      display_name: displayName,
      team,
      status: 'PENDING' as const,
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      expires_at: expiresAt.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    inMemoryStaffApplications.push(application);
    return { success: true, application: toPublicMemoryApplication(application) };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function getPublicStaffApplicationStatus(referenceCode: string): Promise<PublicStaffApplication | null> {
  await expirePendingStaffApplications();
  const normalizedReference = referenceCode.trim().toUpperCase();

  if (db) {
    const [application] = await db
      .select()
      .from(staffApplications)
      .where(eq(staffApplications.referenceCode, normalizedReference))
      .limit(1);
    return application ? toPublicApplication(application) : null;
  }

  if (isMemoryBackendAllowed()) {
    const application = inMemoryStaffApplications.find((candidate) => candidate.reference_code === normalizedReference);
    return application ? toPublicMemoryApplication(application) : null;
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function listStaffApplications(): Promise<AdminStaffApplication[]> {
  await expirePendingStaffApplications();

  if (db) {
    const applications = await db.select().from(staffApplications).orderBy(desc(staffApplications.createdAt));
    return applications.map(toAdminApplication);
  }

  if (isMemoryBackendAllowed()) {
    return [...inMemoryStaffApplications]
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
      .map(toAdminMemoryApplication);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function approveStaffApplication(params: {
  applicationId: string;
  actorId: string;
  initialPassword: string;
}): Promise<ReviewStaffApplicationResult> {
  if (params.initialPassword.length < 8) return { success: false, code: 'INVALID_INITIAL_PASSWORD' };
  await expirePendingStaffApplications();
  const now = new Date();
  const passwordHash = await hashPassword(params.initialPassword);

  if (db) {
    try {
      return await db.transaction(async (tx) => {
        const [application] = await tx
          .select()
          .from(staffApplications)
          .where(eq(staffApplications.id, params.applicationId))
          .limit(1);
        if (!application) return { success: false as const, code: 'APPLICATION_NOT_FOUND' as const };
        if (application.status !== 'PENDING') return { success: false as const, code: 'APPLICATION_NOT_PENDING' as const };

        const [existingUser] = await tx.select({ id: user.id }).from(user).where(eq(user.email, application.email)).limit(1);
        if (existingUser) return { success: false as const, code: 'EMAIL_ALREADY_REGISTERED' as const };

        // Claim the pending row before creating credentials. The status check
        // makes repeated approval requests safe under concurrent admin actions.
        const [approved] = await tx
          .update(staffApplications)
          .set({ status: 'APPROVED', rejectionReason: null, reviewedBy: params.actorId, reviewedAt: now, updatedAt: now })
          .where(and(eq(staffApplications.id, application.id), eq(staffApplications.status, 'PENDING')))
          .returning();
        if (!approved) return { success: false as const, code: 'APPLICATION_NOT_PENDING' as const };

        const userId = crypto.randomUUID().replace(/-/g, '');
        const accountId = crypto.randomUUID().replace(/-/g, '');
        await tx.insert(user).values({
          id: userId,
          email: approved.email,
          name: approved.displayName,
          emailVerified: true,
          mustChangePassword: true,
        });
        await tx.insert(account).values({
          id: accountId,
          accountId: approved.email,
          providerId: 'credential',
          userId,
          password: passwordHash,
        });
        await tx.insert(staffProfiles).values({
          userId,
          displayName: approved.displayName,
          role: 'STAFF',
          team: approved.team,
          isActive: true,
        });
        await tx.insert(auditLogs).values({
          actorId: params.actorId,
          action: 'APPROVE_STAFF_APPLICATION',
          entityType: 'staff_application',
          entityId: approved.id,
          metadata: {
            email: approved.email,
            displayName: approved.displayName,
            userId,
            role: 'STAFF',
            mustChangePassword: true,
          },
        });

        return {
          success: true as const,
          application: toPublicApplication(approved),
          user: {
            id: userId,
            email: approved.email,
            role: 'STAFF' as const,
            isActive: true as const,
            mustChangePassword: true as const,
          },
        };
      });
    } catch (error) {
      if (error instanceof Error && /unique|duplicate/i.test(error.message)) {
        return { success: false, code: 'EMAIL_ALREADY_REGISTERED' };
      }
      throw error;
    }
  }

  if (isMemoryBackendAllowed()) {
    const application = inMemoryStaffApplications.find((candidate) => candidate.id === params.applicationId);
    if (!application) return { success: false, code: 'APPLICATION_NOT_FOUND' };
    if (application.status !== 'PENDING') return { success: false, code: 'APPLICATION_NOT_PENDING' };

    const provisioned = await provisionInMemoryStaffAccount({
      email: application.email,
      displayName: application.display_name,
      team: application.team,
      passwordHash,
      mustChangePassword: true,
    });
    if (!provisioned.success) return provisioned;

    application.status = 'APPROVED';
    application.rejection_reason = null;
    application.reviewed_by = params.actorId;
    application.reviewed_at = now.toISOString();
    application.updated_at = now.toISOString();
    await logAuditAction('APPROVE_STAFF_APPLICATION', 'staff_application', application.id, params.actorId, {
      email: application.email,
      displayName: application.display_name,
      userId: provisioned.user.user_id,
      role: 'STAFF',
    });
    return {
      success: true,
      application: toPublicMemoryApplication(application),
      user: {
        id: provisioned.user.user_id,
        email: provisioned.user.email,
        role: 'STAFF',
        isActive: true,
        mustChangePassword: true,
      },
    };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function rejectStaffApplication(params: {
  applicationId: string;
  actorId: string;
  reason: string;
}): Promise<RejectStaffApplicationResult> {
  const reason = params.reason.trim();
  if (!reason) return { success: false, code: 'REJECTION_REASON_REQUIRED' };
  await expirePendingStaffApplications();
  const now = new Date();

  if (db) {
    const result = await db.transaction(async (tx) => {
      const [application] = await tx
        .update(staffApplications)
        .set({ status: 'REJECTED', rejectionReason: reason, reviewedBy: params.actorId, reviewedAt: now, updatedAt: now })
        .where(and(eq(staffApplications.id, params.applicationId), eq(staffApplications.status, 'PENDING')))
        .returning();
      if (!application) return null;
      await tx.insert(auditLogs).values({
        actorId: params.actorId,
        action: 'REJECT_STAFF_APPLICATION',
        entityType: 'staff_application',
        entityId: application.id,
        metadata: { email: application.email, displayName: application.displayName, reason },
      });
      return application;
    });
    if (!result) {
      const [existing] = await db.select({ id: staffApplications.id }).from(staffApplications).where(eq(staffApplications.id, params.applicationId)).limit(1);
      return { success: false, code: existing ? 'APPLICATION_NOT_PENDING' : 'APPLICATION_NOT_FOUND' };
    }
    return { success: true, application: toPublicApplication(result) };
  }

  if (isMemoryBackendAllowed()) {
    const application = inMemoryStaffApplications.find((candidate) => candidate.id === params.applicationId);
    if (!application) return { success: false, code: 'APPLICATION_NOT_FOUND' };
    if (application.status !== 'PENDING') return { success: false, code: 'APPLICATION_NOT_PENDING' };
    application.status = 'REJECTED';
    application.rejection_reason = reason;
    application.reviewed_by = params.actorId;
    application.reviewed_at = now.toISOString();
    application.updated_at = now.toISOString();
    await logAuditAction('REJECT_STAFF_APPLICATION', 'staff_application', application.id, params.actorId, {
      email: application.email,
      displayName: application.display_name,
      reason,
    });
    return { success: true, application: toPublicMemoryApplication(application) };
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}
