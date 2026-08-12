'use client';

import React from 'react';
import { Heart, QrCode } from 'lucide-react';

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
  timeSlot = '08:00 - 15:00 น.',
  venue = 'LA 217-218 อาคารสิริวิทยา',
  qrUrl,
  unitNumber = '09',
  variant = 'desktop',
}: TicketStubProps) {
  return (
    <div className="relative inline-block w-full max-w-xl select-none font-sans">
      
      {/* TICKET CONTAINER WITH PARCHMENT TEXTURE AND STAMPED EDGES */}
      <div className="relative flex overflow-hidden rounded-2xl border-2 border-[#7A1020] bg-[#F7F3EE] shadow-2xl">
        
        {/* MAIN TICKET BODY */}
        <div className="flex-1 p-5 sm:p-6 space-y-4 relative">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#D5C7B8] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1 border border-[#D5C7B8] shadow-xs">
                <img src="/images/logo.png" alt="MUMT Logo" className="h-full w-auto object-contain" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider text-[#7A1020] uppercase font-mono">MUMT</h3>
                <p className="text-[10px] font-bold text-[#666666] tracking-tight">BLOOD DONATION 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-[#E9E1D9] px-2.5 py-0.5 border border-[#D5C7B8]">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-[10px] font-extrabold text-[#7A1020]">ยืนยันการลงทะเบียน</span>
            </div>
          </div>

          {/* Center Content: Blood Drop Graphic & Donor Details */}
          <div className="grid grid-cols-12 gap-3 items-center">
            
            {/* Left Info (7 Cols) */}
            <div className="col-span-7 space-y-2">
              <div>
                <span className="text-[9px] font-mono font-bold text-[#666666] uppercase block">ชื่อ-นามสกุล</span>
                <span className="text-sm sm:text-base font-black text-[#282828] block truncate">{name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#666666] uppercase block">วันจัดงาน</span>
                  <span className="font-extrabold text-[#7A1020] block">{date}</span>
                  <span className="text-[10px] font-bold text-[#282828] block">{timeSlot}</span>
                </div>

                <div>
                  <span className="text-[9px] font-mono font-bold text-[#666666] uppercase block">สถานที่</span>
                  <span className="font-bold text-[#282828] block truncate">{venue}</span>
                </div>
              </div>
            </div>

            {/* Right Graphic: Blood Drop & Stamp (5 Cols) */}
            <div className="col-span-5 relative flex flex-col items-center justify-center">
              
              {/* Circular Stamp Motif */}
              <div className="absolute -top-1 -right-1 h-16 w-16 rounded-full border-2 border-dashed border-[#7A1020]/40 flex items-center justify-center rotate-[-12deg] pointer-events-none">
                <span className="text-[9px] font-mono font-black text-[#7A1020]/60 tracking-widest uppercase">DONOR</span>
              </div>

              {/* Watermark Blood Drop Illustration */}
              <div className="relative h-20 w-16 flex items-center justify-center">
                <svg viewBox="0 0 100 130" className="h-full w-full drop-shadow-md">
                  <defs>
                    <linearGradient id="bloodDropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C13A2B" />
                      <stop offset="100%" stopColor="#7A1020" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M50,0 C50,0 100,65 100,90 C100,112 78,130 50,130 C22,130 0,112 0,90 C0,65 50,0 50,0 Z" 
                    fill="url(#bloodDropGrad)" 
                  />
                </svg>
              </div>

              <div className="mt-1 text-center">
                <span className="text-[9px] font-mono font-bold text-[#666666]">UNIT</span>
                <span className="text-base font-mono font-black text-[#7A1020] block leading-none">{unitNumber}</span>
              </div>

            </div>

          </div>

          {/* Barcode & Code Strip */}
          <div className="pt-2 border-t border-[#D5C7B8] flex items-center justify-between">
            <div className="flex flex-col">
              {/* Simulated Barcode */}
              <div className="h-7 flex items-center gap-0.5 overflow-hidden">
                {[2,1,3,1,4,1,2,3,1,2,1,4,2,1,3,1,2,4,1,2,3,1,2,1,4].map((w, i) => (
                  <div key={i} className="bg-[#282828] h-full" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#282828] mt-0.5">{registrationCode}</span>
            </div>

            {qrUrl && (
              <div className="h-12 w-12 rounded-lg border border-[#7A1020] p-0.5 bg-white shrink-0">
                <img src={qrUrl} alt="QR Code" className="h-full w-full object-contain" />
              </div>
            )}
          </div>

        </div>

        {/* RIGHT DEEP RED STUB FLAP */}
        <div className="w-16 bg-[#7A1020] border-l-2 border-dashed border-white/40 flex flex-col items-center justify-between py-4 text-white select-none">
          <span className="text-[10px] font-mono font-extrabold tracking-widest uppercase rotate-90 whitespace-nowrap mt-4">
            DONOR PASS
          </span>
          <Heart className="h-5 w-5 fill-white text-white my-auto" />
          <span className="text-xs font-mono font-black tracking-widest rotate-90 mb-4">
            UNIT {unitNumber}
          </span>
        </div>

      </div>

    </div>
  );
}
