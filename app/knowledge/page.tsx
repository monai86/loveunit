'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Microscope, 
  ShieldCheck, 
  Activity, 
  Heart, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Droplets,
  Share2,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type TabType = 'LAB_TESTING' | 'COMPONENTS' | 'ABO_RH_SYSTEM' | 'BENEFITS';

export default function KnowledgePage() {
  const { isTh } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('LAB_TESTING');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<'O' | 'A' | 'B' | 'AB'>('O');
  const [copied, setCopied] = useState(false);

  const bloodGroupStats = [
    { 
      group: 'O', 
      percent: 38, 
      role: isTh ? 'ผู้ให้เม็ดเลือดแดงสากล (Universal RBC Donor)' : 'Universal RBC Donor', 
      desc: isTh ? 'ให้เม็ดเลือดแดงแก่ทุกกรุ๊ปได้ แต่รับเม็ดเลือดแดงได้เฉพาะกรุ๊ป O เท่านั้น' : 'Can donate red blood cells to all ABO groups; can only receive group O RBCs.' 
    },
    { 
      group: 'B', 
      percent: 34, 
      role: isTh ? 'หมู่เลือดที่พบมากเป็นอันดับสองในไทย' : 'Second most common group in Thailand', 
      desc: isTh ? 'ให้เม็ดเลือดแดงแก่กรุ๊ป B และ AB / รับเม็ดเลือดแดงจากกรุ๊ป B และ O' : 'Can donate RBCs to B and AB; receives RBCs from B and O.' 
    },
    { 
      group: 'A', 
      percent: 24, 
      role: isTh ? 'หมู่เลือดสำคัญ' : 'Essential blood group', 
      desc: isTh ? 'ให้เม็ดเลือดแดงแก่กรุ๊ป A และ AB / รับเม็ดเลือดแดงจากกรุ๊ป A และ O' : 'Can donate RBCs to A and AB; receives RBCs from A and O.' 
    },
    { 
      group: 'AB', 
      percent: 8, 
      role: isTh ? 'ผู้รับเม็ดเลือดแดงสากล & ผู้ให้พลาสมาสากล' : 'Universal RBC Recipient & Universal Plasma Donor', 
      desc: isTh ? 'รับเม็ดเลือดแดงได้ทุกกรุ๊ป / เป็นผู้ให้พลาสมาสากล (Universal Plasma Donor)' : 'Can receive RBCs from all groups; plasma can be safely given to any ABO patient.' 
    },
  ];

  const compatibilityMap = {
    O: {
      rbcGiveTo: ['O', 'A', 'B', 'AB'],
      rbcReceiveFrom: ['O'],
      plasmaGiveTo: ['O'],
      plasmaReceiveFrom: ['O', 'A', 'B', 'AB'],
    },
    A: {
      rbcGiveTo: ['A', 'AB'],
      rbcReceiveFrom: ['A', 'O'],
      plasmaGiveTo: ['A', 'O'],
      plasmaReceiveFrom: ['A', 'AB'],
    },
    B: {
      rbcGiveTo: ['B', 'AB'],
      rbcReceiveFrom: ['B', 'O'],
      plasmaGiveTo: ['B', 'O'],
      plasmaReceiveFrom: ['B', 'AB'],
    },
    AB: {
      rbcGiveTo: ['AB'],
      rbcReceiveFrom: ['O', 'A', 'B', 'AB'],
      plasmaGiveTo: ['O', 'A', 'B', 'AB'],
      plasmaReceiveFrom: ['AB'],
    },
  };

  const currentCompat = compatibilityMap[selectedBloodGroup];

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: isTh ? 'ศูนย์ความรู้และมาตรฐานการตรวจคัดกรองโลหิต MUMT 2026' : 'MUMT 2026 Blood Knowledge & Lab Standards',
          text: isTh 
            ? 'ศึกษามาตรฐานการตรวจคัดกรองทางห้องปฏิบัติการ และความรู้การบริจาคโลหิตตามมาตรฐานสภากาชาดไทย'
            : 'Explore blood screening standards, ABO/Rh grouping, and clinical transfusion guidelines.',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 space-y-12">
      
      {/* Breadcrumb & Header */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--burgundy-600)]">{isTh ? 'หน้าแรก' : 'Home'}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--burgundy-700)]">{isTh ? 'ศูนย์ความรู้และมาตรฐานห้องปฏิบัติการ' : 'Blood Knowledge & Lab Hub'}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-red-950/20 border border-white/20">
              <Microscope className="h-4 w-4 text-white" />
              <span>{isTh ? 'มาตรฐานวิชาการเทคนิคการแพทย์และศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (2567-2568)' : 'Medical Technology & Thai Red Cross Society Standards (2024-2025)'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
              {isTh ? 'ศูนย์ความรู้ & การตรวจคัดกรองทางห้องปฏิบัติการ' : 'Blood Science & Laboratory Screening Hub'}
            </h1>
            <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium">
              {isTh 
                ? 'เจาะลึกมาตรฐานความปลอดภัยระดับสากลของโลหิตบริจาค การทดสอบทางอณูชีววิทยา (ID-NAT), การตรวจแอนติบอดี 3-Cell, ระบบ ABO & Rh (Rh+ vs Rh-) และการแยกส่วนประกอบโลหิต'
                : 'In-depth guide to international blood safety standards: Nucleic Acid Testing (ID-NAT), 3-cell antibody screening, ABO & Rh compatibility, and blood component separation.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[var(--line)] px-4 py-2.5 text-xs font-extrabold text-[var(--ink)] shadow-xs hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)] transition-all cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-[var(--burgundy-600)]" />}
              <span>{copied ? (isTh ? 'คัดลอกแล้ว' : 'Copied!') : (isTh ? 'แชร์หน้านี้' : 'Share Page')}</span>
            </button>
            <Link
              href="/screening"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] hover:from-[#C51D2C] hover:via-[#911426] hover:to-[#6E0F1D] px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-red-950/20 active:scale-95 transition-all cursor-pointer border border-white/20"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isTh ? 'ทำแบบประเมินตนเอง' : 'Self-Screening'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 rounded-2xl bg-[var(--rose-100)]/60 border border-[var(--line)]">
        {[
          { id: 'LAB_TESTING', label: isTh ? '1. มาตรฐานการตรวจแล็บ (Chapter 4 2568)' : '1. Lab Testing Standards (ID-NAT)', icon: Microscope },
          { id: 'ABO_RH_SYSTEM', label: isTh ? '2. กรุ๊ปเลือด ABO & Rh (Rh+ vs Rh-)' : '2. ABO & Rh Blood Grouping', icon: Droplets },
          { id: 'COMPONENTS', label: isTh ? '3. การแยกส่วนประกอบโลหิต (Components)' : '3. Blood Components Separation', icon: Layers },
          { id: 'BENEFITS', label: isTh ? '4. ข้อดี 5 ประการของการบริจาค' : '4. 5 Health Benefits of Donation', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[var(--burgundy-700)] shadow-md ring-1 ring-black/5'
                  : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--burgundy-700)]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LAB TESTING STANDARDS (CHAPTER 4) */}
      {activeTab === 'LAB_TESTING' && (
        <section className="space-y-8 animate-in fade-in duration-200">
          
          <div className="editorial-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-[var(--line)] pb-4">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                CENTRALIZED DONOR BLOOD SCREENING — WHO & THAI RED CROSS STANDARDS
              </span>
              <h2 className="text-2xl font-black text-[var(--ink)]">
                {isTh ? 'ระบบการตรวจคัดกรองโลหิตบริจาคแบบรวมศูนย์ระดับชาติ' : 'National Centralized Donor Blood Screening System'}
              </h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {isTh
                  ? 'อ้างอิง: หนังสือมาตรฐานธนาคารเลือดและงานบริการโลหิต 2567 และ บทที่ 4 การทดสอบโลหิตบริจาค (ฉบับปรับปรุง 21 มีนาคม 2568)'
                  : 'References: Standards for Blood Banks and Transfusion Services (2024) & Chapter 4: Donor Testing Guidelines (Revised 2025)'}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-[var(--ink)] font-medium">
              {isTh
                ? 'ประเทศไทยดำเนินการตรวจคัดกรองโลหิตบริจาคทุกยูนิตแบบรวมศูนย์ (Centralized Testing) ภายใต้การกำกับของศูนย์บริการโลหิตแห่งชาติและภาคบริการโลหิตแห่งชาติ 12 แห่งทั่วประเทศ โดยปฏิบัติตามมาตรฐานสากลขององค์การอนามัยโลก (WHO Guidance) เพื่อให้มั่นใจว่าโลหิตทุกถุงปลอดภัยสูงสุดก่อนจ่ายให้แก่ผู้ป่วย:'
                : 'Thailand enforces 100% centralized donor blood testing under the National Blood Centre and 12 Regional Blood Centres, strictly complying with WHO international blood safety standards to guarantee zero-risk blood products for patients:'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Step 1: ABO/Rh */}
              <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-100 text-[var(--burgundy-700)] font-black text-sm font-mono">
                    01
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--ink)]">{isTh ? 'การตรวจหมู่โลหิต' : 'Blood Grouping'}</h3>
                    <span className="text-[11px] font-bold text-[var(--burgundy-700)]">ABO & Rh(D) Grouping</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-[var(--muted)] font-medium leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Forward (Front) Grouping:</strong> {isTh ? 'ตรวจหาแอนติเจน A, B บนผิวเม็ดเลือดแดง' : 'Tests for A and B antigens on red cell surface'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Reverse (Back) Grouping:</strong> {isTh ? 'ตรวจหาแอนติบอดี Anti-A, Anti-B ในซีรัม/พลาสมา' : 'Tests for Anti-A and Anti-B antibodies in serum/plasma'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Weak D Testing:</strong> {isTh ? 'ทำการทดสอบยืนยันด้วยวิธี IAT ในกรณีผลตรวจ Rh(D) เบื้องต้นให้ผลลบ เพื่อป้องกันการให้เลือดแก่ผู้รับ Rh-Negative' : 'Confirmed via IAT if initial Rh(D) is negative to protect Rh-negative recipients'}</span>
                  </li>
                </ul>
              </div>

              {/* Step 2: Antibody Screen */}
              <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 font-black text-sm font-mono">
                    02
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--ink)]">{isTh ? 'การตรวจคัดกรองแอนติบอดี' : 'Antibody Screening'}</h3>
                    <span className="text-[11px] font-bold text-amber-800">Unexpected Red Cell Ab</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-[var(--muted)] font-medium leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isTh ? 'ตรวจหาแอนติบอดีแปลกปลอม (Atypical Antibodies) ที่อาจทำลายเม็ดเลือดแดงของผู้ป่วย' : 'Screens for unexpected atypical red cell antibodies that cause hemolysis'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isTh ? 'ใช้ 3-cell Screening Panel (Cells I, II, III) ครอบคลุมระบบหมู่เลือดสำคัญ (Rh, Kell, Duffy, Kidd, MNS)' : 'Uses 3-Cell Screening Panel covering key antigen systems (Rh, Kell, Duffy, Kidd, MNS)'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isTh ? 'ใช้วิธี Indirect Antiglobulin Test (IAT) หรือ Gel Card Technology' : 'Performed using Indirect Antiglobulin Test (IAT) and Gel Card microcolumn systems'}</span>
                  </li>
                </ul>
              </div>

              {/* Step 3: TTI Screening */}
              <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-900 font-black text-sm font-mono">
                    03
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--ink)]">{isTh ? 'การตรวจโรคติดเชื้อ (TTI)' : 'Infection Screening (TTI)'}</h3>
                    <span className="text-[11px] font-bold text-blue-800">Dual Serology + ID-NAT</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-[var(--muted)] font-medium leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Serology:</strong> {isTh ? '4th Gen HIV Ag/Ab combo, HBsAg, Anti-HCV, Syphilis TT-1/TT-2/NTT' : '4th Gen HIV Ag/Ab combo, HBsAg, Anti-HCV, Syphilis 2-tier'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ID-NAT:</strong> {isTh ? 'ตรวจสารพันธุกรรมเชื้อเดี่ยว (HIV RNA, HCV RNA, HBV DNA) ด้วย Real-time PCR/TMA' : 'Single donor Nucleic Acid Testing (HIV RNA, HCV RNA, HBV DNA) via Real-time PCR'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{isTh ? 'ลดระยะเวลา Window Period สู่ระดับต่ำสุด ปลอดภัยสูงสุด' : 'Minimizes diagnostic window periods to absolute lowest thresholds'}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Testing Flowchart Algorithm Breakdown (Chapter 4) */}
          <div className="editorial-card p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[var(--ink)] flex items-center gap-2">
                <Activity className="h-5 w-5 text-[var(--burgundy-700)]" />
                <span>{isTh ? 'ขั้นตอนและอัลกอริทึมการตรวจซ้ำ (Testing Algorithm & Duplicate Repeat)' : 'Testing Algorithm & Duplicate Repeat Workflow'}</span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {isTh ? 'ขั้นตอนการปฏิบัติงานตามมาตรฐานบทที่ 4 สำหรับการตรวจคัดกรองและการจัดการผลบวก' : 'Standard operating procedure for repeat testing and managing initially reactive units.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Algorithm 1: Serology */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="font-black text-[var(--ink)] text-sm border-b border-gray-200 pb-2">
                  {isTh ? '1. อัลกอริทึมการตรวจทางซีโรโลยี (Serology Testing Flow)' : '1. Serology Testing Flow'}
                </h4>
                <div className="space-y-2 leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-white border border-gray-100">
                    <p className="font-bold text-gray-800">• Initial Screening Test (A):</p>
                    <p className="text-gray-600">{isTh ? 'ตรวจตัวอย่าง clotted blood ด้วยวิธี EIA หรือ CLIA' : 'Screen clotted blood tube using EIA or chemiluminescence (CLIA)'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <p className="font-bold">{isTh ? '✓ ผลตรวจเป็นลบ (Non-reactive, A-):' : '✓ Non-reactive (A-):'}</p>
                    <p>{isTh ? 'สามารถจ่ายโลหิตและส่วนประกอบโลหิตให้ผู้ป่วยได้ และรับบริจาคในอนาคตได้ตามปกติ' : 'Blood units are safely released for clinical use and future donations are welcomed.'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                    <p className="font-bold">{isTh ? '⚠️ ผลตรวจเป็นบวก (Reactive, A+):' : '⚠️ Initially Reactive (A+):'}</p>
                    <p>{isTh ? 'ต้องทำการตรวจซ้ำในหลอดเดิมแบบ 2 ซ้ำ (Duplicate repeat test):' : 'Perform immediate duplicate repeat testing on the same sample tube:'}</p>
                    <p className="pt-1 text-[11px]">
                      {isTh ? '- หากลบทั้งสองซ้ำ (A+, A-, A-) → ปล่อยโลหิตได้' : '- If both repeats are negative (A+, A-, A-) → Blood unit is released'}<br />
                      {isTh ? '- หากบวกหนึ่งหรือสองซ้ำ → ทิ้งถุงโลหิตทันที และส่งตรวจยืนยัน (Confirmatory Test)' : '- If 1 or 2 repeats are positive → Discard unit and send for Confirmatory Testing'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Algorithm 2: ID-NAT */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="font-black text-[var(--ink)] text-sm border-b border-gray-200 pb-2">
                  {isTh ? '2. อัลกอริทึมการตรวจสารพันธุกรรม (ID-NAT Testing Flow)' : '2. ID-NAT Nucleic Acid Testing Flow'}
                </h4>
                <div className="space-y-2 leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-white border border-gray-100">
                    <p className="font-bold text-gray-800">• EDTA Blood Tube Test:</p>
                    <p className="text-gray-600">{isTh ? 'ตรวจตัวอย่างแบบ Single Donor ID-NAT สำหรับ HIV RNA, HCV RNA, HBV DNA' : 'Single donor automated molecular assay for HIV RNA, HCV RNA, HBV DNA'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <p className="font-bold">{isTh ? '✓ Non-reactive:' : '✓ Non-reactive:'}</p>
                    <p>{isTh ? 'ปลอดภัยจากเชื้อไวรัสในระดับพันธุกรรม' : 'Genomically clear of viral pathogens'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-900">
                    <p className="font-bold">{isTh ? '⚠️ Reactive:' : '⚠️ Reactive:'}</p>
                    <p>{isTh ? 'สั่งกักกัน/ทิ้งถุงโลหิต และทำ Duplicate repeat test:' : 'Quarantine/discard blood bag and perform discriminatory repeat tests:'}</p>
                    <p className="pt-1 text-[11px]">
                      {isTh ? '- ตรวจซ้ำให้ผลบวก → รายงานผลเชื้อไวรัสจำเพาะ และเข้าสู่กระบวนการ Look-back ตรวจสอบย้อนหลัง' : '- Confirmed positive → Report specific virus and trigger traceability Look-back protocol'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* ID-NAT Window Period Comparative Table */}
            <div className="space-y-3 pt-4 border-t border-[var(--line)]">
              <h4 className="text-sm font-black text-[var(--ink)]">
                {isTh ? 'การเปรียบเทียบระยะฟักตัว (Window Period) ระหว่าง Serology และ ID-NAT' : 'Diagnostic Window Period Comparison: Serology vs. ID-NAT'}
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[var(--line)] rounded-xl overflow-hidden">
                  <thead className="bg-[var(--rose-100)] text-[var(--burgundy-700)] font-black text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 border-b border-[var(--line)]">{isTh ? 'เชื้อโรคที่ตรวจคัดกรอง' : 'Screened Pathogen'}</th>
                      <th className="p-3.5 border-b border-[var(--line)]">{isTh ? 'วิธีตรวจทางน้ำเหลือง (Serology)' : 'Serological Assay'}</th>
                      <th className="p-3.5 border-b border-[var(--line)]">{isTh ? 'วิธีตรวจสารพันธุกรรม (ID-NAT)' : 'Nucleic Acid Assay (ID-NAT)'}</th>
                      <th className="p-3.5 border-b border-[var(--line)]">{isTh ? 'Window Period ด้วย ID-NAT' : 'Window Period with ID-NAT'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)] font-medium text-[var(--ink)]">
                    <tr className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">{isTh ? 'ไวรัสเอชไอวี (HIV-1 / HIV-2)' : 'Human Immunodeficiency Virus (HIV)'}</td>
                      <td className="p-3.5">Anti-HIV & HIV-1 p24 Antigen</td>
                      <td className="p-3.5 font-mono text-[var(--burgundy-700)] font-bold">HIV RNA</td>
                      <td className="p-3.5 text-emerald-700 font-bold">{isTh ? '≈ 4.5 – 5.6 วัน' : '≈ 4.5 – 5.6 Days'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">{isTh ? 'ไวรัสตับอักเสบ ซี (HCV)' : 'Hepatitis C Virus (HCV)'}</td>
                      <td className="p-3.5">Anti-HCV (Antibody)</td>
                      <td className="p-3.5 font-mono text-[var(--burgundy-700)] font-bold">HCV RNA</td>
                      <td className="p-3.5 text-emerald-700 font-bold">{isTh ? '≈ 3.1 – 4.9 วัน' : '≈ 3.1 – 4.9 Days'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">{isTh ? 'ไวรัสตับอักเสบ บี (HBV)' : 'Hepatitis B Virus (HBV)'}</td>
                      <td className="p-3.5">HBsAg (Surface Antigen)</td>
                      <td className="p-3.5 font-mono text-[var(--burgundy-700)] font-bold">HBV DNA</td>
                      <td className="p-3.5 text-emerald-700 font-bold">{isTh ? '≈ 15 – 20 วัน' : '≈ 15 – 20 Days'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">{isTh ? 'เชื้อซิฟิลิส (Treponema pallidum)' : 'Syphilis (Treponema pallidum)'}</td>
                      <td className="p-3.5">TT-1 (TPHA/TPPA/CMIA) + TT-2 + NTT (VDRL/RPR)</td>
                      <td className="p-3.5 text-gray-400">—</td>
                      <td className="p-3.5 text-gray-600">{isTh ? 'ตรวจยืนยันแบบ 2-Tier Serology' : '2-Tier Serological Confirmation'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0" />
                <span>{isTh ? 'ระบบควบคุมคุณภาพและการตรวจสอบย้อนหลัง (Quality Assurance & Look-back)' : 'Quality Assurance & Traceable Look-back Systems'}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                {isTh
                  ? 'ห้องปฏิบัติการมีระบบบาร์โค้ดสองมิติควบคุมสายถุงโลหิต (Segment) ทุกยูนิต มีการทดสอบความถูกต้องของน้ำยา (Lot-to-lot verification) และมีกระบวนการ Look-back แจ้งเตือนผู้ป่วยและผู้บริจาคทันทีหากพบความผิดปกติ'
                  : 'Centralized blood facilities operate 2D barcode segment tracking, lot-to-lot reagent validation, and real-time Look-back notification systems.'}
              </p>
            </div>

          </div>

        </section>
      )}

      {/* TAB 2: ABO & RH BLOOD GROUP SYSTEM */}
      {activeTab === 'ABO_RH_SYSTEM' && (
        <section className="space-y-8 animate-in fade-in duration-200">
          
          {/* SECTION 1: ABO BLOOD COMPATIBILITY */}
          <div className="editorial-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-[var(--line)] pb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-100 text-[var(--burgundy-700)] px-3 py-0.5 text-xs font-black">
                <span>{isTh ? 'ความรู้เรื่องกรุ๊ปเลือด ตอนที่ 1' : 'Blood Group Knowledge · Part 1'}</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">
                {isTh ? 'ระบบหมู่เลือด ABO : เลือดกรุ๊ปไหน ให้ใครได้บ้าง? (Interactive Matrix)' : 'ABO Blood Group System: Who Can Give & Receive? (Interactive Matrix)'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {isTh
                  ? 'ตารางความเข้ากันได้ของเม็ดเลือดแดงและพลาสมา พร้อมสถิติในประชากรไทย อ้างอิงศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย'
                  : 'RBC and plasma compatibility matrix with Thai population distribution metrics (Thai Red Cross Society).'}
              </p>
            </div>

            {/* Infographic Post 1 Image Display & Quick Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 flex flex-col space-y-2">
                <div className="relative flex-1 min-h-[380px] w-full rounded-2xl overflow-hidden border border-[var(--line)] bg-white/70 shadow-xs flex items-center justify-center p-2">
                  <Image
                    src="/images/education/blood-groups-part1.png"
                    alt="ABO Blood Grouping Matrix"
                    fill
                    sizes="(min-width: 1024px) 380px, 90vw"
                    className="object-contain"
                  />
                </div>
                <p className="text-[11px] text-center font-bold text-[var(--muted)]">
                  {isTh ? 'ภาพ: อินโฟกราฟิกความรู้เรื่องกรุ๊ปเลือด ตอนที่ 1 (ระบบหมู่เลือด ABO)' : 'Infographic: ABO Blood Compatibility Matrix'}
                </p>
              </div>

              {/* Thai Blood Group Distribution Stats & Key Clinical Rules */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--ink)] mb-2.5">
                    {isTh ? 'สัดส่วนหมู่เลือดในประชากรไทย (Thai Population Distribution)' : 'Blood Group Distribution in Thai Population'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {bloodGroupStats.map((item) => (
                      <div key={item.group} className="p-3 rounded-xl bg-gray-50/80 border border-gray-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black font-mono text-[var(--burgundy-700)]">
                            {isTh ? `กรุ๊ป ${item.group}` : `Group ${item.group}`}
                          </span>
                          <span className="text-xs font-black font-mono text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            {item.percent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full bg-[var(--burgundy-600)]" style={{ width: `${item.percent * 2.5}%` }} />
                        </div>
                        <p className="text-[11px] text-[var(--muted)] leading-snug">{item.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Rules & Universal Donors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs space-y-1 shadow-2xs">
                    <span className="font-bold text-[var(--burgundy-700)] flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-[var(--burgundy-600)] shrink-0" />
                      <span>{isTh ? 'ผู้ให้เม็ดเลือดแดงสากล: กรุ๊ป O' : 'Universal RBC Donor: Group O'}</span>
                    </span>
                    <p className="text-[11px] text-[var(--ink)] leading-relaxed">
                      {isTh
                        ? 'ไม่มีแอนติเจน A และ B บนผิวเม็ดเลือดแดง จึงให้แก่ผู้ป่วยได้ทุกหมู่เลือดในภาวะฉุกเฉิน'
                        : 'Lacks A and B red cell antigens, allowing emergency transfusion to all ABO recipients.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1 shadow-2xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                      <span>{isTh ? 'ผู้ให้พลาสมาสากล: กรุ๊ป AB' : 'Universal Plasma Donor: Group AB'}</span>
                    </span>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      {isTh
                        ? 'ในพลาสมาไม่มี Anti-A และ Anti-B จึงสามารถให้พลาสมาแก่ผู้ป่วยได้ทุกกรุ๊ปอย่างปลอดภัย'
                        : 'Contains neither Anti-A nor Anti-B antibodies, making AB plasma universal for all patients.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Group Selectors */}
            <div className="space-y-3 pt-4 border-t border-[var(--line)]">
              <span className="text-xs font-black text-[var(--ink)] block">
                {isTh ? 'เลือกหมู่เลือดเพื่อดูผลจำลองการให้-รับเลือด:' : 'Select a blood group to simulate compatibility:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['O', 'A', 'B', 'AB'] as const).map((grp) => {
                  const isSelected = selectedBloodGroup === grp;
                  const stat = bloodGroupStats.find((s) => s.group === grp)!;
                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedBloodGroup(grp)}
                      className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs ring-2 ring-[var(--burgundy-700)]'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl font-black font-mono">{isTh ? `กรุ๊ป ${grp}` : `Group ${grp}`}</span>
                      <span className="text-[11px] font-bold text-[var(--muted)]">{isTh ? `ประชากรไทย ${stat.percent}%` : `${stat.percent}% of Thai population`}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Compatibility Result */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[var(--line)] shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-black text-[var(--ink)]">
                    {isTh ? 'ผลการวิเคราะห์ความเข้ากันได้ของ ' : 'Compatibility Analysis for '}
                    <span className="text-[var(--burgundy-700)]">{isTh ? `หมู่เลือด ${selectedBloodGroup}` : `Blood Group ${selectedBloodGroup}`}</span>
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {bloodGroupStats.find((s) => s.group === selectedBloodGroup)?.desc}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] text-xs font-extrabold border border-[var(--line)] self-start sm:self-auto">
                  {bloodGroupStats.find((s) => s.group === selectedBloodGroup)?.role}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                {/* RBC GIVING & RECEIVING */}
                <div className="p-4 sm:p-5 rounded-xl bg-red-50/60 border border-red-200 space-y-3">
                  <h4 className="text-xs sm:text-sm font-black text-red-950 flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-red-600" />
                    <span>{isTh ? 'เม็ดเลือดแดง (Red Blood Cells)' : 'Red Blood Cells (RBCs)'}</span>
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-red-100 space-y-1">
                      <span className="text-gray-500 font-bold block text-[11px]">{isTh ? 'สามารถให้เม็ดเลือดแดงแก่:' : 'Can donate RBCs to:'}</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {currentCompat.rbcGiveTo.map((g) => (
                          <span key={g} className="px-2.5 py-0.5 rounded-md bg-red-600 text-white font-mono font-black text-xs">
                            {isTh ? `กรุ๊ป ${g}` : `Group ${g}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-red-100 space-y-1">
                      <span className="text-gray-500 font-bold block text-[11px]">{isTh ? 'สามารถรับเม็ดเลือดแดงจาก:' : 'Can receive RBCs from:'}</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {currentCompat.rbcReceiveFrom.map((g) => (
                          <span key={g} className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-black text-xs">
                            {isTh ? `กรุ๊ป ${g}` : `Group ${g}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PLASMA GIVING & RECEIVING */}
                <div className="p-4 sm:p-5 rounded-xl bg-yellow-50/60 border border-yellow-200 space-y-3">
                  <h4 className="text-xs sm:text-sm font-black text-yellow-950 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-yellow-600" />
                    <span>{isTh ? 'พลาสมา (Plasma)' : 'Plasma'}</span>
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-yellow-100 space-y-1">
                      <span className="text-gray-500 font-bold block text-[11px]">{isTh ? 'สามารถให้พลาสมาแก่:' : 'Can donate Plasma to:'}</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {currentCompat.plasmaGiveTo.map((g) => (
                          <span key={g} className="px-2.5 py-0.5 rounded-md bg-yellow-600 text-white font-mono font-black text-xs">
                            {isTh ? `กรุ๊ป ${g}` : `Group ${g}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-yellow-100 space-y-1">
                      <span className="text-gray-500 font-bold block text-[11px]">{isTh ? 'สามารถรับพลาสมาจาก:' : 'Can receive Plasma from:'}</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {currentCompat.plasmaReceiveFrom.map((g) => (
                          <span key={g} className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-black text-xs">
                            {isTh ? `กรุ๊ป ${g}` : `Group ${g}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECTION 2: RH POSITIVE VS RH NEGATIVE COMPARISON */}
          <div className="editorial-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-[var(--line)] pb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-900 px-3 py-0.5 text-xs font-black">
                <span>{isTh ? 'ความรู้เรื่องกรุ๊ปเลือด ตอนที่ 2' : 'Blood Group Knowledge · Part 2'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
                {isTh ? 'Rh+ vs Rh- : ทำความเข้าใจหมู่เลือดและหมู่เลือดหายาก (Rare Blood)' : 'Rh+ vs. Rh-: Understanding Common vs. Rare Blood Types'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {isTh ? 'อ้างอิง: ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย และ บทที่ 4 การทดสอบโลหิตบริจาค' : 'References: National Blood Centre (Thai Red Cross Society) and Chapter 4 Donor Testing Guidelines'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Infographic Post 2 Image Display */}
              <div className="lg:col-span-5 flex flex-col space-y-2">
                <div className="relative flex-1 min-h-[380px] w-full rounded-2xl overflow-hidden border border-[var(--line)] bg-white/70 shadow-xs flex items-center justify-center p-2">
                  <Image
                    src="/images/education/blood-groups-part2.png"
                    alt="Rh+ vs Rh- Comparison"
                    fill
                    sizes="(min-width: 1024px) 380px, 90vw"
                    className="object-contain"
                    priority
                  />
                </div>
                <p className="text-[11px] text-center font-bold text-[var(--muted)]">
                  {isTh ? 'ภาพ: อินโฟกราฟิกความรู้เรื่องกรุ๊ปเลือด ตอนที่ 2 (Rh+ vs Rh-)' : 'Infographic: Rh-Positive vs. Rh-Negative'}
                </p>
              </div>

              {/* Detailed Breakdown Table & Facts */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* Rh Positive Card */}
                  <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 space-y-1.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold font-mono text-xs">
                        Rh Positive (Rh+)
                      </span>
                      <span className="font-bold text-red-900">{isTh ? '99.7% ในคนไทย' : '99.7% of Thais'}</span>
                    </div>
                    <div className="space-y-1 pt-0.5 text-[var(--ink)] font-medium">
                      <p>• <strong>{isTh ? 'แอนติเจน:' : 'Antigen:'}</strong> {isTh ? 'มีแอนติเจน D บนผิวเซลล์' : 'Possesses D antigen on RBC surface'}</p>
                      <p>• <strong>{isTh ? 'การรับเลือด:' : 'Can Receive:'}</strong> {isTh ? 'รับได้ทั้ง Rh+ และ Rh-' : 'Can receive both Rh+ and Rh-'}</p>
                      <p>• <strong>{isTh ? 'การให้เลือด:' : 'Can Donate To:'}</strong> {isTh ? 'ให้ได้เฉพาะ Rh+' : 'Can donate to Rh+ only'}</p>
                      <p className="text-[11px] text-red-800 pt-0.5">
                        {isTh ? 'เป็นหมู่เลือดหลักของคนไทย ต้องการใช้อย่างต่อเนื่อง' : 'Standard blood type in Thailand with ongoing daily hospital demand.'}
                      </p>
                    </div>
                  </div>

                  {/* Rh Negative Card */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold font-mono text-xs">
                        Rh Negative (Rh-)
                      </span>
                      <span className="font-bold text-blue-900">{isTh ? '0.3% ในคนไทย' : '0.3% of Thais'}</span>
                    </div>
                    <div className="space-y-1 pt-0.5 text-[var(--ink)] font-medium">
                      <p>• <strong>{isTh ? 'แอนติเจน:' : 'Antigen:'}</strong> <strong>{isTh ? 'ไม่มีแอนติเจน D' : 'Lacks D antigen'}</strong></p>
                      <p>• <strong>{isTh ? 'การรับเลือด:' : 'Can Receive:'}</strong> <strong className="text-red-700 underline">{isTh ? 'รับจาก Rh- เท่านั้น!' : 'Must receive from Rh- only!'}</strong></p>
                      <p>• <strong>{isTh ? 'การให้เลือด:' : 'Can Donate To:'}</strong> {isTh ? 'ให้แก่ Rh+ และ Rh- ได้' : 'Can donate to both Rh+ and Rh-'}</p>
                      <p className="text-[11px] text-blue-800 pt-0.5">
                        {isTh ? 'พบเพียง 3 ใน 1,000 คน “หมู่เลือดหายาก”' : 'Only 3 in 1,000 people ("Rare Blood Group")'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Important Clinical Insights Alert */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>{isTh ? 'ความสำคัญทางการแพทย์: ทำไม Rh- ต้องรับเฉพาะ Rh- เท่านั้น?' : 'Clinical Crux: Why Must Rh- Patients Receive Only Rh- Blood?'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900 font-medium">
                    {isTh
                      ? 'หากผู้ป่วยที่มีหมู่เลือด Rh-Negative ได้รับเม็ดเลือดแดง Rh-Positive ร่างกายจะถูกกระตุ้นให้สร้างภูมิคุ้มกัน Anti-D ซึ่งจะทำให้เกิดปฏิกิริยาเม็ดเลือดแดงแตกอย่างรุนแรง (Hemolytic Transfusion Reaction) ในการรับเลือดครั้งต่อไป หรือก่อให้เกิดภาวะทารกบวมน้ำและเม็ดเลือดแดงแตกในครรภ์ (Hemolytic Disease of the Fetus and Newborn: HDFN) ในหญิงตั้งครรภ์'
                      : 'If an Rh-Negative individual receives Rh-Positive red cells, their immune system develops Anti-D antibodies. Subsequent exposures trigger life-threatening acute Hemolytic Transfusion Reactions or severe Hemolytic Disease of the Fetus and Newborn (HDFN) during pregnancy.'}
                  </p>
                </div>

                {/* Weak D Note */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-1">
                  <span className="font-bold text-[var(--ink)] block text-[11px]">🔬 {isTh ? 'การตรวจ Weak D ในห้องปฏิบัติการ:' : 'Laboratory Weak D Testing Protocol:'}</span>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                    {isTh
                      ? 'ผู้บริจาคที่มีแอนติเจน D อ่อนแรง (Weak D) ทางห้องปฏิบัติการจะจัดให้เป็น Rh-Positive เสมอ เพื่อความปลอดภัยของผู้รับโลหิต Rh-Negative ที่อาจถูกกระตุ้นให้สร้าง Anti-D ได้'
                      : 'Donors with Weak D expression are officially designated as Rh-Positive to prevent accidental anti-D sensitization in Rh-Negative transfusion recipients.'}
                  </p>
                </div>

              </div>

            </div>
          </div>

        </section>
      )}

      {/* TAB 3: BLOOD COMPONENTS SEPARATION */}
      {activeTab === 'COMPONENTS' && (
        <section className="space-y-8 animate-in fade-in duration-200">
          
          <div className="editorial-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-[var(--line)] pb-4">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                BLOOD COMPONENT THERAPY
              </span>
              <h2 className="text-2xl font-black text-[var(--ink)]">
                {isTh ? 'เลือด 1 ถุง นำไปปั่นแยกส่วนประกอบ และช่วยได้ถึง 3 ชีวิต' : '1 Unit of Donated Blood Yields 3 Components to Save 3 Lives'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {isTh
                  ? 'การให้เลือดในปัจจุบันใช้หลักการ Component Therapy คือให้เฉพาะส่วนประกอบที่ผู้ป่วยต้องการเท่านั้น เพื่อประสิทธิภาพสูงสุดและลดความเสี่ยงจากการได้รับสารที่ไม่จำเป็น'
                  : 'Modern clinical transfusion relies on Component Therapy — administering only the specific component the patient needs to maximize recovery and prevent fluid overload.'}
              </p>
            </div>

            {/* Infographic Visual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-sm">
                  <Image
                    src="/images/education/blood-components-1.png"
                    alt="Blood Components Separation"
                    fill
                    sizes="(min-width: 768px) 45vw, 95vw"
                    className="object-contain"
                  />
                </div>
                <div className="text-xs text-center text-[var(--muted)] font-bold">
                  {isTh ? 'ภาพที่ 1: การปั่นแยกส่วนประกอบโลหิต (พลาสมา 55%, เกล็ดเลือด ~1%, เม็ดเลือดแดง 44%)' : 'Figure 1: Blood Fractionation (Plasma 55%, Platelets ~1%, RBCs 44%)'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-sm">
                  <Image
                    src="/images/education/blood-components-2.png"
                    alt="Patients Benefiting from Blood Components"
                    fill
                    sizes="(min-width: 768px) 45vw, 95vw"
                    className="object-contain"
                  />
                </div>
                <div className="text-xs text-center text-[var(--muted)] font-bold">
                  {isTh ? 'ภาพที่ 2: กลุ่มผู้ป่วยที่ได้รับประโยชน์จากแต่ละส่วนประกอบโลหิต' : 'Figure 2: Clinical Indications & Benefiting Patient Groups'}
                </div>
              </div>
            </div>

            {/* 3 Component Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* Component 1: RBC */}
              <div className="p-5 rounded-2xl bg-red-50/50 border border-red-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black">
                    {isTh ? '44% ของปริมาตร' : '44% of Blood Volume'}
                  </span>
                  <span className="text-xs font-mono font-bold text-red-800">{isTh ? 'เก็บที่ 2-6 °C' : 'Stored at 2-6 °C'}</span>
                </div>
                <h3 className="text-base font-black text-red-950">{isTh ? 'เม็ดเลือดแดง (Red Blood Cells)' : 'Packed Red Cells (PRC)'}</h3>
                <p className="text-xs text-red-900 leading-relaxed font-medium">
                  {isTh
                    ? 'มีฮีโมโกลบิน ทำหน้าที่ลำเลียงออกซิเจนจากปอดไปเลี้ยงเนื้อเยื่อทั่วร่างกาย มีอายุการเก็บรักษา 35-42 วัน'
                    : 'Packed with hemoglobin to transport oxygen from lungs to vital organs. Shelf life: 35-42 days.'}
                </p>
                <div className="border-t border-red-200 pt-2 text-xs font-bold text-red-950 space-y-1">
                  <p className="text-[11px] text-red-700">🩸 {isTh ? 'ใช้รักษา:' : 'Clinical Indications:'}</p>
                  <p>• {isTh ? 'ผู้ป่วยโรคธาลัสซีเมีย' : 'Thalassemia patients'}</p>
                  <p>• {isTh ? 'ผู้ป่วยสูญเสียเลือดจากอุบัติเหตุ/ผ่าตัด' : 'Severe hemorrhage from trauma/surgery'}</p>
                  <p>• {isTh ? 'ผู้ป่วยภาวะโลหิตจางรุนแรง' : 'Severe chronic anemia'}</p>
                </div>
              </div>

              {/* Component 2: Platelets */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-[11px] font-black">
                    {isTh ? '~1% ของปริมาตร' : '~1% of Blood Volume'}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800">{isTh ? 'เก็บที่ 20-24 °C (เขย่าตลอดเวลา)' : 'Stored at 20-24 °C (Agitated)'}</span>
                </div>
                <h3 className="text-base font-black text-amber-950">{isTh ? 'เกล็ดเลือด (Platelets)' : 'Platelet Concentrates'}</h3>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {isTh
                    ? 'ช่วยในการแข็งตัวของเลือดและอุดรอยฉีกขาดของหลอดเลือด มีอายุการเก็บรักษาเพียง 5 วัน'
                    : 'Facilitates hemostasis and vessel plug formation. Shelf life: 5 days with continuous agitation.'}
                </p>
                <div className="border-t border-amber-200 pt-2 text-xs font-bold text-amber-950 space-y-1">
                  <p className="text-[11px] text-amber-700">🩸 {isTh ? 'ใช้รักษา:' : 'Clinical Indications:'}</p>
                  <p>• {isTh ? 'ผู้ป่วยไข้เลือดออกที่มีเกล็ดเลือดต่ำ' : 'Dengue patients with severe thrombocytopenia'}</p>
                  <p>• {isTh ? 'โรคมะเร็งเม็ดเลือดขาวที่ได้รับเคมีบำบัด' : 'Leukemia patients receiving chemotherapy'}</p>
                  <p>• {isTh ? 'ผู้ป่วยปลูกถ่ายไขกระดูก' : 'Bone marrow transplant recipients'}</p>
                </div>
              </div>

              {/* Component 3: Plasma */}
              <div className="p-5 rounded-2xl bg-yellow-50/50 border border-yellow-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-yellow-600 text-white text-[11px] font-black">
                    {isTh ? '55% ของปริมาตร' : '55% of Blood Volume'}
                  </span>
                  <span className="text-xs font-mono font-bold text-yellow-800">{isTh ? 'เก็บแช่แข็ง ≤ -18 °C' : 'Frozen at ≤ -18 °C'}</span>
                </div>
                <h3 className="text-base font-black text-yellow-950">{isTh ? 'พลาสมา (Fresh Frozen Plasma)' : 'Fresh Frozen Plasma (FFP)'}</h3>
                <p className="text-xs text-yellow-900 leading-relaxed font-medium">
                  {isTh
                    ? 'ของเหลวสีเหลืองใส อุดมด้วยโปรตีน Albumin, Immunoglobulin และ Clotting Factors มีอายุเก็บ 1 ปี'
                    : 'Amber fluid rich in Albumin, Immunoglobulins, and coagulation factors. Shelf life: 1 year.'}
                </p>
                <div className="border-t border-yellow-200 pt-2 text-xs font-bold text-yellow-950 space-y-1">
                  <p className="text-[11px] text-yellow-700">🩸 {isTh ? 'ใช้รักษา:' : 'Clinical Indications:'}</p>
                  <p>• {isTh ? 'ผู้ป่วยโรคตับแข็งที่มีเลือดออกง่าย' : 'Liver cirrhosis with coagulopathy'}</p>
                  <p>• {isTh ? 'โรคฮีโมฟีเลีย (Hemophilia)' : 'Hemophilia & massive transfusion protocol'}</p>
                  <p>• {isTh ? 'แผลไฟไหม้ น้ำร้อนลวกขั้นรุนแรง' : 'Severe extensive burn injuries'}</p>
                </div>
              </div>

            </div>
          </div>

        </section>
      )}

      {/* TAB 4: 5 HEALTH BENEFITS OF BLOOD DONATION */}
      {activeTab === 'BENEFITS' && (
        <section className="space-y-8 animate-in fade-in duration-200">
          
          <div className="editorial-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-[var(--line)] pb-4">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                BENEFITS OF BLOOD DONATION
              </span>
              <h2 className="text-2xl font-black text-[var(--ink)]">
                {isTh ? '5 ข้อดีของการบริจาคโลหิต ที่ส่งผลดีต่อสุขภาพทั้งกายและใจ' : '5 Health Benefits of Regular Blood Donation for Body & Mind'}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {isTh ? 'อ้างอิงข้อมูลทางการแพทย์ ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย' : 'Medical reference: National Blood Centre, Thai Red Cross Society'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-sm">
                <Image
                  src="/images/education/benefits-5-reasons.png"
                  alt="5 Health Benefits of Blood Donation"
                  fill
                  sizes="(min-width: 768px) 45vw, 95vw"
                  className="object-contain"
                />
              </div>

              <div className="space-y-4">
                {[
                  {
                    num: '1',
                    title: isTh ? 'ร่างกายแข็งแรงและกระตุ้นการสร้างเม็ดเลือดใหม่' : 'Stimulates New Red Blood Cell Production',
                    desc: isTh 
                      ? 'การบริจาคกระตุ้นให้ไขกระดูก (Bone Marrow) ผลิตเซลล์เม็ดเลือดแดงใหม่ออกมาทดแทน ทำให้ระบบการทำงานของร่างกายสดชื่นและมีประสิทธิภาพ'
                      : 'Donation signals bone marrow to generate fresh, healthy red blood cells, enhancing oxygen delivery throughout your body.',
                  },
                  {
                    num: '2',
                    title: isTh ? 'ผิวพรรณสดใสเปล่งปลั่ง' : 'Promotes Healthy, Glowing Skin',
                    desc: isTh 
                      ? 'ช่วยกระตุ้นระบบการไหลเวียนโลหิตทั่วร่างกายให้ทำงานได้ดียิ่งขึ้น ส่งผลดีต่อสุขภาพผิวและระบบการทำงานของอวัยวะภายใน'
                      : 'Stimulates systemic microcirculation and tissue perfusion, supporting dermal vitality and cellular renewal.',
                  },
                  {
                    num: '3',
                    title: isTh ? 'ลดความเสี่ยงภาวะหลอดเลือดแดงตีบ' : 'Balances Iron Stores & Supports Heart Health',
                    desc: isTh 
                      ? 'ช่วยลดความหนืดข้นของเลือด (Blood Viscosity) และช่วยควบคุมระดับธาตุเหล็กส่วนเกินในร่างกายให้อยู่ในระดับสมดุล'
                      : 'Reduces blood viscosity and prevents excessive oxidative iron accumulation in cardiovascular tissues.',
                  },
                  {
                    num: '4',
                    title: isTh ? 'กระตุ้นให้เซลล์ไขกระดูกทำงานสม่ำเสมอ' : 'Maintains Active Bone Marrow Function',
                    desc: isTh 
                      ? 'การบริจาคโลหิตเป็นประจำทุก 3 เดือนช่วยฝึกฝนให้ไขกระดูกสร้างเม็ดเลือดอย่างมีประสิทธิภาพตลอดเวลา'
                      : 'Regular 3-month donations keep hematopoietic stem cells active and resilient over a lifetime.',
                  },
                  {
                    num: '5',
                    title: isTh ? 'ทราบข้อมูลสุขภาพเบื้องต้นฟรี' : 'Free Comprehensive Mini-Health Screening',
                    desc: isTh 
                      ? 'ได้รับการตรวจวัดความดันโลหิต ชีพจร ความเข้มข้นโลหิต (Hb) หมู่เลือดระบบ ABO/Rh และตรวจคัดกรองโรคติดเชื้อทางโลหิตด้วยวิธีมาตรฐานสากล'
                      : 'Complimentary check of blood pressure, pulse, hemoglobin, ABO/Rh grouping, and high-accuracy infectious disease screening.',
                  },
                ].map((b) => (
                  <div key={b.num} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white border border-[var(--line)]">
                    <span className="h-7 w-7 rounded-full bg-[var(--burgundy-700)] text-white font-mono font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {b.num}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black text-[var(--ink)]">{b.title}</h4>
                      <p className="text-xs text-[var(--muted)] leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="p-5 rounded-2xl bg-[var(--rose-100)]/60 border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-black text-[var(--burgundy-700)]">
                  {isTh ? 'พร้อมที่จะส่งต่อความรักและต่อชีวิตผู้ป่วยแล้วหรือยัง?' : 'Ready to save lives and make a difference?'}
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  {isTh ? 'ร่วมลงทะเบียนจองรอบเวลากิจกรรม MUMT Blood Donation 2026 ครั้งที่ 9 ได้แล้ววันนี้' : 'Book your preferred arrival time slot for the 9th MUMT Blood Donation today.'}
                </p>
              </div>
              <Link href="/register" className="editorial-btn-primary py-3 px-6 text-xs flex items-center gap-2 shrink-0 cursor-pointer">
                <Heart className="h-4 w-4 fill-white" />
                <span>{isTh ? 'ลงทะเบียนออนไลน์' : 'Register Online'}</span>
              </Link>
            </div>

          </div>

        </section>
      )}

    </div>
  );
}
