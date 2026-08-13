import React from 'react';
import Link from 'next/link';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
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
} from 'lucide-react';
import { TicketStub } from '@/components/ui/TicketStub';
import { getEventBySlug } from '@/services/event-service';
import { formatThaiDate, formatTimeRange, pickField } from '@/lib/utils/format';

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

  const eventDateFormatted = formatThaiDate(startAt);
  const eventTimeFormatted = formatTimeRange(startAt, endAt);

  const donorSteps = [
    { num: '01', title: 'ลงทะเบียน', desc: 'จองคิวล่วงหน้าออนไลน์' },
    { num: '02', title: 'เตรียมตัว', desc: 'ก่อนเดินทางมาบริจาค' },
    { num: '03', title: 'มาถึง', desc: 'ตามเวลาที่นัดหมาย' },
    { num: '04', title: 'บริจาคโลหิต', desc: 'ใช้เวลาประมาณ 10-15 นาที' },
    { num: '05', title: 'พักผ่อน', desc: 'รับของว่าง / ของที่ระลึก' },
  ];

  const dos = [
    { icon: GlassWater, text: 'ดื่มน้ำเปล่า 3-4 แก้ว (500 มล.) ก่อนบริจาค 30 นาที' },
    { icon: Utensils, text: 'รับประทานอาหารมื้อหลักก่อนมาบริจาคโลหิต' },
    { icon: Moon, text: 'นอนหลับพักผ่อนให้เพียงพอ อย่างน้อย 6 ชั่วโมง' },
  ];

  const donts = [
    { icon: Wine, text: 'งดเครื่องดื่มแอลกอฮอล์ อย่างน้อย 24 ชั่วโมง' },
    { icon: Cigarette, text: 'งดสูบบุหรี่ ก่อนและหลังบริจาคอย่างน้อย 1 ชั่วโมง' },
    { icon: XCircle, text: 'งดอาหารไขมันสูง เช่น ข้าวขาหมู แกงกะทิ ขนมหวาน' },
  ];

  const requirements = [
    { icon: UserRound, text: 'อายุระหว่าง 17 - 70 ปีบริบูรณ์ (ครั้งแรกไม่เกิน 60 ปี)' },
    { icon: Scale, text: 'น้ำหนักตัวตั้งแต่ 45 กิโลกรัม ขึ้นไป' },
    { icon: ShieldCheck, text: 'สุขภาพแข็งแรง ไม่มีโรคประจำตัวร้ายแรง' },
  ];

  return (
    <div>
      {/* ============ HERO — full-bleed red field ============ */}
      <section className="hero-field relative">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-28 sm:px-6 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:items-end">

            {/* Left: campaign statement */}
            <div className="lg:col-span-7 space-y-6">
              <span className="brand-chip rise-in">
                <Heart className="h-3.5 w-3.5 fill-current" />
                ครั้งที่ 9 · MUMT Blood Donation 2026
              </span>

              <h1 className="text-[2.25rem] leading-[1.08] font-black text-[var(--cream)] min-[420px]:text-[2.6rem] sm:text-6xl lg:text-[4.5rem] tracking-[-0.02em]">
                เติมรักให้เต็ม{' '}
                <span className="text-[var(--burgundy-300)]">UNIT</span>
                <br />
                ต่อชีวิตด้วยโลหิตคุณ
              </h1>

              <p className="max-w-xl text-[15px] sm:text-base leading-relaxed text-[var(--cream-dim)] font-medium">
                {event.description}
              </p>

              {/* Event facts */}
              <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-2">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4.5 w-4.5 text-[var(--burgundy-300)]" />
                  <span className="text-sm font-bold text-[var(--cream)]">{eventDateFormatted}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4.5 w-4.5 text-[var(--burgundy-300)]" />
                  <span className="text-sm font-bold text-[var(--cream)]">{eventTimeFormatted}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-[var(--burgundy-300)]" />
                  <span className="text-sm font-bold text-[var(--cream)]">ห้องประชุม 217-218 อาคารสิริวิทยา</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/register" className="btn-cream">
                  <span>ลงทะเบียนบริจาคโลหิต</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/prepare" className="btn-outline-cream">
                  <span>ดูการเตรียมตัวก่อนบริจาค</span>
                </Link>
              </div>
            </div>

            {/* Right: ticket breaks out of the hero bottom edge */}
            <div className="lg:col-span-5 hidden lg:flex justify-end">
              <div className="rise-in w-full max-w-md rotate-2 origin-top-right relative z-10 lg:translate-y-24">
                <TicketStub
                  registrationCode="MBD26-DONORPASS"
                  name="ผู้บริจาคโลหิตศิริวิทยา"
                  date="16 SEP 2026"
                  timeSlot="08:00 - 15:00 น."
                  venue="LA 217-218 อาคารสิริวิทยา"
                  unitNumber="09"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile ticket — hangs off the hero bottom */}
      <div className="lg:hidden mx-auto -mt-24 max-w-md px-4 sm:px-6 relative z-10">
        <TicketStub
          registrationCode="MBD26-DONORPASS"
          name="ผู้บริจาคโลหิตศิริวิทยา"
          date="16 SEP 2026"
          timeSlot="08:00 - 15:00 น."
          venue="LA 217-218 อาคารสิริวิทยา"
          unitNumber="09"
        />
      </div>

      {/* ============ 5-STEP DONATION JOURNEY ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
            5 ขั้นตอนการบริจาคโลหิต
          </h2>
          <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
            ตั้งแต่วินาทีที่คุณกดลงทะเบียน ไปจนถึงการพักผ่อนหลังบริจาค — เราจัดคิวให้เป็นระบบ
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {donorSteps.map((step, i) => (
            <div
              key={step.num}
              className="relative bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 pt-7 hover:border-[var(--burgundy-500)] hover:shadow-[var(--shadow-soft)] transition-all"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="absolute -top-3.5 left-5 inline-flex h-7 items-center rounded-full bg-[var(--burgundy-700)] px-2.5 text-xs font-bold text-white">
                {step.num}
              </span>
              <h3 className="text-base font-extrabold text-[var(--ink)]">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] font-medium">{step.desc}</p>
            </div>
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
              <span>ดูทั้งหมด</span>
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
    </div>
  );
}
