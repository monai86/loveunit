import React from 'react';
import Link from 'next/link';
import { Heart, BookOpen, CheckCircle2, AlertTriangle, Droplets, Moon, Coffee, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
import { getEventContentBlocks, getEventBySlug } from '@/lib/db/store';

export default async function PreparePage() {
  const event = await getEventBySlug('mumt-2026');
  const contentBlocks = await getEventContentBlocks(event?.id || '');
  const prepInfographic = contentBlocks.find(b => b.content_key === 'preparation_infographic');
  const whatToBring = contentBlocks.find(b => b.content_key === 'what_to_bring');

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6">
      
      {/* WINHELP 95 WINDOW CONTAINER */}
      <div className="win95-window">
        
        {/* Title Bar */}
        <div className="win95-titlebar">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-white" />
            <span className="font-extrabold text-xs sm:text-sm text-white">
              Windows Help 95 — [คู่มือการเตรียมตัวก่อนบริจาคโลหิต]
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="win95-control-btn">_</span>
            <span className="win95-control-btn">▢</span>
            <span className="win95-control-btn text-red-900">X</span>
          </div>
        </div>

        {/* Win95 Help Body */}
        <div className="p-4 sm:p-6 bg-[#C0C0C0] space-y-6">
          
          {/* Header Banner */}
          <div className="win95-sunken p-4 bg-white">
            <span className="win95-raised px-2 py-0.5 text-xs font-bold bg-[#7A1020] text-white inline-block mb-2">
              MUMT 2026 Donor Guide
            </span>
            <h1 className="text-xl font-black text-black sm:text-2xl">
              ข้อปฏิบัติตัวก่อนและหลังการบริจาคโลหิต
            </h1>
            <p className="mt-1 text-xs text-gray-700 sm:text-sm">
              เพื่อให้การบริจาคโลหิตของท่านเป็นไปอย่างราบรื่น ปลอดภัย และสดชื่นหลังบริจาค
            </p>
          </div>

          {/* Infographic Slots Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="win95-sunken p-2 bg-white">
              <InfographicSlot
                contentKey="preparation_infographic"
                title={prepInfographic?.title || 'โปสเตอร์ข้อปฏิบัติตัวก่อนบริจาคโลหิต'}
                description={prepInfographic?.description}
                imageUrl={prepInfographic?.image_url}
                aspectRatio="poster"
              />
            </div>

            <div className="win95-sunken p-2 bg-white">
              <InfographicSlot
                contentKey="what_to_bring"
                title={whatToBring?.title || 'สิ่งที่ต้องเตรียมมาในวันบริจาคโลหิต'}
                description={whatToBring?.description}
                imageUrl={whatToBring?.image_url}
                aspectRatio="poster"
              />
            </div>
          </div>

          {/* 4 Pillars Card */}
          <div className="win95-raised p-4 bg-[#C0C0C0]">
            <div className="win95-titlebar mb-4">
              <span>ARTICLE 01: 4 ข้อปฏิบัติสำคัญก่อนบริจาค</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              
              <div className="win95-sunken p-3 bg-white flex items-start gap-3">
                <div className="win95-raised p-2 bg-[#7A1020] text-white shrink-0">
                  <Moon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#7A1020]">1. พักผ่อนให้เพียงพอ</h3>
                  <p className="mt-1 text-[11px] text-gray-800 leading-relaxed">
                    นอนหลับพักผ่อนต่อเนื่องไม่น้อยกว่า 6 ชั่วโมง ในคืนก่อนวันบริจาค ไม่อยู่ในภาวะอ่อนเพลีย
                  </p>
                </div>
              </div>

              <div className="win95-sunken p-3 bg-white flex items-start gap-3">
                <div className="win95-raised p-2 bg-[#7A1020] text-white shrink-0">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#7A1020]">2. ดื่มน้ำมากๆ</h3>
                  <p className="mt-1 text-[11px] text-gray-800 leading-relaxed">
                    ดื่มน้ำเปล่าประมาณ 3-4 แก้ว ก่อนบริจาค 30 นาที เพื่อเพิ่มปริมาณสารน้ำในร่างกาย
                  </p>
                </div>
              </div>

              <div className="win95-sunken p-3 bg-white flex items-start gap-3">
                <div className="win95-raised p-2 bg-[#7A1020] text-white shrink-0">
                  <Coffee className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#7A1020]">3. รับประทานอาหารมื้อหลัก</h3>
                  <p className="mt-1 text-[11px] text-gray-800 leading-relaxed">
                    รับประทานอาหารประจำมื้อ หลีกเลี่ยงอาหารที่มีไขมันสูงอย่างน้อย 6 ชั่วโมงก่อนบริจาค
                  </p>
                </div>
              </div>

              <div className="win95-sunken p-3 bg-white flex items-start gap-3">
                <div className="win95-raised p-2 bg-[#7A1020] text-white shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#7A1020]">4. งดแอลกอฮอล์และบุหรี่</h3>
                  <p className="mt-1 text-[11px] text-gray-800 leading-relaxed">
                    งดเครื่องดื่มแอลกอฮอล์อย่างน้อย 24 ชั่วโมง และงดสูบบุหรี่ก่อนและหลังบริจาค 1 ชั่วโมง
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            <div className="text-xs text-gray-800 font-bold">
              พร้อมบริจาคโลหิตแล้วหรือยัง?
            </div>
            
            <Link
              href="/register"
              className="win95-btn win95-btn-primary py-2.5 px-6 text-xs gap-2"
            >
              <span>ลงทะเบียนออนไลน์ทันที</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Statusbar */}
          <div className="win95-statusbar">
            <span>Help Topic ID: #GUIDE-95</span>
            <span>|</span>
            <span>MUMT Blood Donation 2026</span>
          </div>

        </div>

      </div>

    </div>
  );
}
