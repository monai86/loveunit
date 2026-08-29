'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  CheckCircle2, 
  UserCheck, 
  Gift, 
  Camera,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  UploadCloud,
  Flashlight,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { formatTimeRange, formatBangkokTime, getRegistrationStatusBadge } from '@/lib/utils/format';
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
  souvenirEligible?: boolean;
  souvenir_eligible?: boolean;
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
  souvenirEligible: boolean;
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
    souvenirEligible: Boolean(r.souvenirEligible ?? r.souvenir_eligible),
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
  const [actionLoading, setActionLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null);

  // Camera & Scanner State
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [selectedCameraId] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fastTrackMode, setFastTrackMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const busyRef = useRef(false);
  const lastScannedCodeRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

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
    setSearching(true);
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
              setRegistration({ ...found, status: 'CHECKED_IN' as RegistrationStatus, checkedInAt: new Date().toISOString() });
              setMessage({ type: 'success', text: `เช็คอินสำเร็จ: คุณ${found.firstName} ${found.lastName}` });
              return;
            }
          } catch {
            // Fall back to manual confirmation when the connection is unavailable.
          }
        }
        if (found.status === 'REGISTERED') {
          if (soundEnabled) playAudioChime('success');
          setMessage({
            type: 'info',
            text: `สแกนพบ คุณ${found.firstName} ${found.lastName} (รอเช็คอิน) — กรุณากดยืนยันเช็คอินเข้างาน`,
          });
        } else if (found.status === 'CHECKED_IN') {
          if (soundEnabled) playAudioChime(found.souvenirEligible ? 'souvenir' : 'click');
          setMessage({
            type: 'info',
            text: found.souvenirEligible
              ? `สแกนพบ คุณ${found.firstName} ${found.lastName} (เช็คอินแล้ว) — ได้รับของที่ระลึก 🎁`
              : `สแกนพบ คุณ${found.firstName} ${found.lastName} (เช็คอินแล้ว)`,
          });
        } else if (found.status === 'COMPLETED') {
          if (soundEnabled) playAudioChime('souvenir');
          setMessage({
            type: 'success',
            text: found.souvenirEligible
              ? `คุณ${found.firstName} ${found.lastName} ได้บริจาคโลหิตและรับของที่ระลึกเรียบร้อยแล้ว ✨`
              : `คุณ${found.firstName} ${found.lastName} ได้บริจาคโลหิตเรียบร้อยแล้ว ✨`,
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
      setSearching(false);
    }
  }, [fastTrackMode, soundEnabled]);

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

  useEffect(() => () => { void stopScanner(); }, [stopScanner]);

  // The scanner is a dedicated camera workspace, not a scrollable portal page.
  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, []);

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

        let successText = 'ดำเนินการสำเร็จ!';
        if (targetStatus === 'CHECKED_IN') {
          if (soundEnabled) playAudioChime('success');
          successText = `🎟️ ยืนยันเช็คอินเข้างานสำเร็จ! คุณ${registration.firstName} ${registration.lastName}`;
        }
        if (targetStatus === 'COMPLETED') {
          if (soundEnabled) playAudioChime('souvenir');
          successText = registration.souvenirEligible
            ? `🎁 บันทึกการบริจาคโลหิตสำเร็จ และมอบของที่ระลึกให้ คุณ${registration.firstName} เรียบร้อยแล้ว ✨`
            : `✅ บันทึกการบริจาคโลหิตสำเร็จ คุณ${registration.firstName} เรียบร้อยแล้ว ✨`;
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
    <main data-testid="fullscreen-scanner" className="fixed inset-0 isolate h-[100dvh] w-screen overflow-hidden bg-[#070d18] text-white" aria-label="กล้องสแกน QR ผู้บริจาค">
      <h1 className="sr-only">กล้องสแกน QR ผู้บริจาค</h1>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <div id="qr-reader-fullscreen" className="absolute inset-0 h-full w-full bg-[#0d1524] [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover [&_#qr-shaded-region]:!hidden [&_div]:!border-none" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65" aria-hidden="true" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <Link href="/staff/overview" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-[#07111f]/80 px-4 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
          <ArrowRight className="h-5 w-5 rotate-180" />กลับ
        </Link>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-2 text-xs font-black shadow-lg backdrop-blur-sm ${scanning ? 'bg-emerald-500/90 text-emerald-950' : 'bg-black/45 text-white/90'}`}>{scanning ? 'กำลังสแกน' : 'กำลังเปิดกล้อง'}</span>
          <button type="button" onClick={() => setSoundEnabled(!soundEnabled)} aria-pressed={soundEnabled} aria-label={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 bg-[#07111f]/80 text-white shadow-lg backdrop-blur-sm">
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Viewfinder with Animated Laser Scanner */}
      {scanning && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-8" aria-hidden="true">
          <div className="relative aspect-square w-[min(72vw,22rem)] rounded-[2rem] border-2 border-emerald-300/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.22)] overflow-hidden">
            <span className="absolute -left-1 -top-1 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-emerald-300 z-10" />
            <span className="absolute -right-1 -top-1 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-emerald-300 z-10" />
            <span className="absolute -bottom-1 -left-1 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-emerald-300 z-10" />
            <span className="absolute -bottom-1 -right-1 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-emerald-300 z-10" />
            
            {/* Pulsing Scan Beam */}
            <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_16px_#6ee7b7] animate-pulse top-1/2" />
            <div className="absolute inset-0 bg-emerald-500/5" />
          </div>
        </div>
      )}

      {!scanning && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="rounded-full bg-white/10 p-5 text-emerald-200 backdrop-blur-sm"><Camera className="h-10 w-10" /></div>
          <div><p className="text-xl font-black">พร้อมเปิดกล้อง</p><p className="mt-1 text-sm text-white/75">อนุญาตการเข้าถึงกล้องเพื่อเริ่มสแกน QR</p></div>
          <button type="button" onClick={() => void startScanner('environment')} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-black text-emerald-950 shadow-lg"><Camera className="h-5 w-5" />เปิดกล้อง</button>
        </div>
      )}

      {/* Searching / Processing Overlay (Instant Visual Feedback) */}
      {searching && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-6 transition-all">
          <div className="flex flex-col items-center rounded-3xl bg-[#07111f]/95 border border-emerald-500/30 p-6 text-center shadow-2xl max-w-xs w-full">
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center">
              <div className="absolute h-14 w-14 animate-ping rounded-full bg-emerald-400/20" />
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </div>
            <p className="text-base font-black text-white">⚡ กำลังตรวจสอบ QR Code...</p>
            <p className="mt-1 text-xs font-medium text-emerald-200/80">ระบบกำลังประมวลผลข้อมูล</p>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto flex max-w-md items-center justify-center gap-3">
          <button type="button" onClick={toggleCameraFacing} aria-label="สลับกล้อง" className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full bg-[#07111f]/85 text-white shadow-lg backdrop-blur-sm"><RotateCcw className="h-5 w-5" /></button>
          <button type="button" onClick={toggleTorch} disabled={!scanning} aria-label={torchOn ? 'ปิดไฟฉาย' : 'เปิดไฟฉาย'} className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-full shadow-lg backdrop-blur-sm disabled:opacity-40 ${torchOn ? 'bg-amber-300 text-amber-950' : 'bg-[#07111f]/85 text-white'}`}><Flashlight className="h-5 w-5" /></button>
          <button type="button" onClick={() => setFastTrackMode((enabled) => !enabled)} aria-pressed={fastTrackMode} aria-label={fastTrackMode ? 'ปิดโหมดเช็คอินด่วน' : 'เปิดโหมดเช็คอินด่วน'} className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-full shadow-lg backdrop-blur-sm ${fastTrackMode ? 'bg-emerald-300 text-emerald-950' : 'bg-[#07111f]/85 text-white'}`}><Zap className="h-5 w-5" /></button>
          <button type="button" disabled={uploadingImage} onClick={() => fileInputRef.current?.click()} aria-label="เลือกภาพ QR" className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full bg-[#07111f]/85 text-white shadow-lg backdrop-blur-sm disabled:opacity-40"><UploadCloud className="h-5 w-5" /></button>
        </div>
      </div>

      {message && (
        <div role="status" className={`absolute inset-x-4 bottom-24 z-30 mx-auto max-w-md rounded-2xl border px-4 py-3 text-center text-sm font-bold shadow-xl ${message.type === 'error' ? 'border-red-300 bg-red-50 text-red-800' : message.type === 'warning' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}>
          {message.text}
        </div>
      )}

      {/* Registration Result Card */}
      {registration && (
        <section aria-live="polite" className="absolute inset-x-4 bottom-20 z-30 mx-auto max-w-md rounded-3xl bg-white p-5 text-[var(--ink)] shadow-2xl border border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-xs font-bold text-[var(--burgundy-700)] bg-[var(--burgundy-50)] px-2 py-0.5 rounded">
                {registration.registrationCode}
              </span>
              <h2 className="mt-1.5 text-lg font-black text-gray-900">
                คุณ{registration.firstName} {registration.lastName}
              </h2>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold shrink-0 ${getRegistrationStatusBadge(registration.status).colorClass}`}>
              {getRegistrationStatusBadge(registration.status).label}
            </span>
          </div>

          {/* Time and Check-in Info */}
          <div className="mt-3.5 space-y-1.5 rounded-2xl bg-gray-50 p-3 text-xs text-gray-700 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">🕒 รอบที่ลงทะเบียน:</span>
              <span className="font-bold text-gray-900">{registration.timeSlotText}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">📍 เวลาเช็คอิน:</span>
              <span className={`font-bold ${registration.checkedInAt ? 'text-blue-700' : 'text-gray-500'}`}>
                {registration.checkedInAt
                  ? formatBangkokTime(registration.checkedInAt)
                  : registration.status === 'COMPLETED'
                  ? 'เช็คอินแล้ว'
                  : 'ยังไม่ได้เช็คอิน'}
              </span>
            </div>
          </div>

          {/* Souvenir Badge: ONLY when eligible, NO rejection text when not eligible */}
          {registration.souvenirEligible && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-emerald-900 shadow-sm">
              <Gift className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-black tracking-wide">ได้รับของที่ระลึก 🎁</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            {registration.status === 'REGISTERED' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleStatusChange('CHECKED_IN')}
                className="min-h-12 w-full rounded-xl bg-blue-700 hover:bg-blue-800 px-4 text-sm font-black text-white shadow-md transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserCheck className="h-5 w-5" />}
                ยืนยันเช็คอิน
              </button>
            )}

            {registration.status === 'CHECKED_IN' && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => void handleStatusChange('COMPLETED')}
                className={`min-h-12 w-full rounded-xl px-4 text-sm font-black text-white shadow-md transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${
                  registration.souvenirEligible
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : registration.souvenirEligible ? (
                  <Gift className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                {registration.souvenirEligible
                  ? 'บันทึกบริจาคสำเร็จ & มอบของที่ระลึก'
                  : 'บันทึกบริจาคสำเร็จ'}
              </button>
            )}

            {registration.status === 'COMPLETED' && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-sm font-bold text-emerald-900 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>
                  {registration.souvenirEligible
                    ? 'บริจาคสำเร็จและมอบของที่ระลึกแล้ว ✨'
                    : 'บริจาคโลหิตสำเร็จเรียบร้อยแล้ว ✨'}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setRegistration(null)}
              className="min-h-10 w-full text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition"
            >
              สแกนคนถัดไป
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
