'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, 
  FileSpreadsheet, 
  ArrowLeft,
  Loader2,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { Registration, TimeSlot } from '@/lib/types/database';
import { formatTimeRange, formatBangkokTime, isWalkInRecord, getParticipantTypeLabel, getRegistrationStatusBadge } from '@/lib/utils/format';
import { adminRegistrationUpdateSchema } from '@/lib/validation/schemas';
import { ResetTestDataButton } from '@/components/admin/ResetTestDataButton';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';

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
  email?: string | null;
  faculty?: string | null;
  academicYear?: string | null;
  academic_year?: string | null;
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterExperience, setFilterExperience] = useState<string>('ALL');
  const [canManage, setCanManage] = useState(false);
  const [editingRow, setEditingRow] = useState<Registration | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const editTriggerRef = useRef<HTMLButtonElement | null>(null);
  const editDialogRef = useRef<HTMLDivElement | null>(null);
  const [deletingRow, setDeletingRow] = useState<Registration | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const deleteDialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then((res) => res.json()).then((data) => {
      setCanManage(data?.user?.profile?.role === 'SUPER_ADMIN');
    }).catch(() => setCanManage(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchQuery(searchQuery), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/registrations?q=${encodeURIComponent(debouncedSearchQuery)}`);
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
  }, [debouncedSearchQuery]);

  // Client-side filtering
  const filteredList = registrations.filter(r => {
    if (filterType !== 'ALL' && r.participant_type !== filterType) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (filterExperience !== 'ALL' && r.donation_experience !== filterExperience) return false;
    return true;
  });

  const openEditModal = (row: Registration, trigger?: HTMLButtonElement) => {
    editTriggerRef.current = trigger || null;
    setEditingRow(row);
    setEditForm({ firstName: row.first_name, lastName: row.last_name, phone: row.phone, email: row.email || '' });
    setEditError('');
  };

  useEffect(() => {
    if (!editingRow) return;
    const frame = requestAnimationFrame(() => document.getElementById('edit-first-name')?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      editTriggerRef.current?.focus();
    };
  }, [editingRow]);

  const closeEditModal = useCallback(() => {
    if (editSubmitting) return;
    setEditingRow(null);
    setEditError('');
  }, [editSubmitting]);

  useFocusTrap(Boolean(editingRow), editDialogRef, closeEditModal);

  const saveEditDonor = async () => {
    if (!editingRow) return;
    const payload = {
      registrationId: editingRow.id,
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim() || null,
      participantType: editingRow.participant_type,
      faculty: editingRow.faculty || undefined,
      academicYear: editingRow.academic_year || undefined,
      donationExperience: editingRow.donation_experience,
    };
    const parsed = adminRegistrationUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message || 'กรุณาตรวจสอบข้อมูล');
      return;
    }
    setEditSubmitting(true);
    setEditError('');
    try {
    const res = await fetch('/api/admin/registrations', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
      if (!res.ok || !data.success) {
        setEditError(data.message || 'ไม่สามารถบันทึกข้อมูลได้');
        return;
      }
      setRegistrations((current) => current.map((item) => item.id === editingRow.id ? {
        ...item,
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone: payload.phone,
        email: payload.email,
      } : item));
      setEditingRow(null);
    } catch {
      setEditError('ไม่สามารถเชื่อมต่อเพื่อบันทึกข้อมูลได้');
    } finally {
      setEditSubmitting(false);
    }
  };

  const openDeleteModal = (row: Registration, trigger?: HTMLButtonElement) => {
    deleteTriggerRef.current = trigger || null;
    setDeletingRow(row);
    setDeleteError('');
  };

  const closeDeleteModal = useCallback(() => {
    if (deleteSubmitting) return;
    setDeletingRow(null);
    setDeleteError('');
  }, [deleteSubmitting]);

  useFocusTrap(Boolean(deletingRow), deleteDialogRef, closeDeleteModal);

  useEffect(() => {
    if (!deletingRow) return;
    const frame = requestAnimationFrame(() => document.getElementById('confirm-delete-registration')?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      deleteTriggerRef.current?.focus();
    };
  }, [deletingRow]);

  const confirmDeleteDonor = async () => {
    if (!deletingRow) return;
    setDeleteSubmitting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ registrationId: deletingRow.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteError(data.message || 'ไม่สามารถลบข้อมูลได้');
        return;
      }
      setRegistrations((current) => current.filter((item) => item.id !== deletingRow.id));
      setDeletingRow(null);
    } catch {
      setDeleteError('ไม่สามารถเชื่อมต่อเพื่อลบข้อมูลได้');
    } finally {
      setDeleteSubmitting(false);
    }
  };

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

        <div className="flex flex-wrap items-center justify-end gap-2">
          {canManage && <ResetTestDataButton />}
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
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="reg-search"
              type="text"
              placeholder="ค้นหารหัส, ชื่อ-นามสกุล, หรือเบอร์โทรศัพท์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] pl-11 pr-3 py-2 text-xs font-medium text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-700)]/20 focus:border-[var(--burgundy-700)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
            <select
              aria-label="กรองตามประเภทผู้เข้าร่วม"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-2.5 py-2 text-xs font-medium text-[var(--ink)] bg-white shadow-2xs"
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
              className="w-full rounded-xl border border-[var(--line)] px-2.5 py-2 text-xs font-medium text-[var(--ink)] bg-white shadow-2xs"
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
              className="w-full rounded-xl border border-[var(--line)] px-2.5 py-2 text-xs font-medium text-[var(--ink)] bg-white shadow-2xs"
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
                const isWalkIn = isWalkInRecord(row.registration_code) || (row as any).source === 'WALK_IN';
                const timeLabel = isWalkIn
                  ? (row.created_at ? `Walk-in (${formatBangkokTime(row.created_at)})` : 'Walk-in')
                  : (row.time_slot ? formatTimeRange(row.time_slot.start_at, row.time_slot.end_at) : '09:00 – 14:00 น.');

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

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <span className="text-gray-500 font-mono text-[11px] flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
                        <span>{timeLabel}</span>
                      </span>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Link
                          href={`/registration/${row.registration_code}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-[var(--burgundy-700)] hover:bg-[var(--rose-100)]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>ดูบัตร</span>
                        </Link>
                        {canManage && (
                          <button
                            type="button"
                            onClick={(event) => openEditModal(row, event.currentTarget)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-[var(--burgundy-700)] hover:bg-[var(--rose-100)]"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>แก้ไข</span>
                          </button>
                        )}
                        {canManage && (
                          <button
                            type="button"
                            onClick={(event) => openDeleteModal(row, event.currentTarget)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>ลบ</span>
                          </button>
                        )}
                      </div>
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
                    <th className="p-3.5 text-right whitespace-nowrap">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredList.map((row) => {
                    const badge = getRegistrationStatusBadge(row.status);
                    const isWalkIn = isWalkInRecord(row.registration_code) || (row as any).source === 'WALK_IN';
                    const timeLabel = isWalkIn
                      ? (row.created_at ? `Walk-in (${formatBangkokTime(row.created_at)})` : 'Walk-in')
                      : (row.time_slot ? formatTimeRange(row.time_slot.start_at, row.time_slot.end_at) : '09:00 – 14:00 น.');

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
                          {canManage && <button type="button" onClick={(event) => openEditModal(row, event.currentTarget)} className="ml-3 inline-flex items-center gap-1 font-bold text-[var(--burgundy-700)] hover:underline">
                            <Edit2 className="h-3.5 w-3.5" /><span>แก้ไข</span>
                          </button>}
                          {canManage && <button type="button" onClick={(event) => openDeleteModal(row, event.currentTarget)} className="ml-3 inline-flex items-center gap-1 font-bold text-red-700 hover:underline">
                            <Trash2 className="h-3.5 w-3.5" /><span>ลบ</span>
                          </button>}
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

      {editingRow && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeEditModal(); }}
          onKeyDown={(event) => { if (event.key === 'Escape') closeEditModal(); }}
        >
          <div
            ref={editDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-registration-title"
            tabIndex={-1}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[var(--line)] px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2 text-[var(--burgundy-700)]">
                  <Edit2 className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.14em]">แก้ไขข้อมูล</span>
                </div>
                <h2 id="edit-registration-title" className="mt-1 text-xl font-black text-[var(--ink)]">แก้ไขข้อมูลผู้ลงทะเบียน</h2>
                <p className="mt-1 font-mono text-xs text-gray-500">{editingRow.registration_code}</p>
              </div>
              <button type="button" onClick={closeEditModal} aria-label="ปิดหน้าต่างแก้ไข" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" disabled={editSubmitting}>×</button>
            </div>

            <form onSubmit={(event) => { event.preventDefault(); void saveEditDonor(); }} className="space-y-5 px-5 py-5 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ['firstName', 'ชื่อ', 'edit-first-name'],
                  ['lastName', 'นามสกุล', 'edit-last-name'],
                  ['phone', 'เบอร์โทรศัพท์', 'edit-phone'],
                  ['email', 'อีเมล (เว้นว่างได้)', 'edit-email'],
                ] as const).map(([key, label, id]) => (
                  <label key={key} htmlFor={id} className="space-y-1.5">
                    <span className="text-sm font-bold text-[var(--ink)]">{label}</span>
                    <input
                      id={id}
                      type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                      value={editForm[key]}
                      onChange={(event) => setEditForm((current) => ({ ...current, [key]: event.target.value }))}
                      className="editorial-input w-full"
                      autoComplete={key === 'firstName' ? 'given-name' : key === 'lastName' ? 'family-name' : key}
                      disabled={editSubmitting}
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 text-sm sm:grid-cols-3">
                <div><span className="block text-xs text-gray-500">ประเภท</span><span className="font-bold">{getParticipantTypeLabel(editingRow.participant_type)}</span></div>
                <div><span className="block text-xs text-gray-500">คณะ/หน่วยงาน</span><span className="font-bold">{editingRow.faculty || '—'}</span></div>
                <div><span className="block text-xs text-gray-500">รอบเวลา</span><span className="font-bold">{editingRow.time_slot ? formatTimeRange(editingRow.time_slot.start_at, editingRow.time_slot.end_at) : '—'}</span></div>
              </div>

              {editError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{editError}</p>}

              <div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeEditModal} disabled={editSubmitting} className="editorial-btn-secondary min-h-11 px-5">ยกเลิก</button>
                <button type="submit" disabled={editSubmitting} className="editorial-btn-primary min-h-11 px-5">
                  {editSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> กำลังบันทึก...</> : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingRow && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeDeleteModal(); }}
          onKeyDown={(event) => { if (event.key === 'Escape') closeDeleteModal(); }}
        >
          <section
            ref={deleteDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-registration-title"
            aria-describedby="delete-registration-description"
            tabIndex={-1}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl"
          >
            <div className="border-b border-red-100 bg-red-50 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">การดำเนินการถาวร</p>
                  <h2 id="delete-registration-title" className="mt-0.5 text-lg font-black text-[var(--ink)]">ยืนยันการลบข้อมูลผู้ลงทะเบียน</h2>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <p id="delete-registration-description" className="text-sm leading-6 text-gray-600">
                คุณกำลังจะลบข้อมูลของ <strong className="text-[var(--ink)]">{deletingRow.first_name} {deletingRow.last_name}</strong> ออกจากรายการลงทะเบียน
              </p>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3">
                <p className="font-mono text-xs font-bold text-[var(--burgundy-700)]">{deletingRow.registration_code}</p>
                <p className="mt-1 text-xs text-gray-500">{deletingRow.phone} · {getParticipantTypeLabel(deletingRow.participant_type)}</p>
              </div>
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-800">การลบไม่สามารถกู้คืนได้ และ QR ของผู้ลงทะเบียนรายนี้จะใช้งานไม่ได้ทันที</p>
              {deleteError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{deleteError}</p>}
              <div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeDeleteModal} disabled={deleteSubmitting} className="editorial-btn-secondary min-h-11 px-5">ยกเลิก</button>
                <button id="confirm-delete-registration" type="button" onClick={() => void confirmDeleteDonor()} disabled={deleteSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-bold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {deleteSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> กำลังลบ...</> : <><Trash2 className="h-4 w-4" /> ลบข้อมูลถาวร</>}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
