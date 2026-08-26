// CLI Tool to create or update Admin accounts
// Usage:
//   npx tsx scripts/create-admin.ts <email> <password> <displayName> [team]
// Example:
//   npx tsx scripts/create-admin.ts admin@mahidol.ac.th Admin@MUMT2026 "ผู้ดูแลระบบ MUMT" Management

import { loadEnvLocal } from './lib/env';

loadEnvLocal();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️  MUMT Blood Donation 2026 — Create / Update Admin Account Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usage:
  npx tsx scripts/create-admin.ts <email> <password> [displayName] [team]

Arguments:
  email         Admin email address (e.g. admin@mahidol.ac.th)
  password      Account password (e.g. Admin@MUMT2026)
  displayName   (Optional) Full name (e.g. "ผู้ดูแลระบบ MUMT", default: "Admin")
  team          (Optional) Team/Dept (e.g. "Management", default: "Management")

Example:
  npx tsx scripts/create-admin.ts admin@mahidol.ac.th Admin@MUMT2026 "ผู้ดูแลระบบ MUMT" Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    process.exit(1);
  }

  const [emailArg, password, displayName = 'ผู้ดูแลระบบ MUMT', team = 'Management'] = args;
  const email = emailArg.trim().toLowerCase();

  const { auth } = await import('@/lib/auth');
  const { db } = await import('@/db');
  const { user, staffProfiles, account } = await import('@/db/schema');
  const { eq, and } = await import('drizzle-orm');
  const { hashPassword } = await import('better-auth/crypto');

  if (!db) {
    console.error('❌ DATABASE_URL is not set in environment or .env.local.');
    process.exit(1);
  }

  console.log(`🔍 Checking Admin account [${email}]...`);

  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  let userId: string;
  const hashedPassword = await hashPassword(password);

  if (foundUser) {
    userId = foundUser.id;
    console.log(`ℹ️  User already exists with ID: ${userId}`);

    // Update user profile name and reset mustChangePassword flag
    await db
      .update(user)
      .set({
        name: displayName,
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Update or insert password in account table
    const [existingAccount] = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))
      .limit(1);

    if (existingAccount) {
      await db
        .update(account)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(account.id, existingAccount.id));
      console.log(`🔑 Password updated successfully for [${email}]`);
    } else {
      const newAccId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, '')
        : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      await db.insert(account).values({
        id: newAccId,
        accountId: email,
        providerId: 'credential',
        userId,
        password: hashedPassword,
      });
      console.log(`🔑 Credential account created for [${email}]`);
    }
  } else {
    // Create new user via Better Auth
    try {
      const created = await auth.api.signUpEmail({
        body: { email, password, name: displayName },
      });
      if (created?.user?.id) {
        userId = created.user.id;
        console.log(`✅ User registered via Better Auth with ID: ${userId}`);
      } else {
        throw new Error('signUpEmail returned empty user');
      }
    } catch {
      // Fallback: direct insert
      const newUserId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, '')
        : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      await db.insert(user).values({
        id: newUserId,
        email,
        name: displayName,
        emailVerified: true,
        mustChangePassword: false,
      });
      userId = newUserId;

      const newAccId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, '')
        : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      await db.insert(account).values({
        id: newAccId,
        accountId: email,
        providerId: 'credential',
        userId,
        password: hashedPassword,
      });
      console.log(`✅ User directly inserted with ID: ${userId}`);
    }
  }

  // Ensure mustChangePassword is false
  await db
    .update(user)
    .set({ mustChangePassword: false })
    .where(eq(user.id, userId));

  // Update or insert staff profile with role = 'ADMIN'
  const [profile] = await db
    .select()
    .from(staffProfiles)
    .where(eq(staffProfiles.userId, userId))
    .limit(1);

  if (profile) {
    await db
      .update(staffProfiles)
      .set({
        displayName,
        role: 'ADMIN',
        team,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(staffProfiles.userId, userId));
    console.log(`✅ Updated staff profile to role: [ADMIN] (${displayName})`);
  } else {
    await db.insert(staffProfiles).values({
      userId,
      displayName,
      role: 'ADMIN',
      team,
      isActive: true,
    });
    console.log(`✅ Created new staff profile with role: [ADMIN] (${displayName})`);
  }

  console.log(`\n🎉 Success! Admin account [${email}] is ready with role [ADMIN].`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error creating/updating admin user:', err);
  process.exit(1);
});
