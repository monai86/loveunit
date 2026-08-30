import React from 'react';
import { notFound } from 'next/navigation';
import { CheckCircle2, ArrowRight, XCircle } from 'lucide-react';
import { getRegistrationByCode } from '@/services/registration-service';
import { formatTimeRange, formatBangkokTime, isWalkInRecord } from '@/lib/utils/format';
import { RegistrationPoster } from '@/components/registration/RegistrationPoster';
import { DonorTicketPass } from '@/components/ui/DonorTicketPass';

// Registration may arrive from either the Drizzle backend (camelCase) or the
// legacy in-memory backend (snake_case); this view type covers both shapes.
interface RegistrationView {
  registrationCode?: string;
  registration_code?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  phone?: string;
  qrToken?: string;
  qr_token?: string;
  faculty?: string | null;
  status?: string;
  source?: string;
  registeredAt?: string;
  registered_at?: string;
  createdAt?: string;
  created_at?: string;
  timeSlot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
  time_slot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
}

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function RegistrationDetailPage({ params }: PageProps) {
  const { code } = await params;
  const registration = await getRegistrationByCode(code);

  if (!registration) {
    notFound();
  }

  const reg = registration as RegistrationView;
  const regCode = reg.registrationCode || reg.registration_code || code;
  const isWalkIn = isWalkInRecord(regCode) || reg.source === 'WALK_IN';
  const firstName = reg.firstName || reg.first_name || '';
  const lastName = reg.lastName || reg.last_name || '';
  const fullName = `${firstName} ${lastName}`;
  const phone = reg.phone || '';
  const qrToken = reg.qrToken || reg.qr_token || '';
  const slot = reg.timeSlot || reg.time_slot;
  const regTime = reg.registeredAt || reg.registered_at || reg.createdAt || reg.created_at;
  const timeSlot = isWalkIn
    ? (regTime ? formatBangkokTime(regTime) : formatBangkokTime(new Date()))
    : (slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : '09:00 – 14:00 น.');
  const facultyName = reg.faculty || 'มหาวิทยาลัยมหิดล';
  const isCancelled = reg.status === 'CANCELLED';

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Top Banner Alert */}
      {isCancelled ? (
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-[#A6192E] shadow-xs ring-4 ring-rose-50">
            <XCircle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-[var(--ink)] sm:text-3xl font-display">
            รหัสลงทะเบียนนี้ถูกยกเลิกแล้ว
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-medium max-w-md mx-auto">
            รหัส {regCode} ได้ถูกยกเลิกแล้ว ไม่สามารถนำมาใช้สแกนเช็กอินในวันงานได้ หากต้องการเข้าร่วมกิจกรรม กรุณาลงทะเบียนใหม่อีกครั้ง
          </p>
        </div>
      ) : (
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-xs ring-4 ring-emerald-50">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-[var(--ink)] sm:text-3xl font-display">
            ลงทะเบียนบริจาคโลหิตสำเร็จ!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-medium max-w-md mx-auto">
            ยินดีต้อนรับสู่ MUMT LoveUnit ครั้งที่ 9 กรุณาบันทึกภาพตั๋วนี้เพื่อนำไปแสดงต่อเจ้าหน้าที่ในวันงาน
          </p>
        </div>
      )}

      {/* High-Fidelity Donor Ticket Pass */}
      <DonorTicketPass
        registrationCode={regCode}
        name={fullName}
        phone={phone}
        faculty={facultyName}
        timeSlot={timeSlot}
        date="พุธที่ 16 กันยายน 2569"
        venue="ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา"
        qrToken={qrToken}
        isConfirmed={!isCancelled}
        status={reg.status}
        primaryAction={
          isCancelled
            ? {
                href: '/register',
                label: 'ลงทะเบียนรอบใหม่',
                icon: <ArrowRight className="h-4 w-4" />,
              }
            : {
                href: '/prepare',
                label: 'ดูข้อปฏิบัติตัวก่อนบริจาค',
                icon: <ArrowRight className="h-4 w-4" />,
              }
        }
      />

      {/* Event poster matching the visitor's saved language (TH/EN toggle) */}
      <RegistrationPoster />

    </div>
  );
}
