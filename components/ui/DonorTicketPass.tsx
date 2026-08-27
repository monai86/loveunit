'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Download, 
  Copy, 
  Check, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building2,
  Phone
} from 'lucide-react';
import { extractQueueNumber } from '@/lib/utils/format';

export interface DonorTicketPassProps {
  registrationCode: string;
  name: string;
  phone?: string;
  faculty?: string | null;
  timeSlot?: string;
  date?: string;
  venue?: string;
  qrToken?: string;
  isConfirmed?: boolean;
  onReset?: () => void;
  resetLabel?: string;
  primaryAction?: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  };
}

export function DonorTicketPass({
  registrationCode,
  name,
  phone,
  faculty,
  timeSlot = '09:00 - 14:00 น.',
  date = 'พุธที่ 16 กันยายน 2569',
  venue = 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา',
  qrToken,
  isConfirmed = true,
  onReset,
  resetLabel = 'ค้นหาใหม่',
  primaryAction,
}: DonorTicketPassProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const queueNum = extractQueueNumber(registrationCode);
  const isEarlyBird = queueNum !== null && queueNum <= 100;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(registrationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API not available
    }
  };

  const handleDownloadTicket = async () => {
    setDownloading(true);
    try {
      // Create an offscreen canvas to generate a high-res commemorative ticket image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 2; // 2x retina sharpness
      const width = 480 * scale;
      const height = 680 * scale;
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = '#FAF7F5';
      ctx.fillRect(0, 0, width, height);

      // Card Body
      const pad = 24 * scale;
      const cardWidth = width - pad * 2;
      const cardHeight = height - pad * 2;
      const radius = 24 * scale;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad, pad, cardWidth, cardHeight, radius);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = '#F0C4CC';
      ctx.stroke();
      ctx.clip();

      // Top Gradient Header
      const grad = ctx.createLinearGradient(pad, pad, pad + cardWidth, pad + 130 * scale);
      grad.addColorStop(0, '#7E0E1D');
      grad.addColorStop(0.5, '#9C1528');
      grad.addColorStop(1, '#5E0B17');
      ctx.fillStyle = grad;
      ctx.fillRect(pad, pad, cardWidth, 115 * scale);

      // Header Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${19 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('MUMT LoveUnit ครั้งที่ 9', width / 2, pad + 48 * scale);

      ctx.fillStyle = '#FDF6F1';
      ctx.font = `${11 * scale}px sans-serif`;
      ctx.fillText('บัตรคิวลงทะเบียนบริจาคโลหิต · Official Donor Pass', width / 2, pad + 72 * scale);

      ctx.fillStyle = '#A7F3D0';
      ctx.font = `bold ${10 * scale}px sans-serif`;
      ctx.fillText('● ยืนยันการลงทะเบียนแล้ว (CONFIRMED)', width / 2, pad + 94 * scale);

      // Registration Code Box
      const codeBoxY = pad + 135 * scale;
      ctx.fillStyle = '#FFF5F6';
      ctx.beginPath();
      ctx.roundRect(pad + 16 * scale, codeBoxY, cardWidth - 32 * scale, 85 * scale, 12 * scale);
      ctx.fill();
      ctx.strokeStyle = '#F6C4CC';
      ctx.lineWidth = 1 * scale;
      ctx.stroke();

      ctx.fillStyle = '#7E0E1D';
      ctx.font = `bold ${11 * scale}px monospace`;
      ctx.fillText(queueNum ? `ลำดับคิวผู้ลงทะเบียน #${String(queueNum).padStart(3, '0')}` : 'REGISTRATION CODE', width / 2, codeBoxY + 28 * scale);

      ctx.fillStyle = '#7E0E1D';
      ctx.font = `900 ${28 * scale}px monospace`;
      ctx.fillText(registrationCode, width / 2, codeBoxY + 62 * scale);

      // Donor & Event Details
      const infoY = codeBoxY + 102 * scale;
      ctx.fillStyle = '#1A1818';
      ctx.textAlign = 'left';
      ctx.font = `bold ${13 * scale}px sans-serif`;
      ctx.fillText(`ผู้บริจาค: ${name}`, pad + 24 * scale, infoY);

      ctx.fillStyle = '#6E5D53';
      ctx.font = `${11 * scale}px sans-serif`;
      ctx.fillText(`รอบเวลา: ${timeSlot}`, pad + 24 * scale, infoY + 22 * scale);
      ctx.fillText(`วันที่: ${date}`, pad + 24 * scale, infoY + 42 * scale);
      ctx.fillText(`สถานที่: อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล`, pad + 24 * scale, infoY + 62 * scale);

      // QR Code Render on Canvas
      const svgEl = qrRef.current?.querySelector('svg');
      if (svgEl) {
        const svgXml = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(svgBlob);
        const img = new window.Image();
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const qrSize = 150 * scale;
            const qrX = (width - qrSize) / 2;
            const qrY = infoY + 80 * scale;
            
            // White QR box background with soft border
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(qrX - 10 * scale, qrY - 10 * scale, qrSize + 20 * scale, qrSize + 20 * scale, 12 * scale);
            ctx.fill();
            ctx.strokeStyle = '#9C1528';
            ctx.lineWidth = 1.5 * scale;
            ctx.stroke();

            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
            URL.revokeObjectURL(blobUrl);
            resolve();
          };
          img.src = blobUrl;
        });
      }

      // Footer note
      ctx.fillStyle = '#8C7A70';
      ctx.font = `${10 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('กรุณาแสดงภาพนี้ต่อเจ้าหน้าที่ ณ จุดลงทะเบียนในวันงาน', width / 2, height - pad - 20 * scale);

      ctx.restore();

      // Trigger download
      const link = document.createElement('a');
      link.download = `MUMT-LoveUnit-Pass-${registrationCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export ticket image', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      
      {/* TICKET PASS CONTAINER */}
      <div className="relative bg-white rounded-3xl border border-[var(--rose-200)]/80 shadow-[0_20px_50px_-15px_rgba(122,16,32,0.18),0_0_0_1px_rgba(122,16,32,0.05)] overflow-hidden">
        
        {/* TOP BRANDING GRADIENT HEADER */}
        <div className="relative bg-gradient-to-r from-[var(--burgundy-800)] via-[var(--burgundy-700)] to-[#9C1528] px-5 py-6 sm:px-8 sm:py-7 text-white text-center">
          
          {/* Subtle Decorative Background Ring Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

          {/* Logo & Event Title */}
          <div className="relative z-10 flex flex-col items-center space-y-2.5">
            <div className="h-12 w-12 rounded-full bg-white p-1.5 shadow-md flex items-center justify-center ring-2 ring-white/40 overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="MUMT LoveUnit Logo" 
                width={40} 
                height={40} 
                className="h-full w-auto object-contain rounded-full" 
              />
            </div>
            
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white font-display">
                MUMT LoveUnit ครั้งที่ 9
              </h2>
              <p className="text-xs text-rose-100/90 font-medium mt-0.5">
                โครงการบริจาคโลหิต คณะเทคนิคการแพทย์ ม.มหิดล
              </p>
            </div>

            {/* Live Status Pill */}
            {isConfirmed && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-xs border border-emerald-300/40 text-emerald-200 text-xs font-bold shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ยืนยันการลงทะเบียนแล้ว (CONFIRMED)</span>
              </div>
            )}
          </div>
        </div>

        {/* TICKET BODY */}
        <div className="p-5 sm:p-8 space-y-6">
          
          {/* CODE & QUEUE VIP BANNER */}
          <div className="relative bg-gradient-to-br from-rose-50/90 via-white to-amber-50/70 p-4 sm:p-5 rounded-2xl border border-rose-200/90 text-center space-y-2.5 shadow-2xs">
            
            {/* Queue Badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-[var(--burgundy-700)] bg-white px-3 py-1 rounded-full border border-rose-200 shadow-2xs font-mono">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{queueNum ? `ลำดับคิวผู้ลงทะเบียน #${String(queueNum).padStart(3, '0')}` : 'DONOR PASS'}</span>
              </span>
            </div>

            {/* Monospace Registration Code with 1-click Copy */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[var(--burgundy-800)] font-mono tracking-wider select-all">
                {registrationCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="คัดลอกรหัส"
                className="p-1.5 rounded-lg text-rose-800/70 hover:text-[var(--burgundy-700)] hover:bg-rose-100 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {copied && (
              <p className="text-[10px] font-bold text-emerald-700 animate-fade-in">
                ✓ คัดลอกรหัสเรียบร้อยแล้ว
              </p>
            )}

            {/* 100 Early-Bird Gift Callout */}
            {isEarlyBird && (
              <div className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-black text-amber-900 bg-amber-100/90 py-1.5 px-3.5 rounded-xl border border-amber-300 shadow-2xs">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0 animate-bounce" />
                <span>คุณอยู่ในลำดับ 100 ท่านแรก! (รับของที่ระลึกพิเศษ Limited Edition 🎁)</span>
              </div>
            )}
          </div>

          {/* DONOR & EVENT DETAILS 2-COLUMN GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Donor Name */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
              <div className="h-7 w-7 rounded-lg bg-rose-100 text-[var(--burgundy-700)] flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">ผู้ลงทะเบียน</span>
                <p className="font-black text-[var(--ink)] text-sm truncate">{name}</p>
              </div>
            </div>

            {/* Time Slot */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
              <div className="h-7 w-7 rounded-lg bg-rose-100 text-[var(--burgundy-700)] flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">รอบเวลาเดินทางแนะนำ</span>
                <p className="font-black text-[var(--burgundy-700)] text-sm">{timeSlot}</p>
              </div>
            </div>

            {/* Event Date */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
              <div className="h-7 w-7 rounded-lg bg-rose-100 text-[var(--burgundy-700)] flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">วันที่จัดกิจกรรม</span>
                <p className="font-bold text-gray-800">{date}</p>
                <span className="text-[10px] text-gray-500 font-medium">09:00 - 14:00 น.</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
              <div className="h-7 w-7 rounded-lg bg-rose-100 text-[var(--burgundy-700)] flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">สถานที่จัดงาน</span>
                <p className="font-bold text-gray-800 leading-snug">{venue}</p>
              </div>
            </div>

            {/* Optional Phone & Faculty */}
            {phone && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="h-7 w-7 rounded-lg bg-rose-100 text-[var(--burgundy-700)] flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">เบอร์โทรศัพท์</span>
                  <p className="font-mono font-bold text-gray-800">{phone}</p>
                </div>
              </div>
            )}

            {faculty && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="h-7 w-7 rounded-lg bg-rose-100 text-[var(--burgundy-700)] flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">คณะ / สังกัด</span>
                  <p className="font-bold text-gray-800 truncate">{faculty}</p>
                </div>
              </div>
            )}

          </div>

          {/* PERFORATED TICKET TEAR LINE WITH SIDE NOTCHES */}
          <div className="relative my-6 -mx-5 sm:-mx-8">
            <div className="border-t-2 border-dashed border-rose-200/90 w-full" />
            {/* Left Scallop Notches */}
            <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[var(--bg)] border border-rose-200/80 shadow-inner" />
            {/* Right Scallop Notches */}
            <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[var(--bg)] border border-rose-200/80 shadow-inner" />
          </div>

          {/* QR CODE SCANNING SHOWCASE */}
          <div className="text-center space-y-4">
            <div>
              <span className="text-[11px] font-black text-[var(--burgundy-700)] uppercase tracking-wider block">
                QR CODE FOR EVENT SCAN
              </span>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                โปรดแสดง QR Code นี้ให้เจ้าหน้าที่สแกน ณ จุดลงทะเบียนหน้าห้อง 217
              </p>
            </div>

            {/* QR Code Presentation Box */}
            <div ref={qrRef} className="relative inline-block mx-auto p-4 rounded-2xl bg-white border-2 border-[var(--burgundy-700)] shadow-lg group">
              {/* Corner Reticle Accents */}
              <div className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 border-t-2 border-l-2 border-[var(--burgundy-700)]" />
              <div className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 border-t-2 border-r-2 border-[var(--burgundy-700)]" />
              <div className="absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 border-b-2 border-l-2 border-[var(--burgundy-700)]" />
              <div className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 border-b-2 border-r-2 border-[var(--burgundy-700)]" />

              {qrToken ? (
                <div className="flex items-center justify-center p-1 bg-white">
                  <QRCodeSVG 
                    value={qrToken} 
                    size={190} 
                    level="M"
                    imageSettings={{
                      src: '/images/logo.png',
                      x: undefined,
                      y: undefined,
                      height: 36,
                      width: 36,
                      excavate: true,
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 w-48 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                  กำลังสร้าง QR Code...
                </div>
              )}
            </div>

            {/* Download Ticket / QR Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDownloadTicket}
                disabled={downloading}
                className="btn-cream !w-full sm:!w-auto inline-flex items-center justify-center gap-2 text-xs font-black px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>{downloading ? 'กำลังสร้างรูปภาพ...' : 'บันทึกภาพตั๋ว QR Code (Save Pass)'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>QR Code นี้เชื่อมโยงกับรหัสประจำตัวของคุณอย่างปลอดภัย</span>
            </div>

          </div>

        </div>

      </div>

      {/* FOOTER ACTIONS (SYMMETRICAL & BALANCED) */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="editorial-btn-secondary py-3 text-xs justify-center flex-1 font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{resetLabel}</span>
          </button>
        )}

        {primaryAction ? (
          <Link
            href={primaryAction.href}
            className="editorial-btn-primary py-3 text-xs justify-center flex-1 font-bold"
          >
            <span>{primaryAction.label}</span>
            {primaryAction.icon || <ArrowRight className="h-4 w-4" />}
          </Link>
        ) : (
          <Link 
            href="/" 
            className="editorial-btn-primary py-3 text-xs justify-center flex-1 font-bold"
          >
            <span>กลับสู่หน้าแรก</span>
          </Link>
        )}
      </div>

    </div>
  );
}
