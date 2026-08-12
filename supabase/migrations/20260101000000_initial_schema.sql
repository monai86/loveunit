-- MUMT Blood Donation 2026 Initial Schema Migration
-- Hardened Security & Least-Privilege RLS Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE participant_type_enum AS ENUM ('STUDENT', 'STAFF', 'GENERAL_PUBLIC');
CREATE TYPE donation_experience_enum AS ENUM ('FIRST_TIME', 'RETURNING');
CREATE TYPE registration_source_enum AS ENUM ('ONLINE', 'WALK_IN', 'ADMIN');
CREATE TYPE registration_status_enum AS ENUM ('REGISTERED', 'CHECKED_IN', 'IN_PROCESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE staff_role_enum AS ENUM ('STAFF', 'TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE event_status_enum AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED', 'ARCHIVED');

-- 1. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    venue_name TEXT NOT NULL,
    venue_detail TEXT NOT NULL,
    registration_open_at TIMESTAMPTZ NOT NULL,
    registration_close_at TIMESTAMPTZ NOT NULL,
    status event_status_enum NOT NULL DEFAULT 'REGISTRATION_OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- 2. Event Content Blocks
CREATE TABLE IF NOT EXISTS event_content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    content_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    alt_text TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, content_key)
);

-- 3. Time Slots Table
CREATE TABLE IF NOT EXISTS time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    capacity INT NOT NULL DEFAULT 35,
    booked_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_slots_event_start ON time_slots(event_id, start_at);

-- 4. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_code TEXT UNIQUE NOT NULL,
    qr_token TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_normalized TEXT NOT NULL,
    email TEXT,
    participant_type participant_type_enum NOT NULL,
    faculty TEXT,
    academic_year TEXT,
    donation_experience donation_experience_enum NOT NULL,
    slot_id UUID REFERENCES time_slots(id) ON DELETE SET NULL,
    status registration_status_enum NOT NULL DEFAULT 'REGISTERED',
    source registration_source_enum NOT NULL DEFAULT 'ONLINE',
    privacy_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_in_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_code ON registrations(registration_code);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON registrations(qr_token);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_event_phone 
ON registrations (event_id, phone_normalized) 
WHERE status != 'CANCELLED';

-- 5. Staff Profiles Table
CREATE TABLE IF NOT EXISTS staff_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role staff_role_enum NOT NULL DEFAULT 'STAFF',
    team TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Checkin Events Table
CREATE TABLE IF NOT EXISTS checkin_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    knowledge_rating INT CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
    experience_rating INT CHECK (experience_rating >= 1 AND experience_rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ATOMIC SLOT BOOKING STORED PROCEDURE (Capacity-Safe Registration)
CREATE OR REPLACE FUNCTION register_donor_atomic(
    p_event_id UUID,
    p_registration_code TEXT,
    p_qr_token TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT,
    p_phone_normalized TEXT,
    p_email TEXT,
    p_participant_type participant_type_enum,
    p_faculty TEXT,
    p_academic_year TEXT,
    p_donation_experience donation_experience_enum,
    p_slot_id UUID,
    p_source registration_source_enum DEFAULT 'ONLINE'
) RETURNS JSONB AS $$
DECLARE
    v_slot_capacity INT;
    v_slot_booked INT;
    v_registration_id UUID;
    v_duplicate_count INT;
BEGIN
    SELECT COUNT(*) INTO v_duplicate_count 
    FROM registrations 
    WHERE event_id = p_event_id AND phone_normalized = p_phone_normalized AND status != 'CANCELLED';

    IF v_duplicate_count > 0 THEN
        RETURN jsonb_build_object('success', false, 'error_code', 'DUPLICATE_REGISTRATION', 'message', 'พบการลงทะเบียนสำหรับหมายเลขนี้แล้ว');
    END IF;

    IF p_slot_id IS NOT NULL THEN
        SELECT capacity, booked_count INTO v_slot_capacity, v_slot_booked
        FROM time_slots
        WHERE id = p_slot_id AND event_id = p_event_id AND is_active = TRUE
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error_code', 'SLOT_NOT_FOUND', 'message', 'ไม่พบช่วงเวลาที่เลือก');
        END IF;

        IF v_slot_booked >= v_slot_capacity THEN
            RETURN jsonb_build_object('success', false, 'error_code', 'SLOT_FULL', 'message', 'ช่วงเวลานี้เพิ่งเต็ม กรุณาเลือกช่วงเวลาอื่น');
        END IF;

        UPDATE time_slots
        SET booked_count = booked_count + 1
        WHERE id = p_slot_id;
    END IF;

    INSERT INTO registrations (
        event_id, registration_code, qr_token, first_name, last_name,
        phone, phone_normalized, email, participant_type, faculty,
        academic_year, donation_experience, slot_id, status, source, privacy_accepted
    ) VALUES (
        p_event_id, p_registration_code, p_qr_token, p_first_name, p_last_name,
        p_phone, p_phone_normalized, p_email, p_participant_type, p_faculty,
        p_academic_year, p_donation_experience, p_slot_id, 'REGISTERED', p_source, TRUE
    ) RETURNING id INTO v_registration_id;

    RETURN jsonb_build_object(
        'success', true,
        'registration_id', v_registration_id,
        'registration_code', p_registration_code,
        'qr_token', p_qr_token
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- HARDENED RPC EXECUTE PERMISSIONS: REVOKE DIRECT PUBLIC/ANON EXECUTE
REVOKE EXECUTE ON FUNCTION register_donor_atomic FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION register_donor_atomic FROM anon;
REVOKE EXECUTE ON FUNCTION register_donor_atomic FROM authenticated;
GRANT EXECUTE ON FUNCTION register_donor_atomic TO service_role;
GRANT EXECUTE ON FUNCTION register_donor_atomic TO postgres;

-- ROW LEVEL SECURITY POLICIES (LEAST-PRIVILEGE HARDENED)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Public can read published events, content blocks, and time slots
CREATE POLICY "Public can view published events" ON events FOR SELECT USING (status IN ('PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED'));
CREATE POLICY "Public can view visible content blocks" ON event_content_blocks FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "Public can view active time slots" ON time_slots FOR SELECT USING (is_active = TRUE);

-- P0 SECURITY FIX: NO DIRECT PUBLIC SELECT OR INSERT ON REGISTRATIONS TABLE
-- Public registration happens ONLY via server-side endpoints calling register_donor_atomic (SECURITY DEFINER)
-- Public lookups happen ONLY via controlled server endpoint /api/registrations/[code] using service role

-- Authenticated Staff & Admins full management
CREATE POLICY "Staff can view registrations" ON registrations FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND is_active = TRUE)
);
CREATE POLICY "Staff can update registration checkin status" ON registrations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND is_active = TRUE)
);
CREATE POLICY "Staff can insert registrations" ON registrations FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND is_active = TRUE)
);
