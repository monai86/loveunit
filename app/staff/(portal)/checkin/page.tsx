'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Play, 
  CheckSquare, 
  XCircle, 
  UserPlus,
  Camera,
  RefreshCw
} from 'lucide-react';
import { formatTimeRange, getParticipantTypeLabel } from '@/lib/utils/format';
import type { ParticipantType, RegistrationStatus } from '@/lib/types/database';
import { enqueueOfflineAction } from '@/lib/pwa/offline-queue';

// Registration may arrive from either the Drizzle backend (camelCase) or the
// legacy in-memory backend (snake_case); this type covers both shapes.
interface ApiRegistration {
  id: string;
  registrationCode?: string;
  registration_code?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  phone?: string;
  participantType?: string;
  participant_type?: string;
  faculty?: string | null;
  status?: RegistrationStatus;
  checkedInAt?: string;
  checked_in_at?: string;
  timeSlot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
  time_slot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
}

interface RegistrationDetail {
  id: string;
  registrationCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  participantType: ParticipantType;
  facultyName: string;
  timeSlotText: string;
  status: RegistrationStatus;
  checkedInAt?: string;
}

interface StaffStats {
  totalToday: number;
  checkedIn: number;
  inProcess: number;
  completed: number;
  cancelled: number;
}

/**
 * Maps a registration object from the API (either Drizzle camelCase or
 * legacy snake_case) into the display shape used by this page.
 */
function mapRegistration(r: ApiRegistration): RegistrationDetail {
  const slot = r.timeSlot || r.time_slot;
  return {
    id: r.id,
    registrationCode: r.registrationCode || r.registration_code || '',
    firstName: r.firstName || r.first_name || '',
    lastName: r.lastName || r.last_name || '',
    phone: r.phone || '',
    participantType: (r.participantType || r.participant_type || 'GENERAL_PUBLIC') as ParticipantType,
    facultyName: r.faculty || 'มหาวิทยาลัยมหิดล',
    timeSlotText: slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : 'ไม่ระบุ',
    status: r.status || 'REGISTERED',
    checkedInAt: r.checkedInAt || r.checked_in_at || undefined,
  };
}

export default function StaffCheckinPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Stats Counters (wired to real KPI endpoint)
  const [stats, setStats] = useState<StaffStats>({ totalToday: 0, checkedIn: 0, inProcess: 0, completed: 0, cancelled: 0 });

  // QR Scanner
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const busyRef = useRef(false);

  const stopScanner = useCallback(async () => {
    try {
      await scannerRef.current?.stop();
    } catch {
      // ignore stop errors
    }
    scannerRef.current = null;
    setScanning(false);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/stats');
      const data = await res.json();
      if (res.ok && data.success && data.kpis) {
        setStats({
          totalToday: data.kpis.totalRegistrations ?? 0,
          checkedIn: data.kpis.checkedInCount ?? 0,
          inProcess: data.kpis.inProcessCount ?? 0,
          completed: data.kpis.completedCount ?? 0,
          cancelled: data.kpis.cancelledCount ?? 0,
        });
      }
    } catch {
      // Stats are non-critical; keep zeros.
    }
  }, []);

  useEffect(() => {
    // Defer the initial stats load so it does not synchronously setState
    // during the effect body (avoids cascading re-renders).
    const t = setTimeout(() => {
      void loadStats();
    }, 0);
    return () => {
      clearTimeout(t);
      // Stop camera scanner on unmount
      void stopScanner();
    };
  }, [loadStats, stopScanner]);

  // Search donor by Code or Phone
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/staff/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.registrations) && data.registrations.length > 0) {
        setRegistration(mapRegistration(data.registrations[0]));
        if (data.registrations.length > 1) {
          setMessage({ type: 'warning', text: `พบข้อมูล ${data.registrations.length} รายการ แสดงรายการแรกที่ตรงที่สุด` });
        }
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'ไม่พบข้อมูลผู้บริจาคที่ค้นหา' });
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
    } finally {
      setLoading(false);
    }
  };

  // Perform Status Transition Action (CHECK-IN / START / COMPLETE / CANCEL)
  const handleStatusChange = async (targetStatus: 'CHECKED_IN' | 'IN_PROCESS' | 'COMPLETED' | 'CANCELLED') => {
    if (!registration) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/staff/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id, status: targetStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegistration({ ...registration, status: targetStatus, checkedInAt: new Date().toISOString() });
        loadStats();

        let successText = 'ดำเนินการสำเร็จ!';
        if (targetStatus === 'CHECKED_IN') successText = `เช็คอินสำเร็จ! ${registration.firstName} ${registration.lastName}`;
        if (targetStatus === 'IN_PROCESS') successText = `เริ่มขั้นตอนบริจาคโลหิตสำหรับ ${registration.firstName}`;
        if (targetStatus === 'COMPLETED') successText = `การบริจาคเสร็จสมบูรณ์! ขอขอบคุณ ${registration.firstName}`;
        if (targetStatus === 'CANCELLED') successText = `ยกเลิกรายการสำหรับ ${registration.firstName}`;

        setMessage({ type: 'success', text: successText });
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'ไม่สามารถดำเนินการได้' });
      }
    } catch {
      // Offline (or network dropped mid-flight): buffer the action and replay
      // it automatically when the venue WiFi comes back.
      enqueueOfflineAction({
        endpoint: '/api/staff/checkin',
        method: 'POST',
        body: { registrationId: registration.id, status: targetStatus },
        label: `${registration.firstName} ${registration.lastName} → ${targetStatus}`,
      });
      setRegistration({ ...registration, status: targetStatus, checkedInAt: new Date().toISOString() });
      setMessage({
        type: 'warning',
        text: 'ออฟไลน์ — บันทึกการกระทำไว้ในเครื่องแล้ว จะซิงค์อัตโนมัติเมื่อกลับมาออนไลน์',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Check in a donor by scanned QR token
  const handleCheckinByToken = useCallback(async (qrToken: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setMessage(null);
    try {
      await stopScanner();
      const res = await fetch('/api/staff/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken, status: 'CHECKED_IN' }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.registration) {
        setRegistration(mapRegistration(data.registration));
        loadStats();
        setMessage({ type: 'success', text: `เช็คอินสำเร็จ! ${data.registration.firstName || ''} ${data.registration.lastName || ''}`.trim() });
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'ไม่พบข้อมูลการลงทะเบียนจาก QR Code นี้' });
      }
    } catch {
      // Offline: buffer the check-in so the scan is not lost when WiFi drops.
      enqueueOfflineAction({
        endpoint: '/api/staff/checkin',
        method: 'POST',
        body: { qrToken, status: 'CHECKED_IN' },
        label: `QR สแกน → CHECKED_IN`,
      });
      setMessage({
        type: 'warning',
        text: 'ออฟไลน์ — บันทึกการเช็คอินไว้ในเครื่องแล้ว จะซิงค์อัตโนมัติเมื่อกลับมาออนไลน์',
      });
    } finally {
      busyRef.current = false;
    }
  }, [loadStats]);

  const startScanner = async () => {
    setMessage(null);
    try {
      const scanner = new Html5Qrcode('qr-reader-region');
      scannerRef.current = scanner;
      setScanning(true);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleCheckinByToken(decodedText.trim());
        },
        () => { /* per-frame decode errors are ignored */ }
      );
    } catch {
      setScanning(false);
      scannerRef.current = null;
      setMessage({ type: 'error', text: 'ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง หรือใช้ช่องค้นหาแทน' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="unit-tag">STAFF DASHBOARD</span>
            <span className="unit-tag-outline">CONFIRMATION &amp; EVENT-DAY</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-[var(--ink)] sm:text-3xl">
            ระบบเช็คอินและคัดกรองผู้บริจาคโลหิตหน้างาน
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/staff/walk-in"
            className="inline-flex items-center gap-1.5 bg-[var(--burgundy-600)] hover:bg-[var(--burgundy-700)] text-white font-extrabold px-4 py-3.5 rounded-xl text-xs shadow-md transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>ลงทะเบียน Walk-in</span>
          </Link>
        </div>
      </div>

      {/* DONOR SUMMARY PANEL */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white border border-[var(--line)] rounded-2xl p-4 shadow-xs">
        <div className="text-center border-r border-[var(--line)] pr-2">
          <span className="text-[11px] font-mono font-bold text-[var(--muted)] block">ผู้ลงทะเบียนทั้งหมด</span>
          <span className="text-xl font-mono font-black text-[var(--ink)]">{stats.totalToday} <span className="text-xs">คน</span></span>
        </div>

        <div className="text-center border-r border-[var(--line)] pr-2">
          <span className="text-[11px] font-mono font-bold text-emerald-700 block">เช็คอินแล้ว</span>
          <span className="text-xl font-mono font-black text-emerald-700">{stats.checkedIn} <span className="text-xs">คน</span></span>
        </div>

        <div className="text-center border-r border-[var(--line)] pr-2">
          <span className="text-[11px] font-mono font-bold text-blue-700 block">กำลังบริจาค</span>
          <span className="text-xl font-mono font-black text-blue-700">{stats.inProcess} <span className="text-xs">คน</span></span>
        </div>

        <div className="text-center border-r border-[var(--line)] pr-2">
          <span className="text-[11px] font-mono font-bold text-amber-700 block">เสร็จสิ้นแล้ว</span>
          <span className="text-xl font-mono font-black text-amber-700">{stats.completed} <span className="text-xs">คน</span></span>
        </div>

        <div className="text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-mono font-bold text-red-700 block">ยกเลิก/ไม่มา</span>
          <span className="text-xl font-mono font-black text-red-700">{stats.cancelled} <span className="text-xs">คน</span></span>
        </div>
      </div>

      {/* TOAST NOTIFICATION MESSAGES */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between shadow-xs ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
          message.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-900' :
          'bg-red-50 border-red-300 text-red-900'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-bold underline">ปิด</button>
        </div>
      )}

      {/* STAFF CHECK-IN TABLET SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: SCANNER VIEWPORT (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-[var(--line)] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h2 className="text-xs font-mono font-bold text-[var(--burgundy-600)] uppercase tracking-wider">
              02 QR CODE สำหรับยืนยันตัวตน
            </h2>
            <span className="text-[11px] font-mono font-bold text-[var(--muted)]">{scanning ? 'CAMERA ON' : 'CAMERA VIEWPORT'}</span>
          </div>

          {/* Camera Scanner Region */}
          <div className="relative w-full rounded-xl overflow-hidden bg-[var(--ink)] border-2 border-[var(--ink)]">
            {scanning ? (
              <div id="qr-reader-region" className="w-full aspect-square" />
            ) : (
              <div className="relative aspect-square w-full flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
                {/* Target Reticle Lines */}
                <div className="absolute inset-8 border-2 border-dashed border-[var(--burgundy-400)]/80 rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="h-6 w-6 border-t-2 border-l-2 border-red-500 absolute -top-1 -left-1" />
                  <div className="h-6 w-6 border-t-2 border-r-2 border-red-500 absolute -top-1 -right-1" />
                  <div className="h-6 w-6 border-b-2 border-l-2 border-red-500 absolute -bottom-1 -left-1" />
                  <div className="h-6 w-6 border-b-2 border-r-2 border-red-500 absolute -bottom-1 -right-1" />
                </div>

                <QrCode className="h-12 w-12 text-white/40 mb-2 animate-pulse" />
                <p className="text-xs font-bold text-white text-center">สแกน QR Code / บัตรยืนยัน / บัตรประชาชน</p>
                <p className="text-[11px] text-white/60 text-center mt-1">วางให้อยู่ในกรอบเพื่อสแกนอัตโนมัติ</p>

                <button
                  type="button"
                  onClick={startScanner}
                  className="mt-5 px-4 py-3.5 rounded-lg bg-[var(--burgundy-600)] hover:bg-[var(--burgundy-700)] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>เปิดกล้องสแกน</span>
                </button>
              </div>
            )}

            {scanning && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={stopScanner}
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>ปิดกล้อง</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Manual Search */}
          <form onSubmit={handleSearch} className="space-y-2 pt-2">
            <label htmlFor="ck-search" className="block text-xs font-bold text-[var(--ink)]">04 ค้นหาและผลการค้นหา</label>
            <div className="flex gap-2">
              <input
                id="ck-search"
                type="text"
                placeholder="ค้นหาชื่อ / เบอร์โทร / รหัสยืนยัน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="editorial-input flex-1"
              />
              <button type="submit" disabled={loading} aria-label="ค้นหา" className="editorial-btn-primary py-3.5 px-4 text-xs">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

        </div>

        {/* RIGHT PANEL: DONOR DETAILS & LARGE ACTION BUTTONS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {registration ? (
            <div className="bg-white border border-[var(--line)] rounded-2xl p-6 space-y-6 shadow-xs">
              
              {/* Header Details */}
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[var(--muted)] uppercase block">REGISTRATION CODE</span>
                  <span className="text-2xl font-mono font-black text-[var(--burgundy-600)]">{registration.registrationCode}</span>
                </div>

                <div>
                  {registration.status === 'REGISTERED' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">REGISTERED</span>
                  )}
                  {registration.status === 'CHECKED_IN' && (
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">CHECKED IN</span>
                  )}
                  {registration.status === 'IN_PROCESS' && (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">IN PROCESS</span>
                  )}
                  {registration.status === 'COMPLETED' && (
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold">COMPLETED</span>
                  )}
                  {registration.status === 'CANCELLED' && (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-extrabold">CANCELLED</span>
                  )}
                </div>
              </div>

              {/* Donor Data Fields */}
              <div className="space-y-3 text-xs border-b border-[var(--line)] pb-4">
                <div className="flex justify-between py-1">
                  <span className="text-[var(--muted)] font-bold">ชื่อ-นามสกุล:</span>
                  <span className="text-base font-black text-[var(--ink)]">{registration.firstName} {registration.lastName}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[var(--muted)] font-bold">เบอร์โทรศัพท์:</span>
                  <span className="font-mono font-bold text-[var(--ink)]">{registration.phone}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[var(--muted)] font-bold">คณะ / สังกัด:</span>
                  <span className="font-bold text-[var(--ink)]">{registration.facultyName} ({getParticipantTypeLabel(registration.participantType)})</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[var(--muted)] font-bold">รอบเวลาที่จอง:</span>
                  <span className="font-mono font-black text-[var(--burgundy-600)]">{registration.timeSlotText}</span>
                </div>
              </div>

              {/* 08 LARGE ACTION BUTTONS */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-[var(--burgundy-600)] uppercase tracking-wider block">
                  08 ปุ่มการทำงานหลักสำหรับเจ้าหน้าที่ (LARGE ACTION BUTTONS)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  {/* Button 1: CHECK-IN */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('CHECKED_IN')}
                    className="p-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                  >
                    <UserCheck className="h-5 w-5" />
                    <span>เช็คอิน</span>
                    <span className="text-[11px] font-mono opacity-80 uppercase">CHECK-IN</span>
                  </button>

                  {/* Button 2: START */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('IN_PROCESS')}
                    className="p-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Play className="h-5 w-5 fill-white" />
                    <span>เริ่มบริจาค</span>
                    <span className="text-[11px] font-mono opacity-80 uppercase">START</span>
                  </button>

                  {/* Button 3: COMPLETE */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('COMPLETED')}
                    className="p-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                  >
                    <CheckSquare className="h-5 w-5" />
                    <span>จบกระบวนการ</span>
                    <span className="text-[11px] font-mono opacity-80 uppercase">COMPLETE</span>
                  </button>

                  {/* Button 4: CANCEL */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('CANCELLED')}
                    className="p-3.5 rounded-xl bg-white border-2 border-red-600 text-red-700 hover:bg-red-50 font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>ยกเลิกคิว</span>
                    <span className="text-[11px] font-mono opacity-80 uppercase">CANCEL</span>
                  </button>

                </div>
              </div>

              {/* Activity Log Timeline */}
              <div className="pt-4 border-t border-[var(--line)] space-y-2">
                <span className="text-[11px] font-mono font-bold text-[var(--muted)] uppercase block">ประวัติการดำเนินการ</span>
                <div className="space-y-1.5 text-[11px] font-mono text-[var(--ink)]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                    <span>{registration.registrationCode} — สถานะปัจจุบัน: {registration.status}</span>
                  </div>
                  {registration.checkedInAt && (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>เช็คอินแล้วเมื่อ {new Date(registration.checkedInAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[var(--line)] rounded-2xl p-12 text-center text-[var(--muted)]">
              <Search className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-[var(--ink)]">รอการสแกนหรือค้นหาผู้บริจาค</p>
              <p className="text-xs">พิมพ์ชื่อ เบอร์โทร หรือสแกน QR Code เพื่อดึงข้อมูล</p>
              <button
                type="button"
                onClick={() => { loadStats(); setMessage({ type: 'success', text: 'อัปเดตข้อมูลเรียบร้อย' }); }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--burgundy-600)] hover:underline py-3.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                อัปเดตสถิติ
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
