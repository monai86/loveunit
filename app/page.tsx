import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Gift, 
  Users, 
  ShieldAlert,
  ChevronRight,
  Monitor,
  Folder,
  FileText,
  HelpCircle,
  HardDrive
} from 'lucide-react';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
import { getEventBySlug, getEventContentBlocks } from '@/services/event-service';
import { formatThaiDate, formatTimeRange } from '@/lib/utils/format';

export default async function HomePage() {
  const event = await getEventBySlug('mumt-2026');

  if (!event) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="win95-window p-6 text-center">
          <div className="win95-titlebar mb-4">
            <span>Error 404 — Event Not Found</span>
            <div className="flex gap-1">
              <span className="win95-control-btn">X</span>
            </div>
          </div>
          <h2 className="text-base font-bold text-red-700">ไม่พบข้อมูลกิจกรรมบริจาคโลหิต</h2>
          <p className="mt-2 text-xs text-gray-700">กรุณาตรวจสอบ URL หรือติดต่อผู้ดูแลระบบ</p>
        </div>
      </div>
    );
  }

  const contentBlocks = await getEventContentBlocks(event.id);

  const heroPoster = contentBlocks.find(b => (b as any).contentKey === 'hero_poster' || (b as any).content_key === 'hero_poster');
  const locationInfographic = contentBlocks.find(b => (b as any).contentKey === 'location_infographic' || (b as any).content_key === 'location_infographic');
  const transportInfographic = contentBlocks.find(b => (b as any).contentKey === 'transportation_infographic' || (b as any).content_key === 'transportation_infographic');
  const prepInfographic = contentBlocks.find(b => (b as any).contentKey === 'preparation_infographic' || (b as any).content_key === 'preparation_infographic');

  const startAt = (event as any).startAt || (event as any).start_at;
  const endAt = (event as any).endAt || (event as any).end_at;
  const venueName = (event as any).venueName || (event as any).venue_name;

  const eventDateFormatted = formatThaiDate(startAt);
  const eventTimeFormatted = formatTimeRange(startAt, endAt);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">

      {/* WIN95 DESKTOP ENVIRONMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* DESKTOP ICONS SHORTCUTS COLUMN */}
        <div className="lg:col-span-2 hidden sm:grid grid-cols-2 lg:grid-cols-1 gap-4 select-none mb-4 lg:mb-0">
          
          <Link href="/register" className="group flex flex-col items-center p-2 text-center rounded hover:bg-white/10">
            <div className="win95-sunken p-2 bg-white group-hover:scale-105 transition-transform">
              <Calendar className="h-8 w-8 text-[#7A1020]" />
            </div>
            <span className="mt-1 text-xs font-bold text-white shadow-text bg-black/40 px-1 py-0.5 rounded">
              ลงทะเบียน.exe
            </span>
          </Link>

          <Link href="/prepare" className="group flex flex-col items-center p-2 text-center rounded hover:bg-white/10">
            <div className="win95-sunken p-2 bg-white group-hover:scale-105 transition-transform">
              <BookOpen className="h-8 w-8 text-[#7A1020]" />
            </div>
            <span className="mt-1 text-xs font-bold text-white shadow-text bg-black/40 px-1 py-0.5 rounded">
              คู่มือผู้บริจาค.doc
            </span>
          </Link>

          <Link href="/location" className="group flex flex-col items-center p-2 text-center rounded hover:bg-white/10">
            <div className="win95-sunken p-2 bg-white group-hover:scale-105 transition-transform">
              <MapPin className="h-8 w-8 text-[#7A1020]" />
            </div>
            <span className="mt-1 text-xs font-bold text-white shadow-text bg-black/40 px-1 py-0.5 rounded">
              แผนที่วันงาน.bmp
            </span>
          </Link>

          <Link href="/staff/login" className="group flex flex-col items-center p-2 text-center rounded hover:bg-white/10">
            <div className="win95-sunken p-2 bg-white group-hover:scale-105 transition-transform">
              <HardDrive className="h-8 w-8 text-amber-700" />
            </div>
            <span className="mt-1 text-xs font-bold text-white shadow-text bg-black/40 px-1 py-0.5 rounded">
              StaffPortal.sys
            </span>
          </Link>
        </div>

        {/* MAIN APPLICATION WINDOW */}
        <div className="lg:col-span-10">
          <div className="win95-window">
            
            {/* Title Bar */}
            <div className="win95-titlebar win95-titlebar-burgundy">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 fill-white text-white" />
                <span className="font-extrabold text-xs sm:text-sm text-white truncate">
                  MUMT Blood Donation 2026 — [เติมรักให้เต็ม Unit ครั้งที่ 9]
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="win95-control-btn">_</span>
                <span className="win95-control-btn">▢</span>
                <span className="win95-control-btn text-red-900">X</span>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-4 sm:p-6 bg-[#C0C0C0]">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left Text & Actions */}
                <div className="lg:col-span-7 space-y-4">
                  
                  <div className="win95-sunken p-4 bg-white">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="win95-sunken p-1 bg-white inline-block">
                        <img src="/images/logo.png" alt="MUMT LOVE UNIT Logo" className="h-12 w-auto object-contain" />
                      </div>
                      <span className="win95-raised px-2 py-0.5 text-xs font-bold bg-[#7A1020] text-white">
                        โครงการบริจาคโลหิต มหิดล ศาลายา
                      </span>
                    </div>

                    <h1 className="text-xl font-black text-black sm:text-2xl lg:text-3xl leading-tight">
                      {event.name}
                    </h1>

                    <p className="mt-2 text-xs leading-relaxed text-gray-800 sm:text-sm">
                      {event.description}
                    </p>
                  </div>

                  {/* Dynamic Event Key Meta Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    
                    <div className="win95-sunken p-2.5 bg-white flex items-center gap-2.5">
                      <Calendar className="h-5 w-5 text-[#7A1020] shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 block uppercase">วันที่จัดงาน</span>
                        <span className="font-extrabold text-black">{eventDateFormatted}</span>
                      </div>
                    </div>

                    <div className="win95-sunken p-2.5 bg-white flex items-center gap-2.5">
                      <Clock className="h-5 w-5 text-[#7A1020] shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 block uppercase">เวลาบริการ</span>
                        <span className="font-extrabold text-black">{eventTimeFormatted}</span>
                      </div>
                    </div>

                    <div className="win95-sunken p-2.5 bg-white flex items-center gap-2.5">
                      <MapPin className="h-5 w-5 text-[#7A1020] shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 block uppercase">สถานที่</span>
                        <span className="font-extrabold text-black truncate block">{venueName}</span>
                      </div>
                    </div>

                  </div>

                  {/* Win95 Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                      href="/register"
                      className="win95-btn win95-btn-primary py-3 px-6 text-sm justify-center"
                    >
                      <Heart className="h-5 w-5 fill-white text-white" />
                      <span>ลงทะเบียนเข้าร่วมบริจาคโลหิต</span>
                    </Link>

                    <Link
                      href="/prepare"
                      className="win95-btn py-3 px-5 text-xs justify-center"
                    >
                      <BookOpen className="h-4 w-4 text-[#7A1020]" />
                      <span>ดูข้อปฏิบัติตัวก่อนบริจาค</span>
                    </Link>
                  </div>

                  <div className="win95-tooltip text-[11px]">
                    * การเลือกรอบเวลาเป็นการเลือกช่วงเวลาแนะนำเดินทางมาถึง เพื่อบริหารการสม่ำเสมอของคิว
                  </div>

                </div>

                {/* Right Hero Poster Box */}
                <div className="lg:col-span-5">
                  <div className="win95-sunken p-2 bg-white">
                    <InfographicSlot
                      contentKey="hero_poster"
                      title={heroPoster?.title || 'โปสเตอร์ประชาสัมพันธ์โครงการ'}
                      description={heroPoster?.description || undefined}
                      imageUrl={(heroPoster as any)?.imageUrl || (heroPoster as any)?.image_url}
                      altText={(heroPoster as any)?.altText || (heroPoster as any)?.alt_text}
                      aspectRatio="poster"
                    />
                  </div>
                </div>

              </div>

              {/* SECTIONS GRID */}
              <div className="mt-8 space-y-6">
                
                {/* Preparation Guide Card */}
                <div className="win95-raised p-4 bg-[#C0C0C0]">
                  <div className="win95-titlebar mb-3">
                    <span>SECTION 01: การเตรียมตัวก่อนมาบริจาคโลหิต</span>
                    <span>[WinHelp 95]</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="win95-sunken p-3 bg-white space-y-2 text-xs">
                      <h3 className="font-extrabold text-[#7A1020] text-sm border-b pb-1">
                        ข้อควรปฏิบัติสำคัญ
                      </h3>
                      <ul className="space-y-1.5 list-disc pl-4 text-gray-800">
                        <li>พักผ่อนให้เพียงพอ นอนหลับไม่น้อยกว่า 6 ชั่วโมง</li>
                        <li>ดื่มน้ำเปล่า 3-4 แก้ว ก่อนบริจาคประมาณ 30 นาที</li>
                        <li>ทานอาหารมื้อหลัก หลีกเลี่ยงอาหารไขมันสูง</li>
                        <li>งดเครื่องดื่มแอลกอฮอล์อย่างน้อย 24 ชั่วโมง</li>
                        <li>นำบัตรประชาชนตัวจริงมาแสดงในวันงาน</li>
                      </ul>
                    </div>

                    <div className="win95-sunken p-2 bg-white">
                      <InfographicSlot
                        contentKey="preparation_infographic"
                        title={prepInfographic?.title || 'การเตรียมตัวก่อนบริจาคโลหิต'}
                        description={prepInfographic?.description || undefined}
                        imageUrl={(prepInfographic as any)?.imageUrl || (prepInfographic as any)?.image_url}
                        altText={(prepInfographic as any)?.altText || (prepInfographic as any)?.alt_text}
                        aspectRatio="banner"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Transport Card */}
                <div className="win95-raised p-4 bg-[#C0C0C0]">
                  <div className="win95-titlebar mb-3">
                    <span>SECTION 02: แผนที่และการเดินทาง</span>
                    <span>[MapViewer 95]</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="win95-sunken p-2 bg-white">
                      <InfographicSlot
                        contentKey="location_infographic"
                        title={locationInfographic?.title || 'แผนที่สถานที่จัดงาน'}
                        description={locationInfographic?.description || undefined}
                        imageUrl={(locationInfographic as any)?.imageUrl || (locationInfographic as any)?.image_url}
                        altText={(locationInfographic as any)?.altText || (locationInfographic as any)?.alt_text}
                        aspectRatio="banner"
                      />
                    </div>

                    <div className="win95-sunken p-2 bg-white">
                      <InfographicSlot
                        contentKey="transportation_infographic"
                        title={transportInfographic?.title || 'การเดินทางและจุดจอดรถ'}
                        description={transportInfographic?.description || undefined}
                        imageUrl={(transportInfographic as any)?.imageUrl || (transportInfographic as any)?.image_url}
                        altText={(transportInfographic as any)?.altText || (transportInfographic as any)?.alt_text}
                        aspectRatio="banner"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Statusbar */}
              <div className="win95-statusbar">
                <span>MUMT Blood Donation System</span>
                <span>|</span>
                <span>Venue: Sirividhya Building (Room 217-218)</span>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
