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
  ArrowLeft,
  Loader2,
  X,
  AlertCircle,
  AlertTriangle
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
    facultyName: r.faculty || 'บุคคลทั่วไป',
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

  // Auto-dismiss toast messages after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
      try { navigator.vibrate(80); } catch { /* ignore */ }
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
            // Fall back to manual confirmation when connection is unavailable
          }
        }

        if (found.status === 'REGISTERED') {
          if (soundEnabled) playAudioChime('success');
        } else if (found.status === 'CHECKED_IN') {
          if (soundEnabled) playAudioChime(found.souvenirEligible ? 'souvenir' : 'click');
        } else if (found.status === 'COMPLETED') {
          if (soundEnabled) playAudioChime('souvenir');
        }
      } else {
        if (soundEnabled) playAudioChime('error');
        setMessage({ type: 'error', text: data.message || data.error || 'ไม่พบข้อมูลการลงทะเบียนจาก QR Code นี้' });
      }
    } catch {
      if (soundEnabled) playAudioChime('error');
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง' });
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
        setMessage({ type: 'error', text: 'เบราว์เซอร์ไม่อนุญาตให้เข้าถึงกล้อง กรุณากดอนุญาตสิทธิ์การใช้กล้อง (Camera Permission)' });
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('no camera')) {
        setMessage({ type: 'error', text: 'ไม่พบอุปกรณ์กล้องบนเครื่องนี้ กรุณาใช้การอัปโหลดภาพ QR แทน' });
      } else {
        setMessage({ type: 'error', text: 'ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบการอนุญาตสิทธิ์กล้อง' });
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

        if (targetStatus === 'CHECKED_IN') {
          if (soundEnabled) playAudioChime('success');
        }
        if (targetStatus === 'COMPLETED') {
          if (soundEnabled) playAudioChime('souvenir');
        }
        if (targetStatus === 'CANCELLED') {
          if (soundEnabled) playAudioChime('error');
          setMessage({
            type: 'info',
            text: data.promoted
              ? `ยกเลิกรายการ คุณ${registration.firstName} และเลื่อนผู้รอรายถัดไปเข้าคิวแล้ว`
              : `ยกเลิกรายการสำหรับ คุณ${registration.firstName}`,
          });
        }
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
        text: 'ออฟไลน์ — บันทึกในเครื่องแล้ว จะซิงค์อัตโนมัติเมื่อต่ออินเทอร์เน็ต',
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
      setMessage({ type: 'warning', text: 'อุปกรณ์นี้ไม่รองรับการเปิดไฟฉาย' });
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
        setMessage({ type: 'error', text: 'ไม่พบ QR Code ในรูปภาพที่เลือก' });
      }
    } catch {
      if (soundEnabled) playAudioChime('error');
      setMessage({ type: 'error', text: 'ไม่สามารถอ่าน QR Code จากรูปภาพนี้ได้' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <main 
      data-testid="fullscreen-scanner" 
      className="fixed inset-0 isolate h-[100dvh] w-screen overflow-hidden bg-black text-white select-none" 
      aria-label="กล้องสแกน QR ผู้บริจาค"
    >
      <h1 className="sr-only">กล้องสแกน QR ผู้บริจาค</h1>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* Video Viewport */}
      <div 
        id="qr-reader-fullscreen" 
        className="absolute inset-0 h-full w-full bg-[#090d16] [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover [&_#qr-shaded-region]:!hidden [&_div]:!border-none" 
      />
      
      {/* Cinematic Ambient Dark Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/70" aria-hidden="true" />

      {/* Minimalist Top Control Bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <Link 
          href="/staff/overview" 
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 text-xs font-semibold text-white/90 shadow-lg backdrop-blur-md transition active:scale-95 hover:bg-black/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ภาพรวม</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Live Status Capsule */}
          <div className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              {scanning && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${scanning ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </span>
            <span className="tracking-wide">{scanning ? 'พร้อมสแกน' : 'กำลังเปิดกล้อง'}</span>
          </div>

          {/* Quick Sound Toggle */}
          <button 
            type="button" 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            aria-pressed={soundEnabled} 
            aria-label={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'} 
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 shadow-lg backdrop-blur-md transition active:scale-95 ${
              soundEnabled ? 'bg-black/40 text-white hover:bg-black/60' : 'bg-black/60 text-white/40'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Sleek Apple-style Viewfinder Reticle */}
      {scanning && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-8" aria-hidden="true">
          <div className="relative aspect-square w-[min(70vw,18.5rem)]">
            
            {/* 4 Precision Corner Guides */}
            <span className="absolute -left-0.5 -top-0.5 h-8 w-8 rounded-tl-2xl border-l-[3px] border-t-[3px] border-white/90" />
            <span className="absolute -right-0.5 -top-0.5 h-8 w-8 rounded-tr-2xl border-r-[3px] border-t-[3px] border-white/90" />
            <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-2xl border-b-[3px] border-l-[3px] border-white/90" />
            <span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-2xl border-b-[3px] border-r-[3px] border-white/90" />
            
            {/* Ultra-subtle Hairline Laser Shimmer */}
            <div className="absolute inset-x-3 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)] opacity-70 animate-pulse top-1/2" />
          </div>

          <p className="mt-5 text-center text-xs font-medium text-white/70 tracking-wide drop-shadow-md">
            วาง QR Code ให้อยู่ในกรอบเพื่อสแกน
          </p>
        </div>
      )}

      {/* Idle State when Camera is not started */}
      {!scanning && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur-md shadow-2xl">
            <Camera className="h-10 w-10 mx-auto text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">กล้องพร้อมสแกน QR Code</p>
            <p className="mt-1 text-xs text-white/60">อนุญาตการเข้าถึงกล้องเพื่อเริ่มสแกน</p>
          </div>
          <button 
            type="button" 
            onClick={() => void startScanner('environment')} 
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 text-xs font-bold text-slate-950 shadow-xl transition active:scale-95 hover:bg-slate-100"
          >
            <Camera className="h-4 w-4" />
            <span>เปิดกล้องสแกนเนอร์</span>
          </button>
        </div>
      )}

      {/* Non-intrusive Floating Loading Capsule (Ultra-sleek top pill) */}
      {searching && (
        <div className="pointer-events-none absolute top-16 inset-x-0 z-30 flex justify-center px-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-slate-950/85 px-4 py-2 text-white shadow-2xl backdrop-blur-xl">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            <span className="text-xs font-medium tracking-wide">กำลังอ่านข้อมูล QR Code...</span>
          </div>
        </div>
      )}

      {/* Floating Top Notification Toast */}
      {message && !registration && (
        <div className="pointer-events-none absolute top-16 inset-x-4 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`flex items-center gap-2.5 rounded-2xl border p-3.5 text-xs font-semibold shadow-2xl backdrop-blur-xl ${
            message.type === 'error' ? 'border-red-500/30 bg-red-950/90 text-red-200' :
            message.type === 'warning' ? 'border-amber-500/30 bg-amber-950/90 text-amber-200' :
            'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
          }`}>
            {message.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0 text-red-400" /> :
             message.type === 'warning' ? <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" /> :
             <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
            <span className="flex-1 leading-snug">{message.text}</span>
          </div>
        </div>
      )}

      {/* Modern Floating Bottom Camera Toolbar */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto flex max-w-xs items-center justify-around rounded-full border border-white/15 bg-black/50 px-4 py-2 shadow-2xl backdrop-blur-xl">
          <button 
            type="button" 
            onClick={toggleCameraFacing} 
            aria-label="สลับกล้องหน้า/หลัง" 
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition active:scale-90 hover:text-white"
            title="สลับกล้อง"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button 
            type="button" 
            onClick={toggleTorch} 
            disabled={!scanning} 
            aria-label={torchOn ? 'ปิดไฟฉาย' : 'เปิดไฟฉาย'} 
            className={`flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-30 ${
              torchOn ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/40' : 'text-white/80 hover:text-white'
            }`}
            title="เปิด/ปิดไฟฉาย"
          >
            <Flashlight className="h-4 w-4" />
          </button>

          <button 
            type="button" 
            onClick={() => setFastTrackMode((enabled) => !enabled)} 
            aria-pressed={fastTrackMode} 
            aria-label={fastTrackMode ? 'ปิดโหมดเช็คอินด่วน' : 'เปิดโหมดเช็คอินด่วน'} 
            className={`flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90 ${
              fastTrackMode ? 'bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-400/40' : 'text-white/80 hover:text-white'
            }`}
            title="โหมดเช็คอินด่วน (Auto Check-in)"
          >
            <Zap className="h-4 w-4" />
          </button>

          <button 
            type="button" 
            disabled={uploadingImage} 
            onClick={() => fileInputRef.current?.click()} 
            aria-label="เลือกภาพ QR จากคลังภาพ" 
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition active:scale-90 hover:text-white disabled:opacity-30"
            title="อัปโหลดรูป QR Code"
          >
            <UploadCloud className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modern iOS Bottom Sheet Card for Scanned Donor */}
      {registration && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-0 sm:p-4 animate-in fade-in duration-200">
          <section 
            aria-live="polite" 
            className="w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl bg-white p-6 text-slate-900 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-5 duration-200"
          >
            {/* Grab Handle for Mobile */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

            {/* Header: Code + Status Badge + Close Button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#7A1222] bg-[#FDF2F3] border border-[#F8D7DA] px-2.5 py-1 rounded-lg">
                  {registration.registrationCode}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getRegistrationStatusBadge(registration.status).colorClass}`}>
                  {getRegistrationStatusBadge(registration.status).label}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setRegistration(null)} 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition active:scale-90"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Donor Name & Affiliation */}
            <div className="mt-3">
              <h2 className="text-xl font-black text-slate-950 tracking-tight">
                คุณ{registration.firstName} {registration.lastName}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {registration.facultyName} &middot; {
                  registration.participantType === 'STUDENT' ? 'นักศึกษา' :
                  registration.participantType === 'STAFF' ? 'บุคลากร' : 'บุคคลทั่วไป'
                }
              </p>
            </div>

            {/* 2-Column Info Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <span className="block text-[11px] font-medium text-slate-500">🕒 รอบเวลาเดินทาง</span>
                <span className="mt-1 block font-bold text-slate-900">{registration.timeSlotText}</span>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <span className="block text-[11px] font-medium text-slate-500">📍 เวลาเช็คอิน</span>
                <span className={`mt-1 block font-bold ${registration.checkedInAt ? 'text-blue-700' : 'text-slate-600'}`}>
                  {registration.checkedInAt
                    ? formatBangkokTime(registration.checkedInAt)
                    : registration.status === 'COMPLETED'
                    ? 'เช็คอินแล้ว'
                    : 'ยังไม่ได้เช็คอิน'}
                </span>
              </div>
            </div>

            {/* Souvenir Eligibility Banner: ONLY shown when eligible */}
            {registration.souvenirEligible && (
              <div className="mt-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/40 border border-amber-200/80 p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800 shrink-0">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">ได้รับของที่ระลึกพิเศษ (100 สิทธิ์แรก)</p>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">ผู้บริจาคเช็คอินตรงเวลาตามรอบนัดหมาย</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
              {registration.status === 'REGISTERED' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => void handleStatusChange('CHECKED_IN')}
                  className="min-h-12 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] px-4 text-sm font-bold text-white shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                  <span>ยืนยันเช็คอินเข้างาน (Confirm Check-in)</span>
                </button>
              )}

              {registration.status === 'CHECKED_IN' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => void handleStatusChange('COMPLETED')}
                  className={`min-h-12 w-full rounded-2xl px-4 text-sm font-bold text-white shadow-md transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 ${
                    registration.souvenirEligible
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : registration.souvenirEligible ? (
                    <Gift className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>
                    {registration.souvenirEligible
                      ? 'บันทึกบริจาคสำเร็จ & มอบของที่ระลึก'
                      : 'บันทึกบริจาคสำเร็จ (Complete)'}
                  </span>
                </button>
              )}

              {registration.status === 'COMPLETED' && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-center flex items-center justify-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    {registration.souvenirEligible
                      ? 'บันทึกการบริจาคและมอบของที่ระลึกแล้ว'
                      : 'บันทึกการบริจาคโลหิตสำเร็จเรียบร้อย'}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setRegistration(null)}
                className="min-h-11 w-full rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-xs font-semibold text-slate-700 transition"
              >
                สแกนคนถัดไป (Scan Next)
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
