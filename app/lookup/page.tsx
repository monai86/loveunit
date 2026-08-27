'use client';

import React, { useState } from 'react';
import { AlertTriangle, Search, ShieldCheck, Loader2 } from 'lucide-react';
import { DonorTicketPass } from '@/components/ui/DonorTicketPass';

interface LookupResult {
  registration_code: string;
  qr_token: string;
  first_name: string;
  last_name_initial: string;
  participant_type: string;
  status: string;
  time_slot: { time_label: string } | null;
  event: { name?: string; start_at?: string; venue_name?: string } | null;
}

export default function LookupPage() {
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phone.trim() || !firstName.trim() || !lastName.trim()) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/registrations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), firstName: firstName.trim(), lastName: lastName.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.registration) {
        setResult(data.registration);
      } else {
        setResult(null);
        setErrorMessage(data.message || 'ไม่พบข้อมูลการลงทะเบียน');
      }
    } catch {
      setResult(null);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--line)]">
        <h1 className="text-2xl font-black text-[var(--ink)] sm:text-3xl">ลืม QR Code หรือรหัสลงทะเบียน?</h1>
        <p className="mt-2 text-[15px] text-[var(--muted)] font-medium leading-relaxed">
          กรอกเบอร์โทรศัพท์และชื่อ-นามสกุลที่ใช้ลงทะเบียน เพื่อยืนยันตัวตนและนำ QR Code กลับมาแสดงอีกครั้ง
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--danger-bg)] border border-[#E8B9C1] text-sm font-bold text-[var(--danger)] flex items-start gap-2.5">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!result ? (
        <form onSubmit={handleSubmit} className="editorial-card p-6 sm:p-8 space-y-5">
          <div>
            <label htmlFor="lk-phone" className="block text-xs font-bold text-editorial-ink mb-1.5">
              เบอร์โทรศัพท์มือถือ <span className="text-red-600">*</span>
            </label>
            <input
              id="lk-phone"
              type="tel"
              required
              placeholder="เช่น 0812345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="editorial-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lk-firstName" className="block text-xs font-bold text-editorial-ink mb-1.5">
                ชื่อจริง <span className="text-red-600">*</span>
              </label>
              <input
                id="lk-firstName"
                type="text"
                required
                placeholder="เช่น สมชาย"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="editorial-input"
              />
            </div>
            <div>
              <label htmlFor="lk-lastName" className="block text-xs font-bold text-editorial-ink mb-1.5">
                นามสกุล <span className="text-red-600">*</span>
              </label>
              <input
                id="lk-lastName"
                type="text"
                required
                placeholder="เช่น ใจดี"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="editorial-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="editorial-btn-primary w-full py-3.5 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังค้นหา...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>ค้นหาการลงทะเบียนของฉัน</span>
              </>
            )}
          </button>

          <div className="flex items-start gap-2 pt-2 text-[11px] text-editorial-muted font-medium">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              ระบบจะแสดงเฉพาะชื่อต้น นามสกุลขึ้นต้น และรหัสลงทะเบียน — ไม่เปิดเผยเบอร์โทรหรืออีเมลของคุณต่อสาธารณะ
            </span>
          </div>
        </form>
      ) : (
        <DonorTicketPass
          registrationCode={result.registration_code}
          name={`${result.first_name} ${result.last_name_initial}`}
          timeSlot={result.time_slot?.time_label || '09:00 - 14:00 น.'}
          date={result.event?.start_at ? 'พุธที่ 16 กันยายน 2569' : 'พุธที่ 16 กันยายน 2569'}
          venue={result.event?.venue_name || 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา'}
          qrToken={result.qr_token}
          isConfirmed={result.status !== 'CANCELLED'}
          onReset={() => {
            setResult(null);
            setErrorMessage(null);
          }}
          resetLabel="ค้นหาการลงทะเบียนอื่น"
        />
      )}
    </div>
  );
}
