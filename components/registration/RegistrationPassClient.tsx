'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  XCircle,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { DonorTicketPass } from '@/components/ui/DonorTicketPass';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RegistrationPassClientProps {
  registrationCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  faculty: string;
  timeSlot: string;
  date: string;
  venue: string;
  qrToken: string;
  initialStatus: string;
}

export function RegistrationPassClient({
  registrationCode,
  firstName,
  lastName,
  phone,
  faculty,
  timeSlot,
  date,
  venue,
  qrToken,
  initialStatus,
}: RegistrationPassClientProps) {
  const { isTh } = useLanguage();
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [confirmPhone, setConfirmPhone] = useState(phone || '');
  const [cancelReason, setCancelReason] = useState('ติดภารกิจ / ธุระด่วน');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fullName = `${firstName} ${lastName}`.trim();
  const isCancelled = currentStatus === 'CANCELLED';

  const handleConfirmCancel = async () => {
    setCancelLoading(true);
    setCancelError(null);

    const phoneToSubmit = confirmPhone.trim() || phone.trim();
    if (!phoneToSubmit) {
      setCancelError(isTh ? 'กรุณากรอกเบอร์โทรศัพท์ที่ใช้ลงทะเบียน' : 'Please enter your registered phone number');
      setCancelLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/registrations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationCode,
          phone: phoneToSubmit,
          reason: cancelReason,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentStatus('CANCELLED');
        setCancelModalOpen(false);
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
    <div className="space-y-8">
      {/* Top Banner Alert */}
      {isCancelled ? (
        <div className="text-center space-y-2 animate-in fade-in-50 duration-200">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-[#A6192E] shadow-xs ring-4 ring-rose-50">
            <XCircle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-[var(--ink)] sm:text-3xl font-display">
            {isTh ? 'รหัสลงทะเบียนนี้ถูกยกเลิกแล้ว' : 'Registration Cancelled'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-medium max-w-md mx-auto">
            {isTh
              ? `รหัส ${registrationCode} ได้ถูกยกเลิกแล้ว ไม่สามารถนำมาใช้สแกนเช็กอินในวันงานได้ หากต้องการเข้าร่วมกิจกรรม สามารถลงทะเบียนใหม่ได้ทันที`
              : `Code ${registrationCode} has been cancelled and cannot be used for check-in on event day.`}
          </p>
        </div>
      ) : (
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-xs ring-4 ring-emerald-50">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-[var(--ink)] sm:text-3xl font-display">
            {isTh ? 'ลงทะเบียนบริจาคโลหิตสำเร็จ!' : 'Registration Successful!'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-medium max-w-md mx-auto">
            {isTh
              ? 'ยินดีต้อนรับสู่ MUMT LoveUnit ครั้งที่ 9 กรุณาบันทึกภาพตั๋วนี้เพื่อนำไปแสดงต่อเจ้าหน้าที่ในวันงาน'
              : 'Welcome to 9th MUMT LoveUnit! Please save this pass to present to staff on event day.'}
          </p>
        </div>
      )}

      {/* High-Fidelity Donor Ticket Pass with Active Cancel Support */}
      <DonorTicketPass
        registrationCode={registrationCode}
        name={fullName}
        phone={phone}
        faculty={facultyName(faculty, isTh)}
        timeSlot={timeSlot}
        date={date}
        venue={venue}
        qrToken={qrToken}
        isConfirmed={!isCancelled}
        status={currentStatus}
        onCancel={!isCancelled && currentStatus === 'REGISTERED' ? () => setCancelModalOpen(true) : undefined}
        cancelLabel={isTh ? 'ขอยกเลิกการลงทะเบียน' : 'Cancel Registration'}
        primaryAction={
          isCancelled
            ? {
                href: '/register',
                label: isTh ? 'ลงทะเบียนรอบใหม่' : 'Register New Slot',
                icon: <ArrowRight className="h-4 w-4" />,
              }
            : {
                href: '/prepare',
                label: isTh ? 'ดูข้อปฏิบัติตัวก่อนบริจาค' : 'Preparation Tips',
                icon: <ArrowRight className="h-4 w-4" />,
              }
        }
      />

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <RegistrationCancelModal
          registrationCode={registrationCode}
          donorName={fullName}
          timeSlot={timeSlot}
          phone={confirmPhone}
          onPhoneChange={setConfirmPhone}
          requirePhoneInput={!phone}
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

function facultyName(raw: string | undefined, isTh: boolean) {
  if (raw && raw.trim()) return raw;
  return isTh ? 'คณะเทคนิคการแพทย์ ม.มหิดล' : 'Faculty of Medical Technology, Mahidol University';
}

function RegistrationCancelModal({
  registrationCode,
  donorName,
  timeSlot,
  phone,
  onPhoneChange,
  requirePhoneInput,
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
  phone: string;
  onPhoneChange: (val: string) => void;
  requirePhoneInput: boolean;
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
      aria-labelledby="cancel-ticket-title"
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
              <h3 id="cancel-ticket-title" className="text-base sm:text-lg font-black text-gray-900 font-display">
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

        {/* Phone Confirmation if needed */}
        {requirePhoneInput && (
          <div className="space-y-1.5">
            <label htmlFor="confirm-phone-input" className="block text-xs font-bold text-gray-900">
              {isTh ? 'เบอร์โทรศัพท์ที่ใช้ลงทะเบียน' : 'Registered Phone Number'}{' '}
              <span className="text-red-600">*</span>
            </label>
            <input
              id="confirm-phone-input"
              type="tel"
              required
              placeholder={isTh ? 'เช่น 0812345678' : 'e.g. 0812345678'}
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="editorial-input text-sm font-mono"
            />
          </div>
        )}

        {/* Warning Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-950">
            <span>⚠️ {isTh ? 'ข้อสำคัญหลังจากยกเลิก:' : 'Important Notice:'}</span>
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800">
            <li>
              {isTh
                ? 'รหัสและ QR Code นี้จะไม่สามารถนำมาสแกนเช็กอินในวันงานได้'
                : 'This pass will become void and cannot be scanned'}
            </li>
            <li>
              {isTh
                ? 'หากต้องการเปลี่ยนรอบเวลา สามารถลงทะเบียนใหม่ได้ทันที'
                : 'You can re-register anytime if you wish to reschedule'}
            </li>
          </ul>
        </div>

        {/* Reason Selector */}
        <div className="space-y-1.5">
          <label htmlFor="modal-cancel-reason" className="block text-xs font-bold text-gray-900">
            {isTh ? 'ระบุเหตุผลในการยกเลิก (ถ้ามี)' : 'Reason for Cancellation (Optional)'}
          </label>
          <select
            id="modal-cancel-reason"
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
