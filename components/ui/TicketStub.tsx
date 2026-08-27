'use client';

import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';

interface TicketStubProps {
  registrationCode?: string;
  name?: string;
  date?: string;
  timeSlot?: string;
  venue?: string;
  qrUrl?: string;
  unitNumber?: string;
  variant?: 'desktop' | 'mobile' | 'hero';
}

export function TicketStub({
  registrationCode = 'MUMT2026-00012345',
  name = 'นายธนภัทร ใจดี',
  date = '16 SEP 2026',
  timeSlot = '09:00 - 14:00 น.',
  venue = 'LA 217 อาคารสิริวิทยา',
  qrUrl,
  unitNumber = '09',
}: TicketStubProps) {
  return (
    <div className="relative inline-block w-full max-w-xl select-none">
      
      {/* TICKET — solid white card, sharp bottom edge */}
      <div className="relative flex overflow-hidden rounded-xl bg-white shadow-[0_20px_50px_-20px_rgba(56,6,15,0.45)] border border-[var(--line)]">
        
        {/* MAIN TICKET BODY */}
        <div className="flex-1 p-5 sm:p-6 space-y-4 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-1 border border-[var(--line)] overflow-hidden">
                <Image src="/images/logo.png" alt="MUMT Logo" width={32} height={32} className="h-full w-auto object-contain rounded-full" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black tracking-wide text-[var(--burgundy-700)] uppercase">MUMT LoveUnit</p>
                <p className="truncate text-[11px] font-semibold text-[var(--muted)] tracking-tight">ครั้งที่ 9 · 2026</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--ok-bg)] px-2.5 py-1 border border-[var(--ok)]/20">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--ok)] animate-pulse"></span>
              <span className="text-[11px] font-bold text-[var(--ok)]">ยืนยันการลงทะเบียน</span>
            </div>
          </div>

          {/* Center Content */}
          <div className="grid grid-cols-12 gap-3 items-center">
            
            {/* Left Info */}
            <div className="col-span-7 space-y-2.5">
              <div>
                <span className="text-[11px] font-bold text-[var(--muted)] uppercase block">ชื่อ-นามสกุล</span>
                <span className="text-sm sm:text-base font-black text-[var(--ink)] block truncate">{name}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-[var(--muted)] uppercase block">วันจัดงาน</span>
                  <span className="font-extrabold text-[var(--burgundy-700)] block">{date}</span>
                  <span className="text-[11px] font-semibold text-[var(--ink)] block">{timeSlot}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[var(--muted)] uppercase block">สถานที่</span>
                  <span className="text-xs font-bold text-[var(--ink)] block truncate">{venue}</span>
                </div>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="col-span-5 relative flex flex-col items-center justify-center">
              
              {/* Circular Stamp Motif */}
              <div className="absolute -top-1 -right-1 h-14 w-14 rounded-full border-2 border-dashed border-[var(--burgundy-700)]/35 flex items-center justify-center rotate-[-12deg] pointer-events-none">
                <span className="text-[11px] font-bold text-[var(--burgundy-700)]/55 tracking-widest uppercase">DONOR</span>
              </div>

              {/* Blood Drop */}
              <div className="relative h-20 w-16 flex items-center justify-center">
                <svg viewBox="0 0 100 130" className="h-full w-full drop-shadow-md">
                  <defs>
                    <linearGradient id="bloodDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C13A2B" />
                      <stop offset="100%" stopColor="#6E101E" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M50,0 C50,0 100,65 100,90 C100,112 78,130 50,130 C22,130 0,112 0,90 C0,65 50,0 50,0 Z" 
                    fill="url(#bloodDropGrad)" 
                  />
                </svg>
              </div>

              <div className="mt-1 text-center">
                <span className="text-[11px] font-bold text-[var(--muted)]">UNIT</span>
                <span className="text-base font-black text-[var(--burgundy-700)] block leading-none">{unitNumber}</span>
              </div>

            </div>

          </div>

          {/* Barcode & Code Strip */}
          <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
            <div className="flex flex-col">
              <div className="h-6 flex items-center gap-0.5 overflow-hidden">
                {[2,1,3,1,4,1,2,3,1,2,1,4,2,1,3,1,2,4,1,2,3,1,2,1,4].map((w, i) => (
                  <div key={i} className="bg-[var(--ink)] h-full" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <span className="text-[11px] font-bold tracking-widest text-[var(--ink)] mt-0.5">{registrationCode}</span>
            </div>

            {qrUrl && (
              <div className="h-12 w-12 rounded-lg border border-[var(--burgundy-700)] p-0.5 bg-white shrink-0 relative">
                <Image src={qrUrl} alt="QR Code" width={48} height={48} unoptimized className="h-full w-full object-contain" />
              </div>
            )}
          </div>

        </div>

        {/* RIGHT RED STUB FLAP */}
        <div className="w-14 bg-[var(--burgundy-800)] flex flex-col items-center justify-between py-4 text-white select-none">
          <span className="text-[11px] font-bold tracking-widest uppercase rotate-90 whitespace-nowrap mt-3">
            DONOR PASS
          </span>
          <Heart className="h-5 w-5 fill-white text-white my-auto" />
          <span className="text-xs font-black tracking-widest rotate-90 mb-3">
            UNIT {unitNumber}
          </span>
        </div>

      </div>

    </div>
  );
}
