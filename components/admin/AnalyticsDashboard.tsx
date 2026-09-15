'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Clock,
  GraduationCap,
  Building2,
  Users,
  ArrowLeft,
  RefreshCw,
  Zap,
  CalendarDays,
  Repeat,
  Globe,
} from 'lucide-react';

// ── Types ──
interface DailyGrowth {
  date: string;
  count: number;
  cumulative: number;
}

interface FacultyItem {
  faculty: string;
  count: number;
}

interface AcademicYearItem {
  year: string;
  count: number;
}

interface SourceItem {
  source: string;
  count: number;
}

interface PeakHourItem {
  hour: number;
  count: number;
}

interface SlotUtil {
  slotId: string;
  timeLabel: string;
  capacity: number;
  booked: number;
  utilPercent: number;
}

interface AnalyticsData {
  totalActive: number;
  totalAll: number;
  dailyGrowth: DailyGrowth[];
  hourlyHeatmap: Record<string, Record<number, number>>;
  facultyBreakdown: FacultyItem[];
  academicYearBreakdown: AcademicYearItem[];
  crossTab: Record<string, Record<string, number>>;
  sourceBreakdown: SourceItem[];
  peakHours: PeakHourItem[];
  slotUtilization: SlotUtil[];
  summary: {
    avgPerDay: number;
    peakDay: { date: string; count: number };
    totalDays: number;
    statusBreakdown: {
      registered: number;
      checkedIn: number;
      inProcess: number;
      completed: number;
      cancelled: number;
      noShow: number;
    };
  };
}

interface AnalyticsDashboardProps {
  initialData: AnalyticsData | null;
}

// ── Helpers ──
const PARTICIPANT_LABELS: Record<string, string> = {
  STUDENT: 'นักศึกษา',
  STAFF: 'บุคลากร',
  GENERAL_PUBLIC: 'บุคคลทั่วไป',
};

const SOURCE_LABELS: Record<string, string> = {
  ONLINE: 'ออนไลน์',
  WALK_IN: 'Walk-in',
  ADMIN: 'แอดมินเพิ่ม',
};

const STATUS_DETAILS: Record<string, { label: string; dot: string; bg: string; border: string; text: string }> = {
  registered: { label: 'ลงทะเบียนแล้ว', dot: 'bg-blue-600 shadow-xs shadow-blue-500/50', bg: 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/30', border: 'border-blue-200/90 hover:border-blue-300', text: 'text-blue-950' },
  checkedIn: { label: 'เช็คอินแล้ว', dot: 'bg-amber-600 shadow-xs shadow-amber-500/50', bg: 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/30', border: 'border-amber-200/90 hover:border-amber-300', text: 'text-amber-950' },
  inProcess: { label: 'กำลังบริจาค', dot: 'bg-purple-600 shadow-xs shadow-purple-500/50', bg: 'bg-gradient-to-br from-purple-50/90 via-white to-fuchsia-50/30', border: 'border-purple-200/90 hover:border-purple-300', text: 'text-purple-950' },
  completed: { label: 'บริจาคสำเร็จ', dot: 'bg-emerald-600 shadow-xs shadow-emerald-500/50', bg: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/30', border: 'border-emerald-200/90 hover:border-emerald-300', text: 'text-emerald-950' },
  cancelled: { label: 'ยกเลิก', dot: 'bg-gray-400', bg: 'bg-gradient-to-br from-gray-50 via-white to-slate-50', border: 'border-gray-200 hover:border-gray-300', text: 'text-gray-800' },
  noShow: { label: 'ไม่ได้มา', dot: 'bg-rose-500', bg: 'bg-gradient-to-br from-rose-50/80 via-white to-red-50/30', border: 'border-rose-200 hover:border-rose-300', text: 'text-rose-950' },
};

function formatThaiDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00+07:00');
    return new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: 'numeric',
      month: 'short',
    }).format(d);
  } catch {
    return dateStr;
  }
}

// ── Component ──
export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date()) + ' น.'
  );

  const refreshData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
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
      console.error('Failed to auto-refresh analytics dashboard:', err);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  // Polling every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshData(false);
      }
    }, 8000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshData]);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-[var(--muted)] font-medium">ไม่สามารถโหลดข้อมูลสถิติได้</p>
      </div>
    );
  }

  const maxDaily = Math.max(...data.dailyGrowth.map(d => d.count), 1);
  const maxPeakHour = Math.max(...data.peakHours.map(h => h.count), 1);
  const maxFaculty = Math.max(...data.facultyBreakdown.map(f => f.count), 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-rose-100/90">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              href="/mt70"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50/80 border border-rose-200/60 text-xs font-bold text-[var(--burgundy-700)] hover:bg-rose-100 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>แดชบอร์ด</span>
            </Link>
            <span className="text-gray-300">›</span>
            <span className="text-xs font-bold text-[var(--burgundy-700)] bg-rose-50/60 px-2.5 py-0.5 rounded-full border border-rose-100">
              สถิติเจาะลึก
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)] font-display tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-xs">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span>สถิติเจาะลึก (Deep Analytics)</span>
          </h1>
          <p className="text-xs text-[var(--muted)] font-medium">
            วิเคราะห์ข้อมูลผู้ลงทะเบียนเชิงลึก · อัปเดตล่าสุด {lastUpdated}
          </p>
        </div>

        <button
          onClick={() => refreshData(true)}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50/60 border border-rose-200/80 text-xs font-bold text-[var(--ink)] shadow-xs transition-all hover:shadow-sm cursor-pointer shrink-0 active:scale-95"
        >
          <RefreshCw className={`h-4 w-4 text-[var(--burgundy-700)] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'กำลังอัปเดต...' : 'รีเฟรชข้อมูล'}</span>
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          title="ยอดสมัครรวม"
          value={data.totalActive.toLocaleString('th-TH')}
          unit="คน"
          detail={`จากทั้งหมด ${data.totalAll} รายการ`}
          icon={Users}
          bgGradient="bg-gradient-to-br from-rose-500/[0.09] via-white to-red-500/[0.04]"
          border="border-rose-200/80 hover:border-rose-300"
          iconBg="bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md shadow-rose-600/25"
          textColor="text-rose-950"
          titleColor="text-rose-900"
          detailColor="text-rose-700/90"
          topLine="bg-gradient-to-r from-rose-500 to-red-600"
          glow="bg-rose-500/10"
        />
        <SummaryCard
          title="เฉลี่ยต่อวัน"
          value={data.summary.avgPerDay.toLocaleString('th-TH')}
          unit="คน/วัน"
          detail={`จากข้อมูล ${data.summary.totalDays} วัน`}
          icon={TrendingUp}
          bgGradient="bg-gradient-to-br from-emerald-500/[0.09] via-white to-teal-500/[0.04]"
          border="border-emerald-200/80 hover:border-emerald-300"
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25"
          textColor="text-emerald-950"
          titleColor="text-emerald-900"
          detailColor="text-emerald-700/90"
          topLine="bg-gradient-to-r from-emerald-500 to-teal-600"
          glow="bg-emerald-500/10"
        />
        <SummaryCard
          title="วันยอดสมัครสูงสุด"
          value={data.summary.peakDay.count.toLocaleString('th-TH')}
          unit="คน"
          detail={formatThaiDate(data.summary.peakDay.date)}
          icon={Zap}
          bgGradient="bg-gradient-to-br from-amber-500/[0.09] via-white to-orange-500/[0.04]"
          border="border-amber-200/80 hover:border-amber-300"
          iconBg="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-600/25"
          textColor="text-amber-950"
          titleColor="text-amber-900"
          detailColor="text-amber-700/90"
          topLine="bg-gradient-to-r from-amber-500 to-orange-600"
          glow="bg-amber-500/10"
        />
        <SummaryCard
          title="จำนวนวันเปิดรับ"
          value={data.summary.totalDays.toLocaleString('th-TH')}
          unit="วัน"
          detail="นับจากวันแรกที่มีคนสมัคร"
          icon={CalendarDays}
          bgGradient="bg-gradient-to-br from-indigo-500/[0.09] via-white to-purple-500/[0.04]"
          border="border-indigo-200/80 hover:border-indigo-300"
          iconBg="bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-md shadow-indigo-600/25"
          textColor="text-indigo-950"
          titleColor="text-indigo-900"
          detailColor="text-indigo-700/90"
          topLine="bg-gradient-to-r from-indigo-500 to-purple-600"
          glow="bg-indigo-500/10"
        />
      </section>

      {/* ── Status Funnel ── */}
      <section className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
        <SectionHeader
          icon={<TrendingUp className="h-4 w-4 text-[var(--burgundy-700)]" />}
          title="Conversion Funnel"
          subtitle="สถานะผู้ลงทะเบียนทั้งหมดในระบบ"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.entries(data.summary.statusBreakdown).map(([key, count]) => {
            const detail = STATUS_DETAILS[key] || {
              label: key,
              dot: 'bg-gray-400',
              bg: 'bg-gradient-to-br from-gray-50 via-white to-slate-50',
              border: 'border-gray-200',
              text: 'text-gray-900',
            };
            return (
              <div
                key={key}
                className={`p-3.5 rounded-xl border ${detail.border} ${detail.bg} space-y-1.5 shadow-2xs hover:shadow-xs transition-all`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${detail.dot}`} />
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide truncate">
                    {detail.label}
                  </span>
                </div>
                <div className={`font-mono text-xl font-black ${detail.text}`}>
                  {count.toLocaleString('th-TH')}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Daily Growth Chart ── */}
      <section className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
        <SectionHeader
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          title="ยอดลงทะเบียนรายวัน"
          subtitle={`ยอดสะสม ${data.dailyGrowth.at(-1)?.cumulative || 0} คน`}
        />

        {data.dailyGrowth.length === 0 ? (
          <EmptyState text="ยังไม่มีข้อมูล" />
        ) : (
          <div className="space-y-4">
            {/* Bar chart */}
            <div className="flex items-end gap-1.5 sm:gap-2 h-44 sm:h-56 px-1 pt-6 pb-2 bg-gradient-to-b from-rose-50/30 to-transparent rounded-xl border border-rose-100/60">
              {data.dailyGrowth.map((d) => {
                const barHeight = Math.max((d.count / maxDaily) * 100, d.count > 0 ? 8 : 2);
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center justify-end gap-1 group relative min-w-0 h-full"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-br from-slate-900 to-stone-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap z-20 pointer-events-none transition-opacity shadow-xl border border-white/10">
                      {formatThaiDate(d.date)} — {d.count} คน (สะสม {d.cumulative})
                    </div>
                    <span className="text-[9px] font-mono font-bold text-[var(--burgundy-700)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-rose-600 via-red-600 to-rose-400 transition-all duration-500 group-hover:from-rose-500 group-hover:to-red-400 shadow-xs"
                      style={{ height: `${barHeight}%` }}
                    />
                    <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 truncate w-full text-center mt-0.5">
                      {formatThaiDate(d.date)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cumulative line representation */}
            <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] font-medium pt-3 border-t border-rose-100/80">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="shrink-0 font-bold text-gray-700">ยอดสะสมรายวัน:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {data.dailyGrowth.map((d, i) => (
                  <span
                    key={d.date}
                    className="font-mono text-[11px] font-bold text-[var(--burgundy-700)] bg-rose-50/80 px-2 py-0.5 rounded-md border border-rose-100/90 shrink-0"
                  >
                    {d.cumulative}{i < data.dailyGrowth.length - 1 ? ' →' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Two-Column: Peak Hours + Source Attribution ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Peak Hours */}
        <div className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
          <SectionHeader
            icon={<Clock className="h-4 w-4 text-amber-600" />}
            title="ชั่วโมงที่มีการสมัครสูงสุด"
            subtitle="แยกตามชั่วโมง (เวลาไทย)"
          />
          {data.peakHours.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูล" />
          ) : (
            <div className="space-y-1.5">
              {data.peakHours.map((h) => {
                const pct = Math.max((h.count / maxPeakHour) * 100, h.count > 0 ? 6 : 0);
                const isTop = h.count === maxPeakHour && h.count > 0;
                return (
                  <div key={h.hour} className="flex items-center gap-2.5 group">
                    <span className="text-xs font-mono font-bold text-gray-600 w-12 shrink-0 text-right">
                      {String(h.hour).padStart(2, '0')}:00
                    </span>
                    <div className="flex-1 h-5 rounded-lg bg-rose-50/60 border border-rose-100/60 overflow-hidden relative">
                      <div
                        className={`h-full rounded-lg transition-all duration-500 ${
                          isTop
                            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-xs'
                            : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono font-bold w-10 text-right ${isTop ? 'text-amber-700' : 'text-[var(--ink)]'}`}>
                      {h.count}
                    </span>
                    {isTop && (
                      <span className="text-[9px] font-black text-amber-800 bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                        Peak
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Source Attribution */}
        <div className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
          <SectionHeader
            icon={<Globe className="h-4 w-4 text-blue-600" />}
            title="ช่องทางการลงทะเบียน"
            subtitle="Online / Walk-in / Admin"
          />
          {data.sourceBreakdown.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูล" />
          ) : (
            <div className="space-y-3">
              {data.sourceBreakdown.map((s) => {
                const pct = data.totalActive > 0 ? Math.round((s.count / data.totalActive) * 100) : 0;
                return (
                  <div key={s.source} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ink)]">
                        {SOURCE_LABELS[s.source] || s.source}
                      </span>
                      <span className="font-mono text-xs font-black text-[var(--burgundy-700)]">
                        {s.count} คน ({pct}%)
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-blue-50/60 border border-blue-100/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${Math.max(pct, s.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Experience × Type Cross-tab */}
          <div className="pt-4 border-t border-rose-100/80 space-y-3">
            <div className="flex items-center gap-1.5">
              <Repeat className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs font-bold text-[var(--ink)]">ประสบการณ์ × ประเภทผู้สมัคร</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-rose-200/80 shadow-2xs">
              <table className="w-full text-xs">
                <thead className="bg-gradient-to-r from-rose-50 via-red-50/70 to-rose-50 text-[var(--burgundy-800)] font-bold text-xs uppercase tracking-wider border-b border-rose-200/70">
                  <tr>
                    <th className="p-2.5 text-left">ประสบการณ์</th>
                    {Object.keys(PARTICIPANT_LABELS).map(k => (
                      <th key={k} className="p-2.5 text-center">
                        {PARTICIPANT_LABELS[k]}
                      </th>
                    ))}
                    <th className="p-2.5 text-center font-black">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100/80 bg-white">
                  {Object.entries(data.crossTab).map(([exp, types]) => {
                    const rowTotal = Object.values(types).reduce((a, b) => a + b, 0);
                    return (
                      <tr key={exp} className="hover:bg-rose-50/40 transition-colors">
                        <td className="p-2.5 font-bold text-[var(--ink)]">
                          {exp === 'FIRST_TIME' ? '🆕 บริจาคครั้งแรก' : '🔄 เคยบริจาคแล้ว'}
                        </td>
                        {Object.keys(PARTICIPANT_LABELS).map(k => (
                          <td key={k} className="p-2.5 text-center font-mono font-bold">
                            {types[k] || 0}
                          </td>
                        ))}
                        <td className="p-2.5 text-center font-mono font-black text-[var(--burgundy-700)]">
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Faculty + Academic Year ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Faculty */}
        <div className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
          <SectionHeader
            icon={<Building2 className="h-4 w-4 text-[var(--burgundy-700)]" />}
            title="แยกตามคณะ / หน่วยงาน"
            subtitle={`${data.facultyBreakdown.length} คณะ/หน่วยงาน`}
          />
          {data.facultyBreakdown.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูล" />
          ) : (
            <div className="space-y-2.5">
              {data.facultyBreakdown.map((f, i) => {
                const pct = Math.max((f.count / maxFaculty) * 100, f.count > 0 ? 6 : 0);
                return (
                  <div key={f.faculty} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded ${
                          i === 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : i === 1
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : i === 2
                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                : 'bg-rose-50/80 text-gray-500 border border-rose-100'
                        } shrink-0`}>
                          #{i + 1}
                        </span>
                        <span className="font-bold text-[var(--ink)] truncate" title={f.faculty}>
                          {f.faculty}
                        </span>
                      </div>
                      <span className="font-mono font-black text-[var(--burgundy-700)] shrink-0 ml-2">
                        {f.count} คน
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-rose-50/70 border border-rose-100/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Academic Year */}
        <div className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
          <SectionHeader
            icon={<GraduationCap className="h-4 w-4 text-emerald-600" />}
            title="แยกตามชั้นปี"
            subtitle="ชั้นปีของผู้สมัคร"
          />
          {data.academicYearBreakdown.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูล" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {data.academicYearBreakdown.map((y) => {
                const pct = data.totalActive > 0 ? Math.round((y.count / data.totalActive) * 100) : 0;
                return (
                  <div
                    key={y.year}
                    className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 border border-emerald-200/70 space-y-2 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 truncate" title={y.year}>
                        {y.year === 'ไม่ได้ระบุ' ? y.year : `ปี ${y.year}`}
                      </span>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">{pct}%</span>
                    </div>
                    <div className="font-mono text-xl font-black text-emerald-900">
                      {y.count}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-emerald-100/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${Math.max(pct, y.count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Hourly Heatmap ── */}
      <section className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
        <SectionHeader
          icon={<Clock className="h-4 w-4 text-purple-600" />}
          title="Heatmap การสมัครตามวัน × ชั่วโมง"
          subtitle="สีเข้ม = จำนวนมาก"
        />
        {Object.keys(data.hourlyHeatmap).length === 0 ? (
          <EmptyState text="ยังไม่มีข้อมูล" />
        ) : (
          <HeatmapGrid heatmap={data.hourlyHeatmap} />
        )}
      </section>

      {/* ── Slot Utilization ── */}
      {data.slotUtilization.length > 0 && (
        <section className="bg-white/95 rounded-2xl border border-rose-100/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] space-y-4 backdrop-blur-xs">
          <SectionHeader
            icon={<BarChart3 className="h-4 w-4 text-blue-600" />}
            title="อัตราการใช้งาน Time Slot"
            subtitle="จำนวนจอง vs ความจุ"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {data.slotUtilization.map((s) => {
              const isOverCapacity = s.utilPercent > 100;
              return (
                <div
                  key={s.slotId}
                  className={`p-3.5 rounded-xl border space-y-2 shadow-2xs hover:shadow-xs transition-all ${
                    isOverCapacity
                      ? 'bg-gradient-to-br from-red-50 via-white to-rose-50/40 border-red-300 text-red-950'
                      : s.utilPercent >= 80
                        ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50/40 border-amber-300 text-amber-950'
                        : 'bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 border-emerald-200/70 text-emerald-950'
                  }`}
                >
                  <span className="font-mono text-xs font-bold block">
                    {s.timeLabel} น.
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-lg font-black text-[var(--burgundy-700)]">
                      {s.booked}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">/ {s.capacity}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverCapacity
                          ? 'bg-gradient-to-r from-red-600 to-rose-500'
                          : s.utilPercent >= 80
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.min(s.utilPercent, 100)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${
                    isOverCapacity ? 'text-red-700' : s.utilPercent >= 80 ? 'text-amber-800' : 'text-emerald-700'
                  }`}>
                    {s.utilPercent}% capacity
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}


// ── Sub-components ──

function SummaryCard({
  title,
  value,
  unit,
  detail,
  icon: Icon,
  bgGradient,
  border,
  iconBg,
  textColor,
  titleColor,
  detailColor,
  topLine,
  glow,
}: {
  title: string;
  value: string;
  unit: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  bgGradient: string;
  border: string;
  iconBg: string;
  textColor: string;
  titleColor: string;
  detailColor: string;
  topLine: string;
  glow: string;
}) {
  return (
    <div
      className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border ${border} ${bgGradient} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${topLine}`} />
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full ${glow} blur-xl pointer-events-none`} />

      <div className="flex items-center justify-between gap-1 relative z-10 mb-2">
        <span className={`text-[11px] sm:text-xs font-bold ${titleColor} truncate`}>{title}</span>
        <div className={`p-2 rounded-xl ${iconBg} shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${textColor}`}>{value}</span>
          <span className={`text-xs font-bold ${textColor} opacity-80`}>{unit}</span>
        </div>
        <p className={`text-[11px] font-semibold pt-1 ${detailColor}`}>{detail}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-rose-100/80 pb-3.5">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2 font-display">
          {icon}
          <span>{title}</span>
        </h3>
        <p className="text-[11px] text-[var(--muted)] font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-8 text-center text-gray-400 font-medium text-xs">
      {text}
    </div>
  );
}

function HeatmapGrid({ heatmap }: { heatmap: Record<string, Record<number, number>> }) {
  // Collect all hours across all days
  const allHours = new Set<number>();
  Object.values(heatmap).forEach(hours => {
    Object.keys(hours).forEach(h => allHours.add(parseInt(h)));
  });
  const sortedHours = [...allHours].sort((a, b) => a - b);
  const days = Object.keys(heatmap);

  // Find max value for color scaling
  let maxVal = 0;
  Object.values(heatmap).forEach(hours => {
    Object.values(hours).forEach(v => {
      if (v > maxVal) maxVal = v;
    });
  });

  const getOpacity = (val: number) => {
    if (maxVal === 0 || val === 0) return 0;
    return Math.max(0.18, val / maxVal);
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1.5 min-w-fit" style={{ gridTemplateColumns: `84px repeat(${sortedHours.length}, minmax(34px, 1fr))` }}>
        {/* Header row */}
        <div className="text-[10px] font-bold text-gray-400 p-1" />
        {sortedHours.map(h => (
          <div key={h} className="text-[10px] font-mono font-bold text-gray-500 text-center p-1">
            {String(h).padStart(2, '0')}:00
          </div>
        ))}

        {/* Data rows */}
        {days.map(day => (
          <React.Fragment key={day}>
            <div className="text-[11px] font-bold text-[var(--ink)] p-1 flex items-center">
              {day}
            </div>
            {sortedHours.map(h => {
              const val = heatmap[day]?.[h] || 0;
              return (
                <div
                  key={h}
                  className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all group relative border ${
                    val > 0 ? 'border-rose-200/80 shadow-2xs' : 'border-slate-100 bg-slate-50/70'
                  }`}
                  style={{
                    backgroundColor: val > 0
                      ? `rgba(184, 18, 48, ${getOpacity(val)})`
                      : undefined,
                    color: getOpacity(val) > 0.45 ? '#ffffff' : val > 0 ? '#6e101e' : '#94a3b8',
                  }}
                  title={`${day} ${String(h).padStart(2, '0')}:00 — ${val} คน`}
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

