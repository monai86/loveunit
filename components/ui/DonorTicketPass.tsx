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
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Droplets,
  MapPin,
  Moon,
  Phone,
  Share2,
  ShieldCheck,
  User,
  Utensils,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { isWalkInRecord } from "@/lib/utils/format";

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
  status?: string;
  onReset?: () => void;
  resetLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
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
  status = "REGISTERED",
  onReset,
  resetLabel,
  onCancel,
  cancelLabel,
  primaryAction,
}: DonorTicketPassProps) {
  const { isTh, isEn } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const isWalkIn = isWalkInRecord(registrationCode);
  const defaultDate = isEn ? "Wednesday, September 16, 2026" : date;
  const defaultVenue = isEn ? "Meeting Room 217, Sirividhaya Building, Mahidol University Salaya" : venue;
  const effectiveResetLabel = resetLabel || (isTh ? "ค้นหาใหม่" : "New Search");
  const timeLabelText = isWalkIn
    ? (isTh ? "เวลาลงทะเบียน (Walk-in)" : "Walk-in Registration Time")
    : (isTh ? "รอบเวลาที่นัดหมาย" : "Appointment Time");
  const timeCanvasLabel = isWalkIn
    ? (isTh ? "เวลาลงทะเบียน Walk-in" : "WALK-IN TIME")
    : (isTh ? "รอบเวลาที่นัดหมาย" : "APPOINTMENT TIME");
  const detailsHeading = isWalkIn
    ? (isTh ? "รายละเอียดการลงทะเบียน" : "Registration Details")
    : (isTh ? "รายละเอียดการนัดหมาย" : "Appointment Details");

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(registrationCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(isTh ? "บริจาคโลหิต MUMT LoveUnit ครั้งที่ 9" : "9th MUMT LoveUnit Blood Donation");
    const details = encodeURIComponent(
      isTh
        ? `รหัสลงทะเบียน: ${registrationCode}\nชื่อผู้บริจาค: ${name}\n${isWalkIn ? 'เวลาลงทะเบียน Walk-in' : 'รอบเวลานัดหมาย'}: ${timeSlot}\nสถานที่: ${defaultVenue}\n\n* กรุณานำบัตรประชาชนตัวจริงมาแสดงต่อเจ้าหน้าที่`
        : `Registration Code: ${registrationCode}\nDonor Name: ${name}\n${isWalkIn ? 'Walk-in Time' : 'Appointment'}: ${timeSlot}\nVenue: ${defaultVenue}\n\n* Please bring original National ID Card`
    );
    const location = encodeURIComponent(defaultVenue);
    const dates = "20260916T020000Z/20260916T070000Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const downloadIcs = () => {
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MUMT LoveUnit//Blood Donation 2026//TH",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `SUMMARY:${isTh ? 'บริจาคโลหิต MUMT LoveUnit ครั้งที่ 9' : '9th MUMT LoveUnit Blood Donation'} (${registrationCode})`,
      `DESCRIPTION:${isTh ? `รหัสลงทะเบียน: ${registrationCode}\\nชื่อผู้บริจาค: ${name}\\n${isWalkIn ? 'เวลาลงทะเบียน Walk-in' : 'รอบเวลา'}: ${timeSlot}\\nสถานที่: ${defaultVenue}\\nกรุณานำบัตรประชาชนมาแสดง` : `Registration Code: ${registrationCode}\\nDonor: ${name}\\n${isWalkIn ? 'Walk-in Time' : 'Time'}: ${timeSlot}\\nVenue: ${defaultVenue}\\nPlease bring ID Card`}`,
      `LOCATION:${defaultVenue}`,
      "DTSTART:20260916T020000Z",
      "DTEND:20260916T070000Z",
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      `DESCRIPTION:${isTh ? 'เตรียมตัวไปบริจาคโลหิต ดื่มน้ำ 3-4 แก้ว' : 'Prepare for blood donation: Drink 3-4 glasses of water'}`,
      "ACTION:DISPLAY",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MUMT-LoveUnit-${registrationCode}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const shareTicket = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: isTh ? "ตั๋วลงทะเบียนบริจาคโลหิต MUMT LoveUnit" : "MUMT LoveUnit Blood Donor Pass",
          text: isTh 
            ? `ฉันลงทะเบียนบริจาคโลหิต MUMT LoveUnit ครั้งที่ 9 แล้ว รหัส: ${registrationCode} (${timeSlot})`
            : `I have registered for the 9th MUMT LoveUnit Blood Donation! Code: ${registrationCode} (${timeSlot})`,
          url: window.location.href,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      await copyCode();
    }
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

      // Deep Crimson Header
      const headerHeight = 130 * scale;
      const grad = context.createLinearGradient(inset, inset, width - inset, inset + headerHeight);
      grad.addColorStop(0, "#C5222F");
      grad.addColorStop(0.5, "#A6192E");
      grad.addColorStop(1, "#7A1222");
      context.fillStyle = grad;
      context.fillRect(inset, inset, width - inset * 2, headerHeight);

      // Header Text
      context.fillStyle = "#FDE8EA";
      context.textAlign = "left";
      context.font = `700 ${11 * scale}px sans-serif`;
      context.fillText(isTh ? "MUMT LOVEUNIT 2026 · คณะเทคนิคการแพทย์ ม.มหิดล" : "MUMT LOVEUNIT 2026 · Faculty of Medical Technology, Mahidol University", inset + 24 * scale, inset + 32 * scale);

      context.fillStyle = "#FFFFFF";
      context.font = `800 ${22 * scale}px sans-serif`;
      context.fillText(isTh ? "ตั๋วลงทะเบียนบริจาคโลหิต" : "Blood Donation Donor Pass", inset + 24 * scale, inset + 68 * scale);

      context.fillStyle = "#FDE8EA";
      context.font = `700 ${11 * scale}px sans-serif`;
      context.fillText(isTh ? "บัตรยืนยันสิทธิ์บริจาคโลหิตทางการ" : "OFFICIAL BLOOD DONOR DIGITAL PASS", inset + 24 * scale, inset + 96 * scale);

      // Registration Number Box
      const contentWidth = width - inset * 2 - 48 * scale;
      const x = inset + 24 * scale;
      let y = inset + headerHeight + 32 * scale;

      context.fillStyle = "#FDF2F3";
      context.fillRect(x, y - 16 * scale, contentWidth, 68 * scale);
      context.strokeStyle = "#F5C2C7";
      context.lineWidth = 1 * scale;
      context.strokeRect(x, y - 16 * scale, contentWidth, 68 * scale);

      context.fillStyle = "#A6192E";
      context.font = `800 ${10.5 * scale}px sans-serif`;
      context.fillText(isTh ? "หมายเลขลงทะเบียน" : "REGISTRATION NO.", x + 16 * scale, y + 6 * scale);

      context.font = `900 ${26 * scale}px monospace`;
      context.fillText(registrationCode, x + 16 * scale, y + 36 * scale);

      // 2-Column Appointment Details
      y += 84 * scale;
      const col1X = x;
      const col2X = x + (contentWidth / 2) + 8 * scale;

      // Row 1
      context.fillStyle = "#64748B";
      context.font = `700 ${9.5 * scale}px sans-serif`;
      context.fillText(isTh ? "ผู้ลงทะเบียน" : "DONOR NAME", col1X, y);
      context.fillText(isTh ? "วันจัดกิจกรรม" : "EVENT DATE", col2X, y);

      context.fillStyle = "#0F172A";
      context.font = `700 ${12 * scale}px sans-serif`;
      context.fillText(name.slice(0, 24), col1X, y + 18 * scale);
      context.fillText(defaultDate.slice(0, 24), col2X, y + 18 * scale);

      // Row 2
      y += 42 * scale;
      context.fillStyle = "#64748B";
      context.font = `700 ${9.5 * scale}px sans-serif`;
      context.fillText(timeCanvasLabel, col1X, y);
      context.fillText(isTh ? "สถานที่จัดกิจกรรม" : "VENUE", col2X, y);

      context.fillStyle = "#A6192E";
      context.font = `800 ${12 * scale}px sans-serif`;
      context.fillText(timeSlot, col1X, y + 18 * scale);
      context.fillStyle = "#0F172A";
      context.font = `600 ${11 * scale}px sans-serif`;
      context.fillText(defaultVenue.slice(0, 28), col2X, y + 18 * scale);

      // Row 3
      y += 42 * scale;
      context.fillStyle = "#64748B";
      context.font = `700 ${9.5 * scale}px sans-serif`;
      context.fillText(isTh ? "เบอร์โทรศัพท์" : "PHONE", col1X, y);
      context.fillText(isTh ? "สังกัด / คณะ" : "FACULTY / ORG", col2X, y);

      context.fillStyle = "#0F172A";
      context.font = `600 ${11.5 * scale}px sans-serif`;
      context.fillText(phone || "—", col1X, y + 18 * scale);
      context.fillText((faculty || (isTh ? "บุคคลทั่วไป" : "General Public")).slice(0, 28), col2X, y + 18 * scale);

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
        isTh ? "แสดง QR Code นี้ต่อเจ้าหน้าที่ ณ จุดลงทะเบียน" : "Please present this QR Code to staff at the registration desk",
        width / 2,
        height - inset - 24 * scale,
      );

      const link = document.createElement("a");
      link.download = `MUMT-LoveUnit-${registrationCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <article
        data-testid="donor-ticket"
        aria-label={isTh ? "ตั๋วลงทะเบียนบริจาคโลหิต" : "Blood Donation Registration Ticket"}
        className="relative overflow-hidden rounded-3xl border border-red-100 bg-white shadow-xl shadow-red-950/5"
      >
        {/* Rich Crimson Gradient Header */}
        <header className="relative bg-gradient-to-r from-[#C5222F] via-[#A6192E] to-[#7A1222] px-6 py-6 text-white sm:px-8">
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
                  {isTh ? "MUMT LoveUnit ครั้งที่ 9" : "9th MUMT LoveUnit"}
                </p>
                <p className="text-[11px] text-white/90 font-medium">
                  {isTh ? "คณะเทคนิคการแพทย์ ม.มหิดล" : "Faculty of Medical Technology, Mahidol University"}
                </p>
              </div>
            </div>

            {isConfirmed && status !== 'CANCELLED' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/25 px-3 py-1 text-xs font-bold text-emerald-100 backdrop-blur-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span>{isTh ? "ยืนยันสิทธิ์แล้ว" : "Confirmed"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/40 bg-rose-950/40 px-3 py-1 text-xs font-bold text-rose-200 backdrop-blur-xs">
                <span>🚫 {isTh ? "ยกเลิกแล้ว" : "Cancelled"}</span>
              </span>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl font-display">
              {isTh ? "ตั๋วลงทะเบียนบริจาคโลหิต" : "Blood Donation Donor Pass"}
            </h2>
            <p className="text-[11px] font-semibold tracking-wider text-rose-100 uppercase mt-0.5">
              {isTh ? "บัตรยืนยันสิทธิ์เข้าร่วมกิจกรรม" : "Official Blood Donor Digital Pass"}
            </p>
          </div>
        </header>

        {/* Crisp Ticket Notch Divider */}
        <div className="relative flex items-center justify-between px-3 bg-white">
          <div className="-ml-6 h-6 w-6 rounded-full bg-[var(--bg)] border-r border-red-100" />
          <div className="flex-1 border-b-2 border-dashed border-red-200 mx-2" />
          <div className="-mr-6 h-6 w-6 rounded-full bg-[var(--bg)] border-l border-red-100" />
        </div>

        {/* Ticket Body */}
        <div className="px-6 py-6 sm:px-8 space-y-6">
          
          {/* Registration Code Block */}
          <div className="rounded-2xl border border-red-100 bg-[#FDF2F3] p-4 sm:p-5">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="text-xs font-black tracking-wider text-[#A6192E] uppercase">
                  {isTh ? "หมายเลขลงทะเบียน" : "Registration Number"}
                </p>
                <p className="mt-1 font-mono text-2xl font-black tracking-wider text-[#7A1222] sm:text-3xl">
                  {registrationCode}
                </p>
              </div>

              <button
                type="button"
                onClick={copyCode}
                aria-label={isTh ? "คัดลอกหมายเลขลงทะเบียน" : "Copy registration code"}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 text-xs font-bold text-[#A6192E] shadow-xs transition-all hover:bg-red-50 hover:border-red-300 active:scale-98 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{isTh ? "คัดลอกแล้ว" : "Copied!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>{isTh ? "คัดลอกรหัส" : "Copy Code"}</span>
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
                <span>{isTh ? "รายละเอียดการนัดหมาย" : "Appointment Details"}</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Donor Name */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <User className="h-3.5 w-3.5 text-[#A6192E]" />
                  <span>{isTh ? "ผู้ลงทะเบียน" : "Donor Name"}</span>
                </div>
                <p className="text-sm font-black text-gray-900">{name}</p>
              </div>

              {/* Event Date */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Calendar className="h-3.5 w-3.5 text-[#A6192E]" />
                  <span>{isTh ? "วันจัดกิจกรรม" : "Event Date"}</span>
                </div>
                <p className="text-sm font-black text-gray-900">{defaultDate}</p>
              </div>

              {/* Time Slot / Walk-in Time */}
              <div className="rounded-xl border border-red-100 bg-[#FDF2F3]/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#A6192E]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeLabelText}</span>
                </div>
                <p className="text-base font-black text-[#7A1222]">{timeSlot}</p>
              </div>

              {/* Venue */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-[#A6192E]" />
                  <span>{isTh ? "สถานที่จัดกิจกรรม" : "Event Venue"}</span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-snug">{defaultVenue}</p>
              </div>

              {/* Phone */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Phone className="h-3.5 w-3.5 text-[#A6192E]" />
                  <span>{isTh ? "เบอร์โทรศัพท์" : "Phone Number"}</span>
                </div>
                <p className="text-xs font-bold text-gray-900">{phone || "—"}</p>
              </div>

              {/* Faculty */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Building2 className="h-3.5 w-3.5 text-[#A6192E]" />
                  <span>{isTh ? "คณะ / สังกัด" : "Affiliation / Faculty"}</span>
                </div>
                <p className="text-xs font-bold text-gray-900 leading-snug">{faculty || (isTh ? "บุคคลทั่วไป" : "General Public")}</p>
              </div>
            </div>
          </section>

          {/* Symmetrical QR Check-in Center Box */}
          <section
            aria-labelledby="ticket-qr-heading"
            className="rounded-2xl border border-gray-100 bg-gray-50/70 p-6 text-center space-y-4"
          >
            {isConfirmed && status !== 'CANCELLED' ? (
              <>
                <div>
                  <h3 id="ticket-qr-heading" className="text-sm font-black text-gray-900 font-display">
                    {isTh ? "QR Code สำหรับเช็กอิน" : "Check-in QR Code"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isTh ? "แสดง QR Code นี้ต่อเจ้าหน้าที่ ณ จุดลงทะเบียนในวันงาน" : "Please present this QR Code to staff at the venue on event day"}
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
                        title={isTh ? "QR Code สำหรับเช็กอิน" : "Check-in QR Code"}
                        imageSettings={{
                          src: "/images/logo.png",
                          height: 28,
                          width: 28,
                          excavate: true,
                        }}
                      />
                    ) : (
                      <div className="flex h-40 w-40 items-center justify-center bg-gray-50 text-xs font-bold text-gray-400">
                        {isTh ? "กำลังสร้าง QR Code..." : "Generating QR..."}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={downloadTicket}
                    disabled={downloading}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#C5222F] to-[#A6192E] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-900/15 transition-all hover:from-[#B01B27] hover:to-[#911426] active:scale-98 disabled:opacity-60 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>{downloading ? (isTh ? "กำลังบันทึกภาพ..." : "Saving...") : (isTh ? "บันทึกภาพตั๋ว" : "Download Pass")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={shareTicket}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-[#A6192E] transition-all hover:bg-rose-100 active:scale-98 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{isTh ? "แชร์ตั๋ว" : "Share"}</span>
                  </button>

                  <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 active:scale-98"
                  >
                    <CalendarPlus className="h-4 w-4 text-blue-600" />
                    <span>Google Calendar</span>
                  </a>

                  <button
                    type="button"
                    onClick={downloadIcs}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 active:scale-98 cursor-pointer"
                  >
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span>Apple Calendar (.ics)</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-6 px-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xl shadow-2xs">
                  ✕
                </div>
                <h3 className="text-base font-black text-rose-950 font-display">
                  {isTh ? "ตั๋วลงทะเบียนนี้ถูกยกเลิกแล้ว" : "Registration Cancelled"}
                </h3>
                <p className="text-xs text-rose-800 max-w-sm mx-auto font-medium">
                  {isTh 
                    ? "รหัสและ QR Code นี้ถูกยกเลิกแล้ว ไม่สามารถนำมาใช้สแกนเช็กอินในวันงานได้ หากต้องการเข้าร่วมกิจกรรม กรุณาลงทะเบียนใหม่อีกครั้ง"
                    : "This registration and QR Code have been voided and cannot be used for check-in on event day."}
                </p>
                <div className="pt-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#A6192E] px-4 py-2 text-xs font-bold text-white hover:bg-[#8F1426] transition-all shadow-xs"
                  >
                    <span>{isTh ? "ลงทะเบียนใหม่" : "Register Again"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Symmetrical 2x2 Preparation Tips Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#A6192E]" />
              <p className="text-xs font-black text-gray-900">
                {isTh ? "ข้อแนะนำการเตรียมความพร้อม" : "Donor Preparation Tips"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
              {/* ID Card */}
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-white p-3 shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-[#A6192E] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">
                    <strong className="text-[#A6192E]">
                      {isTh ? "อย่าลืมนำบัตรประชาชนมาด้วย" : "Bring National ID Card"}
                    </strong>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {isTh ? "หรือบัตรผู้บริจาคโลหิตตัวจริง" : "Or original donor passport"}
                  </p>
                </div>
              </div>

              {/* Water */}
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-white p-3 shadow-2xs">
                <Droplets className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">
                    {isTh ? "ดื่มน้ำ 3–4 แก้วก่อนมา" : "Drink 3-4 glasses of water"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {isTh ? "ช่วยให้ระบบไหลเวียนโลหิตดีขึ้น" : "30 mins before donating"}
                  </p>
                </div>
              </div>

              {/* Sleep */}
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-white p-3 shadow-2xs">
                <Moon className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">
                    {isTh ? "นอนหลับพักผ่อน 6–8 ชม." : "Sleep 6-8 hours"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {isTh ? "ไม่อดนอนในคืนก่อนวันบริจาค" : "At least 5 hours prior"}
                  </p>
                </div>
              </div>

              {/* Food */}
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-white p-3 shadow-2xs">
                <Utensils className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">
                    {isTh ? "งดอาหารไขมันสูง & แอลกอฮอล์" : "Avoid high-fat food & alcohol"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {isTh ? "ทานอาหารมื้อหลักล่วงหน้า" : "At least 6 hours before"}
                  </p>
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
            className="editorial-btn-secondary min-h-11 flex-1 py-3 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{effectiveResetLabel}</span>
          </button>
        )}
        {onCancel && isConfirmed && status !== 'CANCELLED' && (
          <button
            type="button"
            onClick={onCancel}
            className="editorial-btn-secondary border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 min-h-11 flex-1 py-3 text-xs font-bold cursor-pointer transition-colors"
          >
            <span>{cancelLabel || (isTh ? "ขอยกเลิกการลงทะเบียน" : "Cancel Registration")}</span>
          </button>
        )}
        <Link
          href={primaryAction?.href || "/"}
          className="editorial-btn-primary min-h-11 flex-1 py-3 text-xs font-bold"
        >
          <span>{primaryAction?.label || (isTh ? "กลับสู่หน้าแรก" : "Back to Home")}</span>
          {primaryAction?.icon || <ArrowRight className="h-4 w-4" />}
        </Link>
      </div>
    </div>
  );
}
