'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Search, 
  Sparkles, 
  CalendarPlus, 
  Download, 
  Check,
  Timer
} from 'lucide-react';
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

// Target event timestamp: September 16, 2026 at 09:00:00 ICT (UTC+7)
const TARGET_EVENT_DATE = new Date('2026-09-16T09:00:00+07:00').getTime();

export function HeroClient({
  description,
  startAt,
  endAt,
}: {
  description: string;
  startAt: string;
  endAt: string;
}) {
  const { isEn, isTh } = useLanguage();
  const eventDay = isEventDay();

  // Real-time Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    function calculateTime() {
      const now = new Date().getTime();
      const diff = TARGET_EVENT_DATE - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3D Interactive Poster Tilt & Glare State
  const posterRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovering: false });
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!posterRef.current) return;
    const rect = posterRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY, isHovering: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovering: false });
  };

  // One-Click Calendar Functions
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    'เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9 (MUMT Blood Donation 2026)'
  )}&dates=20260916T020000Z/20260916T070000Z&details=${encodeURIComponent(
    'กิจกรรมบริจาคโลหิต คณะเทคนิคการแพทย์ ม.มหิดล ร่วมกับภาคบริการโลหิตแห่งชาติที่ 4 จ.ราชบุรี สภากาชาดไทย ณ ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา'
  )}&location=${encodeURIComponent('อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา')}`;

  const downloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MUMT Love Unit//Blood Donation 2026//TH',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:mumt-loveunit-2026@mahidol.ac.th',
      'DTSTAMP:20260901T000000Z',
      'DTSTART:20260916T020000Z',
      'DTEND:20260916T070000Z',
      'SUMMARY:เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9 (MUMT Blood Donation 2026)',
      'DESCRIPTION:กิจกรรมบริจาคโลหิต คณะเทคนิคการแพทย์ ม.มหิดล ร่วมกับภาคบริการโลหิตแห่งชาติที่ 4 จ.ราชบุรี สภากาชาดไทย\\nเวลา 09:00 - 14:00 น.',
      'LOCATION:ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'mumt-loveunit-blood-donation-2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCalendarMenu(false);
  };

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
    ctaRegister: isEn ? 'Register to donate blood' : 'ลงทะเบียนบริจาคโลหิตออนไลน์',
    ctaPrepare: isEn ? 'Prepare before donating' : 'ดูการเตรียมตัวก่อนบริจาค',
  };

  return (
    <>
      {/* ============ HERO — full-bleed red field ============ */}
      <section className="hero-field relative overflow-hidden">
        
        {/* Soft Ambient Floating Glow Orbs (GPU-accelerated, zero lag) */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-red-500/25 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-[450px] w-[450px] rounded-full bg-rose-400/20 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-[400px] w-[400px] rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8 lg:pt-12 lg:pb-16">
          
          {/* Top Bar: Event Badge & Live Countdown Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
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

            {/* Live Countdown Mini-Ticker */}
            {!timeLeft.isPast && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-[var(--cream)] border border-white/15 shadow-2xs">
                <Timer className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: '12s' }} />
                <span>
                  {isTh ? 'นับถอยหลังสู่งาน:' : 'Event Countdown:'}
                </span>
                <span className="font-mono font-black text-amber-200">
                  {timeLeft.days} {isTh ? 'วัน' : 'd'} {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            )}
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

              {/* Event Facts & Action Buttons */}
              <div className="space-y-3.5 pt-1 w-full">
                
                {/* Event Facts: 3-column cards with calendar integration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                  <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-3 text-xs text-[var(--cream)] font-bold shadow-2xs">
                    <Calendar className="h-4 w-4 text-[var(--burgundy-300)] shrink-0" />
                    <span className="truncate">{copy.date}</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-3 text-xs text-[var(--cream)] font-bold shadow-2xs">
                    <Clock className="h-4 w-4 text-[var(--burgundy-300)] shrink-0" />
                    <span className="truncate">{copy.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-3 text-xs text-[var(--cream)] font-bold shadow-2xs">
                    <MapPin className="h-4 w-4 text-[var(--burgundy-300)] shrink-0" />
                    <span className="truncate">{copy.venue}</span>
                  </div>
                </div>

                {/* Main Action: Full-width Primary Button */}
                <Link 
                  href="/register" 
                  className="btn-cream !w-full shadow-lg hover:shadow-xl font-display font-black text-sm sm:text-base px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 active:scale-95 transition-all text-center tracking-wide group"
                >
                  <span>{copy.ctaRegister}</span>
                  <ArrowRight className="h-4.5 w-4.5 shrink-0 transform group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Secondary Actions: 3-Button Row including One-Click Calendar Sync */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full relative">
                  <Link 
                    href="/screening" 
                    className="btn-outline-cream !w-full border-amber-300/50 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 font-bold text-xs sm:text-sm px-3 py-2.5 rounded-2xl flex items-center justify-center text-center transition-colors shadow-2xs"
                  >
                    <span className="truncate">{isEn ? 'Self-Screening' : 'ประเมินตนเอง'}</span>
                  </Link>

                  <Link 
                    href="/lookup" 
                    className="btn-outline-cream !w-full border-white/25 bg-white/10 hover:bg-white/20 text-[var(--cream)] font-bold text-xs sm:text-sm px-3 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-center transition-colors shadow-2xs"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-white/80" />
                    <span className="truncate">{isEn ? 'Find Ticket' : 'ค้นหาตั๋ว / QR'}</span>
                  </Link>

                  {/* Calendar Sync Dropdown Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                      className="btn-outline-cream !w-full border-white/25 bg-white/10 hover:bg-white/20 text-[var(--cream)] font-bold text-xs sm:text-sm px-3 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-center transition-colors shadow-2xs cursor-pointer"
                    >
                      <CalendarPlus className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                      <span className="truncate">{isEn ? 'Add to Cal' : 'ลงปฏิทิน'}</span>
                    </button>

                    {showCalendarMenu && (
                      <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-56 rounded-2xl bg-white text-gray-900 p-2 shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <a
                          href={googleCalendarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowCalendarMenu(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-50 text-xs font-bold text-gray-800 transition-colors"
                        >
                          <Calendar className="h-4 w-4 text-red-600 shrink-0" />
                          <span>Google Calendar</span>
                        </a>
                        <button
                          type="button"
                          onClick={downloadIcs}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-xs font-bold text-gray-800 transition-colors text-left cursor-pointer"
                        >
                          <Download className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>Apple / Outlook (.ics)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Official Event Poster with Interactive 3D Tilt & Glare (5 cols) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-center items-center">
              <div 
                ref={posterRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  perspective: '1000px',
                }}
                className="rise-in w-full max-w-xs sm:max-w-sm lg:max-w-[320px] xl:max-w-[350px] relative group"
              >
                <Link 
                  href="/poster" 
                  style={{
                    transform: tilt.isHovering
                      ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
                      : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                    transition: tilt.isHovering ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
                  }}
                  className="block relative aspect-[1/1.414] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/25 hover:border-white/60 transition-all duration-300 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
                >
                  <Image
                    src={isEn ? '/images/poster-en.jpg' : '/images/poster-th.jpg'}
                    alt="MUMT Blood Donation 2026 Official Poster"
                    fill
                    sizes="(min-width: 1024px) 380px, 90vw"
                    className="object-cover"
                    priority
                  />

                  {/* Dynamic Glare Sheen Effect */}
                  {tilt.isHovering && (
                    <div
                      className="pointer-events-none absolute inset-0 z-10 opacity-35 mix-blend-overlay transition-opacity duration-200"
                      style={{
                        background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)`,
                      }}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4 z-20">
                    <span className="text-xs font-bold text-white bg-[var(--burgundy-700)] px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5">
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
