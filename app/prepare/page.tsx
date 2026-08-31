'use client';

import React, { useState } from 'react';
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
  Activity,
  ZoomIn,
  X,
  Download
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PreparePage() {
  const { isTh } = useLanguage();
  const [activeModalImg, setActiveModalImg] = useState<{ src: string; title: string } | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--burgundy-600)]">{isTh ? 'หน้าแรก' : 'Home'}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--burgundy-700)]">
            {isTh ? 'คู่มือและการเตรียมตัวก่อนบริจาคโลหิต' : 'Donor Preparation Guide'}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-red-950/20 border border-white/20">
              <ShieldCheck className="h-4 w-4 text-white" />
              <span>{isTh ? 'มาตรฐานศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย 2567' : 'National Blood Centre Standards, Thai Red Cross Society (2024)'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
              {isTh ? 'คู่มือและการเตรียมตัวก่อนบริจาคโลหิต' : 'Donor Preparation & Guidelines'}
            </h1>
            <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
              {isTh
                ? 'การเตรียมร่างกายให้พร้อมเป็นสิ่งสำคัญ เพื่อให้การบริจาคโลหิตเป็นไปอย่างราบรื่น ปลอดภัยต่อตัวผู้บริจาค และได้โลหิตที่มีคุณภาพสูงสุดแก่ผู้ป่วย'
                : 'Proper donor preparation ensures a smooth, safe donation process while providing the highest quality blood products for patients.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/screening"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4 py-2.5 text-xs shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isTh ? 'ทำแบบประเมินตนเอง (Screening)' : 'Self-Screening Quiz'}</span>
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] hover:from-[#C51D2C] hover:via-[#911426] hover:to-[#6E0F1D] text-white font-extrabold px-5 py-2.5 text-xs shadow-md shadow-red-950/20 active:scale-95 transition-all cursor-pointer border border-white/20"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>{isTh ? 'ลงทะเบียนออนไลน์' : 'Register Online'}</span>
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
                {isTh ? '1. คุณสมบัติและเกณฑ์มาตรฐานของผู้บริจาคโลหิต' : '1. Donor Eligibility Criteria & Physical Requirements'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-xs font-bold text-gray-500 block">{isTh ? 'อายุ' : 'Age'}</span>
                <p className="text-sm font-black text-[var(--ink)]">{isTh ? '17 - 70 ปีบริบูรณ์' : '17 - 70 years old'}</p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  {isTh ? '• อายุ 17 ปี ต้องมีหนังสือยินยอมจากผู้ปกครอง' : '• Age 17 requires written parental consent'}<br />
                  {isTh ? '• ผู้บริจาคครั้งแรกอายุไม่เกิน 60 ปี' : '• First-time donors must be under 60'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-xs font-bold text-gray-500 block">{isTh ? 'น้ำหนักตัว' : 'Body Weight'}</span>
                <p className="text-sm font-black text-[var(--ink)]">{isTh ? 'ตั้งแต่ 45 กิโลกรัมขึ้นไป' : 'At least 45 kg (99 lbs)'}</p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  {isTh ? '• 45 - 49 กก. บริจาคได้ 350 mL' : '• 45 - 49 kg: 350 mL donation'}<br />
                  {isTh ? '• 50 กก. ขึ้นไป บริจาคได้ 450 mL' : '• 50+ kg: 450 mL donation'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-xs font-bold text-gray-500 block">{isTh ? 'ความเข้มข้นโลหิต' : 'Hemoglobin Level'}</span>
                <p className="text-sm font-black text-[var(--ink)]">{isTh ? 'หญิง ≥ 12.5 / ชาย ≥ 13.0 g/dL' : 'Female ≥ 12.5 / Male ≥ 13.0 g/dL'}</p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  {isTh ? '• ตรวจด้วยวิธีหยดเลือดในสารละลายทองแดง (CuSO4) หรือเครื่องตรวจ Hb อัตโนมัติ' : '• Screened via copper sulfate gravity or automated Hb spectrophotometry'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="text-xs font-bold text-gray-500 block">{isTh ? 'สัญญาณชีพ' : 'Vital Signs'}</span>
                <p className="text-sm font-black text-[var(--ink)]">{isTh ? 'ความดัน 90-160 / 50-100 mmHg' : 'BP: 90-160 / 50-100 mmHg'}</p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  {isTh ? '• ชีพจร 50 - 100 ครั้ง/นาที จังหวะสม่ำเสมอ' : '• Pulse: 50 - 100 bpm, regular'}<br />
                  {isTh ? '• อุณหภูมิร่างกายไม่เกิน 37.5 °C' : '• Body Temperature: ≤ 37.5 °C'}
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
                {isTh ? '2. การปฏิบัติตัวก่อนเดินทางมาบริจาค (24 ชม. ล่วงหน้า)' : '2. Preparation 24 Hours Before Donation'}
              </h2>
            </div>

            <ul className="space-y-3.5 text-xs font-bold text-editorial-ink">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <Moon className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-emerald-950 block">{isTh ? 'นอนหลับพักผ่อนให้เพียงพอ' : 'Get Adequate Sleep'}</span>
                  <span className="text-[11px] text-emerald-800 font-normal leading-relaxed">
                    {isTh
                      ? 'ควรนอนหลับติดต่อกันอย่างน้อย 5-6 ชั่วโมงในคืนก่อนวันบริจาค เพื่อให้ระบบไหลเวียนโลหิตทำงานอย่างมีเสถียรภาพ'
                      : 'Sleep continuously for at least 5-6 hours the night before to maintain cardiovascular stability.'}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <GlassWater className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-blue-950 block">{isTh ? 'ดื่มน้ำเปล่า 3-4 แก้ว (500-600 มล.) ก่อนบริจาค 20-30 นาที' : 'Drink 3-4 Glasses of Water (500-600 mL)'}</span>
                  <span className="text-[11px] text-blue-800 font-normal leading-relaxed">
                    {isTh
                      ? 'ช่วยเพิ่มปริมาณน้ำในกระแสเลือด (Plasma Volume) ป้องกันภาวะความดันโลหิตตกและอาการวิงเวียนศีรษะ'
                      : 'Expands plasma volume, helps prevent vasovagal reactions, and makes veins easier to access.'}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <Utensils className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-amber-950 block">{isTh ? 'รับประทานอาหารมื้อหลัก แต่หลีกเลี่ยงอาหารไขมันสูง' : 'Eat Regular Meals, Avoid High-Fat Foods'}</span>
                  <span className="text-[11px] text-amber-800 font-normal leading-relaxed">
                    {isTh
                      ? 'ห้ามอดอาหารก่อนมาบริจาค แต่ควรงดอาหารที่มีไขมันสูง เช่น ข้าวมันไก่ ข้าวขาหมู แกงกะทิ ของทอด ภายใน 3-6 ชั่วโมงก่อนบริจาค เพื่อป้องกันพลาสมาขุ่นขาว'
                      : 'Do not fast. Avoid greasy and high-fat foods (fried meals, rich curries) within 3-6 hours before donation to prevent lipemic plasma.'}
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100">
                <Wine className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-red-950 block">{isTh ? 'งดแอลกอฮอล์ 24 ชม. และงดสูบบุหรี่ 1 ชม. ก่อนและหลังบริจาค' : 'Avoid Alcohol (24h) & Smoking (1h)'}</span>
                  <span className="text-[11px] text-red-800 font-normal leading-relaxed">
                    {isTh
                      ? 'แอลกอฮอล์ทำให้ร่างกายขาดน้ำ ส่วนบุหรี่ทำให้ระดับก๊าซคาร์บอนมอนอกไซด์ในเลือดสูงขึ้นและทำให้หลอดเลือดหดตัว'
                      : 'Alcohol causes dehydration, while smoking increases carbon monoxide and constricts blood vessels.'}
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
                {isTh ? '3. การปฏิบัติตัวหลังการบริจาคโลหิต' : '3. Post-Donation Self-Care'}
              </h2>
            </div>

            <div className="space-y-3 text-xs font-bold text-editorial-ink">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>{isTh ? 'นอนพักบนเตียงบริจาคอย่างน้อย 5-10 นาทีหลังถอดเข็ม และนั่งพักสังเกตอาการพร้อมดื่มน้ำหวาน/ของว่าง 15-20 นาที' : 'Rest on the donation bed for 5-10 mins, then sit in the observation area with refreshments for 15-20 mins.'}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>{isTh ? 'กดผ้าก๊อซบริเวณรอยเจาะให้แน่นอย่างน้อย 5-10 นาที และไม่ควรนวดแขน เพื่อป้องกันรอยช้ำเลือด (Hematoma)' : 'Press gauze firmly over venipuncture site for 5-10 mins. Do not massage the arm to prevent hematoma.'}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>{isTh ? 'ดื่มน้ำมากๆ ตลอดทั้งวัน และรับประทานยาเสริมธาตุเหล็ก (Ferrous Fumarate) จนหมดตามแพทย์/พยาบาลแนะนำ' : 'Drink plenty of water throughout the day and take the complete course of iron supplements (Ferrous Fumarate).'}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>{isTh ? 'หลีกเลี่ยงการยกของหนัก การออกกำลังกายหักโหม และการทำงานในที่สูงหรือใช้เครื่องจักรกลหนัก ในวันบริจาค' : 'Avoid heavy lifting, strenuous workouts, and working at heights or with heavy machinery for the rest of the day.'}</span>
              </div>
            </div>
          </div>

          {/* Souvenir & Donor Care Banner */}
          <div className="p-5 rounded-2xl bg-[var(--rose-100)] border border-[var(--line)] text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-[var(--burgundy-700)]">
              <Gift className="h-5 w-5 text-[var(--burgundy-700)] shrink-0" />
              <span>{isTh ? 'สิทธิประโยชน์และของที่ระลึกสุดพิเศษประจำโครงการ' : 'Donor Gifts & Refreshments'}</span>
            </div>
            <p className="text-[var(--ink)] leading-relaxed font-medium">
              {isTh
                ? 'ผู้เข้าร่วมกิจกรรมบริจาคโลหิตทุกท่านจะได้รับของที่ระลึก Limited Edition โครงการ MUMT ครั้งที่ 9 พร้อมอาหารว่างและเครื่องดื่มบำรุงสุขภาพหลังบริจาคโลหิต'
                : 'All participants will receive a 9th MUMT Limited Edition souvenir, along with recovery snacks and nutritious beverages after donation.'}
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
              <h3 className="text-base font-black text-[var(--ink)]">
                {isTh ? 'ไม่แน่ใจว่าตนเองพร้อมไหม?' : 'Not sure if you are eligible?'}
              </h3>
              <p className="text-xs text-[var(--muted)] font-medium leading-relaxed">
                {isTh ? 'ทำแบบประเมินสุขภาพตนเอง 24 ข้อตามเกณฑ์สภากาชาดไทย ทราบผลทันทีใน 2 นาที' : 'Take our 24-question self-screening based on Thai Red Cross standards. Get instant results in 2 mins.'}
              </p>
            </div>
            <Link
              href="/screening"
              className="editorial-btn-primary py-3 px-6 text-xs w-full justify-center cursor-pointer"
            >
              <span>{isTh ? 'เริ่มทำแบบประเมินสุขภาพ' : 'Start Self-Screening'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Official Donor Eligibility Infographic */}
          <div className="editorial-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[var(--ink)]">{isTh ? 'คุณสมบัติเบื้องต้น' : 'Donor Eligibility'}</span>
              <span className="text-[10px] font-bold text-[var(--burgundy-700)] bg-[var(--rose-100)] px-2 py-0.5 rounded-full">
                {isTh ? 'สภากาชาดไทย' : 'Official'}
              </span>
            </div>

            <div 
              onClick={() => setActiveModalImg({ src: '/images/education/donor-eligibility-infographic.jpg', title: isTh ? 'คุณสมบัติของผู้บริจาคเลือด' : 'Basic Donor Eligibility Criteria' })}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-[var(--line)] bg-white cursor-zoom-in"
            >
              <Image
                src="/images/education/donor-eligibility-infographic.jpg"
                alt="คุณสมบัติของผู้บริจาคเลือด"
                fill
                sizes="(min-width: 768px) 30vw, 90vw"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-[var(--ink)] p-2 rounded-full shadow-md">
                  <ZoomIn className="h-4 w-4 text-[var(--burgundy-700)]" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--muted)] text-center font-medium">
              {isTh ? 'เกณฑ์คุณสมบัติเบื้องต้น: อายุ 17-70 ปี, น้ำหนัก ≥45 กก.' : 'Basic Criteria: Age 17-70, Weight ≥45kg'}
            </p>
          </div>

          {/* Educational Infographic Preview */}
          <div className="editorial-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[var(--ink)]">{isTh ? 'สื่อความรู้ที่เกี่ยวข้อง' : 'Related Infographics'}</span>
              <Link href="/poster" className="text-[11px] font-bold text-[var(--burgundy-700)] hover:underline">
                {isTh ? 'ดูทั้งหมด →' : 'View All →'}
              </Link>
            </div>

            <div 
              onClick={() => setActiveModalImg({ src: '/images/education/benefits-5-reasons.png', title: isTh ? '5 ข้อดีของการบริจาคโลหิต' : '5 Health Benefits of Blood Donation' })}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden border border-[var(--line)] bg-white cursor-zoom-in"
            >
              <Image
                src="/images/education/benefits-5-reasons.png"
                alt="5 ข้อดีของการบริจาคโลหิต"
                fill
                sizes="(min-width: 768px) 30vw, 90vw"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-[var(--ink)] p-2 rounded-full shadow-md">
                  <ZoomIn className="h-4 w-4 text-[var(--burgundy-700)]" />
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--muted)] text-center font-medium">
              {isTh ? '5 ข้อดีของการบริจาคโลหิต (ศูนย์บริการโลหิตแห่งชาติ)' : '5 Health Benefits of Donating Blood'}
            </p>
          </div>

          {/* Knowledge Hub Link */}
          <div className="editorial-card p-5 space-y-3 bg-white">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--burgundy-700)]" />
              <h4 className="text-xs font-black text-[var(--ink)]">{isTh ? 'ศึกษามาตรฐานการตรวจแล็บ' : 'Laboratory Blood Testing'}</h4>
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed font-medium">
              {isTh ? 'เรียนรู้เกี่ยวกับการตรวจคัดกรองโรคติดเชื้อทางโลหิตแบบ ID-NAT, ระบบหมู่เลือด ABO และการแยกส่วนประกอบโลหิต' : 'Learn about ID-NAT viral screening, ABO/Rh blood grouping, and blood component separation.'}
            </p>
            <Link
              href="/knowledge"
              className="text-xs font-black text-[var(--burgundy-700)] hover:underline inline-flex items-center gap-1"
            >
              <span>{isTh ? 'อ่านบทความวิชาการ →' : 'Read Lab Knowledge →'}</span>
            </Link>
          </div>

        </div>

      </div>

      {/* Image Modal Preview */}
      {activeModalImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModalImg(null)}
        >
          <div 
            className="relative max-h-[92vh] max-w-4xl w-full overflow-hidden rounded-2xl bg-white p-3 shadow-2xl space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pt-1 border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{activeModalImg.title}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={activeModalImg.src}
                  download="mumt-infographic.jpg"
                  className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>ดาวน์โหลด</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalImg(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="relative h-[78vh] w-full bg-gray-50 rounded-xl overflow-hidden">
              <Image
                src={activeModalImg.src}
                alt={activeModalImg.title}
                fill
                className="object-contain"
                sizes="95vw"
                priority
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
