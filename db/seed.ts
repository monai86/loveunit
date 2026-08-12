import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

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

async function runSeed() {
  console.log('⚡ Connecting to Neon PostgreSQL via HTTP Serverless API...');
  const sql = neon(connectionString);

  try {
    // Seed Official MUMT 2026 Event Metadata & Time Slots
    console.log('🌱 Seeding official MUMT 2026 Event Metadata & Time Slots...');
    
    // Insert Event if not exists
    await sql`
      INSERT INTO events (
        id, slug, name, short_name, description, start_at, end_at, 
        venue_name, venue_detail, registration_open_at, registration_close_at, status
      ) VALUES (
        'e1111111-1111-1111-1111-111111111111',
        'mumt-2026',
        'MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”',
        'MUMT Blood Donation 2026 (ครั้งที่ 9)',
        'ขอเชิญชวนผู้มีจิตศรัทธาร่วมบริจาคโลหิตในโครงการเติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9 จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ สภากาชาดไทย',
        '2026-09-16T08:00:00+07:00',
        '2026-09-16T15:00:00+07:00',
        'ห้องประชุม 217 และ 218 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา',
        'ห้องประชุม 217 และ 218 ชั้น 2 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา',
        '2026-08-01T00:00:00+07:00',
        '2026-09-16T14:00:00+07:00',
        'REGISTRATION_OPEN'
      ) ON CONFLICT (slug) DO NOTHING;
    `;

    // Insert Time Slots if not exists
    const slots = [
      { id: '11111111-1111-1111-1111-111111111101', start: '2026-09-16T08:00:00+07:00', end: '2026-09-16T09:00:00+07:00', cap: 35 },
      { id: '11111111-1111-1111-1111-111111111102', start: '2026-09-16T09:00:00+07:00', end: '2026-09-16T10:00:00+07:00', cap: 35 },
      { id: '11111111-1111-1111-1111-111111111103', start: '2026-09-16T10:00:00+07:00', end: '2026-09-16T11:00:00+07:00', cap: 35 },
      { id: '11111111-1111-1111-1111-111111111104', start: '2026-09-16T11:00:00+07:00', end: '2026-09-16T12:00:00+07:00', cap: 35 },
      { id: '11111111-1111-1111-1111-111111111105', start: '2026-09-16T12:00:00+07:00', end: '2026-09-16T13:00:00+07:00', cap: 35 },
      { id: '11111111-1111-1111-1111-111111111106', start: '2026-09-16T13:00:00+07:00', end: '2026-09-16T14:00:00+07:00', cap: 35 },
      { id: '11111111-1111-1111-1111-111111111107', start: '2026-09-16T14:00:00+07:00', end: '2026-09-16T15:00:00+07:00', cap: 25 },
    ];

    for (const slot of slots) {
      await sql`
        INSERT INTO time_slots (id, event_id, start_at, end_at, capacity, booked_count, is_active)
        VALUES (${slot.id}, 'e1111111-1111-1111-1111-111111111111', ${slot.start}, ${slot.end}, ${slot.cap}, 0, TRUE)
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    console.log('🎉 MUMT 2026 Database migration & seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error applying migrations & seeds:', err);
    process.exit(1);
  }
}

runSeed();
