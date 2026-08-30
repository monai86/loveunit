'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Search, ShieldCheck, Loader2, User, Clock, ArrowRight, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import { DonorTicketPass } from '@/components/ui/DonorTicketPass';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LookupResult {
  registration_code: string;
  qr_token: string;
  first_name: string;
  last_name?: string;
  last_name_initial: string;
  participant_type: string;
  faculty?: string | null;
  status: string;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMatches([]);
    setSelectedResult(null);

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 9) {
      setErrorMessage(isTh ? 'กรุณากรอกเบอร์โทรศัพท์มือถือ 9-10 หลักให้ถูกต้อง' : 'Please enter a valid 9-10 digit mobile phone number');
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
          setErrorMessage(isTh ? 'ไม่พบข้อมูลการลงทะเบียนที่ตรงกับเบอร์นี้' : 'No registration found for this number');
        }
      } else {
        setErrorMessage(data.message || (isTh ? 'ไม่พบข้อมูลการลงทะเบียนที่ตรงกับเบอร์โทรศัพท์นี้' : 'Registration record not found'));
      }
    } catch {
      setErrorMessage(isTh ? 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้ง' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSelectedResult(null);
    setMatches([]);
    setErrorMessage(null);
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
            ? 'กรอกเฉพาะเบอร์โทรศัพท์มือถือที่ใช้ลงทะเบียน เพื่อเปิดดูตั๋วและ QR Code สำหรับสแกนเช็กอินในวันงาน'
            : 'Enter your registered mobile phone number to retrieve your check-in pass and QR Code.'}
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
              <Link href="/register" className="underline font-black hover:text-[var(--burgundy-800)] flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{isTh ? 'ลงทะเบียนที่นี่' : 'Register here'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CASE 1: Single Result Selected -> Show Digital Pass */}
      {selectedResult ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleResetSearch}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{isTh ? '← ค้นหาด้วยเบอร์อื่น หรือเลือกรายชื่ออื่น' : '← Search another number / Choose name'}</span>
          </button>

          <DonorTicketPass
            registrationCode={selectedResult.registration_code}
            name={`${selectedResult.first_name} ${selectedResult.last_name_initial}`}
            timeSlot={selectedResult.time_slot?.time_label || '09:00 – 14:00 น.'}
            date={isEn ? 'Wednesday, September 16, 2026' : 'พุธที่ 16 กันยายน 2569'}
            venue={selectedResult.event?.venue_name || (isEn ? 'Meeting Room 217, Sirividhaya Building, Mahidol University Salaya' : 'ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา')}
            qrToken={selectedResult.qr_token}
            isConfirmed={selectedResult.status !== 'CANCELLED'}
            onReset={handleResetSearch}
            resetLabel={isTh ? 'ค้นหาตั๋วของเบอร์อื่น' : 'Search Another Number'}
          />
        </div>
      ) : matches.length > 1 ? (
        /* CASE 2: Multiple Matches Found -> Candidate Selection Picker */
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          <div className="p-4 rounded-2xl bg-[var(--rose-100)] border border-[var(--burgundy-200)] text-[var(--burgundy-800)]">
            <div className="flex items-center gap-2 font-black text-sm font-display">
              <CheckCircle2 className="h-4 w-4 text-[var(--burgundy-700)]" />
              <span>{isTh ? `พบผู้ลงทะเบียนด้วยเบอร์นี้ ${matches.length} ท่าน` : `Found ${matches.length} registrations for this phone`}</span>
            </div>
            <p className="mt-1 text-xs text-[var(--burgundy-700)] font-medium">
              {isTh 
                ? 'กรุณาแตะเลือกชื่อของคุณด้านล่าง เพื่อเปิดตั๋วและ QR Code เช็กอิน'
                : 'Please tap your name below to open your QR Code check-in pass.'}
            </p>
          </div>

          <div className="space-y-3">
            {matches.map((item, idx) => (
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
                        {item.participant_type === 'STUDENT' ? (isTh ? 'นักศึกษา' : 'Student') : item.participant_type === 'STAFF' ? (isTh ? 'บุคลากร' : 'Staff') : (isTh ? 'บุคคลทั่วไป' : 'General')}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-[var(--ink)] group-hover:text-[var(--burgundy-700)] transition-colors flex items-center gap-2">
                      <User className="h-4 w-4 text-[var(--burgundy-600)] shrink-0" />
                      <span>{item.first_name} {item.last_name || item.last_name_initial}</span>
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-[var(--muted)] flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>{item.time_slot?.time_label || (isTh ? 'รอบ Walk-in วันงาน' : 'Walk-in')}</span>
                      </span>
                      {item.faculty && (
                        <span>· {item.faculty}</span>
                      )}
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
            ))}
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
      ) : (
        /* CASE 3: Initial Search Form (Phone Only) */
        <form onSubmit={handleSubmit} className="editorial-card p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="lk-phone" className="block text-xs font-bold text-[var(--ink)] mb-2">
              {isTh ? 'เบอร์โทรศัพท์มือถือที่ลงทะเบียน' : 'Registered Mobile Phone'} <span className="text-red-600">*</span>
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
                ? '* กรอกเบอร์มือถือที่เคยกรอกไว้ตอนลงทะเบียน (ระบบจะดึงตั๋วและ QR Code ของคุณขึ้นมาให้ทันที)' 
                : '* Enter the phone number used during registration to load your pass'}
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
      )}
    </div>
  );
}
