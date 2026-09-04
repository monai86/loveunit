'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Calendar, Clock, MapPin, ArrowRight, Search, Sparkles, Gift } from 'lucide-react';
import { formatThaiDate, formatTimeRange, isEventDay } from '@/lib/utils/format';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Official caption (EN) from the event poster — Regional Blood Centre 4, Ratchaburi.
const EN_DESCRIPTION =
  'Join us for the 9th MUMT Love Unit Blood Donation! Be part of something meaningful and help support patients in need through blood donation. ' +
  'The Faculty of Medical Technology, Mahidol University, in collaboration with the Regional Blood Centre 4, Ratchaburi, invites you to join us in sharing hope and making a difference. ' +
  'A single blood donation can help save multiple lives.';

const EN_DATE_FMT = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const EN_TIME_FMT = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

function formatEnTime(date: Date | null): string {
  if (!date) return '';
  return EN_TIME_FMT.format(date);
}

export function HeroClient({
  description,
  startAt,
  endAt,
}: {
  description: string;
  startAt: string;
  endAt: string;
}) {
  const { isEn } = useLanguage();
  const eventDay = isEventDay();

  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;
  const thDate = formatThaiDate(startAt);
  const thTime = formatTimeRange(startAt, endAt);
  const enDate = start ? EN_DATE_FMT.format(start) : '';
  const enTime = start && end ? `${formatEnTime(start)} – ${formatEnTime(end)}` : '';

  const copy = {
    badge: isEn ? '9th · MUMT Blood Donation 2026' : 'ครั้งที่ 9 · MUMT Blood Donation 2026',
    title1a: isEn ? 'Fill Your' : 'เติมรักให้เต็ม',
    title1b: isEn ? 'Unit' : 'UNIT',
    title1c: isEn ? 'with Love' : '',
    title2: isEn ? 'Save Lives with Your Blood' : 'ต่อชีวิตด้วยโลหิตคุณ',
    description: isEn ? EN_DESCRIPTION : description,
    date: isEn ? enDate : thDate,
    time: isEn ? enTime : thTime,
    venue: isEn ? 'Meeting Room 217, Sirividhaya Building' : 'ห้องประชุม 217 อาคารสิริวิทยา',
    souvenirBadge: isEn ? 'Special Privilege' : 'สิทธิพิเศษ',
    souvenirTitle: isEn ? 'First 100 donors receive a special commemorative souvenir!' : 'ผู้บริจาค 100 ท่านแรก รับของที่ระลึกสุดพิเศษ!',
    souvenirDesc: isEn
      ? 'Exclusive commemorative souvenir awarded to the first 100 donors upon donation on-site.'
      : 'มอบของที่ระลึกสุดพิเศษแทนคำขอบคุณสำหรับผู้บริจาคโลหิตสำเร็จ 100 ท่านแรก ณ จุดบริการ',
    ctaRegister: isEn ? 'Register to donate blood' : 'ลงทะเบียนบริจาคโลหิตออนไลน์',
    ctaPrepare: isEn ? 'Prepare before donating' : 'ดูการเตรียมตัวก่อนบริจาค',
  };

  return (
    <>
      {/* ============ HERO — full-bleed red field ============ */}
      <section className="hero-field relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8 lg:pt-12 lg:pb-16">
          
          {/* Top Bar: Event Badge (Clean & focused, language switch handled on Navbar) */}
          <div className="flex items-center justify-start gap-3 mb-6 sm:mb-8">
            <span className="brand-chip rise-in whitespace-nowrap text-xs font-bold shadow-2xs">
              {eventDay ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 fill-current shrink-0 text-amber-300" />
                  <span className="font-extrabold text-amber-200">{isEn ? 'Event Day · Walk-in Open' : 'วันจัดกิจกรรม · เปิด Walk-in แล้ว'}</span>
                </>
              ) : (
                <>
                  <Heart className="h-3.5 w-3.5 fill-current shrink-0 text-[var(--burgundy-300)]" />
                  <span>{copy.badge}</span>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">

            {/* Left Column: Headline, Description, Event Facts & CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Campaign Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-[var(--cream)] leading-[1.25] tracking-normal font-sans">
                <span>{copy.title1a}</span>{' '}
                <span className="text-[var(--burgundy-300)] font-extrabold font-display tracking-wider">{copy.title1b}</span>
                {copy.title1c && <> {copy.title1c}</>}
                <br />
                <span className="inline-block mt-1 font-bold">{copy.title2}</span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[var(--cream-dim)] font-medium">
                {copy.description}
              </p>

              {/* Event Facts & Action Buttons - Unified Width & Perfect Symmetry */}
              <div className="space-y-4 pt-1 w-full">
                
                {/* 100 Donors Special Souvenir Banner */}
                <div className="flex items-center gap-3.5 rounded-2xl bg-gradient-to-r from-amber-400/20 via-amber-300/25 to-amber-500/15 border border-amber-300/40 p-3.5 sm:p-4 text-amber-100 shadow-md backdrop-blur-xs">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shrink-0 shadow-sm border border-amber-200/40">
                    <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-md font-mono border border-amber-300/30">
                        {copy.souvenirBadge}
                      </span>
                      <span className="text-xs sm:text-sm md:text-base font-black text-amber-100">
                        {copy.souvenirTitle}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium">
                      {copy.souvenirDesc}
                    </p>
                  </div>
                </div>

                {/* Event Facts: Enlarged & High-Visibility Date, Time, Venue Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-3.5 text-[var(--cream)] shadow-sm hover:bg-white/20 transition-all">
                    <div className="p-2.5 rounded-xl bg-white/10 text-amber-200 shrink-0 border border-white/15 shadow-xs">
                      <Calendar className="h-5 w-5 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200/90">
                        {isEn ? 'Date' : 'วันที่'}
                      </span>
                      <span className="block text-xs sm:text-sm font-extrabold text-[var(--cream)] leading-snug">
                        {copy.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-3.5 text-[var(--cream)] shadow-sm hover:bg-white/20 transition-all">
                    <div className="p-2.5 rounded-xl bg-white/10 text-amber-200 shrink-0 border border-white/15 shadow-xs">
                      <Clock className="h-5 w-5 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200/90">
                        {isEn ? 'Time' : 'เวลา'}
                      </span>
                      <span className="block text-xs sm:text-sm font-extrabold text-[var(--cream)] leading-snug">
                        {copy.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-3.5 text-[var(--cream)] shadow-sm hover:bg-white/20 transition-all">
                    <div className="p-2.5 rounded-xl bg-white/10 text-amber-200 shrink-0 border border-white/15 shadow-xs">
                      <MapPin className="h-5 w-5 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200/90">
                        {isEn ? 'Venue' : 'สถานที่'}
                      </span>
                      <span className="block text-xs sm:text-sm font-extrabold text-[var(--cream)] leading-snug break-words">
                        {copy.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Action: Full-width Primary Button */}
                <Link 
                  href="/register" 
                  className="btn-cream !w-full shadow-lg hover:shadow-xl font-display font-black text-sm sm:text-base px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 active:scale-95 transition-all text-center tracking-wide"
                >
                  <span>{copy.ctaRegister}</span>
                  <ArrowRight className="h-4.5 w-4.5 shrink-0" />
                </Link>

                {/* Secondary Actions: Symmetrical 2-Column Grid */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <Link 
                    href="/screening" 
                    className="btn-outline-cream !w-full border-amber-300/50 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 font-bold text-xs sm:text-sm px-3 py-3 rounded-2xl flex items-center justify-center text-center transition-colors shadow-2xs"
                  >
                    <span className="truncate">{isEn ? 'Self-Screening Quiz' : 'ประเมินความพร้อมตนเอง'}</span>
                  </Link>
                  <Link 
                    href="/lookup" 
                    className="btn-outline-cream !w-full border-white/25 bg-white/10 hover:bg-white/20 text-[var(--cream)] font-bold text-xs sm:text-sm px-3 py-3 rounded-2xl flex items-center justify-center gap-1.5 text-center transition-colors shadow-2xs"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-white/80" />
                    <span className="truncate">{isEn ? 'Find My QR Code' : 'ค้นหาตั๋ว / QR Code'}</span>
                  </Link>
                </div>

              </div>
            </div>

            {/* Right Column: Official Event Poster (5 cols) - Centered & Inward */}
            <div className="lg:col-span-5 flex justify-center lg:justify-center items-center">
              <div className="rise-in w-full max-w-xs sm:max-w-sm lg:max-w-[320px] xl:max-w-[350px] relative group">
                <Link 
                  href="/poster" 
                  className="block relative aspect-[1/1.414] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/25 hover:border-white/60 transition-all duration-300 transform group-hover:scale-[1.01] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  <Image
                    src={isEn ? '/images/poster-en.jpg' : '/images/poster-th.jpg'}
                    alt="MUMT Blood Donation 2026 Official Poster"
                    fill
                    sizes="(min-width: 1024px) 380px, 90vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                    <span className="text-xs font-bold text-white bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 border border-white/20">
                      <span>{isEn ? 'Click to view full poster' : 'คลิกเพื่อดูโปสเตอร์เต็ม'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
