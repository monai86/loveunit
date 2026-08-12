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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      
      {/* Page Title */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7A1020]/10 px-3 py-1 text-xs font-bold text-[#7A1020]">
          <BookOpen className="h-3.5 w-3.5" />
          Donor Preparation Guide
        </span>
        <h1 className="mt-3 text-3xl font-black text-[#29272A] sm:text-4xl">
          การเตรียมตัวก่อนบริจาคโลหิต
        </h1>
        <p className="mt-2 text-xs text-gray-600 sm:text-sm max-w-xl mx-auto">
          ข้อปฏิบัติตัวเพื่อให้การบริจาคโลหิตของท่านเป็นไปอย่างราบรื่น ปลอดภัย และสดชื่นหลังบริจาค
        </p>
      </div>

      {/* Infographic Slots Grid */}
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <InfographicSlot
          contentKey="preparation_infographic"
          title={prepInfographic?.title || 'โปสเตอร์ข้อปฏิบัติตัวก่อนบริจาคโลหิต'}
          description={prepInfographic?.description}
          imageUrl={prepInfographic?.image_url}
          aspectRatio="poster"
        />

        <InfographicSlot
          contentKey="what_to_bring"
          title={whatToBring?.title || 'สิ่งที่ต้องเตรียมมาในวันบริจาคโลหิต'}
          description={whatToBring?.description}
          imageUrl={whatToBring?.image_url}
          aspectRatio="poster"
        />
      </div>

      {/* Key Preparation Pillars */}
      <div className="mt-12 rounded-3xl border border-[#FCE8EC] bg-white p-6 shadow-sm sm:p-10">
        <h2 className="text-xl font-extrabold text-[#29272A] border-b border-[#FCE8EC] pb-4">
          4 ข้อปฏิบัติสำคัญก่อนบริจาคโลหิต
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          <div className="flex items-start gap-4 rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A1020] text-white">
              <Moon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#29272A] text-sm">1. พักผ่อนให้เพียงพอ</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                ควรนอนหลับพักผ่อนอย่างน้อย 6-8 ชั่วโมงต่อเนื่องในคืนก่อนวันบริจาค ไม่อยู่ในภาวะอ่อนเพลีย
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#B42336] text-white">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#29272A] text-sm">2. ดื่มน้ำสะอาดเพิ่มขึ้น</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                ดื่มน้ำเปล่าประมาณ 3-4 แก้ว (300-500 ซีซี) ก่อนบริจาค 30 นาที ช่วยให้หลอดเลือดพองโตและป้องกันอาการหน้ามืด
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A1020] text-white">
              <Coffee className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#29272A] text-sm">3. งดอาหารไขมันสูง</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                รับประทานอาหารมื้อหลักล่วงหน้า 1-2 ชม. แต่ควรงดอาหารมัน ข้าวขาหมู อาหารทอด ของหวานกะทิ 6 ชั่วโมงก่อนบริจาค
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#B42336] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#29272A] text-sm">4. สุขภาพแข็งแรงสมบูรณ์</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                ไม่มีไข้ ไม่เป็นหวัดหรือเจ็บคอ ไม่อยู่ระหว่างทานยาปฏิชีวนะ 7 วัน และงดเครื่องดื่มแอลกอฮอล์ 24 ชม.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* CTA Bar */}
      <div className="mt-10 rounded-3xl bg-gradient-to-r from-[#7A1020] to-[#B42336] p-8 text-center text-white shadow-xl">
        <h3 className="text-xl font-black">พร้อมที่จะร่วมทำกุศลยิ่งใหญ่แล้วหรือยัง?</h3>
        <p className="mt-1 text-xs text-red-100">
          ลงทะเบียนล่วงหน้าเพื่อสำรองช่วงเวลาเดินทางมาถึง สะดวกรวดเร็วในวันงาน
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-extrabold text-[#7A1020] shadow-lg transition-transform hover:scale-105"
          >
            <Heart className="h-4 w-4 fill-[#7A1020]" />
            ลงทะเบียนบริจาคโลหิตตอนนี้
          </Link>
        </div>
      </div>

    </div>
  );
}
