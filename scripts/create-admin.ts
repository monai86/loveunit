// CLI Tool to create or update Admin/Staff accounts
// Usage:
//   npx tsx scripts/create-admin.ts <email> <password> <displayName> [role: STAFF|TEAM_LEAD|ADMIN|SUPER_ADMIN] [team]
// Example:
//   npx tsx scripts/create-admin.ts superadmin@mahidol.ac.th P@ssword2026 "Super Admin" SUPER_ADMIN Executive

import { loadEnvLocal } from './lib/env';

loadEnvLocal();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️  MUMT Blood Donation 2026 — Create / Update Admin Account Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usage:
  npx tsx scripts/create-admin.ts <email> <password> <displayName> [role] [team]

Arguments:
  email         Staff / Admin email address (e.g. admin@mahidol.ac.th)
  password      Account initial password (e.g. MyPassword@2026)
  displayName   Full Thai/English name (e.g. "ผู้ดูแลระบบ คณะเทคนิคการแพทย์")
  role          (Optional) STAFF | TEAM_LEAD | ADMIN | SUPER_ADMIN (Default: ADMIN)
  team          (Optional) Team name (e.g. "Management", "Checkin Flow")

Example:
  npx tsx scripts/create-admin.ts admin@mahidol.ac.th Admin@MUMT2026 "ผู้ดูแลระบบกลาง" SUPER_ADMIN Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    process.exit(1);
  }

  const [email, password, displayName, roleArg = 'ADMIN', team = 'Management'] = args;
  const validRoles = ['STAFF', 'TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN'] as const;
  type RoleType = typeof validRoles[number];

  const roleUpper = roleArg.toUpperCase() as RoleType;
  if (!validRoles.includes(roleUpper)) {
    console.error(`❌ Invalid role "${roleArg}". Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  const { auth } = await import('@/lib/auth');
  const { db } = await import('@/db');
  const { user, staffProfiles } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');

  if (!db) {
    console.error('❌ DATABASE_URL is not set in environment or .env.local.');
    process.exit(1);
  }

  console.log(`🔍 Checking user ${email}...`);

  const [foundUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  let userId: string;

  if (foundUser) {
    userId = foundUser.id;
    console.log(`ℹ️  User already exists with ID: ${userId}`);
  } else {
    const created = await auth.api.signUpEmail({
      body: { email, password, name: displayName },
    });
    if (!created?.user?.id) {
      throw new Error(`Better Auth signUpEmail failed for ${email}`);
    }
    userId = created.user.id;
    console.log(`✅ User registered successfully with ID: ${userId}`);
  }

  // Update staff profile
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
        role: roleUpper,
        team,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(staffProfiles.userId, userId));
    console.log(`✅ Updated existing staff profile to role: [${roleUpper}] (${displayName})`);
  } else {
    await db.insert(staffProfiles).values({
      userId,
      displayName,
      role: roleUpper,
      team,
      isActive: true,
    });
    console.log(`✅ Created new staff profile with role: [${roleUpper}] (${displayName})`);
  }

  console.log(`\n🎉 Success! Account [${email}] is ready with role [${roleUpper}].`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error creating admin user:', err);
  process.exit(1);
});
