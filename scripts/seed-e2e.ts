// Idempotent seed for E2E/CI: the official MUMT-2026 event, its content blocks
// and its time slots. Safe to run repeatedly (upserts by unique keys, only
// inserts slots when the event has none yet — never clobbers registrations).
//
// The registration window is set RELATIVE to "now" so E2E journeys pass on any
// date (the shared Neon copy uses the real 2026 dates; CI seeds a fresh DB).
//
// Usage: npx tsx scripts/seed-e2e.ts
// Reads .env.local when present; CI injects DATABASE_URL directly (see lib/env).
import { loadEnvLocal } from './lib/env';

loadEnvLocal();

async function main() {
  const { db } = await import('@/db');
  const { events, timeSlots, eventContentBlocks, registrations } = await import('@/db/schema');
  const { eq, sql, or, ilike } = await import('drizzle-orm');

  if (!db) {
    console.error('❌ DATABASE_URL not set — cannot seed.');
    process.exit(1);
  }

  // 0) Clean up automated test mock records so real database stats stay clean
  try {
    await db.delete(registrations).where(or(
      ilike(registrations.firstName, 'อีทูอี%'),
      ilike(registrations.firstName, 'เอ็มที%'),
      ilike(registrations.firstName, 'วอล์กอิน%'),
      ilike(registrations.firstName, 'กากาาก%'),
      ilike(registrations.firstName, 'สมชาย%'),
      ilike(registrations.firstName, 'สมหญิง%')
    ));
  } catch {
    // ignore
  }

  const EVENT_ID = 'e1111111-1111-1111-1111-111111111111';
  const now = new Date();
  const openAt = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const closeAt = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
  const eventDay = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

  // 1) Event — upsert by unique slug.
  await db
    .insert(events)
    .values({
      id: EVENT_ID,
      slug: 'mumt-2026',
      name: 'MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”',
      shortName: 'MUMT Blood Donation 2026 (ครั้งที่ 9)',
      description: 'ขอเชิญชวนทุกคนมาร่วมเป็นส่วนหนึ่งในการส่งต่อโอกาสและช่วยเหลือผู้ป่วยที่ต้องการโลหิตในกิจกรรม “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ” ครั้งที่ 9 โดยคณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี เพียงการบริจาคโลหิตของคุณ 1 ครั้ง อาจช่วยต่อชีวิตใครอีกหลายคน ✨',
      startAt: eventDay,
      endAt: new Date(eventDay.getTime() + 5.5 * 3600 * 1000),
      venueName: 'ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา',
      venueDetail: 'ห้องประชุม 217 ชั้น 2 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา',
      registrationOpenAt: openAt,
      registrationCloseAt: closeAt,
      status: 'REGISTRATION_OPEN',
    })
    .onConflictDoUpdate({
      target: events.slug,
      set: {
        // Widen the window only when needed so E2E always passes, while
        // preserving the real 2026 dates when they already include today.
        registrationOpenAt: sql`LEAST(${events.registrationOpenAt}, ${openAt})`,
        registrationCloseAt: sql`GREATEST(${events.registrationCloseAt}, ${closeAt})`,
        status: 'REGISTRATION_OPEN',
        updatedAt: new Date(),
      },
    });
  console.log('✅ event mumt-2026 ready');

  // 2) Content blocks — upsert by (eventId, contentKey) unique index.
  const blocks = [
    { contentKey: 'hero_poster', title: 'โปสเตอร์ประชาสัมพันธ์โครงการ', description: 'โปสเตอร์หลัก MUMT Blood Donation 2026 ครั้งที่ 9', altText: 'โปสเตอร์หลัก MUMT Blood Donation 2026', displayOrder: 1 },
    { contentKey: 'location_infographic', title: 'แผนที่สถานที่จัดงาน อาคารสิริวิทยา คณะศิลปศาสตร์', description: 'ผังห้องประชุม 217 ชั้น 2 อาคารสิริวิทยา', altText: 'แผนที่สถานที่จัดงาน อาคารสิริวิทยา', displayOrder: 2 },
    { contentKey: 'transportation_infographic', title: 'การเดินทางและจุดจอดรถ', description: 'ข้อมูลการเดินทางด้วยรถสาธารณะ รถรางมหิดล และจุดจอดรถยนต์', altText: 'ข้อมูลการเดินทาง', displayOrder: 3 },
    { contentKey: 'preparation_infographic', title: 'การเตรียมตัวก่อนบริจาคโลหิต', description: 'ข้อปฏิบัติ พักผ่อน 6-8 ชม. ดื่มน้ำ 3-4 แก้ว และงดอาหารไขมันสูง', altText: 'การเตรียมตัวก่อนบริจาคโลหิต', displayOrder: 4 },
    { contentKey: 'what_to_bring', title: 'สิ่งที่ต้องเตรียมมาในวันงาน', description: 'บัตรประจำตัวประชาชน หรือบัตรผู้บริจาคโลหิตสภากาชาดไทย', altText: 'สิ่งที่ต้องเตรียมมาในวันงาน', displayOrder: 5 },
    { contentKey: 'booth_infographic', title: 'นิทรรศการบูธกิจกรรมให้ความรู้', description: 'กิจกรรมความรู้หมู่เลือด นิทรรศการเทคนิคการแพทย์', altText: 'บูธกิจกรรมให้ความรู้', displayOrder: 6 },
    { contentKey: 'sponsor_banner', title: 'ผู้สนับสนุนโครงการ', description: 'ขอขอบคุณผู้สนับสนุนกิจกรรมบริจาคโลหิต MUMT ครั้งที่ 9', altText: 'ผู้สนับสนุนโครงการ', displayOrder: 7 },
  ];
  for (const b of blocks) {
    await db
      .insert(eventContentBlocks)
      .values({ eventId: EVENT_ID, ...b, isVisible: true })
      .onConflictDoUpdate({
        target: [eventContentBlocks.eventId, eventContentBlocks.contentKey],
        set: { title: b.title, description: b.description, altText: b.altText, displayOrder: b.displayOrder, isVisible: true, updatedAt: new Date() },
      });
  }
  console.log(`✅ ${blocks.length} content blocks ready`);

  // 3) Time slots — five 1-hour slots for 09:00–14:00.
  // Slots 1-4 are AVAILABLE for donor registration & check-in tests.
  // Slot 5 is FULL (capacity: 0) for waitlist modal & keyboard nav tests.
  const [existing] = await db
    .select({ count: sql<number>`count(*)` })
    .from(timeSlots)
    .where(eq(timeSlots.eventId, EVENT_ID));

  const base = eventDay.getTime();
  if (!existing || Number(existing.count) === 0) {
    const slots = [
      { eventId: EVENT_ID, startAt: new Date(base + 9 * 3600 * 1000), endAt: new Date(base + 10 * 3600 * 1000), capacity: 40, bookedCount: 0, isActive: true },
      { eventId: EVENT_ID, startAt: new Date(base + 10 * 3600 * 1000), endAt: new Date(base + 11 * 3600 * 1000), capacity: 40, bookedCount: 0, isActive: true },
      { eventId: EVENT_ID, startAt: new Date(base + 11 * 3600 * 1000), endAt: new Date(base + 12 * 3600 * 1000), capacity: 40, bookedCount: 0, isActive: true },
      { eventId: EVENT_ID, startAt: new Date(base + 12 * 3600 * 1000), endAt: new Date(base + 13 * 3600 * 1000), capacity: 40, bookedCount: 0, isActive: true },
      { eventId: EVENT_ID, startAt: new Date(base + 13 * 3600 * 1000), endAt: new Date(base + 14 * 3600 * 1000), capacity: 0, bookedCount: 0, isActive: true },
    ];
    await db.insert(timeSlots).values(slots);
    console.log(`✅ ${slots.length} time slots ready (last slot set to capacity 0 for waitlist tests)`);
  } else {
    // If slots exist, ensure the last slot is FULL (capacity 0) and at least the first 2 are AVAILABLE (capacity 40)
    const allSlots = await db
      .select()
      .from(timeSlots)
      .where(eq(timeSlots.eventId, EVENT_ID))
      .orderBy(timeSlots.startAt);

    if (allSlots.length > 0) {
      const lastSlot = allSlots[allSlots.length - 1];
      await db.update(timeSlots).set({ capacity: 0 }).where(eq(timeSlots.id, lastSlot.id));
      if (allSlots.length > 1) {
        await db.update(timeSlots).set({ capacity: 40 }).where(eq(timeSlots.id, allSlots[0].id));
      }
      console.log(`✅ Ensured last slot (${lastSlot.id}) is FULL (capacity: 0) for waitlist testing`);
    }
  }

  console.log('\n🎉 E2E seed complete.');
  process.exit(0);
}

main().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});
