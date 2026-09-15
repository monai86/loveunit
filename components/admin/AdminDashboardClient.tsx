'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  GraduationCap,
  RefreshCw,
  Megaphone
} from 'lucide-react';
import { getParticipantTypeLabel, getRegistrationStatusBadge, formatTimeRange, formatBangkokTime, isWalkInRecord } from '@/lib/utils/format';
import { RegistrationStatus, ParticipantType, DashboardKPIs } from '@/lib/types/database';
import { ResetTestDataButton } from '@/components/admin/ResetTestDataButton';

interface AdminDashboardClientProps {
  initialKpis: DashboardKPIs;
  initialRegistrations: unknown[];
  currentUserRole?: string;
  eventId: string;
}

export function AdminDashboardClient({
  initialKpis,
  initialRegistrations,
  currentUserRole,
}: AdminDashboardClientProps) {
  const [kpis, setKpis] = useState<DashboardKPIs>(initialKpis);
  const [allRegistrations, setAllRegistrations] = useState<unknown[]>(initialRegistrations);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date()) + ' น.';
  });

  const refreshData = useCallback(async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) setIsRefreshing(true);
    try {
      const [dashRes, regsRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/registrations')
      ]);

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        if (dashData.success && dashData.kpis) {
          setKpis(dashData.kpis);
        }
      }

      if (regsRes.ok) {
        const regsData = await regsRes.json();
        if (regsData.success && Array.isArray(regsData.registrations)) {
          setAllRegistrations(regsData.registrations);
        }
      }

      const now = new Date();
      setLastUpdated(
        new Intl.DateTimeFormat('th-TH', {
          timeZone: 'Asia/Bangkok',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now) + ' น.'
      );
    } catch (err) {
      console.error('Failed to auto-refresh admin dashboard:', err);
    } finally {
      if (showLoadingSpinner) setIsRefreshing(false);
    }
  }, []);

  // Real-time Background Polling (Every 6 seconds when active)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void refreshData(false);
      }
    }, 6000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);

  const recentRegistrations = allRegistrations.slice(0, 8);
  const totalBooked = (kpis.slotBreakdown || []).reduce((acc, s) => acc + s.bookedCount, 0);

  const kpiBlocks = [
    { 
      title: 'ผู้ลงทะเบียนทั้งหมด', 
      value: kpis.totalRegistrations.toLocaleString('th-TH'), 
      unit: 'คน', 
      detail: kpis.walkInCount > 0 ? `รวม Walk-in ${kpis.walkInCount} คน` : 'รวมทุกช่องทาง', 
      icon: Users,
      bgGradient: 'bg-gradient-to-br from-rose-500/[0.09] via-white to-red-500/[0.04]',
      border: 'border-rose-200/80 hover:border-rose-300',
      iconBg: 'bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md shadow-rose-600/25',
      textColor: 'text-rose-950',
      titleColor: 'text-rose-900',
      detailColor: 'text-rose-700/90',
      topLine: 'bg-gradient-to-r from-rose-500 to-red-600',
      glow: 'bg-rose-500/10',
    },
    { 
      title: 'เช็คอินเข้างานแล้ว', 
      value: kpis.checkedInCount.toLocaleString('th-TH'), 
      unit: 'คน', 
      detail: `คิดเป็น ${kpis.attendanceRatePercent}% ของยอดลงทะเบียน`, 
      icon: UserCheck,
      bgGradient: 'bg-gradient-to-br from-blue-500/[0.09] via-white to-indigo-500/[0.04]',
      border: 'border-blue-200/80 hover:border-blue-300',
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/25',
      textColor: 'text-blue-950',
      titleColor: 'text-blue-900',
      detailColor: 'text-blue-700/90',
      topLine: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      glow: 'bg-blue-500/10',
    },
    { 
      title: 'บริจาคสำเร็จ', 
      value: kpis.completedCount.toLocaleString('th-TH'), 
      unit: 'ยูนิต', 
      detail: `บริจาคโลหิตสำเร็จสมบูรณ์ ${kpis.completedCount} คน`, 
      icon: Heart,
      bgGradient: 'bg-gradient-to-br from-emerald-500/[0.09] via-white to-teal-500/[0.04]',
      border: 'border-emerald-200/80 hover:border-emerald-300',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25',
      textColor: 'text-emerald-950',
      titleColor: 'text-emerald-900',
      detailColor: 'text-emerald-700/90',
      topLine: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      glow: 'bg-emerald-500/10',
    },
    { 
      title: 'สัดส่วนผู้เข้าร่วม', 
      value: `${kpis.studentsCount + kpis.staffCount} / ${kpis.generalPublicCount}`, 
      unit: 'คน', 
      detail: `นศ. ${kpis.studentsCount} · บุคลากร ${kpis.staffCount} · บุคคลทั่วไป ${kpis.generalPublicCount}`, 
      icon: GraduationCap,
      bgGradient: 'bg-gradient-to-br from-amber-500/[0.09] via-white to-orange-500/[0.04]',
      border: 'border-amber-200/80 hover:border-amber-300',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-600/25',
      textColor: 'text-amber-950',
      titleColor: 'text-amber-900',
      detailColor: 'text-amber-700/90',
      topLine: 'bg-gradient-to-r from-amber-500 to-orange-600',
      glow: 'bg-amber-500/10',
    },
  ];

  const utilizationSlots = (kpis.slotBreakdown || [])
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-rose-100/90">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-300/80 text-[11px] font-black tracking-wide shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live อัปเดตสด
            </span>
            <span className="text-xs font-black text-[var(--burgundy-700)] bg-rose-50/80 border border-rose-200/70 px-2.5 py-1 rounded-full">
              MUMT LoveUnit ครั้งที่ 9
            </span>
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-100/90 to-amber-100/70 text-[var(--burgundy-800)] border border-rose-200/60 text-[11px] font-bold">
              16 ก.ย. 2569 (09:00 - 14:00 น.)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)] font-display tracking-tight">
            แดชบอร์ดผู้ดูแลระบบ
          </h1>
          <div className="flex items-center gap-3 text-xs text-[var(--muted)] font-medium">
            <span className="flex items-center gap-1">
              <span>ห้องประชุม 217-218 อาคารสิริวิทยา ม.มหิดล ศาลายา</span>
            </span>
            {lastUpdated && (
              <span className="font-mono text-[11px] text-gray-400">
                · อัปเดตล่าสุด {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          
          <button
            onClick={() => refreshData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-rose-50/60 border border-rose-200/80 text-xs font-bold text-[var(--ink)] shadow-xs transition-all hover:shadow-sm cursor-pointer active:scale-95"
            title="กดเพื่อดึงข้อมูลสถิติล่าสุดทันที"
          >
            <RefreshCw className={`h-4 w-4 text-[var(--burgundy-700)] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'กำลังอัปเดต...' : 'รีเฟรชสด'}</span>
          </button>

          <Link
            href="/staff/walk-in"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-black shadow-sm shadow-rose-700/25 transition-all hover:shadow-md active:scale-95 text-center"
          >
            <Plus className="h-4 w-4 shrink-0 stroke-[3]" />
            <span className="truncate">Walk-in</span>
          </Link>

          <Link
            href="/staff/checkin"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-emerald-300/80 text-xs font-black text-emerald-800 shadow-xs transition-all hover:shadow-sm text-center active:scale-95"
          >
            <QrCode className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">จุดสแกน QR</span>
          </Link>

          <a
            href="/api/admin/export"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-teal-50/60 border border-gray-200 text-xs font-bold text-gray-700 shadow-xs transition-all hover:shadow-sm text-center active:scale-95"
          >
            <Download className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">Export</span>
          </a>

          {currentUserRole === 'SUPER_ADMIN' && (
            <div className="flex items-center justify-center w-full sm:w-auto">
              <ResetTestDataButton />
            </div>
          )}
        </div>
      </div>

      {/* ============ SECTION 1: LIVE KPI CARDS ============ */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
            <span className="font-extrabold text-[var(--ink)]">สถิติภาพรวม</span>
            <span className="text-[10px] text-gray-400 font-normal">(อัปเดตอัตโนมัติ)</span>
          </h2>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
            ● เปิดรับลงทะเบียนต่อเนื่อง
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpiBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div 
                key={block.title} 
                className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border ${block.border} ${block.bgGradient} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-0.5`}
              >
                {/* Decorative Top Accent Bar */}
                <div className={`absolute top-0 inset-x-0 h-1 ${block.topLine}`} />
                
                {/* Subtle corner ambient glow */}
                <div className={`pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full ${block.glow} blur-xl`} />

                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[11px] sm:text-xs font-extrabold truncate ${block.titleColor}`}>{block.title}</span>
                  <div className={`p-2 rounded-xl ${block.iconBg} shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl sm:text-4xl font-black font-mono tracking-tight ${block.textColor}`}>{block.value}</span>
                    <span className={`text-[11px] sm:text-xs font-black ${block.titleColor}`}>{block.unit}</span>
                  </div>
                  <p className={`text-[10px] sm:text-[11px] font-bold pt-1.5 ${block.detailColor} line-clamp-1 sm:line-clamp-none`}>{block.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ SECTION 2: HOURLY CAPACITY & STATUS ============ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Slot Occupancy Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-rose-100/80 pb-3.5">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                <div className="p-1 rounded-lg bg-rose-50 text-[var(--burgundy-700)]">
                  <Clock className="h-4 w-4" />
                </div>
                <span>ผู้ลงทะเบียนตามรอบเวลา</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                ช่วงเวลา 09:00 - 14:00 น.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--burgundy-700)] bg-gradient-to-r from-rose-50 to-red-50 px-3 py-1 rounded-xl border border-rose-200/70 shadow-2xs">
              รวม {totalBooked} คน
            </span>
          </div>

          <div className="space-y-2.5">
            {utilizationSlots.map((slot) => {
              return (
                <div key={slot.time} className="p-3.5 rounded-xl bg-gradient-to-r from-gray-50/90 via-white to-rose-50/20 border border-gray-200/80 hover:border-rose-300/80 transition-all duration-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs sm:text-sm text-[var(--ink)]">{slot.time} น.</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-extrabold border border-emerald-200/80">
                        เปิดรับ
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-[var(--burgundy-900)] text-xs sm:text-sm">
                        {slot.booked}
                      </span>
                      <span className="text-xs font-sans font-bold text-gray-700 ml-1">คน</span>
                      {totalBooked > 0 && (
                        <span className="text-[11px] text-gray-400 font-bold ml-1.5">({slot.percent}%)</span>
                      )}
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 transition-all duration-500 rounded-full shadow-xs"
                      style={{ width: `${Math.max(slot.percent, slot.booked > 0 ? 8 : 0)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium pt-0.5">
                    <span>เช็คอินแล้ว: <strong className="text-emerald-700 font-mono font-bold">{slot.checkedIn}</strong> คน</span>
                    <span className="text-[10px] text-gray-400 font-semibold">ต่อเนื่อง</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Donor Status Overview (5 Cols) */}
        <div className="lg:col-span-5 bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 flex flex-col justify-between backdrop-blur-xs">
          <div>
            <div className="space-y-0.5 border-b border-rose-100/80 pb-3.5">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                  <Layers className="h-4 w-4" />
                </div>
                <span>สถานะผู้บริจาค</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">ติดตามความคืบหน้าหน้างานแบบเรียลไทม์</p>
            </div>

            <div className="space-y-2.5 pt-3.5 text-xs font-bold">
              
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-blue-50/40 to-white border border-blue-200/90 shadow-2xs hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2.5 text-blue-900">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-xs shadow-blue-500/50 animate-pulse" />
                  <span>1. ลงทะเบียนแล้ว (รอเข้ารับบริการ)</span>
                </div>
                <span className="font-mono text-sm font-black text-blue-950">
                  {Math.max(0, kpis.totalRegistrations - kpis.checkedInCount)} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-white border border-amber-200/90 shadow-2xs hover:border-amber-300 transition-all">
                <div className="flex items-center gap-2.5 text-amber-900">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-600 shadow-xs shadow-amber-500/50" />
                  <span>2. เช็คอินเข้างานแล้ว</span>
                </div>
                <span className="font-mono text-sm font-black text-amber-950">
                  {Math.max(0, kpis.checkedInCount - kpis.completedCount)} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white border border-emerald-200/90 shadow-2xs hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-2.5 text-emerald-900">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 shadow-xs shadow-emerald-500/50" />
                  <span>3. บริจาคสำเร็จ (Completed)</span>
                </div>
                <span className="font-mono text-sm font-black text-emerald-950">
                  {kpis.completedCount} คน
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-gray-50 via-gray-50/60 to-white border border-gray-200 shadow-2xs hover:border-gray-300 transition-all">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                  <span>4. ยกเลิก / ไม่ได้เข้าร่วม</span>
                </div>
                <span className="font-mono text-sm font-black text-gray-800">
                  {kpis.cancelledCount + kpis.noShowCount} คน
                </span>
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-rose-100/80">
            <Link
              href="/mt70/registrations"
              prefetch={true}
              className="inline-flex w-full items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-rose-50/70 to-red-50/40 hover:from-rose-100/80 hover:to-red-100/60 border border-rose-200/70 text-xs font-bold text-[var(--burgundy-700)] transition-all group"
            >
              <span>ดูรายชื่อผู้ลงทะเบียนทั้งหมด ({allRegistrations.length} คน)</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      </section>

      {/* ============ PR CHANNELS & MARKETING ATTRIBUTION ============ */}
      {kpis.prChannelBreakdown && Object.keys(kpis.prChannelBreakdown).length > 0 && (
        <section className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-rose-100/80 pb-3.5">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
                <div className="p-1 rounded-lg bg-rose-50 text-[var(--burgundy-700)]">
                  <Megaphone className="h-4 w-4" />
                </div>
                <span>แหล่งข่าวสารการประชาสัมพันธ์ (PR Channel Attribution)</span>
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                สถิติช่องทางที่ทำให้ผู้บริจาคทราบข่าวกิจกรรม (สำหรับวัดผลการประชาสัมพันธ์)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--burgundy-700)] bg-gradient-to-r from-rose-50 to-red-50 px-3 py-1 rounded-xl border border-rose-200/70 shadow-2xs">
              {Object.values(kpis.prChannelBreakdown).reduce((a, b) => a + b, 0)} คน
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(kpis.prChannelBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([channel, count]) => {
                const total = Object.values(kpis.prChannelBreakdown!).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={channel} className="p-3.5 rounded-xl bg-gradient-to-br from-gray-50/90 via-white to-rose-50/10 border border-gray-200/80 hover:border-rose-300/80 space-y-2.5 shadow-2xs transition-all">
                    <div className="flex items-center justify-between">
                      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 shrink-0" />
                      <span className="font-mono text-xs font-black text-[var(--burgundy-900)] bg-rose-50/90 px-2 py-0.5 rounded-md border border-rose-200/60">
                        {count} คน ({pct}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block truncate" title={channel}>
                        {channel}
                      </span>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mt-1.5 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-red-700 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ============ SECTION 3: RECENT REGISTRATIONS ============ */}
      <section className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
        <div className="flex items-center justify-between border-b border-rose-100/80 pb-3.5">
          <div>
            <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
              <div className="p-1 rounded-lg bg-rose-50 text-[var(--burgundy-700)]">
                <Users className="h-4 w-4" />
              </div>
              <span>ผู้ลงทะเบียนล่าสุด</span>
            </h3>
            <p className="text-[11px] text-[var(--muted)]">รายการลงทะเบียนล่าสุดในระบบ (อัปเดตอัตโนมัติ)</p>
          </div>

          <Link
            href="/mt70/registrations"
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 hover:from-rose-100 hover:to-red-100 text-xs font-bold text-[var(--burgundy-700)] border border-rose-200/70 transition-all shadow-2xs"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="py-10 text-center text-gray-400 font-bold text-xs">
            ยังไม่มีรายการลงทะเบียนในขณะนี้
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
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
                  <div key={regObj.id} className="p-4 rounded-xl border border-rose-100/90 bg-white hover:border-rose-200 shadow-2xs space-y-2.5 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs text-[var(--burgundy-700)] bg-rose-50/90 border border-rose-200/60 px-2.5 py-1 rounded-lg">
                        {regCode}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.colorClass}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[var(--ink)]">{fullName}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{regObj.phone}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 shrink-0 border border-gray-200/60">
                        {getParticipantTypeLabel(pType)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-rose-100/60">
                      <span className="text-gray-500 font-mono text-[11px]">รอบ: {timeLabel}</span>
                      <Link
                        href={`/registration/${regCode}`}
                        prefetch={true}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-[var(--burgundy-700)] bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all"
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
            <div className="hidden md:block overflow-x-auto rounded-xl border border-rose-100/90 shadow-2xs">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead className="bg-gradient-to-r from-rose-50 via-red-50/60 to-rose-50 text-[var(--burgundy-800)] font-bold text-xs uppercase tracking-wider border-b border-rose-200/70">
                  <tr>
                    <th className="p-3.5 whitespace-nowrap">รหัสลงทะเบียน</th>
                    <th className="p-3.5 whitespace-nowrap">ชื่อ - สกุล</th>
                    <th className="p-3.5 whitespace-nowrap">เบอร์โทรศัพท์</th>
                    <th className="p-3.5 whitespace-nowrap">ประเภท</th>
                    <th className="p-3.5 whitespace-nowrap">รอบเวลา</th>
                    <th className="p-3.5 whitespace-nowrap">สถานะ</th>
                    <th className="p-3.5 text-right whitespace-nowrap">บัตร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100/70 font-medium text-[var(--ink)] bg-white">
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
                      <tr key={regObj.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-mono font-black text-xs text-[var(--burgundy-700)] bg-rose-50/90 border border-rose-200/60 px-2.5 py-1 rounded-md inline-block">
                            {regCode}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[var(--ink)] whitespace-nowrap">
                          {fullName}
                        </td>
                        <td className="p-3.5 font-mono text-gray-600 whitespace-nowrap">{regObj.phone}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200/70">
                            {getParticipantTypeLabel(pType)}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-xs text-gray-700 whitespace-nowrap">{timeLabel}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.colorClass}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <Link
                            href={`/registration/${regCode}`}
                            prefetch={true}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--burgundy-700)] bg-rose-50/80 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200/60 transition-all shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
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
