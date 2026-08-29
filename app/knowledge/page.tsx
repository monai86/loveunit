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
  const { isTh, isEn } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('LAB_TESTING');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<'O' | 'A' | 'B' | 'AB'>('O');
  const [copied, setCopied] = useState(false);

  const bloodGroupStats = [
    { group: 'O', percent: 38, role: isTh ? 'ผู้ให้เม็ดเลือดแดงสากล (Universal RBC Donor)' : 'Universal RBC Donor', desc: isTh ? 'ให้เม็ดเลือดแดงแก่ทุกกรุ๊ปได้ แต่รับเม็ดเลือดแดงได้เฉพาะกรุ๊ป O เท่านั้น' : 'Can donate red blood cells to any ABO group; receives only group O RBCs.' },
    { group: 'B', percent: 34, role: isTh ? 'หมู่เลือดที่พบมากเป็นอันดับสองในไทย' : 'Second most common group in Thailand', desc: isTh ? 'ให้เม็ดเลือดแดงแก่กรุ๊ป B และ AB / รับเม็ดเลือดแดงจากกรุ๊ป B และ O' : 'Can donate RBCs to B and AB; receives RBCs from B and O.' },
    { group: 'A', percent: 24, role: isTh ? 'หมู่เลือดสำคัญ' : 'Essential blood group', desc: isTh ? 'ให้เม็ดเลือดแดงแก่กรุ๊ป A และ AB / รับเม็ดเลือดแดงจากกรุ๊ป A และ O' : 'Can donate RBCs to A and AB; receives RBCs from A and O.' },
    { group: 'AB', percent: 8, role: isTh ? 'ผู้รับเม็ดเลือดแดงสากล & ผู้ให้พลาสมาสากล' : 'Universal RBC Recipient & Universal Plasma Donor', desc: isTh ? 'รับเม็ดเลือดแดงได้ทุกกรุ๊ป / เป็นผู้ให้พลาสมาสากล (Universal Plasma Donor)' : 'Can receive any ABO RBC; plasma can be safely given to any ABO patient.' },
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
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--rose-100)] px-3 py-1 text-xs font-black text-[var(--burgundy-700)] border border-[var(--line)]">
              <Microscope className="h-4 w-4 text-[var(--burgundy-700)]" />
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
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--burgundy-600)] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[var(--burgundy-700)] transition-all cursor-pointer"
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
                ระบบการตรวจคัดกรองโลหิตบริจาคแบบรวมศูนย์ระดับชาติ
              </h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                อ้างอิง: หนังสือมาตรฐานธนาคารเลือดและงานบริการโลหิต 2567 และ <em>บทที่ 4 การทดสอบโลหิตบริจาค (ฉบับปรับปรุง 21 มีนาคม 2568)</em>
              </p>
            </div>

            <p className="text-sm leading-relaxed text-[var(--ink)] font-medium">
              ประเทศไทยดำเนินการตรวจคัดกรองโลหิตบริจาคทุกยูนิตแบบรวมศูนย์ (Centralized Testing) ภายใต้การกำกับของศูนย์บริการโลหิตแห่งชาติและภาคบริการโลหิตแห่งชาติ 12 แห่งทั่วประเทศ โดยปฏิบัติตามมาตรฐานสากลขององค์การอนามัยโลก (WHO Guidance) เพื่อให้มั่นใจว่าโลหิตทุกถุงปลอดภัยสูงสุดก่อนจ่ายให้แก่ผู้ป่วย:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Step 1: ABO/Rh */}
              <div className="p-5 rounded-2xl bg-white border border-[var(--line)] shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-100 text-[var(--burgundy-700)] font-black text-sm font-mono">
                    01
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--ink)]">การตรวจหมู่โลหิต</h3>
                    <span className="text-[11px] font-bold text-[var(--burgundy-700)]">ABO & Rh(D) Grouping</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-[var(--muted)] font-medium leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Forward (Front) Grouping:</strong> ตรวจหาแอนติเจน A, B บนผิวเม็ดเลือดแดง</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Reverse (Back) Grouping:</strong> ตรวจหาแอนติบอดี Anti-A, Anti-B ในซีรัม/พลาสมา</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Weak D Testing:</strong> ทำการทดสอบยืนยันด้วยวิธี IAT ในกรณีผลตรวจ Rh(D) เบื้องต้นให้ผลลบ เพื่อป้องกันการให้เลือดแก่ผู้รับ Rh-Negative</span>
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
                    <h3 className="text-sm font-black text-[var(--ink)]">การตรวจคัดกรองแอนติบอดี</h3>
                    <span className="text-[11px] font-bold text-amber-800">Unexpected Red Cell Ab</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-[var(--muted)] font-medium leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>ตรวจหาแอนติบอดีแปลกปลอม (Atypical Antibodies) ที่อาจทำลายเม็ดเลือดแดงของผู้ป่วย</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>ใช้ <strong>3-cell Screening Panel (Cells I, II, III)</strong> ครอบคลุมระบบหมู่เลือดสำคัญ (Rh, Kell, Duffy, Kidd, MNS)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>ใช้วิธี Indirect Antiglobulin Test (IAT) หรือ Gel Card Technology</span>
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
                    <h3 className="text-sm font-black text-[var(--ink)]">การตรวจโรคติดเชื้อ (TTI)</h3>
                    <span className="text-[11px] font-bold text-blue-800">Dual Serology + ID-NAT</span>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-[var(--muted)] font-medium leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Serology:</strong> 4th Gen HIV Ag/Ab combo, HBsAg, Anti-HCV, Syphilis TT-1/TT-2/NTT</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ID-NAT:</strong> ตรวจสารพันธุกรรมเชื้อเดี่ยว (HIV RNA, HCV RNA, HBV DNA) ด้วย Real-time PCR/TMA</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>ลดระยะเวลา Window Period สู่ระดับต่ำสุด ปลอดภัยสูงสุด</span>
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
                <span>ขั้นตอนและอัลกอริทึมการตรวจซ้ำ (Testing Algorithm & Duplicate Repeat)</span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                ขั้นตอนการปฏิบัติงานตามมาตรฐานบทที่ 4 สำหรับการตรวจคัดกรองและการจัดการผลบวก
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Algorithm 1: Serology */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="font-black text-[var(--ink)] text-sm border-b border-gray-200 pb-2">
                  1. อัลกอริทึมการตรวจทางซีโรโลยี (Serology Testing Flow)
                </h4>
                <div className="space-y-2 leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-white border border-gray-100">
                    <p className="font-bold text-gray-800">• Initial Screening Test (A):</p>
                    <p className="text-gray-600">ตรวจตัวอย่าง clotted blood ด้วยวิธี EIA หรือ CLIA</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <p className="font-bold">✓ ผลตรวจเป็นลบ (Non-reactive, A-):</p>
                    <p>สามารถจ่ายโลหิตและส่วนประกอบโลหิตให้ผู้ป่วยได้ และรับบริจาคในอนาคตได้ตามปกติ</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                    <p className="font-bold">⚠️ ผลตรวจเป็นบวก (Reactive, A+):</p>
                    <p>ต้องทำการตรวจซ้ำในหลอดเดิมแบบ 2 ซ้ำ (Duplicate repeat test):</p>
                    <p className="pt-1 text-[11px]">
                      - หากลบทั้งสองซ้ำ (A+, A-, A-) → ปล่อยโลหิตได้<br />
                      - หากบวกหนึ่งหรือสองซ้ำ → ทิ้งถุงโลหิตทันที และส่งตรวจยืนยัน (Confirmatory Test ในบทที่ 5)
                    </p>
                  </div>
                </div>
              </div>

              {/* Algorithm 2: ID-NAT */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="font-black text-[var(--ink)] text-sm border-b border-gray-200 pb-2">
                  2. อัลกอริทึมการตรวจสารพันธุกรรม (ID-NAT Testing Flow)
                </h4>
                <div className="space-y-2 leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-white border border-gray-100">
                    <p className="font-bold text-gray-800">• EDTA Blood Tube Test:</p>
                    <p className="text-gray-600">ตรวจตัวอย่างแบบ Single Donor ID-NAT สำหรับ HIV RNA, HCV RNA, HBV DNA</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <p className="font-bold">✓ Non-reactive:</p>
                    <p>ปลอดภัยจากเชื้อไวรัสในระดับพันธุกรรม</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-900">
                    <p className="font-bold">⚠️ Reactive:</p>
                    <p>สั่งกักกัน/ทิ้งถุงโลหิต และทำ Duplicate repeat test:</p>
                    <p className="pt-1 text-[11px]">
                      - ตรวจซ้ำให้ผลบวก → รายงานผลเชื้อไวรัสจำเพาะ และเข้าสู่กระบวนการ Look-back ตรวจสอบย้อนหลัง
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* ID-NAT Window Period Comparative Table */}
            <div className="space-y-3 pt-4 border-t border-[var(--line)]">
              <h4 className="text-sm font-black text-[var(--ink)]">
                การเปรียบเทียบระยะฟักตัว (Window Period) ระหว่าง Serology และ ID-NAT
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[var(--line)] rounded-xl overflow-hidden">
                  <thead className="bg-[var(--rose-100)] text-[var(--burgundy-700)] font-black text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 border-b border-[var(--line)]">เชื้อโรคที่ตรวจคัดกรอง</th>
                      <th className="p-3.5 border-b border-[var(--line)]">วิธีตรวจทางน้ำเหลือง (Serology)</th>
                      <th className="p-3.5 border-b border-[var(--line)]">วิธีตรวจสารพันธุกรรม (ID-NAT)</th>
                      <th className="p-3.5 border-b border-[var(--line)]">Window Period ด้วย ID-NAT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)] font-medium text-[var(--ink)]">
                    <tr className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">ไวรัสเอชไอวี (HIV-1 / HIV-2)</td>
                      <td className="p-3.5">Anti-HIV & HIV-1 p24 Antigen</td>
                      <td className="p-3.5 font-mono text-[var(--burgundy-700)] font-bold">HIV RNA</td>
                      <td className="p-3.5 text-emerald-700 font-bold">≈ 4.5 – 5.6 วัน</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">ไวรัสตับอักเสบ ซี (HCV)</td>
                      <td className="p-3.5">Anti-HCV (Antibody)</td>
                      <td className="p-3.5 font-mono text-[var(--burgundy-700)] font-bold">HCV RNA</td>
                      <td className="p-3.5 text-emerald-700 font-bold">≈ 3.1 – 4.9 วัน</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">ไวรัสตับอักเสบ บี (HBV)</td>
                      <td className="p-3.5">HBsAg (Surface Antigen)</td>
                      <td className="p-3.5 font-mono text-[var(--burgundy-700)] font-bold">HBV DNA</td>
                      <td className="p-3.5 text-emerald-700 font-bold">≈ 15 – 20 วัน</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold">เชื้อซิฟิลิส (Treponema pallidum)</td>
                      <td className="p-3.5">TT-1 (TPHA/TPPA/CMIA) + TT-2 + NTT (VDRL/RPR)</td>
                      <td className="p-3.5 text-gray-400">—</td>
                      <td className="p-3.5 text-gray-600">ตรวจยืนยันแบบ 2-Tier Serology</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0" />
                <span>ระบบควบคุมคุณภาพและการตรวจสอบย้อนหลัง (Quality Assurance & Look-back)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                ห้องปฏิบัติการมีระบบบาร์โค้ดสองมิติควบคุมสายถุงโลหิต (Segment) ทุกยูนิต มีการทดสอบความถูกต้องของน้ำยา (Lot-to-lot verification) และมีกระบวนการ Look-back แจ้งเตือนผู้ป่วยและผู้บริจาคทันทีหากพบความผิดปกติ
              </p>
            </div>

          </div>

        </section>
      )}

      {/* TAB 2: ABO & RH BLOOD GROUP SYSTEM (FEATURING POST 1 & POST 2) */}
      {activeTab === 'ABO_RH_SYSTEM' && (
        <section className="space-y-8 animate-in fade-in duration-200">
          
          {/* SECTION 1: ABO BLOOD COMPATIBILITY (FEATURING POST 1) */}
          <div className="editorial-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-[var(--line)] pb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-100 text-[var(--burgundy-700)] px-3 py-0.5 text-xs font-black">
                <span>ความรู้เรื่องกรุ๊ปเลือด ตอนที่ 1</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">
                ระบบหมู่เลือด ABO : เลือดกรุ๊ปไหน ให้ใครได้บ้าง? (Interactive Matrix)
              </h2>
              <p className="text-xs text-[var(--muted)]">
                ตารางความเข้ากันได้ของเม็ดเลือดแดงและพลาสมา พร้อมสถิติในประชากรไทย อ้างอิงศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย
              </p>
            </div>

            {/* Infographic Post 1 Image Display & Quick Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 flex flex-col space-y-2">
                <div className="relative flex-1 min-h-[380px] w-full rounded-2xl overflow-hidden border border-[var(--line)] bg-white/70 shadow-xs flex items-center justify-center p-2">
                  <Image
                    src="/images/education/blood-groups-part1.png"
                    alt="ความรู้เรื่องกรุ๊ปเลือด ตอนที่ 1 ABO"
                    fill
                    sizes="(min-width: 1024px) 380px, 90vw"
                    className="object-contain"
                  />
                </div>
                <p className="text-[11px] text-center font-bold text-[var(--muted)]">
                  ภาพ: อินโฟกราฟิกความรู้เรื่องกรุ๊ปเลือด ตอนที่ 1 (ระบบหมู่เลือด ABO)
                </p>
              </div>

              {/* Thai Blood Group Distribution Stats & Key Clinical Rules */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--ink)] mb-2.5">
                    สัดส่วนหมู่เลือดในประชากรไทย (Thai Population Distribution)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {bloodGroupStats.map((item) => (
                      <div key={item.group} className="p-3 rounded-xl bg-gray-50/80 border border-gray-200 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black font-mono text-[var(--burgundy-700)]">
                            กรุ๊ป {item.group}
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

                {/* Clinical Rules & Universal Donors (Fills the space seamlessly) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs space-y-1 shadow-2xs">
                    <span className="font-bold text-[var(--burgundy-700)] flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-[var(--burgundy-600)] shrink-0" />
                      <span>ผู้ให้เม็ดเลือดแดงสากล: กรุ๊ป O</span>
                    </span>
                    <p className="text-[11px] text-[var(--ink)] leading-relaxed">
                      ไม่มีแอนติเจน A และ B บนผิวเม็ดเลือดแดง จึงให้แก่ผู้ป่วยได้ทุกหมู่เลือดในภาวะฉุกเฉิน
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1 shadow-2xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                      <span>ผู้ให้พลาสมาสากล: กรุ๊ป AB</span>
                    </span>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      ในพลาสมาไม่มี Anti-A และ Anti-B จึงสามารถให้พลาสมาแก่ผู้ป่วยได้ทุกกรุ๊ปอย่างปลอดภัย
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Group Selectors */}
            <div className="space-y-3 pt-4 border-t border-[var(--line)]">
              <span className="text-xs font-black text-[var(--ink)] block">เลือกหมู่เลือดเพื่อดูผลจำลองการให้-รับเลือด:</span>
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
                      <span className="text-xl sm:text-2xl font-black font-mono">กรุ๊ป {grp}</span>
                      <span className="text-[11px] font-bold text-[var(--muted)]">ประชากรไทย {stat.percent}%</span>
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
                    ผลการวิเคราะห์ความเข้ากันได้ของ <span className="text-[var(--burgundy-700)]">หมู่เลือด {selectedBloodGroup}</span>
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
                    <span>เม็ดเลือดแดง (Red Blood Cells)</span>
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-red-100 space-y-1">
                      <span className="text-gray-500 font-bold block text-[11px]">สามารถให้เม็ดเลือดแดงแก่:</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {currentCompat.rbcGiveTo.map((g) => (
                          <span key={g} className="px-2.5 py-0.5 rounded-md bg-red-600 text-white font-mono font-black text-xs">
                            กรุ๊ป {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-red-100 space-y-1">
                      <span className="text-gray-500 font-bold block text-[11px]">สามารถรับเม็ดเลือดแดงจาก:</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {currentCompat.rbcReceiveFrom.map((g) => (
                          <span key={g} className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-black text-xs">
                            กรุ๊ป {g}
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
                    <span>พลาสมา (Plasma)</span>
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-yellow-100 space-y-1">
                      <span className="text-gray-500 font-bold block text-[11px]">สามารถให้พลาสมาแก่:</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {currentCompat.plasmaGiveTo.map((g) => (
                          <span key={g} className="px-2.5 py-0.5 rounded-md bg-yellow-600 text-white font-mono font-black text-xs">
                            กรุ๊ป {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-yellow-100 space-y-1">
                      <span className="text-gray-500 font-bold block text-[11px]">สามารถรับพลาสมาจาก:</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {currentCompat.plasmaReceiveFrom.map((g) => (
                          <span key={g} className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-black text-xs">
                            กรุ๊ป {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECTION 2: RH POSITIVE VS RH NEGATIVE COMPARISON (FEATURING POST 2) */}
          <div className="editorial-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-[var(--line)] pb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-900 px-3 py-0.5 text-xs font-black">
                <span>ความรู้เรื่องกรุ๊ปเลือด ตอนที่ 2</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
                Rh+ vs Rh- : ทำความเข้าใจหมู่เลือดและหมู่เลือดหายาก (Rare Blood)
              </h2>
              <p className="text-xs text-[var(--muted)]">
                อ้างอิง: ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย และ <em>บทที่ 4 การทดสอบโลหิตบริจาค</em>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Infographic Post 2 Image Display */}
              <div className="lg:col-span-5 flex flex-col space-y-2">
                <div className="relative flex-1 min-h-[380px] w-full rounded-2xl overflow-hidden border border-[var(--line)] bg-white/70 shadow-xs flex items-center justify-center p-2">
                  <Image
                    src="/images/education/blood-groups-part2.png"
                    alt="Rh+ vs Rh- ความรู้เรื่องกรุ๊ปเลือด 2"
                    fill
                    sizes="(min-width: 1024px) 380px, 90vw"
                    className="object-contain"
                    priority
                  />
                </div>
                <p className="text-[11px] text-center font-bold text-[var(--muted)]">
                  ภาพ: อินโฟกราฟิกความรู้เรื่องกรุ๊ปเลือด ตอนที่ 2 (Rh+ vs Rh-)
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
                      <span className="font-bold text-red-900">99.7% ในคนไทย</span>
                    </div>
                    <div className="space-y-1 pt-0.5 text-[var(--ink)] font-medium">
                      <p>• <strong>แอนติเจน:</strong> มีแอนติเจน D บนผิวเซลล์</p>
                      <p>• <strong>การรับเลือด:</strong> รับได้ทั้ง Rh+ และ Rh-</p>
                      <p>• <strong>การให้เลือด:</strong> ให้ได้เฉพาะ <strong>Rh+</strong></p>
                      <p className="text-[11px] text-red-800 pt-0.5">
                        เป็นหมู่เลือดหลักของคนไทย ต้องการใช้อย่างต่อเนื่อง
                      </p>
                    </div>
                  </div>

                  {/* Rh Negative Card */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold font-mono text-xs">
                        Rh Negative (Rh-)
                      </span>
                      <span className="font-bold text-blue-900">0.3% ในคนไทย</span>
                    </div>
                    <div className="space-y-1 pt-0.5 text-[var(--ink)] font-medium">
                      <p>• <strong>แอนติเจน:</strong> <strong>ไม่มีแอนติเจน D</strong></p>
                      <p>• <strong>การรับเลือด:</strong> <strong className="text-red-700 underline">รับจาก Rh- เท่านั้น!</strong></p>
                      <p>• <strong>การให้เลือด:</strong> ให้แก่ Rh+ และ Rh- ได้</p>
                      <p className="text-[11px] text-blue-800 pt-0.5">
                        พบเพียง 3 ใน 1,000 คน <strong>“หมู่เลือดหายาก”</strong>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Important Clinical Insights Alert */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>ความสำคัญทางการแพทย์: ทำไม Rh- ต้องรับเฉพาะ Rh- เท่านั้น?</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900 font-medium">
                    หากผู้ป่วยที่มีหมู่เลือด Rh-Negative ได้รับเม็ดเลือดแดง Rh-Positive ร่างกายจะถูกกระตุ้นให้สร้างภูมิคุ้มกัน <strong>Anti-D</strong> ซึ่งจะทำให้เกิดปฏิกิริยาเม็ดเลือดแดงแตกอย่างรุนแรง (Hemolytic Transfusion Reaction) ในการรับเลือดครั้งต่อไป หรือก่อให้เกิดภาวะทารกบวมน้ำและเม็ดเลือดแดงแตกในครรภ์ (Hemolytic Disease of the Fetus and Newborn: HDFN) ในหญิงตั้งครรภ์
                  </p>
                </div>

                {/* Weak D Note */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-1">
                  <span className="font-bold text-[var(--ink)] block text-[11px]">🔬 การตรวจ Weak D ในห้องปฏิบัติการ:</span>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                    ผู้บริจาคที่มีแอนติเจน D อ่อนแรง (Weak D) ทางห้องปฏิบัติการจะจัดให้เป็น <strong>Rh-Positive</strong> เสมอ เพื่อความปลอดภัยของผู้รับโลหิต Rh-Negative ที่อาจถูกกระตุ้นให้สร้าง Anti-D ได้
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
                เลือด 1 ถุง นำไปปั่นแยกส่วนประกอบ และช่วยได้ถึง 3 ชีวิต
              </h2>
              <p className="text-xs text-[var(--muted)]">
                การให้เลือดในปัจจุบันใช้หลักการ <em>Component Therapy</em> คือให้เฉพาะส่วนประกอบที่ผู้ป่วยต้องการเท่านั้น เพื่อประสิทธิภาพสูงสุดและลดความเสี่ยงจากการได้รับสารที่ไม่จำเป็น
              </p>
            </div>

            {/* Infographic Visual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-sm">
                  <Image
                    src="/images/education/blood-components-1.png"
                    alt="เลือด 1 ถุงทำอะไรได้บ้าง"
                    fill
                    sizes="(min-width: 768px) 45vw, 95vw"
                    className="object-contain"
                  />
                </div>
                <div className="text-xs text-center text-[var(--muted)] font-bold">
                  ภาพที่ 1: การปั่นแยกส่วนประกอบโลหิต (พลาสมา 55%, เกล็ดเลือด ~1%, เม็ดเลือดแดง 44%)
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-sm">
                  <Image
                    src="/images/education/blood-components-2.png"
                    alt="โลหิต 1 ถุงช่วยใครได้บ้าง"
                    fill
                    sizes="(min-width: 768px) 45vw, 95vw"
                    className="object-contain"
                  />
                </div>
                <div className="text-xs text-center text-[var(--muted)] font-bold">
                  ภาพที่ 2: กลุ่มผู้ป่วยที่ได้รับประโยชน์จากแต่ละส่วนประกอบโลหิต
                </div>
              </div>
            </div>

            {/* 3 Component Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* Component 1: RBC */}
              <div className="p-5 rounded-2xl bg-red-50/50 border border-red-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black">
                    44% ของปริมาตร
                  </span>
                  <span className="text-xs font-mono font-bold text-red-800">เก็บที่ 2-6 °C</span>
                </div>
                <h3 className="text-base font-black text-red-950">เม็ดเลือดแดง (Red Blood Cells)</h3>
                <p className="text-xs text-red-900 leading-relaxed font-medium">
                  มีฮีโมโกลบิน ทำหน้าที่ลำเลียงออกซิเจนจากปอดไปเลี้ยงเนื้อเยื่อทั่วร่างกาย มีอายุการเก็บรักษา 35-42 วัน
                </p>
                <div className="border-t border-red-200 pt-2 text-xs font-bold text-red-950 space-y-1">
                  <p className="text-[11px] text-red-700">🩸 ใช้รักษา:</p>
                  <p>• ผู้ป่วยโรคธาลัสซีเมีย</p>
                  <p>• ผู้ป่วยสูญเสียเลือดจากอุบัติเหตุ/ผ่าตัด</p>
                  <p>• ผู้ป่วยภาวะโลหิตจางรุนแรง</p>
                </div>
              </div>

              {/* Component 2: Platelets */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-[11px] font-black">
                    ~1% ของปริมาตร
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800">เก็บที่ 20-24 °C (เขย่าตลอดเวลา)</span>
                </div>
                <h3 className="text-base font-black text-amber-950">เกล็ดเลือด (Platelets)</h3>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  ช่วยในการแข็งตัวของเลือดและอุดรอยฉีกขาดของหลอดเลือด มีอายุการเก็บรักษาเพียง 5 วัน
                </p>
                <div className="border-t border-amber-200 pt-2 text-xs font-bold text-amber-950 space-y-1">
                  <p className="text-[11px] text-amber-700">🩸 ใช้รักษา:</p>
                  <p>• ผู้ป่วยไข้เลือดออกที่มีเกล็ดเลือดต่ำ</p>
                  <p>• โรคมะเร็งเม็ดเลือดขาวที่ได้รับเคมีบำบัด</p>
                  <p>• ผู้ป่วยปลูกถ่ายไขกระดูก</p>
                </div>
              </div>

              {/* Component 3: Plasma */}
              <div className="p-5 rounded-2xl bg-yellow-50/50 border border-yellow-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-yellow-600 text-white text-[11px] font-black">
                    55% ของปริมาตร
                  </span>
                  <span className="text-xs font-mono font-bold text-yellow-800">เก็บแช่แข็ง ≤ -18 °C</span>
                </div>
                <h3 className="text-base font-black text-yellow-950">พลาสมา (Plasma)</h3>
                <p className="text-xs text-yellow-900 leading-relaxed font-medium">
                  ของเหลวสีเหลืองใส อุดมด้วยโปรตีน Albumin, Immunoglobulin และ Clotting Factors มีอายุเก็บ 1 ปี
                </p>
                <div className="border-t border-yellow-200 pt-2 text-xs font-bold text-yellow-950 space-y-1">
                  <p className="text-[11px] text-yellow-700">🩸 ใช้รักษา:</p>
                  <p>• ผู้ป่วยโรคตับแข็งที่มีเลือดออกง่าย</p>
                  <p>• โรคฮีโมฟีเลีย (Hemophilia)</p>
                  <p>• แผลไฟไหม้ น้ำร้อนลวกขั้นรุนแรง</p>
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
                5 ข้อดีของการบริจาคโลหิต ที่ส่งผลดีต่อสุขภาพทั้งกายและใจ
              </h2>
              <p className="text-xs text-[var(--muted)]">
                อ้างอิงข้อมูลทางการแพทย์ ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-sm">
                <Image
                  src="/images/education/benefits-5-reasons.png"
                  alt="5 ข้อดีของการบริจาคโลหิต"
                  fill
                  sizes="(min-width: 768px) 45vw, 95vw"
                  className="object-contain"
                />
              </div>

              <div className="space-y-4">
                {[
                  {
                    num: '1',
                    title: 'ร่างกายแข็งแรงและกระตุ้นการสร้างเม็ดเลือดใหม่',
                    desc: 'การบริจาคกระตุ้นให้ไขกระดูก (Bone Marrow) ผลิตเซลล์เม็ดเลือดแดงใหม่ออกมาทดแทน ทำให้ระบบการทำงานของร่างกายสดชื่นและมีประสิทธิภาพ',
                  },
                  {
                    num: '2',
                    title: 'ผิวพรรณสดใสเปล่งปลั่ง',
                    desc: 'ช่วยกระตุ้นระบบการไหลเวียนโลหิตทั่วร่างกายให้ทำงานได้ดียิ่งขึ้น ส่งผลดีต่อสุขภาพผิวและระบบการทำงานของอวัยวะภายใน',
                  },
                  {
                    num: '3',
                    title: 'ลดความเสี่ยงภาวะหลอดเลือดแดงตีบ',
                    desc: 'ช่วยลดความหนืดข้นของเลือด (Blood Viscosity) และช่วยควบคุมระดับธาตุเหล็กส่วนเกินในร่างกายให้อยู่ในระดับสมดุล',
                  },
                  {
                    num: '4',
                    title: 'กระตุ้นให้เซลล์ไขกระดูกทำงานสม่ำเสมอ',
                    desc: 'การบริจาคโลหิตเป็นประจำทุก 3 เดือนช่วยฝึกฝนให้ไขกระดูกสร้างเม็ดเลือดอย่างมีประสิทธิภาพตลอดเวลา',
                  },
                  {
                    num: '5',
                    title: 'ทราบข้อมูลสุขภาพเบื้องต้นฟรี',
                    desc: 'ได้รับการตรวจวัดความดันโลหิต ชีพจร ความเข้มข้นโลหิต (Hb) หมู่เลือดระบบ ABO/Rh และตรวจคัดกรองโรคติดเชื้อทางโลหิตด้วยวิธีมาตรฐานสากล',
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
