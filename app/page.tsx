import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
import { getEventBySlug, getEventContentBlocks } from '@/services/event-service';
import { formatThaiDate, formatTimeRange } from '@/lib/utils/format';

export default async function HomePage() {
  const event = await getEventBySlug('mumt-2026');

  if (!event) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="editorial-card p-8 text-center">
          <h2 className="text-lg font-bold text-red-700">ไม่พบข้อมูลกิจกรรมบริจาคโลหิต</h2>
          <p className="mt-2 text-xs text-editorial-muted">กรุณาตรวจสอบ URL หรือติดต่อผู้ดูแลระบบ</p>
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

  const donorSteps = [
    { num: '01', title: 'REGISTER', desc: 'ลงทะเบียนออนไลน์ เลือกรอบเวลาเดินทาง' },
    { num: '02', title: 'PREPARE', desc: 'นอนหลับ 6 ชม. ดื่มน้ำ 3-4 แก้ว ทานอาหาร' },
    { num: '03', title: 'ARRIVE', desc: 'แสดง QR Pass ที่ห้อง 217-218 สิริวิทยา' },
    { num: '04', title: 'DONATE', desc: 'ตรวจความพร้อมและบริจาคโลหิตกับสภากาชาด' },
    { num: '05', title: 'REST', desc: 'พักผ่อน 15 นาที รับอาหารว่างและของที่ระลึก' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-16">

      {/* UNIT 01: WARM EDITORIAL HERO CAMPAIGN */}
      <section className="border-b border-[#F0C4CC] pb-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Editorial Text & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="unit-tag">UNIT 01 / CAMPAIGN</span>
                <span className="unit-tag-outline">คณะเทคนิคการแพทย์ มหิดล × สภากาชาดไทย</span>
              </div>

              {/* Display Typography Scale */}
              <h1 className="text-3xl font-black text-editorial-ink sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                เติมรักให้เต็ม <span className="text-[#7A1020]">UNIT</span> <br className="hidden sm:block" />
                <span className="text-[#B42336]">ต่อชีวิตด้วยโลหิตคุณ</span>
              </h1>

              <p className="text-sm leading-relaxed text-editorial-muted sm:text-base font-medium max-w-2xl">
                {event.description}
              </p>
            </div>

            {/* Typography-First Event Facts (No Generic Cards) */}
            <div className="grid grid-cols-3 gap-4 border-y border-[#F0C4CC] py-5 my-6">
              
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase block tracking-wider">01. DATE</span>
                <span className="text-lg sm:text-2xl font-black text-[#7A1020] block mt-0.5">16 SEP</span>
                <span className="text-[11px] font-bold text-editorial-ink block">พุธ 16 กันยายน 2569</span>
              </div>

              <div className="border-l border-[#F0C4CC] pl-4">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase block tracking-wider">02. TIME</span>
                <span className="text-lg sm:text-2xl font-black text-[#7A1020] block mt-0.5">08:00—15:00</span>
                <span className="text-[11px] font-bold text-editorial-ink block">เปิดรับตลอดวัน</span>
              </div>

              <div className="border-l border-[#F0C4CC] pl-4">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase block tracking-wider">03. VENUE</span>
                <span className="text-lg sm:text-2xl font-black text-[#7A1020] block mt-0.5">LA 217–218</span>
                <span className="text-[11px] font-bold text-editorial-ink block truncate">{venueName}</span>
              </div>

            </div>

            {/* Editorial Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/register"
                className="editorial-btn-primary py-3.5 px-8 text-sm justify-center"
              >
                <span>ลงทะเบียนบริจาคโลหิตออนไลน์</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/prepare"
                className="editorial-btn-secondary py-3.5 px-6 text-xs justify-center"
              >
                <BookOpen className="h-4 w-4 text-[#7A1020]" />
                <span>ข้อปฏิบัติตัวก่อนบริจาค</span>
              </Link>
            </div>

            <p className="text-[11px] text-editorial-muted font-mono font-bold">
              * การเลือกรอบเวลาเป็นการเลือกช่วงเวลาแนะนำเดินทางมาถึง เพื่อบริหารความหนาแน่น
            </p>

          </div>

          {/* Right Poster Box (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="editorial-card p-3">
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

      </section>

      {/* UNIT 02: DONOR JOURNEY (5 STEPS) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#F0C4CC] pb-3">
          <div>
            <span className="unit-tag mb-1">UNIT 02 / DONOR JOURNEY</span>
            <h2 className="text-xl font-black text-editorial-ink sm:text-2xl">
              ขั้นตอนการเข้าร่วมบริจาคโลหิต
            </h2>
          </div>
        </div>

        {/* 5-Step Sequential Journey Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {donorSteps.map((step) => (
            <div key={step.num} className="editorial-card p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-mono font-black text-[#7A1020] block">{step.num}</span>
                <h3 className="text-sm font-black text-editorial-ink">{step.title}</h3>
              </div>
              <p className="text-xs text-editorial-muted leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* UNIT 03: PREPARATION GUIDE (ALTERNATING EDITORIAL LAYOUT) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#F0C4CC] pb-3">
          <div>
            <span className="unit-tag mb-1">UNIT 03 / PREPARATION</span>
            <h2 className="text-xl font-black text-editorial-ink sm:text-2xl">
              การเตรียมตัวก่อนมาบริจาคโลหิต
            </h2>
          </div>
          <Link href="/prepare" className="text-xs font-bold text-[#7A1020] hover:underline flex items-center gap-1">
            <span>ดูคู่มือทั้งหมด</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-5 editorial-card p-6 space-y-4">
            <h3 className="text-base font-black text-[#7A1020] border-b border-[#FCE8EC] pb-2">
              ข้อควรปฏิบัติสำคัญก่อนบริจาค
            </h3>
            <ul className="space-y-3 text-xs font-bold text-editorial-ink">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                <span>พักผ่อนให้เพียงพอ นอนหลับไม่น้อยกว่า 6 ชั่วโมง</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                <span>ดื่มน้ำเปล่า 3-4 แก้ว ก่อนบริจาคประมาณ 30 นาที</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                <span>ทานอาหารมื้อหลัก หลีกเลี่ยงอาหารไขมันสูง</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                <span>งดเครื่องดื่มแอลกอฮอล์อย่างน้อย 24 ชั่วโมง</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                <span>นำบัตรประชาชนตัวจริงมาแสดงในวันงาน</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/prepare" className="editorial-btn-secondary w-full py-2.5 text-xs justify-center">
                <span>อ่านรายละเอียดเตรียมตัว</span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-7 editorial-card p-3">
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
      </section>

      {/* UNIT 04: VENUE & LOCATION (REVERSED LAYOUT) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#F0C4CC] pb-3">
          <div>
            <span className="unit-tag mb-1">UNIT 04 / LOCATION</span>
            <h2 className="text-xl font-black text-editorial-ink sm:text-2xl">
              สถานที่จัดงานและการเดินทาง
            </h2>
          </div>
          <Link href="/location" className="text-xs font-bold text-[#7A1020] hover:underline flex items-center gap-1">
            <span>ดูแผนที่เดินทาง</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="editorial-card p-3">
            <InfographicSlot
              contentKey="location_infographic"
              title={locationInfographic?.title || 'แผนที่สถานที่จัดงาน (อาคารสิริวิทยา)'}
              description={locationInfographic?.description || undefined}
              imageUrl={(locationInfographic as any)?.imageUrl || (locationInfographic as any)?.image_url}
              altText={(locationInfographic as any)?.altText || (locationInfographic as any)?.alt_text}
              aspectRatio="banner"
            />
          </div>

          <div className="editorial-card p-3">
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
      </section>

    </div>
  );
}
