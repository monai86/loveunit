import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getRegistrationByCode } from '@/services/registration-service';
import { formatTimeRange, formatBangkokTime, isWalkInRecord, pickField } from '@/lib/utils/format';
import { RegistrationPoster } from '@/components/registration/RegistrationPoster';
import { RegistrationPassClient } from '@/components/registration/RegistrationPassClient';
import { Lock, Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ token?: string }>;
}

export const dynamic = 'force-dynamic';

import { EVENT_CONFIG, getFormattedVenue } from '@/lib/constants/event';

export default async function RegistrationDetailPage({ params, searchParams }: PageProps) {
  const { code } = await params;
  const { token } = await searchParams;

  const registration = await getRegistrationByCode(code);

  if (!registration) {
    notFound();
  }

  const regObj = registration;
  const regCode = pickField<string>(regObj, 'registrationCode', 'registration_code') || code;
  const expectedAccessToken = (pickField<string>(regObj, 'accessToken', 'access_token') || '').trim();

  // Enforce private token check via HttpOnly session cookie OR explicit query token
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(`lvu_pass_${regCode}`)?.value || cookieStore.get('lvu_pass_session')?.value;
  const isAuthorized = Boolean(
    (token && token.trim() === expectedAccessToken) ||
    (cookieToken && cookieToken.trim() === expectedAccessToken)
  );

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 space-y-6 animate-in fade-in duration-200">
        <div className="editorial-card p-6 sm:p-8 text-center space-y-5 border-amber-200 bg-gradient-to-b from-white to-amber-50/30">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800 ring-8 ring-amber-50 shadow-xs">
            <Lock className="h-8 w-8 text-amber-700" />
          </div>

          <div className="space-y-2">
            <span className="inline-block font-mono text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              {regCode}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-display">
              ต้องใช้สิทธิ์ยืนยันตัวตนเพื่อเปิดดูตั๋ว (Private Pass)
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              หมายเลขลงทะเบียนนี้เป็นข้อมูลส่วนบุคคล เพื่อความปลอดภัยและการคุ้มครองข้อมูลส่วนบุคคล ท่านสามารถเปิดดูตั๋วและ QR Code ได้ผ่านการค้นหาด้วยเบอร์โทรศัพท์ที่ลงทะเบียนไว้ หรือผ่านลิงก์ที่ได้รับในอีเมล
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/lookup"
              className="editorial-btn-primary min-h-11 flex-1 py-3 text-xs font-bold justify-center"
            >
              <Phone className="h-4 w-4" />
              <span>ค้นหาตั๋วด้วยเบอร์โทรศัพท์ / อีเมล</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-gray-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>ระบบคุ้มครองความปลอดภัยและป้องกันการสุ่มเข้าถึงตั๋วผู้อื่น</span>
          </div>
        </div>

        <RegistrationPoster />
      </div>
    );
  }

  const isWalkIn = isWalkInRecord(regCode) || pickField<string>(regObj, 'source', 'source') === 'WALK_IN';
  const firstName = pickField<string>(regObj, 'firstName', 'first_name') || '';
  const lastName = pickField<string>(regObj, 'lastName', 'last_name') || '';
  const phone = pickField<string>(regObj, 'phone', 'phone') || '';
  const qrToken = pickField<string>(regObj, 'qrToken', 'qr_token') || '';
  const slot = pickField<{ startAt?: string; endAt?: string; start_at?: string; end_at?: string }>(regObj, 'timeSlot', 'time_slot');
  const regTime = pickField<string>(regObj, 'registeredAt', 'registered_at') || pickField<string>(regObj, 'createdAt', 'created_at');
  const timeSlot = isWalkIn
    ? (regTime ? formatBangkokTime(regTime) : formatBangkokTime(new Date()))
    : (slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : EVENT_CONFIG.timeLabelTh);
  const facultyName = pickField<string>(regObj, 'faculty', 'faculty') || 'มหาวิทยาลัยมหิดล';

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 space-y-8">
      {/* Interactive Registration Pass with live Cancellation & Modal */}
      <RegistrationPassClient
        registrationCode={regCode}
        accessToken={expectedAccessToken}
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        faculty={facultyName}
        timeSlot={timeSlot}
        date={EVENT_CONFIG.dateTh}
        venue={getFormattedVenue('th')}
        qrToken={qrToken}
        initialStatus={regObj.status || 'REGISTERED'}
      />

      {/* Event poster matching the visitor's saved language (TH/EN toggle) */}
      <RegistrationPoster />
    </div>
  );
}
