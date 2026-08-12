import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Calendar, Clock, MapPin, Download, ArrowRight, Printer, ShieldCheck } from 'lucide-react';
import { getRegistrationByCode } from '@/services/registration-service';
import { formatThaiDate } from '@/lib/utils/format';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function RegistrationDetailPage({ params }: PageProps) {
  const { code } = await params;
  const registration = await getRegistrationByCode(code);

  if (!registration) {
    notFound();
  }

  const regCode = (registration as any).registrationCode || (registration as any).registration_code || code;
  const firstName = (registration as any).firstName || (registration as any).first_name || '';
  const lastName = (registration as any).lastName || (registration as any).last_name || '';
  const fullName = `${firstName} ${lastName}`;
  const phone = (registration as any).phone || '';
  const qrUrl = (registration as any).qrCodeDataUrl || (registration as any).qr_code_data_url;
  const timeSlot = (registration as any).timeSlotText || (registration as any).time_slot_text || '08:00 - 15:00';
  const facultyName = (registration as any).facultyName || (registration as any).faculty || 'มหาวิทยาลัยมหิดล';

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
        <div className="border-b-2 border-dashed border-[#7A1020] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#FFF9F9] p-1 border border-[#F0C4CC] flex items-center justify-center">
              <img src="/images/logo.png" alt="MUMT Logo" className="h-full w-auto object-contain" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-[#7A1020] uppercase block">MUMT BLOOD DONATION 2026</span>
              <span className="text-xs font-black text-editorial-ink">REGISTRATION PASS</span>
            </div>
          </div>
          <span className="unit-tag text-[9px]">OFFICIAL PASS</span>
        </div>

        {/* Ticket Registration Code */}
        <div className="bg-[#FFF9F9] p-4 rounded-lg border border-[#F0C4CC] text-center space-y-1">
          <span className="text-[10px] font-mono font-bold text-editorial-muted uppercase tracking-wider">
            REGISTRATION CODE
          </span>
          <div className="text-2xl font-mono font-black text-[#7A1020] tracking-wider">
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
            <span className="font-bold text-[#7A1020]">พุธ 16 กันยายน 2569</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-editorial-muted font-bold">รอบเวลาเดินทางแนะนำ:</span>
            <span className="font-mono font-black text-[#7A1020]">{timeSlot} น.</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-editorial-muted font-bold">สถานที่:</span>
            <span className="font-bold text-editorial-ink">ห้อง 217-218 สิริวิทยา ศาลายา</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="pt-4 border-t-2 border-dashed border-[#7A1020] text-center space-y-3">
          <span className="text-[10px] font-mono font-bold text-[#7A1020] uppercase tracking-wider block">
            QR CODE FOR EVENT SCAN
          </span>

          {qrUrl ? (
            <div className="mx-auto h-48 w-48 rounded-xl border-2 border-[#7A1020] p-2 bg-white flex items-center justify-center shadow-xs">
              <img src={qrUrl} alt={`QR Pass for ${regCode}`} className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="mx-auto h-48 w-48 rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500">
              [QR Token Generated]
            </div>
          )}

          <p className="text-[11px] text-editorial-muted font-medium">
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
