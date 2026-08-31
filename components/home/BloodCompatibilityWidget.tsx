'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  ShieldCheck, 
  Droplets, 
  Info,
  Activity,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type BloodGroup = 'O' | 'A' | 'B' | 'AB';
type RhFactor = 'POS' | 'NEG';

interface BloodGroupData {
  group: BloodGroup;
  rh: RhFactor;
  label: string;
  populationTh: string;
  populationEn: string;
  donateRbcTo: string[];
  receiveRbcFrom: string[];
  donatePlasmaTo: string[];
  tagTh: string;
  tagEn: string;
  funFactTh: string;
  funFactEn: string;
}

const BLOOD_MATRIX: Record<string, BloodGroupData> = {
  'O-POS': {
    group: 'O',
    rh: 'POS',
    label: 'O Positive (O+)',
    populationTh: 'ประมาณ 38% (พบบ่อยที่สุดในไทย)',
    populationEn: 'Approx. 38% (Most common in Thailand)',
    donateRbcTo: ['O+', 'A+', 'B+', 'AB+'],
    receiveRbcFrom: ['O+', 'O-'],
    donatePlasmaTo: ['O+', 'O-'],
    tagTh: 'หมู่โลหิตที่ต้องการสำรองสูงสุด',
    tagEn: 'Highest Demand Blood Group',
    funFactTh: 'เม็ดเลือดแดงกรุ๊ป O+ สามารถให้แก่ผู้ป่วยที่มีผล Rh+ ได้ทุกกรุ๊ป (O+, A+, B+, AB+) ซึ่งคิดเป็น 99.7% ของผู้ป่วยในไทย',
    funFactEn: 'O+ red cells can be safely given to all Rh+ patients (O+, A+, B+, AB+), representing 99.7% of recipients in Thailand.',
  },
  'O-NEG': {
    group: 'O',
    rh: 'NEG',
    label: 'O Negative (O-)',
    populationTh: 'ประมาณ 0.3% (หมู่เลือดหายากระดับวิกฤต)',
    populationEn: 'Approx. 0.3% (Critical Universal Rare Group)',
    donateRbcTo: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    receiveRbcFrom: ['O-'],
    donatePlasmaTo: ['O+', 'O-'],
    tagTh: 'Universal RBC Donor (ผู้ให้เม็ดเลือดแดงสากล)',
    tagEn: 'Universal Red Blood Cell Donor',
    funFactTh: 'เม็ดเลือดแดงของคุณเป็น "ผู้ให้สากลตัวจริง" สามารถให้แก่ผู้ป่วยได้ทุกคนในโลก และจำเป็นอย่างยิ่งในห้องฉุกเฉินกู้ชีพเร่งด่วน',
    funFactEn: 'Your red blood cells are universal and can be transfused to any patient in emergency trauma surgeries.',
  },
  'A-POS': {
    group: 'A',
    rh: 'POS',
    label: 'A Positive (A+)',
    populationTh: 'ประมาณ 24% ของประชากรไทย',
    populationEn: 'Approx. 24% of Thai population',
    donateRbcTo: ['A+', 'AB+'],
    receiveRbcFrom: ['A+', 'A-', 'O+', 'O-'],
    donatePlasmaTo: ['A+', 'A-', 'O+', 'O-'],
    tagTh: 'สำคัญสำหรับผู้ป่วยโรคเลือดและผ่าตัด',
    tagEn: 'Vital for Surgery & Hematology',
    funFactTh: 'ผู้มีเลือดกรุ๊ป A+ มีแอนติเจน A บนเม็ดเลือดแดง และสามารถรับเลือดจากกรุ๊ป A และ O ได้อย่างปลอดภัย',
    funFactEn: 'A+ has A-antigens and can safely receive both A and O red blood cells.',
  },
  'A-NEG': {
    group: 'A',
    rh: 'NEG',
    label: 'A Negative (A-)',
    populationTh: 'ประมาณ 0.07% (หมู่เลือดหายาก)',
    populationEn: 'Approx. 0.07% (Rare Blood Group)',
    donateRbcTo: ['A+', 'A-', 'AB+', 'AB-'],
    receiveRbcFrom: ['A-', 'O-'],
    donatePlasmaTo: ['A+', 'A-', 'O+', 'O-'],
    tagTh: 'หมู่เลือดหายาก มีค่าอย่างยิ่ง',
    tagEn: 'Precious Rare Blood Group',
    funFactTh: 'เม็ดเลือดแดงกรุ๊ป A- สามารถให้แก่ผู้ป่วยกรุ๊ป A และ AB ได้ทั้งกลุ่ม Rh+ และ Rh-',
    funFactEn: 'A- red cells can be given to all A and AB recipients regardless of Rh status.',
  },
  'B-POS': {
    group: 'B',
    rh: 'POS',
    label: 'B Positive (B+)',
    populationTh: 'ประมาณ 34% (พบมากเป็นอันดับ 2 ในไทย)',
    populationEn: 'Approx. 34% (2nd most common in Thailand)',
    donateRbcTo: ['B+', 'AB+'],
    receiveRbcFrom: ['B+', 'B-', 'O+', 'O-'],
    donatePlasmaTo: ['B+', 'B-', 'O+', 'O-'],
    tagTh: 'หมู่โลหิตหลักที่ใช้สำรองในโรงพยาบาล',
    tagEn: 'Major Hospital Reserve Group',
    funFactTh: 'กรุ๊ป B มีสัดส่วนสูงในคนไทย การบริจาคสม่ำเสมอช่วยรักษาปริมาณโลหิตสำรองให้เพียงพอต่อผู้ป่วยธาลัสซีเมียและอุบัติเหตุ',
    funFactEn: 'B+ donors sustain vital reserves for ongoing thalassemia treatments and surgical procedures.',
  },
  'B-NEG': {
    group: 'B',
    rh: 'NEG',
    label: 'B Negative (B-)',
    populationTh: 'ประมาณ 0.1% (หมู่เลือดหายาก)',
    populationEn: 'Approx. 0.1% (Rare Blood Group)',
    donateRbcTo: ['B+', 'B-', 'AB+', 'AB-'],
    receiveRbcFrom: ['B-', 'O-'],
    donatePlasmaTo: ['B+', 'B-', 'O+', 'O-'],
    tagTh: 'หมู่เลือดหายาก ต้องการการสำรองพิเศษ',
    tagEn: 'Rare Group Special Reserve',
    funFactTh: 'ผู้มีเลือดกรุ๊ป B- เมื่อบริจาคจะถูกบันทึกในฐานข้อมูลหมู่เลือดพิเศษของศูนย์บริการโลหิตแห่งชาติทันที',
    funFactEn: 'B- donations are specifically tracked in the National Rare Blood Donor Registry.',
  },
  'AB-POS': {
    group: 'AB',
    rh: 'POS',
    label: 'AB Positive (AB+)',
    populationTh: 'ประมาณ 8% ของประชากรไทย',
    populationEn: 'Approx. 8% of Thai population',
    donateRbcTo: ['AB+'],
    receiveRbcFrom: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    donatePlasmaTo: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    tagTh: 'Universal Plasma Donor (พลาสมาให้ได้ทุกคน)',
    tagEn: 'Universal Plasma Donor & Universal Recipient',
    funFactTh: 'ผู้มีเลือด AB+ คือ "ผู้รับเม็ดเลือดแดงสากล" (รับได้ทุกกรุ๊ป) และเป็น "ผู้ให้พลาสมาสากล" (พลาสมาของ AB ไม่มีแอนติบอดี จึงให้ผู้ป่วยได้ทุกกรุ๊ป!)',
    funFactEn: 'AB+ is Universal Red Cell Recipient AND Universal Plasma Donor — your plasma saves all patients without antibody reaction!',
  },
  'AB-NEG': {
    group: 'AB',
    rh: 'NEG',
    label: 'AB Negative (AB-)',
    populationTh: 'ประมาณ 0.02% (หายากที่สุดในประเทศไทย)',
    populationEn: 'Approx. 0.02% (Rarest Blood Group in Thailand)',
    donateRbcTo: ['AB+', 'AB-'],
    receiveRbcFrom: ['AB-', 'A-', 'B-', 'O-'],
    donatePlasmaTo: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    tagTh: 'หายากที่สุดในไทย & พลาสมาให้ได้ทุกคน',
    tagEn: 'Rarest in Thailand · Universal Plasma',
    funFactTh: 'กรุ๊ป AB- เป็นกรุ๊ปที่พบยากที่สุดในประชากรไทย (1 ใน 5,000 คน) และพลาสมาของท่านสามารถใช้ช่วยชีวิตผู้ป่วยได้ทุกหมู่โลหิต',
    funFactEn: 'AB- is found in only 1 in 5,000 Thai individuals. Your plasma provides universal lifesaving compatibility.',
  },
};

const ALL_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export function BloodCompatibilityWidget() {
  const { isTh } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O');
  const [selectedRh, setSelectedRh] = useState<RhFactor>('POS');

  const key = `${selectedGroup}-${selectedRh}`;
  const data = BLOOD_MATRIX[key] || BLOOD_MATRIX['O-POS'];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[var(--rose-100)]/40 to-white border-2 border-[var(--burgundy-500)]/20 p-6 sm:p-10 shadow-lg">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-3.5 py-1 text-xs font-bold text-white shadow-sm shadow-red-950/20 border border-white/20">
              <Droplets className="h-3.5 w-3.5 fill-white text-white" />
              <span>{isTh ? 'Interactive Blood Matcher' : 'Blood Compatibility Matcher'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)]">
              {isTh ? 'โลหิตของคุณ ส่งต่อพลังชีวิตให้ใครได้บ้าง?' : 'Who Can You Save With Your Blood Group?'}
            </h2>
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-[var(--muted)] font-medium">
              {isTh 
                ? 'เลือกกรุ๊ปเลือดของคุณเพื่อดูการทำงานของระบบหมู่โลหิต ABO และ Rh รวมถึงสัดส่วนในประชากรไทย' 
                : 'Select your blood type to discover your donation compatibility across red cells and plasma.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[var(--burgundy-700)] bg-white px-3.5 py-2 rounded-xl border border-[var(--line)] shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-[var(--burgundy-700)]" />
            <span>{isTh ? 'มาตรฐานสภากาชาดไทย' : 'Red Cross Standards'}</span>
          </div>
        </div>

        {/* Interactive Selector Controls */}
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[var(--line)] shadow-xs">
            
            {/* 1. ABO Blood Group Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-gray-500 block">
                {isTh ? '1. เลือกหมู่โลหิตระบบ ABO:' : '1. Select ABO Blood Group:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {(['O', 'A', 'B', 'AB'] as BloodGroup[]).map((grp) => {
                  const isSelected = selectedGroup === grp;
                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedGroup(grp)}
                      className={`h-11 min-w-[54px] px-4 rounded-xl font-mono text-base font-black transition-all cursor-pointer shadow-xs active:scale-95 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-[#D92231] to-[#7E1120] text-white shadow-md shadow-red-950/20 scale-105 ring-2 ring-red-400/40' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                      }`}
                    >
                      {grp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Rh Factor Toggle */}
            <div className="space-y-2 sm:border-l sm:border-gray-200 sm:pl-6">
              <span className="text-xs font-black uppercase text-gray-500 block">
                {isTh ? '2. เลือกระบบ Rh (D-Antigen):' : '2. Select Rh Factor:'}
              </span>
              <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedRh('POS')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedRh === 'POS'
                      ? 'bg-white text-[var(--burgundy-700)] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rh Positive (Rh+) · 99.7%
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRh('NEG')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedRh === 'NEG'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rh Negative (Rh-) · 0.3%
                </button>
              </div>
            </div>

          </div>

          {/* Dynamic Result Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Result Highlight (5 Cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-white border border-[var(--line)] p-6 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] text-xs font-black border border-[var(--burgundy-200)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isTh ? data.tagTh : data.tagEn}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {data.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-5xl sm:text-6xl font-black text-[var(--burgundy-700)] tracking-tight">
                    {selectedGroup}
                    <span className="text-3xl sm:text-4xl ml-1 text-red-500">{selectedRh === 'POS' ? '+' : '-'}</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 block">
                    {isTh ? 'สัดส่วนในประชากรไทย:' : 'Thai Population Distribution:'}
                  </span>
                  <p className="text-xs font-black text-gray-900">
                    {isTh ? data.populationTh : data.populationEn}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1 text-xs text-amber-950">
                  <div className="flex items-center gap-1.5 font-black text-amber-900">
                    <Info className="h-4 w-4 shrink-0 text-amber-700" />
                    <span>{isTh ? 'เกร็ดความรู้โลหิตวิทยา:' : 'Hematology Fact:'}</span>
                  </div>
                  <p className="leading-relaxed font-medium text-[11px] pl-5">
                    {isTh ? data.funFactTh : data.funFactEn}
                  </p>
                </div>
              </div>

              <Link
                href="/register"
                className="editorial-btn-primary py-3 px-5 text-xs w-full justify-center shadow-md cursor-pointer mt-2"
              >
                <Heart className="h-4 w-4 fill-white" />
                <span>{isTh ? `ลงทะเบียนบริจาคโลหิตกรุ๊ป ${data.label}` : `Register as ${data.label} Donor`}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right Matrix Compatibility Visualizer (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-white border border-[var(--line)] p-6 space-y-6 shadow-xs flex flex-col justify-between">
              
              {/* 1. Red Blood Cell Donation Compatibility */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                      RBC
                    </div>
                    <h3 className="text-xs font-black text-[var(--ink)]">
                      {isTh ? 'คุณสามารถบริจาค "เม็ดเลือดแดง" ให้แก่ผู้ป่วยกรุ๊ป:' : 'You can donate RED BLOOD CELLS to:'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">
                    {data.donateRbcTo.length} / 8 หมู่โลหิต
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {ALL_GROUPS.map((grp) => {
                    const isCompatible = data.donateRbcTo.includes(grp);
                    return (
                      <div
                        key={grp}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-300 ${
                          isCompatible
                            ? 'bg-red-50 border-red-300 text-red-950 font-black shadow-xs scale-105 ring-1 ring-red-400'
                            : 'bg-gray-50/60 border-gray-200 text-gray-400 opacity-50'
                        }`}
                      >
                        <span className="font-mono text-sm">{grp}</span>
                        {isCompatible ? (
                          <Check className="h-3.5 w-3.5 text-red-600 mt-1" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-gray-300 mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Plasma Compatibility */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                      FFP
                    </div>
                    <h3 className="text-xs font-black text-[var(--ink)]">
                      {isTh ? 'คุณสามารถบริจาค "พลาสมา" ให้แก่ผู้ป่วยกรุ๊ป:' : 'You can donate PLASMA to:'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">
                    {data.donatePlasmaTo.length} / 8 หมู่โลหิต
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {ALL_GROUPS.map((grp) => {
                    const isCompatible = data.donatePlasmaTo.includes(grp);
                    return (
                      <div
                        key={grp}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-300 ${
                          isCompatible
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-black shadow-xs scale-105 ring-1 ring-amber-400'
                            : 'bg-gray-50/60 border-gray-200 text-gray-400 opacity-50'
                        }`}
                      >
                        <span className="font-mono text-sm">{grp}</span>
                        {isCompatible ? (
                          <Check className="h-3.5 w-3.5 text-amber-600 mt-1" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-gray-300 mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Red Cells You Can Receive */}
              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-gray-600 font-bold">
                  {isTh ? 'หากคุณต้องการรับโลหิต สามารถรับเม็ดเลือดแดงได้จาก:' : 'If you need blood, you can safely receive from:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.receiveRbcFrom.map((grp) => (
                    <span key={grp} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-[11px] border border-emerald-200">
                      {grp}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
