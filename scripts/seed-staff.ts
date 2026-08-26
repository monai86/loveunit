// Seed Admin account (user + staff_profiles) using Better Auth's own API so
// password hashing matches exactly what sign-in expects.
// Usage: npx tsx scripts/seed-staff.ts
import { loadEnvLocal } from './lib/env';

loadEnvLocal();

const ACCOUNTS: Array<{ email: string; password: string; displayName: string; role: 'ADMIN'; team: string }> = [
  {
    email: 'admin@mahidol.ac.th',
    password: 'Admin@MUMT2026',
    displayName: 'ผู้ดูแลระบบ MUMT',
    role: 'ADMIN',
    team: 'Management',
  },
  {
    email: 'staff@mahidol.ac.th',
    password: 'Staff@MUMT2026',
    displayName: 'เจ้าหน้าที่จุดเช็คอิน',
    role: 'ADMIN',
    team: 'Operations',
  },
  {
    email: 'lead@mahidol.ac.th',
    password: 'Lead@MUMT2026',
    displayName: 'หัวหน้าทีมปฏิบัติการ',
    role: 'ADMIN',
    team: 'Operations',
  },
];

async function main() {
  const { auth } = await import('@/lib/auth');
  const { db } = await import('@/db');
  const { staffProfiles, user, account } = await import('@/db/schema');
  const { eq, and } = await import('drizzle-orm');
  const { hashPassword } = await import('better-auth/crypto');

  if (!db) {
    console.error('❌ DATABASE_URL not set — cannot seed.');
    process.exit(1);
  }

  // Update any existing staff profiles in DB to role = 'ADMIN'
  try {
    await db.update(staffProfiles).set({ role: 'ADMIN' });
    console.log('🔄 All existing profiles normalized to role [ADMIN].');
  } catch (e) {
    console.warn('⚠️ Profile normalization warning:', e);
  }

  for (const acc of ACCOUNTS) {
    const [found] = await db
      .select()
      .from(user)
      .where(eq(user.email, acc.email))
      .limit(1);

    const hashedPassword = await hashPassword(acc.password);

    let userId: string;
    if (found) {
      userId = found.id;
      console.log(`ℹ️  User exists (${acc.email}) — reusing id ${userId}`);

      // Ensure password in account table is synchronized with seed password
      const [accRecord] = await db
        .select()
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
        .limit(1);

      if (accRecord) {
        await db
          .update(account)
          .set({ password: hashedPassword, updatedAt: new Date() })
          .where(eq(account.id, accRecord.id));
      } else {
        const newAccId = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        await db.insert(account).values({
          id: newAccId,
          accountId: acc.email,
          providerId: 'credential',
          userId,
          password: hashedPassword,
        });
      }
    } else {
      const created = await auth.api.signUpEmail({
        body: { email: acc.email, password: acc.password, name: acc.displayName },
      });
      if (!created?.user?.id) {
        throw new Error(`signUpEmail returned no user for ${acc.email}`);
      }
      userId = created.user.id;
      console.log(`✅ Created user ${acc.email} (${userId})`);
    }

    // Seeded accounts are ready for direct login without forced password change
    await db
      .update(user)
      .set({ mustChangePassword: false, name: acc.displayName })
      .where(eq(user.id, userId));

    const [profile] = await db
      .select()
      .from(staffProfiles)
      .where(eq(staffProfiles.userId, userId))
      .limit(1);

    if (profile) {
      await db
        .update(staffProfiles)
        .set({ displayName: acc.displayName, role: 'ADMIN', team: acc.team, isActive: true })
        .where(eq(staffProfiles.userId, userId));
      console.log(`ℹ️  Profile updated for ${acc.email} (ADMIN)`);
    } else {
      await db.insert(staffProfiles).values({
        userId,
        displayName: acc.displayName,
        role: 'ADMIN',
        team: acc.team,
        isActive: true,
      });
      console.log(`✅ Profile created for ${acc.email} (ADMIN)`);
    }
  }

  console.log('\n🎉 Admin account ready (admin@mahidol.ac.th / Admin@MUMT2026)!');
  process.exit(0);
}

main().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});
