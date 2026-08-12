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
  ChevronRight
} from 'lucide-react';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
import { getEventBySlug, getEventContentBlocks } from '@/lib/db/store';
import { formatThaiDate, formatTimeRange } from '@/lib/utils/format';

export default async function HomePage() {
  const event = await getEventBySlug('mumt-2026');

  if (!event) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-[#29272A]">ไม่พบข้อมูลกิจกรรมบริจาคโลหิต</h2>
        <p className="mt-2 text-xs text-gray-500">กรุณาตรวจสอบ URL หรือติดต่อผู้ดูแลระบบ</p>
      </div>
    );
  }

  const contentBlocks = await getEventContentBlocks(event.id);

  const heroPoster = contentBlocks.find(b => b.content_key === 'hero_poster');
  const locationInfographic = contentBlocks.find(b => b.content_key === 'location_infographic');
  const transportInfographic = contentBlocks.find(b => b.content_key === 'transportation_infographic');
  const prepInfographic = contentBlocks.find(b => b.content_key === 'preparation_infographic');
  const whatToBringInfographic = contentBlocks.find(b => b.content_key === 'what_to_bring');
  const boothInfographic = contentBlocks.find(b => b.content_key === 'booth_infographic');
  const sponsorBanner = contentBlocks.find(b => b.content_key === 'sponsor_banner');

  const eventDateFormatted = formatThaiDate(event.start_at);
  const eventTimeFormatted = formatTimeRange(event.start_at, event.end_at);

  return (
    <div className="flex flex-col gap-12 pb-16">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#7A1020] via-[#8F1327] to-[#7A1020] px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(#FFF9F9_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#B42336]/40 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-red-900/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-12">
          
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-bold tracking-wide text-amber-200 uppercase">โครงการบริจาคโลหิตครั้งใหญ่ มหิดล ศาลายา</span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              {event.name}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-red-50/90 sm:text-base">
              {event.description}
            </p>

            {/* Dynamic Event Key Meta Cards */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
                <Calendar className="h-6 w-6 text-amber-300 shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-red-200 uppercase">วันที่จัดงาน</span>
                  <p className="text-xs font-extrabold text-white">{eventDateFormatted}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
                <Clock className="h-6 w-6 text-amber-300 shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-red-200 uppercase">เวลาบริการ</span>
                  <p className="text-xs font-extrabold text-white">{eventTimeFormatted}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
                <MapPin className="h-6 w-6 text-amber-300 shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-red-200 uppercase">สถานที่</span>
                  <p className="text-xs font-extrabold text-white line-clamp-1">{event.venue_name}</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-extrabold text-[#7A1020] shadow-xl shadow-black/20 transition-all hover:scale-105 hover:bg-amber-50 active:scale-95"
              >
                <Heart className="h-5 w-5 fill-[#7A1020] text-[#7A1020]" />
                ลงทะเบียนเข้าร่วมบริจาคโลหิต
              </Link>

              <Link
                href="#event-details"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                ดูรายละเอียดกิจกรรม
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-3 text-xs text-red-100/80">
              * การเลือกรอบเวลาเป็นการเลือกช่วงเวลาแนะนำเดินทางมาถึง ไม่ใช่เวลารับบริจาคที่รับประกัน
            </p>
          </div>

          <div className="lg:col-span-5">
            <InfographicSlot
              contentKey="hero_poster"
              title={heroPoster?.title || 'โปสเตอร์ประชาสัมพันธ์โครงการ'}
              description={heroPoster?.description}
              imageUrl={heroPoster?.image_url}
              altText={heroPoster?.alt_text}
              aspectRatio="poster"
              className="shadow-2xl ring-4 ring-white/20"
            />
          </div>

        </div>
      </section>

      {/* EVENT OVERVIEW */}
      <section id="event-details" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-[#FCE8EC] bg-white p-6 shadow-sm sm:p-10">
          
          <div className="flex flex-col items-start justify-between gap-4 border-b border-[#FCE8EC] pb-6 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-bold tracking-wider text-[#B42336] uppercase">Event Overview</span>
              <h2 className="text-2xl font-extrabold text-[#29272A] sm:text-3xl">
                เกี่ยวกับกิจกรรม {event.short_name}
              </h2>
            </div>
            <Link
              href="/register"
              className="flex items-center gap-1.5 text-xs font-bold text-[#7A1020] hover:underline"
            >
              เลือกรอบเวลาเดินทางมาถึง <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            
            <div className="rounded-2xl bg-[#FFF9F9] p-6 border border-[#FCE8EC]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7A1020] text-white">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#29272A]">ใครบ้างที่ร่วมบริจาคได้?</h3>
              <ul className="mt-3 space-y-2 text-xs text-[#29272A]/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>นักศึกษามหาวิทยาลัยมหิดล ทุกชั้นปี</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>อาจารย์และบุคลากรมหาวิทยาลัยมหิดล</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>ประชาชนทั่วไป ผู้มีจิตศรัทธา</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#FFF9F9] p-6 border border-[#FCE8EC]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#B42336] text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#29272A]">สถานที่จัดงาน</h3>
              <p className="mt-2 text-xs text-[#29272A]/80 leading-relaxed">
                {event.venue_detail}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF9F9] p-6 border border-[#FCE8EC]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7A1020] text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#29272A]">ขั้นตอนง่ายๆ ในวันงาน</h3>
              <ol className="mt-3 space-y-2 text-xs text-[#29272A]/80 list-decimal list-inside">
                <li>แสดง QR Code ลงทะเบียนหน้างาน</li>
                <li>คัดกรองสุขภาพและวัดความดันโดยเจ้าหน้าที่สภากาชาดไทย</li>
                <li>บริจาคโลหิตและพักสังเกตอาการ 10-15 นาที</li>
              </ol>
            </div>

          </div>

        </div>
      </section>

      {/* PREPARATION & WHAT TO BRING INFOGRAPHICS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold tracking-wider text-[#B42336] uppercase">Donor Guide</span>
            <h2 className="text-2xl font-extrabold text-[#29272A]">ข้อปฏิบัติและการเตรียมตัว</h2>
          </div>
          <Link href="/prepare" className="text-xs font-bold text-[#7A1020] hover:underline">
            ดูคำแนะนำทั้งหมด →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InfographicSlot
            contentKey="preparation_infographic"
            title={prepInfographic?.title || 'ข้อปฏิบัติตัวก่อนบริจาคโลหิต'}
            description={prepInfographic?.description || 'พักผ่อนให้เพียงพอ 6-8 ชั่วโมง ดื่มน้ำ 3-4 แก้วก่อนบริจาค'}
            imageUrl={prepInfographic?.image_url}
            aspectRatio="banner"
          />

          <InfographicSlot
            contentKey="what_to_bring"
            title={whatToBringInfographic?.title || 'สิ่งที่ต้องเตรียมมาในวันงาน'}
            description={whatToBringInfographic?.description || 'บัตรประชาชน หรือบัตรผู้บริจาคโลหิตสภากาชาดไทย'}
            imageUrl={whatToBringInfographic?.image_url}
            aspectRatio="banner"
          />
        </div>
      </section>

      {/* LOCATION & TRANSPORTATION INFOGRAPHICS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold tracking-wider text-[#B42336] uppercase">Location & Map</span>
            <h2 className="text-2xl font-extrabold text-[#29272A]">สถานที่จัดงานและการเดินทาง</h2>
          </div>
          <Link href="/location" className="text-xs font-bold text-[#7A1020] hover:underline">
            ดูรายละเอียดแผนที่ →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InfographicSlot
            contentKey="location_infographic"
            title={locationInfographic?.title || 'แผนที่สถานที่จัดงาน อาคารสิริวิทยา'}
            description={locationInfographic?.description}
            imageUrl={locationInfographic?.image_url}
            aspectRatio="banner"
          />

          <InfographicSlot
            contentKey="transportation_infographic"
            title={transportInfographic?.title || 'การเดินทางและจุดจอดรถ'}
            description={transportInfographic?.description}
            imageUrl={transportInfographic?.image_url}
            aspectRatio="banner"
          />
        </div>
      </section>

      {/* KNOWLEDGE BOOTH SECTION */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-[#FCE8EC] bg-gradient-to-r from-[#FCE8EC]/60 via-white to-[#FCE8EC]/60 p-6 sm:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#7A1020] px-3 py-1 text-xs font-bold text-white">
                <Sparkles className="h-3.5 w-3.5" />
                กิจกรรมเสริมในวันงาน
              </div>
              <h3 className="mt-3 text-2xl font-extrabold text-[#29272A] sm:text-3xl">
                บูธกิจกรรมให้ความรู้เรื่องหมู่เลือดและเซลล์โลหิต
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[#29272A]/80 sm:text-sm">
                พบกับบูธกิจกรรมความรู้ทางเทคนิคการแพทย์ นิทรรศการให้ความรู้เกี่ยวกับหมู่เลือด 
                และการดูแลสุขภาพหลอดเลือด โดยทีมนักศึกษาคณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล
              </p>
            </div>

            <div className="lg:col-span-5">
              <InfographicSlot
                contentKey="booth_infographic"
                title={boothInfographic?.title || 'นิทรรศการบูธกิจกรรมความรู้'}
                description={boothInfographic?.description}
                imageUrl={boothInfographic?.image_url}
                aspectRatio="square"
              />
            </div>

          </div>
        </div>
      </section>

      {/* SPONSOR BANNER PLACEHOLDER */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <InfographicSlot
          contentKey="sponsor_banner"
          title={sponsorBanner?.title || 'ผู้สนับสนุนกิจกรรม MUMT Blood Donation 2026'}
          description={sponsorBanner?.description}
          imageUrl={sponsorBanner?.image_url}
          aspectRatio="banner"
        />
      </section>

      {/* DISCLAIMER / MEDICAL NON-ELIGIBILITY BANNER */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">หมายเหตุสำคัญ:</span> ระบบนี้เป็นระบบลงทะเบียนและประมาณการเวลาเดินทางล่วงหน้า 
            <span className="font-bold underline"> ไม่ใช่ระบบคัดกรองหรือประเมินคุณสมบัติทางแพทย์</span> 
            การประเมินความพร้อมและคุณสมบัติผู้บริจาคโลหิตจะดำเนินการโดยเจ้าหน้าที่สภากาชาดไทย ณ จุดคัดกรองหน้างานตามมาตรฐานแพทยสภา
          </div>
        </div>
      </section>

    </div>
  );
}
