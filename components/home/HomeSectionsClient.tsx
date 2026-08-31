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
  Clock,
  Phone,
  Calendar,
  HeartPulse,
  Droplets,
  ChevronRight,
  Check
} from 'lucide-react';
import { SocialLinks } from '@/components/common/SocialLinks';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HomeSectionsClient() {
  const { isTh } = useLanguage();

  const donorSteps = isTh
    ? [
        { 
          num: '01', 
          title: 'ประเมินสุขภาพ', 
          desc: 'ตรวจเช็กความพร้อมผ่านระบบออนไลน์', 
          duration: 'ใช้เวลา ~2 นาที',
          action: 'ทำแบบประเมิน',
          href: '/screening',
          icon: ShieldCheck,
          accent: 'from-amber-500 to-orange-600'
        },
        { 
          num: '02', 
          title: 'ลงทะเบียนจองรอบ', 
          desc: 'เลือกช่วงเวลาระหว่าง 09.00 - 14.00 น.', 
          duration: 'ใช้เวลา ~1 นาที',
          action: 'จองรอบเวลา',
          href: '/register',
          icon: Calendar,
          accent: 'from-rose-500 to-[var(--burgundy-700)]'
        },
        { 
          num: '03', 
          title: 'เตรียมร่างกาย', 
          desc: 'นอนหลับ 5-6 ชม. & ดื่มน้ำ 500 มล.', 
          duration: 'คืนก่อนวันงาน',
          action: 'ดูวิธีเตรียมตัว',
          href: '/prepare',
          icon: HeartPulse,
          accent: 'from-blue-500 to-indigo-600'
        },
        { 
          num: '04', 
          title: 'บริจาคโลหิต', 
          desc: 'ใช้เวลาประมาณ 10-15 นาที ณ ห้อง 217', 
          duration: 'วันงานจริง',
          action: 'ดูแผนที่สถานที่',
          href: '/location',
          icon: Droplets,
          accent: 'from-red-600 to-[var(--burgundy-800)]'
        },
        { 
          num: '05', 
          title: 'รับของที่ระลึก & อาหารว่าง', 
          desc: 'รับของที่ระลึกพิเศษ และของว่างบำรุงสุขภาพ', 
          duration: 'หลังบริจาค',
          action: 'ดูของที่ระลึก',
          href: '/poster',
          icon: Gift,
          accent: 'from-emerald-500 to-teal-700'
        },
      ]
    : [
        { 
          num: '01', 
          title: 'Self-Screening', 
          desc: 'Check eligibility via online assessment', 
          duration: 'Takes ~2 mins',
          action: 'Start Assessment',
          href: '/screening',
          icon: ShieldCheck,
          accent: 'from-amber-500 to-orange-600'
        },
        { 
          num: '02', 
          title: 'Select Time Slot', 
          desc: 'Choose arrival time between 09:00 - 14:00', 
          duration: 'Takes ~1 min',
          action: 'Reserve Slot',
          href: '/register',
          icon: Calendar,
          accent: 'from-rose-500 to-[var(--burgundy-700)]'
        },
        { 
          num: '03', 
          title: 'Prepare Body', 
          desc: 'Sleep 5-6+ hrs & drink 500 mL water', 
          duration: 'Night before',
          action: 'Prep Guide',
          href: '/prepare',
          icon: HeartPulse,
          accent: 'from-blue-500 to-indigo-600'
        },
        { 
          num: '04', 
          title: 'Donate Blood', 
          desc: 'Takes approx. 10-15 mins at Room 217', 
          duration: 'Event Day',
          action: 'View Venue',
          href: '/location',
          icon: Droplets,
          accent: 'from-red-600 to-[var(--burgundy-800)]'
        },
        { 
          num: '05', 
          title: 'Souvenir & Refreshments', 
          desc: 'Receive limited edition gift & snacks', 
          duration: 'Post-donation',
          action: 'View Gifts',
          href: '/poster',
          icon: Gift,
          accent: 'from-emerald-500 to-teal-700'
        },
      ];

  const dos = isTh
    ? [
        { 
          icon: GlassWater, 
          title: 'ดื่มน้ำเปล่า 3-4 แก้ว (500 มล.)',
          desc: 'ดื่มก่อนบริจาค 20-30 นาที ช่วยเพิ่มปริมาตรเลือดและลดอาการวิงเวียน',
          tag: 'สำคัญมาก'
        },
        { 
          icon: Utensils, 
          title: 'รับประทานอาหารมื้อหลัก',
          desc: 'กินอาหารก่อนมาบริจาค (หลีกเลี่ยงอาหารมัน) เพื่อให้ร่างกายมีพลังงาน',
          tag: 'ก่อนบริจาค'
        },
        { 
          icon: Moon, 
          title: 'นอนหลับพักผ่อนให้เพียงพอ',
          desc: 'นอนหลับอย่างน้อย 5-6 ชั่วโมงต่อเนื่องในคืนก่อนวันบริจาค',
          tag: 'อย่างน้อย 5-6 ชม.'
        },
      ]
    : [
        { 
          icon: GlassWater, 
          title: 'Drink 3-4 glasses of water (500 mL)',
          desc: 'Drink 20-30 mins prior to boost blood volume and prevent dizziness.',
          tag: 'Crucial'
        },
        { 
          icon: Utensils, 
          title: 'Eat a proper light meal',
          desc: 'Have a nutritious meal beforehand (avoid greasy foods) for energy.',
          tag: 'Pre-donation'
        },
        { 
          icon: Moon, 
          title: 'Get adequate restful sleep',
          desc: 'Ensure at least 5-6 hours of continuous restful sleep the night before.',
          tag: '≥ 5-6 Hours'
        },
      ];

  const donts = isTh
    ? [
        { 
          icon: Wine, 
          title: 'งดเครื่องดื่มแอลกอฮอล์',
          desc: 'งดดื่มสุรา/เบียร์อย่างน้อย 24 ชั่วโมง เพื่อป้องกันตับทำงานหนักและเลือดเจือจาง',
          tag: 'งด 24 ชม.'
        },
        { 
          icon: Cigarette, 
          title: 'งดสูบบุหรี่',
          desc: 'งดสูบบุหรี่ก่อนและหลังบริจาคอย่างน้อย 1 ชั่วโมง ป้องกันสารคาร์บอนมอนอกไซด์ในเลือด',
          tag: 'งด 1 ชม.'
        },
        { 
          icon: XCircle, 
          title: 'งดอาหารไขมันสูง',
          desc: 'หลีกเลี่ยงข้าวขาหมู แกงกะทิ ของทอด ขนมหวาน เพื่อป้องกันพลาสมาขุ่น (Chylomicronemia)',
          tag: 'มื้อก่อนบริจาค'
        },
      ]
    : [
        { 
          icon: Wine, 
          title: 'Avoid Alcoholic Beverages',
          desc: 'Abstain for at least 24 hours to reduce liver stress and prevent dilution.',
          tag: '24 Hours'
        },
        { 
          icon: Cigarette, 
          title: 'Avoid Smoking',
          desc: 'Refrain from smoking 1 hour before and after to keep oxygen levels optimal.',
          tag: '1 Hour'
        },
        { 
          icon: XCircle, 
          title: 'Avoid High-Fat / Greasy Meals',
          desc: 'Avoid fried foods and coconut milk to prevent turbid lipemic plasma.',
          tag: 'Pre-meal'
        },
      ];

  const requirements = isTh
    ? [
        { 
          icon: UserRound, 
          title: 'อายุระหว่าง 17 - 70 ปีบริบูรณ์',
          desc: 'อายุ 17 ปีต้องมีใบยินยอมจากผู้ปกครอง / ผู้บริจาคครั้งแรกอายุไม่เกิน 60 ปี',
          tag: '17 - 70 ปี'
        },
        { 
          icon: Scale, 
          title: 'น้ำหนักตัวตั้งแต่ 45 กิโลกรัม ขึ้นไป',
          desc: 'เกณฑ์มาตรฐานเพื่อความปลอดภัยในการเจาะเก็บโลหิต 350 - 450 มิลลิลิตร',
          tag: '≥ 45 กก.'
        },
        { 
          icon: ShieldCheck, 
          title: 'ความเข้มข้นของโลหิต (ฮีโมโกลบิน)',
          desc: 'หญิง ≥ 12.5 g/dL / ชาย ≥ 13.0 g/dL (ตรวจคัดกรองเบื้องต้นหน้างานฟรี)',
          tag: 'ตรวจคัดกรองฟรี'
        },
      ]
    : [
        { 
          icon: UserRound, 
          title: 'Age 17 - 70 years old',
          desc: 'Age 17 requires parental consent. First-time donors must be under 60.',
          tag: '17 - 70 Yrs'
        },
        { 
          icon: Scale, 
          title: 'Body weight at least 45 kg (99 lbs)',
          desc: 'Standard physical requirement for safe whole blood collection (350-450 mL).',
          tag: '≥ 45 kg'
        },
        { 
          icon: ShieldCheck, 
          title: 'Hemoglobin Concentration',
          desc: 'Female ≥ 12.5 g/dL / Male ≥ 13.0 g/dL (Complimentary on-site screening).',
          tag: 'Free Screening'
        },
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
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] leading-snug">
                {isTh ? (
                  <>
                    ตรวจเช็กความพร้อมของคุณด้วย <br className="hidden sm:inline" />
                    <span className="inline-block whitespace-nowrap">“ระบบประเมินตนเอง (Self-Screening)”</span>
                  </>
                ) : (
                  'Evaluate your donation readiness in 2 minutes'
                )}
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

      {/* ============ 5-STEP DONATION JOURNEY (UPGRADED INTERACTIVE FLOW) ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-3.5 py-1 text-xs font-bold text-white shadow-sm shadow-red-950/20 border border-white/20">
              <Sparkles className="h-3.5 w-3.5 fill-white text-white" />
              <span>{isTh ? 'เส้นทางการเป็นผู้ให้' : 'Donor Journey'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
              {isTh ? '5 ขั้นตอนการบริจาคโลหิต' : '5 Steps of Blood Donation'}
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
              {isTh 
                ? 'ตั้งแต่วินาทีที่คุณกดลงทะเบียน ไปจนถึงการพักผ่อนหลังบริจาค — เราจัดระบบให้คุณสะดวกรวดเร็วและอุ่นใจทุกขั้นตอน'
                : 'From online booking to post-donation care — smooth, coordinated, and comfortable.'}
            </p>
          </div>

          <Link 
            href="/prepare"
            className="inline-flex items-center gap-1.5 text-xs font-black text-[var(--burgundy-700)] hover:underline whitespace-nowrap"
          >
            <span>{isTh ? 'ดูคู่มือการเตรียมตัวฉบับเต็ม' : 'Full Preparation Guide'}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Dynamic Connected Journey Grid */}
        <div className="relative mt-10">
          {/* Desktop Connecting Background Rail */}
          <div className="hidden lg:block absolute top-[48px] left-[7%] right-[7%] h-[3px] bg-gradient-to-r from-amber-400 via-[var(--burgundy-500)] to-emerald-500 rounded-full z-0 opacity-40" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 relative z-10">
            {donorSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <Link
                  key={step.num}
                  href={step.href}
                  className="group relative flex flex-col justify-between bg-white border border-[var(--line)] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[var(--burgundy-400)] cursor-pointer"
                >
                  {/* Top Step Header with Animated Glow Icon & Step Number */}
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-4">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${step.accent} text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                        <StepIcon className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-2xl font-black text-gray-200 group-hover:text-[var(--burgundy-600)] transition-colors block leading-none">
                          {step.num}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--muted)] block mt-1">
                          {step.duration}
                        </span>
                      </div>
                    </div>

                    {/* Step Title & Details */}
                    <div className="space-y-1.5 pt-1">
                      <h3 className="text-base font-black text-[var(--ink)] group-hover:text-[var(--burgundy-700)] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-[var(--muted)] font-medium">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Interactive Micro Action */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-black text-[var(--burgundy-700)] group-hover:text-[var(--burgundy-600)]">
                    <span>{step.action}</span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
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

      {/* ============ PREPARATION & DONOR GUIDELINES (INTERACTIVE BENTO GRID) ============ */}
      <section className="border-y border-[var(--line)] bg-gradient-to-b from-gray-50/70 via-white to-gray-50/70">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-3.5 py-1 text-xs font-bold text-white shadow-sm shadow-red-950/20 border border-white/20">
                <Heart className="h-3.5 w-3.5 fill-white text-white" />
                <span>{isTh ? 'คู่มือเตรียมร่างกาย' : 'Readiness Guide'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
                {isTh ? 'ข้อมูลการเตรียมตัวก่อนบริจาคโลหิต' : 'Donor Preparation & Standards'}
              </h2>
              <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
                {isTh 
                  ? 'ตรวจสอบความพร้อมของร่างกาย เพื่อให้การบริจาคของคุณราบรื่น ปลอดภัย และได้โลหิตที่มีคุณภาพสูงสุดแก่ผู้ป่วย'
                  : 'Ensure optimal physical condition for a smooth, safe donation experience.'}
              </p>
            </div>
            <Link 
              href="/prepare" 
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--rose-100)] hover:bg-[var(--rose-200)] text-[var(--burgundy-700)] font-extrabold px-4 py-2.5 text-xs border border-[var(--line)] transition-all cursor-pointer shadow-xs"
            >
              <span>{isTh ? 'อ่านคู่มือฉบับเต็ม' : 'Read Full Guide'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Bento-Style 3 Rich Interactive Column Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. DO'S (EMERALD HIGHLIGHT) */}
            <div className="group relative bg-white border border-emerald-200/80 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black text-emerald-950">
                      {isTh ? 'สิ่งที่ควรทำ' : "Do's"}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {isTh ? 'แนะนำให้ปฏิบัติ' : 'Recommended'}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {dos.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={i} 
                        className="p-3.5 rounded-xl bg-emerald-50/40 hover:bg-emerald-50/80 border border-emerald-100/80 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-emerald-700 shrink-0" />
                            <h4 className="text-xs font-black text-emerald-950">{item.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs whitespace-nowrap">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 pl-6 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-emerald-100/60 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                <span>{isTh ? 'ร่างกายพร้อม โลหิตมีคุณภาพ' : 'Optimal blood vitality'}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            {/* 2. DON'TS (RUBY / ROSE HIGHLIGHT) */}
            <div className="group relative bg-white border border-rose-200/80 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-rose-400 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black text-rose-950">
                      {isTh ? 'สิ่งที่ควรหลีกเลี่ยง' : "Don'ts"}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    {isTh ? 'ข้อควรระวัง' : 'Precautions'}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {donts.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={i} 
                        className="p-3.5 rounded-xl bg-rose-50/40 hover:bg-rose-50/80 border border-rose-100/80 transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-rose-700 shrink-0" />
                            <h4 className="text-xs font-black text-rose-950">{item.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-rose-800 bg-white px-2 py-0.5 rounded-md border border-rose-200 shadow-2xs whitespace-nowrap">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 pl-6 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-rose-100/60 flex items-center justify-between text-[11px] font-bold text-rose-800">
                <span>{isTh ? 'ป้องกันภาวะพลาสมาขุ่น' : 'Prevent lipemic plasma'}</span>
                <XCircle className="h-4 w-4 text-rose-600" />
              </div>
            </div>

            {/* 3. REQUIREMENTS (BURGUNDY HIGHLIGHT) */}
            <div className="group relative bg-white border border-[var(--burgundy-200)]/80 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-[var(--burgundy-400)] transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--burgundy-100)]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-[var(--burgundy-700)] text-white flex items-center justify-center shadow-xs">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black text-[var(--burgundy-950)]">
                      {isTh ? 'คุณสมบัติผู้บริจาค' : 'Requirements'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase text-[var(--burgundy-800)] bg-[var(--rose-100)] px-2.5 py-0.5 rounded-full border border-[var(--burgundy-200)]">
                    {isTh ? 'เกณฑ์มาตรฐาน' : 'Criteria'}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {requirements.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={i} 
                        className="p-3.5 rounded-xl bg-[var(--rose-100)]/30 hover:bg-[var(--rose-100)]/70 border border-[var(--line)] transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-[var(--burgundy-700)] shrink-0" />
                            <h4 className="text-xs font-black text-[var(--ink)]">{item.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-[var(--burgundy-800)] bg-white px-2 py-0.5 rounded-md border border-[var(--line)] shadow-2xs whitespace-nowrap">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 pl-6 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--burgundy-100)]/60 flex items-center justify-between text-[11px] font-bold text-[var(--burgundy-700)]">
                <span>{isTh ? 'มาตรฐานสภากาชาดไทย' : 'Red Cross Standards'}</span>
                <ShieldCheck className="h-4 w-4 text-[var(--burgundy-700)]" />
              </div>
            </div>

          </div>

          {/* Interactive Quick-Check Bottom Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[var(--rose-100)]/80 via-white to-blue-50/60 p-5 sm:p-6 border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="h-11 w-11 rounded-xl bg-[var(--burgundy-700)] text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[var(--ink)]">
                  {isTh ? 'ต้องการประเมินความพร้อมแบบละเอียดก่อนเดินทาง?' : 'Want a full 2-minute eligibility self-check?'}
                </h4>
                <p className="text-xs text-[var(--muted)] font-medium">
                  {isTh 
                    ? 'เช็กประวัติสุขภาพ ยา วัคซีน และโรคประจำตัว ทราบผลทันทีไม่ต้องรอวันงาน' 
                    : 'Check your health history, medication, vaccines, and readiness with instant results.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                href="/screening"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] hover:from-[#C51D2C] hover:via-[#911426] hover:to-[#6E0F1D] text-white font-extrabold px-5 py-2.5 text-xs shadow-md shadow-red-950/20 active:scale-95 transition-all cursor-pointer border border-white/20"
              >
                <span>{isTh ? 'ทำแบบประเมินตนเอง (2 นาที)' : 'Start 2-Min Quiz'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {isTh ? 'เปา' : 'Pao'}: <a href="tel:0969866245" className="underline">09-6986-6245</a></span>
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {isTh ? 'แตงโม' : 'Tangmo'}: <a href="tel:0656274319" className="underline">06-5627-4319</a></span>
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
