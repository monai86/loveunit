import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-label="กำลังโหลดข้อมูล"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#7E0E1D',
        backgroundImage: [
          'radial-gradient(100% 75% at 85% 0%, rgba(240, 100, 85, 0.24) 0%, transparent 60%)',
          'radial-gradient(90% 80% at 10% 100%, rgba(210, 45, 60, 0.30) 0%, transparent 65%)',
          'radial-gradient(60% 60% at 50% 30%, rgba(185, 25, 45, 0.18) 0%, transparent 70%)',
          'linear-gradient(140deg, #9C1528 0%, #7E0E1D 30%, #5E0B17 65%, #3B060F 100%)',
        ].join(', '),
      }}
    >
      <div className="flex flex-col items-center max-w-xs px-6 text-center">

        {/* Event logo with gentle float */}
        <div className="loading-float mb-4">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 120,
              height: 120,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Image
              src="/images/logo.png"
              alt="MUMT LoveUnit ครั้งที่ 9"
              width={100}
              height={100}
              priority
              className="object-contain"
              style={{ width: 100, height: 100 }}
            />
          </div>
        </div>

        {/* Brand text — cream on burgundy */}
        <h3
          className="text-sm font-bold font-display tracking-tight"
          style={{ color: '#FDF6F1' }}
        >
          MUMT LoveUnit{' '}
          <span className="font-extrabold" style={{ color: '#E07163' }}>
            ครั้งที่ 9
          </span>
        </h3>
        <p
          className="mt-1.5 text-xs font-medium"
          style={{ color: 'rgba(253, 246, 241, 0.65)' }}
        >
          เติมรักให้เต็ม Unit · ต่อชีวิตด้วยโลหิตคุณ
        </p>

        {/* Shimmer progress bar */}
        <div
          className="mt-6 h-1 w-44 overflow-hidden rounded-full"
          style={{ backgroundColor: 'rgba(253, 246, 241, 0.12)' }}
        >
          <div
            className="h-full w-full rounded-full loading-progress loading-shimmer"
            style={{ backgroundColor: 'rgba(253, 246, 241, 0.50)' }}
          />
        </div>

        {/* Status label */}
        <span
          className="mt-3 text-[11px] font-semibold"
          style={{ color: 'rgba(253, 246, 241, 0.50)' }}
        >
          กำลังเตรียมข้อมูล...
        </span>
      </div>
    </div>
  );
}
