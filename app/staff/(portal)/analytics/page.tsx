import React from 'react';
import { getEventBySlug } from '@/services/event-service';
import { requireStaff } from '@/lib/auth/server';
import { db } from '@/db';
import { registrations, timeSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

export const dynamic = 'force-dynamic';

export default async function StaffAnalyticsPage() {
  try {
    await requireStaff();
  } catch {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-[var(--muted)] font-medium">ไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  const event = await getEventBySlug('mumt-2026');
  if (!event || !db) {
    return (
      <AnalyticsDashboard
        initialData={null}
        backLink={{ href: '/staff/overview', label: 'ภาพรวมหน้างาน' }}
      />
    );
  }

  // Fetch raw data server-side for initial render
  const regs = await db.select().from(registrations).where(eq(registrations.eventId, event.id));
  const slots = await db.select().from(timeSlots).where(eq(timeSlots.eventId, event.id));
  const activeRegs = regs.filter(r => r.status !== 'CANCELLED');

  // ── Compute analytics ──
  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  const formatBangkokHour = (date: Date) => {
    const p = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(date);
    return `${p.find(x => x.type === 'hour')?.value}:${p.find(x => x.type === 'minute')?.value}`;
  };

  // Daily growth
  const dailyMap = new Map<string, number>();
  for (const r of activeRegs) {
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date(r.registeredAt));
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
  }
  const sortedDays = [...dailyMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const dailyGrowth = sortedDays.reduce<Array<{ date: string; count: number; cumulative: number }>>((acc, [date, count]) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({ date, count, cumulative: prev + count });
    return acc;
  }, []);

  // Hourly heatmap
  const hourlyHeatmap: Record<string, Record<number, number>> = {};
  for (const r of activeRegs) {
    const d = new Date(r.registeredAt);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok', hour: 'numeric', hour12: false,
    }).formatToParts(d);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const dayIdx = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })).getDay();
    const dayName = dayNames[dayIdx];
    if (!hourlyHeatmap[dayName]) hourlyHeatmap[dayName] = {};
    hourlyHeatmap[dayName][hour] = (hourlyHeatmap[dayName][hour] || 0) + 1;
  }

  // Faculty
  const facultyMap = new Map<string, number>();
  for (const r of activeRegs) {
    const faculty = r.faculty?.trim() || 'ไม่ได้ระบุ';
    facultyMap.set(faculty, (facultyMap.get(faculty) || 0) + 1);
  }
  const facultyBreakdown = [...facultyMap.entries()].sort((a, b) => b[1] - a[1]).map(([faculty, count]) => ({ faculty, count }));

  // Academic year
  const yearMap = new Map<string, number>();
  for (const r of activeRegs) {
    const year = r.academicYear?.trim() || 'ไม่ได้ระบุ';
    yearMap.set(year, (yearMap.get(year) || 0) + 1);
  }
  const academicYearBreakdown = [...yearMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([year, count]) => ({ year, count }));

  // Cross-tab
  const crossTab: Record<string, Record<string, number>> = {
    FIRST_TIME: { STUDENT: 0, STAFF: 0, GENERAL_PUBLIC: 0 },
    RETURNING: { STUDENT: 0, STAFF: 0, GENERAL_PUBLIC: 0 },
  };
  for (const r of activeRegs) {
    const exp = r.donationExperience || 'FIRST_TIME';
    const pType = r.participantType || 'STUDENT';
    if (crossTab[exp]) crossTab[exp][pType] = (crossTab[exp][pType] || 0) + 1;
  }

  // Source
  const sourceMap = new Map<string, number>();
  for (const r of activeRegs) {
    sourceMap.set(r.source || 'ONLINE', (sourceMap.get(r.source || 'ONLINE') || 0) + 1);
  }
  const sourceBreakdown = [...sourceMap.entries()].sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }));

  // Peak hours
  const hourCountMap = new Map<number, number>();
  for (const r of activeRegs) {
    const d = new Date(r.registeredAt);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok', hour: 'numeric', hour12: false,
    }).formatToParts(d);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    hourCountMap.set(hour, (hourCountMap.get(hour) || 0) + 1);
  }
  const peakHours = [...hourCountMap.entries()].sort((a, b) => a[0] - b[0]).map(([hour, count]) => ({ hour, count }));

  // Slot utilization
  const slotUtilization = slots.map(s => {
    const slotRegs = activeRegs.filter(r => r.slotId === s.id);
    return {
      slotId: s.id,
      timeLabel: `${formatBangkokHour(new Date(s.startAt))}–${formatBangkokHour(new Date(s.endAt))}`,
      capacity: s.capacity,
      booked: slotRegs.length,
      utilPercent: s.capacity > 0 ? Math.round((slotRegs.length / s.capacity) * 100) : 0,
    };
  });

  // Summary
  const totalDays = dailyGrowth.length || 1;
  const avgPerDay = Math.round(activeRegs.length / totalDays);
  const peakDay = dailyGrowth.reduce((max, d) => d.count > max.count ? d : max, { date: '-', count: 0, cumulative: 0 });

  const analyticsData = {
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
      statusBreakdown: {
        registered: regs.filter(r => r.status === 'REGISTERED').length,
        checkedIn: regs.filter(r => r.status === 'CHECKED_IN').length,
        inProcess: regs.filter(r => r.status === 'IN_PROCESS').length,
        completed: regs.filter(r => r.status === 'COMPLETED').length,
        cancelled: regs.filter(r => r.status === 'CANCELLED').length,
        noShow: regs.filter(r => r.status === 'NO_SHOW').length,
      },
    },
  };

  return (
    <AnalyticsDashboard
      initialData={analyticsData}
      backLink={{ href: '/staff/overview', label: 'ภาพรวมหน้างาน' }}
    />
  );
}
