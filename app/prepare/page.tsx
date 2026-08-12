import React from 'react';
import Link from 'next/link';
import { Heart, BookOpen, CheckCircle2, AlertTriangle, Droplets, Moon, Coffee, ShieldCheck, ArrowRight } from 'lucide-react';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
import { getEventContentBlocks, getEventBySlug } from '@/lib/db/store';

export default async function PreparePage() {
  const event = await getEventBySlug('mumt-2026');
  const contentBlocks = await getEventContentBlocks(event?.id || '');
  const prepInfographic = contentBlocks.find(b => b.content_key === 'preparation_infographic');
  const whatToBring = contentBlocks.find(b => b.content_key === 'what_to_bring');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-10">
      
      {/* Title Header Banner */}
      <div className="text-center space-y-2">
        <span className="bloom-badge py-1 px-3.5 text-xs">
          <BookOpen className="h-3.5 w-3.5" />
          Donor Preparation Guide
        </span>
        <h1 className="text-2xl font-black text-[#1F1A1C] sm:text-4xl">
          การเตรียมตัวก่อนบริจาคโลหิต
        </h1>
        <p className="text-xs text-gray-600 sm:text-sm max-w-xl mx-auto">
          ข้อปฏิบัติตัวเพื่อให้การบริจาคโลหิตของท่านเป็นไปอย่างราบรื่น ปลอดภัย และสดชื่นหลังบริจาค
        </p>
      </div>

      {/* Infographic Slots Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="bloom-card p-3 bg-white">
          <InfographicSlot
            contentKey="preparation_infographic"
            title={prepInfographic?.title || 'โปสเตอร์ข้อปฏิบัติตัวก่อนบริจาคโลหิต'}
            description={prepInfographic?.description}
            imageUrl={prepInfographic?.image_url}
            aspectRatio="poster"
          />
        </div>

        <div className="bloom-card p-3 bg-white">
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
      <div className="bloom-card p-6 sm:p-10 bg-white space-y-6">
        <h2 className="text-xl font-extrabold text-[#1F1A1C] border-b border-[#FCE8EC] pb-4">
          4 ข้อปฏิบัติสำคัญก่อนบริจาคโลหิต
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          <div className="bloom-card p-5 bg-[#FFF8F9] flex items-start gap-4 border-[#F9D5DC]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A1020] text-white shadow-sm">
              <Moon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#7A1020]">1. พักผ่อนให้เพียงพอ</h3>
              <p className="mt-1 text-xs text-gray-700 leading-relaxed">
                นอนหลับพักผ่อนต่อเนื่องไม่น้อยกว่า 6 ชั่วโมง ในคืนก่อนวันบริจาค ไม่อยู่ในภาวะอ่อนเพลีย
              </p>
            </div>
          </div>

          <div className="bloom-card p-5 bg-[#FFF8F9] flex items-start gap-4 border-[#F9D5DC]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A1020] text-white shadow-sm">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#7A1020]">2. ดื่มน้ำมากๆ</h3>
              <p className="mt-1 text-xs text-gray-700 leading-relaxed">
                ดื่มน้ำเปล่าประมาณ 3-4 แก้ว ก่อนบริจาค 30 นาที เพื่อเพิ่มปริมาณสารน้ำในร่างกาย
              </p>
            </div>
          </div>

          <div className="bloom-card p-5 bg-[#FFF8F9] flex items-start gap-4 border-[#F9D5DC]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A1020] text-white shadow-sm">
              <Coffee className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#7A1020]">3. รับประทานอาหารมื้อหลัก</h3>
              <p className="mt-1 text-xs text-gray-700 leading-relaxed">
                รับประทานอาหารประจำมื้อ หลีกเลี่ยงอาหารที่มีไขมันสูงอย่างน้อย 6 ชั่วโมงก่อนบริจาค
              </p>
            </div>
          </div>

          <div className="bloom-card p-5 bg-[#FFF8F9] flex items-start gap-4 border-[#F9D5DC]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A1020] text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#7A1020]">4. งดแอลกอฮอล์และบุหรี่</h3>
              <p className="mt-1 text-xs text-gray-700 leading-relaxed">
                งดเครื่องดื่มแอลกอฮอล์อย่างน้อย 24 ชั่วโมง และงดสูบบุหรี่ก่อนและหลังบริจาค 1 ชั่วโมง
              </p>
            </div>
          </div>

        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#FCE8EC]">
          <span className="text-xs font-bold text-gray-700">
            พร้อมบริจาคโลหิตแล้วหรือยัง?
          </span>
          <Link
            href="/register"
            className="bloom-btn-primary py-3 px-6 text-xs"
          >
            <span>ลงทะเบียนบริจาคโลหิตออนไลน์</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
