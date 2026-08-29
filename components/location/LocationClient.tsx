'use client';

import React from 'react';
import Link from 'next/link';
import { Bus, Car, ArrowRight, MapPin } from 'lucide-react';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
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

export function LocationClient({
  locationInfographic,
  transportInfographic,
}: LocationClientProps) {
  const { isTh, isEn } = useLanguage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      
      {/* Header */}
      <div className="max-w-2xl pb-6 border-b border-[var(--line)]">
        <h1 className="text-3xl font-black text-[var(--ink)] sm:text-4xl">
          {isTh ? 'สถานที่จัดงานและการเดินทาง' : 'Venue & Directions'}
        </h1>
        <p className="mt-2 text-[15px] text-[var(--muted)] font-medium leading-relaxed">
          {isTh 
            ? 'อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา' 
            : 'Sirividhaya Building, Faculty of Liberal Arts, Mahidol University Salaya'}
        </p>
      </div>

      {/* Main Location Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Venue Details (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          
          <div className="editorial-card p-6 space-y-4">
            <h2 className="text-base font-black text-[var(--burgundy-700)] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
              {isTh ? 'จุดจัดงานหลัก' : 'Event Venue Details'}
            </h2>
            <div className="space-y-2 text-xs font-bold text-editorial-ink">
              <p className="text-sm font-black text-[var(--burgundy-700)]">
                {isTh ? 'ห้องประชุม 217' : 'Meeting Room 217'}
              </p>
              <p className="leading-relaxed text-editorial-muted font-medium">
                {isTh
                  ? 'ชั้น 2 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา'
                  : '2nd Floor, Sirividhaya Building, Faculty of Liberal Arts, Mahidol University Salaya'}
              </p>
              <p className="pt-2 text-sm font-bold text-[var(--burgundy-700)]">
                {isTh ? 'วันพุธที่ 16 กันยายน 2569 (09:00 - 14:00 น.)' : 'Wednesday, September 16, 2026 (09:00 – 14:00)'}
              </p>
              <div className="pt-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=อาคารสิริวิทยา+คณะศิลปศาสตร์+มหาวิทยาลัยมหิดล+ศาลายา"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{isTh ? '🗺️ เปิดนำทางใน Google Maps' : '🗺️ Open in Google Maps'}</span>
                </a>
              </div>

              <div className="pt-2 border-t border-[var(--rose-100)] text-[11px] font-bold text-[var(--muted)] space-y-2">
                <p>{isTh ? '📞 ติดต่อสอบถามเส้นทางในวันงาน:' : '📞 Direction Support on Event Day:'}</p>
                <div className="space-y-0.5">
                  <p>• {isTh ? 'เปา' : 'Pao'}: <a href="tel:0969866245" className="text-[var(--burgundy-700)] underline">09-6986-6245</a></p>
                  <p>• {isTh ? 'แตงโม' : 'Tangmo'}: <a href="tel:0656274319" className="text-[var(--burgundy-700)] underline">06-5627-4319</a></p>
                </div>
                <div className="pt-1">
                  <SocialLinks />
                </div>
              </div>
            </div>
          </div>

          <div className="editorial-card p-6 space-y-4">
            <h2 className="text-base font-black text-[var(--burgundy-700)] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
              {isTh ? 'การเดินทางมายังวิทยาเขตศาลายา' : 'Transit & Parking'}
            </h2>
            <ul className="space-y-3 text-xs font-bold text-editorial-ink">
              <li className="flex items-start gap-2.5">
                <Bus className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>
                  {isTh
                    ? 'รถ Tram สวัสดิการ ม.มหิดล: สาย 1, สาย 2 ลงหน้าอาคารสิริวิทยา'
                    : 'Mahidol University Tram: Line 1 or 2 to Sirividhaya Building'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Car className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>
                  {isTh
                    ? 'รถยนต์ส่วนตัว: จอด ณ ลานจอดรถอาคารสิริวิทยา หรือลานจอดรถศูนย์เรียนรู้ (MLC)'
                    : 'Private Car: Sirividhaya Parking Lot or Mahidol Learning Center (MLC) Lot'}
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <Link href="/register" className="editorial-btn-primary py-3.5 px-8 text-xs w-full justify-center">
              <span>{isTh ? 'ลงทะเบียนบริจาคโลหิตออนไลน์' : 'Register Donor Slot Online'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {/* Right Infographic Maps (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="editorial-card p-3">
            <InfographicSlot
              contentKey="location_infographic"
              title={locationInfographic?.title || (isTh ? 'แผนที่สถานที่จัดงาน (อาคารสิริวิทยา)' : 'Venue Map (Sirividhaya Building)')}
              description={locationInfographic?.description || undefined}
              imageUrl={locationInfographic?.imageUrl}
              altText={locationInfographic?.altText}
              aspectRatio="banner"
            />
          </div>

          <div className="editorial-card p-3">
            <InfographicSlot
              contentKey="transportation_infographic"
              title={transportInfographic?.title || (isTh ? 'การเดินทางและจุดจอดรถ' : 'Campus Directions & Parking')}
              description={transportInfographic?.description || undefined}
              imageUrl={transportInfographic?.imageUrl}
              altText={transportInfographic?.altText}
              aspectRatio="banner"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
