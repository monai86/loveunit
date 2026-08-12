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
        <h2 className="text-xl font-bold text-[#29272A]">ไม่พบข้อมูลกิจกรรม</h2>
      </div>
    );
  }

  const contentBlocks = await getEventContentBlocks(event.id);
  const locationInfographic = contentBlocks.find(b => b.content_key === 'location_infographic');
  const transportInfographic = contentBlocks.find(b => b.content_key === 'transportation_infographic');

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      
      {/* Title */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7A1020]/10 px-3 py-1 text-xs font-bold text-[#7A1020]">
          <MapPin className="h-3.5 w-3.5" />
          Venue & Directions
        </span>
        <h1 className="mt-3 text-3xl font-black text-[#29272A] sm:text-4xl">
          สถานที่จัดงานและการเดินทาง
        </h1>
        <p className="mt-2 text-xs text-gray-600 sm:text-sm max-w-xl mx-auto">
          {event.venue_name}
        </p>
      </div>

      {/* Primary Location Card */}
      <div className="mt-8 rounded-3xl border border-[#FCE8EC] bg-white p-6 shadow-sm sm:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-center">
          
          <div className="md:col-span-7">
            <span className="text-xs font-bold tracking-wider text-[#B42336] uppercase">Location Information</span>
            <h2 className="mt-1 text-xl font-extrabold text-[#29272A] sm:text-2xl">
              {event.venue_detail}
            </h2>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-gray-700">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#7A1020]" />
                <span>เวลาเปิดบริการ: {formatTimeRange(event.start_at, event.end_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#7A1020]" />
                <span>สอบถามเพิ่มเติม: 02-441-4370</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://maps.google.com/?q=Sirividhya+Building+Faculty+of+Liberal+Arts+Mahidol+University"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7A1020] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#8F1327]"
              >
                <Navigation className="h-4 w-4" />
                นำทางด้วย Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-inner bg-slate-100 aspect-video flex flex-col items-center justify-center p-4 text-center">
              <MapPin className="h-8 w-8 text-[#7A1020] mb-2 animate-bounce" />
              <span className="text-xs font-bold text-[#29272A]">แผนที่อาคารสิริวิทยา คณะศิลปศาสตร์</span>
              <span className="text-[10px] text-gray-500 mt-0.5">มหาวิทยาลัยมหิดล ศาลายา</span>
            </div>
          </div>

        </div>
      </div>

      {/* Infographics Grid */}
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <InfographicSlot
          contentKey="location_infographic"
          title={locationInfographic?.title || 'แผนที่ผังจุดบริการบริจาคโลหิต'}
          description={locationInfographic?.description || 'ผังห้องประชุม 217 และ 218 อาคารสิริวิทยา'}
          imageUrl={locationInfographic?.image_url}
          aspectRatio="poster"
        />

        <InfographicSlot
          contentKey="transportation_infographic"
          title={transportInfographic?.title || 'แนะนำการเดินทางและจุดจอดรถ'}
          description={transportInfographic?.description || 'การเดินทางด้วยรถประจำทาง รถรางมหิดล Tram และลานจอดรถยนต์'}
          imageUrl={transportInfographic?.image_url}
          aspectRatio="poster"
        />
      </div>

      {/* Transportation Modes Guide */}
      <div className="mt-12 rounded-3xl border border-[#FCE8EC] bg-white p-6 shadow-sm sm:p-10">
        <h2 className="text-xl font-extrabold text-[#29272A] border-b border-[#FCE8EC] pb-4">
          ตัวเลือกการเดินทาง
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          
          <div className="rounded-2xl bg-[#FFF9F9] p-5 border border-[#FCE8EC]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A1020] text-white">
              <Bus className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#29272A]">รถสาธารณะ / ขสมก.</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              สาย 84ก, 515, 547, 556 ลงหน้ามหาวิทยาลัยมหิดล ศาลายา แล้วต่อรถรางภายในมหาวิทยาลัย
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFF9F9] p-5 border border-[#FCE8EC]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B42336] text-white">
              <Navigation className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#29272A]">รถรางมหิดล (Mahidol Tram)</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              นั่งรถรางภายในมหาวิทยาลัย มาลงป้ายหน้าอาคารสิริวิทยา คณะศิลปศาสตร์
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFF9F9] p-5 border border-[#FCE8EC]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A1020] text-white">
              <Car className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#29272A]">รถยนต์ส่วนตัว & ที่จอดรถ</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              สามารถจอดรถได้ที่ ลานจอดรถอาคารสิริวิทยา หรือลานจอดรถศูนย์การเรียนรู้มหิดล (MLC)
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
