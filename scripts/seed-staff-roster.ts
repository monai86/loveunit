// Safe, idempotent seed script to populate staff accounts from data/staff-roster.ts
// Crucial Safety Guarantees:
// 1. NEVER overwrites or modifies existing staff accounts (preserves credentials, roles, teams).
// 2. Creates new credential accounts for unseeded staff with password 'loveunit2026'.
// 3. Sets mustChangePassword: false so staff can log in immediately on event day.
//
// Usage: npx tsx scripts/seed-staff-roster.ts

import { loadEnvLocal } from './lib/env';

loadEnvLocal();

async function main() {
  const { db } = await import('@/db');
  const { staffProfiles, user, account, staffApplications } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');
  const { hashPassword } = await import('better-auth/crypto');
  const { STAFF_ROSTER } = await import('../data/staff-roster');

  if (!db) {
    console.error('❌ DATABASE_URL not set — cannot seed staff roster.');
    process.exit(1);
  }

  console.log(`📋 Starting staff roster seeding (${STAFF_ROSTER.length} total candidates)...`);

  const defaultPasswordHash = await hashPassword('loveunit2026');
  const now = new Date();

  let skippedCount = 0;
  let attachedProfileCount = 0;
  let createdCount = 0;

  for (const member of STAFF_ROSTER) {
    const email = member.email.trim().toLowerCase();

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser) {
      // Check if user already has a staff profile
      const [existingProfile] = await db
        .select()
        .from(staffProfiles)
        .where(eq(staffProfiles.userId, existingUser.id))
        .limit(1);

      if (existingProfile) {
        // DO NOT TOUCH! Preserve all existing settings, role, password, and team.
        console.log(`  [SAFE KEEP] Already active staff: ${email} (${existingProfile.role} - ${existingProfile.team})`);
        skippedCount++;
        continue;
      } else {
        // User exists in user table but has no staffProfile yet
        await db.insert(staffProfiles).values({
          userId: existingUser.id,
          displayName: member.displayName,
          role: 'STAFF',
          team: member.team,
          isActive: true,
        });
        console.log(`  [ATTACH PROFILE] Attached staff profile to existing user: ${email} -> ${member.team}`);
        attachedProfileCount++;
      }
    } else {
      // Create fresh user, account, and staff profile
      const userId = crypto.randomUUID().replace(/-/g, '');
      const accountId = crypto.randomUUID().replace(/-/g, '');

      await db.insert(user).values({
        id: userId,
        email,
        name: member.displayName,
        emailVerified: true,
        mustChangePassword: false,
      });

      await db.insert(account).values({
        id: accountId,
        accountId: email,
        providerId: 'credential',
        userId,
        password: defaultPasswordHash,
      });

      await db.insert(staffProfiles).values({
        userId,
        displayName: member.displayName,
        role: 'STAFF',
        team: member.team,
        isActive: true,
      });

      // Synchronize staff_applications table if exists or insert approved record for audit trail
      const [pendingApp] = await db
        .select()
        .from(staffApplications)
        .where(eq(staffApplications.email, email))
        .limit(1);

      if (pendingApp) {
        await db
          .update(staffApplications)
          .set({
            status: 'APPROVED',
            displayName: member.displayName,
            team: member.team,
            updatedAt: now,
          })
          .where(eq(staffApplications.id, pendingApp.id));
      } else {
        const refCode = `APP-${member.studentId || Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        try {
          await db.insert(staffApplications).values({
            referenceCode: refCode,
            email,
            displayName: member.displayName,
            team: member.team,
            status: 'APPROVED',
            expiresAt,
            createdAt: now,
            updatedAt: now,
          });
        } catch {
          // Ignore unique reference code collision if any
        }
      }

      console.log(`  [CREATED] Created staff: ${email} (${member.displayName}) -> ${member.team}`);
      createdCount++;
    }
  }

  console.log('\n================ SEED SUMMARY ================');
  console.log(`Total roster: ${STAFF_ROSTER.length}`);
  console.log(`Existing untouched staff: ${skippedCount}`);
  console.log(`Attached profiles: ${attachedProfileCount}`);
  console.log(`Newly created staff: ${createdCount}`);
  console.log(`Default login password for new staff: loveunit2026`);
  console.log('==============================================\n');
}

main().catch((err) => {
  console.error('❌ Error executing staff roster seeding:', err);
  process.exit(1);
});
