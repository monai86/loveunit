import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  UserCheck,
  ArrowRight, 
  BookOpen,
  Wine,
  Cigarette,
  GlassWater,
  Utensils
} from 'lucide-react';
import { TicketStub } from '@/components/ui/TicketStub';
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

  const startAt = (event as any).startAt || (event as any).start_at;
  const endAt = (event as any).endAt || (event as any).end_at;
  const venueName = (event as any).venueName || (event as any).venue_name;

  const eventDateFormatted = formatThaiDate(startAt);
  const eventTimeFormatted = formatTimeRange(startAt, endAt);

  const donorSteps = [
    { num: '01', key: 'REGISTER', title: 'ลงทะเบียน', desc: 'จองคิวล่วงหน้าออนไลน์' },
    { num: '02', key: 'PREPARE', title: 'เตรียมตัว', desc: 'ก่อนเดินทางมาบริจาค' },
    { num: '03', key: 'ARRIVE', title: 'มาถึง', desc: 'ตามเวลาที่นัดหมาย' },
    { num: '04', key: 'DONATE', title: 'บริจาคโลหิต', desc: 'ใช้เวลาประมาณ 10-15 นาที' },
    { num: '05', key: 'REST', title: 'พักผ่อน', desc: 'รับของว่าง / ของที่ระลึก' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-16">

      {/* HERO SECTION MATCHING DESIGN BOARD 3 */}
      <section className="border-b border-[#D5C7B8] pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Editorial Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="unit-tag text-[10px]">UNIT 09</span>
                <span className="unit-tag-outline text-[10px]">MUMT BLOOD DONATION 2026 ครั้งที่ 9</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-3xl font-black text-[#282828] sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                เติมรักให้เต็ม <br />
                <span className="text-[#8E0015] font-serif tracking-widest uppercase text-4xl sm:text-6xl lg:text-7xl block my-1">
                  UNIT
                </span>
                <span className="text-[#C13A2B] text-2xl sm:text-4xl block">ต่อชีวิตด้วยโลหิตคุณ</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-medium max-w-xl">
                {event.description}
              </p>
            </div>

            {/* Event Facts Grid */}
            <div className="flex flex-wrap items-center gap-4 py-4 border-y border-[#D5C7B8]">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-[#8E0015]" />
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#666666] uppercase block">16 SEP 2026</span>
                  <span className="text-xs font-black text-[#282828]">พุธ 16 ก.ย. 2569</span>
                </div>
              </div>

              <div className="h-8 w-px bg-[#D5C7B8] hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-[#8E0015]" />
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#666666] uppercase block">08:00 - 15:00</span>
                  <span className="text-xs font-black text-[#282828]">เปิดรับตลอดวัน</span>
                </div>
              </div>

              <div className="h-8 w-px bg-[#D5C7B8] hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <MapPin className="h-5 w-5 text-[#8E0015]" />
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#666666] uppercase block">LA 217-218</span>
                  <span className="text-xs font-black text-[#282828]">อาคารสิริวิทยา ศาลายา</span>
                </div>
              </div>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#8E0015] hover:bg-[#7A1020] text-white font-extrabold px-8 py-4 rounded-xl text-sm shadow-xl transition-all active:scale-95"
              >
                <span>ลงทะเบียนบริจาคโลหิต</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/prepare"
                className="inline-flex items-center justify-center gap-2 bg-[#E9E1D9] hover:bg-[#D5C7B8] text-[#7A1020] font-bold px-6 py-4 rounded-xl text-xs border border-[#D5C7B8] transition-all"
              >
                <span>รายละเอียดเพิ่มเติม →</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Ticket Stub Artifact (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
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
      </section>

      {/* 5 ขั้นตอนการบริจาค (5-STEP DONATION JOURNEY) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#D5C7B8] pb-3">
          <div>
            <span className="unit-tag mb-1">UNIT 02 / DONOR JOURNEY</span>
            <h2 className="text-2xl font-black text-[#282828]">5 ขั้นตอนการบริจาคโลหิต</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {donorSteps.map((step) => (
            <div key={step.num} className="bg-white border border-[#D5C7B8] rounded-xl p-4 space-y-2 shadow-xs hover:border-[#8E0015] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#8E0015]">{step.num}</span>
                <span className="text-[10px] font-mono font-bold text-[#666666]">{step.key}</span>
              </div>
              <h3 className="text-sm font-extrabold text-[#282828]">{step.title}</h3>
              <p className="text-[11px] text-[#666666] leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ข้อมูลการเตรียมตัว (PREPARATION & DONOR GUIDELINES) MATCHING IMAGE 3 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#D5C7B8] pb-3">
          <div>
            <span className="unit-tag mb-1">UNIT 03 / PREPARATION</span>
            <h2 className="text-2xl font-black text-[#282828]">ข้อมูลการเตรียมตัว</h2>
          </div>
          <Link href="/prepare" className="text-xs font-bold text-[#8E0015] hover:underline flex items-center gap-1">
            <span>ดูทั้งหมด</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: DO'S */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm">
                ✓
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 block">CHECKLIST</span>
                <h3 className="text-base font-black text-emerald-900">สิ่งที่ควรทำ (DO'S)</h3>
              </div>
            </div>

            <ul className="space-y-3 text-xs font-bold text-[#282828]">
              <li className="flex items-start gap-2.5">
                <GlassWater className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>ดื่มน้ำเปล่า 3-4 แก้ว (500 มล.) ก่อนบริจาค 30 นาที</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Utensils className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>รับประทานอาหารมื้อหลักก่อนมาบริจาคโลหิต</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>นอนหลับพักผ่อนให้เพียงพอ อย่างน้อย 6 ชั่วโมง</span>
              </li>
            </ul>
          </div>

          {/* Card 2: DON'T */}
          <div className="bg-white border border-red-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 border-b border-red-100 pb-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-black text-sm">
                ✕
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-red-600 block">AVOID</span>
                <h3 className="text-base font-black text-red-900">สิ่งที่ควรหลีกเลี่ยง (DON'T)</h3>
              </div>
            </div>

            <ul className="space-y-3 text-xs font-bold text-[#282828]">
              <li className="flex items-start gap-2.5">
                <Wine className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>งดเครื่องดื่มแอลกอฮอล์ อย่างน้อย 24 ชั่วโมง</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Cigarette className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>งดสูบบุหรี่ ก่อนและหลังบริจาคอย่างน้อย 1 ชั่วโมง</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>งดอาหารไขมันสูง เช่น ข้าวขาหมู แกงกะทิ ขนมหวาน</span>
              </li>
            </ul>
          </div>

          {/* Card 3: ELIGIBILITY */}
          <div className="bg-white border border-[#D5C7B8] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#D5C7B8] pb-3">
              <div className="h-10 w-10 rounded-xl bg-[#E9E1D9] text-[#7A1020] flex items-center justify-center font-black text-sm">
                👤
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#666666] block">REQUIREMENTS</span>
                <h3 className="text-base font-black text-[#282828]">คุณสมบัติผู้บริจาค</h3>
              </div>
            </div>

            <ul className="space-y-3 text-xs font-bold text-[#282828]">
              <li className="flex items-start gap-2.5">
                <UserCheck className="h-4 w-4 text-[#8E0015] shrink-0 mt-0.5" />
                <span>อายุระหว่าง 17 - 70 ปีบริบูรณ์ (ครั้งแรกไม่เกิน 60 ปี)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <UserCheck className="h-4 w-4 text-[#8E0015] shrink-0 mt-0.5" />
                <span>น้ำหนักตัวตั้งแต่ 45 กิโลกรัม ขึ้นไป</span>
              </li>
              <li className="flex items-start gap-2.5">
                <UserCheck className="h-4 w-4 text-[#8E0015] shrink-0 mt-0.5" />
                <span>สุขภาพแข็งแรง ไม่มีโรคประจำตัวร้ายแรง</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
}
