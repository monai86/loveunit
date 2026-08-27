'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  FileSpreadsheet, 
  ArrowLeft,
  Loader2,
  Eye,
  Calendar,
  Phone
} from 'lucide-react';
import { Registration, TimeSlot } from '@/lib/types/database';
import { formatTimeRange, getParticipantTypeLabel, getRegistrationStatusBadge } from '@/lib/utils/format';

interface ApiRegistration {
  id: string;
  registrationCode?: string;
  registration_code?: string;
  qrToken?: string;
  qr_token?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  participantType?: string;
  participant_type?: string;
  donationExperience?: string;
  donation_experience?: string;
  registeredAt?: string;
  registered_at?: string;
  checkedInAt?: string;
  checked_in_at?: string;
  completedAt?: string;
  completed_at?: string;
  timeSlot?: SlotView | null;
  time_slot?: SlotView | null;
}

type SlotView = TimeSlot & { startAt?: string; endAt?: string };

function normalizeRegistration(r: ApiRegistration): Registration {
  const slot = (r.timeSlot || r.time_slot) as SlotView | null;
  return {
    ...(r as unknown as Registration),
    registration_code: r.registrationCode ?? r.registration_code ?? '',
    qr_token: r.qrToken ?? r.qr_token ?? '',
    first_name: r.firstName ?? r.first_name ?? '',
    last_name: r.lastName ?? r.last_name ?? '',
    participant_type: (r.participantType ?? r.participant_type ?? '') as Registration['participant_type'],
    donation_experience: (r.donationExperience ?? r.donation_experience ?? '') as Registration['donation_experience'],
    registered_at: r.registeredAt ?? r.registered_at ?? '',
    checked_in_at: r.checkedInAt ?? r.checked_in_at ?? null,
    completed_at: r.completedAt ?? r.completed_at ?? null,
    time_slot: slot
      ? { ...slot, start_at: slot.startAt ?? slot.start_at ?? '', end_at: slot.endAt ?? slot.end_at ?? '' }
      : null,
  };
}

export default function AdminRegistrationsPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterExperience, setFilterExperience] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/registrations?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setRegistrations((data.registrations || []).map(normalizeRegistration));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery]);

  // Client-side filtering
  const filteredList = registrations.filter(r => {
    if (filterType !== 'ALL' && r.participant_type !== filterType) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (filterExperience !== 'ALL' && r.donation_experience !== filterExperience) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-4">
        <div>
          <Link href="/mt70" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--burgundy-700)] hover:underline mb-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>กลับหน้าแดชบอร์ด</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display">
            รายชื่อผู้ลงทะเบียน ({filteredList.length} คน)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export"
            className="editorial-btn-primary py-2 px-3.5 text-xs flex items-center gap-2 shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          
          <div className="relative flex-1">
            <label htmlFor="reg-search" className="sr-only">ค้นหาผู้ลงทะเบียน</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="reg-search"
              type="text"
              placeholder="ค้นหารหัส, ชื่อ-นามสกุล, หรือเบอร์โทรศัพท์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] pl-9 pr-3 py-2 text-xs font-medium text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-700)]/20 focus:border-[var(--burgundy-700)]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              aria-label="กรองตามประเภทผู้เข้าร่วม"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-[var(--line)] px-2.5 py-2 text-xs font-medium text-[var(--ink)] bg-white"
            >
              <option value="ALL">ทุกประเภท</option>
              <option value="STUDENT">นักศึกษา</option>
              <option value="STAFF">บุคลากร</option>
              <option value="GENERAL_PUBLIC">บุคคลทั่วไป</option>
            </select>

            <select
              aria-label="กรองตามสถานะ"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-[var(--line)] px-2.5 py-2 text-xs font-medium text-[var(--ink)] bg-white"
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value="REGISTERED">ลงทะเบียนแล้ว</option>
              <option value="CHECKED_IN">เช็คอินแล้ว</option>
              <option value="COMPLETED">บริจาคสำเร็จ</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>

            <select
              aria-label="กรองตามประสบการณ์"
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="rounded-xl border border-[var(--line)] px-2.5 py-2 text-xs font-medium text-[var(--ink)] bg-white"
            >
              <option value="ALL">ทุกประสบการณ์</option>
              <option value="FIRST_TIME">บริจาคครั้งแรก</option>
              <option value="RETURNING">เคยบริจาคแล้ว</option>
            </select>
          </div>

        </div>
      </div>

      {/* Data View */}
      <div className="rounded-2xl border border-[var(--line)] bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex py-16 justify-center items-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--burgundy-700)]" />
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400">
            ไม่พบข้อมูลผู้ลงทะเบียนตามที่ค้นหา
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-gray-100">
              {filteredList.map((row) => {
                const badge = getRegistrationStatusBadge(row.status);
                const timeLabel = row.time_slot
                  ? formatTimeRange(row.time_slot.start_at, row.time_slot.end_at)
                  : '09:00 – 14:00 น.';

                return (
                  <div key={row.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[var(--burgundy-700)] bg-[var(--rose-100)] px-2 py-0.5 rounded">
                        {row.registration_code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.colorClass}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[var(--ink)]">
                          {row.first_name} {row.last_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono mt-0.5">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{row.phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                          {getParticipantTypeLabel(row.participant_type)}
                        </span>
                        {row.faculty && <span className="block text-[10px] text-gray-400 mt-0.5">{row.faculty}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50">
                      <span className="text-gray-500 font-mono text-[11px] flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{timeLabel}</span>
                      </span>
                      <Link
                        href={`/registration/${row.registration_code}`}
                        target="_blank"
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

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--ink)] min-w-[700px]">
                <thead className="bg-gray-50/80 border-b border-[var(--line)] text-gray-600 font-bold">
                  <tr>
                    <th className="p-3.5 whitespace-nowrap">รหัส</th>
                    <th className="p-3.5 whitespace-nowrap">ชื่อ-นามสกุล</th>
                    <th className="p-3.5 whitespace-nowrap">ประเภท</th>
                    <th className="p-3.5 whitespace-nowrap">เบอร์โทรศัพท์</th>
                    <th className="p-3.5 whitespace-nowrap">รอบเวลา</th>
                    <th className="p-3.5 whitespace-nowrap">สถานะ</th>
                    <th className="p-3.5 text-right whitespace-nowrap">บัตรผู้บริจาค</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredList.map((row) => {
                    const badge = getRegistrationStatusBadge(row.status);
                    const timeLabel = row.time_slot
                      ? formatTimeRange(row.time_slot.start_at, row.time_slot.end_at)
                      : '09:00 – 14:00 น.';

                    return (
                      <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[var(--burgundy-700)] whitespace-nowrap">
                          {row.registration_code}
                        </td>
                        <td className="p-3.5 font-bold whitespace-nowrap">
                          {row.first_name} {row.last_name}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span>{getParticipantTypeLabel(row.participant_type)}</span>
                          {row.faculty && <span className="block text-[10px] text-gray-400">{row.faculty}</span>}
                        </td>
                        <td className="p-3.5 font-mono text-gray-700 whitespace-nowrap">
                          {row.phone}
                        </td>
                        <td className="p-3.5 font-mono text-gray-600 whitespace-nowrap">
                          {timeLabel}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badge.colorClass}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <Link
                            href={`/registration/${row.registration_code}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 font-bold text-[var(--burgundy-700)] hover:underline"
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
      </div>

    </div>
  );
}
