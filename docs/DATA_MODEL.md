# Data Model — MUMT Blood Donation 2026

## Entity Relationship Summary

```text
events (1) ───< event_content_blocks (N)
events (1) ───< time_slots (N) ───< registrations (N)
events (1) ───< checkin_events (N)
events (1) ───< feedback (N)
auth.users (1) ─── staff_profiles (1)
```

## Table Specifications

### 1. `events`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique event identifier |
| `slug` | TEXT (UNIQUE) | Human-readable URL slug (`mumt-2026`) |
| `name` | TEXT | Full event title |
| `status` | ENUM | `DRAFT`, `PUBLISHED`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `COMPLETED` |

### 2. `time_slots`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Slot ID |
| `event_id` | UUID (FK) | Reference to event |
| `start_at` | TIMESTAMPTZ | Slot start time |
| `end_at` | TIMESTAMPTZ | Slot end time |
| `capacity` | INT | Max allowed registrations |
| `booked_count` | INT | Current booked count |

### 3. `registrations`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Registration ID |
| `registration_code` | TEXT (UNIQUE) | Format `MBD26-XXXXXX` |
| `qr_token` | TEXT (UNIQUE) | Secure random opaque hash |
| `phone_normalized` | TEXT | Cleaned 10-digit phone for duplicate check |
| `participant_type` | ENUM | `STUDENT`, `STAFF`, `GENERAL_PUBLIC` |
| `status` | ENUM | `REGISTERED`, `CHECKED_IN`, `IN_PROCESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `source` | ENUM | `ONLINE`, `WALK_IN`, `ADMIN` |

### 4. `event_content_blocks`
| Field | Type | Description |
|-------|------|-------------|
| `content_key` | TEXT | E.g. `hero_poster`, `preparation_infographic`, `location_infographic` |
| `title` | TEXT | Title |
| `image_url` | TEXT (Nullable) | URL to image artwork |
| `is_visible` | BOOLEAN | Visibility toggle |
