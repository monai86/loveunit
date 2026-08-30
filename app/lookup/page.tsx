'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Search,
  ShieldCheck,
  Loader2,
  User,
  Clock,
  ArrowRight,
  ArrowLeft,
  Heart,
  CheckCircle2,
  XCircle,
  X,
  PlusCircle,
} from 'lucide-react';
import { DonorTicketPass } from '@/components/ui/DonorTicketPass';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatBangkokTime, isWalkInRecord } from '@/lib/utils/format';

interface LookupResult {
  registration_code: string;
  qr_token: string;
  first_name: string;
  last_name?: string;
  last_name_initial: string;
  participant_type: string;
  faculty?: string | null;
  phone?: string;
  status: string;
  registered_at?: string;
  created_at?: string;
  time_slot: { time_label: string } | null;
  event: { name?: string; start_at?: string; venue_name?: string } | null;
}

export default function LookupPage() {
  const { isTh, isEn } = useLanguage();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [matches, setMatches] = useState<LookupResult[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMatches([]);
    setSelectedResult(null);
    setCancelledSuccessData(null);

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 9) {
      setErrorMessage(
        isTh
          ? 'กรุณากรอกเบอร์โทรศัพท์มือถือ 9-10 หลักให้ถูกต้อง'
          : 'Please enter a valid 9-10 digit mobile phone number'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/registrations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.registration) {
          // Exactly 1 match found
          setSelectedResult(data.registration);
        } else if (Array.isArray(data.matches) && data.matches.length > 0) {
          if (data.matches.length === 1) {
            setSelectedResult(data.matches[0]);
          } else {
            // Multiple matches found under this phone
            setMatches(data.matches);
          }
        } else {
          setErrorMessage(
            isTh ? 'ไม่พบข้อมูลการลงทะเบียนที่ตรงกับเบอร์นี้' : 'No registration found for this number'
          );
        }
      } else {
        setErrorMessage(
          data.message ||
            (isTh ? 'ไม่พบข้อมูลการลงทะเบียนที่ตรงกับเบอร์โทรศัพท์นี้' : 'Registration record not found')
        );
      }
    } catch {
      setErrorMessage(
        isTh
          ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้ง'
          : 'Network error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSelectedResult(null);
    setMatches([]);
    setErrorMessage(null);
    setCancelledSuccessData(null);
  };

  const handleOpenCancelModal = () => {
    setCancelError(null);
    setCancelReason('ติดภารกิจ / ธุระด่วน');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedResult) return;

    setCancelLoading(true);
    setCancelError(null);

    try {
      const res = await fetch('/api/registrations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationCode: selectedResult.registration_code,
          phone: phone.trim() || selectedResult.phone,
          reason: cancelReason,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCancelledSuccessData({
          code: selectedResult.registration_code,
          name: `${selectedResult.first_name} ${selectedResult.last_name || selectedResult.last_name_initial}`,
        });
        setCancelModalOpen(false);
        setSelectedResult(null);
        setMatches([]);
      } else {
        setCancelError(data.message || (isTh ? 'ไม่สามารถยกเลิกได้ กรุณาลองใหม่อีกครั้ง' : 'Failed to cancel registration'));
      }
    } catch {
      setCancelError(isTh ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' : 'Network connection error');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--line)]">
        <div className="flex items-center gap-2 text-xs font-black text-[var(--burgundy-700)] uppercase tracking-wider mb-2 font-mono">
          <Search className="h-3.5 w-3.5" />
          <span>{isTh ? 'ค้นหาตั๋วและ QR Code' : 'Find Ticket & QR Pass'}</span>
        </div>
        <h1 className="text-2xl font-black text-[var(--ink)] sm:text-3xl font-display">
          {isTh ? 'ค้นหาตั๋วและ QR Code ของฉัน' : 'Find Your Registration Pass & QR'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)] font-medium leading-relaxed">
          {isTh
            ? 'กรอกเบอร์โทรศัพท์มือถือที่ใช้ลงทะเบียน เพื่อเปิดดูตั๋ว QR Code หรือกดยกเลิกการลงทะเบียน'
            : 'Enter your registered mobile phone number to view your pass or manage your registration.'}
        </p>
      </div>

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
                onClick={handleResetSearch}
                className="editorial-btn-secondary min-h-11 flex-1 py-3 text-xs font-bold justify-center cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span>{isTh ? 'ค้นหาตั๋วเบอร์อื่น' : 'Search Another Ticket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASE 1: Single Result Selected -> Show Digital Pass with Cancel Button */}
      {!cancelledSuccessData && selectedResult ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleResetSearch}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>
              {isTh
                ? '← ค้นหาด้วยเบอร์อื่น หรือเลือกรายชื่ออื่น'
                : '← Search another number / Choose name'}
            </span>
          </button>

          <DonorTicketPass
            registrationCode={selectedResult.registration_code}
            name={`${selectedResult.first_name} ${selectedResult.last_name || selectedResult.last_name_initial}`}
            phone={selectedResult.phone}
            faculty={selectedResult.faculty}
            timeSlot={
              isWalkInRecord(selectedResult.registration_code)
                ? selectedResult.registered_at
                  ? formatBangkokTime(selectedResult.registered_at)
                  : formatBangkokTime(new Date())
                : selectedResult.time_slot?.time_label || '09:00 – 14:00 น.'
            }
            date={isEn ? 'Wednesday, September 16, 2026' : 'พุธที่ 16 กันยายน 2569'}
            venue={
              selectedResult.event?.venue_name ||
              (isEn
                ? 'Meeting Room 217, Sirividhaya Building, Mahidol University Salaya'
                : 'ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา')
            }
            qrToken={selectedResult.qr_token}
            isConfirmed={selectedResult.status !== 'CANCELLED'}
            status={selectedResult.status}
            onReset={handleResetSearch}
            resetLabel={isTh ? 'ค้นหาตั๋วของเบอร์อื่น' : 'Search Another Number'}
            onCancel={selectedResult.status === 'REGISTERED' ? handleOpenCancelModal : undefined}
            cancelLabel={isTh ? 'ขอยกเลิกการลงทะเบียน' : 'Cancel Registration'}
          />
        </div>
      ) : !cancelledSuccessData && matches.length > 1 ? (
        /* CASE 2: Multiple Matches Found -> Candidate Selection Picker */
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          <div className="p-4 rounded-2xl bg-[var(--rose-100)] border border-[var(--burgundy-200)] text-[var(--burgundy-800)]">
            <div className="flex items-center gap-2 font-black text-sm font-display">
              <CheckCircle2 className="h-4 w-4 text-[var(--burgundy-700)]" />
              <span>
                {isTh
                  ? `พบผู้ลงทะเบียนด้วยเบอร์นี้ ${matches.length} ท่าน`
                  : `Found ${matches.length} registrations for this phone`}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--burgundy-700)] font-medium">
              {isTh
                ? 'กรุณาแตะเลือกชื่อของคุณด้านล่าง เพื่อเปิดตั๋ว ดู QR Code หรือยกเลิกการลงทะเบียน'
                : 'Please tap your name below to open your QR Code pass or cancel registration.'}
            </p>
          </div>

          <div className="space-y-3">
            {matches.map((item, idx) => {
              const isItemWalkIn = isWalkInRecord(item.registration_code);
              const itemTimeLabel = isItemWalkIn
                ? item.registered_at
                  ? isTh
                    ? `ลงทะเบียน Walk-in (${formatBangkokTime(item.registered_at)})`
                    : `Walk-in (${formatBangkokTime(item.registered_at)})`
                  : isTh
                  ? 'ลงทะเบียน Walk-in'
                  : 'Walk-in'
                : item.time_slot?.time_label || '09:00 – 14:00 น.';

              return (
                <div
                  key={item.registration_code || idx}
                  onClick={() => setSelectedResult(item)}
                  className="editorial-card p-4 sm:p-5 transition-all hover:border-[var(--burgundy-600)] hover:shadow-md cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-[var(--burgundy-700)] bg-[var(--rose-100)] px-2 py-0.5 rounded-md">
                          {item.registration_code}
                        </span>
                        <span className="text-[11px] font-bold text-gray-500">
                          {item.participant_type === 'STUDENT'
                            ? isTh
                              ? 'นักศึกษา'
                              : 'Student'
                            : item.participant_type === 'STAFF'
                            ? isTh
                              ? 'บุคลากร'
                              : 'Staff'
                            : isTh
                            ? 'บุคคลทั่วไป'
                            : 'General'}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-[var(--ink)] group-hover:text-[var(--burgundy-700)] transition-colors flex items-center gap-2">
                        <User className="h-4 w-4 text-[var(--burgundy-600)] shrink-0" />
                        <span>
                          {item.first_name} {item.last_name || item.last_name_initial}
                        </span>
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-[var(--muted)] flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span>{itemTimeLabel}</span>
                        </span>
                        {item.faculty && <span>· {item.faculty}</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResult(item);
                      }}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-3.5 py-2 text-xs font-bold text-white shadow-xs group-hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <span>{isTh ? 'ดูตั๋ว' : 'View Pass'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleResetSearch}
              className="text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] underline py-2 cursor-pointer"
            >
              {isTh ? 'ค้นหาด้วยเบอร์โทรศัพท์อื่น' : 'Search with another phone number'}
            </button>
          </div>
        </div>
      ) : !cancelledSuccessData ? (
        /* CASE 3: Initial Search Form (Phone Only) */
        <form onSubmit={handleSubmit} className="editorial-card p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="lk-phone" className="block text-xs font-bold text-[var(--ink)] mb-2">
              {isTh ? 'เบอร์โทรศัพท์มือถือที่ลงทะเบียน' : 'Registered Mobile Phone'}{' '}
              <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                id="lk-phone"
                type="tel"
                required
                autoFocus
                autoComplete="tel"
                placeholder={isTh ? 'เช่น 0812345678' : 'e.g. 0812345678'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="editorial-input text-base sm:text-lg font-mono tracking-wider"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--muted)]">
              {isTh
                ? '* กรอกเบอร์มือถือที่เคยลงทะเบียนไว้เพื่อเปิดดูตั๋ว หรือกดยกเลิกการลงทะเบียน'
                : '* Enter your registered mobile phone number to view or manage your ticket'}
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
                <span>{isTh ? 'กำลังค้นหาตั๋ว...' : 'Searching...'}</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>{isTh ? 'ค้นหาตั๋วและ QR Code ของฉัน' : 'Find My Pass & QR Code'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="flex items-start gap-2.5 pt-2 text-[11px] text-[var(--muted)] font-medium border-t border-[var(--line)]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>
              {isTh
                ? 'ระบบความปลอดภัย: ข้อมูลตั๋วจะแสดงเฉพาะรหัสลงทะเบียน รอบเวลา และ QR Code เฉพาะบุคคลสำหรับเช็กอิน'
                : 'Security notice: Your pass contains your check-in QR Code and appointment details safely.'}
            </span>
          </div>
        </form>
      ) : null}

      {/* CANCELLATION CONFIRMATION MODAL */}
      {cancelModalOpen && selectedResult && (
        <CancelConfirmationDialog
          registrationCode={selectedResult.registration_code}
          donorName={`${selectedResult.first_name} ${selectedResult.last_name || selectedResult.last_name_initial}`}
          timeSlot={selectedResult.time_slot?.time_label || '09:00 – 14:00 น.'}
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
