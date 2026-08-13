import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Calendar, Clock, MapPin, Download, ArrowRight, Printer, ShieldCheck } from 'lucide-react';
import { getRegistrationByCode } from '@/services/registration-service';
import { formatTimeRange } from '@/lib/utils/format';

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
  const firstName = reg.firstName || reg.first_name || '';
  const lastName = reg.lastName || reg.last_name || '';
  const fullName = `${firstName} ${lastName}`;
  const phone = reg.phone || '';
  const qrToken = reg.qrToken || reg.qr_token || '';
  const slot = reg.timeSlot || reg.time_slot;
  const timeSlot = slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : '08:00 - 15:00';
  const facultyName = reg.faculty || 'มหาวิทยาลัยมหิดล';

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      
      {/* Top Banner Alert */}
      <div className="mb-6 text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-black text-editorial-ink">ลงทะเบียนบริจาคโลหิตสำเร็จ!</h1>
        <p className="text-xs text-editorial-muted font-medium">
          กรุณาบันทึกภาพหน้าจอนี้ หรือแสดง QR Code ต่อเจ้าหน้าที่ ณ จุดลงทะเบียนในวันงาน
        </p>
      </div>

      {/* EVENT PASS / REGISTRATION TICKET ARTIFACT */}
      <div className="editorial-ticket p-6 sm:p-8 space-y-6 relative overflow-hidden bg-white">
        
        {/* Ticket Header */}
        <div className="border-b-2 border-dashed border-[var(--burgundy-700)] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white p-1 border border-[var(--line)] flex items-center justify-center">
              <img src="/images/logo.png" alt="MUMT Logo" className="h-full w-auto object-contain" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[var(--burgundy-700)] uppercase block">MUMT Blood Donation 2026</span>
              <span className="text-sm font-black text-[var(--ink)]">REGISTRATION PASS</span>
            </div>
          </div>
          <span className="brand-chip--light text-[11px]">Official Pass</span>
        </div>

        {/* Ticket Registration Code */}
        <div className="bg-[var(--rose-100)]/60 p-4 rounded-lg border border-[var(--rose-200)] text-center space-y-1">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
            Registration Code
          </span>
          <div className="text-2xl font-black text-[var(--burgundy-700)] tracking-wider">
            {regCode}
          </div>
        </div>

        {/* Donor Information */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-editorial-muted font-bold">ชื่อ-นามสกุล:</span>
            <span className="font-black text-editorial-ink">{fullName}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-editorial-muted font-bold">เบอร์โทรศัพท์:</span>
            <span className="font-mono font-bold text-editorial-ink">{phone}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-editorial-muted font-bold">คณะ / สังกัด:</span>
            <span className="font-bold text-editorial-ink truncate max-w-[220px] text-right">{facultyName}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-editorial-muted font-bold">วันที่จัดงาน:</span>
            <span className="font-bold text-[var(--burgundy-700)]">พุธ 16 กันยายน 2569</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-editorial-muted font-bold">รอบเวลาเดินทางแนะนำ:</span>
            <span className="font-black text-[var(--burgundy-700)]">{timeSlot}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-editorial-muted font-bold">สถานที่:</span>
            <span className="font-bold text-editorial-ink">ห้อง 217-218 สิริวิทยา ศาลายา</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="pt-4 border-t-2 border-dashed border-[var(--burgundy-700)] text-center space-y-3">
          <span className="text-[11px] font-bold text-[var(--burgundy-700)] uppercase tracking-wider block">
            QR Code for Event Scan
          </span>

          {qrToken ? (
            <div className="mx-auto h-48 w-48 rounded-xl border-2 border-[var(--burgundy-700)] p-2 bg-white flex items-center justify-center shadow-xs">
              <QRCodeSVG value={qrToken} size={176} level="M" />
            </div>
          ) : (
            <div className="mx-auto h-48 w-48 rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
              [QR Token Generated]
            </div>
          )}

          <p className="text-[12px] text-editorial-muted font-medium">
            แสดง QR สแกน ณ จุดลงทะเบียน หน้าห้องประชุม 217-218
          </p>
        </div>

      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="editorial-btn-secondary py-3 text-xs justify-center flex-1"
        >
          <span>กลับหน้าแรก</span>
        </Link>

        <Link
          href="/prepare"
          className="editorial-btn-primary py-3 text-xs justify-center flex-1"
        >
          <span>ดูข้อปฏิบัติตัวก่อนบริจาค</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  );
}
