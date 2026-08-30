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
  const { isTh } = useLanguage();

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

          {/* Detailed Campus Transit & Directions Card */}
          <div className="editorial-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#FCE8EC] pb-2">
              <h2 className="text-base font-black text-[var(--burgundy-700)] uppercase tracking-wider">
                {isTh ? 'คู่มือการเดินทางมายังวิทยาเขตศาลายา' : 'Mahidol Salaya Campus Directions'}
              </h2>
            </div>

            {/* Category 1: MU Tram */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-black shrink-0">
                  🚋
                </span>
                <div>
                  <h3 className="text-xs font-black text-emerald-950">
                    {isTh ? 'รถรางสวัสดิการ ม.มหิดล (MU Tram — บริการฟรี)' : 'MU Tram Shuttle (Free Campus Service)'}
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {isTh ? 'ออกทุก 10–15 นาที จอดส่งหน้าอาคารสิริวิทยา' : 'Runs every 10–15 mins, stops at Sirividhaya'}
                  </span>
                </div>
              </div>
              <ul className="text-xs text-emerald-900 space-y-1.5 pl-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-emerald-950">{isTh ? 'สาย 1 (สีเขียว):' : 'Line 1 (Green):'}</strong>{' '}
                    {isTh
                      ? 'หอพักนักศึกษา ➔ ศูนย์การแพทย์กาญจนาภิเษก ➔ สำนักงานอธิการบดี (OP) ➔ อาคารสิริวิทยา (คณะศิลปศาสตร์) ➔ MLC'
                      : 'Dormitories ➔ GJMC ➔ OP Building ➔ Sirividhaya Bldg (Liberal Arts) ➔ MLC'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-blue-950">{isTh ? 'สาย 2 (สีน้ำเงิน):' : 'Line 2 (Blue):'}</strong>{' '}
                    {isTh
                      ? 'ประตู 1 ➔ คณะวิศวกรรมศาสตร์ ➔ อาคารสิริวิทยา ➔ คณะสิ่งแวดล้อม ➔ ประตู 4'
                      : 'Gate 1 ➔ Engineering ➔ Sirividhaya Bldg ➔ Environment ➔ Gate 4'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-orange-950">{isTh ? 'สาย 3 & 4 (สีแดง/ส้ม):' : 'Line 3 & 4 (Red/Orange):'}</strong>{' '}
                    {isTh
                      ? 'เชื่อมต่อประตู 5, คณะพยาบาลศาสตร์ และสถานีรถไฟศาลายา'
                      : 'Connects Gate 5, Nursing Faculty & Salaya Railway Station'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Category 2: Public Buses */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white text-xs font-black shrink-0">
                  <Bus className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-blue-950">
                    {isTh ? 'รถโดยสารประจำทาง ขสมก. & รถตู้' : 'Public Buses & Vans'}
                  </h3>
                  <span className="text-[10px] text-blue-700 font-semibold">
                    {isTh ? 'ลงป้ายหน้า ม.มหิดล ประตู 2 หรือ ประตู 4' : 'Alight at Mahidol Salaya Gate 2 or 4'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-blue-950 font-medium">
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <span className="font-black text-blue-900 block">🚌 สาย 515 (4-61)</span>
                  <span className="text-[10px] text-gray-600">{isTh ? 'อนุสาวรีย์ชัยฯ – ปิ่นเกล้า' : 'Victory Monument – Pinklao'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <span className="font-black text-blue-900 block">🚌 สาย 556</span>
                  <span className="text-[10px] text-gray-600">{isTh ? 'วัดไร่ขิง – กองสลาก – มักกะสัน' : 'Wat Rai Khing – Makkasan'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <span className="font-black text-blue-900 block">🚌 สาย 547 (4-63)</span>
                  <span className="text-[10px] text-gray-600">{isTh ? 'เพชรเกษม – เดอะมอลล์บางแค' : 'Phetkasem – The Mall Bangkae'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <span className="font-black text-blue-900 block">🚌 สาย 124 (4-51)</span>
                  <span className="text-[10px] text-gray-600">{isTh ? 'สนามหลวง – เซ็นทรัลปิ่นเกล้า' : 'Sanam Luang – Pinklao'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <span className="font-black text-blue-900 block">🚌 สาย 84ก (4-46)</span>
                  <span className="text-[10px] text-gray-600">{isTh ? 'วงเวียนใหญ่ – เดอะมอลล์บางแค' : 'Wongwian Yai – Bangkae'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <span className="font-black text-blue-900 block">🚌 สาย 388</span>
                  <span className="text-[10px] text-gray-600">{isTh ? 'ปากเกร็ด – ราชพฤกษ์' : 'Pak Kret – Ratchaphruek'}</span>
                </div>
              </div>
            </div>

            {/* Category 3: Trains & MRT/BTS */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-600 text-white text-xs font-black shrink-0">
                  🚆
                </span>
                <div>
                  <h3 className="text-xs font-black text-purple-950">
                    {isTh ? 'รถไฟฟ้า & รถไฟเชื่อมต่อ' : 'Train & SkyTrain Connectors'}
                  </h3>
                  <span className="text-[10px] text-purple-700 font-semibold">
                    {isTh ? 'เชื่อมต่อ BTS / MRT / SRT รถไฟชานเมือง' : 'BTS, MRT, and SRT commuter rail routes'}
                  </span>
                </div>
              </div>
              <ul className="text-xs text-purple-950 space-y-1.5 pl-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black">{isTh ? 'รถไฟชานเมือง (SRT) / สายสีแดง:' : 'SRT Commuter Train:'}</strong>{' '}
                    {isTh
                      ? 'ลงสถานีรถไฟศาลายา ต่อสองแถวหรือมอเตอร์ไซค์รับจ้างเข้าประตู 4/5 เพียง 5 นาที'
                      : 'Alight at Salaya Station, 5 mins to Gate 4/5 via local transit.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black">{isTh ? 'BTS บางหว้า:' : 'BTS Bang Wa:'}</strong>{' '}
                    {isTh
                      ? 'ลงทางออก 1-2 ต่อรถ Salaya Link หรือรถเมล์สาย 84ก'
                      : 'Exit 1-2, connect to Salaya Link shuttle or Bus 84g.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black">{isTh ? 'MRT หลักสอง / บางขุนนนท์:' : 'MRT Lak Song / Bang Khun Non:'}</strong>{' '}
                    {isTh
                      ? 'ลงสถานีหลักสอง ต่อสาย 84ก / 547 หรือลงบางขุนนนท์ ต่อสาย 515 / 124'
                      : 'Lak Song (connect Bus 84g/547) or Bang Khun Non (connect Bus 515/124).'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Category 4: Private Car & Parking */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-600 text-white text-xs font-black shrink-0">
                  <Car className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-amber-950">
                    {isTh ? 'รถยนต์ส่วนตัว & จุดจอดรถ' : 'Private Vehicle & Parking Areas'}
                  </h3>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    {isTh ? 'จุดจอดรถรองรับผู้เข้าร่วมงาน' : 'Designated visitor parking zones'}
                  </span>
                </div>
              </div>
              <ul className="text-xs text-amber-950 space-y-1.5 pl-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-amber-950">{isTh ? 'ลานจอดรถอาคารสิริวิทยา:' : 'Sirividhaya Lot:'}</strong>{' '}
                    {isTh ? 'รอบอาคารจัดงาน (มีจำนวนจำกัด)' : 'Around event venue (limited slots)'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-amber-950">{isTh ? 'ลานจอดศูนย์การเรียนรู้มหิดล (MLC — แนะนำ):' : 'MLC Parking Lot (Recommended):'}</strong>{' '}
                    {isTh ? 'ลานกว้างขวาง เดินมายังอาคารสิริวิทยาเพียง 200 เมตร หรือนั่ง Tram สาย 1, 2' : 'Spacious parking, 200m walk to Sirividhaya or take Tram Line 1/2'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-amber-950">{isTh ? 'ลานจอดคณะสิ่งแวดล้อมฯ / อาคารจอดรถรวม:' : 'Faculty of Environment / Central Parking:'}</strong>{' '}
                    {isTh ? 'สะดวกและปลอดภัย' : 'Safe and convenient backup lots'}
                  </span>
                </li>
              </ul>
            </div>
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
