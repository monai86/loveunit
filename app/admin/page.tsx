import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  Plus, 
  Eye, 
  Heart,
  ScrollText,
  Search
} from 'lucide-react';
import { getDashboardKPIs, getAllRegistrations } from '@/services/admin-service';
import { getEventBySlug } from '@/services/event-service';
import { WaitlistPanel } from '@/components/admin/WaitlistPanel';
import { getParticipantTypeLabel, getRegistrationStatusBadge } from '@/lib/utils/format';
import { formatTimeRange } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const event = await getEventBySlug('mumt-2026');
  const kpis = event
    ? await getDashboardKPIs(event.id)
    : {
        totalRegistrations: 0,
        expectedAttendance: 0,
        firstTimeDonors: 0,
        returningDonors: 0,
        studentsCount: 0,
        staffCount: 0,
        generalPublicCount: 0,
        checkedInCount: 0,
        walkInCount: 0,
        inProcessCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        noShowCount: 0,
        attendanceRatePercent: 0,
        slotBreakdown: [] as { slotId: string; timeLabel: string; capacity: number; bookedCount: number; checkedInCount: number }[],
      };
  const recentRegistrations = event ? (await getAllRegistrations(event.id)).slice(0, 5) : [];

  const kpiBlocks = [
    { title: 'ผู้ลงทะเบียนทั้งหมด', value: kpis.totalRegistrations.toLocaleString('th-TH'), unit: 'คน', change: `${kpis.walkInCount} รายการเป็น Walk-in`, isUp: true, icon: Users },
    { title: 'เช็คอินแล้ว', value: kpis.checkedInCount.toLocaleString('th-TH'), unit: 'คน', change: `อัตราการมาถึง ${kpis.attendanceRatePercent}%`, isUp: true, icon: UserCheck },
    { title: 'เสร็จสิ้นการบริจาค', value: kpis.completedCount.toLocaleString('th-TH'), unit: 'คน', change: `${kpis.inProcessCount} รายการกำลังบริจาค`, isUp: true, icon: Heart },
    { title: 'ครั้งแรก / เคยบริจาค', value: `${kpis.firstTimeDonors} / ${kpis.returningDonors}`, unit: 'คน', change: `${kpis.studentsCount} นักศึกษา · ${kpis.staffCount} บุคลากร · ${kpis.generalPublicCount} ทั่วไป`, isUp: true, icon: Calendar },
    { title: 'ยกเลิก / ไม่มา', value: `${kpis.cancelledCount} / ${kpis.noShowCount}`, unit: 'คน', change: 'จากยอดลงทะเบียนทั้งหมด', isUp: false, icon: Clock },
  ];

  const utilizationSlots = kpis.slotBreakdown
    .slice()
    .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
    .map((s) => {
      const percent = s.capacity > 0 ? Math.round((s.bookedCount / s.capacity) * 100) : 0;
      return {
        time: s.timeLabel,
        percent,
        booked: s.bookedCount,
        max: s.capacity,
        isOver: percent > 100,
      };
    });


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Header Matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--burgundy-600)] text-white flex items-center justify-center font-black">
            <Heart className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-[var(--burgundy-600)] uppercase">ADMIN DASHBOARD</span>
              <span className="unit-tag-outline">LIVE DATA</span>
            </div>
            <h1 className="text-xl font-black text-[var(--ink)] sm:text-2xl">
              ระบบบริหารจัดการ การบริจาคโลหิต MUMT BLOOD DONATION 2026
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center gap-1.5 bg-white border border-[var(--burgundy-600)]/30 hover:bg-[var(--rose-100)] text-[var(--burgundy-600)] font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all"
          >
            <ScrollText className="h-4 w-4" />
            <span>บันทึกการใช้งาน</span>
          </Link>
          <a
            href="/api/admin/export"
            download
            className="inline-flex items-center gap-1.5 bg-[var(--burgundy-600)] hover:bg-[var(--burgundy-700)] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>ส่งออกข้อมูล Excel</span>
          </a>
        </div>
      </div>

      {/* 1. KPI NUMBER BLOCKS MATCHING IMAGE 1 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[var(--burgundy-600)] uppercase">1. KPI NUMBER BLOCKS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {kpiBlocks.map((block, idx) => {
            const Icon = block.icon;
            return (
              <div key={idx} className="bg-white border border-[var(--line)] rounded-xl p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[var(--muted)]">{block.title}</span>
                  <Icon className="h-4 w-4 text-[var(--burgundy-600)]" />
                </div>
                <div className="text-2xl font-mono font-black text-[var(--ink)]">
                  {block.value} <span className="text-xs font-sans font-bold text-[var(--muted)]">{block.unit}</span>
                </div>
                <div className={`text-[11px] font-bold flex items-center gap-1 ${block.isUp ? 'text-emerald-700' : 'text-emerald-700'}`}>
                  {block.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{block.change}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2 & 3: ARRIVAL FORECAST & TIME-SLOT UTILIZATION MATCHING IMAGE 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 2. Arrival Forecast Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[var(--line)] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <span className="text-xs font-mono font-bold text-[var(--burgundy-600)] uppercase">
              2. ARRIVAL PER SLOT (ยอดจอง vs มาถึงจริง ต่อรอบเวลา)
            </span>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-[var(--burgundy-600)]">
                <span className="h-2 w-4 bg-[var(--burgundy-600)] rounded"></span> จองแล้ว
              </span>
              <span className="flex items-center gap-1 text-[var(--burgundy-400)]">
                <span className="h-2 w-4 bg-[var(--burgundy-400)] rounded"></span> มาถึงแล้ว
              </span>
            </div>
          </div>

          {/* Real per-slot bars from the database */}
          <div className="space-y-3 pt-2 text-xs">
            {kpis.slotBreakdown
              .slice()
              .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
              .map((s, idx) => {
                const booked = s.bookedCount;
                const arrived = s.checkedInCount;
                const maxVal = Math.max(booked, 1);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-[var(--ink)]">{s.timeLabel}</span>
                      <span className="text-[var(--muted)]">
                        มาถึง {arrived} / จอง {booked} คน
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-2.5 flex-1 bg-[var(--bg)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--burgundy-600)]"
                          style={{ width: `${Math.min((booked / maxVal) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="h-2.5 flex-1 bg-[var(--bg)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--burgundy-400)]"
                          style={{ width: `${Math.min((arrived / maxVal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 3. Time-Slot Utilization Bars (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[var(--line)] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <span className="text-xs font-mono font-bold text-[var(--burgundy-600)] uppercase">
              3. TIME-SLOT UTILIZATION (การใช้เวลาแต่ละรอบ)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {utilizationSlots.map((slot, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-[var(--ink)]">{slot.time}</span>
                  <div className="flex items-center gap-3">
                    <span className={slot.isOver ? 'text-red-600 font-black' : 'text-[var(--muted)]'}>{slot.percent}%</span>
                    <span className={`text-[11px] ${slot.isOver ? 'text-red-600 font-black' : 'text-[var(--ink)]'}`}>
                      {slot.booked} / {slot.max}
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-[var(--bg)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${slot.isOver ? 'bg-red-600' : 'bg-[var(--burgundy-600)]'}`} 
                    style={{ width: `${Math.min(slot.percent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. REGISTRATION DATA TABLE MATCHING IMAGE 1 */}
      <section className="bg-white border border-[var(--line)] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
          <span className="text-xs font-mono font-bold text-[var(--burgundy-600)] uppercase">
            4. REGISTRATION DATA TABLE (ตารางข้อมูลการลงทะเบียน)
          </span>

          <Link
            href="/admin/registrations"
            className="inline-flex items-center gap-1.5 bg-[var(--burgundy-600)] hover:bg-[var(--burgundy-700)] text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all"
          >
            <Search className="h-3.5 w-3.5" />
            <span>ค้นหา & จัดการข้อมูลทั้งหมด</span>
          </Link>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[11px]">
                <th className="py-3 px-3"><input type="checkbox" className="rounded" /></th>
                <th className="py-3 px-3 font-bold">รหัสลงทะเบียน</th>
                <th className="py-3 px-3 font-bold">ชื่อ-นามสกุล</th>
                <th className="py-3 px-3 font-bold">เบอร์โทร</th>
                <th className="py-3 px-3 font-bold">วันที่นัดหมาย</th>
                <th className="py-3 px-3 font-bold">รอบเวลา</th>
                <th className="py-3 px-3 font-bold">สถานะ</th>
                <th className="py-3 px-3 font-bold">ประเภท</th>
                <th className="py-3 px-3 font-bold">หน่วยงาน</th>
                <th className="py-3 px-3 font-bold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-[var(--ink)]">
              {recentRegistrations.map((r, idx) => {
                const reg = normalizeRegistration(r);
                return (
                  <tr key={idx} className="hover:bg-[var(--bg)]">
                    <td className="py-3 px-3"><input type="checkbox" className="rounded" /></td>
                    <td className="py-3 px-3 font-mono font-bold text-[var(--burgundy-600)]">{reg.code}</td>
                    <td className="py-3 px-3 font-bold">{reg.firstName} {reg.lastName}</td>
                    <td className="py-3 px-3 font-mono">{reg.phone}</td>
                    <td className="py-3 px-3">16 ก.ย. 2569</td>
                    <td className="py-3 px-3 font-mono font-bold">{reg.timeText}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${reg.statusBadge.colorClass}`}>
                        {reg.statusBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">{reg.participantTypeLabel}</td>
                    <td className="py-3 px-3">{reg.faculty || '—'}</td>
                    <td className="py-3 px-3">
                      <Link
                        href={`/registration/${reg.code}`}
                        className="inline-flex items-center justify-center gap-1 text-gray-500 hover:text-[var(--burgundy-600)]"
                        title="เปิดหน้า Pass"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--line)] text-xs font-medium text-[var(--muted)]">
          <span>แสดง {recentRegistrations.length} รายการล่าสุด จากทั้งหมด {kpis.totalRegistrations.toLocaleString('th-TH')} รายการ</span>
          <Link href="/admin/registrations" className="px-3 py-1.5 rounded-lg bg-[var(--burgundy-600)] text-white font-bold text-[11px] hover:bg-[var(--burgundy-700)]">
            ดูทั้งหมด →
          </Link>
        </div>
      </section>

      {/* 5. CONTENT MANAGEMENT CARDS MATCHING IMAGE 1 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[var(--burgundy-600)] uppercase">
            5. CONTENT MANAGEMENT (จัดการเนื้อหา / อินโฟกราฟิก)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[var(--line)] rounded-2xl p-5 space-y-3 text-center shadow-xs">
            <div className="h-28 w-full rounded-xl bg-[var(--bg)] flex items-center justify-center text-gray-400">
              🖼️
            </div>
            <h4 className="text-xs font-black text-[var(--ink)]">ขั้นตอนการบริจาค</h4>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-extrabold inline-block">เผยแพร่แล้ว</span>
          </div>

          <div className="bg-white border border-[var(--line)] rounded-2xl p-5 space-y-3 text-center shadow-xs">
            <div className="h-28 w-full rounded-xl bg-[var(--bg)] flex items-center justify-center text-gray-400">
              🖼️
            </div>
            <h4 className="text-xs font-black text-[var(--ink)]">สิ่งที่ควรทำ-ไม่ควรทำ</h4>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-extrabold inline-block">เผยแพร่แล้ว</span>
          </div>

          <div className="bg-white border border-[var(--line)] rounded-2xl p-5 space-y-3 text-center shadow-xs">
            <div className="h-28 w-full rounded-xl bg-[var(--bg)] flex items-center justify-center text-gray-400">
              🖼️
            </div>
            <h4 className="text-xs font-black text-[var(--ink)]">คุณสมบัติผู้บริจาค</h4>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-extrabold inline-block">ร่างเผยแพร่</span>
          </div>

          <div className="border-2 border-dashed border-[var(--burgundy-600)] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-[var(--burgundy-600)] bg-[var(--bg)]/50 hover:bg-[var(--bg)] transition-all cursor-pointer">
            <Plus className="h-8 w-8" />
            <span className="text-xs font-black">เพิ่มเนื้อหาใหม่</span>
          </div>
        </div>
      </section>

      {/* 6. WAITLIST MANAGEMENT */}
      {event && <WaitlistPanel eventId={event.id} />}

    </div>
  );
}

/**
 * Normalizes a registration row from either the Drizzle backend (camelCase)
 * or the legacy in-memory backend (snake_case) into the display shape used by
 * the dashboard table.
 */
function normalizeRegistration(r: unknown) {
  const row = r as Record<string, unknown>;
  const pick = (camel: string, snake: string) => row[camel] ?? row[snake];
  const slot = (row.timeSlot ?? row.time_slot) as Record<string, unknown> | undefined;
  const slotStart = slot ? (slot.startAt ?? slot.start_at) : undefined;
  const slotEnd = slot ? (slot.endAt ?? slot.end_at) : undefined;
  const status = String(row.status ?? 'REGISTERED');
  const participantType = String(pick('participantType', 'participant_type') ?? 'GENERAL_PUBLIC');
  return {
    code: String(pick('registrationCode', 'registration_code') ?? ''),
    firstName: String(pick('firstName', 'first_name') ?? ''),
    lastName: String(pick('lastName', 'last_name') ?? ''),
    phone: String(row.phone ?? ''),
    faculty: String(pick('faculty', 'faculty') ?? ''),
    timeText: slotStart && slotEnd
      ? formatTimeRange(String(slotStart), String(slotEnd))
      : 'ไม่ระบุ',
    statusBadge: getRegistrationStatusBadge(status as never),
    participantTypeLabel: getParticipantTypeLabel(participantType as never),
  };
}
