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
  Award,
  Layers,
  Heart,
  Droplets,
  Calendar,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';
import { HeroClient } from '@/components/home/HeroClient';
import { getEventBySlug } from '@/services/event-service';
import { pickField } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const event = await getEventBySlug('mumt-2026');

  if (!event) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="editorial-card p-8 text-center">
          <h2 className="text-lg font-bold text-[var(--burgundy-500)]">ไม่พบข้อมูลกิจกรรมบริจาคโลหิต</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">กรุณาตรวจสอบ URL หรือติดต่อผู้ดูแลระบบ</p>
        </div>
      </div>
    );
  }

  const startAt = pickField<string>(event, 'startAt', 'start_at') || '';
  const endAt = pickField<string>(event, 'endAt', 'end_at') || '';

  const donorSteps = [
    { num: '01', title: 'ประเมินสุขภาพ', desc: 'ตรวจเช็กความพร้อมผ่านระบบออนไลน์' },
    { num: '02', title: 'ลงทะเบียนจองรอบ', desc: 'เลือกช่วงเวลาระหว่าง 09.00 - 14.00 น.' },
    { num: '03', title: 'เตรียมร่างกาย', desc: 'นอนหลับ 6 ชม. & ดื่มน้ำ 500 มล.' },
    { num: '04', title: 'บริจาคโลหิต', desc: 'ใช้เวลาประมาณ 10-15 นาที ณ ห้อง 217' },
    { num: '05', title: 'รับ AT & ของที่ระลึก', desc: 'รับ AT สูงสุด 2 ชม. และของว่าง' },
  ];

  const dos = [
    { icon: GlassWater, text: 'ดื่มน้ำเปล่า 3-4 แก้ว (500 มล.) ก่อนบริจาค 20-30 นาที' },
    { icon: Utensils, text: 'รับประทานอาหารมื้อหลักก่อนมาบริจาค (หลีกเลี่ยงของมัน)' },
    { icon: Moon, text: 'นอนหลับพักผ่อนให้เพียงพอ อย่างน้อย 5-6 ชั่วโมง' },
  ];

  const donts = [
    { icon: Wine, text: 'งดเครื่องดื่มแอลกอฮอล์ อย่างน้อย 24 ชั่วโมง' },
    { icon: Cigarette, text: 'งดสูบบุหรี่ ก่อนและหลังบริจาคอย่างน้อย 1 ชั่วโมง' },
    { icon: XCircle, text: 'งดอาหารไขมันสูง เช่น ข้าวขาหมู แกงกะทิ ขนมหวาน' },
  ];

  const requirements = [
    { icon: UserRound, text: 'อายุระหว่าง 17 - 70 ปีบริบูรณ์ (ครั้งแรกไม่เกิน 60 ปี)' },
    { icon: Scale, text: 'น้ำหนักตัวตั้งแต่ 45 กิโลกรัม ขึ้นไป' },
    { icon: ShieldCheck, text: 'ความเข้มข้นโลหิต หญิง ≥ 12.5 / ชาย ≥ 13.0 g/dL' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO — full-bleed red field with TH/EN toggle */}
      <HeroClient description={event.description} startAt={startAt} endAt={endAt} />

      {/* ============ QUICK AT BENEFIT & SCHEDULE STRIP ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[var(--line)] shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-[var(--rose-100)] text-[var(--burgundy-700)]">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--muted)] block">เวลาจัดงาน (ปรับปรุงใหม่)</span>
              <span className="text-base font-black text-[var(--burgundy-700)]">09.00 – 14.00 น.</span>
              <span className="text-xs text-[var(--muted)] block">พุธที่ 16 กันยายน 2569</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 border-t md:border-t-0 md:border-l border-[var(--line)] pt-3 md:pt-0 md:pl-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-900">
              <Award className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--muted)] block">ชั่วโมงกิจกรรม Mahidol AT</span>
              <span className="text-sm font-black text-amber-950">รับ AT สูงสุด 2 ชั่วโมง</span>
              <span className="text-xs text-amber-800 block">Health Literacy 1 ชม. + จิตอาสา 1 ชม.</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 border-t md:border-t-0 md:border-l border-[var(--line)] pt-3 md:pt-0 md:pl-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-900">
              <MapPin className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--muted)] block">สถานที่จัดกิจกรรม</span>
              <span className="text-sm font-black text-[var(--ink)]">ห้องประชุม 217 อาคารสิริวิทยา</span>
              <span className="text-xs text-[var(--muted)] block">คณะศิลปศาสตร์ ม.มหิดล ศาลายา</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ INTERACTIVE SELF-SCREENING FEATURE CALLOUT ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="editorial-card p-6 sm:p-10 bg-gradient-to-br from-[var(--rose-100)]/80 via-white to-amber-50/50 border-2 border-[var(--burgundy-500)]/20 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--burgundy-700)] border border-[var(--line)] shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 fill-[var(--burgundy-700)]" />
                <span>เครื่องมือใหม่: ประเมินความพร้อมก่อนเดินทาง</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
                ตรวจเช็กความพร้อมของคุณด้วย “ระบบประเมินตนเอง (Self-Screening)”
              </h2>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[var(--muted)] font-medium max-w-2xl">
                ประเมินสุขภาพ 24 ข้อตามแบบสอบถามมาตรฐานของศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (ฉบับ พ.ศ. 2564 & 2567) ทราบผลทันทีว่าพร้อมบริจาค หรือต้องเว้นระยะเวลากี่วัน
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/screening"
                  className="editorial-btn-primary py-3 px-6 text-xs flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>เริ่มทำแบบประเมินสุขภาพตนเอง</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/knowledge"
                  className="editorial-btn-secondary py-3 px-5 text-xs flex items-center gap-2"
                >
                  <Microscope className="h-4 w-4 text-[var(--burgundy-700)]" />
                  <span>ศึกษามาตรฐานการตรวจแล็บ</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-[var(--line)] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[var(--burgundy-700)]">
                <ShieldCheck className="h-4 w-4" />
                <span>เช็กครอบคลุมทุกมิติสุขภาพ</span>
              </div>
              <ul className="space-y-2 text-xs font-bold text-editorial-ink">
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>อายุ น้ำหนัก การนอนหลับ และความพร้อม</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>โรคประจำตัว และประวัติสุขภาพ</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>ยาปฏิชีวนะ ยารักษาสิว และวัคซีน</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>ทันตกรรม รอยสัก และพฤติกรรมเสี่ยง</span>
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
            5 ขั้นตอนการบริจาคโลหิต
          </h2>
          <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
            ตั้งแต่วินาทีที่คุณกดลงทะเบียน ไปจนถึงการพักผ่อนหลังบริจาค — เราจัดคิวให้เป็นระบบและสะดวกสบาย
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {donorSteps.map((step, i) => (
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
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">โปสเตอร์ & สื่อประชาสัมพันธ์</h2>
            <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
              โปสเตอร์ทางการปรับเวลาใหม่ 09.00 - 14.00 น. และชุดภาพอินโฟกราฟิกให้ความรู้ @mumt_loveunit
            </p>
          </div>
          <Link href="/poster" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--burgundy-700)] hover:underline py-1.5">
            <span>ดูโปสเตอร์และดาวน์โหลดทั้งหมด</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { src: '/images/poster-th.jpg', label: 'A4 ภาษาไทย (09.00-14.00 น.)', alt: 'โปสเตอร์ประชาสัมพันธ์ภาษาไทย' },
            { src: '/images/poster-en.jpg', label: 'A4 English (09:00 AM-02:00 PM)', alt: 'English event poster' },
            { src: '/images/poster-a3-minimal.jpg', label: 'A3 Minimal (Give Blood Give Love)', alt: 'A3 Minimal Poster' },
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
                <span>ดูภาพขยาย / ดาวน์โหลด</span>
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
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">ข้อมูลการเตรียมตัว</h2>
              <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
                ตรวจสอบตัวเองก่อนวันบริจาค เพื่อให้การบริจาคของคุณผ่านฉลุย
              </p>
            </div>
            <Link href="/prepare" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--burgundy-700)] hover:underline py-1.5">
              <span>อ่านคู่มือฉบับเต็ม</span>
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
                <h3 className="text-lg font-extrabold text-[var(--ink)]">สิ่งที่ควรทำ</h3>
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
                <h3 className="text-lg font-extrabold text-[var(--ink)]">สิ่งที่ควรหลีกเลี่ยง</h3>
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
                <h3 className="text-lg font-extrabold text-[var(--ink)]">คุณสมบัติผู้บริจาค</h3>
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
            <h3 className="text-lg font-black text-[var(--ink)]">มีข้อสงสัยเกี่ยวกับกิจกรรมหรือการเตรียมตัว?</h3>
            <p className="text-xs text-[var(--muted)] font-medium">
              ติดต่อทีมงานผู้ประสานงาน หรือติดตามข้อมูลอัปเดตผ่านช่องทางโซเชียลมีเดีย
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-1 text-xs font-bold text-[var(--burgundy-700)]">
              <span>📞 คุณเปา: <a href="tel:0969866245" className="underline">09-6986-6245</a></span>
              <span>📞 คุณแตงโม: <a href="tel:0656274319" className="underline">06-5627-4319</a></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="editorial-btn-primary py-3.5 px-8 text-xs flex items-center gap-2 shadow-lg"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>ลงทะเบียนบริจาคโลหิตออนไลน์</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
