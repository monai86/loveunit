import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Plus, 
  Eye, 
  Heart,
  Layers,
  ArrowRight,
  QrCode,
  Download,
  GraduationCap
} from 'lucide-react';
import { getDashboardKPIs, getAllRegistrations } from '@/services/admin-service';
import { getEventBySlug } from '@/services/event-service';
import { getParticipantTypeLabel, getRegistrationStatusBadge, formatTimeRange, formatBangkokTime, isWalkInRecord } from '@/lib/utils/format';
import { RegistrationStatus, ParticipantType } from '@/lib/types/database';
import { getAuthenticatedUser } from '@/lib/auth/server';
import { ResetTestDataButton } from '@/components/admin/ResetTestDataButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const currentUser = await getAuthenticatedUser();
  const event = await getEventBySlug('mumt-2026');
  const emptyKpis = {
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
  const [kpis, allRegistrations] = event
    ? await Promise.all([getDashboardKPIs(event.id), getAllRegistrations(event.id)])
    : [emptyKpis, []];
  const recentRegistrations = allRegistrations.slice(0, 8);
  const totalBooked = kpis.slotBreakdown.reduce((acc, s) => acc + s.bookedCount, 0);

  const kpiBlocks = [
    { 
      title: 'ผู้ลงทะเบียนทั้งหมด', 
      value: kpis.totalRegistrations.toLocaleString('th-TH'), 
      unit: 'คน', 
      detail: kpis.walkInCount > 0 ? `รวม Walk-in ${kpis.walkInCount} คน` : 'รวมทุกช่องทาง', 
      icon: Users,
      color: 'bg-blue-50 text-blue-900 border-blue-200' 
    },
    { 
      title: 'เช็คอินเข้างานแล้ว', 
      value: kpis.checkedInCount.toLocaleString('th-TH'), 
      unit: 'คน', 
      detail: `คิดเป็น ${kpis.attendanceRatePercent}% ของยอดลงทะเบียน`, 
      icon: UserCheck,
      color: 'bg-sky-50 text-sky-900 border-sky-200' 
    },
    { 
      title: 'บริจาคสำเร็จ', 
      value: kpis.completedCount.toLocaleString('th-TH'), 
      unit: 'ยูนิต', 
      detail: `รับของที่ระลึกแล้ว ${kpis.completedCount} คน`, 
      icon: Heart,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200' 
    },
    { 
      title: 'สัดส่วนผู้เข้าร่วม', 
      value: `${kpis.studentsCount + kpis.staffCount} / ${kpis.generalPublicCount}`, 
      unit: 'คน', 
      detail: `นศ. ${kpis.studentsCount} · บุคลากร ${kpis.staffCount} · บุคคลทั่วไป ${kpis.generalPublicCount}`, 
      icon: GraduationCap,
      color: 'bg-amber-50 text-amber-900 border-amber-200' 
    },
  ];

  const utilizationSlots = kpis.slotBreakdown
    .slice()
    .sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
    .map((s) => {
      const relPercent = totalBooked > 0 ? Math.round((s.bookedCount / totalBooked) * 100) : 0;
      return {
        time: s.timeLabel,
        percent: relPercent,
        booked: s.bookedCount,
        max: s.capacity,
        checkedIn: s.checkedInCount,
      };
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[var(--burgundy-700)]">
              MUMT LoveUnit ครั้งที่ 9
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] text-[11px] font-bold">
              16 ก.ย. 2569 (09:00 - 14:00 น.)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display">
            แดชบอร์ดผู้ดูแลระบบ
          </h1>
          <p className="text-xs text-[var(--muted)] font-medium">
            ห้องประชุม 217-218 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href="/staff/walk-in"
            className="editorial-btn-primary py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 shadow-2xs text-center"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="truncate">Walk-in</span>
          </Link>

          <Link
            href="/staff/checkin"
            className="editorial-btn-secondary py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 text-center"
          >
            <QrCode className="h-4 w-4 text-[var(--burgundy-700)] shrink-0" />
            <span className="truncate">จุดสแกน QR</span>
          </Link>

          <a
            href="/api/admin/export"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-[var(--line)] hover:bg-gray-50 text-xs font-bold text-[var(--ink)] shadow-2xs transition-all text-center"
          >
            <Download className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">Export ข้อมูล</span>
          </a>
          {currentUser?.profile.role === 'SUPER_ADMIN' && (
            <div className="flex items-center justify-center w-full sm:w-auto">
              <ResetTestDataButton />
            </div>
          )}
        </div>
      </div>

      {/* ============ SECTION 1: LIVE KPI CARDS ============ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--muted)]">
            สถิติภาพรวม
          </h2>
          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            เปิดรับลงทะเบียนต่อเนื่อง
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {kpiBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.title} className={`p-3.5 sm:p-5 rounded-2xl border ${block.color} shadow-2xs space-y-2 flex flex-col justify-between`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] sm:text-xs font-bold opacity-90 truncate">{block.title}</span>
                  <div className="p-1 sm:p-1.5 rounded-lg bg-white/80 shadow-2xs shrink-0">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-3xl font-black font-mono tracking-tight">{block.value}</span>
                    <span className="text-[10px] sm:text-xs font-bold">{block.unit}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-medium pt-1 opacity-80 line-clamp-1 sm:line-clamp-none">{block.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ SECTION 2: HOURLY CAPACITY & STATUS ============ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Slot Occupancy Breakdown (7 Cols) */}
        <div className="lg:col-span-7 editorial-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--burgundy-700)]" />
                <span>ผู้ลงทะเบียนตามรอบเวลา</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                ช่วงเวลา 09:00 - 14:00 น.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--burgundy-700)] bg-[var(--rose-100)] px-2.5 py-1 rounded-lg border border-[var(--line)]">
              รวม {totalBooked} คน
            </span>
          </div>

          <div className="space-y-2.5">
            {utilizationSlots.map((slot) => {
              return (
                <div key={slot.time} className="p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs sm:text-sm text-[var(--ink)]">{slot.time} น.</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60">
                        เปิดรับ
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[var(--ink)] text-xs sm:text-sm">
                        {slot.booked}
                      </span>
                      <span className="text-xs font-sans font-medium text-gray-600 ml-1">คน</span>
                      {totalBooked > 0 && (
                        <span className="text-[11px] text-[var(--muted)] ml-1.5">({slot.percent}%)</span>
                      )}
                    </div>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-[var(--burgundy-700)] transition-all duration-500 rounded-full"
                      style={{ width: `${Math.max(slot.percent, slot.booked > 0 ? 8 : 0)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium pt-0.5">
                    <span>เช็คอินแล้ว: <strong className="text-emerald-700 font-mono">{slot.checkedIn}</strong> คน</span>
                    <span className="text-[10px] text-gray-400">ต่อเนื่อง</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Donor Status Overview (5 Cols) */}
        <div className="lg:col-span-5 editorial-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="space-y-0.5 border-b border-[var(--line)] pb-3">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>สถานะผู้บริจาค</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">ติดตามความคืบหน้าหน้างาน</p>
            </div>

            <div className="space-y-2.5 pt-3 text-xs font-bold">
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-900">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>1. ลงทะเบียนแล้ว (รอเข้ารับบริการ)</span>
                </div>
                <span className="font-mono text-sm font-black text-blue-950">
                  {Math.max(0, kpis.totalRegistrations - kpis.checkedInCount)} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-900">
                  <span className="h-2 w-2 rounded-full bg-amber-600" />
                  <span>2. เช็คอินเข้างานแล้ว</span>
                </div>
                <span className="font-mono text-sm font-black text-amber-950">
                  {Math.max(0, kpis.checkedInCount - kpis.completedCount)} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>3. บริจาคสำเร็จ (รับของที่ระลึก)</span>
                </div>
                <span className="font-mono text-sm font-black text-emerald-950">
                  {kpis.completedCount} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  <span>4. ยกเลิก / ไม่ได้เข้าร่วม</span>
                </div>
                <span className="font-mono text-sm font-black text-gray-800">
                  {kpis.cancelledCount + kpis.noShowCount} คน
                </span>
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-[var(--line)]">
            <Link
              href="/mt70/registrations"
              className="text-xs font-bold text-[var(--burgundy-700)] hover:underline flex items-center justify-between py-1"
            >
              <span>ดูรายชื่อผู้ลงทะเบียนทั้งหมด ({allRegistrations.length} คน)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </section>

      {/* ============ SECTION 3: RECENT REGISTRATIONS ============ */}
      <section className="editorial-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div>
            <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--burgundy-700)]" />
              <span>ผู้ลงทะเบียนล่าสุด</span>
            </h3>
            <p className="text-[11px] text-[var(--muted)]">รายการลงทะเบียนล่าสุดในระบบ</p>
          </div>

          <Link
            href="/mt70/registrations"
            className="editorial-btn-secondary py-1.5 px-3 text-xs"
          >
            <span>ดูทั้งหมด</span>
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="py-8 text-center text-gray-400 font-medium text-xs">
            ยังไม่มีรายการลงทะเบียนในขณะนี้
          </div>
        ) : (
          <>
            {/* Mobile Card View (Prevents broken, squashed columns on phones) */}
            <div className="block md:hidden space-y-2.5">
              {recentRegistrations.map((reg) => {
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
                const regCode = regObj.registration_code || regObj.registrationCode || '';
                const isWalkIn = isWalkInRecord(regCode) || (regObj as unknown as { source?: string }).source === 'WALK_IN';
                const regTime = (regObj as unknown as { registered_at?: string; registeredAt?: string; created_at?: string; createdAt?: string }).registered_at ||
                  (regObj as unknown as { registered_at?: string; registeredAt?: string; created_at?: string; createdAt?: string }).registeredAt ||
                  (regObj as unknown as { registered_at?: string; registeredAt?: string; created_at?: string; createdAt?: string }).created_at ||
                  (regObj as unknown as { registered_at?: string; registeredAt?: string; created_at?: string; createdAt?: string }).createdAt;
                const timeLabel = isWalkIn
                  ? (regTime ? `Walk-in (${formatBangkokTime(regTime)})` : 'Walk-in')
                  : (slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : '09:00 – 14:00 น.');
                const fullName = `${regObj.first_name || regObj.firstName || ''} ${regObj.last_name || regObj.lastName || ''}`.trim();
                const pType = regObj.participant_type || regObj.participantType || 'STUDENT';

                return (
                  <div key={regObj.id} className="p-3.5 rounded-xl border border-[var(--line)] bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[var(--burgundy-700)] bg-[var(--rose-100)] px-2 py-0.5 rounded">
                        {regCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.colorClass}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[var(--ink)]">{fullName}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{regObj.phone}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 shrink-0">
                        {getParticipantTypeLabel(pType)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                      <span className="text-gray-500 font-mono text-[11px]">รอบ: {timeLabel}</span>
                      <Link
                        href={`/registration/${regCode}`}
                        className="inline-flex items-center gap-1 font-bold text-[var(--burgundy-700)] hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>ดูบัตร</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border border-[var(--line)] rounded-xl overflow-hidden min-w-[680px]">
                <thead className="bg-[var(--rose-100)] text-[var(--burgundy-700)] font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3 border-b border-[var(--line)] whitespace-nowrap">รหัสลงทะเบียน</th>
                    <th className="p-3 border-b border-[var(--line)] whitespace-nowrap">ชื่อ - สกุล</th>
                    <th className="p-3 border-b border-[var(--line)] whitespace-nowrap">เบอร์โทรศัพท์</th>
                    <th className="p-3 border-b border-[var(--line)] whitespace-nowrap">ประเภท</th>
                    <th className="p-3 border-b border-[var(--line)] whitespace-nowrap">รอบเวลา</th>
                    <th className="p-3 border-b border-[var(--line)] whitespace-nowrap">สถานะ</th>
                    <th className="p-3 border-b border-[var(--line)] text-right whitespace-nowrap">บัตร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] font-medium text-[var(--ink)]">
                  {recentRegistrations.map((reg) => {
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
                    const regCode = regObj.registration_code || regObj.registrationCode || '';
                    const isWalkIn = isWalkInRecord(regCode) || (regObj as unknown as { source?: string }).source === 'WALK_IN';
                    const regTime = (regObj as unknown as { registered_at?: string; registeredAt?: string; created_at?: string; createdAt?: string }).registered_at ||
                      (regObj as unknown as { registered_at?: string; registeredAt?: string; created_at?: string; createdAt?: string }).registeredAt ||
                      (regObj as unknown as { registered_at?: string; registeredAt?: string; created_at?: string; createdAt?: string }).created_at ||
                      (regObj as unknown as { registered_at?: string; registeredAt?: string; created_at?: string; createdAt?: string }).createdAt;
                    const timeLabel = isWalkIn
                      ? (regTime ? `Walk-in (${formatBangkokTime(regTime)})` : 'Walk-in')
                      : (slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : '09:00 – 14:00 น.');
                    const fullName = `${regObj.first_name || regObj.firstName || ''} ${regObj.last_name || regObj.lastName || ''}`.trim();
                    const pType = regObj.participant_type || regObj.participantType || 'STUDENT';

                    return (
                      <tr key={regObj.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-[var(--burgundy-700)] whitespace-nowrap">
                          {regCode}
                        </td>
                        <td className="p-3 font-bold whitespace-nowrap">
                          {fullName}
                        </td>
                        <td className="p-3 font-mono text-gray-600 whitespace-nowrap">{reg.phone}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800">
                            {getParticipantTypeLabel(pType)}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-gray-700 whitespace-nowrap">{timeLabel}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.colorClass}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
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
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

    </div>
  );
}
