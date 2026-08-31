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
  UploadCloud,
  ArrowLeft,
  Loader2,
  X,
  AlertCircle,
  AlertTriangle,
  Search,
  Phone,
  Clock,
  Check
} from 'lucide-react';
import { formatTimeRange, formatBangkokTime, getRegistrationStatusBadge, isWalkInRecord, type SouvenirEligibilityDetails } from '@/lib/utils/format';
import type { ParticipantType, RegistrationStatus } from '@/lib/types/database';
import { enqueueOfflineAction } from '@/lib/pwa/offline-queue';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';

interface ApiRegistration {
  id: string;
  registrationCode?: string;
  registration_code?: string;
  source?: string;
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
  souvenirDetails?: SouvenirEligibilityDetails | null;
  souvenir_details?: SouvenirEligibilityDetails | null;
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
  isWalkIn: boolean;
  checkedInAt?: string;
  completedAt?: string;
  souvenirEligible: boolean;
  souvenirDetails?: SouvenirEligibilityDetails | null;
}

function mapRegistration(r: ApiRegistration): RegistrationDetail {
  const slot = r.timeSlot || r.time_slot;
  const isWalkIn = isWalkInRecord(r.source || r.registrationCode || r.registration_code);
  return {
    id: r.id,
    registrationCode: r.registrationCode || r.registration_code || '',
    firstName: r.firstName || r.first_name || '',
    lastName: r.lastName || r.last_name || '',
    phone: r.phone || '',
    participantType: (r.participantType || r.participant_type || 'GENERAL_PUBLIC') as ParticipantType,
    facultyName: r.faculty || 'บุคคลทั่วไป',
    timeSlotText: slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : (isWalkIn ? 'Walk-in (หน้างาน)' : '09:00 – 14:00 น.'),
    status: r.status || 'REGISTERED',
    isWalkIn,
    checkedInAt: r.checkedInAt || r.checked_in_at || undefined,
    completedAt: r.completedAt || r.completed_at || undefined,
    souvenirEligible: Boolean(r.souvenirEligible ?? r.souvenir_eligible),
    souvenirDetails: r.souvenirDetails || r.souvenir_details,
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'souvenir') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      osc.frequency.setValueAtTime(1174.66, now + 0.16);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
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

  // Manual Search Modal & Query State
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RegistrationDetail[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'ALL' | 'ONLINE' | 'WALK_IN'>('ALL');
  const [searchQuickCheckinId, setSearchQuickCheckinId] = useState<string | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus search input when search modal opens
  useEffect(() => {
    if (searchModalOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [searchModalOpen]);

  const performSearch = useCallback(async (queryText: string) => {
    const q = queryText.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/staff/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.registrations)) {
        setSearchResults(data.registrations.map(mapRegistration));
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!text.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(() => {
      void performSearch(text);
    }, 200);
  };

  const handleQuickCheckinFromSearch = async (item: RegistrationDetail, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.status !== 'REGISTERED') {
      setRegistration(item);
      setSearchModalOpen(false);
      return;
    }

    setSearchQuickCheckinId(item.id);
    try {
      const checkinRes = await fetch('/api/staff/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: item.id, status: 'CHECKED_IN' }),
      });
      const checkinData = await checkinRes.json();
      if (checkinRes.ok && checkinData.success) {
        if (soundEnabled) playAudioChime('success');
        const nowIso = new Date().toISOString();
        const updated: RegistrationDetail = {
          ...item,
          status: 'CHECKED_IN' as RegistrationStatus,
          checkedInAt: nowIso,
        };
        setSearchResults((prev) => prev.map((r) => (r.id === item.id ? updated : r)));
        setMessage({ type: 'success', text: `เช็คอินสำเร็จ: คุณ${item.firstName} ${item.lastName}` });
      } else {
        if (soundEnabled) playAudioChime('error');
        setMessage({ type: 'error', text: checkinData.message || checkinData.error || 'ไม่สามารถเช็คอินได้' });
      }
    } catch {
      if (soundEnabled) playAudioChime('error');
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setSearchQuickCheckinId(null);
    }
  };

  // Camera & Scanner State
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
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
  }, [soundEnabled]);

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
  }, [setScanning]);

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
            width: Math.max(220, Math.min(qrEdgeSize, 320)),
            height: Math.max(220, Math.min(qrEdgeSize, 320)),
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
        setMessage({ type: 'error', text: 'ไม่พบอุปกรณ์กล้องบนเครื่องนี้ กรุณาใช้การค้นหารายชื่อแทน' });
      } else {
        setMessage({ type: 'error', text: 'ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบการอนุญาตสิทธิ์กล้อง' });
      }
    }
  }, [facingMode, handleLookupByToken, setFacingMode, setScanning]);

  // Reactive camera startup
  useEffect(() => {
    let unmounted = false;
    const targetContainer = 'qr-reader-fullscreen';

    const timer = setTimeout(() => {
      if (!unmounted) {
        void startScanner(facingMode, undefined, targetContainer);
      }
    }, 200);

    return () => {
      unmounted = true;
      clearTimeout(timer);
    };
  }, [facingMode, startScanner]);

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

  // Dedicated scanner viewport
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
      className="fixed inset-0 isolate h-[100dvh] w-screen overflow-hidden bg-slate-950 text-white select-none font-sans" 
      aria-label="กล้องสแกน QR ผู้บริจาค"
    >
      <h1 className="sr-only">กล้องสแกน QR ผู้บริจาค</h1>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* Video Viewport */}
      <div 
        id="qr-reader-fullscreen" 
        className="absolute inset-0 h-full w-full bg-slate-950 [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover [&_#qr-shaded-region]:!hidden [&_div]:!border-none" 
      />
      
      {/* Subtle Professional Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" aria-hidden="true" />

      {/* Clean Top Navigation Bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex items-center gap-2">
          <Link 
            href="/staff/overview" 
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3.5 text-xs font-bold text-white shadow-lg backdrop-blur-md transition active:scale-95 hover:bg-black/60"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ภาพรวม</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 text-xs font-medium text-white shadow-lg backdrop-blur-md">
            <span className={`h-2 w-2 rounded-full ${scanning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            <span className="font-semibold text-xs">{scanning ? 'พร้อมสแกน' : 'กำลังเปิดกล้อง'}</span>
          </div>

          {/* Sound Toggle */}
          <button 
            type="button" 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            aria-pressed={soundEnabled} 
            aria-label={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'} 
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 shadow-lg backdrop-blur-md transition active:scale-95 ${
              soundEnabled ? 'bg-black/40 text-white hover:bg-black/60' : 'bg-black/60 text-white/40'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Professional Medical-Grade Viewfinder Frame (NO AI Slop / NO fake green laser) */}
      {scanning && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-8" aria-hidden="true">
          <div className="relative aspect-square w-[min(72vw,19rem)]">
            
            {/* 4 Clean Precision Corner Brackets */}
            <span className="absolute -left-1 -top-1 h-7 w-7 rounded-tl-xl border-l-[3.5px] border-t-[3.5px] border-white shadow-sm" />
            <span className="absolute -right-1 -top-1 h-7 w-7 rounded-tr-xl border-r-[3.5px] border-t-[3.5px] border-white shadow-sm" />
            <span className="absolute -bottom-1 -left-1 h-7 w-7 rounded-bl-xl border-b-[3.5px] border-l-[3.5px] border-white shadow-sm" />
            <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-br-xl border-b-[3.5px] border-r-[3.5px] border-white shadow-sm" />
          </div>

          <p className="mt-6 text-center text-xs font-semibold text-white/90 tracking-wide bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-md">
            สแกน QR Code บนตั๋วผู้บริจาค
          </p>
        </div>
      )}

      {/* Idle State when Camera is inactive */}
      {!scanning && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-md shadow-2xl">
            <Camera className="h-10 w-10 mx-auto text-white/90" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">กล้องพร้อมสแกน QR Code</p>
            <p className="mt-1 text-xs text-white/70">กดปุ่มด้านล่างเพื่อเริ่มเปิดใช้งานกล้อง</p>
          </div>
          <button 
            type="button" 
            onClick={() => void startScanner('environment')} 
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-6 text-xs font-extrabold text-white shadow-xl transition active:scale-95 hover:opacity-90 border border-white/20 cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            <span>เปิดกล้องสแกนเนอร์</span>
          </button>
        </div>
      )}

      {/* Themed Loading Overlays */}
      {searching && <LoadingOverlay variant="staff-scan" />}
      {uploadingImage && (
        <LoadingOverlay
          variant="staff-scan"
          statusText="กำลังประมวลผลภาพถ่าย QR Code..."
          hint="ระบบกำลังอ่านและตรวจสอบข้อมูล QR Code จากรูปภาพ"
        />
      )}
      {actionLoading && <LoadingOverlay variant="staff-checkin" />}

      {/* Floating Top Notification Toast */}
      {message && !registration && (
        <div className="pointer-events-none absolute top-16 inset-x-4 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`flex items-center gap-2.5 rounded-2xl border p-3.5 text-xs font-semibold shadow-2xl backdrop-blur-xl ${
            message.type === 'error' ? 'border-red-500/30 bg-red-950/95 text-red-100' :
            message.type === 'warning' ? 'border-amber-500/30 bg-amber-950/95 text-amber-100' :
            'border-emerald-500/30 bg-emerald-950/95 text-emerald-100'
          }`}>
            {message.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0 text-red-400" /> :
             message.type === 'warning' ? <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" /> :
             <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
            <span className="flex-1 leading-snug">{message.text}</span>
          </div>
        </div>
      )}

      {/* Professional Streamlined Bottom Action Bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2.5 rounded-2xl border border-white/20 bg-black/60 p-2 shadow-2xl backdrop-blur-xl">
          
          {/* Main Action: Search by Name/Code/Phone */}
          <button 
            type="button" 
            onClick={() => setSearchModalOpen(true)} 
            aria-label="ค้นหารหัส ชื่อ หรือเบอร์โทร" 
            className="flex-1 min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-xs font-bold text-white transition cursor-pointer border border-white/10"
          >
            <Search className="h-4 w-4 text-white" />
            <span>ค้นหารหัส / ชื่อ / เบอร์โทร</span>
          </button>

          {/* Secondary Action: Flip Camera */}
          <button 
            type="button" 
            onClick={toggleCameraFacing} 
            aria-label="สลับกล้องหน้า/หลัง" 
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white transition cursor-pointer border border-white/10 shrink-0"
            title="สลับกล้อง"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Secondary Action: Upload Image */}
          <button 
            type="button" 
            disabled={uploadingImage} 
            onClick={() => fileInputRef.current?.click()} 
            aria-label="เลือกภาพ QR จากคลังภาพ" 
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white transition cursor-pointer border border-white/10 shrink-0 disabled:opacity-40"
            title="อัปโหลดรูปภาพ QR Code"
          >
            <UploadCloud className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Professional Donor Verification Card Modal */}
      {registration && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <section 
            aria-live="polite" 
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-6 text-slate-900 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-4 duration-200"
          >
            {/* Grab Handle */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black text-white bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-2.5 py-1 rounded-lg shadow-2xs">
                  {registration.registrationCode}
                </span>
                {registration.isWalkIn && (
                  <span className="rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-[11px] font-black">
                    Walk-in
                  </span>
                )}
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${getRegistrationStatusBadge(registration.status).colorClass}`}>
                  {getRegistrationStatusBadge(registration.status).label}
                </span>
              </div>

              <button 
                type="button" 
                onClick={() => setRegistration(null)} 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition active:scale-90 cursor-pointer"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Donor Identity */}
            <div className="mt-4">
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
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                <span className="block text-[11px] font-bold text-slate-500">รอบเวลานัดหมาย</span>
                <span className="mt-1 block font-black text-slate-900">{registration.timeSlotText}</span>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                <span className="block text-[11px] font-bold text-slate-500">เวลาเช็คอิน</span>
                <span className={`mt-1 block font-black ${registration.checkedInAt ? 'text-blue-700' : 'text-slate-600'}`}>
                  {registration.checkedInAt
                    ? formatBangkokTime(registration.checkedInAt)
                    : registration.status === 'COMPLETED'
                    ? 'เช็คอินแล้ว'
                    : 'ยังไม่ได้เช็คอิน'}
                </span>
              </div>
            </div>

            {/* Souvenir Status - High-visibility callout for staff */}
            {(() => {
              const isEligible = Boolean(registration.souvenirDetails?.eligible || registration.souvenirEligible);
              if (!isEligible) return null;

              return (
                <div className="mt-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-50/60 to-orange-50/80 border-2 border-amber-300/90 p-3.5 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-400 text-amber-950 shadow-2xs">
                          <Gift className="h-3 w-3" />
                          <span>มีสิทธิ์รับของที่ระลึก</span>
                        </span>
                        {registration.souvenirDetails?.rank && (
                          <span className="text-[11px] font-black text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md">
                            ลำดับที่ #{registration.souvenirDetails.rank}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-black text-amber-950 mt-1">
                        {registration.souvenirDetails?.badgeText || 'ได้รับของที่ระลึกพิเศษ (100 สิทธิ์แรก)'}
                      </p>
                      <p className="text-[11px] font-bold text-amber-800/90 mt-0.5 flex items-center gap-1">
                        <span>👉</span>
                        <span>เจ้าหน้าที่: กรุณามอบของที่ระลึกให้ผู้บริจาคท่านนี้</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons */}
            {(() => {
              const isEligible = Boolean(registration.souvenirDetails?.eligible || registration.souvenirEligible);
              return (
                <div className="mt-5 space-y-2">
                  {registration.status === 'REGISTERED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleStatusChange('CHECKED_IN')}
                      className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] hover:from-[#C51D2C] hover:via-[#911426] hover:to-[#6E0F1D] active:scale-[0.99] px-4 text-xs font-black text-white shadow-md shadow-red-950/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-white/20"
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
                      className={`min-h-12 w-full rounded-xl active:scale-[0.99] px-4 text-xs font-black text-white shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border ${
                        isEligible
                          ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-400/40'
                          : 'bg-slate-800 hover:bg-slate-900 border-slate-700'
                      }`}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isEligible ? (
                        <Gift className="h-4 w-4 text-amber-300" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <span>
                        {isEligible
                          ? 'บันทึกบริจาคสำเร็จ & มอบของที่ระลึก'
                          : 'บันทึกบริจาคสำเร็จ (Complete Donation)'}
                      </span>
                    </button>
                  )}

                  {registration.status === 'COMPLETED' && (
                    <div className={`rounded-xl p-3.5 text-center flex items-center justify-center gap-2 font-black text-xs border ${
                      isEligible 
                        ? 'bg-gradient-to-r from-emerald-50 to-amber-50 border-emerald-300 text-emerald-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}>
                      {isEligible ? (
                        <Gift className="h-4 w-4 text-emerald-700 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                      <span>
                        {isEligible
                          ? 'บันทึกการบริจาคและมอบของที่ระลึกแล้ว'
                          : 'บันทึกการบริจาคโลหิตสำเร็จเรียบร้อย'}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setRegistration(null)}
                    className="min-h-11 w-full rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    สแกนคนถัดไป (Scan Next)
                  </button>
                </div>
              );
            })()}
          </section>
        </div>
      )}

      {/* Professional Search Modal / Drawer */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <section 
            aria-label="ค้นหาผู้ลงทะเบียนเพื่อเช็คอิน" 
            className="w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200 border border-slate-200"
          >
            {/* Grab Handle */}
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

            {/* Modal Header & Search Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--rose-100)] text-[var(--burgundy-700)]">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-950 leading-tight">ค้นหารายชื่อผู้ลงทะเบียน</h2>
                    <p className="text-xs text-slate-500 font-medium">ค้นหาด้วยรหัส, ชื่อ-นามสกุล, หรือเบอร์โทรศัพท์</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSearchModalOpen(false)} 
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition active:scale-90 cursor-pointer"
                  aria-label="ปิดหน้าต่างค้นหา"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  placeholder="พิมพ์รหัส (เช่น LVU26-001, W001), ชื่อ, หรือเบอร์โทร..."
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-500)]/30 focus:border-[var(--burgundy-500)] transition font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchInputChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:text-black cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              {searchResults.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setSearchFilter('ALL')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      searchFilter === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ทั้งหมด ({searchResults.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchFilter('ONLINE')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      searchFilter === 'ONLINE'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ออนไลน์ ({searchResults.filter((r) => !r.isWalkIn).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchFilter('WALK_IN')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      searchFilter === 'WALK_IN'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Walk-in ({searchResults.filter((r) => r.isWalkIn).length})
                  </button>
                </div>
              )}
            </div>

            {/* Results Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[50vh]">
              {searchLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--burgundy-700)]" />
                  <p className="text-xs font-medium">กำลังค้นหาข้อมูล...</p>
                </div>
              ) : searchQuery.trim() === '' ? (
                <div className="py-10 text-center text-slate-500 space-y-2">
                  <p className="text-sm font-bold text-slate-800">พิมพ์คำค้นหาเพื่อเริ่มค้นหา</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    ค้นหาได้ด้วยรหัสลงทะเบียน (เช่น 001 หรือ W001), ชื่อ-นามสกุล, หรือเบอร์โทรศัพท์
                  </p>
                </div>
              ) : (searchResults.filter((r) => searchFilter === 'ALL' || (searchFilter === 'ONLINE' && !r.isWalkIn) || (searchFilter === 'WALK_IN' && r.isWalkIn))).length === 0 ? (
                <div className="py-10 text-center text-slate-500 space-y-2">
                  <AlertCircle className="h-6 w-6 mx-auto text-amber-500" />
                  <p className="text-sm font-bold text-slate-800">ไม่พบข้อมูลที่ตรงกับ &quot;{searchQuery}&quot;</p>
                  <p className="text-xs text-slate-500">กรุณาตรวจสอบการสะกดชื่อ รหัส หรือเบอร์โทรศัพท์อีกครั้ง</p>
                </div>
              ) : (
                searchResults
                  .filter((r) => searchFilter === 'ALL' || (searchFilter === 'ONLINE' && !r.isWalkIn) || (searchFilter === 'WALK_IN' && r.isWalkIn))
                  .map((donor) => {
                    const statusInfo = getRegistrationStatusBadge(donor.status);
                    const isPending = donor.status === 'REGISTERED';
                    const isCheckedIn = donor.status === 'CHECKED_IN';
                    const isCompleted = donor.status === 'COMPLETED';
                    const isCheckingThis = searchQuickCheckinId === donor.id;

                    return (
                      <div
                        key={donor.id}
                        onClick={() => {
                          setRegistration(donor);
                          setSearchModalOpen(false);
                        }}
                        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[var(--burgundy-300)] hover:shadow-md transition cursor-pointer"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                                donor.isWalkIn
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  : 'bg-[var(--rose-100)] text-[var(--burgundy-800)] border-[var(--burgundy-200)]'
                              }`}
                            >
                              {donor.registrationCode}
                            </span>
                            {donor.isWalkIn && (
                              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                                Walk-in
                              </span>
                            )}
                            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusInfo.colorClass}`}>
                              {statusInfo.label}
                            </span>
                            {Boolean(donor.souvenirEligible || donor.souvenirDetails?.eligible) && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-950 shadow-2xs">
                                <Gift className="h-3 w-3 text-amber-700" />
                                <span>มีสิทธิ์ของที่ระลึก</span>
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-black text-slate-900 group-hover:text-[var(--burgundy-700)] transition">
                              คุณ{donor.firstName} {donor.lastName}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {donor.facultyName} &middot; {
                                donor.participantType === 'STUDENT' ? 'นักศึกษา' :
                                donor.participantType === 'STAFF' ? 'บุคลากร' : 'บุคคลทั่วไป'
                              }
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{donor.phone}</span>
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{donor.timeSlotText}</span>
                            </span>
                          </div>
                        </div>

                        {/* Quick Action Button */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {isPending && (
                            <button
                              type="button"
                              disabled={isCheckingThis}
                              onClick={(e) => void handleQuickCheckinFromSearch(donor, e)}
                              className="min-h-9 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] hover:from-[#C51D2C] hover:via-[#911426] hover:to-[#6E0F1D] active:scale-95 text-xs font-black text-white shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer border border-white/20"
                            >
                              {isCheckingThis ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}
                              <span>เช็คอิน</span>
                            </button>
                          )}

                          {isCheckedIn && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRegistration(donor);
                                setSearchModalOpen(false);
                              }}
                              className="min-h-9 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-xs font-black text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>บันทึกบริจาค</span>
                            </button>
                          )}

                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl">
                              <Check className="h-3.5 w-3.5" />
                              <span>สำเร็จแล้ว</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>แตะที่รายชื่อเพื่อเปิดดูข้อมูลและดำเนินการ</span>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
