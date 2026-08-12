# Data Model & Drizzle Schema — MUMT Blood Donation 2026

## Entity Relationship Summary

The database uses PostgreSQL-native types managed by Drizzle ORM (`db/schema/*`).

### 1. Events (`events`)
- `id` (UUID PK)
- `slug` (Text Unique)
- `name` (Text)
- `short_name` (Text)
- `description` (Text)
- `start_at` (Timestamp with timezone)
- `end_at` (Timestamp with timezone)
- `venue_name` (Text)
- `venue_detail` (Text)
- `registration_open_at` (Timestamp with timezone)
- `registration_close_at` (Timestamp with timezone)
- `status` (Enum: `DRAFT`, `PUBLISHED`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `COMPLETED`, `ARCHIVED`)

### 2. Time Slots (`time_slots`)
- `id` (UUID PK)
- `event_id` (UUID FK -> `events.id`)
- `start_at` (Timestamp with timezone)
- `end_at` (Timestamp with timezone)
- `capacity` (Integer, default 35)
- `booked_count` (Integer, default 0)
- `is_active` (Boolean)

### 3. Registrations (`registrations`)
- `id` (UUID PK)
- `event_id` (UUID FK -> `events.id`)
- `registration_code` (Text Unique)
- `qr_token` (Text Unique)
- `first_name` (Text)
- `last_name` (Text)
- `phone` (Text)
- `phone_normalized` (Text)
- `email` (Text Nullable)
- `participant_type` (Enum: `STUDENT`, `STAFF`, `GENERAL_PUBLIC`)
- `faculty` (Text Nullable)
- `academic_year` (Text Nullable)
- `donation_experience` (Enum: `FIRST_TIME`, `RETURNING`)
- `slot_id` (UUID FK -> `time_slots.id` Nullable)
- `status` (Enum: `REGISTERED`, `CHECKED_IN`, `IN_PROCESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`)
- `source` (Enum: `ONLINE`, `WALK_IN`, `ADMIN`)
- **Constraint:** Unique index `idx_registrations_event_phone` on `(event_id, phone_normalized)`

### 4. Staff Profiles (`staff_profiles`)
- `user_id` (Text PK -> `user.id` Better Auth)
- `display_name` (Text)
- `role` (Enum: `STAFF`, `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN`)
- `team` (Text Nullable)
- `is_active` (Boolean)

### 5. Better Auth Schema (`user`, `session`, `account`, `verification`)
- Standard Better Auth PostgreSQL tables managed via Drizzle adapter.
