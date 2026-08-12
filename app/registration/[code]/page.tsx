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
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

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
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#7A1020]" />
        <p className="mt-4 text-sm font-bold text-[#29272A]">กำลังค้นหาข้อมูลการลงทะเบียน...</p>
      </div>
    );
  }

  if (errorMsg || !registration) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[#29272A]">ไม่พบข้อมูลการลงทะเบียน</h2>
          <p className="mt-1 text-xs text-gray-600">{errorMsg || 'กรุณาตรวจสอบรหัสลงทะเบียนใหม่อีกครั้ง'}</p>
          
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/register"
              className="rounded-xl bg-[#7A1020] px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-[#8F1327]"
            >
              ลงทะเบียนเข้าร่วมกิจกรรมใหม่
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      
      {/* Page Header */}
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          <img src="/images/logo.png" alt="MUMT LOVE UNIT Logo" className="h-16 w-auto object-contain" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5" />
          บัตรลงทะเบียนบริจาคโลหิตดิจิทัล
        </span>
        <h1 className="mt-4 text-2xl font-black text-[#29272A] sm:text-3xl">
          ลงทะเบียนสำเร็จเรียบร้อยแล้ว!
        </h1>
        <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">
          ขอบพระคุณท่านที่ร่วมเป็นส่วนหนึ่งในการต่อชีวิตด้วยการบริจาคโลหิต
        </p>
      </div>

      {/* QR DIGITAL PASS CARD */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-[#FCE8EC] bg-white shadow-xl">
        
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
        <div className="p-6 text-center sm:p-8 bg-gradient-to-b from-[#FFF9F9] to-white">
          
          <div className="inline-block rounded-2xl border-4 border-[#7A1020]/20 bg-white p-4 shadow-md">
            <QRCodeSVG
              value={registration.qr_token}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Registration Code Badge */}
          <div className="mt-4">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Registration Code</span>
            <div className="mt-0.5 inline-flex items-center gap-2 rounded-xl bg-[#FCE8EC] px-4 py-1.5 text-lg font-black text-[#7A1020] border border-[#7A1020]/20">
              {registration.registration_code}
            </div>
          </div>

          <p className="mt-2 text-[11px] text-gray-500">
            * แสดง QR Code นี้ให้เจ้าหน้าที่สแกน ณ จุดลงทะเบียนวันงาน
          </p>
        </div>

        {/* Details Grid */}
        <div className="border-t border-[#FCE8EC] bg-white p-6 sm:p-8 space-y-4">
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            <div className="rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7A1020]">
                <User className="h-4 w-4" /> ชื่อ-นามสกุล
              </div>
              <p className="mt-1 text-sm font-extrabold text-[#29272A]">
                {registration.first_name} {registration.last_name}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {getParticipantTypeLabel(registration.participant_type)}
                {registration.faculty ? ` (${registration.faculty})` : ''}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
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

          <div className="rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC] flex items-start gap-3">
            <MapPin className="h-5 w-5 text-[#B42336] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-[#29272A]">สถานที่จัดงาน</span>
              <p className="text-xs text-gray-700 mt-0.5">
                {registration.event ? registration.event.venue_detail : 'ห้องประชุม 217 และ 218 ชั้น 2 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา'}
              </p>
            </div>
          </div>

          {/* Donor Preparation Reminder */}
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1.5 text-amber-950">
              <BookOpen className="h-4 w-4 text-amber-700" />
              ข้อปฏิบัติสำคัญก่อนวันบริจาคโลหิต:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>นอนหลับพักผ่อนอย่างน้อย 6 ชั่วโมงขึ้นไป</li>
              <li>ดื่มน้ำสะอาด 3-4 แก้ว ก่อนบริจาคโลหิต 30 นาที</li>
              <li>รับประทานอาหารมื้อหลักก่อนมาบริจาค (งดอาหารไขมันสูง)</li>
              <li>นำบัตรประชาชน หรือบัตรผู้บริจาคโลหิตมาด้วย</li>
            </ul>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="border-t border-[#FCE8EC] bg-gray-50 p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/prepare"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            <BookOpen className="h-4 w-4 text-[#7A1020]" />
            ดูคู่มือการเตรียมตัว
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#7A1020] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#8F1327]"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับสู่หน้าหลัก
          </Link>
        </div>

      </div>

    </div>
  );
}
