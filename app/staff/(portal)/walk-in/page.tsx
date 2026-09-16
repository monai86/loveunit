'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Phone, Loader2, Heart } from 'lucide-react';
import { ParticipantType, DonationExperience } from '@/lib/types/database';
import { MAHIDOL_FACULTIES } from '@/lib/constants/mahidol';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';

export default function StaffWalkInPage() {
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-12">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <Link
          href="/staff/checkin"
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--burgundy-700)] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> <span>กลับสู่หน้าสแกน QR</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[11px] font-black text-rose-800 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-rose-600" />
          <span>ปิดรับ Walk-in แล้ว</span>
        </span>
      </div>

      {/* Closed Notice & Thank You Banner */}
      <div className="mt-6 rounded-3xl border border-rose-200/90 bg-gradient-to-br from-rose-50/80 via-white to-red-50/40 p-6 sm:p-10 text-center space-y-4 shadow-xs">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-600/25">
          <Heart className="h-7 w-7 fill-white/20" />
        </div>
        
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-[var(--burgundy-800)] border border-rose-200 shadow-2xs">
            ● ปิดรับลงทะเบียน Walk-in สำหรับวันนี้แล้ว
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display tracking-tight pt-1">
            คิวผู้บริจาคโลหิตเต็มความจุแล้ว
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
            เนื่องจากมีผู้บริจาคโลหิตให้ความสนใจเข้าร่วมอย่างล้นหลาม และคิวการให้บริการเต็มขีดความสามารถของหน่วยบริการโลหิตเคลื่อนที่แล้ว
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-rose-200/80 p-4 sm:p-5 max-w-md mx-auto shadow-2xs">
          <p className="text-xs sm:text-sm font-bold text-[var(--burgundy-900)] leading-relaxed">
            ทางโครงการ MUMT LoveUnit ขอขอบพระคุณทุกท่านที่ให้ความสนใจและร่วมเป็นส่วนหนึ่งของการส่งต่อชีวิตในกิจกรรมวันนี้เป็นอย่างยิ่ง 🙏❤️
          </p>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/staff/overview"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-800)] text-white text-xs font-bold shadow-xs hover:shadow-sm"
          >
            <span>กลับหน้าภาพรวม Staff</span>
          </Link>
          <Link
            href="/staff/checkin"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold shadow-xs"
          >
            <span>จุดสแกน QR</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
