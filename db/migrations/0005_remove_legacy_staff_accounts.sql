-- Keep the configured primary account as the only Super Admin and remove
-- demo staff accounts that were accidentally left in the production database.
UPDATE "staff_profiles" AS profile
SET "role" = 'SUPER_ADMIN', "updated_at" = now()
FROM "user" AS account
WHERE profile."user_id" = account."id"
  AND lower(account."email") = 'monai.yut@student.mahidol.edu';

UPDATE "staff_profiles" AS profile
SET "role" = 'ADMIN', "updated_at" = now()
FROM "user" AS account
WHERE profile."user_id" = account."id"
  AND profile."role" = 'SUPER_ADMIN'
  AND lower(account."email") <> 'monai.yut@student.mahidol.edu';

DELETE FROM "user"
WHERE lower("email") IN (
  'superadmin@mahidol.ac.th',
  'your-email@mahidol.ac.th',
  'staff@mahidol.ac.th',
  'lead@mahidol.ac.th',
  'admin@mahidol.ac.th'
);
