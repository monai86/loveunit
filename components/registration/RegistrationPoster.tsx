'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Download, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const POSTERS = {
  th: {
    src: '/images/poster-th.jpg',
    fileName: 'poster-th.jpg',
    alt: 'โปสเตอร์ประชาสัมพันธ์ MUMT Blood Donation 2026 ครั้งที่ 9 (ภาษาไทย)',
  },
  en: {
    src: '/images/poster-en.jpg',
    fileName: 'poster-en.jpg',
    alt: 'MUMT Blood Donation 2026 9th Event Poster (English)',
  },
};

export function RegistrationPoster() {
  const { language, setLanguage, isEn } = useLanguage();
  const poster = POSTERS[language];

  const copy = {
    heading: isEn ? 'Event Poster' : 'โปสเตอร์ประชาสัมพันธ์',
    sub: isEn
      ? 'Download the poster and help spread the word about the event.'
      : 'ดาวน์โหลดโปสเตอร์ไปแชร์ต่อ หรือดูโปสเตอร์ฉบับเต็มทั้ง 2 ภาษา',
    download: isEn ? 'Download Poster' : 'ดาวน์โหลดโปสเตอร์',
    viewAll: isEn ? 'View All Posters' : 'ดูโปสเตอร์ทั้งหมด',
  };

  return (
    <section aria-label={copy.heading} className="mt-8">
      <div className="editorial-card p-6 sm:p-8 space-y-5">
        {/* Header + language toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-editorial-ink">{copy.heading}</h2>
            <p className="text-xs text-editorial-muted font-medium">{copy.sub}</p>
          </div>

          <div
            className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--bg)] p-1 text-xs font-black"
            role="group"
            aria-label="Language / ภาษา"
          >
            <button
              type="button"
              onClick={() => setLanguage('th')}
              aria-pressed={!isEn}
              className={`rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
                !isEn ? 'bg-[var(--burgundy-700)] text-white' : 'text-[var(--muted)] hover:bg-[var(--rose-100)]'
              }`}
            >
              ไทย
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={isEn}
              className={`rounded-full px-3 py-1.5 transition-colors cursor-pointer ${
                isEn ? 'bg-[var(--burgundy-700)] text-white' : 'text-[var(--muted)] hover:bg-[var(--rose-100)]'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Poster */}
        <div className="mx-auto w-full max-w-[300px] sm:max-w-sm">
          <div className="overflow-hidden rounded-xl border border-[var(--line)] shadow-[var(--shadow-soft)]">
            <Image
              src={poster.src}
              alt={poster.alt}
              width={1831}
              height={2289}
              sizes="(min-width: 640px) 384px, 300px"
              className="h-auto w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <a
            href={poster.src}
            download={poster.fileName}
            className="editorial-btn-primary py-3 text-xs justify-center flex-1 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{copy.download}</span>
          </a>
          <Link href="/poster" className="editorial-btn-secondary py-3 text-xs justify-center flex-1 cursor-pointer">
            <span>{copy.viewAll}</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
