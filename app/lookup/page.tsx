'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle } from 'lucide-react';
import { Search, ArrowLeft, QrCode, ShieldCheck, Loader2 } from 'lucide-react';

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
    } catch (_err) {
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
        <div className="editorial-ticket p-6 sm:p-8 space-y-5 bg-white">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-editorial-muted uppercase tracking-wider block">
              พบการลงทะเบียนของคุณ
            </span>
            <p className="text-lg font-black text-editorial-ink">
              {result.first_name} {result.last_name_initial}
            </p>
            {result.time_slot && (
              <p className="text-xs font-bold text-[#7A1020]">
                รอบเวลาเดินทาง: {result.time_slot.time_label}
              </p>
            )}
          </div>

          <div className="bg-[#FFF9F9] p-4 rounded-lg border border-[#F0C4CC] text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-editorial-muted uppercase tracking-wider block">
              REGISTRATION CODE
            </span>
            <div className="text-2xl font-mono font-black text-[#7A1020] tracking-wider">
              {result.registration_code}
            </div>
          </div>

          <div className="pt-2 border-t-2 border-dashed border-[#7A1020] text-center space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#7A1020] uppercase tracking-wider block">
              QR CODE FOR EVENT SCAN
            </span>
            {result.qr_token ? (
              <div className="mx-auto h-48 w-48 rounded-xl border-2 border-[#7A1020] p-2 bg-white flex items-center justify-center shadow-xs">
                <QRCodeSVG value={result.qr_token} size={176} level="M" />
              </div>
            ) : (
              <div className="mx-auto h-48 w-48 rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
                <QrCode className="h-8 w-8" />
              </div>
            )}
            <p className="text-[11px] text-editorial-muted font-medium">
              บันทึกภาพหน้านี้ หรือแสดง QR Code ต่อเจ้าหน้าที่ ณ จุดลงทะเบียนในวันงาน
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setResult(null); setErrorMessage(null); }}
              className="editorial-btn-secondary py-2.5 text-xs justify-center flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ค้นหาใหม่</span>
            </button>
            <Link href="/" className="editorial-btn-primary py-2.5 text-xs justify-center flex-1">
              <span>กลับหน้าแรก</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
