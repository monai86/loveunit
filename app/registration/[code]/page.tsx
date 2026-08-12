'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Share2, 
  Download, 
  AlertCircle, 
  Sparkles, 
  Heart,
  BookOpen,
  ArrowLeft,
  XCircle,
  Loader2
} from 'lucide-react';
import { Registration } from '@/lib/types/database';
import { 
  formatThaiDate, 
  formatTimeRange, 
  getParticipantTypeLabel, 
  getDonationExperienceLabel, 
  getRegistrationStatusBadge 
} from '@/lib/utils/format';

export default function RegistrationConfirmationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/registrations/${code}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setRegistration(data.registration);
        } else {
          setErrorMsg(data.message || 'ไม่พบข้อมูลการลงทะเบียนสำหรับรหัสนี้');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [code]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="bloom-card p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#7A1020]" />
          <p className="text-xs font-bold text-gray-600">กำลังโหลดบัตรลงทะเบียนดิจิทัล...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !registration) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="bloom-card p-8 text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-lg font-black text-[#1F1A1C]">ไม่พบข้อมูลบัตรลงทะเบียน</h2>
          <p className="text-xs text-gray-600">{errorMsg}</p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/register"
              className="bloom-btn-primary py-2.5 text-xs justify-center"
            >
              ลงทะเบียนเข้าร่วมกิจกรรมใหม่
            </Link>
            <Link
              href="/"
              className="bloom-btn-secondary py-2.5 text-xs justify-center"
            >
              กลับสู่หน้าแรก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const badge = getRegistrationStatusBadge(registration.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 border border-[#F9D5DC] shadow-xs">
            <img src="/images/logo.png" alt="MUMT Logo" className="h-full w-auto object-contain" />
          </div>
        </div>

        <span className="bloom-badge py-1 px-3.5 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          บัตรลงทะเบียนบริจาคโลหิตดิจิทัล
        </span>

        <h1 className="text-2xl font-black text-[#1F1A1C] sm:text-3xl">
          ลงทะเบียนสำเร็จเรียบร้อยแล้ว!
        </h1>
        <p className="text-xs font-medium text-gray-600 sm:text-sm">
          ขอบพระคุณท่านที่ร่วมเป็นส่วนหนึ่งในการต่อชีวิตด้วยการบริจาคโลหิต
        </p>
      </div>

      {/* QR DIGITAL PASS CARD */}
      <div className="bloom-card overflow-hidden bg-white shadow-lg">
        
        {/* Card Header Bar */}
        <div className="bg-gradient-to-r from-[#7A1020] via-[#8F1327] to-[#7A1020] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-white text-white" />
            <span className="text-xs font-extrabold tracking-wide uppercase">MUMT Blood Donation 2026 Pass</span>
          </div>
          <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${badge.colorClass}`}>
            {badge.label}
          </span>
        </div>

        {/* QR Code Container */}
        <div className="p-6 text-center sm:p-8 bg-[#FFF8F9]">
          
          <div className="inline-block rounded-3xl border-4 border-[#F9D5DC] bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={registration.qr_token}
              size={190}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Registration Code Badge */}
          <div className="mt-4">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Registration Code</span>
            <div className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-[#FCE8EC] px-5 py-2 text-xl font-black text-[#7A1020] border border-[#F9D5DC]">
              {registration.registration_code}
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            * แสดง QR Code นี้ให้เจ้าหน้าที่สแกน ณ จุดลงทะเบียนวันงาน
          </p>
        </div>

        {/* Details Grid */}
        <div className="border-t border-[#F9D5DC] bg-white p-6 sm:p-8 space-y-4">
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            <div className="bloom-card p-4 bg-[#FFF8F9]/80 border-[#F9D5DC]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7A1020]">
                <User className="h-4 w-4" /> ชื่อ-นามสกุล
              </div>
              <p className="mt-1 text-sm font-extrabold text-[#1F1A1C]">
                {registration.first_name} {registration.last_name}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {getParticipantTypeLabel(registration.participant_type)}
                {registration.faculty ? ` (${registration.faculty})` : ''}
              </p>
            </div>

            <div className="bloom-card p-4 bg-[#FFF8F9]/80 border-[#F9D5DC]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7A1020]">
                <Clock className="h-4 w-4" /> ช่วงเวลาที่แนะนำเดินทางมาถึง
              </div>
              <p className="mt-1 text-sm font-extrabold text-[#B42336]">
                {registration.time_slot ? formatTimeRange(registration.time_slot.start_at, registration.time_slot.end_at) : 'ไม่ระบุ'}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {registration.event ? formatThaiDate(registration.event.start_at) : 'วันพุธที่ 16 กันยายน 2569'}
              </p>
            </div>

          </div>

          <div className="bloom-card p-4 bg-[#FFF8F9]/80 border-[#F9D5DC] flex items-start gap-3">
            <MapPin className="h-5 w-5 text-[#B42336] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-[#1F1A1C]">สถานที่จัดงาน</span>
              <p className="text-xs text-gray-700 mt-0.5">
                {registration.event ? registration.event.venue_detail : 'ห้องประชุม 217 และ 218 ชั้น 2 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href="/"
          className="bloom-btn-secondary py-3 px-6 text-xs justify-center flex-1"
        >
          <ArrowLeft className="h-4 w-4" /> กลับสู่หน้าหลัก
        </Link>

        <Link
          href="/prepare"
          className="bloom-btn-primary py-3 px-6 text-xs justify-center flex-1"
        >
          <BookOpen className="h-4 w-4" /> ดูข้อปฏิบัติตัวก่อนบริจาค
        </Link>
      </div>

    </div>
  );
}
