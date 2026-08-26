'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Gift, 
  XCircle, 
  UserPlus,
  Camera,
  Ban,
  Sparkles,
  RotateCcw,
  Clock,
  Phone,
  User,
  ShieldCheck,
  AlertCircle,
  RefreshCw
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
  completedAt?: string;
  completed_at?: string;
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
  completedAt?: string;
}

interface StaffStats {
  totalToday: number;
  checkedIn: number;
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
    completedAt: r.completedAt || r.completed_at || undefined,
  };
}

export default function StaffCheckinPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);
  const [stats, setStats] = useState<StaffStats>({ totalToday: 0, checkedIn: 0, completed: 0, cancelled: 0 });

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const busyRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      try {
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
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
          setMessage({ type: 'info', text: `พบข้อมูล ${data.registrations.length} รายการ แสดงรายการแรกที่ตรงที่สุด` });
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

  const handleStatusChange = async (targetStatus: 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED') => {
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
        const nowIso = new Date().toISOString();
        const updatedReg = {
          ...registration,
          status: targetStatus,
          checkedInAt: targetStatus === 'CHECKED_IN' ? nowIso : registration.checkedInAt,
          completedAt: targetStatus === 'COMPLETED' ? nowIso : registration.completedAt,
        };
        setRegistration(updatedReg);
        loadStats();

        let successText = 'ดำเนินการสำเร็จ!';
        if (targetStatus === 'CHECKED_IN') {
          successText = `🎟️ ยืนยันเช็คอินเข้างานสำเร็จ! คุณ${registration.firstName} ${registration.lastName}`;
        }
        if (targetStatus === 'COMPLETED') {
          successText = `🎁 บันทึกการบริจาคโลหิตสำเร็จ และมอบของที่ระลึกให้ คุณ${registration.firstName} เรียบร้อยแล้ว ✨`;
        }
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
      const nowIso = new Date().toISOString();
      setRegistration({
        ...registration,
        status: targetStatus,
        checkedInAt: targetStatus === 'CHECKED_IN' ? nowIso : registration.checkedInAt,
        completedAt: targetStatus === 'COMPLETED' ? nowIso : registration.completedAt,
      });
      setMessage({
        type: 'warning',
        text: 'ออฟไลน์ — บันทึกการกระทำไว้ในเครื่องแล้ว จะซิงค์อัตโนมัติเมื่อกลับมาออนไลน์',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLookupByToken = useCallback(async (tokenOrCode: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setMessage(null);

    // Haptic feedback if available on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(80); } catch { /* ignore */ }
    }

    try {
      const res = await fetch(`/api/staff/search?q=${encodeURIComponent(tokenOrCode.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.registrations) && data.registrations.length > 0) {
        const found = mapRegistration(data.registrations[0]);
        setRegistration(found);
        loadStats();

        if (found.status === 'REGISTERED') {
          setMessage({
            type: 'info',
            text: `สแกนพบ คุณ${found.firstName} ${found.lastName} (สถานะ: รอเช็คอิน) — กรุณากดยืนยันเช็คอินเข้างานด้านล่าง`,
          });
        } else if (found.status === 'CHECKED_IN') {
          setMessage({
            type: 'info',
            text: `สแกนพบ คุณ${found.firstName} ${found.lastName} (เช็คอินแล้ว) — เมื่อบริจาคโลหิตเสร็จสิ้น สามารถกดยืนยันรับของที่ระลึกได้`,
          });
        } else if (found.status === 'COMPLETED') {
          setMessage({
            type: 'success',
            text: `คุณ${found.firstName} ${found.lastName} ได้บริจาคโลหิตและรับของที่ระลึกเรียบร้อยแล้ว ✨`,
          });
        }
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'ไม่พบข้อมูลการลงทะเบียนจาก QR Code นี้' });
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการค้นหาข้อมูลจาก QR Code' });
    } finally {
      busyRef.current = false;
    }
  }, [loadStats]);

  const startScanner = async (targetFacing: 'environment' | 'user' = facingMode) => {
    setMessage(null);
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // ignore
        }
        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }
        scannerRef.current = null;
      }

      setScanning(true);
      await new Promise((r) => setTimeout(r, 100));

      const element = document.getElementById('qr-reader-region');
      if (!element) {
        throw new Error('Scanner container element not found');
      }

      const scanner = new Html5Qrcode('qr-reader-region');
      scannerRef.current = scanner;

      const qrConfig = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      const qrCodeSuccessCallback = (decodedText: string) => {
        handleLookupByToken(decodedText.trim());
      };

      try {
        await scanner.start(
          { facingMode: targetFacing },
          qrConfig,
          qrCodeSuccessCallback,
          () => {}
        );
        setFacingMode(targetFacing);
      } catch (envErr) {
        console.warn(`${targetFacing} camera failed, trying fallback camera:`, envErr);
        const fallbackMode = targetFacing === 'environment' ? 'user' : 'environment';
        await scanner.start(
          { facingMode: fallbackMode },
          qrConfig,
          qrCodeSuccessCallback,
          () => {}
        );
        setFacingMode(fallbackMode);
      }
    } catch (err: unknown) {
      console.error('Camera start error:', err);
      setScanning(false);
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // ignore
        }
        try {
          scannerRef.current.clear();
        } catch {
          // ignore
        }
        scannerRef.current = null;
      }

      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission') || errMsg.includes('Permission denied')) {
        setMessage({ type: 'error', text: 'เบราว์เซอร์ไม่อนุญาตให้เข้าถึงกล้อง กรุณากดอนุญาตสิทธิ์การใช้กล้อง (Camera Permission) ในแถบเบราว์เซอร์' });
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('no camera')) {
        setMessage({ type: 'error', text: 'ไม่พบอุปกรณ์กล้องบนเครื่องนี้ กรุณาใช้ช่องค้นหาด้านล่างแทน' });
      } else {
        setMessage({ type: 'error', text: 'ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบการอนุญาตสิทธิ์กล้อง หรือใช้ช่องค้นหาแทน' });
      }
    }
  };

  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    await startScanner(nextFacing);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Top Header & Live KPI Stat Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-black text-[var(--burgundy-700)] uppercase tracking-wider">
              STAFF CHECK-IN & SOUVENIR STATION
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] text-[10px] font-black border border-[var(--line)]">
              ห้องประชุม 217
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
            ระบบเช็คอินและคัดกรองผู้บริจาคหน้างาน
          </h1>
          <p className="text-xs text-[var(--muted)]">
            สแกน QR Code เพื่อเช็คอินเข้างาน ตรวจสอบผู้มาจริง และบันทึกการรับของที่ระลึกสุดพิเศษเมื่อบริจาคสำเร็จ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadStats}
            title="รีเฟรชข้อมูลสถิติ"
            className="p-2.5 rounded-xl border border-[var(--line)] bg-white hover:bg-gray-50 text-[var(--ink)] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            href="/staff/walk-in"
            className="editorial-btn-secondary text-xs flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Walk-in หน้างาน</span>
          </Link>
        </div>
      </div>

      {/* 3 Core KPIs Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              1. ผู้ลงทะเบียนทั้งหมด
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
                {stats.totalToday}
              </span>
              <span className="text-xs text-gray-400 font-bold">คน</span>
            </div>
            <span className="text-[11px] text-gray-500 block">ปริมาณผู้ที่สนใจล่วงหน้า</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100">
            <User className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
              2. มาเช็คอินเข้างานแล้ว
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-blue-900">
                {stats.checkedIn}
              </span>
              <span className="text-xs text-blue-600 font-bold">คน</span>
              {stats.totalToday > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {Math.round((stats.checkedIn / stats.totalToday) * 100)}%
                </span>
              )}
            </div>
            <span className="text-[11px] text-blue-600/80 block">จำนวนผู้ที่มาถึงงานจริง</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
              3. บริจาคสำเร็จ & รับของที่ระลึก
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-900">
                {stats.completed}
              </span>
              <span className="text-xs text-emerald-600 font-bold">คน / ยูนิต</span>
            </div>
            <span className="text-[11px] text-emerald-600/80 block">มอบของที่ระลึกเรียบร้อย</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Gift className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Status / Alert Banner */}
      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          message.type === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-200' :
          message.type === 'info' ? 'bg-blue-50 text-blue-900 border-blue-200' :
          'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {message.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
            {message.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />}
            {message.type === 'info' && <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />}
            {message.type === 'error' && <XCircle className="h-5 w-5 text-rose-600 shrink-0" />}
            <span className="text-sm font-black">{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Pane: High-End QR Scanner & Search (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[var(--line)] rounded-3xl p-6 space-y-6 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[var(--burgundy-700)]" />
              <h2 className="text-xs font-black text-[var(--ink)] uppercase tracking-wider">
                สแกน QR Code บัตรผู้บริจาค
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {scanning && (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  title="สลับกล้องหน้า/หลัง"
                  className="p-1 px-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{facingMode === 'environment' ? 'กล้องหลัง' : 'กล้องหน้า'}</span>
                </button>
              )}
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                scanning ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {scanning ? 'LIVE CAMERA' : 'STANDBY'}
              </span>
            </div>
          </div>

          {/* Camera Region Container */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square flex items-center justify-center shadow-inner">
            
            {/* Always in DOM for Html5Qrcode attach */}
            <div
              id="qr-reader-region"
              className={`w-full h-full ${scanning ? 'block' : 'hidden'}`}
            />

            {/* Standby Viewfinder Placeholder */}
            {!scanning && (
              <div className="relative aspect-square w-full flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                {/* Modern Reticle / Guides */}
                <div className="absolute inset-12 border-2 border-dashed border-rose-400/40 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="h-5 w-5 border-t-2 border-l-2 border-rose-500 absolute -top-1 -left-1 rounded-tl" />
                  <div className="h-5 w-5 border-t-2 border-r-2 border-rose-500 absolute -top-1 -right-1 rounded-tr" />
                  <div className="h-5 w-5 border-b-2 border-l-2 border-rose-500 absolute -bottom-1 -left-1 rounded-bl" />
                  <div className="h-5 w-5 border-b-2 border-r-2 border-rose-500 absolute -bottom-1 -right-1 rounded-br" />
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md shadow-inner">
                  <QrCode className="h-10 w-10 text-rose-300" />
                </div>

                <div className="space-y-1 z-10">
                  <p className="text-sm font-black text-white">สแกนบัตรลงทะเบียน</p>
                  <p className="text-[11px] text-slate-400">หันกล้องไปที่ QR Code ของผู้บริจาค</p>
                </div>

                <button
                  type="button"
                  onClick={() => startScanner()}
                  className="editorial-btn-primary py-2.5 px-6 text-xs flex items-center gap-2 shadow-lg cursor-pointer z-10"
                >
                  <Camera className="h-4 w-4" />
                  <span>เปิดกล้องสแกน</span>
                </button>
              </div>
            )}

            {/* Active Laser Scanning Overlay */}
            {scanning && (
              <>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-rose-500/70 rounded-2xl relative">
                    <div className="h-6 w-6 border-t-4 border-l-4 border-rose-500 absolute -top-1.5 -left-1.5 rounded-tl" />
                    <div className="h-6 w-6 border-t-4 border-r-4 border-rose-500 absolute -top-1.5 -right-1.5 rounded-tr" />
                    <div className="h-6 w-6 border-b-4 border-l-4 border-rose-500 absolute -bottom-1.5 -left-1.5 rounded-bl" />
                    <div className="h-6 w-6 border-b-4 border-r-4 border-rose-500 absolute -bottom-1.5 -right-1.5 rounded-br" />
                    {/* Animated Laser Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.9)]" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="px-4 py-1.5 rounded-xl bg-black/80 backdrop-blur-md hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-lg cursor-pointer transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>ปิดกล้อง</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Manual Search */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label htmlFor="ck-search" className="block text-xs font-black text-[var(--ink)]">
              หรือค้นหาด่วน (ชื่อ / เบอร์โทร / รหัสยืนยัน)
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

        {/* Right Pane: Donor Confirmation & Souvenir Card (7 cols) */}
        <div className="lg:col-span-7">
          {registration ? (
            <div className="bg-white border border-[var(--line)] rounded-3xl p-7 space-y-6 shadow-sm animate-in fade-in duration-200">
              
              {/* Card Header: Code & Status */}
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[var(--muted)] uppercase tracking-wider block">
                    REGISTRATION PASS
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
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400" /> ชื่อ - นามสกุล
                  </span>
                  <p className="text-lg font-black text-[var(--ink)]">
                    คุณ{registration.firstName} {registration.lastName}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" /> เบอร์โทรศัพท์
                  </span>
                  <p className="text-lg font-mono font-black text-[var(--ink)]">
                    {registration.phone}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block">ประเภทผู้บริจาค</span>
                  <p className="font-bold text-[var(--ink)]">
                    {getParticipantTypeLabel(registration.participantType)}
                  </p>
                  <span className="text-[10px] text-gray-500 block">{registration.facultyName}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[var(--burgundy-700)]" /> รอบเวลาที่ลงทะเบียน
                  </span>
                  <p className="font-mono font-bold text-[var(--burgundy-700)] text-sm">
                    {registration.timeSlotText}
                  </p>
                </div>
              </div>

              {/* Status Context & Next Action Guidance */}
              <div className="rounded-2xl p-4 border space-y-2 bg-[var(--rose-50)]/50 border-[var(--rose-100)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--burgundy-800)] flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[var(--burgundy-700)]" />
                    สถานะการเข้าร่วมงาน & ของที่ระลึก:
                  </span>
                  {registration.checkedInAt && (
                    <span className="text-[11px] font-mono text-gray-600">
                      เช็คอินเมื่อ: {new Date(registration.checkedInAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  )}
                </div>

                {registration.status === 'REGISTERED' && (
                  <p className="text-xs text-gray-600">
                    ผู้บริจาคลงทะเบียนแล้ว กรุณาตรวจสอบข้อมูลและกดปุ่ม <span className="font-bold text-blue-700">&ldquo;ยืนยันเช็คอินเข้างาน&rdquo;</span> ด้านล่าง
                  </p>
                )}

                {registration.status === 'CHECKED_IN' && (
                  <p className="text-xs text-emerald-800 font-bold">
                    ✓ เช็คอินเข้างานแล้ว — เมื่อผู้บริจาคบริจาคโลหิตเสร็จสิ้น กดปุ่ม <span className="font-black text-emerald-900">&ldquo;บริจาคสำเร็จ &amp; มอบของที่ระลึก&rdquo;</span>
                  </p>
                )}

                {registration.status === 'COMPLETED' && (
                  <div className="flex items-center gap-2 text-emerald-900 text-xs font-black">
                    <Gift className="h-5 w-5 text-emerald-600" />
                    <span>🎉 บริจาคโลหิตสำเร็จ และรับของที่ระลึกสุดพิเศษเรียบร้อยแล้ว ✨</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2 border-t border-[var(--line)]">
                <div className="flex flex-col sm:flex-row gap-3">
                  
                  {/* Step 1: Check In */}
                  {registration.status === 'REGISTERED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('CHECKED_IN')}
                      className="flex-1 py-4 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <UserCheck className="h-5 w-5" />
                      <span>1. ยืนยันการเช็คอินเข้างาน (CHECK-IN)</span>
                    </button>
                  )}

                  {/* Step 2: Complete Donation & Give Souvenir */}
                  {registration.status === 'CHECKED_IN' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('COMPLETED')}
                      className="flex-1 py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <Gift className="h-5 w-5" />
                      <span>2. ยืนยันบริจาคสำเร็จ & มอบของที่ระลึก (COMPLETED)</span>
                    </button>
                  )}

                  {/* If Already Completed */}
                  {registration.status === 'COMPLETED' && (
                    <div className="flex-1 py-3 px-4 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center gap-2 border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>เสร็จสิ้นกระบวนการทั้งหมดแล้ว</span>
                    </div>
                  )}

                  {/* Cancel / Ineligible Button */}
                  {registration.status !== 'CANCELLED' && registration.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('CANCELLED')}
                      className="py-3 px-4 rounded-2xl bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-700 font-bold text-xs border border-gray-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Ban className="h-4 w-4" />
                      <span>ยกเลิก / ไม่ผ่านคัดกรอง</span>
                    </button>
                  )}

                </div>

                {/* Reset / Next Scan Action */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistration(null);
                      setMessage(null);
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 p-1 cursor-pointer"
                  >
                    <span>สแกนหรือค้นหารายการถัดไป ➔</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[var(--line)] rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <div className="h-20 w-20 mx-auto rounded-3xl bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center shadow-inner">
                <QrCode className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--ink)]">
                  พร้อมสำหรับการสแกนหรือค้นหาผู้บริจาค
                </h3>
                <p className="text-xs text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                  สแกน QR Code จากบัตรผู้บริจาค หรือพิมพ์ค้นหาด้วยชื่อ เบอร์โทรศัพท์ หรือรหัสบัตร เพื่อตรวจสอบและยืนยันการเช็คอินและมอบของที่ระลึก
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
