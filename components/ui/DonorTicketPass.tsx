"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Droplets,
  MapPin,
  Moon,
  Phone,
  ShieldCheck,
  User,
  Utensils,
} from "lucide-react";

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
  primaryAction?: { href: string; label: string; icon?: React.ReactNode };
}

export function DonorTicketPass({
  registrationCode,
  name,
  phone,
  faculty,
  timeSlot = "09:00–14:00 น.",
  date = "พุธที่ 16 กันยายน 2569",
  venue = "ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา",
  qrToken,
  isConfirmed = true,
  onReset,
  resetLabel = "ค้นหาใหม่",
  primaryAction,
}: DonorTicketPassProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(registrationCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const downloadTicket = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;
      const scale = 2;
      const width = 540 * scale;
      const height = 780 * scale;
      const inset = 18 * scale;
      canvas.width = width;
      canvas.height = height;

      // Outer background
      context.fillStyle = "#F8F6F6";
      context.fillRect(0, 0, width, height);

      // White card surface
      context.fillStyle = "#FFFFFF";
      context.fillRect(inset, inset, width - inset * 2, height - inset * 2);
      context.strokeStyle = "#E8DCD8";
      context.lineWidth = 1.5 * scale;
      context.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

      // Vibrant Red Gradient Header
      const headerHeight = 130 * scale;
      const grad = context.createLinearGradient(inset, inset, width - inset, inset + headerHeight);
      grad.addColorStop(0, "#E11D48"); // Vibrant Rose Red
      grad.addColorStop(0.45, "#DC2626"); // Bright Crimson
      grad.addColorStop(1, "#991B1B"); // Deep Crimson Red
      context.fillStyle = grad;
      context.fillRect(inset, inset, width - inset * 2, headerHeight);

      // Header Text
      context.fillStyle = "#FFE4E6";
      context.textAlign = "left";
      context.font = `700 ${11 * scale}px sans-serif`;
      context.fillText("MUMT LOVEUNIT 2026 · คณะเทคนิคการแพทย์ ม.มหิดล", inset + 24 * scale, inset + 32 * scale);

      context.fillStyle = "#FFFFFF";
      context.font = `800 ${22 * scale}px sans-serif`;
      context.fillText("ตั๋วลงทะเบียนบริจาคโลหิต", inset + 24 * scale, inset + 68 * scale);

      context.fillStyle = "#FFE4E6";
      context.font = `700 ${11 * scale}px sans-serif`;
      context.fillText("OFFICIAL BLOOD DONOR DIGITAL PASS", inset + 24 * scale, inset + 96 * scale);

      // Registration Number Box
      const contentWidth = width - inset * 2 - 48 * scale;
      const x = inset + 24 * scale;
      let y = inset + headerHeight + 32 * scale;

      context.fillStyle = "#FFF1F2";
      context.fillRect(x, y - 16 * scale, contentWidth, 68 * scale);
      context.strokeStyle = "#FECDD3";
      context.lineWidth = 1 * scale;
      context.strokeRect(x, y - 16 * scale, contentWidth, 68 * scale);

      context.fillStyle = "#BE123C";
      context.font = `800 ${10.5 * scale}px sans-serif`;
      context.fillText("หมายเลขลงทะเบียน / REGISTRATION NO.", x + 16 * scale, y + 6 * scale);

      context.font = `900 ${26 * scale}px monospace`;
      context.fillText(registrationCode, x + 16 * scale, y + 36 * scale);

      // 2-Column Appointment Details
      y += 84 * scale;
      const col1X = x;
      const col2X = x + (contentWidth / 2) + 8 * scale;

      // Row 1
      context.fillStyle = "#64748B";
      context.font = `700 ${9.5 * scale}px sans-serif`;
      context.fillText("ผู้ลงทะเบียน / DONOR NAME", col1X, y);
      context.fillText("วันจัดกิจกรรม / EVENT DATE", col2X, y);

      context.fillStyle = "#0F172A";
      context.font = `700 ${12 * scale}px sans-serif`;
      context.fillText(name.slice(0, 24), col1X, y + 18 * scale);
      context.fillText(date.slice(0, 24), col2X, y + 18 * scale);

      // Row 2
      y += 42 * scale;
      context.fillStyle = "#64748B";
      context.font = `700 ${9.5 * scale}px sans-serif`;
      context.fillText("รอบเวลาที่นัดหมาย / TIME SLOT", col1X, y);
      context.fillText("สถานที่จัดกิจกรรม / VENUE", col2X, y);

      context.fillStyle = "#BE123C";
      context.font = `800 ${12 * scale}px sans-serif`;
      context.fillText(timeSlot, col1X, y + 18 * scale);
      context.fillStyle = "#0F172A";
      context.font = `600 ${11 * scale}px sans-serif`;
      context.fillText(venue.slice(0, 28), col2X, y + 18 * scale);

      // Row 3
      y += 42 * scale;
      context.fillStyle = "#64748B";
      context.font = `700 ${9.5 * scale}px sans-serif`;
      context.fillText("เบอร์โทรศัพท์ / PHONE", col1X, y);
      context.fillText("คณะ / สังกัด / FACULTY", col2X, y);

      context.fillStyle = "#0F172A";
      context.font = `600 ${11.5 * scale}px sans-serif`;
      context.fillText(phone || "—", col1X, y + 18 * scale);
      context.fillText((faculty || "บุคคลทั่วไป").slice(0, 28), col2X, y + 18 * scale);

      // QR Code Box (Centered)
      const svg = qrRef.current?.querySelector("svg");
      if (svg) {
        const blobUrl = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(svg)], {
            type: "image/svg+xml;charset=utf-8",
          }),
        );
        const image = new window.Image();
        await new Promise<void>((resolve) => {
          image.onload = () => {
            const size = 140 * scale;
            const qrX = (width - size) / 2;
            const qrY = height - inset - size - 64 * scale;
            context.fillStyle = "#FFFFFF";
            context.fillRect(qrX - 10 * scale, qrY - 10 * scale, size + 20 * scale, size + 20 * scale);
            context.strokeStyle = "#E2E8F0";
            context.lineWidth = 1.5 * scale;
            context.strokeRect(qrX - 10 * scale, qrY - 10 * scale, size + 20 * scale, size + 20 * scale);
            context.drawImage(image, qrX, qrY, size, size);
            URL.revokeObjectURL(blobUrl);
            resolve();
          };
          image.src = blobUrl;
        });
      }

      // Footer note
      context.fillStyle = "#64748B";
      context.textAlign = "center";
      context.font = `600 ${9.5 * scale}px sans-serif`;
      context.fillText(
        "แสดง QR Code นี้ต่อเจ้าหน้าที่ ณ จุดลงทะเบียน (Please present this QR at the venue)",
        width / 2,
        height - inset - 24 * scale,
      );

      const link = document.createElement("a");
      link.download = `MUMT-LoveUnit-${registrationCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to export donor ticket", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      {/* Symmetrical Boarding Pass Card */}
      <article
        data-testid="donor-ticket"
        className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-xl shadow-rose-950/5 transition-all"
      >
        {/* Vibrant Red Gradient Header */}
        <header className="relative bg-gradient-to-r from-rose-600 via-red-600 to-rose-800 px-6 py-6 text-white sm:px-8">
          <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm">
                <Image
                  src="/images/logo.png"
                  alt="MUMT Logo"
                  width={32}
                  height={32}
                  className="h-7 w-7 rounded-full object-contain"
                />
              </div>
              <div>
                <p className="text-[11px] font-extrabold tracking-wider text-rose-100 uppercase">
                  MUMT LoveUnit ครั้งที่ 9
                </p>
                <p className="text-[11px] text-white/90 font-medium">
                  คณะเทคนิคการแพทย์ ม.มหิดล
                </p>
              </div>
            </div>

            {isConfirmed && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/25 px-3 py-1 text-xs font-bold text-emerald-100 backdrop-blur-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span>ยืนยันสิทธิ์แล้ว / Confirmed</span>
              </span>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl font-display">
              ตั๋วลงทะเบียนบริจาคโลหิต
            </h2>
            <p className="text-[11px] font-semibold tracking-wider text-rose-100 uppercase mt-0.5">
              Official Blood Donation Pass
            </p>
          </div>
        </header>

        {/* Crisp Ticket Notch Divider */}
        <div className="relative flex items-center justify-between px-3 bg-white">
          <div className="-ml-6 h-6 w-6 rounded-full bg-[var(--bg)] border-r border-rose-100" />
          <div className="flex-1 border-b-2 border-dashed border-rose-200 mx-2" />
          <div className="-mr-6 h-6 w-6 rounded-full bg-[var(--bg)] border-l border-rose-100" />
        </div>

        {/* Ticket Body */}
        <div className="px-6 py-6 sm:px-8 space-y-6">
          
          {/* Registration Code Block */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 sm:p-5">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="text-xs font-black tracking-wider text-rose-700 uppercase">
                  หมายเลขลงทะเบียน <span className="text-[10px] font-bold text-gray-500">/ Registration No.</span>
                </p>
                <p className="mt-1 font-mono text-2xl font-black tracking-wider text-rose-800 sm:text-3xl">
                  {registrationCode}
                </p>
              </div>

              <button
                type="button"
                onClick={copyCode}
                aria-label="คัดลอกหมายเลขลงทะเบียน"
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 text-xs font-bold text-rose-700 shadow-xs transition-all hover:bg-rose-50 hover:border-rose-300 active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>คัดลอกแล้ว (Copied)</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>คัดลอกรหัส (Copy)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Symmetrical 2-Column Details Grid */}
          <section aria-labelledby="appointment-details" className="space-y-3">
            <div className="border-b border-gray-100 pb-2.5">
              <h3
                id="appointment-details"
                className="text-sm font-black text-gray-900 flex items-center gap-1.5 font-display"
              >
                <span>รายละเอียดการนัดหมาย</span>
                <span className="text-xs font-normal text-gray-500">/ Appointment Details</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Donor Name */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <User className="h-3.5 w-3.5 text-rose-600" />
                  <span>ผู้ลงทะเบียน / Donor Name</span>
                </div>
                <p className="text-sm font-black text-gray-900">{name}</p>
              </div>

              {/* Event Date */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Calendar className="h-3.5 w-3.5 text-rose-600" />
                  <span>วันจัดกิจกรรม / Event Date</span>
                </div>
                <p className="text-sm font-black text-gray-900">{date}</p>
              </div>

              {/* Time Slot */}
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <Clock className="h-3.5 w-3.5" />
                  <span>รอบเวลาที่นัดหมาย / Time Slot</span>
                </div>
                <p className="text-base font-black text-rose-800">{timeSlot}</p>
              </div>

              {/* Venue */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-rose-600" />
                  <span>สถานที่จัดกิจกรรม / Venue</span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-snug">{venue}</p>
              </div>

              {/* Phone */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Phone className="h-3.5 w-3.5 text-rose-600" />
                  <span>เบอร์โทรศัพท์ / Phone</span>
                </div>
                <p className="text-xs font-bold text-gray-900">{phone || "—"}</p>
              </div>

              {/* Faculty */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Building2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>คณะ / สังกัด / Faculty or Org</span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-snug">{faculty || "บุคคลทั่วไป"}</p>
              </div>
            </div>
          </section>

          {/* Symmetrical QR Check-in Center Box */}
          <section
            aria-labelledby="ticket-qr-heading"
            className="rounded-2xl border border-gray-100 bg-gray-50/70 p-6 text-center space-y-4"
          >
            <div>
              <h3 id="ticket-qr-heading" className="text-sm font-black text-gray-900 font-display">
                QR Code สำหรับเช็กอิน / Check-in QR Code
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                แสดง QR Code นี้ต่อเจ้าหน้าที่ ณ จุดลงทะเบียน (Please present this QR Code at the registration desk)
              </p>
            </div>

            <div className="flex justify-center">
              <div
                ref={qrRef}
                className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm"
              >
                {qrToken ? (
                  <QRCodeSVG
                    value={qrToken}
                    size={160}
                    level="M"
                    title="QR Code สำหรับเช็กอิน"
                    imageSettings={{
                      src: "/images/logo.png",
                      height: 28,
                      width: 28,
                      excavate: true,
                    }}
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center bg-gray-50 text-xs font-bold text-gray-400">
                    กำลังสร้าง QR Code...
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={downloadTicket}
                disabled={downloading}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-all hover:from-rose-700 hover:to-red-700 active:scale-98 disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                <span>{downloading ? "กำลังบันทึกภาพ... (Saving...)" : "บันทึกตั๋วเป็นรูปภาพ / Save Ticket PNG"}</span>
              </button>
            </div>
          </section>

          {/* Symmetrical 2x2 Preparation Tips Grid (Clean Icons) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-rose-600" />
              <p className="text-xs font-black text-gray-900">
                ข้อแนะนำการเตรียมความพร้อม / Preparation Tips
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
              {/* ID Card */}
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-white p-3 shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">
                    <strong className="text-rose-700">อย่าลืมนำบัตรประชาชนมาด้วย</strong>
                  </p>
                  <p className="text-[11px] text-gray-500">หรือบัตรผู้บริจาคโลหิตตัวจริง (National ID Required)</p>
                </div>
              </div>

              {/* Water */}
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-white p-3 shadow-2xs">
                <Droplets className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">ดื่มน้ำ 3–4 แก้วก่อนมา</p>
                  <p className="text-[11px] text-gray-500">ช่วยระบบไหลเวียนโลหิต (Drink 3–4 glasses of water)</p>
                </div>
              </div>

              {/* Sleep */}
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-white p-3 shadow-2xs">
                <Moon className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">นอนหลับพักผ่อน 6–8 ชม.</p>
                  <p className="text-[11px] text-gray-500">ไม่อดนอนในคืนก่อนวันบริจาค (Get 6–8 hours of sleep)</p>
                </div>
              </div>

              {/* Food */}
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-white p-3 shadow-2xs">
                <Utensils className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">งดอาหารไขมันสูง & แอลกอฮอล์</p>
                  <p className="text-[11px] text-gray-500">ทานอาหารมื้อหลักล่วงหน้า (Avoid fatty food & alcohol)</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </article>

      {/* Symmetrical Bottom Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="editorial-btn-secondary min-h-11 flex-1 py-3 text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{resetLabel}</span>
          </button>
        )}
        <Link
          href={primaryAction?.href || "/"}
          className="editorial-btn-primary min-h-11 flex-1 py-3 text-xs font-bold"
        >
          <span>{primaryAction?.label || "กลับสู่หน้าแรก"}</span>
          {primaryAction?.icon || <ArrowRight className="h-4 w-4" />}
        </Link>
      </div>
    </div>
  );
}
