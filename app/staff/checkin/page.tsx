'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Play, 
  CheckSquare, 
  Printer, 
  XCircle, 
  UserPlus,
  Flashlight,
  Camera,
  Clock,
  Users
} from 'lucide-react';

interface RegistrationDetail {
  id: string;
  registrationCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  participantType: string;
  facultyName: string;
  timeSlotText: string;
  status: 'REGISTERED' | 'CHECKED_IN' | 'IN_PROCESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  checkedInAt?: string;
}

export default function StaffCheckinPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [registration, setRegistration] = useState<RegistrationDetail | null>({
    id: 'demo-123',
    registrationCode: 'MUMT2026-00012345',
    firstName: 'นายธนภัทร',
    lastName: 'ใจดี',
    phone: '081-234-5678',
    participantType: 'นักศึกษา',
    facultyName: 'คณะเทคนิคการแพทย์',
    timeSlotText: '08:00 - 15:00',
    status: 'REGISTERED',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Stats Counters
  const [stats, setStats] = useState({
    totalToday: 126,
    checkedIn: 98,
    inProcess: 32,
    completed: 66,
    cancelled: 12,
  });

  // Search donor by Code or Phone
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/staff/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (res.ok && data.registration) {
        setRegistration(data.registration);
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่พบข้อมูลผู้บริจาคที่ค้นหา' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
    } finally {
      setLoading(false);
    }
  };

  // Perform Status Transition Action (CHECK-IN / START / COMPLETE / CANCEL)
  const handleStatusChange = async (targetStatus: 'CHECKED_IN' | 'IN_PROCESS' | 'COMPLETED' | 'CANCELLED') => {
    if (!registration) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/staff/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id, status: targetStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegistration({ ...registration, status: targetStatus, checkedInAt: new Date().toISOString() });
        
        let successText = 'ดำเนินการสำเร็จ!';
        if (targetStatus === 'CHECKED_IN') successText = `เช็คอินสำเร็จ! ${registration.firstName} ${registration.lastName}`;
        if (targetStatus === 'IN_PROCESS') successText = `เริ่มขั้นตอนบริจาคโลหิตสำหรับ ${registration.firstName}`;
        if (targetStatus === 'COMPLETED') successText = `การบริจาคเสร็จสมบูรณ์! ขอขอบคุณ ${registration.firstName}`;
        if (targetStatus === 'CANCELLED') successText = `ยกเลิกรายการสำหรับ ${registration.firstName}`;

        setMessage({ type: 'success', text: successText });
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่สามารถดำเนินการได้' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5C7B8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="unit-tag text-[10px]">STAFF DASHBOARD</span>
            <span className="unit-tag-outline text-[10px]">CONFIRMATION & EVENT-DAY EXPERIENCE</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-[#282828] sm:text-3xl">
            ระบบเช็คอินและคัดกรองผู้บริจาคโลหิตหน้างาน
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/staff/walk-in"
            className="inline-flex items-center gap-1.5 bg-[#8E0015] hover:bg-[#7A1020] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>ลงทะเบียน Walk-in</span>
          </Link>
        </div>
      </div>

      {/* DONOR SUMMARY PANEL (ITEM 10 IN IMAGE 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white border border-[#D5C7B8] rounded-2xl p-4 shadow-xs">
        <div className="text-center border-r border-[#D5C7B8] pr-2">
          <span className="text-[10px] font-mono font-bold text-[#666666] block">ผู้ลงทะเบียนวันนี้</span>
          <span className="text-xl font-mono font-black text-[#282828]">{stats.totalToday} <span className="text-xs">คน</span></span>
        </div>

        <div className="text-center border-r border-[#D5C7B8] pr-2">
          <span className="text-[10px] font-mono font-bold text-emerald-700 block">เช็คอินแล้ว</span>
          <span className="text-xl font-mono font-black text-emerald-700">{stats.checkedIn} <span className="text-xs">คน</span></span>
        </div>

        <div className="text-center border-r border-[#D5C7B8] pr-2">
          <span className="text-[10px] font-mono font-bold text-blue-700 block">กำลังบริจาค</span>
          <span className="text-xl font-mono font-black text-blue-700">{stats.inProcess} <span className="text-xs">คน</span></span>
        </div>

        <div className="text-center border-r border-[#D5C7B8] pr-2">
          <span className="text-[10px] font-mono font-bold text-amber-700 block">เสร็จสิ้นแล้ว</span>
          <span className="text-xl font-mono font-black text-amber-700">{stats.completed} <span className="text-xs">คน</span></span>
        </div>

        <div className="text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono font-bold text-red-700 block">ยกเลิก/ไม่มา</span>
          <span className="text-xl font-mono font-black text-red-700">{stats.cancelled} <span className="text-xs">คน</span></span>
        </div>
      </div>

      {/* TOAST NOTIFICATION MESSAGES (ITEM 07 IN IMAGE 2) */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between shadow-xs ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
          message.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-900' :
          'bg-red-50 border-red-300 text-red-900'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-bold underline">ปิด</button>
        </div>
      )}

      {/* STAFF CHECK-IN TABLET SPLIT LAYOUT (ITEM 11 IN IMAGE 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: SCANNER VIEWPORT (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-[#D5C7B8] rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D5C7B8] pb-3">
            <h2 className="text-xs font-mono font-bold text-[#8E0015] uppercase tracking-wider">
              02 QR CODE สำหรับยืนยันตัวตน
            </h2>
            <span className="text-[10px] font-mono font-bold text-[#666666]">CAMERA VIEWPORT</span>
          </div>

          {/* Dark Reticle Camera Box */}
          <div className="relative aspect-square w-full rounded-xl bg-[#1A1A1A] p-4 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner border-2 border-[#282828]">
            
            {/* Target Reticle Lines */}
            <div className="absolute inset-8 border-2 border-dashed border-[#C13A2B]/80 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="h-6 w-6 border-t-2 border-l-2 border-red-500 absolute -top-1 -left-1" />
              <div className="h-6 w-6 border-t-2 border-r-2 border-red-500 absolute -top-1 -right-1" />
              <div className="h-6 w-6 border-b-2 border-l-2 border-red-500 absolute -bottom-1 -left-1" />
              <div className="h-6 w-6 border-b-2 border-r-2 border-red-500 absolute -bottom-1 -right-1" />
            </div>

            <QrCode className="h-12 w-12 text-white/40 mb-2 animate-pulse" />
            <p className="text-xs font-bold text-white text-center">สแกน QR Code / บัตรยืนยัน / บัตรประชาชน</p>
            <p className="text-[11px] text-white/60 text-center mt-1">วางให้อยู่ในกรอบเพื่อสแกนอัตโนมัติ</p>

            {/* Bottom Controls */}
            <div className="absolute bottom-3 flex items-center gap-3">
              <button type="button" className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold flex items-center gap-1.5">
                <Flashlight className="h-3.5 w-3.5" />
                <span>เปิดไฟฉาย</span>
              </button>

              <button type="button" className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" />
                <span>สลับกล้อง</span>
              </button>
            </div>

          </div>

          {/* Quick Manual Search */}
          <form onSubmit={handleSearch} className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-[#282828]">04 ค้นหาและผลการค้นหา</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ค้นหาชื่อ / เบอร์โทร / รหัสยืนยัน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="editorial-input flex-1"
              />
              <button type="submit" disabled={loading} className="editorial-btn-primary py-2 px-4 text-xs">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

        </div>

        {/* RIGHT PANEL: DONOR DETAILS & LARGE ACTION BUTTONS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {registration ? (
            <div className="bg-white border border-[#D5C7B8] rounded-2xl p-6 space-y-6 shadow-xs">
              
              {/* Header Details */}
              <div className="flex items-center justify-between border-b border-[#D5C7B8] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#666666] uppercase block">REGISTRATION CODE</span>
                  <span className="text-2xl font-mono font-black text-[#8E0015]">{registration.registrationCode}</span>
                </div>

                <div>
                  {registration.status === 'REGISTERED' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">REGISTERED</span>
                  )}
                  {registration.status === 'CHECKED_IN' && (
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">CHECKED IN</span>
                  )}
                  {registration.status === 'IN_PROCESS' && (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">IN PROCESS</span>
                  )}
                  {registration.status === 'COMPLETED' && (
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold">COMPLETED</span>
                  )}
                </div>
              </div>

              {/* Donor Data Fields */}
              <div className="space-y-3 text-xs border-b border-[#D5C7B8] pb-4">
                <div className="flex justify-between py-1">
                  <span className="text-[#666666] font-bold">ชื่อ-นามสกุล:</span>
                  <span className="text-base font-black text-[#282828]">{registration.firstName} {registration.lastName}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[#666666] font-bold">เบอร์โทรศัพท์:</span>
                  <span className="font-mono font-bold text-[#282828]">{registration.phone}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[#666666] font-bold">คณะ / สังกัด:</span>
                  <span className="font-bold text-[#282828]">{registration.facultyName} ({registration.participantType})</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[#666666] font-bold">รอบเวลาที่จอง:</span>
                  <span className="font-mono font-black text-[#8E0015]">{registration.timeSlotText} น.</span>
                </div>
              </div>

              {/* 08 LARGE ACTION BUTTONS MATCHING ITEM 08 IN IMAGE 2 */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-[#8E0015] uppercase tracking-wider block">
                  08 ปุ่มการทำงานหลักสำหรับเจ้าหน้าที่ (LARGE ACTION BUTTONS)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  {/* Button 1: CHECK-IN */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('CHECKED_IN')}
                    className="p-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <UserCheck className="h-5 w-5" />
                    <span>เช็คอิน</span>
                    <span className="text-[9px] font-mono opacity-80 uppercase">CHECK-IN</span>
                  </button>

                  {/* Button 2: START */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('IN_PROCESS')}
                    className="p-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Play className="h-5 w-5 fill-white" />
                    <span>เริ่มบริจาค</span>
                    <span className="text-[9px] font-mono opacity-80 uppercase">START</span>
                  </button>

                  {/* Button 3: COMPLETE */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('COMPLETED')}
                    className="p-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <CheckSquare className="h-5 w-5" />
                    <span>จบกระบวนการ</span>
                    <span className="text-[9px] font-mono opacity-80 uppercase">COMPLETE</span>
                  </button>

                  {/* Button 4: CANCEL */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('CANCELLED')}
                    className="p-3.5 rounded-xl bg-white border-2 border-red-600 text-red-700 hover:bg-red-50 font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>ยกเลิกคิว</span>
                    <span className="text-[9px] font-mono opacity-80 uppercase">CANCEL</span>
                  </button>

                </div>
              </div>

              {/* Activity Log Timeline */}
              <div className="pt-4 border-t border-[#D5C7B8] space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#666666] uppercase block">ประวัติการดำเนินการ</span>
                <div className="space-y-1.5 text-[11px] font-mono text-[#282828]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                    <span>10:15 น. — ลงทะเบียนออนไลน์สำเร็จ</span>
                  </div>
                  {registration.checkedInAt && (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      <span>10:16 น. — เช็คอินเข้าร่วมงาน ณ จุดคัดกรอง</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#D5C7B8] rounded-2xl p-12 text-center text-[#666666]">
              <Search className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-[#282828]">รอการสแกนหรือค้นหาผู้บริจาค</p>
              <p className="text-xs">พิมพ์ชื่อ เบอร์โทร หรือสแกน QR Code เพื่อดึงข้อมูล</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
