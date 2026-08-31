'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Bus, 
  Car, 
  MapPin, 
  Train, 
  Bike, 
  Phone, 
  ExternalLink,
  X,
  ZoomIn,
  Navigation,
  Download,
  Clock,
  Building2
} from 'lucide-react';
import { SocialLinks } from '@/components/common/SocialLinks';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LocationClientProps {
  locationInfographic?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    altText?: string;
  } | null;
  transportInfographic?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    altText?: string;
  } | null;
}

const TRAVEL_GUIDE_INFOGRAPHICS = [
  {
    src: '/images/location/travel-route-1.png',
    title: 'วิธีเดินทางมางานจากภายนอกมหาวิทยาลัย (ตอนที่ 1)',
    titleEn: 'Campus Travel Guide from Outside Campus (Part 1)',
    badge: 'ตอนที่ 1',
    desc: 'แผนผังเส้นทางหลัก ประตูทางเข้า และจุดเชื่อมต่อรถโดยสารสู่มหาวิทยาลัยมหิดล ศาลายา',
    descEn: 'Main route overview, entrance gates, and public transit connections to Mahidol Salaya.',
  },
  {
    src: '/images/location/travel-route-2.png',
    title: 'วิธีเดินทางมางานจากภายนอกมหาวิทยาลัย (ตอนที่ 2)',
    titleEn: 'Campus Travel Guide from Outside Campus (Part 2)',
    badge: 'ตอนที่ 2',
    desc: 'สายรถโดยสารประจำทาง ขสมก. & Thai Smile Bus (TSB) และจุดลงรถประตูมหาวิทยาลัย',
    descEn: 'Public bus routes (BMTA & TSB) and designated campus drop-off gates.',
  },
  {
    src: '/images/location/travel-route-3.png',
    title: 'วิธีเดินทางมางานจากภายนอกมหาวิทยาลัย (ตอนที่ 3)',
    titleEn: 'Campus Travel Guide from Outside Campus (Part 3)',
    badge: 'ตอนที่ 3',
    desc: 'รถตู้ปรับอากาศ, รถศาลายาลิงค์ (Salaya Link), รถยนต์ส่วนบุคคล และจุดจอดรถ',
    descEn: 'Passenger vans, Salaya Link shuttle, private vehicle routes, and parking zones.',
  },
];

type TransitTab = 'BUS' | 'TRAM' | 'SHUTTLE' | 'TRAIN' | 'CAR';

export function LocationClient({
  locationInfographic,
  transportInfographic: _transportInfographic,
}: LocationClientProps) {
  const { isTh } = useLanguage();
  const [activeModalImg, setActiveModalImg] = useState<{ src: string; title: string } | null>(null);
  const [activeTransitTab, setActiveTransitTab] = useState<TransitTab>('BUS');

  const mainMapImage = locationInfographic?.imageUrl || '/images/location/salaya-campus-map.jpg';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-red-950/20 border border-white/20">
            <Building2 className="h-3.5 w-3.5 text-white" />
            <span>{isTh ? 'อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา' : 'Sirividhaya Building, Mahidol University Salaya'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
            {isTh ? 'สถานที่จัดงานและการเดินทาง' : 'Venue & Campus Directions'}
          </h1>
          <p className="text-[15px] text-[var(--muted)] font-medium leading-relaxed">
            {isTh 
              ? 'ข้อมูลจุดจัดงาน แผนผังเส้นทางรถรางสวัสดิการ (MUVE Tram) และคู่มือการเดินทางจากทุกจุดเชื่อมต่อในกรุงเทพฯ และปริมณฑล' 
              : 'Complete venue guide, campus tram network (MUVE), and comprehensive transit connections across Bangkok.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://www.google.com/maps/search/?api=1&query=อาคารสิริวิทยา+คณะศิลปศาสตร์+มหาวิทยาลัยมหิดล+ศาลายา"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 text-xs shadow-md transition-all cursor-pointer"
          >
            <MapPin className="h-4 w-4" />
            <span>{isTh ? 'นำทางใน Google Maps' : 'Open Google Maps'}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Official Campus Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Quick Venue Facts & Key Support (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Key Event Venue Card */}
          <div className="editorial-card p-6 space-y-5">
            <div className="space-y-1 border-b border-[var(--line)] pb-3">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                LOCATION DETAILS
              </span>
              <h2 className="text-xl font-black text-[var(--ink)]">
                {isTh ? 'จุดจัดงานหลัก' : 'Main Event Venue'}
              </h2>
            </div>

            <div className="space-y-4 text-xs font-medium text-[var(--ink)]">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--rose-100)]/60 border border-[var(--line)]">
                <MapPin className="h-5 w-5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-sm text-[var(--burgundy-700)]">
                    {isTh ? 'ห้องประชุม 217 (ชั้น 2)' : 'Meeting Room 217 (2nd Floor)'}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    {isTh
                      ? 'อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา'
                      : 'Sirividhaya Building, Faculty of Liberal Arts, Mahidol University Salaya'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <Clock className="h-5 w-5 text-gray-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-sm text-gray-900">
                    {isTh ? 'เวลาเปิดรับบริจาค' : 'Operating Schedule'}
                  </h3>
                  <p className="text-xs text-[var(--burgundy-700)] font-bold mt-0.5">
                    {isTh ? 'วันพุธที่ 16 กันยายน 2569 (09:00 - 14:00 น.)' : 'Wednesday, September 16, 2026 (09:00 – 14:00)'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--line)] space-y-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                  <Phone className="h-3.5 w-3.5 text-[var(--burgundy-700)]" />
                  <span>{isTh ? 'ฝ่ายประสานงานเส้นทางและดูแลผู้บริจาค:' : 'Direct Helpline & Assistance:'}</span>
                </div>
                <div className="pl-5 space-y-1 text-gray-600">
                  <p>• {isTh ? 'เปา' : 'Pao'}: <a href="tel:0969866245" className="text-[var(--burgundy-700)] font-bold underline">09-6986-6245</a></p>
                  <p>• {isTh ? 'แตงโม' : 'Tangmo'}: <a href="tel:0656274319" className="text-[var(--burgundy-700)] font-bold underline">06-5627-4319</a></p>
                </div>
                <div className="pt-2">
                  <SocialLinks />
                </div>
              </div>
            </div>
          </div>

          {/* Tram Stop Fast Reference */}
          <div className="editorial-card p-5 space-y-3 bg-gradient-to-br from-blue-50/70 to-emerald-50/70 border border-blue-200">
            <div className="flex items-center gap-2">
              <Train className="h-4 w-4 text-blue-700" />
              <h3 className="text-xs font-black text-blue-950 uppercase tracking-wide">
                {isTh ? 'ป้ายรถรางไฟฟ้าสวัสดิการที่ใกล้ที่สุด' : 'Nearest MU Tram Stops'}
              </h3>
            </div>
            <div className="space-y-2 text-xs font-medium">
              <div className="p-2.5 rounded-lg bg-white/90 border border-blue-200 shadow-2xs">
                <span className="font-black text-blue-900 block text-[11px]">
                  {isTh ? 'สายสีน้ำเงิน ➔ ลงป้าย B9 (ด้านหน้าอาคารสิริวิทยา — แนะนำ)' : 'Blue Line ➔ Alight at Stop B9 (In front of Sirividhaya)'}
                </span>
                <span className="text-[10px] text-gray-600 block mt-0.5">
                  {isTh ? 'จอดตรงบันไดทางเข้าอาคารสิริวิทยา คณะศิลปศาสตร์' : 'Direct stop at main entrance of Sirividhaya Building'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 border border-emerald-200 shadow-2xs">
                <span className="font-black text-emerald-900 block text-[11px]">
                  {isTh ? 'สายสีเขียว ➔ ลงป้าย G12 (ตรงข้ามอาคารสิริวิทยา)' : 'Green Line ➔ Alight at Stop G12 (Opposite Sirividhaya)'}
                </span>
                <span className="text-[10px] text-gray-600 block mt-0.5">
                  {isTh ? 'ข้ามถนนหน้าอาคารศิลปศาสตร์เพียง 20 เมตร' : 'Cross the walkway 20m into the building'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Official Campus Map Infographic (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="editorial-card p-4 sm:p-6 space-y-4 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--burgundy-700)] bg-[var(--burgundy-50)] px-2.5 py-0.5 rounded-full border border-[var(--burgundy-200)]">
                  {isTh ? 'แผนผังทางการ' : 'Official Venue Map'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[var(--ink)] mt-1.5">
                  {isTh ? 'แผนที่สถานที่จัดงานและเส้นทางในวิทยาเขตศาลายา' : 'Sirividhaya Venue & Salaya Campus Tram Map'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalImg({ src: mainMapImage, title: isTh ? 'แผนที่สถานที่จัดงาน อาคารสิริวิทยา คณะศิลปศาสตร์' : 'Campus Venue Map' })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--rose-100)] hover:bg-[var(--rose-200)] text-[var(--burgundy-700)] px-3 py-1.5 text-xs font-extrabold border border-[var(--line)] transition-all cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span>{isTh ? 'ขยายแผนที่' : 'Enlarge Map'}</span>
                </button>
                <a
                  href={mainMapImage}
                  download="mumt-loveunit-salaya-campus-map.jpg"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] hover:from-[#C51D2C] hover:via-[#911426] hover:to-[#6E0F1D] text-white px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 border border-white/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isTh ? 'ดาวน์โหลดภาพ' : 'Download'}</span>
                </a>
              </div>
            </div>

            {/* Map Container */}
            <div 
              onClick={() => setActiveModalImg({ src: mainMapImage, title: isTh ? 'แผนที่สถานที่จัดงาน อาคารสิริวิทยา คณะศิลปศาสตร์' : 'Campus Venue Map' })}
              className="group relative aspect-[3/4] sm:aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-gray-50 cursor-zoom-in shadow-xs"
            >
              <Image
                src={mainMapImage}
                alt={isTh ? 'แผนที่สถานที่จัดงานและเส้นทางรถรางในวิทยาเขตศาลายา' : 'Salaya Campus Tram & Venue Map'}
                fill
                priority
                className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center pointer-events-none">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-[var(--ink)] text-xs font-extrabold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                  <ZoomIn className="h-4 w-4 text-[var(--burgundy-700)]" />
                  <span>{isTh ? 'คลิกเพื่อดูภาพความละเอียดสูง' : 'Click to zoom in high resolution'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold text-gray-700">
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-950">
                <span className="block text-[10px] text-blue-700 uppercase font-black">{isTh ? 'สายสีน้ำเงิน' : 'Blue Line'}</span>
                <span>ป้าย B9 อาคารสิริวิทยา</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="block text-[10px] text-emerald-700 uppercase font-black">{isTh ? 'สายสีเขียว' : 'Green Line'}</span>
                <span>ป้าย G12 ตรงข้ามอาคาร</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-950">
                <span className="block text-[10px] text-amber-700 uppercase font-black">{isTh ? 'จุดจอดรถยนต์' : 'Parking Lot'}</span>
                <span>ลานจอด MLC / สิริวิทยา</span>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-950">
                <span className="block text-[10px] text-purple-700 uppercase font-black">{isTh ? 'ประตูทางเข้าหลัก' : 'Campus Gate'}</span>
                <span>ประตู 2 / 3 / 4 (สาย 4)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION: 3-PART VISUAL TRAVEL GUIDES FROM OUTSIDE CAMPUS */}
      <section className="space-y-6 pt-4 border-t border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--burgundy-600)]" />
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
              {isTh ? 'ชุดภาพแนะนำวิธีเดินทาง (จากภายนอกมหาวิทยาลัย)' : 'Step-by-Step Travel Infographics'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)] font-medium">
            {isTh 
              ? 'สรุปเส้นทางหลัก จุดขึ้นรถเมล์ รถตู้ และรถรับส่ง เพื่อความสะดวกในการวางแผนเดินทาง' 
              : 'Detailed infographics for public buses, passenger vans, and Salaya Link routes.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRAVEL_GUIDE_INFOGRAPHICS.map((item, idx) => (
            <article 
              key={idx}
              className="editorial-card p-4 flex flex-col justify-between space-y-3 group hover:border-[var(--burgundy-300)] transition-all"
            >
              <div className="space-y-3">
                <div 
                  onClick={() => setActiveModalImg({ src: item.src, title: isTh ? item.title : item.titleEn })}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-50 border border-[var(--line)] cursor-zoom-in block"
                >
                  <Image
                    src={item.src}
                    alt={isTh ? item.title : item.titleEn}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-md border border-white/20">
                    {item.badge}
                  </span>
                  <span className="absolute top-2.5 right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--burgundy-700)] shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4" />
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-[var(--ink)] leading-snug group-hover:text-[var(--burgundy-700)] transition-colors">
                    {isTh ? item.title : item.titleEn}
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
                    {isTh ? item.desc : item.descEn}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModalImg({ src: item.src, title: isTh ? item.title : item.titleEn })}
                  className="text-xs font-bold text-[var(--burgundy-700)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span>{isTh ? 'ดูภาพขยาย' : 'Zoom In'}</span>
                </button>
                <a
                  href={item.src}
                  download={`mumt-travel-guide-part-${idx + 1}.png`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--rose-100)] hover:bg-[var(--rose-200)] text-[var(--burgundy-700)] px-3 py-1.5 text-xs font-extrabold border border-[var(--line)] transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isTh ? 'ดาวน์โหลด' : 'Download'}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION: EDITORIAL TRANSIT DIRECTORY (NON-AI CARD STRUCTURE) */}
      <section className="space-y-6 pt-6 border-t border-[var(--line)]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--burgundy-600)]" />
              <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
                {isTh ? 'คู่มือเส้นทางและระบบขนส่งมวลชนอย่างละเอียด' : 'Comprehensive Transit & Route Directory'}
              </h2>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)] font-medium">
              {isTh 
                ? 'รวบรวมข้อมูลสายรถประจำทาง รถไฟฟ้า และจุดจอดรถที่อัปเดตล่าสุดสำหรับการเดินทางมายัง ม.มหิดล ศาลายา' 
                : 'Verified public transit routes, connecting trains, shuttles, and visitor parking guidelines.'}
            </p>
          </div>

          {/* Transit Mode Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 bg-gray-100/80 rounded-xl border border-gray-200">
            {[
              { id: 'BUS', label: isTh ? 'รถโดยสารประจำทาง' : 'Public Buses', icon: Bus },
              { id: 'TRAM', label: isTh ? 'รถราง ม.มหิดล' : 'MU Tram', icon: Train },
              { id: 'SHUTTLE', label: isTh ? 'Salaya Link & รถตู้' : 'Shuttle & Vans', icon: Navigation },
              { id: 'TRAIN', label: isTh ? 'รถไฟฟ้า & รถไฟ' : 'Trains / SRT', icon: Train },
              { id: 'CAR', label: isTh ? 'รถยนต์ & ที่จอด' : 'Driving & Parking', icon: Car },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTransitTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTransitTab(tab.id as TransitTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white text-[var(--burgundy-700)] shadow-xs' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Public Buses */}
        {activeTransitTab === 'BUS' && (
          <div className="editorial-card p-6 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h3 className="text-base font-black text-[var(--ink)]">
                  {isTh ? 'รถโดยสารประจำทาง ขสมก. & Thai Smile Bus (TSB)' : 'BMTA & Thai Smile Bus Routes'}
                </h3>
                <p className="text-xs text-[var(--muted)] font-medium mt-0.5">
                  {isTh 
                    ? 'ลงที่ป้ายหน้า ม.มหิดล ศาลายา (ประตู 2 / ประตู 4 ถ.พุทธมณฑลสาย 4 หรือ ประตู 1 ถ.บรมราชชนนี)' 
                    : 'Alight at Mahidol Salaya Gate 2/4 (Phutthamonthon Sai 4) or Gate 1 (Borommaratchachonnani Rd)'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-black text-gray-700">
                    <th className="py-3 px-4 rounded-l-lg">สายรถเมล์</th>
                    <th className="py-3 px-4">เส้นทางเดินรถ</th>
                    <th className="py-3 px-4">จุดเชื่อมต่อสำคัญ</th>
                    <th className="py-3 px-4 rounded-r-lg">ผู้ให้บริการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-black text-[var(--burgundy-700)] text-sm">สาย 515 (4-61)</td>
                    <td className="py-3 px-4">อนุสาวรีย์ชัยสมรภูมิ ➔ รพ.ราชวิถี ➔ เซ็นทรัลปิ่นเกล้า ➔ สายใต้ใหม่ ➔ ม.มหิดล ศาลายา ➔ เซ็นทรัลศาลายา</td>
                    <td className="py-3 px-4 text-gray-600">BTS อนุสาวรีย์ชัยฯ, MRT บางขุนนนท์</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">ขสมก. / TSB</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-black text-[var(--burgundy-700)] text-sm">สาย 547 (4-63)</td>
                    <td className="py-3 px-4">ถนนตก ➔ สวนลุมพินี ➔ สีลม ➔ สาทร ➔ วงเวียนใหญ่ ➔ เพชรเกษม ➔ เดอะมอลล์บางแค ➔ ม.มหิดล ศาลายา</td>
                    <td className="py-3 px-4 text-gray-600">BTS ศาลาแดง / บางหว้า, MRT สีลม / หลักสอง</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">Thai Smile Bus</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-black text-[var(--burgundy-700)] text-sm">สาย 124 (4-51)</td>
                    <td className="py-3 px-4">สนามหลวง ➔ สะพานสมเด็จพระปิ่นเกล้า ➔ สายใต้ใหม่ ➔ ม.มหิดล ศาลายา</td>
                    <td className="py-3 px-4 text-gray-600">สนามหลวง, ท่าพระจันทร์, MRT บางขุนนนท์</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">Thai Smile Bus</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-black text-[var(--burgundy-700)] text-sm">สาย 163 (4-55)</td>
                    <td className="py-3 px-4">BTS สนามกีฬาแห่งชาติ ➔ พระราม 1 ➔ เจริญนคร ➔ บางหว้า ➔ ถนนเพชรเกษม ➔ ม.มหิดล ศาลายา</td>
                    <td className="py-3 px-4 text-gray-600">BTS สนามกีฬาฯ / บางหว้า, MRT ท่าพระ</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">Thai Smile Bus</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-black text-[var(--burgundy-700)] text-sm">สาย 556 (4-64)</td>
                    <td className="py-3 px-4">อนุสาวรีย์ประชาธิปไตย ➔ กองสลาก ➔ สายใต้ใหม่ ➔ ม.มหิดล ศาลายา ➔ วัดไร่ขิง</td>
                    <td className="py-3 px-4 text-gray-600">ถนนราชดำเนินกลาง, ปิ่นเกล้า</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">ขสมก.</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-black text-[var(--burgundy-700)] text-sm">สาย 4-70E (ทางด่วน)</td>
                    <td className="py-3 px-4">BTS หมอชิต / MRT สวนจตุจักร ➔ ขึ้นทางด่วนศรีรัช ➔ ม.มหิดล ศาลายา (รวดเร็ว)</td>
                    <td className="py-3 px-4 text-gray-600">BTS หมอชิต, MRT สวนจตุจักร</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">Thai Smile Bus</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-black text-[var(--burgundy-700)] text-sm">สาย 4-67</td>
                    <td className="py-3 px-4">กระทรวงพาณิชย์ ➔ สะพานพระนั่งเกล้า ➔ ท่าน้ำนนท์ ➔ กาญจนาภิเษก ➔ ม.มหิดล ศาลายา</td>
                    <td className="py-3 px-4 text-gray-600">MRT สายสีม่วง (สะพานพระนั่งเกล้า)</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">Thai Smile Bus</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-black text-[var(--burgundy-700)] text-sm">สาย 84ก (4-46)</td>
                    <td className="py-3 px-4">วงเวียนใหญ่ ➔ ท่าพระ ➔ เพชรเกษม ➔ เดอะมอลล์บางแค ➔ พุทธมณฑลสาย 4 ➔ ม.มหิดล ศาลายา</td>
                    <td className="py-3 px-4 text-gray-600">BTS วงเวียนใหญ่, MRT ท่าพระ / หลักสอง</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">ขสมก.</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: MU Tram (MUVE) */}
        {activeTransitTab === 'TRAM' && (
          <div className="editorial-card p-6 space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[var(--line)] pb-3">
              <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                MUVE Tram Network
              </span>
              <h3 className="text-base font-black text-[var(--ink)] mt-1.5">
                {isTh ? 'รถรางไฟฟ้าสวัสดิการ มหาวิทยาลัยมหิดล (บริการฟรี)' : 'Mahidol Salaya Electric Tram System (Complimentary)'}
              </h3>
              <p className="text-xs text-[var(--muted)] font-medium mt-0.5">
                {isTh ? 'ให้บริการฟรีวันจันทร์ - ศุกร์ ครอบคลุมทุกคณะ อาคารเรียน และหอพัก' : 'Free campus shuttle running weekdays across all faculties, dorms, and learning centers.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-600 shrink-0" />
                  <h4 className="font-black text-sm text-blue-950">
                    {isTh ? 'สายสีน้ำเงิน (ผ่านหน้าอาคารสิริวิทยา — แนะนำ)' : 'Blue Line (Direct to Sirividhaya Bldg)'}
                  </h4>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed pl-5">
                  <strong>จุดลง:</strong> ป้าย B9 (ด้านหน้าอาคารสิริวิทยา คณะศิลปศาสตร์)<br />
                  <strong>แนวเส้นทาง:</strong> สถานีรถรางบ้านมหิดล ➔ คณะสัตวแพทย์ ➔ คณะศิลปศาสตร์ (ป้าย B9 — ลงที่นี่) ➔ คณะกายภาพบำบัด ➔ คณะเทคนิคการแพทย์ ➔ สำนักงานอธิการบดี (OP)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-600 shrink-0" />
                  <h4 className="font-black text-sm text-emerald-950">
                    {isTh ? 'สายสีเขียว (ผ่านฝั่งตรงข้ามอาคารสิริวิทยา)' : 'Green Line (Opposite Sirividhaya Bldg)'}
                  </h4>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed pl-5">
                  <strong>จุดลง:</strong> ป้าย G12 (ตรงข้ามอาคารสิริวิทยา คณะศิลปศาสตร์)<br />
                  <strong>แนวเส้นทาง:</strong> บ้านมหิดล ➔ สวนเจ้าฟ้า ➔ คณะวิทยาศาสตร์ ➔ ลานมหิดล ➔ MUIC ➔ OP ➔ คณะวิศวกรรมศาสตร์ ➔ หอสมุดกลาง ➔ ศูนย์การเรียนรู้มหิดล (MLC) ➔ ป้าย G12
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Bike className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Anywheel Bike-Sharing: บริการจักรยานสาธารณะสีเขียว ปลดล็อกผ่านแอป Anywheel มีสถานีจอดรอบอาคารสิริวิทยาและทั่ววิทยาเขต</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Salaya Link & Vans */}
        {activeTransitTab === 'SHUTTLE' && (
          <div className="editorial-card p-6 space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[var(--line)] pb-3">
              <h3 className="text-base font-black text-[var(--ink)]">
                {isTh ? 'รถศาลายาลิงค์ (Salaya Link) และรถตู้ปรับอากาศร่วมบริการ' : 'Salaya Link Shuttle & Air-Conditioned Passenger Vans'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Salaya Link */}
              <div className="p-5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Salaya Link · ค่าโดยสาร 30 บาท
                </span>
                <h4 className="text-sm font-black text-purple-950">
                  {isTh ? 'รถศาลายาลิงค์ (ไมโครบัสปรับอากาศ เชื่อมต่อ BTS บางหว้า)' : 'Salaya Link (Direct Microbus to BTS Bang Wa)'}
                </h4>
                <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                  <p>
                    <strong>• ขาไป:</strong> จาก BTS สถานีบางหว้า (ทางออก 1-2) เดินต่อ 20 เมตร Salaya Link จอดรอรับที่ป้ายรถเมล์ ➔ วิ่งตรงเข้า ม.มหิดล ศาลายา
                  </p>
                  <p>
                    <strong>• ขากลับ:</strong> ขึ้นรถได้ที่อู่จอด Salaya Link วิทยาลัยดุริยางคศิลป์ ม.มหิดล ➔ ตรงสู่ BTS บางหว้า
                  </p>
                  <p className="text-[11px] text-purple-900 font-bold">
                    * หมายเหตุ: ค่าโดยสาร 30 บาท ควรเตรียมเหรียญหรือธนบัตรให้พอดีเนื่องจากหยอดตู้บนรถ
                  </p>
                </div>
              </div>

              {/* Vans */}
              <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Passenger Vans
                </span>
                <h4 className="text-sm font-black text-amber-950">
                  {isTh ? 'รถตู้ปรับอากาศร่วมบริการ' : 'Passenger Van Terminals'}
                </h4>
                <div className="space-y-2.5 text-xs text-gray-700 leading-relaxed">
                  <p>
                    <strong>• สายอนุสาวรีย์ชัยสมรภูมิ – ม.มหิดล ศาลายา:</strong><br />
                    จุดขึ้นรถอยู่บริเวณเชิงสะพานลอยหน้า รพ.ราชวิถี (เกาะราชวิถี) วิ่งทางด่วน/บรมราชชนนี ส่งถึงหน้า ม.มหิดล ประตู 2/4
                  </p>
                  <p>
                    <strong>• สายเซ็นทรัลปิ่นเกล้า – ม.มหิดล ศาลายา:</strong><br />
                    จุดขึ้นรถอยู่ข้างห้างเซ็นทรัลปิ่นเกล้า วิ่งตรงสู่ ม.มหิดล ศาลายา
                  </p>
                  <p>
                    <strong>• วินรถตู้อื่นๆ:</strong> เดอะมอลล์บางแค และ ฟิวเจอร์พาร์ครังสิต
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Trains & SRT */}
        {activeTransitTab === 'TRAIN' && (
          <div className="editorial-card p-6 space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[var(--line)] pb-3">
              <h3 className="text-base font-black text-[var(--ink)]">
                {isTh ? 'การเดินทางด้วยรถไฟชานเมือง (SRT) และรถไฟฟ้าสายสีต่างๆ' : 'Railway Connections (SRT, BTS, MRT)'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <h4 className="font-black text-sm text-[var(--burgundy-700)]">
                  {isTh ? 'รถไฟสายใต้ / รถไฟชานเมือง (SRT)' : 'State Railway of Thailand (SRT)'}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  ลงที่ <strong>สถานีรถไฟศาลายา (Salaya Station)</strong> ต่อรถสองแถว มอเตอร์ไซค์รับจ้าง หรือรถรางสายสีแดง เข้าสู่ประตู 5 มหาวิทยาลัยมหิดล เพียง 5 นาที
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <h4 className="font-black text-sm text-blue-900">
                  {isTh ? 'MRT สายสีน้ำเงิน' : 'MRT Blue Line'}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  • <strong>ลงสถานีหลักสอง (เดอะมอลล์บางแค):</strong> ต่อรถเมล์สาย 547, 84ก<br />
                  • <strong>ลงสถานีบางขุนนนท์:</strong> ต่อรถเมล์สาย 515, 124 เข้าสู่ศาลายา
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <h4 className="font-black text-sm text-emerald-900">
                  {isTh ? 'BTS สายสีลม / สุขุมวิท' : 'BTS Skytrain'}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  • <strong>สถานีบางหว้า:</strong> ต่อรถศาลายาลิงค์ (Salaya Link) หรือ รถเมล์สาย 547<br />
                  • <strong>สถานีอนุสาวรีย์ชัยฯ:</strong> ต่อรถเมล์สาย 515 หรือรถตู้หน้า รพ.ราชวิถี
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Driving & Parking */}
        {activeTransitTab === 'CAR' && (
          <div className="editorial-card p-6 space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[var(--line)] pb-3">
              <h3 className="text-base font-black text-[var(--ink)]">
                {isTh ? 'การเดินทางด้วยรถยนต์ส่วนบุคคลและจุดจอดรถภายในวิทยาเขต' : 'Driving Routes & Visitor Parking Directory'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <h4 className="font-black text-sm text-gray-900">
                  {isTh ? 'ประตูทางเข้าวิทยาเขตหลัก' : 'Campus Entrance Gates'}
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-700 leading-relaxed">
                  <li>• <strong>ประตู 2 & ประตู 4 (ถ.พุทธมณฑลสาย 4):</strong> ทางเข้าหลักด้านหน้า สะดวกในการมุ่งตรงสู่อาคารสิริวิทยา</li>
                  <li>• <strong>ประตู 3 (ถ.พุทธมณฑลสาย 4):</strong> ทางเข้าตรงสู่สำนักงานอธิการบดี</li>
                  <li>• <strong>ประตู 1 (ถ.บรมราชชนนี):</strong> ทางเข้าฝั่งมหิดลสิทธาคาร</li>
                  <li>• <strong>ประตู 5 & 6 (ถ.ศาลายาไทยาวาส - นครชัยศรี):</strong> ทางเข้าฝั่งโรงพยาบาลสัตว์และสถานีรถไฟ</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <h4 className="font-black text-sm text-amber-950">
                  {isTh ? 'จุดจอดรถยนต์สำหรับผู้เข้าร่วมกิจกรรม' : 'Recommended Parking Lots'}
                </h4>
                <ul className="space-y-2 text-xs text-gray-700 leading-relaxed">
                  <li>
                    <strong>1. ลานจอดและอาคารจอดรถ ศูนย์การเรียนรู้มหิดล (MLC — แนะนำ):</strong><br />
                    พื้นที่กว้างขวางที่สุด มีหลังคา สะดวก เดินมายังอาคารสิริวิทยาเพียง 200 เมตร
                  </li>
                  <li>
                    <strong>2. ลานจอดรอบอาคารสิริวิทยา คณะศิลปศาสตร์:</strong><br />
                    ติดกับอาคารจัดงาน (มีช่องจอดจำนวนจำกัด)
                  </li>
                  <li>
                    <strong>3. ลานจอดมหิดลสิทธาคาร & คณะเทคนิคการแพทย์:</strong><br />
                    ลานจอดสำรองขนาดใหญ่
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Image Modal Preview */}
      {activeModalImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModalImg(null)}
        >
          <div 
            className="relative max-h-[92vh] max-w-4xl w-full overflow-hidden rounded-2xl bg-white p-3 shadow-2xl space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pt-1 border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{activeModalImg.title}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={activeModalImg.src}
                  download="mumt-image.png"
                  className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>ดาวน์โหลด</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalImg(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="relative h-[78vh] w-full bg-gray-50 rounded-xl overflow-hidden">
              <Image
                src={activeModalImg.src}
                alt={activeModalImg.title}
                fill
                className="object-contain"
                sizes="95vw"
                priority
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
