'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Mail,
  Phone,
  ShieldCheck,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Heart,
  CheckCircle2,
  XCircle,
  X,
  PlusCircle,
  Search,
  Inbox,
  ExternalLink,
} from 'lucide-react';
import { DonorTicketPass } from '@/components/ui/DonorTicketPass';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatBangkokTime, isWalkInRecord } from '@/lib/utils/format';
import { EVENT_CONFIG, getFormattedVenue } from '@/lib/constants/event';

interface LookupResult {
  id: string;
  registration_code?: string;
  registrationCode?: string;
  qr_token?: string;
  qrToken?: string;
  access_token?: string;
  accessToken?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  last_name_initial?: string;
  lastNameInitial?: string;
  participant_type?: string;
  participantType?: string;
  faculty?: string | null;
  phone?: string;
  status: string;
  registered_at?: string;
  registeredAt?: string;
  time_slot?: { time_label?: string; start_at?: string; end_at?: string; startAt?: string; endAt?: string } | null;
  timeSlot?: { time_label?: string; start_at?: string; end_at?: string; startAt?: string; endAt?: string } | null;
  event?: { name?: string; start_at?: string; venue_name?: string } | null;
}

type RecoveryMethod = 'PHONE' | 'EMAIL';

function LookupContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');

  const { isTh, isEn } = useLanguage();

  // Active Method & State
  const [method, setMethod] = useState<RecoveryMethod>('PHONE');

  // Phone State
  const [phone, setPhone] = useState('');

  // Email State
  const [email, setEmail] = useState('');
  const [emailRequestedSuccess, setEmailRequestedSuccess] = useState(false);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<LookupResult | null>(null);

  // Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('ติดภารกิจ / ธุระด่วน');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelledSuccessData, setCancelledSuccessData] = useState<{
    code: string;
    name: string;
  } | null>(null);

  // Handle auto-verification if token is in URL (Magic Link flow)
  useEffect(() => {
    if (!tokenParam) return;

    let ignore = false;
    async function verifyToken() {
      setVerifyLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/api/registrations/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenParam }),
        });
        const data = await res.json();
        if (ignore) return;

        if (res.ok && data.success && data.registration) {
          setSelectedResult(data.registration);
        } else {
          setErrorMessage(data.message || (isTh ? 'ลิงก์ยืนยันตัวตนไม่ถูกต้องหรือหมดอายุแล้ว' : 'Invalid or expired verification link'));
        }
      } catch {
        if (!ignore) {
          setErrorMessage(isTh ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' : 'Network connection error');
        }
      } finally {
        if (!ignore) setVerifyLoading(false);
      }
    }

    verifyToken();
    return () => { ignore = true; };
  }, [tokenParam, isTh]);

  // Direct Phone Lookup (Instant, Free)
  const handlePhoneLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSelectedResult(null);
    setCancelledSuccessData(null);

    const phoneClean = phone.trim().replace(/[\s\-]/g, '');
    if (!phoneClean || phoneClean.length < 9) {
      setErrorMessage(isTh ? 'กรุณากรอกเบอร์โทรศัพท์มือถือ 9-10 หลักให้ถูกต้อง' : 'Please enter a valid 9-10 digit mobile phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/registrations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneClean }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.registration) {
        setSelectedResult(data.registration);
      } else {
        setErrorMessage(data.message || (isTh ? 'ไม่พบข้อมูลการลงทะเบียนที่ตรงกับเบอร์โทรศัพท์นี้' : 'No registration found for this phone number'));
      }
    } catch {
      setErrorMessage(isTh ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' : 'Network connection error');
    } finally {
      setLoading(false);
    }
  };

  // Request Email Magic Link
  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSelectedResult(null);
    setCancelledSuccessData(null);

    const emailClean = email.trim().toLowerCase();
    if (!emailClean || !emailClean.includes('@')) {
      setErrorMessage(isTh ? 'กรุณากรอกอีเมลให้ถูกต้อง' : 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/registrations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmailRequestedSuccess(true);
      } else {
        setErrorMessage(data.message || (isTh ? 'เกิดข้อผิดพลาดในการส่งคำขอ' : 'Request error'));
      }
    } catch {
      setErrorMessage(isTh ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' : 'Network connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedResult(null);
    setErrorMessage(null);
    setEmailRequestedSuccess(false);
    setCancelledSuccessData(null);
  };

  const handleConfirmCancel = async () => {
    if (!selectedResult) return;

    const regCode = selectedResult.registrationCode || selectedResult.registration_code || '';
    const accessToken = selectedResult.accessToken || selectedResult.access_token || '';

    setCancelLoading(true);
    setCancelError(null);

    try {
      const res = await fetch('/api/registrations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationCode: regCode,
          token: accessToken,
          reason: cancelReason,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const firstName = selectedResult.firstName || selectedResult.first_name || '';
        const lastName = selectedResult.lastName || selectedResult.last_name || selectedResult.lastNameInitial || selectedResult.last_name_initial || '';
        setCancelledSuccessData({
          code: regCode,
          name: `${firstName} ${lastName}`.trim(),
        });
        setCancelModalOpen(false);
        setSelectedResult(null);
      } else {
        setCancelError(data.message || (isTh ? 'ไม่สามารถยกเลิกได้ กรุณาลองใหม่อีกครั้ง' : 'Failed to cancel registration'));
      }
    } catch {
      setCancelError(isTh ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' : 'Network connection error');
    } finally {
      setCancelLoading(false);
    }
  };

  const regCode = selectedResult?.registrationCode || selectedResult?.registration_code || '';
  const firstName = selectedResult?.firstName || selectedResult?.first_name || '';
  const lastName = selectedResult?.lastName || selectedResult?.last_name || selectedResult?.lastNameInitial || selectedResult?.last_name_initial || '';
  const qrToken = selectedResult?.qrToken || selectedResult?.qr_token || '';
  const slotData = selectedResult?.timeSlot || selectedResult?.time_slot;
  const isWalkIn = selectedResult ? isWalkInRecord(regCode) : false;
  const regTime = selectedResult?.registeredAt || selectedResult?.registered_at;
  const formattedTimeSlot = isWalkIn
    ? (regTime ? formatBangkokTime(regTime) : formatBangkokTime(new Date()))
    : (slotData?.time_label || EVENT_CONFIG.timeLabelTh);

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--line)]">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] text-white shadow-sm shadow-red-950/20 border border-white/20">
            <Search className="h-3.5 w-3.5 text-white" />
            <span>{isTh ? 'ค้นหาตั๋วลงทะเบียน & Digital Pass' : 'Find Your Digital Pass'}</span>
          </span>
        </div>
        <h1 className="text-2xl font-black text-[var(--ink)] sm:text-3xl font-display">
          {isTh ? 'ค้นหาตั๋วและ QR Code ของฉัน' : 'Find Your Registration Pass & QR'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)] font-medium leading-relaxed">
          {isTh
            ? 'กรอกหมายเลขโทรศัพท์ที่ใช้ลงทะเบียน เพื่อเปิดดูตั๋วและ QR Code สำหรับเช็กอินวันงานได้ทันที'
            : 'Enter your registered phone number to open your pass and QR code immediately.'}
        </p>
      </div>

      {/* Verifying Token Loader */}
      {verifyLoading && (
        <div className="p-8 editorial-card text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy-700)] mx-auto" />
          <p className="text-sm font-bold text-gray-800">
            {isTh ? 'กำลังค้นหาและเปิดดูตั๋ว...' : 'Opening your registration pass...'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--danger-bg)] border border-[#E8B9C1] text-sm font-bold text-[var(--danger)] flex items-start gap-2.5 shadow-2xs">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{errorMessage}</p>
            <div className="mt-2 pt-2 border-t border-[#E8B9C1]/50 flex items-center gap-3 text-xs">
              <span>{isTh ? 'ยังไม่ได้ลงทะเบียน?' : 'Not registered yet?'}</span>
              <Link
                href="/register"
                className="underline font-black hover:text-[var(--burgundy-800)] flex items-center gap-1"
              >
                <Heart className="h-3 w-3" />
                <span>{isTh ? 'ลงทะเบียนที่นี่' : 'Register here'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CASE 0: Registration Cancelled Success Banner */}
      {cancelledSuccessData && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="editorial-card p-6 sm:p-8 text-center space-y-5 border-rose-200 bg-gradient-to-b from-white to-rose-50/40">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-[#A6192E] ring-8 ring-rose-50 shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block font-mono text-xs font-black text-[#A6192E] bg-rose-100 px-3 py-1 rounded-full">
                {cancelledSuccessData.code}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display">
                {isTh ? 'ยกเลิกการลงทะเบียนเรียบร้อยแล้ว' : 'Registration Successfully Cancelled'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                {isTh
                  ? `รหัส ${cancelledSuccessData.code} ได้ถูกยกเลิกแล้ว และไม่สามารถนำไปใช้เช็กอินได้อีก หากท่านต้องการเปลี่ยนรอบเวลา สามารถกดลงทะเบียนใหม่ได้ทันที`
                  : `Code ${cancelledSuccessData.code} has been cancelled and cannot be used for check-in. If you wish to reschedule, you can re-register anytime.`}
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="editorial-btn-primary min-h-11 flex-1 py-3 text-xs font-bold justify-center"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{isTh ? 'ลงทะเบียนใหม่ (เปลี่ยนรอบเวลา)' : 'Register New Appointment'}</span>
              </Link>

              <button
                type="button"
                onClick={handleReset}
                className="editorial-btn-secondary min-h-11 flex-1 py-3 text-xs font-bold justify-center cursor-pointer"
              >
                <span>{isTh ? 'ค้นหาตั๋วอื่น' : 'Search Another Ticket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASE 1: Single Result Selected -> Show Digital Pass Immediately */}
      {!cancelledSuccessData && selectedResult ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition-colors py-1 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{isTh ? '← ค้นหาตั๋วอื่น' : '← Search another ticket'}</span>
            </button>

            <Link
              href={`/registration/${encodeURIComponent(regCode)}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--burgundy-700)] hover:underline py-1"
            >
              <span>{isTh ? 'เปิดดูในหน้าเต็ม' : 'Open in Full Page'}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <DonorTicketPass
            registrationCode={regCode}
            name={`${firstName} ${lastName}`.trim()}
            phone={selectedResult.phone}
            faculty={selectedResult.faculty}
            timeSlot={formattedTimeSlot}
            date={isEn ? EVENT_CONFIG.dateEn : EVENT_CONFIG.dateTh}
            venue={getFormattedVenue(isEn ? 'en' : 'th')}
            qrToken={qrToken}
            isConfirmed={selectedResult.status !== 'CANCELLED'}
            status={selectedResult.status}
            onReset={handleReset}
            resetLabel={isTh ? 'ค้นหาตั๋วอื่น' : 'Search Another Ticket'}
            onCancel={selectedResult.status === 'REGISTERED' ? () => setCancelModalOpen(true) : undefined}
            cancelLabel={isTh ? 'ขอยกเลิกการลงทะเบียน' : 'Cancel Registration'}
          />
        </div>
      ) : !cancelledSuccessData && emailRequestedSuccess ? (
        /* CASE 2: Magic Link Sent Success Banner */
        <div className="editorial-card p-6 sm:p-8 text-center space-y-5 animate-in fade-in duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50">
            <Inbox className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display">
              {isTh ? 'ส่งลิงก์เปิดดูตั๋วเรียบร้อยแล้ว' : 'Access Link Sent'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
              {isTh
                ? 'หากอีเมลนี้ตรงกับข้อมูลที่เคยลงทะเบียนไว้ ระบบได้ส่งลิงก์สำหรับเปิดดูตั๋วและ QR Code ไปยังกล่องข้อความของคุณแล้ว'
                : 'If this email is registered, we have sent a secure access link to your inbox.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="editorial-btn-secondary min-h-11 px-6 py-2.5 text-xs font-bold justify-center cursor-pointer"
            >
              <span>{isTh ? 'ค้นหาด้วยวิธีอื่น' : 'Search Again'}</span>
            </button>
          </div>
        </div>
      ) : !cancelledSuccessData && !verifyLoading ? (
        /* CASE 3: Direct Phone Search Form */
        <div className="space-y-5">
          
          {/* Method Selector Tabs */}
          <div className="flex rounded-2xl bg-gray-100 p-1 border border-gray-200" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={method === 'PHONE'}
              onClick={() => { setMethod('PHONE'); setErrorMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                method === 'PHONE'
                  ? 'bg-white text-[var(--burgundy-700)] shadow-xs border border-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Phone className="h-4 w-4" />
              <span>{isTh ? 'ค้นหาด้วยเบอร์โทรศัพท์' : 'Search by Phone'}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={method === 'EMAIL'}
              onClick={() => { setMethod('EMAIL'); setErrorMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                method === 'EMAIL'
                  ? 'bg-white text-[var(--burgundy-700)] shadow-xs border border-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>{isTh ? 'ค้นหาด้วยอีเมล' : 'Search by Email'}</span>
            </button>
          </div>

          {/* TAB 1: DIRECT PHONE SEARCH (Primary) */}
          {method === 'PHONE' && (
            <form onSubmit={handlePhoneLookup} className="editorial-card p-6 sm:p-8 space-y-5 animate-in fade-in-50 duration-150">
              <div>
                <label htmlFor="lk-phone" className="block text-xs font-bold text-[var(--ink)] mb-2">
                  {isTh ? 'หมายเลขโทรศัพท์มือถือที่ใช้ลงทะเบียน' : 'Registered Mobile Phone Number'}{' '}
                  <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="lk-phone"
                    type="tel"
                    required
                    autoFocus
                    autoComplete="tel"
                    placeholder="081-234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="editorial-input text-base sm:text-lg font-mono tracking-wider"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                  {isTh
                    ? '* กรอกเบอร์โทรศัพท์ 10 หลัก เพื่อเปิดดูตั๋วและ QR Code ได้ทันที'
                    : '* Enter your 10-digit mobile phone to view your pass and QR code instantly.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-red-950/20 hover:from-[#C51D2C] hover:via-[#911426] hover:to-[#6E0F1D] hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isTh ? 'กำลังค้นหาตั๋ว...' : 'Searching ticket...'}</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>{isTh ? 'ค้นหาตั๋วของฉัน' : 'Find My Pass'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-start gap-2.5 pt-2 text-[11px] text-[var(--muted)] font-medium border-t border-[var(--line)]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  {isTh
                    ? 'ระบบจะแสดงตั๋วลงทะเบียนของคุณพร้อม QR Code สำหรับนำไปยื่นเช็กอินในวันงาน'
                    : 'Your registration pass and QR code will be displayed for event check-in.'}
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: EMAIL SEARCH (Fallback) */}
          {method === 'EMAIL' && (
            <form onSubmit={handleRequestMagicLink} className="editorial-card p-6 sm:p-8 space-y-5 animate-in fade-in-50 duration-150">
              <div>
                <label htmlFor="lk-email" className="block text-xs font-bold text-[var(--ink)] mb-2">
                  {isTh ? 'อีเมลที่ใช้ลงทะเบียน' : 'Registered Email Address'}{' '}
                  <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="lk-email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder={isTh ? 'เช่น somchai@student.mahidol.edu' : 'e.g. somchai@student.mahidol.edu'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="editorial-input text-base sm:text-lg"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                  {isTh
                    ? '* ระบบจะส่งลิงก์ยืนยันสิทธิ์สำหรับเปิดดูตั๋วไปยังอีเมลนี้โดยอัตโนมัติ'
                    : '* A secure access link will be sent to your email address.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-red-950/20 hover:from-[#C51D2C] hover:via-[#911426] hover:to-[#6E0F1D] hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isTh ? 'กำลังส่งคำขอ...' : 'Sending request...'}</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>{isTh ? 'ส่งลิงก์เปิดดูตั๋วเข้าอีเมล' : 'Send Access Link to Email'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-start gap-2.5 pt-2 text-[11px] text-[var(--muted)] font-medium border-t border-[var(--line)]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  {isTh
                    ? 'ความปลอดภัย: ลิงก์มีอายุ 15 นาที และใช้เปิดตั๋วได้เฉพาะผู้มีสิทธิ์เข้าถึงอีเมลเท่านั้น'
                    : 'Security notice: Access links expire in 15 minutes.'}
                </span>
              </div>
            </form>
          )}

        </div>
      ) : null}

      {/* CANCELLATION CONFIRMATION MODAL */}
      {cancelModalOpen && selectedResult && (
        <CancelConfirmationDialog
          registrationCode={regCode}
          donorName={`${firstName} ${lastName}`.trim()}
          timeSlot={formattedTimeSlot}
          reason={cancelReason}
          onReasonChange={setCancelReason}
          loading={cancelLoading}
          errorMessage={cancelError}
          onConfirm={handleConfirmCancel}
          onClose={() => {
            if (!cancelLoading) {
              setCancelModalOpen(false);
              setCancelError(null);
            }
          }}
        />
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-gray-500">กำลังโหลด...</div>}>
      <LookupContent />
    </Suspense>
  );
}

function CancelConfirmationDialog({
  registrationCode,
  donorName,
  timeSlot,
  reason,
  onReasonChange,
  loading,
  errorMessage,
  onConfirm,
  onClose,
}: {
  registrationCode: string;
  donorName: string;
  timeSlot: string;
  reason: string;
  onReasonChange: (val: string) => void;
  loading: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { isTh } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onClose]);

  const REASONS = isTh
    ? [
        'ติดภารกิจ / ธุระด่วน',
        'สภาพร่างกายไม่พร้อม (มีไข้ / พักผ่อนไม่พอ)',
        'ต้องการเปลี่ยนรอบเวลาใหม่',
        'อื่นๆ',
      ]
    : [
        'Urgent commitment / Busy',
        'Not feeling well / Insufficient rest',
        'Want to change time slot',
        'Other',
      ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      tabIndex={-1}
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 outline-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95 duration-150 text-left"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 id="cancel-modal-title" className="text-base sm:text-lg font-black text-gray-900 font-display">
                {isTh ? 'ยืนยันยกเลิกการลงทะเบียน' : 'Confirm Cancellation'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {isTh ? 'กรุณาตรวจสอบข้อมูลก่อนยืนยัน' : 'Please review before confirming'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert inside modal */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Ticket Summary Box */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-rose-100/70">
            <span className="text-gray-500 font-medium">{isTh ? 'รหัสลงทะเบียน' : 'Code'}</span>
            <span className="font-mono font-black text-[#A6192E] text-sm">{registrationCode}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">{isTh ? 'ชื่อผู้ลงทะเบียน' : 'Donor'}</span>
            <span className="font-bold text-gray-900">{donorName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">{isTh ? 'รอบเวลา' : 'Time Slot'}</span>
            <span className="font-bold text-gray-900">{timeSlot}</span>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-950">
            <span>⚠️ {isTh ? 'ข้อสำคัญหลังจากยกเลิก:' : 'Important Notice:'}</span>
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800">
            <li>{isTh ? 'รหัสนี้จะไม่สามารถนำมาสแกนเช็กอินในวันงานได้' : 'This pass will become void and cannot be scanned'}</li>
            <li>{isTh ? 'หากต้องการเปลี่ยนรอบเวลา สามารถลงทะเบียนใหม่ได้ทันที' : 'You can re-register anytime if you wish to reschedule'}</li>
          </ul>
        </div>

        {/* Reason Selector */}
        <div className="space-y-1.5">
          <label htmlFor="cancel-reason" className="block text-xs font-bold text-gray-900">
            {isTh ? 'ระบุเหตุผลในการยกเลิก (ถ้ามี)' : 'Reason for Cancellation (Optional)'}
          </label>
          <select
            id="cancel-reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            disabled={loading}
            className="editorial-input text-xs"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="editorial-btn-secondary min-h-11 flex-1 py-2.5 text-xs font-bold justify-center cursor-pointer order-2 sm:order-1"
          >
            <span>{isTh ? 'ย้อนกลับ / ไม่ยกเลิก' : 'Keep Registration'}</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-red-950/15 hover:from-red-700 hover:to-rose-800 active:scale-95 transition-all disabled:opacity-50 cursor-pointer order-1 sm:order-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isTh ? 'กำลังยกเลิก...' : 'Cancelling...'}</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                <span>{isTh ? 'ยืนยันยกเลิกการลงทะเบียน' : 'Confirm Cancel'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
