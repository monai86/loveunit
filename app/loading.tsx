import React from 'react';
import { Heart } from 'lucide-react';

export default function Loading() {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-label="กำลังโหลดข้อมูล"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)]"
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center">
        
        {/* Keep the fallback static: it appears during navigation and must stay cheap to paint. */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--burgundy-700)] shadow-xl">
            <Heart aria-hidden="true" className="h-9 w-9 fill-current" />
          </div>
        </div>

        {/* Brand Text */}
        <h3 className="text-base font-bold text-[var(--ink)] font-display tracking-tight">
          MUMT LoveUnit <span className="text-[var(--burgundy-600)] font-extrabold">ครั้งที่ 9</span>
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)] font-medium">
          เติมรักให้เต็ม Unit · ต่อชีวิตด้วยโลหิตคุณ
        </p>

        {/* The only animation is opacity, which does not move or resize the layout. */}
        <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-[var(--rose-100)] border border-[var(--line)]">
          <div className="h-full w-full rounded-full bg-[var(--burgundy-600)] loading-progress" />
        </div>

        {/* Status Indicator */}
        <span className="mt-3 text-[11px] font-semibold text-[var(--muted)]">
          กำลังเตรียมข้อมูล...
        </span>
      </div>
    </div>
  );
}
