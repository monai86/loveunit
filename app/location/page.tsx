import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Bus, Car, ArrowRight } from 'lucide-react';
import { getEventBySlug, getEventContentBlocks } from '@/services/event-service';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';

export default async function LocationPage() {
  const event = await getEventBySlug('mumt-2026');
  const contentBlocks = event ? await getEventContentBlocks(event.id) : [];
  const locationInfographic = contentBlocks.find(b => (b as any).contentKey === 'location_infographic' || (b as any).content_key === 'location_infographic');
  const transportInfographic = contentBlocks.find(b => (b as any).contentKey === 'transportation_infographic' || (b as any).content_key === 'transportation_infographic');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      
      {/* Header */}
      <div className="border-b border-[#F0C4CC] pb-4">
        <div className="flex items-center gap-2">
          <span className="unit-tag text-[10px]">UNIT 04 / LOCATION & MAP</span>
          <span className="unit-tag-outline text-[10px]">แผนที่สถานที่และการเดินทาง</span>
        </div>
        <h1 className="mt-2 text-3xl font-black text-editorial-ink sm:text-4xl">
          สถานที่จัดงานและการเดินทาง
        </h1>
        <p className="mt-1 text-xs text-editorial-muted font-medium max-w-2xl">
          อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา
        </p>
      </div>

      {/* Main Location Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Venue Details (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          
          <div className="editorial-card p-6 space-y-4">
            <h2 className="text-base font-black text-[#7A1020] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
              📍 จุดจัดงานหลัก
            </h2>
            <div className="space-y-2 text-xs font-bold text-editorial-ink">
              <p className="text-sm font-black text-[#7A1020]">ห้องประชุม 217 และ 218</p>
              <p className="leading-relaxed text-editorial-muted font-medium">
                ชั้น 2 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา
              </p>
              <div className="pt-2">
                <span className="unit-tag-outline text-[10px]">
                  วันพุธที่ 16 กันยายน 2569 (08:00 - 15:00 น.)
                </span>
              </div>
            </div>
          </div>

          <div className="editorial-card p-6 space-y-4">
            <h2 className="text-base font-black text-[#7A1020] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
              🚍 การเดินทางมายังวิทยาเขตศาลายา
            </h2>
            <ul className="space-y-3 text-xs font-bold text-editorial-ink">
              <li className="flex items-start gap-2.5">
                <Bus className="h-4.5 w-4.5 text-[#7A1020] shrink-0 mt-0.5" />
                <span>รถ Tram สวัสดิการ ม.มหิดล: สาย 1, สาย 2 ลงหน้าอาคารสิริวิทยา</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Car className="h-4.5 w-4.5 text-[#7A1020] shrink-0 mt-0.5" />
                <span>รถยนต์ส่วนตัว: จอด ณ ลานจอดรถอาคารสิริวิทยา หรือลานจอดรถศูนย์เรียนรู้ (MLC)</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <Link href="/register" className="editorial-btn-primary py-3.5 px-8 text-xs w-full justify-center">
              <span>ลงทะเบียนบริจาคโลหิตออนไลน์</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {/* Right Infographic Maps (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="editorial-card p-3">
            <InfographicSlot
              contentKey="location_infographic"
              title={locationInfographic?.title || 'แผนที่สถานที่จัดงาน (อาคารสิริวิทยา)'}
              description={locationInfographic?.description || undefined}
              imageUrl={(locationInfographic as any)?.imageUrl || (locationInfographic as any)?.image_url}
              altText={(locationInfographic as any)?.altText || (locationInfographic as any)?.alt_text}
              aspectRatio="banner"
            />
          </div>

          <div className="editorial-card p-3">
            <InfographicSlot
              contentKey="transportation_infographic"
              title={transportInfographic?.title || 'การเดินทางและจุดจอดรถ'}
              description={transportInfographic?.description || undefined}
              imageUrl={(transportInfographic as any)?.imageUrl || (transportInfographic as any)?.image_url}
              altText={(transportInfographic as any)?.altText || (transportInfographic as any)?.alt_text}
              aspectRatio="banner"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
