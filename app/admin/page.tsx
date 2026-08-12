import React from 'react';
import Link from 'next/link';
import { Users, UserCheck, Clock, Download, ArrowRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { getDashboardKPIs } from '@/services/admin-service';
import { getEventBySlug } from '@/services/event-service';

export default async function AdminDashboardPage() {
  const event = await getEventBySlug('mumt-2026');
  const kpis = event ? await getDashboardKPIs(event.id) : {
    totalRegistrations: 0,
    checkedInCount: 0,
    slotBreakdown: [],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0C4CC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="unit-tag text-[10px]">ADMIN CONTROL CENTER</span>
            <span className="unit-tag-outline text-[10px]">REAL-TIME ANALYTICS</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-editorial-ink sm:text-3xl">
            แดชบอร์ดบริหารจัดการกิจกรรม
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/registrations"
            className="editorial-btn-secondary py-2.5 px-4 text-xs"
          >
            <span>จัดการรายชื่อผู้ลงทะเบียน</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="/api/admin/export"
            download
            className="editorial-btn-primary py-2.5 px-4 text-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>ส่งออกไฟล์ Excel / CSV</span>
          </a>
        </div>
      </div>

      {/* Prominent Analytical Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="editorial-card p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-editorial-muted uppercase tracking-wider block">
            TOTAL REGISTRATIONS
          </span>
          <div className="text-3xl font-mono font-black text-[#7A1020]">
            {kpis.totalRegistrations} <span className="text-xs font-sans font-bold text-editorial-ink">คน</span>
          </div>
          <p className="text-[11px] text-editorial-muted font-medium">ผู้ลงทะเบียนทั้งหมดในระบบ</p>
        </div>

        <div className="editorial-card p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-editorial-muted uppercase tracking-wider block">
            CHECKED-IN DONORS
          </span>
          <div className="text-3xl font-mono font-black text-emerald-700">
            {kpis.checkedInCount} <span className="text-xs font-sans font-bold text-editorial-ink">คน</span>
          </div>
          <p className="text-[11px] text-editorial-muted font-medium">ผู้ที่มาบริจาคโลหิตและเช็คอินแล้ว</p>
        </div>

        <div className="editorial-card p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-editorial-muted uppercase tracking-wider block">
            CHECK-IN RATE
          </span>
          <div className="text-3xl font-mono font-black text-editorial-ink">
            {kpis.totalRegistrations > 0 
              ? `${Math.round((kpis.checkedInCount / kpis.totalRegistrations) * 100)}%` 
              : '0%'}
          </div>
          <p className="text-[11px] text-editorial-muted font-medium">สัดส่วนผู้มาเช็คอินจริง</p>
        </div>

        <div className="editorial-card p-5 space-y-2">
          <span className="text-[10px] font-mono font-bold text-[#7A1020] uppercase tracking-wider block">
            EVENT DATE
          </span>
          <div className="text-xl font-mono font-black text-[#7A1020]">
            16 SEP 2026
          </div>
          <p className="text-[11px] text-editorial-muted font-medium">08:00 - 15:00 น. อาคารสิริวิทยา</p>
        </div>

      </div>

      {/* Time Slot Capacity Distribution Forecast Table */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0C4CC] pb-3">
          <h2 className="text-sm font-black text-[#7A1020] uppercase tracking-wider">
            ความหนาแน่นของผู้ลงทะเบียนแยกตามรอบเวลา (TIMETABLE DISTRIBUTION)
          </h2>
          <span className="text-xs font-mono font-bold text-editorial-muted font-medium">Capacity Threshold: 50 / Slot</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-editorial-muted font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3 font-bold">รอบเวลา</th>
                <th className="py-2.5 px-3 font-bold">ความจุสูงสุด</th>
                <th className="py-2.5 px-3 font-bold">ผู้ลงทะเบียนแล้ว</th>
                <th className="py-2.5 px-3 font-bold">คงเหลือ</th>
                <th className="py-2.5 px-3 font-bold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {(kpis.slotBreakdown || []).map((slot: any) => {
                const isFull = slot.currentBooked >= slot.maxCapacity;
                const percent = Math.round((slot.currentBooked / slot.maxCapacity) * 100);

                return (
                  <tr key={slot.id} className="hover:bg-[#FFF9F9]">
                    <td className="py-3 px-3 font-mono font-black text-[#7A1020] text-sm">
                      {slot.timeSlot} น.
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">{slot.maxCapacity}</td>
                    <td className="py-3 px-3 font-mono font-bold text-editorial-ink">{slot.currentBooked} ({percent}%)</td>
                    <td className="py-3 px-3 font-mono font-bold">{slot.remainingCapacity}</td>
                    <td className="py-3 px-3">
                      {isFull ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-extrabold">เต็ม</span>
                      ) : percent >= 80 ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold">ใกล้เต็ม</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">ว่าง</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
