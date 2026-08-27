import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export default function Loading() {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-label="กำลังโหลดข้อมูล"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)]/80 backdrop-blur-md transition-opacity duration-300"
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Animated Brand Pulse Frame */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Glowing Ripple Waves */}
          <div className="absolute h-24 w-24 rounded-full bg-rose-500/20 animate-ping" />
          <div className="absolute h-20 w-20 rounded-full bg-[var(--burgundy-500)]/25 animate-pulse" />
          
          {/* Center Brand Badge */}
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-xl border border-[var(--line)]">
            <Image
              src="/images/logo.png"
              alt="MUMT LOVE UNIT Logo"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          {/* Floating Micro Heart with Heartbeat Animation */}
          <div className="absolute -top-1.5 -right-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--burgundy-700)] to-rose-500 text-white shadow-md animate-bounce">
            <Heart className="h-3.5 w-3.5 fill-white" />
          </div>
        </div>

        {/* Brand Text */}
        <h3 className="text-base font-bold text-[var(--ink)] font-display tracking-tight">
          MUMT Blood Donation 2026 <span className="text-[var(--burgundy-600)] font-extrabold">ครั้งที่ 9</span>
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)] font-medium">
          เติมรักให้เต็ม Unit · ต่อชีวิตด้วยโลหิตคุณ
        </p>

        {/* Fluid Shimmer Progress Bar */}
        <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-[var(--rose-100)] border border-[var(--line)]">
          <div className="h-full w-full bg-gradient-to-r from-[var(--burgundy-700)] via-rose-500 to-[var(--burgundy-500)] animate-[shimmer_1.5s_infinite] origin-left rounded-full" />
        </div>

        {/* Status Indicator */}
        <span className="mt-3 text-[11px] font-semibold text-[var(--muted)]">
          กำลังเตรียมข้อมูล...
        </span>
      </div>
    </div>
  );
}
