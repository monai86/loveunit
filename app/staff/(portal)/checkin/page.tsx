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
  Volume2,
  VolumeX,
  Zap,
  UploadCloud,
  History,
  Flashlight,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  X,
  ArrowRight
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
  const [fullscreenScanner, setFullscreenScanner] = useState(false); // Mobile Payment-App Style Fullscreen
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
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
    setTorchOn(false);
  }, []);

  // Fetch available cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices.map((d) => ({ id: d.id, label: d.label || `Camera ${d.id.slice(0, 4)}` })));
          const rear = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment'));
          if (rear) setSelectedCameraId(rear.id);
          else setSelectedCameraId(devices[0].id);
        }
      })
      .catch(() => {
        // Ignored if camera permission not granted yet
      });
  }, []);

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

  const startScanner = async (targetFacing: 'environment' | 'user' = facingMode, customCameraId?: string) => {
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
      await new Promise((r) => setTimeout(r, 120));

      const element = document.getElementById('qr-reader-region');
      if (!element) {
        throw new Error('Scanner container element not found');
      }

      const scanner = new Html5Qrcode('qr-reader-region');
      scannerRef.current = scanner;

      const qrConfig = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
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

  const handleCameraChange = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (scanning) {
      await startScanner(facingMode, deviceId);
    }
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

    try {
      const tempScanner = scannerRef.current || new Html5Qrcode('qr-reader-region');
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

  const openFullscreenScanner = async () => {
    setFullscreenScanner(true);
    await startScanner('environment');
  };

  const closeFullscreenScanner = async () => {
    setFullscreenScanner(false);
    await stopScanner();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Top Header & Quick Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-black text-[var(--burgundy-700)] uppercase tracking-wider">
              STAFF CHECK-IN & SOUVENIR DESK
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] text-[10px] font-black border border-[var(--line)]">
              ห้องประชุม 217
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
            ระบบเช็คอินและมอบของที่ระลึก
          </h1>
          <p className="text-xs text-[var(--muted)]">
            สแกน QR Code ตรวจสอบผู้มาจริง และบันทึกของที่ระลึกสุดพิเศษเมื่อบริจาคโลหิตสำเร็จ
          </p>
        </div>

        {/* Action Controls & Pay-App Scanner Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Big Pay-App Style Scanner Button */}
          <button
            type="button"
            onClick={openFullscreenScanner}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-95"
          >
            <Maximize2 className="h-4 w-4 text-emerald-200" />
            <span>📱 โหมดสแกนแบบแอปจ่ายเงิน (Scan Pay)</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'ปิดเสียง Beep' : 'เปิดเสียง Beep'}
            className={`p-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              soundEnabled 
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-gray-100 border-gray-200 text-gray-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'เสียงเปิด' : 'เสียงปิด'}</span>
          </button>

          {/* Fast-Track Auto Check-in Toggle */}
          <button
            type="button"
            onClick={() => setFastTrackMode(!fastTrackMode)}
            title="สลับโหมดเช็คอินด่วนอัตโนมัติ"
            className={`px-3 py-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              fastTrackMode 
                ? 'bg-amber-500 border-amber-600 text-white shadow-xs' 
                : 'bg-white border-[var(--line)] text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Zap className={`h-4 w-4 ${fastTrackMode ? 'text-white' : 'text-amber-500'}`} />
            <span>{fastTrackMode ? '⚡ โหมดด่วน (ON)' : 'โหมดตรวจละเอียด'}</span>
          </button>

          <Link
            href="/staff/walk-in"
            className="editorial-btn-secondary text-xs flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Walk-in</span>
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
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100">
            <User className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">
              2. มาเช็คอินเข้างานแล้ว
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-sky-900">
                {stats.checkedIn}
              </span>
              <span className="text-xs text-sky-600 font-bold">คน</span>
              {stats.totalToday > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                  {Math.round((stats.checkedIn / stats.totalToday) * 100)}%
                </span>
              )}
            </div>
            <span className="text-[11px] text-sky-600 block">มาจริงที่งาน (% Turnout)</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs flex items-center justify-between bg-emerald-50/40">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              3. บริจาคสำเร็จ & รับของที่ระลึก
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-950">
                {stats.completed}
              </span>
              <span className="text-xs text-emerald-700 font-bold">คน / ยูนิต</span>
            </div>
            <span className="text-[11px] text-emerald-700 block">
              สำเร็จ {stats.completed} ยูนิต · มอบของที่ระลึกแล้ว
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Gift className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold flex items-start gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : message.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          {message.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
          {message.type === 'error' && <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
          {message.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />}
          {message.type === 'info' && <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />}
          <div className="flex-1">{message.text}</div>
          <button 
            type="button" 
            onClick={() => setMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Left Scanner & Search, Right Donor Review Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive QR Scanner & Practical Tools (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="editorial-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-[var(--burgundy-700)]" />
                <h2 className="text-base font-black text-[var(--ink)]">
                  เครื่องสแกน QR Code หน้าโต๊ะ
                </h2>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scanning ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                {scanning ? 'CAMERA ACTIVE' : 'STANDBY'}
              </span>
            </div>

            {/* Hidden Input for Image File Upload */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload} 
            />

            {/* Scanner Viewfinder Box */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 shadow-inner flex items-center justify-center">
              
              {/* html5-qrcode DOM Region */}
              <div
                id="qr-reader-region"
                className="w-full h-full object-cover"
                style={{ minHeight: '280px' }}
              />

              {/* Laser Scanning Animation and Reticle Corners when camera is ON */}
              {scanning && !fullscreenScanner && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative w-64 h-64 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.3)] flex flex-col justify-between p-2">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />
                    <div className="text-center text-[10px] font-mono font-bold text-emerald-300 bg-black/60 py-1 px-2 rounded-full self-center">
                      จัดวาง QR Code ให้อยู่ในกรอบ
                    </div>
                  </div>
                </div>
              )}

              {/* Standby Placeholder */}
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-3 bg-gray-900">
                  <div className="p-4 rounded-3xl bg-gray-800 text-gray-300 border border-gray-700">
                    <Camera className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-200">กล้องพร้อมใช้งาน</p>
                    <p className="text-xs text-gray-400 max-w-xs">
                      กดปุ่ม &ldquo;เปิดกล้องสแกน&rdquo; หรือกด &ldquo;สแกนแบบแอปจ่ายเงิน&rdquo; ด้านบน
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Practical Camera & Image Controls */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {!scanning ? (
                  <button
                    type="button"
                    onClick={() => startScanner('environment')}
                    className="flex-1 editorial-btn-primary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Camera className="h-4 w-4" />
                    <span>เปิดกล้องสแกน QR</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={stopScanner}
                      className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                    >
                      <Ban className="h-4 w-4" />
                      <span>ปิดกล้อง</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      title="สลับกล้องหน้า/หลัง"
                      className="py-3 px-4 rounded-xl border border-[var(--line)] bg-white hover:bg-gray-50 text-[var(--ink)] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden sm:inline">สลับกล้อง</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleTorch}
                      title="เปิด/ปิดไฟฉาย"
                      className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        torchOn ? 'bg-amber-400 text-amber-950 border-amber-500' : 'bg-white border-[var(--line)] text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Flashlight className="h-4 w-4" />
                      <span className="hidden sm:inline">{torchOn ? 'ไฟฉาย ON' : 'ไฟฉาย'}</span>
                    </button>
                  </>
                )}

                {/* Upload Image Button */}
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  title="อัปโหลดภาพ QR Code จากอัลบั้มหรือไฟล์"
                  className="py-3 px-4 rounded-xl border border-[var(--line)] bg-white hover:bg-gray-50 text-[var(--ink)] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <UploadCloud className="h-4 w-4 text-blue-600" />
                  <span>{uploadingImage ? 'กำลังอ่าน...' : 'เลือกรูป QR'}</span>
                </button>
              </div>

              {/* Camera Lens Selector if multiple cameras exist */}
              {cameras.length > 1 && (
                <div className="flex items-center gap-2 pt-1">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <select
                    value={selectedCameraId}
                    onChange={(e) => handleCameraChange(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-[var(--line)] bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[var(--burgundy-700)] cursor-pointer"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Hardware Scanner & Keyboard Wedge Helper */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-[11px] text-gray-600 flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 font-mono font-bold text-[10px]">
                USB / 2D GUN
              </span>
              <span>รองรับเครื่องยิงบาร์โค้ด USB/Bluetooth ยิงรหัสได้ทันทีโดยไม่ต้องแตะหน้าจอ</span>
            </div>

            {/* Manual Search Fallback */}
            <form onSubmit={handleSearch} className="space-y-3 pt-3 border-t border-[var(--line)]">
              <label htmlFor="ck-search" className="block text-xs font-bold text-[var(--ink)]">
                ค้นหาด้วยชื่อ / เบอร์โทร / รหัสลงทะเบียน
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="ck-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="เช่น MBD26-XXXX หรือ 0812345678"
                    className="editorial-input w-full pl-9 text-xs"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="editorial-btn-primary px-4 py-2 text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'ค้นหา...' : 'ค้นหา'}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Scans History Card (5 items) */}
          {recentScans.length > 0 && (
            <div className="editorial-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[var(--burgundy-700)]" />
                  <span className="text-xs font-bold text-[var(--ink)]">ประวัติการสแกนล่าสุด (5 ท่าน)</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400">{recentScans.length} รายการ</span>
              </div>
              <div className="divide-y divide-gray-100">
                {recentScans.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleLookupByToken(item.code)}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-gray-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--ink)] truncate">{item.name}</span>
                        <span className="font-mono text-[10px] text-gray-400">{item.code}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status === 'COMPLETED' ? 'รับของขวัญแล้ว 🎁' : 'เช็คอินแล้ว'}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Donor Confirmation Card & Action Workflow (7 cols) */}
        <div className="lg:col-span-7">
          {registration ? (
            <div className="editorial-card p-6 space-y-6 animate-in fade-in-50 duration-300">
              
              {/* Card Header & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[var(--burgundy-700)] bg-[var(--rose-100)] px-2.5 py-0.5 rounded-md border border-[var(--line)]">
                      {registration.registrationCode}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      {getParticipantTypeLabel(registration.participantType)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[var(--ink)]">
                    คุณ{registration.firstName} {registration.lastName}
                  </h2>
                </div>

                <div className="shrink-0">
                  {(() => {
                    const badge = getRegistrationStatusBadge(registration.status);
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${badge.colorClass}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[var(--burgundy-700)]" />
                    รอบเวลาที่ลงทะเบียน
                  </span>
                  <p className="text-sm font-black text-[var(--ink)] font-mono">
                    {registration.timeSlotText}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[var(--burgundy-700)]" />
                    เบอร์โทรศัพท์ติดต่อ
                  </span>
                  <p className="text-sm font-black text-[var(--ink)] font-mono">
                    {registration.phone}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[var(--burgundy-700)]" />
                    สังกัด / คณะ / หน่วยงาน
                  </span>
                  <p className="text-sm font-bold text-[var(--ink)]">
                    {registration.facultyName}
                  </p>
                </div>
              </div>

              {/* Status Guide & Instructions */}
              <div className="p-4 rounded-2xl border space-y-2 bg-blue-50/40 border-blue-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--ink)] flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-700" />
                    สถานะการเข้าร่วมงานและการรับของที่ระลึก
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
                  
                  {/* Step 1 Button: Check-in */}
                  {registration.status === 'REGISTERED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('CHECKED_IN')}
                      className="flex-1 py-3.5 px-5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="h-5 w-5" />
                      <span>1. ยืนยันการเช็คอินเข้างาน (CHECK-IN)</span>
                    </button>
                  )}

                  {/* Step 2 Button: Completed & Souvenir */}
                  {registration.status === 'CHECKED_IN' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('COMPLETED')}
                      className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 animate-pulse"
                    >
                      <Gift className="h-5 w-5" />
                      <span>2. ยืนยันบริจาคสำเร็จ & มอบของที่ระลึก (COMPLETED)</span>
                    </button>
                  )}

                  {/* Completed State Display */}
                  {registration.status === 'COMPLETED' && (
                    <div className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-sm flex items-center justify-center gap-2 border border-emerald-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                      <span>เสร็จสิ้นกระบวนการและมอบของที่ระลึกแล้ว</span>
                    </div>
                  )}

                  {/* Cancel / Failed Screening Button */}
                  {registration.status !== 'COMPLETED' && registration.status !== 'CANCELLED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        if (confirm(`ยืนยันการยกเลิก / ไม่ผ่านการคัดกรอง สำหรับคุณ ${registration.firstName}?`)) {
                          handleStatusChange('CANCELLED');
                        }
                      }}
                      className="py-3.5 px-4 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Ban className="h-4 w-4 text-red-600" />
                      <span>ยกเลิก / ไม่ผ่านคัดกรอง</span>
                    </button>
                  )}
                </div>

                {/* Reset / Scan Next Person */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistration(null);
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-[var(--ink)] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>เคลียร์หน้าจอเพื่อสแกนคนถัดไป</span>
                  </button>

                  <span className="text-[11px] text-gray-400 font-mono">
                    ID: {registration.id.slice(0, 8)}...
                  </span>
                </div>
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="editorial-card p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[420px]">
              <div className="p-4 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)]">
                <QrCode className="h-12 w-12 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-lg font-black text-[var(--ink)]">
                  พร้อมสำหรับการสแกน
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  ส่องกล้องไปที่ QR Code ของผู้บริจาค หรือใช้ปุ่ม &ldquo;โหมดสแกนแบบแอปจ่ายเงิน&rdquo; เพื่อสแกนอย่างรวดเร็วและต่อเนื่อง
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 📱 FULLSCREEN MOBILE PAYMENT-APP STYLE SCANNER OVERLAY (PROMPTPAY / SCAN-PAY STYLE) */}
      {/* ========================================================================= */}
      {fullscreenScanner && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in-100 duration-200">
          
          {/* Top Floating Glassmorphic Header */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            
            {/* Close / Back Button */}
            <button
              type="button"
              onClick={closeFullscreenScanner}
              className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 border border-white/20 transition-all cursor-pointer shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title / Badge */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono font-black text-emerald-400 tracking-wider uppercase">
                MUMT SCAN & CHECK-IN
              </span>
              <span className="text-[10px] text-white/70">
                {fastTrackMode ? '⚡ โหมดเช็คอินด่วน' : 'โหมดตรวจละเอียด'}
              </span>
            </div>

            {/* Quick Action Toggles */}
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-lg ${
                  soundEnabled ? 'bg-blue-600/80 border-blue-400 text-white' : 'bg-black/50 border-white/20 text-white/60'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>

              {/* Torch Toggle */}
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-3 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-lg ${
                  torchOn ? 'bg-amber-400 border-amber-300 text-amber-950' : 'bg-black/50 border-white/20 text-white'
                }`}
              >
                <Flashlight className="h-5 w-5" />
              </button>

              {/* Camera Switch Toggle */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 border border-white/20 transition-all cursor-pointer shadow-lg"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Center Immersive Viewfinder Box */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            
            {/* Viewfinder Target Frame (Payment App Scanner Style) */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl border-2 border-emerald-400/90 shadow-[0_0_50px_rgba(52,211,153,0.4)] flex flex-col justify-between p-3 pointer-events-none z-10">
              {/* 4 Glowing Corner L-Brackets */}
              <div className="absolute -top-1.5 -left-1.5 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-[0_0_10px_#34d399]" />
              <div className="absolute -top-1.5 -right-1.5 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-[0_0_10px_#34d399]" />
              <div className="absolute -bottom-1.5 -left-1.5 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-[0_0_10px_#34d399]" />
              <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl shadow-[0_0_10px_#34d399]" />

              {/* Laser Scanning Line */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_#34d399] animate-bounce" />

              <div className="text-center text-xs font-bold text-white bg-black/60 backdrop-blur-md py-1.5 px-4 rounded-full self-center border border-white/20">
                ส่อง QR Code ในกรอบ
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="absolute bottom-28 inset-x-0 text-center text-white/80 text-xs z-10 font-medium px-4">
              สแกน QR Code จากหน้าจอมือถือหรือบัตรลงทะเบียนของผู้บริจาค
            </div>
          </div>

          {/* Slide-Up Bottom Action Drawer (Like Payment Apps Confirmation Sheet) */}
          {registration && (
            <div className="absolute bottom-0 inset-x-0 z-30 bg-white rounded-t-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
              
              {/* Drawer Drag Bar */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />

              {/* Header Info & Status */}
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <span className="font-mono font-black text-xs text-[var(--burgundy-700)] bg-[var(--rose-100)] px-2 py-0.5 rounded border border-[var(--line)]">
                    {registration.registrationCode}
                  </span>
                  <h3 className="text-xl font-black text-[var(--ink)] mt-1">
                    คุณ{registration.firstName} {registration.lastName}
                  </h3>
                </div>
                <div>
                  {(() => {
                    const badge = getRegistrationStatusBadge(registration.status);
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${badge.colorClass}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Details Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px]">รอบเวลา</span>
                  <span className="font-black text-gray-800 font-mono">{registration.timeSlotText}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px]">เบอร์โทร</span>
                  <span className="font-black text-gray-800 font-mono">{registration.phone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {registration.status === 'REGISTERED' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('CHECKED_IN')}
                    className="w-full py-4 px-5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="h-5 w-5" />
                    <span>ยืนยันเช็คอินเข้างาน (CHECK-IN)</span>
                  </button>
                )}

                {registration.status === 'CHECKED_IN' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('COMPLETED')}
                    className="w-full py-4 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 animate-pulse"
                  >
                    <Gift className="h-5 w-5" />
                    <span>บริจาคสำเร็จ & มอบของที่ระลึก (COMPLETED)</span>
                  </button>
                )}

                {registration.status === 'COMPLETED' && (
                  <div className="w-full py-3.5 px-4 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-sm flex items-center justify-center gap-2 border border-emerald-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                    <span>🎉 มอบของที่ระลึกเรียบร้อยแล้ว</span>
                  </div>
                )}

                {/* Dismiss & Scan Next */}
                <button
                  type="button"
                  onClick={() => {
                    setRegistration(null);
                  }}
                  className="w-full py-3 text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>สแกนคนถัดไป</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
