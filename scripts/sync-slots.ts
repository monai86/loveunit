// Script to synchronize time slots in PostgreSQL to official 09:00-14:00 (Unlimited capacity)
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

async function main() {
  console.log('⚡ Connecting to Neon PostgreSQL...');
  const sql = neon(connectionString!);

  const eventId = 'e1111111-1111-1111-1111-111111111111';

  // 1. Ensure event metadata has official 09:00 - 14:00
  await sql`
    UPDATE events
    SET 
      start_at = '2026-09-16T09:00:00+07:00',
      end_at = '2026-09-16T14:00:00+07:00',
      registration_close_at = '2026-09-16T14:00:00+07:00',
      updated_at = NOW()
    WHERE id = ${eventId} OR slug = 'mumt-2026';
  `;

  // 2. Define 5 Official Slots with UNLIMITED capacity (9999)
  const officialSlots = [
    { id: '11111111-1111-1111-1111-111111111101', start: '2026-09-16T09:00:00+07:00', end: '2026-09-16T10:00:00+07:00', cap: 9999 },
    { id: '11111111-1111-1111-1111-111111111102', start: '2026-09-16T10:00:00+07:00', end: '2026-09-16T11:00:00+07:00', cap: 9999 },
    { id: '11111111-1111-1111-1111-111111111103', start: '2026-09-16T11:00:00+07:00', end: '2026-09-16T12:00:00+07:00', cap: 9999 },
    { id: '11111111-1111-1111-1111-111111111104', start: '2026-09-16T12:00:00+07:00', end: '2026-09-16T13:00:00+07:00', cap: 9999 },
    { id: '11111111-1111-1111-1111-111111111105', start: '2026-09-16T13:00:00+07:00', end: '2026-09-16T14:00:00+07:00', cap: 9999 },
  ];

  for (const slot of officialSlots) {
    await sql`
      INSERT INTO time_slots (id, event_id, start_at, end_at, capacity, booked_count, is_active)
      VALUES (${slot.id}, ${eventId}, ${slot.start}, ${slot.end}, ${slot.cap}, 0, TRUE)
      ON CONFLICT (id) DO UPDATE SET
        start_at = EXCLUDED.start_at,
        end_at = EXCLUDED.end_at,
        capacity = EXCLUDED.capacity,
        is_active = TRUE;
    `;
  }

  const officialIds = officialSlots.map(s => s.id);

  // 3. Migrate any existing registrations pointing to old legacy slot IDs to slot 1
  await sql`
    UPDATE registrations
    SET slot_id = '11111111-1111-1111-1111-111111111101'
    WHERE event_id = ${eventId} AND slot_id IS NOT NULL AND slot_id NOT IN (${officialIds[0]}, ${officialIds[1]}, ${officialIds[2]}, ${officialIds[3]}, ${officialIds[4]});
  `;

  // 4. Delete obsolete slots
  await sql`
    DELETE FROM time_slots
    WHERE event_id = ${eventId} AND id NOT IN (${officialIds[0]}, ${officialIds[1]}, ${officialIds[2]}, ${officialIds[3]}, ${officialIds[4]});
  `;

  // 5. Recalculate booked_count on all slots
  for (const slot of officialSlots) {
    const [{ count }] = await sql`
      SELECT COUNT(*)::int as count FROM registrations
      WHERE slot_id = ${slot.id} AND status != 'CANCELLED';
    `;

    await sql`
      UPDATE time_slots
      SET booked_count = ${count}
      WHERE id = ${slot.id};
    `;
    console.log(`Slot [${slot.start.slice(11, 16)}–${slot.end.slice(11, 16)}] -> Booked: ${count}, Capacity: Unlimited (${slot.cap})`);
  }

  console.log('\n🎉 Successfully synchronized time slots in PostgreSQL to 09:00 - 14:00 with UNLIMITED capacity!');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error updating slots:', err);
  process.exit(1);
});
