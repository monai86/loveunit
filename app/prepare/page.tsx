import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, AlertCircle, ArrowRight, Heart } from 'lucide-react';
import { getEventBySlug, getEventContentBlocks } from '@/services/event-service';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
import { pickField } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function PreparePage() {
  const event = await getEventBySlug('mumt-2026');
  const contentBlocks = event ? await getEventContentBlocks(event.id) : [];
  const prepInfographic = contentBlocks.find(b => pickField<string>(b, 'contentKey', 'content_key') === 'preparation_infographic');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      
      {/* Header */}
      <div className="max-w-2xl pb-6 border-b border-[var(--line)]">
        <h1 className="text-3xl font-black text-[var(--ink)] sm:text-4xl">
          คู่มือและการเตรียมตัวก่อนบริจาคโลหิต
        </h1>
        <p className="mt-2 text-[15px] text-[var(--muted)] font-medium leading-relaxed">
          การเตรียมร่างกายให้พร้อมเป็นสิ่งสำคัญ เพื่อให้การบริจาคโลหิตเป็นไปอย่างปลอดภัยและราบรื่น
        </p>
      </div>

      {/* Main Editorial Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Checklist & Guidelines (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          
          <div className="editorial-card p-6 space-y-4">
            <h2 className="text-base font-black text-[var(--burgundy-700)] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
              1. สิ่งที่ต้องทำก่อนเดินทางมาบริจาค (Before Donation)
            </h2>
            <ul className="space-y-3 text-xs font-bold text-editorial-ink">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>นอนหลับพักผ่อนให้เพียงพอ ไม่น้อยกว่า 6 ชั่วโมงติดต่อกัน</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>ดื่มน้ำเปล่า 3-4 แก้ว (ประมาณ 500-600 มล.) ก่อนบริจาค 30 นาที ช่วยเพิ่มปริมาณพลาสม่า</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>รับประทานอาหารมื้อหลักก่อนมาบริจาค (หลีกเลี่ยงอาหารที่มีไขมันสูง เช่น ข้าวขาหมู แกงกะทิ)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>งดเครื่องดื่มแอลกอฮอล์ทุกชนิดอย่างน้อย 24 ชั่วโมงก่อนบริจาค</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>งดสูบบุหรี่ก่อนและหลังบริจาคอย่างน้อย 1 ชั่วโมง</span>
              </li>
            </ul>
          </div>

          <div className="editorial-card p-6 space-y-4">
            <h2 className="text-base font-black text-[var(--burgundy-700)] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
              2. เอกสารและของที่ต้องนำมา
            </h2>
            <ul className="space-y-3 text-xs font-bold text-editorial-ink">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>บัตรประจำตัวประชาชนตัวจริง หรือบัตรที่รัฐออกให้ (ที่มีเลข 13 หลัก)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-[var(--burgundy-700)] shrink-0 mt-0.5" />
                <span>QR Code สแกนลงทะเบียนออนไลน์ (จากหน้ายืนยันการลงทะเบียน)</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
              <span>ข้อควรระวังสำคัญ</span>
            </div>
            <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
              หากมีอาการไข้ เจ็บคอ ท้องเสีย หรือเพิ่งรับประทานยาปฏิชีวนะ ยาแก้อักเสบ ภายใน 7 วันก่อนบริจาค กรุณาแจ้งเจ้าหน้าที่คัดกรองก่อนบริจาค
            </p>
          </div>

          <div className="pt-2">
            <Link href="/register" className="editorial-btn-primary py-3.5 px-8 text-xs">
              <span>ลงทะเบียนบริจาคโลหิตออนไลน์</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {/* Right Column: Infographic Slot (5 Cols) */}
        <div className="md:col-span-5">
          <div className="editorial-card p-3">
            <InfographicSlot
              contentKey="preparation_infographic"
              title={prepInfographic?.title || 'อินโฟกราฟิกการเตรียมตัวก่อนบริจาคโลหิต'}
              description={prepInfographic?.description || undefined}
              imageUrl={pickField<string>(prepInfographic, 'imageUrl', 'image_url')}
              altText={pickField<string>(prepInfographic, 'altText', 'alt_text')}
              aspectRatio="poster"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
