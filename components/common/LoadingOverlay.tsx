'use client';

import React from 'react';
import Image from 'next/image';

export type LoadingVariant = 'donor-register' | 'staff-scan' | 'staff-checkin' | 'default';

export interface LoadingOverlayProps {
  variant?: LoadingVariant;
  title?: string;
  badge?: string;
  subtitle?: string;
  statusText?: string;
  hint?: string;
  className?: string;
}

const VARIANT_CONFIGS: Record<LoadingVariant, {
  title: string;
  badge: string;
  subtitle: string;
  statusText: string;
  hint: string;
}> = {
  'donor-register': {
    title: 'MUMT LoveUnit',
    badge: 'ครั้งที่ 9',
    subtitle: 'เติมรักให้เต็ม Unit · ต่อชีวิตด้วยโลหิตคุณ',
    statusText: 'กำลังบันทึกข้อมูลการลงทะเบียน...',
    hint: 'ระบบกำลังจัดเตรียมตั๋วลงทะเบียน และจัดส่งอีเมลยืนยันให้ท่าน',
  },
  'staff-scan': {
    title: 'MUMT LoveUnit',
    badge: 'ระบบหน้างาน',
    subtitle: 'ตรวจสอบข้อมูลผู้ลงทะเบียนบริจาคโลหิต',
    statusText: 'กำลังอ่านและประมวลผล QR Code...',
    hint: 'ตรวจสอบสถานะการนัดหมายและการลงทะเบียน',
  },
  'staff-checkin': {
    title: 'MUMT LoveUnit',
    badge: 'ระบบหน้างาน',
    subtitle: 'บันทึกข้อมูลและอัปเดตสถานะหน้างาน',
    statusText: 'กำลังบันทึกการเช็กอิน...',
    hint: 'อัปเดตสถานะผู้บริจาคโลหิตแบบเรียลไทม์',
  },
  'default': {
    title: 'MUMT LoveUnit',
    badge: 'ครั้งที่ 9',
    subtitle: 'เติมรักให้เต็ม Unit · ต่อชีวิตด้วยโลหิตคุณ',
    statusText: 'กำลังเตรียมข้อมูล...',
    hint: 'กรุณารอสักครู่ ระบบกำลังประมวลผล',
  },
};

export function LoadingOverlay({
  variant = 'default',
  title,
  badge,
  subtitle,
  statusText,
  hint,
  className = '',
}: LoadingOverlayProps) {
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.default;

  const displayTitle = title ?? config.title;
  const displayBadge = badge ?? config.badge;
  const displaySubtitle = subtitle ?? config.subtitle;
  const displayStatus = statusText ?? config.statusText;
  const displayHint = hint ?? config.hint;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={displayStatus}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-200 ${className}`}
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
      <div className="flex flex-col items-center max-w-sm px-6 text-center">
        {/* Event logo with gentle float */}
        <div className="loading-float mb-4">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 110,
              height: 110,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Image
              src="/images/logo.png"
              alt="MUMT LoveUnit ครั้งที่ 9"
              width={90}
              height={90}
              priority
              className="object-contain"
              style={{ width: 90, height: 90 }}
            />
          </div>
        </div>

        {/* Brand text */}
        <h3
          className="text-sm font-bold font-display tracking-tight"
          style={{ color: '#FDF6F1' }}
        >
          {displayTitle}{' '}
          {displayBadge && (
            <span className="font-extrabold" style={{ color: '#E07163' }}>
              {displayBadge}
            </span>
          )}
        </h3>

        {displaySubtitle && (
          <p
            className="mt-1.5 text-xs font-medium"
            style={{ color: 'rgba(253, 246, 241, 0.65)' }}
          >
            {displaySubtitle}
          </p>
        )}

        {/* Shimmer progress bar */}
        <div
          className="mt-5 h-1 w-44 overflow-hidden rounded-full"
          style={{ backgroundColor: 'rgba(253, 246, 241, 0.12)' }}
        >
          <div
            className="h-full w-full rounded-full loading-progress loading-shimmer"
            style={{ backgroundColor: 'rgba(253, 246, 241, 0.50)' }}
          />
        </div>

        {/* Status label */}
        <span
          className="mt-3 text-xs font-semibold"
          style={{ color: 'rgba(253, 246, 241, 0.85)' }}
        >
          {displayStatus}
        </span>

        {/* Optional Context Hint */}
        {displayHint && (
          <p
            className="mt-1 text-[11px] font-normal leading-relaxed max-w-xs"
            style={{ color: 'rgba(253, 246, 241, 0.50)' }}
          >
            {displayHint}
          </p>
        )}
      </div>
    </div>
  );
}
