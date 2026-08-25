'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Heart, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { TicketStub } from '@/components/ui/TicketStub';
import { formatThaiDate, formatTimeRange } from '@/lib/utils/format';

type Lang = 'th' | 'en';

const STORAGE_KEY = 'mumt_home_lang';

// Language preference lives in localStorage. useSyncExternalStore lets React
// hydrate with the Thai (server) snapshot and then swap to the visitor's saved
// choice without a hydration mismatch error.
function readLang(): Lang {
  if (typeof window === 'undefined') return 'th';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'th';
  } catch {
    return 'th';
  }
}

function subscribeLang(cb: () => void): () => void {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

function serverLang(): Lang {
  return 'th';
}

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
  const lang = useSyncExternalStore(subscribeLang, readLang, serverLang);

  const setAndSave = (next: Lang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      // Notify this tab (the browser only fires 'storage' in other tabs).
      window.dispatchEvent(new Event('storage'));
    } catch {
      // storage unavailable — the toggle still works for this visit
    }
  };

  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;
  const thDate = formatThaiDate(startAt);
  const thTime = formatTimeRange(startAt, endAt);
  const enDate = start ? EN_DATE_FMT.format(start) : '';
  const enTime = start && end ? `${formatEnTime(start)} – ${formatEnTime(end)}` : '';

  const isEn = lang === 'en';

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
    ctaRegister: isEn ? 'Register to donate blood' : 'ลงทะเบียนบริจาคโลหิต',
    ctaPrepare: isEn ? 'Prepare before donating' : 'ดูการเตรียมตัวก่อนบริจาค',
    stubName: isEn ? 'Sirividhaya Blood Donor' : 'ผู้บริจาคโลหิตศิริวิทยา',
    stubTime: isEn ? '09:00 AM - 2:00 PM' : '09:00 - 14:00 น.',
    stubVenue: isEn ? 'LA 217 Sirividhaya Building' : 'LA 217 อาคารสิริวิทยา',
  };

  const toggle = (
    <div
      className="flex items-center gap-1 rounded-full border border-[var(--cream)]/25 bg-white/10 p-1 text-xs font-black"
      role="group"
      aria-label="Language / ภาษา"
    >
      <button
        type="button"
        onClick={() => setAndSave('th')}
        aria-pressed={!isEn}
        className={`rounded-full px-3 py-1.5 transition-colors ${!isEn ? 'bg-[var(--cream)] text-[var(--burgundy-700)]' : 'text-[var(--cream)] hover:bg-white/10'}`}
      >
        ไทย
      </button>
      <button
        type="button"
        onClick={() => setAndSave('en')}
        aria-pressed={isEn}
        className={`rounded-full px-3 py-1.5 transition-colors ${isEn ? 'bg-[var(--cream)] text-[var(--burgundy-700)]' : 'text-[var(--cream)] hover:bg-white/10'}`}
      >
        EN
      </button>
    </div>
  );

  return (
    <>
      {/* ============ HERO — full-bleed red field ============ */}
      <section className="hero-field relative">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-28 sm:px-6 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-16">
          <div className="flex justify-end mb-4">{toggle}</div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:items-end">

            {/* Left: campaign statement */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="brand-chip rise-in">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  {copy.badge}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-1 text-[11px] font-black text-amber-200 backdrop-blur-sm shadow-sm">
                  ✨ {isEn ? 'Mahidol AT: 1 hr Health Literacy + 1 hr Volunteer' : 'สะสม Mahidol AT: 1 ชม. Health Literacy + 1 ชม. จิตอาสา'}
                </span>
              </div>

              {/* lg keeps sm:text-6xl (60px); only xl (≥1280px, where the left
                  column is wide enough) bumps to 4.5rem — at 4.5rem the Thai line
                  “ต่อชีวิตด้วยโลหิตคุณ” (≈650px) overflows the 7-col column on
                  smaller desktops and orphans “คุณ” onto its own line. EN lines
                  are longer, so they get a smaller scale. */}
              <h1 className={`text-[2.25rem] leading-[1.08] font-black text-[var(--cream)] min-[420px]:text-[2.6rem] ${isEn ? 'sm:text-4xl xl:text-5xl' : 'sm:text-6xl xl:text-[4.5rem]'} tracking-[-0.02em]`}>
                {copy.title1a}{' '}
                <span className="text-[var(--burgundy-300)]">{copy.title1b}</span>
                {copy.title1c && <> {copy.title1c}</>}
                <br />
                {copy.title2}
              </h1>

              <p className="max-w-xl text-[15px] sm:text-base leading-relaxed text-[var(--cream-dim)] font-medium">
                {copy.description}
              </p>

              {/* Event facts */}
              <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-2">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4.5 w-4.5 text-[var(--burgundy-300)]" />
                  <span className="text-sm font-bold text-[var(--cream)]">{copy.date}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4.5 w-4.5 text-[var(--burgundy-300)]" />
                  <span className="text-sm font-bold text-[var(--cream)]">{copy.time}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-[var(--burgundy-300)]" />
                  <span className="text-sm font-bold text-[var(--cream)]">{copy.venue}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/register" className="btn-cream">
                  <span>{copy.ctaRegister}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/screening" className="btn-outline-cream border-amber-300/60 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20">
                  <span>{isEn ? 'Self-Screening Quiz' : 'ประเมินความพร้อมตนเอง'}</span>
                </Link>
                <Link href="/knowledge" className="btn-outline-cream">
                  <span>{isEn ? 'Blood Knowledge & Labs' : 'ความรู้โลหิต & แล็บตรวจ'}</span>
                </Link>
              </div>
            </div>

            {/* Right: ticket breaks out of the hero bottom edge */}
            <div className="lg:col-span-5 hidden lg:flex justify-end">
              <div className="rise-in w-full max-w-md rotate-2 origin-top-right relative z-10 lg:translate-y-24">
                <TicketStub
                  registrationCode="MBD26-DONORPASS"
                  name={copy.stubName}
                  date="16 SEP 2026"
                  timeSlot={copy.stubTime}
                  venue={copy.stubVenue}
                  unitNumber="09"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile ticket — hangs off the hero bottom */}
      <div className="lg:hidden mx-auto -mt-24 max-w-md px-4 sm:px-6 relative z-10">
        <TicketStub
          registrationCode="MBD26-DONORPASS"
          name={copy.stubName}
          date="16 SEP 2026"
          timeSlot={copy.stubTime}
          venue={copy.stubVenue}
          unitNumber="09"
        />
      </div>
    </>
  );
}
