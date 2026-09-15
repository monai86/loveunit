'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Loader2, RefreshCw, Search, Users, UserCheck } from 'lucide-react';
import { getRegistrationStatusBadge, pickField, formatBangkokTime, isRegistrationEligibleForSouvenir } from '@/lib/utils/format';
import { summarizeStaffRegistrations } from '@/lib/staff/registration-summary';
import type { RegistrationStatus } from '@/lib/types/database';

type RegistrationRow = {
  id: string;
  registrationCode: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: RegistrationStatus;
  timeSlotText: string;
  souvenirEligible?: boolean;
};

type RawRegistration = Record<string, unknown>;

function normalizeRegistration(row: RawRegistration, allRows: RawRegistration[]): RegistrationRow {
  const code = String(pickField(row, 'registrationCode', 'registration_code') ?? '-');
  const source = String(pickField(row, 'source', 'source') ?? '');
  const isWalkIn = code.includes('LVU26-W') || source === 'WALK_IN';

  let timeSlotText = 'ไม่ระบุรอบเวลา';
  if (isWalkIn) {
    const regTime = (pickField<string>(row, 'registeredAt', 'registered_at') ?? pickField<string>(row, 'createdAt', 'created_at') ?? null);
    timeSlotText = regTime ? `Walk-in (${formatBangkokTime(regTime)})` : 'Walk-in';
  } else {
    const slot = (pickField<Record<string, unknown> | null>(row, 'timeSlot', 'time_slot') ?? null);
    const startAt = slot ? pickField<string>(slot, 'startAt', 'start_at') : undefined;
    const endAt = slot ? pickField<string>(slot, 'endAt', 'end_at') : undefined;
    timeSlotText = startAt && endAt
      ? new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }).format(new Date(startAt)) + '–' + new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }).format(new Date(endAt)) + ' น.'
      : '09:00 – 14:00 น.';
  }

  // Calculate souvenir eligibility
  const candidate = {
    id: String(pickField(row, 'id', 'id') ?? ''),
    registrationCode: code,
    source,
    status: String(pickField(row, 'status', 'status') ?? 'REGISTERED'),
    checkedInAt: pickField<string>(row, 'checkedInAt', 'checked_in_at'),
    completedAt: pickField<string>(row, 'completedAt', 'completed_at'),
    slotEndAt: (pickField<Record<string, unknown> | null>(row, 'timeSlot', 'time_slot'))?.endAt as string | undefined,
  };

  const allCandidates = allRows.map((r) => ({
    id: String(pickField(r, 'id', 'id') ?? ''),
    registrationCode: String(pickField(r, 'registrationCode', 'registration_code') ?? ''),
    source: String(pickField(r, 'source', 'source') ?? ''),
    status: String(pickField(r, 'status', 'status') ?? 'REGISTERED'),
    checkedInAt: pickField<string>(r, 'checkedInAt', 'checked_in_at'),
    completedAt: pickField<string>(r, 'completedAt', 'completed_at'),
    slotEndAt: (pickField<Record<string, unknown> | null>(r, 'timeSlot', 'time_slot'))?.endAt as string | undefined,
  }));

  const souvenirEligible = isRegistrationEligibleForSouvenir(candidate, allCandidates, 100, 100);

  return {
    id: candidate.id,
    registrationCode: code,
    firstName: String(pickField(row, 'firstName', 'first_name') ?? ''),
    lastName: String(pickField(row, 'lastName', 'last_name') ?? ''),
    phone: String(pickField(row, 'phone', 'phone') ?? ''),
    status: (pickField<RegistrationStatus>(row, 'status', 'status') ?? 'REGISTERED'),
    timeSlotText,
    souvenirEligible,
  };
}

const filters: Array<{ label: string; value: 'ALL' | RegistrationStatus }> = [
  { label: 'ทั้งหมด', value: 'ALL' },
  { label: 'รอเช็กอิน', value: 'REGISTERED' },
  { label: 'เช็กอินแล้ว', value: 'CHECKED_IN' },
  { label: 'สำเร็จ', value: 'COMPLETED' },
];

export default function StaffOverviewPage() {
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | RegistrationStatus>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const response = await fetch('/api/staff/registrations', { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'ไม่สามารถโหลดข้อมูลได้');
      const rawList = data.registrations as RawRegistration[];
      setRegistrations(rawList.map((r) => normalizeRegistration(r, rawList)));
      setLastUpdated(new Date());
    } catch (loadError) {
      if (!isBackground) {
        setError(loadError instanceof Error ? loadError.message : 'ไม่สามารถโหลดข้อมูลได้');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      try {
        const response = await fetch('/api/staff/registrations', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();
        if (mounted) {
          if (!response.ok || !data.success) throw new Error(data.message || 'ไม่สามารถโหลดข้อมูลได้');
          const rawList = data.registrations as RawRegistration[];
          setRegistrations(rawList.map((r) => normalizeRegistration(r, rawList)));
          setLastUpdated(new Date());
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'ไม่สามารถโหลดข้อมูลได้');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchInitial();

    // Auto-polling interval: 5 seconds when tab is active/visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void load(true);
      }
    }, 5000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void load(true);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [load]);

  const summary = useMemo(() => summarizeStaffRegistrations(registrations), [registrations]);
  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const queryDigits = query.replace(/\D/g, '');
    return registrations.filter((registration) => {
      const matchesFilter = filter === 'ALL' || registration.status === filter || (filter === 'CHECKED_IN' && registration.status === 'IN_PROCESS');
      const searchTarget = `${registration.registrationCode} ${registration.firstName} ${registration.lastName} ${registration.phone || ''}`.toLowerCase();
      const phoneDigits = (registration.phone || '').replace(/\D/g, '');
      const matchesQuery = !normalizedQuery || 
        searchTarget.includes(normalizedQuery) ||
        (queryDigits.length >= 3 && phoneDigits.includes(queryDigits));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, registrations]);

  const cards = [
    { 
      label: 'ลงทะเบียนทั้งหมด', 
      value: summary.total, 
      icon: Users, 
      bgGradient: 'bg-gradient-to-br from-rose-500/[0.09] via-white to-red-500/[0.04]',
      border: 'border-rose-200/80 hover:border-rose-300',
      iconBg: 'bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md shadow-rose-600/25',
      textColor: 'text-rose-950',
      labelColor: 'text-rose-900',
      topLine: 'bg-gradient-to-r from-rose-500 to-red-600',
      glow: 'bg-rose-500/10',
    },
    { 
      label: 'รอเช็กอิน', 
      value: summary.waiting, 
      icon: ClipboardList, 
      bgGradient: 'bg-gradient-to-br from-amber-500/[0.09] via-white to-orange-500/[0.04]',
      border: 'border-amber-200/80 hover:border-amber-300',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-600/25',
      textColor: 'text-amber-950',
      labelColor: 'text-amber-900',
      topLine: 'bg-gradient-to-r from-amber-500 to-orange-600',
      glow: 'bg-amber-500/10',
    },
    { 
      label: 'เช็กอินแล้ว', 
      value: summary.checkedIn, 
      icon: UserCheck, 
      bgGradient: 'bg-gradient-to-br from-blue-500/[0.09] via-white to-indigo-500/[0.04]',
      border: 'border-blue-200/80 hover:border-blue-300',
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/25',
      textColor: 'text-blue-950',
      labelColor: 'text-blue-900',
      topLine: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      glow: 'bg-blue-500/10',
    },
    { 
      label: 'บริจาคสำเร็จ', 
      value: summary.completed, 
      icon: CheckCircle2, 
      bgGradient: 'bg-gradient-to-br from-emerald-500/[0.09] via-white to-teal-500/[0.04]',
      border: 'border-emerald-200/80 hover:border-emerald-300',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25',
      textColor: 'text-emerald-950',
      labelColor: 'text-emerald-900',
      topLine: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      glow: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#FFFDFD] via-[#FAF4F5] to-[#F5ECEE] relative selection:bg-rose-100 selection:text-rose-900">
      {/* Ambient background glow accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-40 right-[-10%] h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-6 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:py-8 lg:pb-8">
        <header className="flex flex-col gap-4 border-b border-rose-100/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-xs font-black text-[var(--burgundy-700)] bg-rose-50/80 border border-rose-200/70 px-3 py-1 rounded-full w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>MUMT LoveUnit · หน้างาน (Live Real-time)</span>
            </p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight">
              ภาพรวมผู้ลงทะเบียน
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] font-medium">
              ดูรายชื่อ สถานะเช็กอิน และสถิติหน้างานแบบเรียลไทม์ {lastUpdated && <span className="text-xs text-[var(--muted)] font-mono">· อัปเดตล่าสุด {lastUpdated.toLocaleTimeString('th-TH')} น.</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-300/80 px-4 py-2 text-right shadow-2xs">
              <span className="block text-xl font-black font-mono leading-none text-emerald-950">{summary.attendanceRatePercent}%</span>
              <span className="text-[11px] font-extrabold text-emerald-800">อัตรามาถึงงาน</span>
            </div>
            <button 
              type="button" 
              onClick={() => void load(false)} 
              disabled={loading || refreshing} 
              className="inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50/60 border border-rose-200/80 text-xs font-bold text-[var(--ink)] shadow-xs transition-all hover:shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 text-[var(--burgundy-700)] ${loading || refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'กำลังซิงค์...' : 'รีเฟรช'}</span>
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="สถิติผู้ลงทะเบียน">
          {cards.map(({ label, value, icon: Icon, bgGradient, border, iconBg, textColor, labelColor, topLine, glow }) => (
            <article 
              key={label} 
              className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border ${border} ${bgGradient} shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-0.5`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 inset-x-0 h-1 ${topLine}`} />
              {/* Corner Ambient Glow */}
              <div className={`pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full ${glow} blur-xl`} />

              <div className="flex items-center justify-between gap-1">
                <span className={`text-[11px] sm:text-xs font-extrabold truncate ${labelColor}`}>{label}</span>
                <div className={`p-2 rounded-xl ${iconBg} shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className={`text-2xl sm:text-4xl font-black font-mono tracking-tight ${textColor}`}>{value}</p>
                <p className={`mt-1 text-[11px] font-bold ${labelColor} opacity-90`}>{label}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-rose-100/90 bg-white/95 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.05)] backdrop-blur-xs" aria-labelledby="staff-registration-list">
          <div className="flex flex-col gap-3.5 border-b border-rose-100/80 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 id="staff-registration-list" className="text-base sm:text-lg font-black text-[var(--ink)] font-display">
                รายชื่อผู้ลงทะเบียน
              </h2>
              <p className="mt-0.5 text-xs text-[var(--muted)] font-medium">
                แสดง {visibleRows.length} จาก {registrations.length} รายการ
              </p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-700/60" />
              <input
                aria-label="ค้นหารหัสหรือชื่อผู้บริจาค"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 pl-11 pr-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-400 transition-all shadow-2xs"
                placeholder="ค้นหารหัส หรือชื่อผู้บริจาค"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto border-b border-rose-100/80 px-4 py-3 sm:px-5 bg-rose-50/20">
            {filters.map((item) => (
              <button 
                key={item.value} 
                type="button" 
                onClick={() => setFilter(item.value)} 
                aria-pressed={filter === item.value} 
                className={`min-h-10 shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filter === item.value 
                    ? 'bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-800)] text-white shadow-md shadow-rose-950/15 font-black scale-[1.02]' 
                    : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-rose-50 hover:text-[var(--burgundy-700)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-sm font-bold text-[var(--muted)]">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--burgundy-700)]" />
              กำลังโหลดรายชื่อ…
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm font-bold text-red-700">{error}</div>
          ) : visibleRows.length === 0 ? (
            <div className="p-10 text-center text-sm font-bold text-[var(--muted)]">ไม่พบรายชื่อที่ตรงกับเงื่อนไข</div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-gradient-to-r from-rose-50 via-red-50/60 to-rose-50 text-xs font-bold uppercase tracking-wider text-[var(--burgundy-800)] border-b border-rose-200/70">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">รหัส</th>
                      <th className="px-5 py-3.5 font-bold">ชื่อ-นามสกุล</th>
                      <th className="px-5 py-3.5 font-bold">รอบเวลา</th>
                      <th className="px-5 py-3.5 font-bold">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/70 bg-white font-medium text-[var(--ink)]">
                    {visibleRows.map((row) => { 
                      const badge = getRegistrationStatusBadge(row.status); 
                      return (
                        <tr key={row.id} className="hover:bg-rose-50/40 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-mono font-black text-xs text-[var(--burgundy-700)] bg-rose-50/90 border border-rose-200/60 px-2.5 py-1 rounded-md inline-block">
                              {row.registrationCode}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-[var(--ink)] whitespace-nowrap">
                            {row.firstName} {row.lastName}
                          </td>
                          <td className="px-5 py-4 text-sm font-mono text-gray-600 whitespace-nowrap">
                            {row.timeSlotText}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${badge.colorClass}`}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      ); 
                    })}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-rose-100/70 md:hidden bg-white">
                {visibleRows.map((row) => { 
                  const badge = getRegistrationStatusBadge(row.status); 
                  return (
                    <article key={row.id} className="flex items-center justify-between gap-3 p-4 hover:bg-rose-50/20 transition-colors">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-black text-[var(--burgundy-700)] bg-rose-50/90 border border-rose-200/60 px-2 py-0.5 rounded">
                          {row.registrationCode}
                        </span>
                        <h3 className="mt-1.5 truncate text-sm font-black text-[var(--ink)]">{row.firstName} {row.lastName}</h3>
                        <p className="mt-0.5 text-xs text-[var(--muted)] font-mono">{row.timeSlotText}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${badge.colorClass}`}>
                        {badge.label}
                      </span>
                    </article>
                  ); 
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
