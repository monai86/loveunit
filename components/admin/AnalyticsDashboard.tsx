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

const STATUS_LABELS: Record<string, string> = {
  registered: 'ลงทะเบียนแล้ว',
  checkedIn: 'เช็คอินแล้ว',
  inProcess: 'กำลังบริจาค',
  completed: 'บริจาคสำเร็จ',
  cancelled: 'ยกเลิก',
  noShow: 'ไม่ได้มา',
};

const STATUS_COLORS: Record<string, string> = {
  registered: 'bg-blue-500',
  checkedIn: 'bg-amber-500',
  inProcess: 'bg-purple-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-gray-400',
  noShow: 'bg-red-400',
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
      setLastUpdated(
        new Intl.DateTimeFormat('th-TH', {
          timeZone: 'Asia/Bangkok',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()) + ' น.'
      );
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void refreshData(false);
      }
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void refreshData(false);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/mt70"
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--burgundy-700)] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>แดชบอร์ด</span>
            </Link>
            <span className="text-gray-300">›</span>
            <span className="text-xs font-bold text-[var(--ink)]">สถิติเจาะลึก</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-[var(--burgundy-700)]" />
            สถิติเจาะลึก (Deep Analytics)
          </h1>
          <p className="text-xs text-[var(--muted)] font-medium">
            วิเคราะห์ข้อมูลผู้ลงทะเบียนเชิงลึก · อัปเดตล่าสุด {lastUpdated}
          </p>
        </div>

        <button
          onClick={() => refreshData(true)}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[var(--line)] hover:bg-gray-50 text-xs font-bold text-[var(--ink)] shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-4 w-4 text-[var(--burgundy-700)] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'กำลังอัปเดต...' : 'รีเฟรชข้อมูล'}</span>
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          title="ยอดสมัครรวม"
          value={data.totalActive.toLocaleString('th-TH')}
          unit="คน"
          detail={`จากทั้งหมด ${data.totalAll} รายการ`}
          icon={Users}
          color="bg-blue-50 text-blue-900 border-blue-200"
        />
        <SummaryCard
          title="เฉลี่ยต่อวัน"
          value={data.summary.avgPerDay.toLocaleString('th-TH')}
          unit="คน/วัน"
          detail={`จากข้อมูล ${data.summary.totalDays} วัน`}
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-900 border-emerald-200"
        />
        <SummaryCard
          title="วันยอดสมัครสูงสุด"
          value={data.summary.peakDay.count.toLocaleString('th-TH')}
          unit="คน"
          detail={formatThaiDate(data.summary.peakDay.date)}
          icon={Zap}
          color="bg-amber-50 text-amber-900 border-amber-200"
        />
        <SummaryCard
          title="จำนวนวันเปิดรับ"
          value={data.summary.totalDays.toLocaleString('th-TH')}
          unit="วัน"
          detail="นับจากวันแรกที่มีคนสมัคร"
          icon={CalendarDays}
          color="bg-purple-50 text-purple-900 border-purple-200"
        />
      </section>

      {/* ── Status Funnel ── */}
      <section className="editorial-card p-5 sm:p-6 space-y-4">
        <SectionHeader
          icon={<TrendingUp className="h-4 w-4 text-[var(--burgundy-700)]" />}
          title="Conversion Funnel"
          subtitle="สถานะผู้ลงทะเบียนทั้งหมดในระบบ"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.entries(data.summary.statusBreakdown).map(([key, count]) => (
            <div
              key={key}
              className="p-3 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-1.5"
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[key] || 'bg-gray-400'}`} />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide truncate">
                  {STATUS_LABELS[key] || key}
                </span>
              </div>
              <div className="font-mono text-lg font-black text-[var(--ink)]">
                {count.toLocaleString('th-TH')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Daily Growth Chart ── */}
      <section className="editorial-card p-5 sm:p-6 space-y-4">
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
            <div className="flex items-end gap-1.5 sm:gap-2 h-40 sm:h-52 px-1">
              {data.dailyGrowth.map((d) => {
                const barHeight = Math.max((d.count / maxDaily) * 100, d.count > 0 ? 8 : 2);
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center justify-end gap-1 group relative min-w-0"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--ink)] text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-opacity shadow-lg">
                      {formatThaiDate(d.date)} — {d.count} คน (สะสม {d.cumulative})
                    </div>
                    <span className="text-[9px] font-mono font-bold text-[var(--ink)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[var(--burgundy-700)] to-[var(--burgundy-500)] transition-all duration-500 group-hover:from-[var(--burgundy-600)] group-hover:to-[var(--burgundy-400)] shadow-sm"
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
            <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] font-medium pt-2 border-t border-[var(--line)]">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span>ยอดสะสมรายวัน:</span>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {data.dailyGrowth.map((d, i) => (
                  <span key={d.date} className="font-mono text-[10px] shrink-0">
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
        <div className="editorial-card p-5 sm:p-6 space-y-4">
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
                    <div className="flex-1 h-5 rounded-lg bg-gray-100 overflow-hidden relative">
                      <div
                        className={`h-full rounded-lg transition-all duration-500 ${
                          isTop
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                            : 'bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-500)]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono font-bold w-10 text-right ${isTop ? 'text-amber-700' : 'text-[var(--ink)]'}`}>
                      {h.count}
                    </span>
                    {isTop && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
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
        <div className="editorial-card p-5 sm:p-6 space-y-4">
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
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                        style={{ width: `${Math.max(pct, s.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Experience × Type Cross-tab */}
          <div className="pt-4 border-t border-[var(--line)] space-y-3">
            <div className="flex items-center gap-1.5">
              <Repeat className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs font-bold text-[var(--ink)]">ประสบการณ์ × ประเภทผู้สมัคร</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-[var(--line)] rounded-xl overflow-hidden">
                <thead className="bg-[var(--rose-100)] text-[var(--burgundy-700)] font-bold">
                  <tr>
                    <th className="p-2 text-left border-b border-[var(--line)]">ประสบการณ์</th>
                    {Object.keys(PARTICIPANT_LABELS).map(k => (
                      <th key={k} className="p-2 text-center border-b border-[var(--line)]">
                        {PARTICIPANT_LABELS[k]}
                      </th>
                    ))}
                    <th className="p-2 text-center border-b border-[var(--line)] font-black">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {Object.entries(data.crossTab).map(([exp, types]) => {
                    const rowTotal = Object.values(types).reduce((a, b) => a + b, 0);
                    return (
                      <tr key={exp} className="hover:bg-gray-50 transition-colors">
                        <td className="p-2 font-bold text-[var(--ink)]">
                          {exp === 'FIRST_TIME' ? '🆕 บริจาคครั้งแรก' : '🔄 เคยบริจาคแล้ว'}
                        </td>
                        {Object.keys(PARTICIPANT_LABELS).map(k => (
                          <td key={k} className="p-2 text-center font-mono font-bold">
                            {types[k] || 0}
                          </td>
                        ))}
                        <td className="p-2 text-center font-mono font-black text-[var(--burgundy-700)]">
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
        <div className="editorial-card p-5 sm:p-6 space-y-4">
          <SectionHeader
            icon={<Building2 className="h-4 w-4 text-[var(--burgundy-700)]" />}
            title="แยกตามคณะ / หน่วยงาน"
            subtitle={`${data.facultyBreakdown.length} คณะ/หน่วยงาน`}
          />
          {data.facultyBreakdown.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูล" />
          ) : (
            <div className="space-y-2">
              {data.facultyBreakdown.map((f, i) => {
                const pct = Math.max((f.count / maxFaculty) * 100, f.count > 0 ? 6 : 0);
                return (
                  <div key={f.faculty} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-gray-400 w-5 shrink-0">
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
                    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-500)] transition-all duration-500"
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
        <div className="editorial-card p-5 sm:p-6 space-y-4">
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
                    className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-2 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ink)] truncate" title={y.year}>
                        {y.year === 'ไม่ได้ระบุ' ? y.year : `ปี ${y.year}`}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--muted)]">{pct}%</span>
                    </div>
                    <div className="font-mono text-xl font-black text-[var(--burgundy-700)]">
                      {y.count}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
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
      <section className="editorial-card p-5 sm:p-6 space-y-4">
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
        <section className="editorial-card p-5 sm:p-6 space-y-4">
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
                  className={`p-3.5 rounded-xl border space-y-2 shadow-2xs ${
                    isOverCapacity
                      ? 'bg-red-50/80 border-red-200'
                      : s.utilPercent >= 80
                        ? 'bg-amber-50/80 border-amber-200'
                        : 'bg-gray-50/80 border-gray-200/80'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-[var(--ink)] block">
                    {s.timeLabel} น.
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-lg font-black text-[var(--burgundy-700)]">
                      {s.booked}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">/ {s.capacity}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverCapacity
                          ? 'bg-red-500'
                          : s.utilPercent >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(s.utilPercent, 100)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${
                    isOverCapacity ? 'text-red-700' : 'text-gray-500'
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
  title, value, unit, detail, icon: Icon, color,
}: {
  title: string;
  value: string;
  unit: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className={`p-3.5 sm:p-5 rounded-2xl border ${color} shadow-2xs space-y-2 flex flex-col justify-between transition-all`}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] sm:text-xs font-bold opacity-90 truncate">{title}</span>
        <div className="p-1 sm:p-1.5 rounded-lg bg-white/80 shadow-2xs shrink-0">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-3xl font-black font-mono tracking-tight">{value}</span>
          <span className="text-[10px] sm:text-xs font-bold">{unit}</span>
        </div>
        <p className="text-[10px] sm:text-[11px] font-medium pt-1 opacity-80">{detail}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon, title, subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-[var(--ink)] flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h3>
        <p className="text-[11px] text-[var(--muted)]">{subtitle}</p>
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
    return Math.max(0.15, val / maxVal);
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1 min-w-fit" style={{ gridTemplateColumns: `80px repeat(${sortedHours.length}, minmax(32px, 1fr))` }}>
        {/* Header row */}
        <div className="text-[10px] font-bold text-gray-400 p-1" />
        {sortedHours.map(h => (
          <div key={h} className="text-[10px] font-mono font-bold text-gray-500 text-center p-1">
            {String(h).padStart(2, '0')}
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
                  className="h-8 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition-all group relative"
                  style={{
                    backgroundColor: val > 0
                      ? `rgba(110, 16, 30, ${getOpacity(val)})`
                      : '#f3f4f6',
                    color: getOpacity(val) > 0.5 ? '#fff' : '#374151',
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
