'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Sparkles, 
  Users, 
  Droplets, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Stethoscope,
  Bandage
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function BloodImpactGauge() {
  const { isTh } = useLanguage();

  const components = [
    {
      title: isTh ? 'เม็ดเลือดแดง (Packed Red Cells)' : 'Packed Red Cells (PRC)',
      icon: Droplets,
      color: 'bg-red-500 text-white',
      border: 'border-red-200',
      bg: 'bg-red-50/50',
      badge: '44% ของถุงเลือด',
      badgeEn: '44% of whole blood',
      patients: isTh 
        ? 'ผู้ป่วยสูญเสียเลือดจากอุบัติเหตุ, การผ่าตัดใหญ่, โรคโลหิตจาง และโรคธาลัสซีเมีย' 
        : 'Trauma surgeries, major operations, severe anemia, and thalassemia patients.',
    },
    {
      title: isTh ? 'เกล็ดเลือด (Platelets)' : 'Platelet Concentrate',
      icon: Activity,
      color: 'bg-amber-500 text-white',
      border: 'border-amber-200',
      bg: 'bg-amber-50/50',
      badge: 'อายุใช้งาน 5 วัน',
      badgeEn: '5-Day Shelf Life',
      patients: isTh 
        ? 'ผู้ป่วยโรคมะเร็งเม็ดเลือดขาว (Leukemia), ผู้ป่วยไข้เลือดออก และภาวะเกล็ดเลือดต่ำวิกฤต' 
        : 'Leukemia patients, severe dengue hemorrhagic fever, and thrombocytopenia.',
    },
    {
      title: isTh ? 'พลาสมา (Fresh Frozen Plasma)' : 'Fresh Frozen Plasma (FFP)',
      icon: Flame,
      color: 'bg-yellow-500 text-white',
      border: 'border-yellow-200',
      bg: 'bg-yellow-50/50',
      badge: '55% ของถุงเลือด',
      badgeEn: '55% of whole blood',
      patients: isTh 
        ? 'ผู้ป่วยโรคตับแข็ง, โรคเลือดไหลไม่หยุด (Hemophilia), และผู้ป่วยแผลไฟไหม้รุนแรง' 
        : 'Cirrhosis, hemophilia (clotting factor deficiency), and severe burn victims.',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[var(--burgundy-950)] to-slate-950 text-white p-6 sm:p-10 border border-red-950/40 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Ambient Red Light in Card Background */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-rose-600/15 blur-3xl" />

        <div className="relative z-10 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-amber-300 border border-white/15 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                <span>{isTh ? 'พลังแห่งการให้ 1 ถุง = 3 ชีวิต' : 'The Multiplier Effect · 1 Unit = 3 Lives'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                {isTh ? 'เป้าหมายร่วมใจ: สำรองโลหิต 200 ยูนิต' : 'Campaign Goal: 200 Lifesaving Blood Units'}
              </h2>
              <p className="text-[14px] sm:text-[15px] leading-relaxed text-gray-300 font-medium">
                {isTh
                  ? 'โลหิต 1 ยูนิตที่คุณบริจาค จะถูกนำไปปั่นแยกออกเป็น 3 ส่วนประกอบสำคัญ เพื่อนำไปรักษาผู้ป่วยได้สูงสุดถึง 3 ชีวิตพร้อมกัน'
                  : 'Every single donation is separated into 3 clinical components, directly saving up to 3 different patient lives.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 text-center min-w-[130px]">
                <span className="text-[10px] font-extrabold uppercase text-amber-300 block tracking-wider">
                  {isTh ? 'ส่งต่อชีวิตผู้ป่วยสูงสุด' : 'Max Patients Saved'}
                </span>
                <span className="font-mono text-3xl font-black text-white">600+</span>
                <span className="text-[10px] text-gray-300 block">{isTh ? 'ชีวิตผู้ป่วย' : 'Lives impacted'}</span>
              </div>
            </div>
          </div>

          {/* 3 Component Breakdown Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {components.map((comp, idx) => {
              const Icon = comp.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between space-y-4 hover:bg-white/10 hover:border-white/25 transition-all duration-300 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`h-10 w-10 rounded-xl ${comp.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-300/20">
                        {isTh ? comp.badge : comp.badgeEn}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white group-hover:text-amber-200 transition-colors">
                      {comp.title}
                    </h3>

                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {comp.patients}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-amber-300/90 font-bold">
                    <Heart className="h-3.5 w-3.5 fill-amber-300 text-amber-300 shrink-0" />
                    <span>{isTh ? 'ส่วนประกอบสำคัญช่วยชีวิต' : 'Essential component'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Strip */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{isTh ? 'จัดโดยคณะเทคนิคการแพทย์ ม.มหิดล ร่วมกับภาคบริการโลหิตแห่งชาติที่ 4 จ.ราชบุรี' : 'Organized by Faculty of Medical Technology, Mahidol University & Regional Blood Centre 4'}</span>
            </div>

            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[var(--burgundy-900)] hover:bg-gray-100 font-extrabold px-6 py-3 text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>{isTh ? 'ร่วมเป็น 1 ใน 200 ผู้ให้ชีวิต' : 'Join as 1 of 200 Donors'}</span>
              <ArrowRight className="h-4 w-4 text-[var(--burgundy-800)]" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
