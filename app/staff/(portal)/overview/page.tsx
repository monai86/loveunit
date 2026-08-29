'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, CheckCircle2, ClipboardList, Loader2, RefreshCw, Search, Users, UserCheck } from 'lucide-react';
import { getRegistrationStatusBadge, pickField } from '@/lib/utils/format';
import { summarizeStaffRegistrations } from '@/lib/staff/registration-summary';
import type { RegistrationStatus } from '@/lib/types/database';

type RegistrationRow = {
  id: string;
  registrationCode: string;
  firstName: string;
  lastName: string;
  status: RegistrationStatus;
  timeSlotText: string;
};

type RawRegistration = Record<string, unknown>;

function normalizeRegistration(row: RawRegistration): RegistrationRow {
  const slot = (pickField<Record<string, unknown> | null>(row, 'timeSlot', 'time_slot') ?? null);
  const startAt = slot ? pickField<string>(slot, 'startAt', 'start_at') : undefined;
  const endAt = slot ? pickField<string>(slot, 'endAt', 'end_at') : undefined;
  const timeSlotText = startAt && endAt
    ? new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }).format(new Date(startAt)) + '–' + new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }).format(new Date(endAt)) + ' น.'
    : 'ไม่ระบุรอบเวลา';

  return {
    id: String(pickField(row, 'id', 'id') ?? ''),
    registrationCode: String(pickField(row, 'registrationCode', 'registration_code') ?? '-'),
    firstName: String(pickField(row, 'firstName', 'first_name') ?? ''),
    lastName: String(pickField(row, 'lastName', 'last_name') ?? ''),
    status: (pickField<RegistrationStatus>(row, 'status', 'status') ?? 'REGISTERED'),
    timeSlotText,
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
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/staff/registrations', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'ไม่สามารถโหลดข้อมูลได้');
      setRegistrations((data.registrations as RawRegistration[]).map(normalizeRegistration));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const summary = useMemo(() => summarizeStaffRegistrations(registrations), [registrations]);
  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return registrations.filter((registration) => {
      const matchesFilter = filter === 'ALL' || registration.status === filter || (filter === 'CHECKED_IN' && registration.status === 'IN_PROCESS');
      const matchesQuery = !normalizedQuery || `${registration.registrationCode} ${registration.firstName} ${registration.lastName}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, registrations]);

  const cards = [
    { label: 'ลงทะเบียนทั้งหมด', value: summary.total, icon: Users, tone: 'text-[var(--burgundy-700)] bg-[var(--rose-100)]' },
    { label: 'รอเช็กอิน', value: summary.waiting, icon: ClipboardList, tone: 'text-amber-800 bg-amber-50' },
    { label: 'เช็กอินแล้ว', value: summary.checkedIn, icon: UserCheck, tone: 'text-blue-800 bg-blue-50' },
    { label: 'บริจาคสำเร็จ', value: summary.completed, icon: CheckCircle2, tone: 'text-emerald-800 bg-emerald-50' },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:py-7 lg:pb-7">
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-[var(--burgundy-700)]"><span className="h-2 w-2 rounded-full bg-emerald-500" />MUMT LoveUnit · หน้างาน</p>
          <h1 className="mt-1 font-display text-2xl font-black text-[var(--ink)]">ภาพรวมผู้ลงทะเบียน</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">ดูรายชื่อ สถานะเช็กอิน และสถิติหน้างานแบบอ่านอย่างเดียว</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right text-xs font-bold text-emerald-800"><span className="block text-lg leading-none">{summary.attendanceRatePercent}%</span>อัตรามาถึงงาน</div>
          <button type="button" onClick={() => void load()} disabled={loading} className="editorial-btn-secondary inline-flex min-h-11 items-center gap-2 text-xs disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />รีเฟรช</button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="สถิติผู้ลงทะเบียน">
        {cards.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-2xs"><div className={`mb-3 inline-flex rounded-xl p-2 ${tone}`}><Icon className="h-4 w-4" /></div><p className="text-2xl font-black text-[var(--ink)]">{value}</p><p className="mt-1 text-xs font-bold text-[var(--muted)]">{label}</p></article>)}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-2xs" aria-labelledby="staff-registration-list">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 id="staff-registration-list" className="text-base font-black text-[var(--ink)]">รายชื่อผู้ลงทะเบียน</h2><p className="mt-0.5 text-xs text-[var(--muted)]">แสดง {visibleRows.length} จาก {registrations.length} รายการ</p></div>
          <div className="relative w-full lg:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" /><input aria-label="ค้นหารหัสหรือชื่อผู้บริจาค" value={query} onChange={(event) => setQuery(event.target.value)} className="editorial-input pl-10 text-sm" placeholder="ค้นหารหัส หรือชื่อผู้บริจาค" /></div>
        </div>
        <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] px-4 py-3 sm:px-5">
          {filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={`min-h-11 shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${filter === item.value ? 'bg-[var(--burgundy-700)] text-white' : 'bg-[var(--bg)] text-[var(--muted)] hover:bg-[var(--rose-100)]'}`}>{item.label}</button>)}
        </div>
        {loading ? <div className="flex min-h-56 items-center justify-center gap-2 text-sm font-bold text-[var(--muted)]"><Loader2 className="h-5 w-5 animate-spin" />กำลังโหลดรายชื่อ…</div> : error ? <div className="p-8 text-center text-sm font-bold text-red-700">{error}</div> : visibleRows.length === 0 ? <div className="p-10 text-center text-sm font-bold text-[var(--muted)]">ไม่พบรายชื่อที่ตรงกับเงื่อนไข</div> : <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead className="bg-[var(--bg)] text-xs text-[var(--muted)]"><tr><th className="px-5 py-3 font-bold">รหัส</th><th className="px-5 py-3 font-bold">ชื่อ-นามสกุล</th><th className="px-5 py-3 font-bold">รอบเวลา</th><th className="px-5 py-3 font-bold">สถานะ</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{visibleRows.map((row) => { const badge = getRegistrationStatusBadge(row.status); return <tr key={row.id}><td className="px-5 py-4 font-mono text-xs font-bold text-[var(--burgundy-700)]">{row.registrationCode}</td><td className="px-5 py-4 text-sm font-bold text-[var(--ink)]">{row.firstName} {row.lastName}</td><td className="px-5 py-4 text-sm text-[var(--muted)]">{row.timeSlotText}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${badge.colorClass}`}>{badge.label}</span></td></tr>; })}</tbody></table></div><div className="divide-y divide-[var(--line)] md:hidden">{visibleRows.map((row) => { const badge = getRegistrationStatusBadge(row.status); return <article key={row.id} className="flex items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="font-mono text-[11px] font-bold text-[var(--burgundy-700)]">{row.registrationCode}</p><h3 className="mt-1 truncate text-sm font-black text-[var(--ink)]">{row.firstName} {row.lastName}</h3><p className="mt-1 text-xs text-[var(--muted)]">{row.timeSlotText}</p></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${badge.colorClass}`}>{badge.label}</span></article>; })}</div></>}
      </section>
    </main>
  );
}
