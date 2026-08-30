'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  XCircle,
  UserRound,
  ArrowRight,
  GlassWater,
  Utensils,
  Moon,
  Wine,
  Cigarette,
  Scale,
  ShieldCheck,
  Microscope,
  Sparkles,
  Gift,
  Heart,
  MapPin,
  Clock
} from 'lucide-react';
import { SocialLinks } from '@/components/common/SocialLinks';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HomeSectionsClient() {
  const { isTh } = useLanguage();

  const donorSteps = isTh
    ? [
        { num: '01', title: 'ประเมินสุขภาพ', desc: 'ตรวจเช็กความพร้อมผ่านระบบออนไลน์' },
        { num: '02', title: 'ลงทะเบียนจองรอบ', desc: 'เลือกช่วงเวลาระหว่าง 09.00 - 14.00 น.' },
        { num: '03', title: 'เตรียมร่างกาย', desc: 'นอนหลับ 6 ชม. & ดื่มน้ำ 500 มล.' },
        { num: '04', title: 'บริจาคโลหิต', desc: 'ใช้เวลาประมาณ 10-15 นาที ณ ห้อง 217' },
        { num: '05', title: 'รับของที่ระลึก & ของว่าง', desc: 'รับของที่ระลึกพิเศษ และของว่างบำรุงสุขภาพ' },
      ]
    : [
        { num: '01', title: 'Self-Screening', desc: 'Check eligibility via online assessment' },
        { num: '02', title: 'Select Time Slot', desc: 'Choose arrival time between 09:00 - 14:00' },
        { num: '03', title: 'Prepare Body', desc: 'Sleep 6+ hrs & drink 500 mL water' },
        { num: '04', title: 'Donate Blood', desc: 'Takes approx. 10-15 mins at Room 217' },
        { num: '05', title: 'Souvenir & Snacks', desc: 'Receive limited edition gift & refreshments' },
      ];

  const dos = isTh
    ? [
        { icon: GlassWater, text: 'ดื่มน้ำเปล่า 3-4 แก้ว (500 มล.) ก่อนบริจาค 20-30 นาที' },
        { icon: Utensils, text: 'รับประทานอาหารมื้อหลักก่อนมาบริจาค (หลีกเลี่ยงของมัน)' },
        { icon: Moon, text: 'นอนหลับพักผ่อนให้เพียงพอ อย่างน้อย 5-6 ชั่วโมง' },
      ]
    : [
        { icon: GlassWater, text: 'Drink 3-4 glasses of water (500 mL) 20-30 mins prior' },
        { icon: Utensils, text: 'Eat a light regular meal (avoid greasy/fatty food)' },
        { icon: Moon, text: 'Get at least 5-6 hours of restful continuous sleep' },
      ];

  const donts = isTh
    ? [
        { icon: Wine, text: 'งดเครื่องดื่มแอลกอฮอล์ อย่างน้อย 24 ชั่วโมง' },
        { icon: Cigarette, text: 'งดสูบบุหรี่ ก่อนและหลังบริจาคอย่างน้อย 1 ชั่วโมง' },
        { icon: XCircle, text: 'งดอาหารไขมันสูง เช่น ข้าวขาหมู แกงกะทิ ขนมหวาน' },
      ]
    : [
        { icon: Wine, text: 'Avoid alcohol beverages for at least 24 hours' },
        { icon: Cigarette, text: 'Avoid smoking 1 hour before and after donation' },
        { icon: XCircle, text: 'Avoid rich fatty foods (fried dishes, coconut milk)' },
      ];

  const requirements = isTh
    ? [
        { icon: UserRound, text: 'อายุระหว่าง 17 - 70 ปีบริบูรณ์ (ครั้งแรกไม่เกิน 60 ปี)' },
        { icon: Scale, text: 'น้ำหนักตัวตั้งแต่ 45 กิโลกรัม ขึ้นไป' },
        { icon: ShieldCheck, text: 'ความเข้มข้นโลหิต หญิง ≥ 12.5 / ชาย ≥ 13.0 g/dL' },
      ]
    : [
        { icon: UserRound, text: 'Age 17 - 70 years old (First-timers ≤ 60)' },
        { icon: Scale, text: 'Body weight at least 45 kg (99 lbs)' },
        { icon: ShieldCheck, text: 'Hemoglobin: Female ≥ 12.5 / Male ≥ 13.0 g/dL' },
      ];

  return (
    <>
      {/* ============ QUICK AT BENEFIT & SCHEDULE STRIP ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[var(--line)] shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-[var(--rose-100)] text-[var(--burgundy-700)]">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--muted)] block">
                {isTh ? 'เวลาจัดงาน' : 'Event Schedule'}
              </span>
              <span className="text-base font-black text-[var(--burgundy-700)]">09:00 – 14:00 น.</span>
              <span className="text-xs text-[var(--muted)] block">
                {isTh ? 'พุธที่ 16 กันยายน 2569' : 'Wednesday, September 16, 2026'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 border-t md:border-t-0 md:border-l border-[var(--line)] pt-3 md:pt-0 md:pl-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-900">
              <Gift className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--muted)] block">
                {isTh ? 'ของที่ระลึก & สิทธิประโยชน์' : 'Donor Gifts & Refreshments'}
              </span>
              <span className="text-sm font-black text-amber-950">
                {isTh ? 'ของที่ระลึก Limited Edition' : 'Limited Edition Souvenir'}
              </span>
              <span className="text-xs text-amber-800 block">
                {isTh ? 'และอาหารว่างเครื่องดื่มบำรุงสุขภาพ' : 'and recovery snacks & drinks'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 border-t md:border-t-0 md:border-l border-[var(--line)] pt-3 md:pt-0 md:pl-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-900">
              <MapPin className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--muted)] block">
                {isTh ? 'สถานที่จัดกิจกรรม' : 'Event Venue'}
              </span>
              <span className="text-sm font-black text-[var(--ink)]">
                {isTh ? 'ห้องประชุม 217 อาคารสิริวิทยา' : 'Meeting Room 217, Sirividhaya'}
              </span>
              <span className="text-xs text-[var(--muted)] block">
                {isTh ? 'คณะศิลปศาสตร์ ม.มหิดล ศาลายา' : 'Mahidol University Salaya'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ INTERACTIVE SELF-SCREENING FEATURE CALLOUT ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="editorial-card p-6 sm:p-10 bg-gradient-to-br from-[var(--rose-100)]/80 via-white to-amber-50/50 border-2 border-[var(--burgundy-500)]/20 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-red-950/20 border border-white/20">
                <Sparkles className="h-3.5 w-3.5 fill-white text-white" />
                <span>{isTh ? 'เครื่องมือใหม่: ประเมินความพร้อมก่อนเดินทาง' : 'Interactive Self-Screening Tool'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
                {isTh ? 'ตรวจเช็กความพร้อมของคุณด้วย “ระบบประเมินตนเอง (Self-Screening)”' : 'Evaluate your donation readiness in 2 minutes'}
              </h2>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[var(--muted)] font-medium max-w-2xl">
                {isTh
                  ? 'ประเมินสุขภาพ 24 ข้อตามแบบสอบถามมาตรฐานของศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (2567) ทราบผลทันทีว่าพร้อมบริจาค หรือต้องเว้นระยะเวลากี่วัน'
                  : 'Evaluate your health against official Thai Red Cross Society standards. Instant results on eligibility and preparation guidance.'}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/screening"
                  className="editorial-btn-primary py-3 px-6 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isTh ? 'เริ่มทำแบบประเมินสุขภาพตนเอง' : 'Start Self-Screening'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/knowledge"
                  className="editorial-btn-secondary py-3 px-5 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Microscope className="h-4 w-4 text-[var(--burgundy-700)]" />
                  <span>{isTh ? 'ศึกษามาตรฐานการตรวจแล็บ' : 'Explore Lab Standards'}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-[var(--line)] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[var(--burgundy-700)]">
                <ShieldCheck className="h-4 w-4" />
                <span>{isTh ? 'เช็กครอบคลุมทุกมิติสุขภาพ' : 'Comprehensive Evaluation'}</span>
              </div>
              <ul className="space-y-2 text-xs font-bold text-editorial-ink">
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{isTh ? 'อายุ น้ำหนัก การนอนหลับ และความพร้อม' : 'Age, weight, sleep & wellness'}</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{isTh ? 'โรคประจำตัว และประวัติสุขภาพ' : 'Medical history & chronic diseases'}</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{isTh ? 'ยาปฏิชีวนะ ยารักษาสิว และวัคซีน' : 'Antibiotics, acne medication & vaccines'}</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{isTh ? 'ทันตกรรม รอยสัก และพฤติกรรมเสี่ยง' : 'Dental, tattoos & travel/risk factors'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5-STEP DONATION JOURNEY ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
            {isTh ? '5 ขั้นตอนการบริจาคโลหิต' : '5 Steps of Blood Donation'}
          </h2>
          <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
            {isTh 
              ? 'ตั้งแต่วินาทีที่คุณกดลงทะเบียน ไปจนถึงการพักผ่อนหลังบริจาค — เราจัดคิวให้เป็นระบบและสะดวกสบาย'
              : 'From online registration to post-donation refreshments — smooth, coordinated, and comfortable.'}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {donorSteps.map((step) => (
            <div
              key={step.num}
              className="relative bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 pt-7 hover:border-[var(--burgundy-500)] hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <span className="absolute -top-3.5 left-5 inline-flex h-7 items-center rounded-full bg-[var(--burgundy-700)] px-2.5 text-xs font-bold text-white shadow-xs">
                {step.num}
              </span>
              <h3 className="text-base font-extrabold text-[var(--ink)]">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)] font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ OFFICIAL POSTERS & INFOGRAPHICS ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
              {isTh ? 'โปสเตอร์ & สื่อประชาสัมพันธ์' : 'Posters & Media Assets'}
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
              {isTh 
                ? 'โปสเตอร์ทางการปรับเวลาใหม่ 09.00 - 14.00 น. และชุดภาพอินโฟกราฟิกให้ความรู้ @mumt_loveunit'
                : 'Official posters with schedule 09:00 AM - 02:00 PM and educational infographics.'}
            </p>
          </div>
          <Link href="/poster" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--burgundy-700)] hover:underline py-1.5 cursor-pointer">
            <span>{isTh ? 'ดูโปสเตอร์และดาวน์โหลดทั้งหมด' : 'View & Download All Posters'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { src: '/images/poster-th.jpg', label: isTh ? 'A4 ภาษาไทย (09.00-14.00 น.)' : 'A4 Thai (09:00 - 14:00)', alt: 'โปสเตอร์ประชาสัมพันธ์ภาษาไทย' },
            { src: '/images/poster-en.jpg', label: isTh ? 'A4 English (09:00-14:00)' : 'A4 English (09:00 AM - 02:00 PM)', alt: 'English event poster' },
            { src: '/images/poster-a3-minimal.jpg', label: isTh ? 'A3 Minimal (Give Blood Give Love)' : 'A3 Minimal Poster', alt: 'A3 Minimal Poster' },
          ].map((p) => (
            <Link
              key={p.src}
              href="/poster"
              className="group relative block overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-xs transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-[3/4] bg-gray-50">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="absolute left-2.5 top-2.5 rounded-full bg-[var(--burgundy-700)] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                {p.label}
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 text-xs font-extrabold text-white flex items-center justify-between">
                <span>{isTh ? 'ดูภาพขยาย / ดาวน์โหลด' : 'Enlarge / Download'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ PREPARATION & DONOR GUIDELINES ============ */}
      <section className="border-y border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
                {isTh ? 'ข้อมูลการเตรียมตัว' : 'Donor Preparation Guide'}
              </h2>
              <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
                {isTh 
                  ? 'ตรวจสอบตัวเองก่อนวันบริจาค เพื่อให้การบริจาคของคุณผ่านฉลุย'
                  : 'Check your physical readiness before arriving on event day.'}
              </p>
            </div>
            <Link href="/prepare" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--burgundy-700)] hover:underline py-1.5 cursor-pointer">
              <span>{isTh ? 'อ่านคู่มือฉบับเต็ม' : 'Read Full Guide'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* DO'S */}
            <div className="rounded-xl border border-[var(--ok)]/25 bg-[var(--ok-bg)]/60 p-6">
              <div className="flex items-center gap-3 pb-4">
                <div className="h-10 w-10 rounded-lg bg-[var(--ok)] text-white flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[var(--ink)]">
                  {isTh ? 'สิ่งที่ควรทำ' : "Do's"}
                </h3>
              </div>
              <ul className="space-y-3.5 text-[15px] font-medium text-[var(--ink)]">
                {dos.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-[var(--ok)] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* DON'T */}
            <div className="rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-bg)]/60 p-6">
              <div className="flex items-center gap-3 pb-4">
                <div className="h-10 w-10 rounded-lg bg-[var(--danger)] text-white flex items-center justify-center">
                  <XCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[var(--ink)]">
                  {isTh ? 'สิ่งที่ควรหลีกเลี่ยง' : "Don'ts"}
                </h3>
              </div>
              <ul className="space-y-3.5 text-[15px] font-medium text-[var(--ink)]">
                {donts.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-[var(--danger)] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* REQUIREMENTS */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--rose-100)]/50 p-6">
              <div className="flex items-center gap-3 pb-4">
                <div className="h-10 w-10 rounded-lg bg-[var(--burgundy-700)] text-white flex items-center justify-center">
                  <UserRound className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-extrabold text-[var(--ink)]">
                  {isTh ? 'คุณสมบัติผู้บริจาค' : 'Requirements'}
                </h3>
              </div>
              <ul className="space-y-3.5 text-[15px] font-medium text-[var(--ink)]">
                {requirements.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT & COORDINATOR SECTION ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
        <div className="editorial-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-black text-[var(--ink)]">
              {isTh ? 'มีข้อสงสัยเกี่ยวกับกิจกรรมหรือการเตรียมตัว?' : 'Questions about the event or donation guidelines?'}
            </h3>
            <p className="text-xs text-[var(--muted)] font-medium">
              {isTh ? 'ติดต่อทีมงานผู้ประสานงาน หรือติดตามข้อมูลอัปเดตผ่านช่องทางโซเชียลมีเดีย' : 'Contact our coordinators or follow our official social media channels.'}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-1 text-xs font-bold text-[var(--burgundy-700)]">
              <span>📞 {isTh ? 'เปา' : 'Pao'}: <a href="tel:0969866245" className="underline">09-6986-6245</a></span>
              <span>📞 {isTh ? 'แตงโม' : 'Tangmo'}: <a href="tel:0656274319" className="underline">06-5627-4319</a></span>
            </div>
            <div className="pt-2 flex justify-center md:justify-start">
              <SocialLinks />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="editorial-btn-primary py-3.5 px-8 text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>{isTh ? 'ลงทะเบียนบริจาคโลหิตออนไลน์' : 'Register Blood Donation Online'}</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
