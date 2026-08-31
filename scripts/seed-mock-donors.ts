import * as fs from 'fs';
import * as path from 'path';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// Parse .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is missing in .env.local');
  process.exit(1);
}

const sql = neon(connectionString);

const THAI_FIRST_NAMES = [
  'กิตติศักดิ์', 'ณภัทร', 'ธนพล', 'ปัณณวิชญ์', 'ภานุวัฒน์', 'วรเมธ', 'ศิรวิชญ์', 'อนุชา', 'อัครพล', 'ชานนท์',
  'กมลวรรณ', 'จิราพร', 'ชญานิศ', 'ณิชากานต์', 'ธัญญารัตน์', 'เบญญาภา', 'ปรียานุช', 'พิมลภัส', 'วริศรา', 'สุชาดา',
  'กฤษฎา', 'ชินดนัย', 'ณัฐภัทร', 'ทศพร', 'ธีรภัทร', 'พงศกร', 'ภูวเดช', 'รชต', 'วรภพ', 'ศุภกิตติ์',
  'กานต์พิชชา', 'จารุวรรณ', 'ชลธิชา', 'ณัฐณิชา', 'ธิดารัตน์', 'ปวริศา', 'พัชริดา', 'มนัสนันท์', 'รินรดา', 'ศศิวิมล',
  'กรวิชญ์', 'เจษฎา', 'ณฐกร', 'ธนาธิป', 'ปพน', 'พชร', 'เมธัส', 'วชิรวิชญ์', 'สิทธิโชค', 'อัครเดช',
  'กุลธิดา', 'ชนากานต์', 'ฐิตารีย์', 'ณัฐวดี', 'นันท์นภัส', 'ปัณฑิตา', 'พิชญ์สินี', 'รพีพรรณ', 'ศุภิสรา', 'อรัญญา'
];

const THAI_LAST_NAMES = [
  'รัตนวิบูลย์', 'สุขสมบูรณ์', 'เจริญผล', 'ศรีสุวรรณ', 'พงษ์พาณิชย์', 'ทองประเสริฐ', 'วัฒนเมธี', 'อัครเดชา', 'ชัยมงคล', 'ประเสริฐสุข',
  'สิริจันทรา', 'บุญญารักษ์', 'วรทัศน์', 'เกียรติบำรุง', 'มหาวีระ', 'อินทรทัต', 'จิตตวัฒน์', 'พิทยาคม', 'ธรรมเจริญ', 'วงศ์สุริยะ',
  'เกศกมล', 'ชาญปรีชา', 'ดวงมณี', 'ธนบดี', 'นันทิวัชร', 'บวรศิลป์', 'ปรีชาวงศ์', 'มงคลสถิตย์', 'ยงยุทธการ', 'วชิรปราการ',
  'ศักดิ์สิทธิ์', 'ศิริพัฒน์', 'สมบูรณ์ผล', 'อนันตคุณ', 'อรรถสิทธิ์', 'จตุรพิธ', 'ชินวัตร', 'ฐิติพงศ์', 'ณรงค์เดช', 'ดนุพล'
];

const FACULTIES = [
  'คณะเทคนิคการแพทย์',
  'คณะแพทยศาสตร์ศิริราชพยาบาล',
  'คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี',
  'คณะพยาบาลศาสตร์',
  'คณะเภสัชศาสตร์',
  'คณะทันตแพทยศาสตร์',
  'คณะวิศวกรรมศาสตร์',
  'คณะวิทยาศาสตร์',
  'คณะศิลปศาสตร์',
  'วิทยาลัยดุริยางคศิลป์',
  'วิทยาลัยนานาชาติ',
  'คณะสิ่งแวดล้อมและทรัพยากรศาสตร์'
];

async function seed() {
  console.log('🌱 Starting Mock Donors Seeder for LoveUnit 2026...');

  // 1. Get default event
  const events = await sql`SELECT * FROM events WHERE slug = 'mumt-2026' LIMIT 1`;
  if (events.length === 0) {
    console.error('❌ Event mumt-2026 not found.');
    process.exit(1);
  }
  const event = events[0];
  console.log(`✓ Event found: ${event.title} (${event.id})`);

  // 2. Get active time slots
  const slots = await sql`SELECT * FROM time_slots WHERE event_id = ${event.id} ORDER BY start_at ASC`;
  if (slots.length === 0) {
    console.error('❌ Time slots not found for this event.');
    process.exit(1);
  }
  console.log(`✓ Found ${slots.length} time slots.`);

  // 3. Clear existing registrations to ensure clean sequence and non-conflicting numbers
  console.log('🧹 Clearing existing registrations for clean demo dataset...');
  await sql`DELETE FROM checkin_events WHERE event_id = ${event.id}`;
  await sql`DELETE FROM registrations WHERE event_id = ${event.id}`;
  console.log('✓ Cleared.');

  // Base timestamps
  const baseRegisterDate = new Date('2026-08-20T10:00:00+07:00');
  const baseCheckinDate = new Date('2026-08-31T09:15:00+07:00');

  // --- A. Generate 105 Online Registrations (LVU26-001 to LVU26-105) ---
  console.log('📦 Seeding 105 Online Registrations (LVU26-001 to LVU26-105)...');

  for (let i = 1; i <= 105; i++) {
    const code = `LVU26-${String(i).padStart(3, '0')}`;
    const qrToken = `LVU26_QR_${code}_${crypto.randomBytes(4).toString('hex')}`;
    const firstName = THAI_FIRST_NAMES[(i - 1) % THAI_FIRST_NAMES.length];
    const lastName = THAI_LAST_NAMES[((i - 1) * 3) % THAI_LAST_NAMES.length];
    const phone = `081-${String(100 + i).padStart(3, '0')}-${String(1000 + i).slice(-4)}`;
    const phoneNormalized = `081${String(100 + i).padStart(3, '0')}${String(1000 + i).slice(-4)}`;
    const faculty = FACULTIES[i % FACULTIES.length];
    const pType = i % 5 === 0 ? 'STAFF' : i % 7 === 0 ? 'GENERAL_PUBLIC' : 'STUDENT';
    const slot = slots[(i - 1) % slots.length];

    let status = 'REGISTERED';
    let checkedInAt: string | null = null;
    let completedAt: string | null = null;

    const regTime = new Date(baseRegisterDate.getTime() + i * 60000).toISOString();

    if (i <= 90) {
      status = 'COMPLETED';
      const checkinDate = new Date(baseCheckinDate.getTime() + i * 90000);
      checkedInAt = checkinDate.toISOString();
      completedAt = new Date(checkinDate.getTime() + 15 * 60000).toISOString();
    } else if (i <= 98) {
      status = 'CHECKED_IN';
      checkedInAt = new Date(baseCheckinDate.getTime() + i * 90000).toISOString();
    } else {
      status = 'REGISTERED';
    }

    const academicYear = pType === 'STUDENT' ? `ปี ${((i - 1) % 4) + 1}` : null;
    const donationExperience = i % 3 === 0 ? 'FIRST_TIME' : 'RETURNING';
    const email = `${phoneNormalized}@student.mahidol.edu`;

    await sql`
      INSERT INTO registrations (
        event_id, registration_code, qr_token, first_name, last_name,
        phone, phone_normalized, email, participant_type, faculty,
        academic_year, donation_experience, slot_id, status, source,
        privacy_accepted, registered_at, checked_in_at, completed_at
      ) VALUES (
        ${event.id}, ${code}, ${qrToken}, ${firstName}, ${lastName},
        ${phone}, ${phoneNormalized}, ${email}, ${pType}, ${faculty},
        ${academicYear}, ${donationExperience}, ${slot.id}, ${status}, 'ONLINE',
        true, ${regTime}, ${checkedInAt}, ${completedAt}
      )
    `;
  }
  console.log('✓ Successfully seeded 105 Online Donors (LVU26-001 to LVU26-105).');

  // --- B. Generate 105 Walk-in Registrations (LVU26-W001 to LVU26-W105) ---
  console.log('🚶 Seeding 105 Walk-in Registrations (LVU26-W001 to LVU26-W105)...');

  for (let i = 1; i <= 105; i++) {
    const code = `LVU26-W${String(i).padStart(3, '0')}`;
    const qrToken = `LVU26_QR_${code}_${crypto.randomBytes(4).toString('hex')}`;
    const firstName = THAI_FIRST_NAMES[(i + 15) % THAI_FIRST_NAMES.length];
    const lastName = THAI_LAST_NAMES[((i + 7) * 2) % THAI_LAST_NAMES.length];
    const phone = `089-${String(200 + i).padStart(3, '0')}-${String(2000 + i).slice(-4)}`;
    const phoneNormalized = `089${String(200 + i).padStart(3, '0')}${String(2000 + i).slice(-4)}`;
    const faculty = FACULTIES[(i + 3) % FACULTIES.length];
    const pType = i % 4 === 0 ? 'STAFF' : i % 6 === 0 ? 'GENERAL_PUBLIC' : 'STUDENT';

    let status = 'CHECKED_IN';
    const checkinDate = new Date(baseCheckinDate.getTime() + (i + 100) * 80000);
    const checkedInAt = checkinDate.toISOString();
    let completedAt: string | null = null;

    if (i <= 98) {
      status = 'COMPLETED';
      completedAt = new Date(checkinDate.getTime() + 18 * 60000).toISOString();
    } else {
      status = 'CHECKED_IN';
    }

    const academicYear = pType === 'STUDENT' ? `ปี ${((i + 1) % 4) + 1}` : null;
    const donationExperience = i % 2 === 0 ? 'FIRST_TIME' : 'RETURNING';
    const email = `${phoneNormalized}@example.com`;

    await sql`
      INSERT INTO registrations (
        event_id, registration_code, qr_token, first_name, last_name,
        phone, phone_normalized, email, participant_type, faculty,
        academic_year, donation_experience, slot_id, status, source,
        privacy_accepted, registered_at, checked_in_at, completed_at
      ) VALUES (
        ${event.id}, ${code}, ${qrToken}, ${firstName}, ${lastName},
        ${phone}, ${phoneNormalized}, ${email}, ${pType}, ${faculty},
        ${academicYear}, ${donationExperience}, null, ${status}, 'WALK_IN',
        true, ${checkedInAt}, ${checkedInAt}, ${completedAt}
      )
    `;
  }
  console.log('✓ Successfully seeded 105 Walk-in Donors (LVU26-W001 to LVU26-W105).');

  // Update time slot booked counts
  for (const slot of slots) {
    const counts = await sql`
      SELECT count(*)::int as count FROM registrations 
      WHERE event_id = ${event.id} AND slot_id = ${slot.id} AND status != 'CANCELLED'
    `;
    const booked = counts[0]?.count || 0;
    await sql`UPDATE time_slots SET booked_count = ${booked} WHERE id = ${slot.id}`;
  }
  console.log('✓ Updated time slot booking counts.');

  console.log('\n🎉 ALL 210 MOCK DONORS SEEDED TO DATABASE!');
  console.log('===============================================================');
  console.log('📊 ข้อมูลจำลองสำหรับทดสอบ (Test Guide):');
  console.log('');
  console.log('🔵 [1] ผู้ลงทะเบียนออนไลน์ (LVU26-001 ถึง LVU26-105):');
  console.log('  • LVU26-001 ถึง LVU26-090: บริจาคเสร็จแล้ว (COMPLETED)');
  console.log('  • LVU26-091 ถึง LVU26-098: เช็คอินแล้ว (CHECKED_IN)');
  console.log('  • LVU26-099 และ LVU26-100: [รอเช็คอิน (REGISTERED)] -> ลองเสิชหรือสแกน 2 คนนี้เพื่อเช็คอินให้ครบ 100 สิทธิ์แรก!');
  console.log('  • LVU26-101 ถึง LVU26-105: [รอเช็คอิน (REGISTERED)] -> ลองเสิชเช็คอิน 101 เพื่อดูว่า "ไม่มีสิทธิ์ของที่ระลึก" (เพราะเกิน 100 สิทธิ์)');
  console.log('');
  console.log('🟢 [2] ผู้บริจาค Walk-in (LVU26-W001 ถึง LVU26-W105):');
  console.log('  • LVU26-W001 ถึง LVU26-W098: บริจาคเสร็จแล้ว ได้ของที่ระลึกแล้ว 98 คน (COMPLETED)');
  console.log('  • LVU26-W099: [เช็คอินแล้ว (CHECKED_IN)] -> กด "บันทึกบริจาค" จะได้สิทธิ์ของที่ระลึกลำดับที่ #99');
  console.log('  • LVU26-W100: [เช็คอินแล้ว (CHECKED_IN)] -> กด "บันทึกบริจาค" จะได้สิทธิ์ของที่ระลึกลำดับที่ #100 (สิทธิ์สุดท้ายพอดี!)');
  console.log('  • LVU26-W101 ถึง LVU26-W105: [เช็คอินแล้ว (CHECKED_IN)] -> กด "บันทึกบริจาค" จะขึ้นเตือนว่า "เกินโควตา Walk-in 100 สิทธิ์แรก"');
  console.log('===============================================================');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeder failed:', err);
  process.exit(1);
});
