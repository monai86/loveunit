import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Bus, Car, Building, Phone, Clock, ExternalLink } from 'lucide-react';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
import { getEventContentBlocks, getEventBySlug } from '@/lib/db/store';
import { formatTimeRange } from '@/lib/utils/format';

export default async function LocationPage() {
  const event = await getEventBySlug('mumt-2026');

  if (!event) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="bloom-card p-8 text-center">
          <h2 className="text-lg font-bold text-red-700">ไม่พบข้อมูลกิจกรรม</h2>
        </div>
      </div>
    );
  }

  const contentBlocks = await getEventContentBlocks(event.id);
  const locationInfographic = contentBlocks.find(b => b.content_key === 'location_infographic');
  const transportInfographic = contentBlocks.find(b => b.content_key === 'transportation_infographic');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-10">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="bloom-badge py-1 px-3.5 text-xs">
          <MapPin className="h-3.5 w-3.5" />
          Venue & Directions
        </span>
        <h1 className="text-2xl font-black text-[#1F1A1C] sm:text-4xl">
          สถานที่จัดงานและการเดินทาง
        </h1>
        <p className="text-xs text-gray-600 sm:text-sm max-w-xl mx-auto">
          {event.venue_name}
        </p>
      </div>

      {/* Primary Location Card */}
      <div className="bloom-card p-6 sm:p-8 bg-white">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-[#B42336] uppercase">Location Information</span>
            <h2 className="mt-1 text-xl font-extrabold text-[#1F1A1C] sm:text-2xl">
              {event.venue_detail}
            </h2>
          </div>

          <div className="flex flex-col gap-3 text-xs font-medium text-gray-700 sm:flex-row sm:flex-wrap sm:gap-6 pt-2 border-t border-[#FCE8EC]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#7A1020]" />
              <span>เวลาเปิดบริการ: {formatTimeRange(event.start_at, event.end_at)}</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <Phone className="h-4 w-4 text-[#7A1020]" />
              <span>ติดต่อสอบถาม: คุณเปา <a href="tel:0969866245" className="hover:underline text-[#7A1020]">09-6986-6245</a>, คุณแตงโม <a href="tel:0656274319" className="hover:underline text-[#7A1020]">06-5627-4319</a></span>
            </div>
          </div>
        </div>
      </div>

      {/* Infographic Maps Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="bloom-card p-3 bg-white">
          <InfographicSlot
            contentKey="location_infographic"
            title={locationInfographic?.title || 'แผนที่สถานที่จัดงาน (อาคารสิริวิทยา)'}
            description={locationInfographic?.description}
            imageUrl={locationInfographic?.image_url}
            aspectRatio="banner"
          />
        </div>

        <div className="bloom-card p-3 bg-white">
          <InfographicSlot
            contentKey="transportation_infographic"
            title={transportInfographic?.title || 'แผนที่การเดินทางและจุดจอดรถ'}
            description={transportInfographic?.description}
            imageUrl={transportInfographic?.image_url}
            aspectRatio="banner"
          />
        </div>
      </div>

      {/* Transportation Cards */}
      <div className="bloom-card p-6 sm:p-8 bg-white space-y-6">
        <h2 className="text-xl font-extrabold text-[#1F1A1C] border-b border-[#FCE8EC] pb-4">
          คำแนะนำการเดินทาง
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          <div className="bloom-card p-5 bg-[#FFF8F9] border-[#F9D5DC]">
            <div className="flex items-center gap-2.5 text-xs font-extrabold text-[#7A1020] mb-2 border-b border-[#FCE8EC] pb-2">
              <Car className="h-5 w-5" /> รถยนต์ส่วนตัว
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              เดินทางมายัง มหาวิทยาลัยมหิดล ศาลายา สามารถจอดรถได้ที่ลานจอดรถอาคารสิริวิทยา หรืออาคารจอดรถกลางของมหาวิทยาลัย
            </p>
          </div>

          <div className="bloom-card p-5 bg-[#FFF8F9] border-[#F9D5DC]">
            <div className="flex items-center gap-2.5 text-xs font-extrabold text-[#7A1020] mb-2 border-b border-[#FCE8EC] pb-2">
              <Bus className="h-5 w-5" /> รถโดยสารประจำทาง / รถบัส
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              ใช้บริการรถโดยสารสาย 515, 84ก, 547 หรือรถรางสวัสดิการภายในมหาวิทยาลัยมหิดล มาลงที่หน้าอาคารสิริวิทยา (คณะศิลปศาสตร์)
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
