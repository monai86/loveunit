# Security & Privacy Guidelines — MUMT Blood Donation 2026

## Privacy Principles (Privacy-by-Design)

1. **Minimal Data Collection:**
   - We collect ONLY: Name, Phone Number, Email (optional), Participant Type, Faculty/Year (optional for students), Donation Experience, Arrival Slot choice.
   - We DO NOT collect: National ID, full home address, medical history, medications, or diagnostic history.

2. **Non-Medical Scope:**
   - The platform strictly handles event registration, arrival forecasting, check-in, and operational analytics.
   - It does NOT evaluate or guarantee medical eligibility to donate blood.
   - Medical screening is conducted independently by Thai Red Cross Society medical personnel on-site.

3. **Privacy Notice Consent:**
   - Users must explicitly acknowledge the privacy notice before completing public registration.

---

## Security Implementation & Least-Privilege RLS

1. **Least-Privilege Supabase RLS Policies:**
   - Direct public `SELECT` (`USING (TRUE)`) and direct public `INSERT` (`WITH CHECK (TRUE)`) on the `registrations` table are **strictly revoked**.
   - Public registrations occur exclusively through the trusted server endpoint `/api/events/[slug]/register` or `register_donor_atomic` (SECURITY DEFINER procedure).
   - Public confirmation lookups occur exclusively through controlled server-side endpoint `/api/registrations/[code]`.
   - Staff/Admin operations require authenticated `staff_profiles` membership.

2. **Opaque QR Code Tokens:**
   - QR codes encode an opaque cryptographic string (`MBD26_QR_MBD26-XXXXXX_<hash>`).
   - Scanners submit the token to the server to resolve registration records. No PII is embedded in the physical QR code image.

3. **Audit Logging:**
   - Every sensitive administrative action (e.g. data export to Excel) is recorded in `audit_logs` with timestamp, actor ID, and metadata count.

4. **Production Fail-Closed Behavior:**
   - If database credentials are missing in production runtime, the application fails closed with 503 Service Unavailable rather than silently storing registrations in volatile memory.
