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
  Heart,
  MapPin,
  Moon,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
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
      const width = 520 * scale;
      const height = 760 * scale;
      const inset = 24 * scale;
      canvas.width = width;
      canvas.height = height;

      // Outer background
      context.fillStyle = "#F6F4F4";
      context.fillRect(0, 0, width, height);

      // White card surface
      context.fillStyle = "#FFFFFF";
      context.fillRect(inset, inset, width - inset * 2, height - inset * 2);
      context.strokeStyle = "#E8DCD8";
      context.lineWidth = scale;
      context.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

      // Red Gradient Header
      const headerHeight = 135 * scale;
      const grad = context.createLinearGradient(inset, inset, width - inset, inset + headerHeight);
      grad.addColorStop(0, "#9C1528");
      grad.addColorStop(0.5, "#6E101E");
      grad.addColorStop(1, "#38060F");
      context.fillStyle = grad;
      context.fillRect(inset, inset, width - inset * 2, headerHeight);

      // Header Text
      context.fillStyle = "#FDF6F1";
      context.textAlign = "left";
      context.font = `700 ${13 * scale}px sans-serif`;
      context.fillText("MUMT LoveUnit ครั้งที่ 9 (9th Edition)", inset + 24 * scale, inset + 36 * scale);

      context.font = `800 ${22 * scale}px sans-serif`;
      context.fillText("ตั๋วลงทะเบียนบริจาคโลหิต", inset + 24 * scale, inset + 70 * scale);

      context.fillStyle = "#EFDCD6";
      context.font = `600 ${12 * scale}px sans-serif`;
      context.fillText("Blood Donor Official Digital Pass ❤️", inset + 24 * scale, inset + 98 * scale);

      // Registration Number Box
      const x = inset + 24 * scale;
      let y = inset + headerHeight + 36 * scale;

      context.fillStyle = "#6E101E";
      context.font = `800 ${11 * scale}px sans-serif`;
      context.fillText("หมายเลขลงทะเบียน / REGISTRATION NO.", x, y);

      context.font = `800 ${28 * scale}px monospace`;
      context.fillText(registrationCode, x, y + 32 * scale);

      // Appointment Details
      y += 82 * scale;
      context.fillStyle = "#241B1D";
      context.font = `600 ${12 * scale}px sans-serif`;
      const detailsList = [
        `ผู้ลงทะเบียน / Donor Name:  ${name}`,
        `วันจัดงาน / Date:  ${date}`,
        `เวลามาถึง / Time:  ${timeSlot}`,
        `สถานที่ / Venue:  ${venue}`,
      ];
      detailsList.forEach((detail) => {
        context.fillText(detail.slice(0, 56), x, y);
        y += 26 * scale;
      });

      // QR Code
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
            const size = 150 * scale;
            const qrX = (width - size) / 2;
            const qrY = height - inset - size - 62 * scale;
            context.fillStyle = "#FFFFFF";
            context.fillRect(qrX - 10 * scale, qrY - 10 * scale, size + 20 * scale, size + 20 * scale);
            context.strokeStyle = "#F1D3D9";
            context.lineWidth = 2 * scale;
            context.strokeRect(qrX - 10 * scale, qrY - 10 * scale, size + 20 * scale, size + 20 * scale);
            context.drawImage(image, qrX, qrY, size, size);
            URL.revokeObjectURL(blobUrl);
            resolve();
          };
          image.src = blobUrl;
        });
      }

      // Footer note
      context.fillStyle = "#5F5558";
      context.textAlign = "center";
      context.font = `600 ${10 * scale}px sans-serif`;
      context.fillText(
        "แสดง QR Code นี้ต่อเจ้าหน้าที่ ณ จุดลงทะเบียน (Please present this QR upon arrival)",
        width / 2,
        height - inset - 22 * scale,
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

  const details = [
    { label: "ผู้ลงทะเบียน", enLabel: "Donor Name", value: name, icon: User },
    { label: "วันจัดกิจกรรม", enLabel: "Event Date", value: date, icon: Calendar },
    { label: "เวลามาถึง", enLabel: "Time Slot", value: timeSlot, icon: Clock, highlight: true },
    { label: "สถานที่", enLabel: "Venue", value: venue, icon: MapPin },
    ...(phone ? [{ label: "เบอร์โทรศัพท์", enLabel: "Phone Number", value: phone, icon: Phone }] : []),
    ...(faculty
      ? [{ label: "คณะ / สังกัด", enLabel: "Faculty / Org", value: faculty, icon: Building2 }]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      {/* Main Ticket Card */}
      <article
        data-testid="donor-ticket"
        className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-xl shadow-[var(--burgundy-950)]/5 transition-all"
      >
        {/* Playful Red Gradient Header */}
        <header className="relative overflow-hidden bg-gradient-to-br from-[#9C1528] via-[#6E101E] to-[#38060F] px-6 py-6 text-[var(--cream)] sm:px-8 sm:py-7">
          {/* Subtle background glow effect */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-rose-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 left-1/3 h-28 w-28 rounded-full bg-red-500/15 blur-xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2 backdrop-blur-md ring-1 ring-white/20 shadow-inner">
                <Image
                  src="/images/logo.png"
                  alt="MUMT LoveUnit"
                  width={36}
                  height={36}
                  className="h-8 w-8 rounded-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[var(--cream-dim)] flex items-center gap-1">
                    <span>MUMT LoveUnit ครั้งที่ 9</span>
                    <span className="text-[10px] opacity-75">(9th Edition)</span>
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/25 px-2 py-0.5 text-[10px] font-extrabold text-white ring-1 ring-white/20">
                    <Sparkles className="h-2.5 w-2.5" />
                    Hero Pass
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl font-display">
                  ตั๋วลงทะเบียนบริจาคโลหิต
                </h2>
                <p className="text-xs font-medium text-[var(--cream-dim)]">
                  Official Blood Donor Pass ❤️
                </p>
              </div>
            </div>

            {isConfirmed && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200 backdrop-blur-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                <span>ยืนยันแล้ว / Confirmed</span>
              </span>
            )}
          </div>
        </header>

        {/* Ticket Perforation Notch Decorator */}
        <div className="relative flex items-center justify-between px-4 bg-white">
          <div className="-ml-7 h-5 w-5 rounded-full bg-[var(--bg)] border-r border-[var(--line)]" />
          <div className="flex-1 border-b-2 border-dashed border-[var(--line)] mx-2" />
          <div className="-mr-7 h-5 w-5 rounded-full bg-[var(--bg)] border-l border-[var(--line)]" />
        </div>

        {/* Card Body */}
        <div className="px-6 py-6 sm:px-8 space-y-6">
          {/* Registration Code Showcase */}
          <div className="rounded-2xl border border-[var(--rose-100)] bg-gradient-to-br from-[#FFF5F6] to-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black tracking-wider text-[var(--burgundy-700)] uppercase">
                  หมายเลขลงทะเบียน <span className="text-[10px] font-bold text-[var(--muted)]">/ Registration No.</span>
                </p>
                <p className="mt-1 font-mono text-2xl font-black tracking-wider text-[var(--burgundy-800)] sm:text-3xl">
                  {registrationCode}
                </p>
              </div>
              <button
                type="button"
                onClick={copyCode}
                aria-label="คัดลอกหมายเลขลงทะเบียน"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--burgundy-700)] shadow-xs transition-all hover:bg-[var(--rose-100)] hover:scale-105 active:scale-95"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-[var(--ok)] animate-in zoom-in" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <p
              role="status"
              className="mt-2 text-xs font-medium text-[var(--muted)] flex items-center gap-1.5"
            >
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              <span>{copied ? "คัดลอกหมายเลขเรียบร้อยแล้ว! (Copied!)" : "บันทึกหรือแคปเจอร์หน้านี้ไว้ใช้ในวันงาน"}</span>
            </p>
          </div>

          {/* Appointment Details Section */}
          <section aria-labelledby="appointment-details">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3
                id="appointment-details"
                className="text-base font-black text-[var(--ink)] flex items-center gap-2 font-display"
              >
                <span>รายละเอียดการนัดหมาย</span>
                <span className="text-xs font-medium text-[var(--muted)]">/ Appointment Details</span>
              </h3>
            </div>
            <dl className="mt-3 divide-y divide-[var(--line)]">
              {details.map(({ label, enLabel, value, icon: Icon, highlight }) => (
                <div
                  key={label}
                  className="grid grid-cols-[2.5rem_1fr] items-center gap-3 py-3"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${highlight ? 'bg-[var(--rose-100)] text-[var(--burgundy-700)]' : 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
                      <span>{label}</span>
                      <span className="text-[10px] opacity-75 font-normal">({enLabel})</span>
                    </dt>
                    <dd className={`mt-0.5 text-sm font-bold leading-6 ${highlight ? 'text-[var(--burgundy-700)] font-black text-base' : 'text-[var(--ink)]'}`}>
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* QR Code Section */}
          <section
            className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"
            aria-labelledby="ticket-qr-heading"
          >
            <div className="space-y-2">
              <h3
                id="ticket-qr-heading"
                className="text-base font-black text-[var(--ink)] font-display flex items-center gap-1.5"
              >
                <span>QR สำหรับเช็กอิน</span>
                <span className="text-xs font-medium text-[var(--muted)]">/ Check-in QR</span>
              </h3>
              <p className="max-w-xs text-xs leading-5 text-[var(--muted)]">
                แสดง QR Code นี้ต่อเจ้าหน้าที่ ณ จุดลงทะเบียนเพื่อความสะดวกรวดเร็ว
                <span className="block text-[11px] opacity-80 mt-0.5">(Present this QR Code to staff at check-in)</span>
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={downloadTicket}
                  disabled={downloading}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-600)] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-[var(--burgundy-700)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? "กำลังบันทึกภาพ... (Saving...)" : "บันทึกตั๋วเป็นรูปภาพ / Save Pass"}</span>
                </button>
              </div>
            </div>

            <div
              ref={qrRef}
              className="mt-4 flex justify-center sm:mt-0"
            >
              <div className="rounded-2xl border-2 border-[var(--rose-100)] bg-white p-3.5 shadow-sm">
                {qrToken ? (
                  <QRCodeSVG
                    value={qrToken}
                    size={156}
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
                  <div className="flex h-36 w-36 items-center justify-center bg-[var(--bg)] text-center text-xs font-bold text-[var(--muted)]">
                    กำลังสร้าง QR Code...
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Playful & Orderly Health & Prep Checklist Cards */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--burgundy-700)]" />
              <p className="text-xs font-black text-[var(--burgundy-800)]">
                ข้อแนะนำการเตรียมตัวก่อนมาบริจาคโลหิต / Preparation Tips
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
              <div className="flex items-start gap-2 rounded-xl bg-white p-2.5 border border-rose-100/60 shadow-2xs">
                <span className="text-base leading-none">🪪</span>
                <div>
                  <p className="font-bold text-[var(--ink)]">
                    <strong className="text-[var(--burgundy-800)]">อย่าลืมนำบัตรประชาชนมาด้วย</strong>
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">หรือบัตรผู้บริจาคโลหิต (Bring ID Card)</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-white p-2.5 border border-rose-100/60 shadow-2xs">
                <Droplets className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[var(--ink)]">ดื่มน้ำ 3–4 แก้วก่อนมา</p>
                  <p className="text-[11px] text-[var(--muted)]">Drink plenty of water before arrival</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-white p-2.5 border border-rose-100/60 shadow-2xs">
                <Moon className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[var(--ink)]">นอนหลับพักผ่อน 6–8 ชม.</p>
                  <p className="text-[11px] text-[var(--muted)]">Get 6–8 hours of sound sleep</p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-white p-2.5 border border-rose-100/60 shadow-2xs">
                <span className="text-base leading-none">🥗</span>
                <div>
                  <p className="font-bold text-[var(--ink)]">งดอาหารไขมันสูง & แอลกอฮอล์</p>
                  <p className="text-[11px] text-[var(--muted)]">Avoid high-fat food & alcohol</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Action Buttons */}
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
