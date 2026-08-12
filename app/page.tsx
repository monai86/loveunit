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
  ShieldCheck,
  Gift,
  Phone,
  Mail
} from 'lucide-react';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
import { getEventBySlug, getEventContentBlocks } from '@/services/event-service';
import { formatThaiDate, formatTimeRange } from '@/lib/utils/format';

export default async function HomePage() {
  const event = await getEventBySlug('mumt-2026');

  if (!event) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="bloom-card p-8 text-center">
          <h2 className="text-lg font-bold text-red-700">ไม่พบข้อมูลกิจกรรมบริจาคโลหิต</h2>
          <p className="mt-2 text-xs text-gray-600">กรุณาตรวจสอบ URL หรือติดต่อผู้ดูแลระบบ</p>
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">

      {/* SPRING BLOOM HERO SECTION */}
      <section className="bloom-hero-bg p-6 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Background Decorative Petal Tints */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#FCE8EC] blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#F9D5DC] blur-3xl opacity-40 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Text & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 border border-[#F9D5DC] shadow-xs">
                  <img src="/images/logo.png" alt="MUMT Logo" className="h-full w-auto object-contain" />
                </div>
                <span className="bloom-badge py-1 px-3 text-xs font-extrabold">
                  <Heart className="h-3.5 w-3.5 fill-[#7A1020]" />
                  โครงการบริจาคโลหิต ครั้งที่ 9
                </span>
              </div>

              <h1 className="text-2xl font-black text-[#1F1A1C] sm:text-4xl lg:text-5xl leading-tight tracking-tight">
                {event.name}
              </h1>

              <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                {event.description}
              </p>
            </div>

            {/* Event Key Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <div className="bloom-card p-3.5 flex items-center gap-3 bg-white/90">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCE8EC] text-[#7A1020]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block uppercase">วันที่จัดงาน</span>
                  <span className="font-extrabold text-xs text-[#1F1A1C]">{eventDateFormatted}</span>
                </div>
              </div>

              <div className="bloom-card p-3.5 flex items-center gap-3 bg-white/90">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCE8EC] text-[#7A1020]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block uppercase">เวลาบริการ</span>
                  <span className="font-extrabold text-xs text-[#1F1A1C]">{eventTimeFormatted}</span>
                </div>
              </div>

              <div className="bloom-card p-3.5 flex items-center gap-3 bg-white/90">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FCE8EC] text-[#7A1020]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block uppercase">สถานที่</span>
                  <span className="font-extrabold text-xs text-[#1F1A1C] truncate block">{venueName}</span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/register"
                className="bloom-btn-primary py-3.5 px-7 text-sm justify-center shadow-lg"
              >
                <Heart className="h-5 w-5 fill-white text-white" />
                <span>ลงทะเบียนบริจาคโลหิตออนไลน์</span>
              </Link>

              <Link
                href="/prepare"
                className="bloom-btn-secondary py-3.5 px-6 text-xs justify-center"
              >
                <BookOpen className="h-4.5 w-4.5 text-[#7A1020]" />
                <span>ดูข้อปฏิบัติตัวก่อนบริจาค</span>
              </Link>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              * การเลือกรอบเวลาเป็นการเลือกช่วงเวลาแนะนำเดินทางมาถึง ไม่ใช่ระบบคิวถาวร
            </p>

          </div>

          {/* Right Hero Poster Box */}
          <div className="lg:col-span-5">
            <div className="bloom-card p-3 bg-white shadow-md">
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

      {/* SECTION 01: PREPARATION GUIDE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="bloom-badge mb-1">
              <BookOpen className="h-3.5 w-3.5" />
              Donor Guide
            </span>
            <h2 className="text-xl font-extrabold text-[#1F1A1C] sm:text-2xl">
              การเตรียมตัวก่อนมาบริจาคโลหิต
            </h2>
          </div>
          <Link href="/prepare" className="text-xs font-bold text-[#7A1020] hover:underline flex items-center gap-1">
            <span>ดูคู่มือทั้งหมด</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          <div className="md:col-span-5 bloom-card p-6 bg-white space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#7A1020] border-b border-[#FCE8EC] pb-2">
                ข้อควรปฏิบัติสำคัญก่อนบริจาค
              </h3>
              <ul className="mt-3 space-y-2.5 text-xs font-medium text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                  <span>พักผ่อนให้เพียงพอ นอนหลับไม่น้อยกว่า 6 ชั่วโมง</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                  <span>ดื่มน้ำเปล่า 3-4 แก้ว ก่อนบริจาคประมาณ 30 นาที</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                  <span>ทานอาหารมื้อหลัก หลีกเลี่ยงอาหารไขมันสูง</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                  <span>งดเครื่องดื่มแอลกอฮอล์อย่างน้อย 24 ชั่วโมง</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#7A1020] shrink-0 mt-0.5" />
                  <span>นำบัตรประชาชนตัวจริงมาแสดงในวันงาน</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link href="/prepare" className="bloom-btn-secondary w-full py-2.5 text-xs justify-center">
                <span>อ่านข้อปฏิบัติโดยละเอียด</span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-7 bloom-card p-3 bg-white">
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

      {/* SECTION 02: LOCATION & MAP */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="bloom-badge mb-1">
              <MapPin className="h-3.5 w-3.5" />
              Venue & Map
            </span>
            <h2 className="text-xl font-extrabold text-[#1F1A1C] sm:text-2xl">
              สถานที่จัดงานและการเดินทาง
            </h2>
          </div>
          <Link href="/location" className="text-xs font-bold text-[#7A1020] hover:underline flex items-center gap-1">
            <span>ดูแผนที่เดินทาง</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bloom-card p-3 bg-white">
            <InfographicSlot
              contentKey="location_infographic"
              title={locationInfographic?.title || 'แผนที่สถานที่จัดงาน (อาคารสิริวิทยา)'}
              description={locationInfographic?.description || undefined}
              imageUrl={(locationInfographic as any)?.imageUrl || (locationInfographic as any)?.image_url}
              altText={(locationInfographic as any)?.altText || (locationInfographic as any)?.alt_text}
              aspectRatio="banner"
            />
          </div>

          <div className="bloom-card p-3 bg-white">
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
