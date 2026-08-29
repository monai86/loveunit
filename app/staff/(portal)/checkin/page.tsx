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
  RotateCcw,
  AlertCircle,
  Volume2,
  VolumeX,
  Zap,
  UploadCloud,
  History,
  Flashlight,
  ArrowRight
} from 'lucide-react';
import { formatTimeRange, getRegistrationStatusBadge } from '@/lib/utils/format';
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

interface RecentScanItem {
  id: string;
  code: string;
  name: string;
  status: RegistrationStatus;
  time: string;
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

// Synthesized Web Audio API sound generator (Zero external audio file dependency)
function playAudioChime(type: 'success' | 'souvenir' | 'error' | 'click') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      // High-pitched pleasant double chime (880Hz -> 1320Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'souvenir') {
      // Triumphant chord (587Hz -> 880Hz -> 1174Hz)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      osc.frequency.setValueAtTime(1174.66, now + 0.16);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'error') {
      // Low saw buzz (220Hz)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Subtle click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // AudioContext blocked or not supported
  }
}

export default function StaffCheckinPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);
  const [stats, setStats] = useState<StaffStats>({ totalToday: 0, checkedIn: 0, completed: 0, cancelled: 0 });

  // Camera & Scanner State
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [selectedCameraId] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fastTrackMode, setFastTrackMode] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScanItem[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const busyRef = useRef(false);
  const lastScannedCodeRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

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

  const addRecentScan = useCallback((reg: RegistrationDetail, targetStatus: RegistrationStatus) => {
    setRecentScans((prev) => {
      const item: RecentScanItem = {
        id: reg.id,
        code: reg.registrationCode,
        name: `${reg.firstName} ${reg.lastName}`,
        status: targetStatus,
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      const filtered = prev.filter((p) => p.id !== reg.id);
      return [item, ...filtered].slice(0, 5);
    });
  }, []);

  const handleLookupByToken = useCallback(async (tokenOrCode: string) => {
    const cleanToken = tokenOrCode.trim();
    if (!cleanToken) return;

    // Debounce duplicate scans within 2s
    const now = Date.now();
    if (lastScannedCodeRef.current.code === cleanToken && now - lastScannedCodeRef.current.time < 2000) {
      return;
    }
    lastScannedCodeRef.current = { code: cleanToken, time: now };

    if (busyRef.current) return;
    busyRef.current = true;
    setMessage(null);

    // Tactile haptic vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(120); } catch { /* ignore */ }
    }

    try {
      const res = await fetch(`/api/staff/search?q=${encodeURIComponent(cleanToken)}`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.registrations) && data.registrations.length > 0) {
        const found = mapRegistration(data.registrations[0]);
        setRegistration(found);
        loadStats();

        // FAST-TRACK AUTO CHECK-IN: If donor is in REGISTERED state and fast-track mode is ON
        if (fastTrackMode && found.status === 'REGISTERED') {
          if (soundEnabled) playAudioChime('success');
          try {
            const checkinRes = await fetch('/api/staff/checkin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ registrationId: found.id, status: 'CHECKED_IN' }),
            });
            const checkinData = await checkinRes.json();
            if (checkinRes.ok && checkinData.success) {
              const nowIso = new Date().toISOString();
              const autoUpdated = { ...found, status: 'CHECKED_IN' as RegistrationStatus, checkedInAt: nowIso };
              setRegistration(autoUpdated);
              addRecentScan(found, 'CHECKED_IN');
              loadStats();
              setMessage({
                type: 'success',
                text: `⚡ [Fast Check-in] เช็คอินสำเร็จทันที: คุณ${found.firstName} ${found.lastName} (${found.registrationCode})`,
              });
              return;
            }
          } catch {
            // fallback to manual review
          }
        }

        // Standard Review Mode
        if (found.status === 'REGISTERED') {
          if (soundEnabled) playAudioChime('success');
          setMessage({
            type: 'info',
            text: `สแกนพบ คุณ${found.firstName} ${found.lastName} (รอเช็คอิน) — กรุณากดยืนยันเช็คอินเข้างาน`,
          });
        } else if (found.status === 'CHECKED_IN') {
          if (soundEnabled) playAudioChime('click');
          setMessage({
            type: 'info',
            text: `สแกนพบ คุณ${found.firstName} ${found.lastName} (เช็คอินแล้ว) — เมื่อบริจาคโลหิตเสร็จสิ้น กดปุ่มรับของที่ระลึกได้`,
          });
        } else if (found.status === 'COMPLETED') {
          if (soundEnabled) playAudioChime('souvenir');
          setMessage({
            type: 'success',
            text: `คุณ${found.firstName} ${found.lastName} ได้บริจาคโลหิตและรับของที่ระลึกเรียบร้อยแล้ว ✨`,
          });
        }
      } else {
        if (soundEnabled) playAudioChime('error');
        setMessage({ type: 'error', text: data.message || data.error || 'ไม่พบข้อมูลการลงทะเบียนจาก QR Code นี้' });
      }
    } catch {
      if (soundEnabled) playAudioChime('error');
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการค้นหาข้อมูลจาก QR Code' });
    } finally {
      busyRef.current = false;
    }
  }, [loadStats, soundEnabled, fastTrackMode, addRecentScan]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
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
    setTorchOn(false);
  }, []);

  const startScanner = useCallback(async (
    targetFacing: 'environment' | 'user' = facingMode, 
    customCameraId?: string,
    targetContainerId?: string
  ) => {
    const containerId = targetContainerId || 'qr-reader-fullscreen';
    setMessage(null);
    try {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
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
      await new Promise((r) => setTimeout(r, 120));

      const element = document.getElementById(containerId);
      if (!element) {
        return;
      }

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      const isFullscreen = containerId === 'qr-reader-fullscreen';
      const qrConfig = {
        fps: 20,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrEdgeSize = Math.floor(minEdge * 0.72);
          return {
            width: Math.max(200, Math.min(qrEdgeSize, 320)),
            height: Math.max(200, Math.min(qrEdgeSize, 320)),
          };
        },
        aspectRatio: isFullscreen ? undefined : 1.0,
      };

      const qrCodeSuccessCallback = (decodedText: string) => {
        handleLookupByToken(decodedText.trim());
      };

      const cameraSelection = customCameraId 
        ? { deviceId: { exact: customCameraId } }
        : { facingMode: targetFacing };

      try {
        await scanner.start(
          cameraSelection,
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
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
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
  }, [facingMode, handleLookupByToken]);

  // Reactive camera startup when mode, camera device, or facing changes
  useEffect(() => {
    let unmounted = false;
    const targetContainer = 'qr-reader-fullscreen';

    const timer = setTimeout(() => {
      if (!unmounted) {
        void startScanner(facingMode, selectedCameraId, targetContainer);
      }
    }, 200);

    return () => {
      unmounted = true;
      clearTimeout(timer);
    };
  }, [facingMode, selectedCameraId, startScanner]);

  // Keyboard wedge listener for USB/Bluetooth physical barcode scanners
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 6) {
          const code = barcodeBuffer.trim();
          barcodeBuffer = '';
          e.preventDefault();
          void handleLookupByToken(code);
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLookupByToken]);

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
        const found = mapRegistration(data.registrations[0]);
        setRegistration(found);
        if (soundEnabled) playAudioChime('success');
        if (data.registrations.length > 1) {
          setMessage({ type: 'info', text: `พบข้อมูล ${data.registrations.length} รายการ แสดงรายการแรกที่ตรงที่สุด` });
        }
      } else {
        if (soundEnabled) playAudioChime('error');
        setMessage({ type: 'error', text: data.message || data.error || 'ไม่พบข้อมูลผู้บริจาคที่ค้นหา' });
      }
    } catch {
      if (soundEnabled) playAudioChime('error');
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
        addRecentScan(registration, targetStatus);
        loadStats();

        let successText = 'ดำเนินการสำเร็จ!';
        if (targetStatus === 'CHECKED_IN') {
          if (soundEnabled) playAudioChime('success');
          successText = `🎟️ ยืนยันเช็คอินเข้างานสำเร็จ! คุณ${registration.firstName} ${registration.lastName}`;
        }
        if (targetStatus === 'COMPLETED') {
          if (soundEnabled) playAudioChime('souvenir');
          successText = `🎁 บันทึกการบริจาคโลหิตสำเร็จ และมอบของที่ระลึกให้ คุณ${registration.firstName} เรียบร้อยแล้ว ✨`;
        }
        if (targetStatus === 'CANCELLED') {
          if (soundEnabled) playAudioChime('error');
          successText = data.promoted
            ? `ยกเลิกรายการ คุณ${registration.firstName} และเลื่อนผู้รอรายถัดไปเข้าคิวแล้ว`
            : `ยกเลิกรายการสำหรับ คุณ${registration.firstName}`;
        }

        setMessage({ type: 'success', text: successText });
      } else {
        if (soundEnabled) playAudioChime('error');
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
      addRecentScan(registration, targetStatus);
      if (soundEnabled) playAudioChime('success');
      setMessage({
        type: 'warning',
        text: 'ออฟไลน์ — บันทึกการกระทำไว้ในเครื่องแล้ว จะซิงค์อัตโนมัติเมื่อกลับมาออนไลน์',
      });
    } finally {
      setActionLoading(false);
    }
  };


  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !scanning) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as MediaTrackConstraintSet],
      });
      setTorchOn(nextTorch);
    } catch {
      setMessage({ type: 'warning', text: 'อุปกรณ์หรือกล้องนี้ไม่รองรับการเปิดไฟฉาย' });
    }
  };

  // Image Upload / Screenshot Scanner
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    const activeContainer = 'qr-reader-fullscreen';
    try {
      const tempScanner = scannerRef.current || new Html5Qrcode(activeContainer);
      const decodedText = await tempScanner.scanFile(file, true);
      if (decodedText) {
        await handleLookupByToken(decodedText.trim());
      } else {
        if (soundEnabled) playAudioChime('error');
        setMessage({ type: 'error', text: 'ไม่พบ QR Code ในรูปภาพที่เลือก กรุณาลองใหม่อีกครั้ง' });
      }
    } catch {
      if (soundEnabled) playAudioChime('error');
      setMessage({ type: 'error', text: 'ไม่สามารถอ่าน QR Code จากรูปภาพนี้ได้ กรุณาตรวจสอบความคมชัด' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-7 space-y-5">
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--burgundy-700)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>MUMT LoveUnit · จุดสแกนหน้างาน</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-[var(--ink)] font-display">สแกน QR ผู้บริจาค</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">สแกนเพื่อเช็คอินและบันทึกผลการบริจาคในขั้นตอนเดียว</p>
          <p className="mt-2 text-xs font-bold text-[var(--muted)]">วันนี้เช็คอินแล้ว {stats.checkedIn} จาก {stats.totalToday} คน · สำเร็จ {stats.completed} คน</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-pressed={soundEnabled}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition-colors cursor-pointer ${soundEnabled ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-[var(--line)] bg-white text-[var(--muted)]'}`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>{soundEnabled ? 'เสียงเปิด' : 'เสียงปิด'}</span>
          </button>
          <button
            type="button"
            onClick={() => setFastTrackMode(!fastTrackMode)}
            aria-pressed={fastTrackMode}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition-colors cursor-pointer ${fastTrackMode ? 'border-amber-600 bg-amber-500 text-white' : 'border-[var(--line)] bg-white text-[var(--ink)] hover:bg-gray-50'}`}
          >
            <Zap className="h-4 w-4" />
            <span>{fastTrackMode ? 'โหมดด่วนเปิด' : 'โหมดตรวจละเอียด'}</span>
          </button>
          <Link href="/staff/walk-in" className="editorial-btn-secondary min-h-11 text-xs flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Walk-in</span>
          </Link>
        </div>
      </header>

      {message && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm font-bold ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : message.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : message.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-blue-200 bg-blue-50 text-blue-900'}`}
        >
          {message.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : message.type === 'error' ? <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          <span className="flex-1">{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} aria-label="ปิดข้อความแจ้งเตือน" className="min-h-11 min-w-11 -my-2 -mr-2 inline-flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer">×</button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[#0d1524] text-white" aria-labelledby="scanner-title">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-300" />
              <h2 id="scanner-title" className="text-sm font-black">กล้องสแกน QR</h2>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${scanning ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-white/60'}`}>
              {scanning ? 'กำลังสแกน' : 'พร้อมเปิดกล้อง'}
            </span>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <div className="relative min-h-[54vh] sm:min-h-[560px]">
            <div id="qr-reader-fullscreen" className="h-full min-h-[54vh] w-full [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover [&_#qr-shaded-region]:!hidden [&_div]:!border-none" />
            {scanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="relative h-64 w-64 rounded-2xl border-2 border-emerald-300/90 sm:h-80 sm:w-80">
                  <span className="absolute -left-1 -top-1 h-8 w-8 border-l-4 border-t-4 border-emerald-300" />
                  <span className="absolute -right-1 -top-1 h-8 w-8 border-r-4 border-t-4 border-emerald-300" />
                  <span className="absolute -bottom-1 -left-1 h-8 w-8 border-b-4 border-l-4 border-emerald-300" />
                  <span className="absolute -bottom-1 -right-1 h-8 w-8 border-b-4 border-r-4 border-emerald-300" />
                  <span className="absolute inset-x-3 top-1/2 h-0.5 bg-emerald-300 shadow-[0_0_14px_#6ee7b7]" />
                  <span className="absolute -bottom-10 inset-x-0 text-center text-xs font-bold text-white">จัด QR ให้อยู่ในกรอบ</span>
                </div>
              </div>
            )}
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d1524] px-6 text-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-emerald-200"><Camera className="h-12 w-12" /></div>
                <div>
                  <p className="text-base font-black">พร้อมสำหรับการสแกน</p>
                  <p className="mt-1 max-w-sm text-sm text-white/65">กดเปิดกล้องเพื่อเริ่ม หรือใช้ช่องค้นหาด้านข้างหากอุปกรณ์ไม่มีกล้อง</p>
                </div>
                <button type="button" onClick={() => startScanner('environment')} className="editorial-btn-primary min-h-11 px-5 text-sm flex items-center gap-2 cursor-pointer">
                  <Camera className="h-4 w-4" /> เปิดกล้องสแกน
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-4 sm:p-5">
            {scanning ? (
              <button type="button" onClick={stopScanner} className="min-h-11 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 cursor-pointer flex items-center gap-2"><Ban className="h-4 w-4" /> ปิดกล้อง</button>
            ) : null}
            <button type="button" onClick={toggleCameraFacing} className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-bold text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"><RotateCcw className="h-4 w-4" /> สลับกล้อง</button>
            <button type="button" onClick={toggleTorch} disabled={!scanning} className={`min-h-11 rounded-xl border px-4 text-xs font-bold cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40 ${torchOn ? 'border-amber-400 bg-amber-400 text-amber-950' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'}`}><Flashlight className="h-4 w-4" /> {torchOn ? 'ไฟฉายเปิด' : 'ไฟฉาย'}</button>
            <button type="button" disabled={uploadingImage} onClick={() => fileInputRef.current?.click()} className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-bold text-white hover:bg-white/10 cursor-pointer flex items-center gap-2 disabled:opacity-40"><UploadCloud className="h-4 w-4" /> {uploadingImage ? 'กำลังอ่าน...' : 'อัปโหลด QR'}</button>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-xs" aria-labelledby="lookup-title">
            <h2 id="lookup-title" className="text-base font-black text-[var(--ink)]">ค้นหาผู้บริจาค</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">ใช้ชื่อ เบอร์โทร หรือรหัสลงทะเบียนแทนการสแกน</p>
            <form onSubmit={handleSearch} className="mt-4 space-y-2.5">
              <label htmlFor="ck-search" className="sr-only">ชื่อ เบอร์โทร หรือรหัสลงทะเบียน</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input id="ck-search" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="เช่น LVU26-0001 หรือ 0812345678" className="editorial-input pl-10" />
              </div>
              <button type="submit" disabled={loading} className="editorial-btn-primary min-h-11 w-full text-sm cursor-pointer disabled:opacity-50">{loading ? 'กำลังค้นหา...' : 'ค้นหา'}</button>
            </form>
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-xs" aria-live="polite">
            {registration ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
                  <div><span className="font-mono text-xs font-bold text-[var(--burgundy-700)]">{registration.registrationCode}</span><h2 className="mt-1 text-xl font-black text-[var(--ink)]">คุณ{registration.firstName} {registration.lastName}</h2></div>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getRegistrationStatusBadge(registration.status).colorClass}`}>{getRegistrationStatusBadge(registration.status).label}</span>
                </div>
                <dl className="grid grid-cols-2 gap-3 rounded-xl bg-[var(--bg)] p-3 text-xs"><div><dt className="text-[var(--muted)]">รอบเวลา</dt><dd className="mt-1 font-bold text-[var(--ink)]">{registration.timeSlotText}</dd></div><div><dt className="text-[var(--muted)]">เบอร์โทร</dt><dd className="mt-1 font-mono font-bold text-[var(--ink)]">{registration.phone}</dd></div></dl>
                {registration.status === 'REGISTERED' && <button type="button" disabled={actionLoading} onClick={() => handleStatusChange('CHECKED_IN')} className="min-h-12 w-full rounded-xl bg-blue-700 px-4 text-sm font-black text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"><UserCheck className="mr-2 inline h-5 w-5" />ยืนยันเช็คอิน</button>}
                {registration.status === 'CHECKED_IN' && <button type="button" disabled={actionLoading} onClick={() => handleStatusChange('COMPLETED')} className="min-h-12 w-full rounded-xl bg-emerald-700 px-4 text-sm font-black text-white hover:bg-emerald-800 cursor-pointer disabled:opacity-50"><Gift className="mr-2 inline h-5 w-5" />บันทึกบริจาคสำเร็จและมอบของ</button>}
                {registration.status === 'COMPLETED' && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-900"><CheckCircle2 className="mr-2 inline h-5 w-5" />ดำเนินการเรียบร้อยแล้ว</div>}
                <button type="button" onClick={() => setRegistration(null)} className="min-h-11 w-full text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer">สแกนคนถัดไป <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center text-center"><div className="rounded-full bg-[var(--rose-100)] p-4 text-[var(--burgundy-700)]"><QrCode className="h-8 w-8" /></div><h2 className="mt-4 text-lg font-black text-[var(--ink)]">รอผลการสแกน</h2><p className="mt-1 max-w-xs text-sm text-[var(--muted)]">เมื่อพบผู้บริจาค ข้อมูลและปุ่มดำเนินการจะแสดงที่นี่</p></div>
            )}
          </section>

          {recentScans.length > 0 && <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-xs"><div className="flex items-center justify-between border-b border-[var(--line)] pb-3"><h2 className="flex items-center gap-2 text-sm font-black text-[var(--ink)]"><History className="h-4 w-4 text-[var(--burgundy-700)]" /> สแกนล่าสุด</h2><span className="text-xs text-[var(--muted)]">{recentScans.length} รายการ</span></div><div className="divide-y divide-[var(--line)]">{recentScans.map((item) => <button type="button" key={item.id} onClick={() => void handleLookupByToken(item.code)} className="flex min-h-12 w-full items-center justify-between gap-3 text-left text-xs cursor-pointer"><span className="min-w-0 truncate font-bold text-[var(--ink)]">{item.name}</span><span className="shrink-0 font-mono text-[var(--muted)]">{item.time}</span></button>)}</div></section>}
        </aside>
      </div>
    </div>
  );

}
