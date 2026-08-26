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
  XCircle, 
  UserPlus,
  Camera,
  Heart,
  Ban
} from 'lucide-react';
import { formatTimeRange, getParticipantTypeLabel, getRegistrationStatusBadge } from '@/lib/utils/format';
import type { ParticipantType, RegistrationStatus } from '@/lib/types/database';
import { enqueueOfflineAction } from '@/lib/pwa/offline-queue';

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
    timeSlotText: slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : '09:00 – 14:00 น.',
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
  const [stats, setStats] = useState<StaffStats>({ totalToday: 0, checkedIn: 0, inProcess: 0, completed: 0, cancelled: 0 });

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const busyRef = useRef(false);

  const stopScanner = useCallback(async () => {
    try {
      await scannerRef.current?.stop();
    } catch {
      // ignore
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
      // Ignore
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadStats();
    }, 0);
    return () => {
      clearTimeout(t);
      void stopScanner();
    };
  }, [loadStats, stopScanner]);

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

  const handleStatusChange = async (targetStatus: 'CHECKED_IN' | 'IN_PROCESS' | 'COMPLETED' | 'CANCELLED') => {
    if (!registration) return;

    setActionLoading(true);
    setMessage(null);

    const endpoint = targetStatus === 'CANCELLED' ? '/api/staff/cancel' : '/api/staff/checkin';
    const payload = targetStatus === 'CANCELLED'
      ? { registrationId: registration.id }
      : { registrationId: registration.id, status: targetStatus };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegistration({ ...registration, status: targetStatus, checkedInAt: new Date().toISOString() });
        loadStats();

        let successText = 'ดำเนินการสำเร็จ!';
        if (targetStatus === 'CHECKED_IN') successText = `เช็คอินสำเร็จ! คุณ${registration.firstName} ${registration.lastName}`;
        if (targetStatus === 'IN_PROCESS') successText = `เริ่มขั้นตอนบริจาคโลหิตสำหรับ คุณ${registration.firstName}`;
        if (targetStatus === 'COMPLETED') successText = `การบริจาคเสร็จสมบูรณ์! ขอขอบคุณ คุณ${registration.firstName}`;
        if (targetStatus === 'CANCELLED') {
          successText = data.promoted
            ? `ยกเลิกรายการ คุณ${registration.firstName} และเลื่อนผู้รอรายถัดไปเข้าคิวแล้ว`
            : `ยกเลิกรายการสำหรับ คุณ${registration.firstName}`;
        }

        setMessage({ type: 'success', text: successText });
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'ไม่สามารถดำเนินการได้' });
      }
    } catch {
      enqueueOfflineAction({
        endpoint,
        method: 'POST',
        body: payload,
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
        setMessage({ type: 'success', text: `เช็คอินสำเร็จ! คุณ${data.registration.firstName || ''} ${data.registration.lastName || ''}`.trim() });
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'ไม่พบข้อมูลการลงทะเบียนจาก QR Code นี้' });
      }
    } catch {
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
  }, [loadStats, stopScanner]);

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
        () => {}
      );
    } catch {
      setScanning(false);
      scannerRef.current = null;
      setMessage({ type: 'error', text: 'ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง หรือใช้ช่องค้นหาแทน' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-black text-[var(--burgundy-700)] uppercase tracking-wider">
              STAFF CHECK-IN STATION
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] text-[10px] font-black border border-[var(--line)]">
              ห้องประชุม 217
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
            ระบบเช็คอินและคัดกรองผู้บริจาคหน้างาน
          </h1>
          <p className="text-xs text-[var(--muted)] font-medium">
            สแกนบัตร QR Code หรือค้นหาด้วยชื่อ/เบอร์โทร เพื่อยืนยันการเข้าร่วมกิจกรรม
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/staff/walk-in"
            className="editorial-btn-primary py-2.5 px-4 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>ลงทะเบียน Walk-in</span>
          </Link>

          <Link
            href="/staff/queue"
            className="editorial-btn-secondary py-2.5 px-4 text-xs flex items-center gap-1.5"
          >
            <span>ดูลำดับคิวหน้างาน</span>
          </Link>
        </div>
      </div>

      {/* Live Operational Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[var(--line)] shadow-xs text-center space-y-1">
          <span className="text-[11px] font-bold text-[var(--muted)] block">ลงทะเบียนทั้งหมด</span>
          <span className="text-2xl font-mono font-black text-[var(--ink)]">{stats.totalToday} <span className="text-xs font-sans font-bold">คน</span></span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 block">เช็คอินเข้างานแล้ว</span>
          <span className="text-2xl font-mono font-black text-emerald-900">{stats.checkedIn} <span className="text-xs font-sans font-bold">คน</span></span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
          <span className="text-[11px] font-bold text-blue-800 block">กำลังบริจาคบนเตียง</span>
          <span className="text-2xl font-mono font-black text-blue-900">{stats.inProcess} <span className="text-xs font-sans font-bold">คน</span></span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
          <span className="text-[11px] font-bold text-rose-800 block">เสร็จสิ้นการบริจาค</span>
          <span className="text-2xl font-mono font-black text-rose-900">{stats.completed} <span className="text-xs font-sans font-bold">คน</span></span>
        </div>

        <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200 text-center space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-gray-600 block">ยกเลิก / ไม่มา</span>
          <span className="text-2xl font-mono font-black text-gray-800">{stats.cancelled} <span className="text-xs font-sans font-bold">คน</span></span>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-xs ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
          message.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-900' :
          'bg-red-50 border-red-300 text-red-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-black underline hover:opacity-80">
            ปิด
          </button>
        </div>
      )}

      {/* Main Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Pane: QR Scanner & Search (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[var(--line)] rounded-3xl p-6 space-y-6 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[var(--burgundy-700)]" />
              <h2 className="text-xs font-black text-[var(--ink)] uppercase tracking-wider">
                สแกนบัตร QR Code
              </h2>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
              scanning ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {scanning ? 'CAMERA ACTIVE' : 'STANDBY'}
            </span>
          </div>

          {/* Camera Region */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            {scanning ? (
              <div id="qr-reader-region" className="w-full aspect-square" />
            ) : (
              <div className="relative aspect-square w-full flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                
                {/* Target Guides */}
                <div className="absolute inset-10 border-2 border-dashed border-rose-400/50 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="h-5 w-5 border-t-2 border-l-2 border-rose-500 absolute -top-1 -left-1 rounded-tl" />
                  <div className="h-5 w-5 border-t-2 border-r-2 border-rose-500 absolute -top-1 -right-1 rounded-tr" />
                  <div className="h-5 w-5 border-b-2 border-l-2 border-rose-500 absolute -bottom-1 -left-1 rounded-bl" />
                  <div className="h-5 w-5 border-b-2 border-r-2 border-rose-500 absolute -bottom-1 -right-1 rounded-br" />
                </div>

                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm shadow-inner">
                  <QrCode className="h-10 w-10 text-rose-300" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-black text-white">สแกน QR Code บัตรผู้บริจาค</p>
                  <p className="text-[11px] text-slate-400">หันกล้องไปยัง QR Code เพื่อเช็คอินทันที</p>
                </div>

                <button
                  type="button"
                  onClick={startScanner}
                  className="editorial-btn-primary py-2.5 px-5 text-xs flex items-center gap-2 shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                  <span>เปิดกล้องสแกน</span>
                </button>
              </div>
            )}

            {scanning && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopScanner}
                  className="px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>ปิดกล้อง</span>
                </button>
              </div>
            )}
          </div>

          {/* Fallback Search */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label htmlFor="ck-search" className="block text-xs font-black text-[var(--ink)]">
              หรือค้นหาด้วยชื่อ / เบอร์โทร / รหัสบัตร
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="ck-search"
                  type="text"
                  placeholder="ค้นหาชื่อ / เบอร์โทร / รหัสยืนยัน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--burgundy-600)]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="editorial-btn-primary px-4 text-xs font-black"
              >
                {loading ? '...' : 'ค้นหา'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Pane: Donor Verification & Action Card (7 cols) */}
        <div className="lg:col-span-7">
          {registration ? (
            <div className="bg-white border border-[var(--line)] rounded-3xl p-7 space-y-6 shadow-sm">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[var(--muted)] uppercase block">
                    REGISTRATION CODE
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono font-black text-[var(--burgundy-700)]">
                    {registration.registrationCode}
                  </span>
                </div>

                <div className="text-right">
                  {(() => {
                    const badge = getRegistrationStatusBadge(registration.status);
                    const engStatus = registration.status === 'CHECKED_IN' ? 'CHECKED IN' : registration.status;
                    return (
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[var(--muted)]">
                          {engStatus}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Donor Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block">ชื่อ - นามสกุล</span>
                  <p className="text-base font-black text-[var(--ink)]">
                    คุณ{registration.firstName} {registration.lastName}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block">เบอร์โทรศัพท์</span>
                  <p className="text-base font-mono font-black text-[var(--ink)]">
                    {registration.phone}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block">ประเภทผู้บริจาค</span>
                  <p className="font-bold text-[var(--ink)]">
                    {getParticipantTypeLabel(registration.participantType)} ({registration.facultyName})
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block">รอบเวลาที่ลงทะเบียน</span>
                  <p className="font-mono font-bold text-[var(--burgundy-700)]">
                    {registration.timeSlotText}
                  </p>
                </div>
              </div>

              {/* Action Pipeline Buttons */}
              <div className="space-y-3 pt-2 border-t border-[var(--line)]">
                <span className="text-xs font-black text-[var(--ink)] block">
                  ขั้นตอนการดำเนินการ (Action Pipeline):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {registration.status === 'REGISTERED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('CHECKED_IN')}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>1. ยืนยันการเช็คอิน (CHECK-IN)</span>
                    </button>
                  )}

                  {(registration.status === 'REGISTERED' || registration.status === 'CHECKED_IN') && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('IN_PROCESS')}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                    >
                      <Play className="h-4 w-4" />
                      <span>2. เริ่มบริจาคบนเตียง (IN PROCESS)</span>
                    </button>
                  )}

                  {registration.status === 'IN_PROCESS' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('COMPLETED')}
                      className="w-full py-3.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] sm:col-span-2"
                    >
                      <Heart className="h-4 w-4 fill-white" />
                      <span>3. บริจาคเสร็จสิ้น (COMPLETED)</span>
                    </button>
                  )}

                  {registration.status !== 'CANCELLED' && registration.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('CANCELLED')}
                      className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 font-bold text-xs border border-gray-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>ยกเลิก / ไม่ผ่านคัดกรอง</span>
                    </button>
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[var(--line)] rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-base font-black text-[var(--ink)]">
                รอการสแกนหรือค้นหาผู้บริจาค
              </h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                สแกน QR Code จากบัตรอิเล็กทรอนิกส์ของผู้บริจาค หรือพิมพ์ค้นหาด้วยชื่อ/เบอร์โทรศัพท์ เพื่อเริ่มขั้นตอนเช็คอิน
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
