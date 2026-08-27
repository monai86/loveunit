import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, 
  ArrowRight, 
  Heart, 
  GlassWater, 
  Utensils, 
  Moon, 
  Wine, 
  ShieldCheck, 
  Gift,
  ChevronRight,
  Activity
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PreparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--burgundy-600)]">หน้าแรก</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--burgundy-700)]">คู่มือและการเตรียมตัวก่อนบริจาคโลหิต</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--rose-100)] px-3 py-1 text-xs font-black text-[var(--burgundy-700)] border border-[var(--line)]">
              <ShieldCheck className="h-4 w-4" />
              <span>มาตรฐานศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย 2567</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
              คู่มือและการเตรียมตัวก่อนบริจาคโลหิต
            </h1>
            <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
              การเตรียมร่างกายให้พร้อมเป็นสิ่งสำคัญ เพื่อให้การบริจาคโลหิตเป็นไปอย่างราบรื่น ปลอดภัยต่อตัวผู้บริจาค และได้โลหิตที่มีคุณภาพสูงสุดแก่ผู้ป่วย
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/screening"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4 py-2.5 text-xs shadow-md transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>ทำแบบประเมินตนเอง (Screening)</span>
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--burgundy-600)] hover:bg-[var(--burgundy-700)] text-white font-extrabold px-5 py-2.5 text-xs shadow-md transition-all"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>ลงทะเบียนออนไลน์</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Guidelines & Standards (8 Cols) */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Section 1: Physical Criteria */}
          <div className="editorial-card p-6 sm:p-8 space-y-5">
            <div className="space-y-1 border-b border-[var(--line)] pb-3">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                DONOR QUALIFICATIONS
              </span>
              <h2 className="text-xl font-black text-[var(--ink)]">
                1. คุณสมบัติและเกณฑ์มาตรฐานของผู้บริจาคโลหิต
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-xs font-bold text-gray-500 block">อายุ (Age)</span>
                <p className="text-sm font-black text-[var(--ink)]">17 - 70 ปีบริบูรณ์</p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  • อายุ 17 ปี ต้องมีหนังสือยินยอมจากผู้ปกครอง<br />
                  • ผู้บริจาคครั้งแรกอายุไม่เกิน 60 ปี
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-xs font-bold text-gray-500 block">น้ำหนักตัว (Body Weight)</span>
                <p className="text-sm font-black text-[var(--ink)]">ตั้งแต่ 45 กิโลกรัมขึ้นไป</p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  • 45 - 49 กก. บริจาคได้ 350 mL<br />
                  • 50 กก. ขึ้นไป บริจาคได้ 450 mL
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-xs font-bold text-gray-500 block">ความเข้มข้นโลหิต (Hemoglobin)</span>
                <p className="text-sm font-black text-[var(--ink)]">หญิง ≥ 12.5 / ชาย ≥ 13.0 g/dL</p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  • ตรวจด้วยวิธีหยดเลือดในสารละลายทองแดง (CuSO4) หรือเครื่องตรวจ Hb อัตโนมัติ
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-xs font-bold text-gray-500 block">สัญญาณชีพ (Vital Signs)</span>
                <p className="text-sm font-black text-[var(--ink)]">ความดัน 90-160 / 50-100 mmHg</p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  • ชีพจร 50 - 100 ครั้ง/นาที จังหวะสม่ำเสมอ<br />
                  • อุณหภูมิร่างกายไม่เกิน 37.5 °C
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Before Donation Checklist */}
          <div className="editorial-card p-6 sm:p-8 space-y-5">
            <div className="space-y-1 border-b border-[var(--line)] pb-3">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                BEFORE DONATION CHECKLIST
              </span>
              <h2 className="text-xl font-black text-[var(--ink)]">
                2. การปฏิบัติตัวก่อนเดินทางมาบริจาค (24 ชม. ล่วงหน้า)
              </h2>
            </div>

            <ul className="space-y-3.5 text-xs font-bold text-editorial-ink">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <Moon className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-emerald-950 block">นอนหลับพักผ่อนให้เพียงพอ</span>
                  <span className="text-[11px] text-emerald-800 font-normal leading-relaxed">
                    ควรนอนหลับติดต่อกันอย่างน้อย 5-6 ชั่วโมงในคืนก่อนวันบริจาค เพื่อให้ระบบไหลเวียนโลหิตทำงานอย่างมีเสถียรภาพ
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <GlassWater className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-blue-950 block">ดื่มน้ำเปล่า 3-4 แก้ว (500-600 มล.) ก่อนบริจาค 20-30 นาที</span>
                  <span className="text-[11px] text-blue-800 font-normal leading-relaxed">
                    ช่วยเพิ่มปริมาณน้ำในกระแสเลือด (Plasma Volume) ป้องกันภาวะความดันโลหิตตกและอาการวิงเวียนศีรษะ
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <Utensils className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-amber-950 block">รับประทานอาหารมื้อหลัก แต่หลีกเลี่ยงอาหารไขมันสูง</span>
                  <span className="text-[11px] text-amber-800 font-normal leading-relaxed">
                    ห้ามอดอาหารก่อนมาบริจาค แต่ควรงดอาหารที่มีไขมันสูง เช่น ข้าวมันไก่ ข้าวขาหมู แกงกะทิ ของทอด ภายใน 3-6 ชั่วโมงก่อนบริจาค เพื่อป้องกันพลาสมาขุ่นขาว
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100">
                <Wine className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-red-950 block">งดแอลกอฮอล์ 24 ชม. และงดสูบบุหรี่ 1 ชม. ก่อนและหลังบริจาค</span>
                  <span className="text-[11px] text-red-800 font-normal leading-relaxed">
                    แอลกอฮอล์ทำให้ร่างกายขาดน้ำ ส่วนบุหรี่ทำให้ระดับก๊าซคาร์บอนมอนอกไซด์ในเลือดสูงขึ้นและทำให้หลอดเลือดหดตัว
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Section 3: Post-Donation Care */}
          <div className="editorial-card p-6 sm:p-8 space-y-5">
            <div className="space-y-1 border-b border-[var(--line)] pb-3">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                POST-DONATION CARE
              </span>
              <h2 className="text-xl font-black text-[var(--ink)]">
                3. การปฏิบัติตัวหลังการบริจาคโลหิต
              </h2>
            </div>

            <div className="space-y-3 text-xs font-bold text-editorial-ink">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>นอนพักบนเตียงบริจาคอย่างน้อย 5-10 นาทีหลังถอดเข็ม และนั่งพักสังเกตอาการพร้อมดื่มน้ำหวาน/ของว่าง 15-20 นาที</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>กดผ้าก๊อซบริเวณรอยเจาะให้แน่นอย่างน้อย 5-10 นาที และไม่ควรนวดแขน เพื่อป้องกันรอยช้ำเลือด (Hematoma)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>ดื่มน้ำมากๆ ตลอดทั้งวัน และรับประทานยาเสริมธาตุเหล็ก (Ferrous Fumarate) จนหมดตามแพทย์/พยาบาลแนะนำ</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>หลีกเลี่ยงการยกของหนัก การออกกำลังกายหักโหม และการทำงานในที่สูงหรือใช้เครื่องจักรกลหนัก ในวันบริจาค</span>
              </div>
            </div>
          </div>

          {/* Souvenir & Donor Care Banner */}
          <div className="p-5 rounded-2xl bg-[var(--rose-100)] border border-[var(--line)] text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-[var(--burgundy-700)]">
              <Gift className="h-5 w-5 text-[var(--burgundy-700)] shrink-0" />
              <span>สิทธิประโยชน์และของที่ระลึกสุดพิเศษประจำโครงการ</span>
            </div>
            <p className="text-[var(--ink)] leading-relaxed font-medium">
              ผู้เข้าร่วมกิจกรรมบริจาคโลหิตทุกท่านจะได้รับของที่ระลึก Limited Edition โครงการ MUMT ครั้งที่ 9 พร้อมอาหารว่างและเครื่องดื่มบำรุงสุขภาพหลังบริจาคโลหิต
            </p>
          </div>

        </div>

        {/* Right Column: Infographics & Interactive Links (4 Cols) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Quick Screening Card */}
          <div className="editorial-card p-6 text-center space-y-4 bg-gradient-to-b from-[var(--rose-100)]/60 to-white">
            <div className="h-12 w-12 rounded-2xl bg-[var(--burgundy-700)] text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[var(--ink)]">ไม่แน่ใจว่าตนเองพร้อมไหม?</h3>
              <p className="text-xs text-[var(--muted)] font-medium leading-relaxed">
                ทำแบบประเมินสุขภาพตนเอง 24 ข้อตามเกณฑ์สภากาชาดไทย ทราบผลทันทีใน 2 นาที
              </p>
            </div>
            <Link
              href="/screening"
              className="editorial-btn-primary py-3 px-6 text-xs w-full justify-center"
            >
              <span>เริ่มทำแบบประเมินสุขภาพ</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Educational Infographic Preview */}
          <div className="editorial-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[var(--ink)]">สื่อความรู้ที่เกี่ยวข้อง</span>
              <Link href="/poster" className="text-[11px] font-bold text-[var(--burgundy-700)] hover:underline">
                ดูทั้งหมด →
              </Link>
            </div>

            <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[var(--line)] bg-white">
              <Image
                src="/images/education/benefits-5-reasons.png"
                alt="5 ข้อดีของการบริจาคโลหิต"
                fill
                sizes="(min-width: 768px) 30vw, 90vw"
                className="object-contain"
              />
            </div>
            <p className="text-[11px] text-[var(--muted)] text-center font-medium">
              5 ข้อดีของการบริจาคโลหิต (ศูนย์บริการโลหิตแห่งชาติ)
            </p>
          </div>

          {/* Knowledge Hub Link */}
          <div className="editorial-card p-5 space-y-3 bg-white">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--burgundy-700)]" />
              <h4 className="text-xs font-black text-[var(--ink)]">ศึกษามาตรฐานการตรวจแล็บ</h4>
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed font-medium">
              เรียนรู้เกี่ยวกับการตรวจคัดกรองโรคติดเชื้อทางโลหิตแบบ ID-NAT, ระบบหมู่เลือด ABO และการแยกส่วนประกอบโลหิต
            </p>
            <Link
              href="/knowledge"
              className="text-xs font-black text-[var(--burgundy-700)] hover:underline inline-flex items-center gap-1"
            >
              <span>อ่านบทความวิชาการ →</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
