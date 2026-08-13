// Seed staff accounts (user + staff_profiles) using Better Auth's own API so
// password hashing matches exactly what sign-in expects.
// Usage: npx tsx scripts/seed-staff.ts
// Loads .env.local for DATABASE_URL + BETTER_AUTH_* when present (CI injects
// env vars directly, same as apply-migration.ts).
import { loadEnvLocal } from './lib/env';

loadEnvLocal();

const ACCOUNTS: Array<{ email: string; password: string; displayName: string; role: 'STAFF' | 'TEAM_LEAD' | 'ADMIN' | 'SUPER_ADMIN'; team: string }> = [
  {
    email: 'admin@mahidol.ac.th',
    password: 'Admin@MUMT2026',
    displayName: 'ผู้ดูแลระบบ MUMT',
    role: 'ADMIN',
    team: 'Management',
  },
  {
    email: 'lead@mahidol.ac.th',
    password: 'Lead@MUMT2026',
    displayName: 'หัวหน้าทีมปฏิบัติการ',
    role: 'TEAM_LEAD',
    team: 'Flow Team',
  },
  {
    email: 'staff@mahidol.ac.th',
    password: 'Staff@MUMT2026',
    displayName: 'เจ้าหน้าที่จุดเช็คอิน',
    role: 'STAFF',
    team: 'Checkin Flow',
  },
];

async function main() {
  const { auth } = await import('@/lib/auth');
  const { db } = await import('@/db');
  const { staffProfiles } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');

  if (!db) {
    console.error('❌ DATABASE_URL not set — cannot seed.');
    process.exit(1);
  }

  const { user } = await import('@/db/schema');

  for (const acc of ACCOUNTS) {
    const [found] = await db
      .select()
      .from(user)
      .where(eq(user.email, acc.email))
      .limit(1);

    let userId: string;
    if (found) {
      userId = found.id;
      console.log(`ℹ️  user exists (${acc.email}) — reusing id ${userId}`);
    } else {
      const created = await auth.api.signUpEmail({
        body: { email: acc.email, password: acc.password, name: acc.displayName },
      });
      if (!created?.user?.id) {
        throw new Error(`signUpEmail returned no user for ${acc.email}`);
      }
      userId = created.user.id;
      console.log(`✅ created user ${acc.email} (${userId})`);
    }

    // Newly seeded accounts must change their password on first login.
    await db
      .update(user)
      .set({ mustChangePassword: true })
      .where(eq(user.id, userId));

    const [profile] = await db
      .select()
      .from(staffProfiles)
      .where(eq(staffProfiles.userId, userId))
      .limit(1);

    if (profile) {
      await db
        .update(staffProfiles)
        .set({ displayName: acc.displayName, role: acc.role, team: acc.team, isActive: true })
        .where(eq(staffProfiles.userId, userId));
      console.log(`ℹ️  profile updated for ${acc.email} (${acc.role})`);
    } else {
      await db.insert(staffProfiles).values({
        userId,
        displayName: acc.displayName,
        role: acc.role,
        team: acc.team,
        isActive: true,
      });
      console.log(`✅ profile created for ${acc.email} (${acc.role})`);
    }
  }

  console.log('\n🎉 Staff accounts ready. Change the passwords before production!');
  process.exit(0);
}

main().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});
