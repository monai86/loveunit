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
  const { events, timeSlots, eventContentBlocks } = await import('@/db/schema');
  const { eq, sql } = await import('drizzle-orm');

  if (!db) {
    console.error('❌ DATABASE_URL not set — cannot seed.');
    process.exit(1);
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
      description: 'ขอเชิญชวนผู้มีจิตศรัทธาร่วมบริจาคโลหิตในโครงการเติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9 จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ สภากาชาดไทย',
      startAt: eventDay,
      endAt: new Date(eventDay.getTime() + 7 * 3600 * 1000),
      venueName: 'ห้องประชุม 217 และ 218 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา',
      venueDetail: 'ห้องประชุม 217 และ 218 ชั้น 2 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา',
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
    { contentKey: 'location_infographic', title: 'แผนที่สถานที่จัดงาน อาคารสิริวิทยา คณะศิลปศาสตร์', description: 'ผังห้องประชุม 217 และ 218 ชั้น 2 อาคารสิริวิทยา', altText: 'แผนที่สถานที่จัดงาน อาคารสิริวิทยา', displayOrder: 2 },
    { contentKey: 'transportation_infographic', title: 'การเดินทางและจุดจอดรถ', description: 'ข้อมูลการเดินทางด้วยรถสาธารณะ รถรางมหิดล และจุดจอดรถยนต์', altText: 'ข้อมูลการเดินทาง', displayOrder: 3 },
    { contentKey: 'preparation_infographic', title: 'การเตรียมตัวก่อนบริจาคโลหิต', description: 'ข้อปฏิบัติ พักผ่อน 6-8 ชม. ดื่มน้ำ 3-4 แก้ว และงดอาหารไขมันสูง', altText: 'การเตรียมตัวก่อนบริจาคโลหิต', displayOrder: 4 },
    { contentKey: 'what_to_bring', title: 'สิ่งที่ต้องเตรียมมาในวันงาน', description: 'บัตรประชาชน หรือบัตรผู้บริจาคโลหิตสภากาชาดไทย', altText: 'สิ่งที่ต้องเตรียมมาในวันงาน', displayOrder: 5 },
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

  // 3) Time slots — only when the event has none (never disturb real bookings).
  const [existing] = await db
    .select({ count: sql<number>`count(*)` })
    .from(timeSlots)
    .where(eq(timeSlots.eventId, EVENT_ID));

  if (!existing || Number(existing.count) === 0) {
    const hour = 8;
    const slots = Array.from({ length: 7 }, (_, i) => ({
      eventId: EVENT_ID,
      startAt: new Date(eventDay.getTime() + (hour + i) * 3600 * 1000),
      endAt: new Date(eventDay.getTime() + (hour + i + 1) * 3600 * 1000),
      capacity: 35,
      bookedCount: 0,
      isActive: true,
    }));
    await db.insert(timeSlots).values(slots);
    console.log(`✅ ${slots.length} time slots ready`);
  } else {
    console.log(`ℹ️  ${existing.count} time slots already exist — skipping`);
  }

  console.log('\n🎉 E2E seed complete.');
  process.exit(0);
}

main().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});
