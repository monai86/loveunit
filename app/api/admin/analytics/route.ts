import { NextResponse } from 'next/server';
import { getEventBySlug } from '@/services/event-service';
import { requireReadOnlyAdmin } from '@/lib/auth/server';
import { getErrorMessage } from '@/lib/utils/format';
import { db } from '@/db';
import { registrations, timeSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Deep analytics endpoint — READ-ONLY.
 * No writes to the database. Safe for production.
 */
export async function GET() {
  try {
    try {
      await requireReadOnlyAdmin();
    } catch (err: unknown) {
      const status = getErrorMessage(err) === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงสถิติเจาะลึก' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not available' }, { status: 503 });
    }

    const regs = await db.select().from(registrations).where(eq(registrations.eventId, event.id));
    const slots = await db.select().from(timeSlots).where(eq(timeSlots.eventId, event.id));

    const activeRegs = regs.filter(r => r.status !== 'CANCELLED');

    // ── 1. Registration timeline (daily cumulative) ──
    const dailyMap = new Map<string, number>();
    for (const r of activeRegs) {
      const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date(r.registeredAt));
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
    }
    const sortedDays = [...dailyMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    let cumulative = 0;
    const dailyGrowth = sortedDays.map(([date, count]) => {
      cumulative += count;
      return { date, count, cumulative };
    });

    // ── 2. Hourly heatmap (day-of-week × hour) ──
    const hourlyHeatmap: Record<string, Record<number, number>> = {};
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    for (const r of activeRegs) {
      const d = new Date(r.registeredAt);
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        weekday: 'short',
        hour: 'numeric',
        hour12: false,
      }).formatToParts(d);
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const dayIdx = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })).getDay();
      const dayName = dayNames[dayIdx];
      if (!hourlyHeatmap[dayName]) hourlyHeatmap[dayName] = {};
      hourlyHeatmap[dayName][hour] = (hourlyHeatmap[dayName][hour] || 0) + 1;
    }

    // ── 3. Faculty breakdown ──
    const facultyMap = new Map<string, number>();
    for (const r of activeRegs) {
      const faculty = r.faculty?.trim() || 'ไม่ได้ระบุ';
      facultyMap.set(faculty, (facultyMap.get(faculty) || 0) + 1);
    }
    const facultyBreakdown = [...facultyMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([faculty, count]) => ({ faculty, count }));

    // ── 4. Academic year breakdown ──
    const yearMap = new Map<string, number>();
    for (const r of activeRegs) {
      const year = r.academicYear?.trim() || 'ไม่ได้ระบุ';
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    }
    const academicYearBreakdown = [...yearMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, count]) => ({ year, count }));

    // ── 5. Experience × ParticipantType cross-tab ──
    const crossTab: Record<string, Record<string, number>> = {
      FIRST_TIME: { STUDENT: 0, STAFF: 0, GENERAL_PUBLIC: 0 },
      RETURNING: { STUDENT: 0, STAFF: 0, GENERAL_PUBLIC: 0 },
    };
    for (const r of activeRegs) {
      const exp = r.donationExperience || 'FIRST_TIME';
      const pType = r.participantType || 'STUDENT';
      if (crossTab[exp]) {
        crossTab[exp][pType] = (crossTab[exp][pType] || 0) + 1;
      }
    }

    // ── 6. Source breakdown ──
    const sourceMap = new Map<string, number>();
    for (const r of activeRegs) {
      const source = r.source || 'ONLINE';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    }
    const sourceBreakdown = [...sourceMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }));

    // ── 7. Peak hours (flat) ──
    const hourCountMap = new Map<number, number>();
    for (const r of activeRegs) {
      const d = new Date(r.registeredAt);
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Bangkok',
        hour: 'numeric',
        hour12: false,
      }).formatToParts(d);
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      hourCountMap.set(hour, (hourCountMap.get(hour) || 0) + 1);
    }
    const peakHours = [...hourCountMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([hour, count]) => ({ hour, count }));

    // ── 8. Summary stats ──
    const totalDays = dailyGrowth.length || 1;
    const avgPerDay = Math.round(activeRegs.length / totalDays);
    const peakDay = dailyGrowth.reduce((max, d) => d.count > max.count ? d : max, { date: '-', count: 0, cumulative: 0 });
    const statusBreakdown = {
      registered: regs.filter(r => r.status === 'REGISTERED').length,
      checkedIn: regs.filter(r => r.status === 'CHECKED_IN').length,
      inProcess: regs.filter(r => r.status === 'IN_PROCESS').length,
      completed: regs.filter(r => r.status === 'COMPLETED').length,
      cancelled: regs.filter(r => r.status === 'CANCELLED').length,
      noShow: regs.filter(r => r.status === 'NO_SHOW').length,
    };

    // ── 9. Slot utilization ──
    const slotUtilization = slots.map(s => {
      const slotRegs = activeRegs.filter(r => r.slotId === s.id);
      const utilPct = s.capacity > 0 ? Math.round((slotRegs.length / s.capacity) * 100) : 0;
      const formatHour = (date: Date) => {
        const p = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Bangkok',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).formatToParts(date);
        return `${p.find(x => x.type === 'hour')?.value}:${p.find(x => x.type === 'minute')?.value}`;
      };
      return {
        slotId: s.id,
        timeLabel: `${formatHour(new Date(s.startAt))}–${formatHour(new Date(s.endAt))}`,
        capacity: s.capacity,
        booked: slotRegs.length,
        utilPercent: utilPct,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalActive: activeRegs.length,
        totalAll: regs.length,
        dailyGrowth,
        hourlyHeatmap,
        facultyBreakdown,
        academicYearBreakdown,
        crossTab,
        sourceBreakdown,
        peakHours,
        slotUtilization,
        summary: {
          avgPerDay,
          peakDay: { date: peakDay.date, count: peakDay.count },
          totalDays,
          statusBreakdown,
        },
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
