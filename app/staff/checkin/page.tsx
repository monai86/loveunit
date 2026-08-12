'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QrCode, Search, CheckCircle2, UserCheck, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';

interface RegistrationDetail {
  id: string;
  registrationCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  participantType: string;
  facultyName: string;
  timeSlotText: string;
  status: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';
  checkedInAt?: string;
}

export default function StaffCheckinPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search donor by Code or Phone
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage(null);
    setRegistration(null);

    try {
      const res = await fetch(`/api/staff/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (res.ok && data.registration) {
        setRegistration(data.registration);
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่พบข้อมูลการลงทะเบียนนี้' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
    } finally {
      setLoading(false);
    }
  };

  // Perform 1-Tap Check-in
  const handleCheckin = async () => {
    if (!registration) return;

    setCheckinLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/staff/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegistration({ ...registration, status: 'CHECKED_IN', checkedInAt: new Date().toISOString() });
        setMessage({ type: 'success', text: `เช็คอินสำเร็จ! ${registration.firstName} ${registration.lastName}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่สามารถเช็คอินได้' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเช็คอิน' });
    } finally {
      setCheckinLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Top Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0C4CC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="unit-tag text-[10px]">STAFF PORTAL</span>
            <span className="unit-tag-outline text-[10px]">OPERATIONAL CHECK-IN</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-editorial-ink sm:text-3xl">
            ระบบเช็คอินผู้บริจาคโลหิต
          </h1>
        </div>

        <Link
          href="/staff/walk-in"
          className="editorial-btn-secondary py-2.5 px-4 text-xs font-bold self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4 text-[#7A1020]" />
          <span>ลงทะเบียน Walk-in</span>
        </Link>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg text-xs font-bold border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? '✅ ' : '⚠️ '}{message.text}
        </div>
      )}

      {/* Fast 2-Column Operational Layout for iPad / Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Search & Camera Scanner (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="editorial-card p-6 space-y-4">
            <h2 className="text-xs font-mono font-bold text-[#7A1020] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
              SEARCH OR SCAN DONOR
            </h2>

            <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                  ค้นหาด้วย รหัสลงทะเบียน / เบอร์โทร / ชื่อ
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เช่น MBD26-XXXXXX หรือ 0812345678"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="editorial-input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="editorial-btn-primary py-2.5 px-4 text-xs shrink-0"
                  >
                    <Search className="h-4 w-4" />
                    <span>ค้นหา</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center">
              <div className="p-8 border-2 border-dashed border-[#7A1020] rounded-xl bg-[#FFF9F9] text-center space-y-2">
                <QrCode className="h-10 w-10 text-[#7A1020] mx-auto" />
                <p className="text-xs font-bold text-editorial-ink">พร้อมสแกน QR Code จากกล้อง</p>
                <p className="text-[11px] text-editorial-muted font-medium">
                  ใช้เครื่องสแกนบาร์โค้ด หรือกล้องมือถือ/iPad สแกน QR Code เพื่อดึงข้อมูลทันที
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Registration Details & 1-Tap Checkin Action (7 Cols) */}
        <div className="lg:col-span-7">
          {registration ? (
            <div className="editorial-card p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#F0C4CC] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase block">REGISTRATION CODE</span>
                  <span className="text-2xl font-mono font-black text-[#7A1020]">{registration.registrationCode}</span>
                </div>

                <div>
                  {registration.status === 'CHECKED_IN' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      เช็คอินแล้ว
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                      รอยืนยันเช็คอิน
                    </span>
                  )}
                </div>
              </div>

              {/* Donor Details Table */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-editorial-muted font-bold">ชื่อ-นามสกุล:</span>
                  <span className="text-sm font-black text-editorial-ink">{registration.firstName} {registration.lastName}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-editorial-muted font-bold">เบอร์โทรศัพท์:</span>
                  <span className="font-mono font-bold text-editorial-ink">{registration.phone}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-editorial-muted font-bold">คณะ / สังกัด:</span>
                  <span className="font-bold text-editorial-ink">{registration.facultyName}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-editorial-muted font-bold">รอบเวลาจอง:</span>
                  <span className="font-mono font-black text-[#7A1020]">{registration.timeSlotText} น.</span>
                </div>
              </div>

              {/* Dominant Check-in Action Button */}
              <div className="pt-4 border-t border-[#F0C4CC]">
                {registration.status === 'CHECKED_IN' ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                    <p className="text-xs font-black text-emerald-800">ผู้บริจาครายนี้ทำการเช็คอินเข้าร่วมงานเรียบร้อยแล้ว</p>
                    {registration.checkedInAt && (
                      <p className="text-[11px] font-mono text-emerald-700">
                        เวลาเช็คอิน: {new Date(registration.checkedInAt).toLocaleTimeString('th-TH')}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={checkinLoading}
                    onClick={handleCheckin}
                    className="editorial-btn-primary w-full py-4 text-sm font-black justify-center shadow-lg"
                  >
                    {checkinLoading ? (
                      <span>กำลังบันทึกการเช็คอิน...</span>
                    ) : (
                      <>
                        <UserCheck className="h-5 w-5" />
                        <span>ยืนยันการเช็คอิน (CHECK-IN)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="editorial-card p-12 text-center text-editorial-muted space-y-2">
              <Search className="h-8 w-8 mx-auto text-gray-300" />
              <p className="text-xs font-bold">รอการสแกนหรือค้นหาผู้บริจาค</p>
              <p className="text-[11px]">พิมพ์ชื่อ เบอร์โทร หรือรหัสลงทะเบียน เพื่อแสดงรายละเอียดและเช็คอิน</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
