import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  Plus, 
  Eye, 
  Heart,
  Layers,
  ArrowRight,
  QrCode,
  Download
} from 'lucide-react';
import { getDashboardKPIs, getAllRegistrations, getAllStaffMembers } from '@/services/admin-service';
import { getEventBySlug } from '@/services/event-service';
import { getAuthenticatedUser } from '@/lib/auth/server';
import { WaitlistPanel } from '@/components/admin/WaitlistPanel';
import { StaffRoleManagement } from '@/components/admin/StaffRoleManagement';
import { getParticipantTypeLabel, getRegistrationStatusBadge, formatTimeRange } from '@/lib/utils/format';
import { RegistrationStatus, ParticipantType } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getAuthenticatedUser();
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

  const allRegistrations = event ? await getAllRegistrations(event.id) : [];
  const recentRegistrations = allRegistrations.slice(0, 8);
  const staffMembers = await getAllStaffMembers();

  const totalCapacity = kpis.slotBreakdown.reduce((acc, s) => acc + s.capacity, 0);
  const totalBooked = kpis.slotBreakdown.reduce((acc, s) => acc + s.bookedCount, 0);
  const _overallOccupancyPercent = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  const kpiBlocks = [
    { 
      title: 'ผู้ลงทะเบียนทั้งหมด', 
      value: kpis.totalRegistrations.toLocaleString('th-TH'), 
      unit: 'คน', 
      detail: `${kpis.walkInCount} คนเป็น Walk-in หน้างาน`, 
      icon: Users,
      color: 'bg-blue-50 text-blue-900 border-blue-200' 
    },
    { 
      title: 'เช็คอินเข้างานแล้ว', 
      value: kpis.checkedInCount.toLocaleString('th-TH'), 
      unit: 'คน', 
      detail: `คิดเป็น ${kpis.attendanceRatePercent}% ของผู้ลงทะเบียน`, 
      icon: UserCheck,
      color: 'bg-sky-50 text-sky-900 border-sky-200' 
    },
    { 
      title: 'บริจาคสำเร็จ & รับของที่ระลึก', 
      value: kpis.completedCount.toLocaleString('th-TH'), 
      unit: 'คน / ยูนิต', 
      detail: `มอบของที่ระลึกสำเร็จ ${kpis.completedCount} ชิ้น`, 
      icon: Heart,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200' 
    },
    { 
      title: 'กลุ่มผู้บริจาค', 
      value: `${kpis.studentsCount + kpis.staffCount} / ${kpis.generalPublicCount}`, 
      unit: 'คน', 
      detail: `${kpis.studentsCount} นศ. · ${kpis.staffCount} บุคลากร · ${kpis.generalPublicCount} บุคคลทั่วไป`, 
      icon: Calendar,
      color: 'bg-amber-50 text-amber-900 border-amber-200' 
    },
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
        checkedIn: s.checkedInCount,
        isOver: percent > 100,
        isFull: percent >= 100,
      };
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-black text-[var(--burgundy-700)] uppercase">
              MUMT 2026 OPERATIONAL DASHBOARD
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] text-[10px] font-black border border-[var(--line)]">
              09.00 - 14.00 น.
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
            ระบบบริหารจัดการ & แดชบอร์ดควบคุมงานบริจาคโลหิต
          </h1>
          <p className="text-xs text-[var(--muted)] font-medium">
            ห้องประชุม 217-218 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา (พุธที่ 16 ก.ย. 2569)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/staff/walk-in"
            className="editorial-btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>ลงทะเบียน Walk-in</span>
          </Link>

          <Link
            href="/staff/checkin"
            className="editorial-btn-secondary py-2.5 px-4 text-xs flex items-center gap-1.5"
          >
            <QrCode className="h-4 w-4 text-[var(--burgundy-700)]" />
            <span>เปิดจุดสแกน QR</span>
          </Link>

          <a
            href="/api/admin/export"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[var(--line)] hover:bg-gray-50 text-xs font-extrabold text-[var(--ink)] shadow-2xs transition-all"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Export Excel / CSV</span>
          </a>
        </div>
      </div>

      {/* ============ SECTION 1: LIVE KPI CARDS ============ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-[var(--muted)] tracking-wider font-mono">
            OPERATIONAL KEY PERFORMANCE INDICATORS (KPIs)
          </h2>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            เปิดรับลงทะเบียนต่อเนื่อง · ไม่จำกัดที่นั่งต่อรอบ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.title} className={`p-5 rounded-2xl border ${block.color} shadow-xs space-y-2 flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">{block.title}</span>
                  <div className="p-2 rounded-xl bg-white/80 shadow-2xs">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black font-mono tracking-tight">{block.value}</span>
                    <span className="text-xs font-bold">{block.unit}</span>
                  </div>
                  <p className="text-[11px] font-medium pt-1 opacity-80">{block.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ SECTION 2: HOURLY CAPACITY HEATMAP & PIPELINE ============ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Slot Occupancy Breakdown (7 Cols) */}
        <div className="lg:col-span-7 editorial-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--burgundy-700)]" />
                <span>การกระจายตัวตามรอบเวลา (Hourly Attendance Distribution)</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                ช่วงเวลากิจกรรม 09:00 - 14:00 น. (ไม่จำกัดที่นั่งต่อรอบ · เปิดรับลงทะเบียนต่อเนื่อง)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--burgundy-700)] bg-[var(--rose-100)] px-2.5 py-1 rounded-lg border border-[var(--line)]">
              รวม {totalBooked} คน
            </span>
          </div>

          <div className="space-y-3">
            {utilizationSlots.map((slot) => {
              const relPercent = totalBooked > 0 ? Math.round((slot.booked / totalBooked) * 100) : 0;
              return (
                <div key={slot.time} className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[var(--ink)]">{slot.time} น.</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        เปิดรับต่อเนื่อง
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-[var(--ink)] text-sm">
                        {slot.booked}
                      </span>
                      <span className="text-xs font-sans font-bold text-gray-600 ml-1">คน</span>
                      {totalBooked > 0 && (
                        <span className="text-[11px] text-[var(--muted)] ml-1.5">({relPercent}% ของยอดรวม)</span>
                      )}
                    </div>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-[var(--burgundy-700)] transition-all duration-500 rounded-full"
                      style={{ width: `${Math.max(relPercent, slot.booked > 0 ? 8 : 0)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>เช็คอินเข้างานแล้ว: <strong className="text-emerald-700 font-mono">{slot.checkedIn}</strong> คน</span>
                    <span className="text-[10px] font-bold text-gray-400">รองรับได้ไม่จำกัด</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Registration Lifecycle Pipeline (5 Cols) */}
        <div className="lg:col-span-5 editorial-card p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="space-y-0.5 border-b border-[var(--line)] pb-3">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>สถานะผู้บริจาค (Operations Pipeline)</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">การติดตามสถานะตลอด Flow งาน</p>
            </div>

            <div className="space-y-3 pt-4 text-xs font-bold">
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-900">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>1. รอเข้ารับบริการ (REGISTERED)</span>
                </div>
                <span className="font-mono text-sm font-black text-blue-950">
                  {kpis.totalRegistrations - kpis.checkedInCount} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-900">
                  <span className="h-2 w-2 rounded-full bg-amber-600" />
                  <span>2. เช็คอินแล้ว / รอคิว (CHECKED_IN)</span>
                </div>
                <span className="font-mono text-sm font-black text-amber-950">
                  {kpis.checkedInCount - kpis.inProcessCount - kpis.completedCount} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="flex items-center gap-2 text-purple-900">
                  <span className="h-2 w-2 rounded-full bg-purple-600" />
                  <span>3. กำลังบริจาคบนเตียง (IN_PROCESS)</span>
                </div>
                <span className="font-mono text-sm font-black text-purple-950">
                  {kpis.inProcessCount} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>4. บริจาคเสร็จสิ้น (COMPLETED)</span>
                </div>
                <span className="font-mono text-sm font-black text-emerald-950">
                  {kpis.completedCount} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-100 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  <span>5. ยกเลิก / ไม่มา (CANCELLED / NO_SHOW)</span>
                </div>
                <span className="font-mono text-sm font-black text-gray-800">
                  {kpis.cancelledCount + kpis.noShowCount} คน
                </span>
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-[var(--line)]">
            <Link
              href="/mt70/registrations"
              className="text-xs font-black text-[var(--burgundy-700)] hover:underline flex items-center justify-between"
            >
              <span>ดูตารางผู้ลงทะเบียนทั้งหมด ({allRegistrations.length} รายการ) →</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </section>

      {/* ============ SECTION 3: RECENT REGISTRATIONS TABLE ============ */}
      <section className="editorial-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--burgundy-700)]" />
              <span>รายการลงทะเบียนล่าสุด (Recent Registrations)</span>
            </h3>
            <p className="text-[11px] text-[var(--muted)]">ผู้ลงทะเบียนล่าสุดที่ผ่านการคัดกรอง</p>
          </div>

          <Link
            href="/mt70/registrations"
            className="editorial-btn-secondary py-2 px-3 text-xs"
          >
            <span>จัดการรายชื่อทั้งหมด</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[var(--line)] rounded-xl overflow-hidden">
            <thead className="bg-[var(--rose-100)] text-[var(--burgundy-700)] font-black text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5 border-b border-[var(--line)]">รหัสลงทะเบียน</th>
                <th className="p-3.5 border-b border-[var(--line)]">ชื่อ - สกุล</th>
                <th className="p-3.5 border-b border-[var(--line)]">เบอร์โทรศัพท์</th>
                <th className="p-3.5 border-b border-[var(--line)]">ประเภท</th>
                <th className="p-3.5 border-b border-[var(--line)]">รอบเวลา</th>
                <th className="p-3.5 border-b border-[var(--line)]">สถานะ</th>
                <th className="p-3.5 border-b border-[var(--line)] text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-medium text-[var(--ink)]">
              {recentRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                    ยังไม่มีรายการลงทะเบียนในขณะนี้
                  </td>
                </tr>
              ) : (
                recentRegistrations.map((reg) => {
                  const regObj = reg as {
                    id: string;
                    status: RegistrationStatus;
                    timeSlot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
                    time_slot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
                    registration_code?: string;
                    registrationCode?: string;
                    first_name?: string;
                    firstName?: string;
                    last_name?: string;
                    lastName?: string;
                    participant_type?: ParticipantType;
                    participantType?: ParticipantType;
                    phone?: string;
                  };
                  const badge = getRegistrationStatusBadge(regObj.status);
                  const slot = regObj.timeSlot || regObj.time_slot;
                  const timeLabel = slot
                    ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '')
                    : '09:00 – 14:00 น.';
                  const regCode = regObj.registration_code || regObj.registrationCode || '';
                  const fullName = `${regObj.first_name || regObj.firstName || ''} ${regObj.last_name || regObj.lastName || ''}`.trim();
                  const pType = regObj.participant_type || regObj.participantType || 'STUDENT';

                  return (
                    <tr key={regObj.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[var(--burgundy-700)]">
                        {regCode}
                      </td>
                      <td className="p-3.5 font-bold">
                        {fullName}
                      </td>
                      <td className="p-3.5 font-mono text-gray-600">{reg.phone}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800">
                          {getParticipantTypeLabel(pType)}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-xs text-gray-700">{timeLabel}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/registration/${regCode}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--burgundy-700)] hover:underline"
                        >
                          <Eye className="h-3 w-3" />
                          <span>ดูบัตร</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============ SECTION 4: STAFF & ROLES (RBAC) MANAGEMENT ============ */}
      <section className="pt-6 border-t border-[var(--line)]">
        <StaffRoleManagement
          currentUserRole={user?.profile.role}
          initialStaffList={staffMembers}
        />
      </section>

      {/* ============ SECTION 5: WAITLIST TRIAGE ============ */}
      {event && (
        <section className="pt-6 border-t border-[var(--line)]">
          <WaitlistPanel eventId={event.id} />
        </section>
      )}

    </div>
  );
}
