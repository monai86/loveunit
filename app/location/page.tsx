import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Bus, Car, Building, Phone, Clock, ExternalLink, Monitor, Folder } from 'lucide-react';
import { InfographicSlot } from '@/components/infographic/InfographicSlot';
import { getEventContentBlocks, getEventBySlug } from '@/lib/db/store';
import { formatTimeRange } from '@/lib/utils/format';

export default async function LocationPage() {
  const event = await getEventBySlug('mumt-2026');

  if (!event) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="win95-window p-6 text-center">
          <h2 className="text-base font-bold text-red-700">ไม่พบข้อมูลกิจกรรม</h2>
        </div>
      </div>
    );
  }

  const contentBlocks = await getEventContentBlocks(event.id);
  const locationInfographic = contentBlocks.find(b => b.content_key === 'location_infographic');
  const transportInfographic = contentBlocks.find(b => b.content_key === 'transportation_infographic');

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6">
      
      {/* WIN95 EXPLORER WINDOW CONTAINER */}
      <div className="win95-window">
        
        {/* Title Bar */}
        <div className="win95-titlebar">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-amber-300 fill-amber-300" />
            <span className="font-extrabold text-xs sm:text-sm text-white">
              C:\MUMT2026\Location & Venue Map.exe
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="win95-control-btn">_</span>
            <span className="win95-control-btn">▢</span>
            <span className="win95-control-btn text-red-900">X</span>
          </div>
        </div>

        {/* Win95 Explorer Body */}
        <div className="p-4 sm:p-6 bg-[#C0C0C0] space-y-6">
          
          {/* Location Header */}
          <div className="win95-sunken p-4 bg-white">
            <span className="win95-raised px-2 py-0.5 text-xs font-bold bg-[#7A1020] text-white inline-block mb-2">
              Mahidol University Salaya
            </span>
            <h1 className="text-xl font-black text-black sm:text-2xl">
              {event.venue_name}
            </h1>
            <p className="mt-1 text-xs text-gray-700 sm:text-sm font-bold">
              {event.venue_detail}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold text-gray-800 border-t pt-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#7A1020]" />
                <span>เวลาเปิดบริการ: {formatTimeRange(event.start_at, event.end_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#7A1020]" />
                <span>คุณเปา <a href="tel:0969866245" className="hover:underline text-[#7A1020]">09-6986-6245</a>, คุณแตงโม <a href="tel:0656274319" className="hover:underline text-[#7A1020]">06-5627-4319</a></span>
              </div>
            </div>
          </div>

          {/* Infographic Maps Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="win95-sunken p-2 bg-white">
              <InfographicSlot
                contentKey="location_infographic"
                title={locationInfographic?.title || 'แผนที่สถานที่จัดงาน (อาคารสิริวิทยา)'}
                description={locationInfographic?.description}
                imageUrl={locationInfographic?.image_url}
                aspectRatio="banner"
              />
            </div>

            <div className="win95-sunken p-2 bg-white">
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
          <div className="win95-raised p-4 bg-[#C0C0C0]">
            <div className="win95-titlebar mb-4">
              <span>EXPLORER: คำแนะนำการเดินทาง</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              
              <div className="win95-sunken p-3.5 bg-white">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#7A1020] mb-2 border-b pb-1">
                  <Car className="h-4 w-4" /> รถยนต์ส่วนตัว
                </div>
                <p className="text-xs text-gray-800 leading-relaxed">
                  เดินทางมายัง มหาวิทยาลัยมหิดล ศาลายา สามารถจอดรถได้ที่ลานจอดรถอาคารสิริวิทยา หรืออาคารจอดรถกลางของมหาวิทยาลัย
                </p>
              </div>

              <div className="win95-sunken p-3.5 bg-[#FFFFFF]">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#7A1020] mb-2 border-b pb-1">
                  <Bus className="h-4 w-4" /> รถโดยสารประจำทาง / รถบัส
                </div>
                <p className="text-xs text-gray-800 leading-relaxed">
                  ใช้บริการรถโดยสารสาย 515, 84ก, 547 หรือรถรางสวัสดิการภายในมหาวิทยาลัยมหิดล มาลงที่หน้าอาคารสิริวิทยา (คณะศิลปศาสตร์)
                </p>
              </div>

            </div>
          </div>

          {/* Statusbar */}
          <div className="win95-statusbar">
            <span>Location: Salaya Campus</span>
            <span>|</span>
            <span>Sirividhya Building (Room 217-218)</span>
          </div>

        </div>

      </div>

    </div>
  );
}
