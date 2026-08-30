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

            {/* Category 1: Official MU Electric Tram */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white text-xs font-black shrink-0">
                    🚋
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-blue-950">
                      {isTh ? 'รถรางไฟฟ้าสวัสดิการ ม.มหิดล (MU Tram — บริการฟรี)' : 'MU Electric Tram (Free Campus Shuttle)'}
                    </h3>
                    <span className="text-[10px] text-blue-700 font-semibold">
                      {isTh ? 'ให้บริการ 4 สายรอบวิทยาเขต (กองกายภาพและสิ่งแวดล้อม)' : '4 Campus routes provided by Physical & Environment Div.'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200">
                  {isTh ? 'ฟรี ไม่มีค่าใช้จ่าย' : 'Free of Charge'}
                </span>
              </div>
              <ul className="text-xs text-blue-950 space-y-2 pl-1 font-medium">
                <li className="p-2.5 rounded-xl bg-white/90 border border-blue-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
                    <strong className="font-black text-blue-950 text-[11px]">
                      {isTh ? '🔵 สายสีน้ำเงิน (ผ่านหน้าอาคารสิริวิทยา คณะศิลปศาสตร์โดยตรง — แนะนำ):' : '🔵 Blue Line (Direct to Sirividhaya Bldg / Liberal Arts — Recommended):'}
                    </strong>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed pl-4">
                    {isTh
                      ? 'บ้านมหิดล ➔ คณะสัตวแพทยศาสตร์ ➔ สถาบันแห่งชาติเพื่อการพัฒนาเด็กฯ ➔ หอพัก ➔ คณะศิลปศาสตร์ (อาคารสิริวิทยา — ลงป้ายนี้) ➔ คณะกายภาพบำบัด ➔ รร.พยาบาลรามาธิบดี ➔ คณะเทคนิคการแพทย์ ➔ สถาบันวิจัยประชากรฯ ➔ สำนักงานอธิการบดี (OP)'
                      : 'Baan Mahidol ➔ Veterinary ➔ Child & Family Dev. ➔ Dormitories ➔ Sirividhaya Bldg (Liberal Arts — Stop Here) ➔ Physical Therapy ➔ Ramathibodi Nursing ➔ Medical Tech (MUMT) ➔ OP Building'}
                  </p>
                </li>
                <li className="p-2.5 rounded-xl bg-white/90 border border-emerald-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 shrink-0" />
                    <strong className="font-black text-emerald-950 text-[11px]">
                      {isTh ? '🟢 สายสีเขียว:' : '🟢 Green Line:'}
                    </strong>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed pl-4">
                    {isTh
                      ? 'บ้านมหิดล ➔ สวนเจ้าฟ้า ➔ คณะวิทยาศาสตร์ ➔ ลานมหิดล ➔ วิทยาลัยนานาชาติ (MUIC) ➔ OP ➔ คณะวิศวกรรมศาสตร์ ➔ คณะ ICT ➔ หอสมุด ➔ คณะสิ่งแวดล้อมฯ ➔ สถาบันโภชนาการ ➔ ศูนย์กีฬา'
                      : 'Baan Mahidol ➔ Chao Fa Garden ➔ Science ➔ Mahidol Plaza ➔ MUIC ➔ OP ➔ Engineering ➔ ICT ➔ Central Library ➔ Environment ➔ Sports Complex'}
                  </p>
                </li>
                <li className="text-[11px] text-gray-600 pl-2">
                  <span className="font-bold text-gray-800">• {isTh ? '🔴 สายสีแดง & 🟡 สายสีเหลือง:' : '🔴 Red & 🟡 Yellow Lines:'}</span>{' '}
                  {isTh ? 'สายเชื่อมต่อรอบนอก ประตู 5, วิทยาลัยดุริยางคศิลป์ และพื้นที่หอพัก' : 'Outer ring routes connecting Gate 5, College of Music, and dorms.'}
                </li>
                <li className="text-[11px] text-emerald-800 pl-2 font-bold">
                  🚲 <strong>Anywheel:</strong> {isTh ? 'บริการจักรยานสาธารณะสีเขียว ปลดล็อกผ่านแอป Anywheel มีจุดจอดทั่วทั้งวิทยาเขตและหน้าอาคารสิริวิทยา' : 'Green bike-sharing service via Anywheel app with parking stations campus-wide.'}
                </li>
              </ul>
            </div>

            {/* Category 2: Public Buses & Thai Smile Bus */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/90 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-600 text-white text-xs font-black shrink-0">
                  <Bus className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-rose-950">
                    {isTh ? 'รถโดยสารประจำทาง ขสมก. & Thai Smile Bus (TSB)' : 'Public Buses & Thai Smile Bus'}
                  </h3>
                  <span className="text-[10px] text-rose-700 font-semibold">
                    {isTh ? 'ลงป้ายหน้า ม.มหิดล ประตู 2 หรือ ประตู 4 (ถนนบรมราชชนนี / ถนนพุทธมณฑลสาย 4)' : 'Alight at Mahidol Salaya Gate 2 or 4 (Borommaratchachonnani / Phutthamonthon 4)'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-800 font-medium">
                <div className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                  <span className="font-black text-rose-950 block">🚌 สาย 515 (4-61) [TSB / ขสมก.]</span>
                  <span className="text-[10px] text-gray-600 leading-tight block mt-0.5">
                    {isTh ? 'อนุสาวรีย์ชัยสมรภูมิ – ราชวิถี – เซ็นทรัลปิ่นเกล้า – สายใต้ใหม่ – ม.มหิดล ศาลายา' : 'Victory Monument – Ratchawithi – Pinklao – Southern Bus – Mahidol'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                  <span className="font-black text-rose-950 block">🚌 สาย 547 (4-63) [Thai Smile Bus]</span>
                  <span className="text-[10px] text-gray-600 leading-tight block mt-0.5">
                    {isTh ? 'สวนลุมพินี – สีลม – สาทร – เพชรเกษม – เดอะมอลล์บางแค – ศาลายา' : 'Lumphini – Silom – Sathon – Phetkasem – The Mall Bangkae – Salaya'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                  <span className="font-black text-rose-950 block">🚌 สาย 124 (4-51) [Thai Smile Bus]</span>
                  <span className="text-[10px] text-gray-600 leading-tight block mt-0.5">
                    {isTh ? 'สนามหลวง – สะพานสมเด็จพระปิ่นเกล้า – ม.มหิดล ศาลายา' : 'Sanam Luang – Pinklao Bridge – Mahidol Salaya'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                  <span className="font-black text-rose-950 block">🚌 สาย 556</span>
                  <span className="text-[10px] text-gray-600 leading-tight block mt-0.5">
                    {isTh ? 'แอร์พอร์ตลิงก์มักกะสัน – กองสลาก – ม.มหิดล ศาลายา – วัดไร่ขิง' : 'ARL Makkasan – Democracy Monument – Mahidol – Wat Rai Khing'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                  <span className="font-black text-rose-950 block">🚌 สาย 84ก (4-46)</span>
                  <span className="text-[10px] text-gray-600 leading-tight block mt-0.5">
                    {isTh ? 'วงเวียนใหญ่ – ท่าพระ – เพชรเกษม – เดอะมอลล์บางแค – ม.มหิดล ศาลายา' : 'Wongwian Yai – Tha Phra – Bangkae – Mahidol Salaya'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                  <span className="font-black text-rose-950 block">🚌 สาย Y70E [ทางด่วน] / สาย 388</span>
                  <span className="text-[10px] text-gray-600 leading-tight block mt-0.5">
                    {isTh ? 'BTS หมอชิต / MRT สวนจตุจักร (ทางด่วน) และ สาย 388 ปากเกร็ด – ศาลายา' : 'BTS Mo Chit / MRT Chatuchak (Expressway) & Bus 388 Pak Kret'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 pl-1">
                🚐 <strong>รถตู้ร่วมบริการ:</strong> {isTh ? 'อนุสาวรีย์ชัยสมรภูมิ (หน้า รพ.ราชวิถี), เซ็นทรัลปิ่นเกล้า, ฟิวเจอร์พาร์ครังสิต, เดอะมอลล์บางแค' : 'Vans from Victory Monument, Central Pinklao, Future Park Rangsit, The Mall Bangkae.'}
              </p>
            </div>

            {/* Category 3: Salaya Link & Train Connectors */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/90 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-600 text-white text-xs font-black shrink-0">
                  🚆
                </span>
                <div>
                  <h3 className="text-xs font-black text-purple-950">
                    {isTh ? 'รถศาลายาลิงค์ (Salaya Link) & รถไฟฟ้าเชื่อมต่อ' : 'Salaya Link Shuttle & Electric Trains'}
                  </h3>
                  <span className="text-[10px] text-purple-700 font-semibold">
                    {isTh ? 'เชื่อมต่อ BTS บางหว้า, MRT สายสีน้ำเงิน และรถไฟสายสีแดง' : 'Connecting BTS Bang Wa, MRT Blue Line, and SRT Red Line'}
                  </span>
                </div>
              </div>
              <ul className="text-xs text-purple-950 space-y-2 pl-1 font-medium">
                <li className="p-2.5 rounded-xl bg-white/90 border border-purple-200/80 shadow-2xs">
                  <strong className="font-black text-purple-950 block text-[11px] mb-0.5">
                    🚐 {isTh ? 'รถศาลายาลิงค์ (Salaya Link — ไมโครบัสตรงสู่ BTS):' : 'Salaya Link (Direct Microbus to BTS):'}
                  </strong>
                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    {isTh
                      ? 'วิ่งระหว่าง BTS สถานีบางหว้า (ทางออก 1-2) ➔ ม.มหิดล ศาลายา (วิทยาลัยดุริยางคศิลป์) ค่าโดยสาร 30 บาท (ควรเตรียมเงินสดให้พอดีเนื่องจากหยอดตู้บนรถ)'
                      : 'Non-stop between BTS Bang Wa (Exit 1-2) and Mahidol Salaya (College of Music). Fare 30 THB.'}
                  </p>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-gray-950">{isTh ? 'รถไฟชานเมือง (SRT) / รถไฟสายใต้:' : 'SRT Commuter Train:'}</strong>{' '}
                    {isTh
                      ? 'ลงที่ สถานีรถไฟศาลายา (Salaya Station) ต่อรถสองแถว มอเตอร์ไซค์รับจ้าง หรือรถรางสายสีแดง เข้าสู่มหาวิทยาลัยเพียง 5 นาที'
                      : 'Alight at Salaya Railway Station, connect via 5-min local songthaew or motorbike taxi to Gate 4/5.'}
                  </span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-gray-950">{isTh ? 'MRT สายสีน้ำเงิน:' : 'MRT Blue Line:'}</strong>{' '}
                    {isTh
                      ? 'ลงสถานีหลักสอง (เดอะมอลล์บางแค) ต่อรถเมล์สาย 84ก / 547 หรือ ลงสถานีบางขุนนนท์ ต่อรถเมล์สาย 515 / 124'
                      : 'Lak Song Station (connect Bus 84g/547) or Bang Khun Non Station (connect Bus 515/124).'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Category 4: Private Car & Parking Areas */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-600 text-white text-xs font-black shrink-0">
                  <Car className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-amber-950">
                    {isTh ? 'รถยนต์ส่วนตัว & จุดจอดรถภายในวิทยาเขต' : 'Private Vehicle & Visitor Parking'}
                  </h3>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    {isTh ? 'จุดจอดรถยนต์สำหรับผู้เข้าร่วมกิจกรรม' : 'Designated parking lots for visitors and donors'}
                  </span>
                </div>
              </div>
              <ul className="text-xs text-amber-950 space-y-2 pl-1 font-medium">
                <li className="p-2.5 rounded-xl bg-white/90 border border-amber-200/80 shadow-2xs">
                  <strong className="font-black text-amber-950 block text-[11px]">
                    📍 {isTh ? 'จุดจอดที่ 1: ลานจอดและอาคารจอดรถ ศูนย์การเรียนรู้มหิดล (MLC — แนะนำ):' : 'Lot 1: Mahidol Learning Center (MLC Parking — Recommended):'}
                  </strong>
                  <p className="text-[11px] text-gray-700 leading-relaxed mt-0.5">
                    {isTh
                      ? 'พื้นที่จอดรถกว้างขวางและสะดวกที่สุด เดินมายังอาคารสิริวิทยาเพียง 200 เมตร หรือนั่งรถรางสายสีน้ำเงิน / สีเขียว'
                      : 'Most spacious parking area. Walk 200m to Sirividhaya Bldg or take MU Tram (Blue/Green Line).'}
                  </p>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-gray-950">{isTh ? 'จุดจอดที่ 2: ลานจอดรอบอาคารสิริวิทยา คณะศิลปศาสตร์:' : 'Lot 2: Sirividhaya Building Grounds:'}</strong>{' '}
                    {isTh ? 'อยู่ติดอาคารจัดงาน (มีช่องจอดจำนวนจำกัด)' : 'Right next to venue (limited parking spots)'}
                  </span>
                </li>
                <li className="flex items-start gap-2 text-[11px] text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-black text-gray-950">{isTh ? 'จุดจอดที่ 3: ลานจอดคณะสิ่งแวดล้อมฯ และอาคารจอดรถรวม:' : 'Lot 3: Environment Faculty & Central Lots:'}</strong>{' '}
                    {isTh ? 'ลานจอดสำรอง สะดวกและปลอดภัย' : 'Safe and convenient backup visitor parking'}
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
