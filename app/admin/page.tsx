import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  Plus, 
  Eye, 
  Edit, 
  Search,
  Filter,
  Layers,
  Heart
} from 'lucide-react';
import { getDashboardKPIs } from '@/services/admin-service';
import { getEventBySlug } from '@/services/event-service';

export default async function AdminDashboardPage() {
  const event = await getEventBySlug('mumt-2026');
  const kpis = event ? await getDashboardKPIs(event.id) : {
    totalRegistrations: 2458,
    checkedInCount: 1862,
    slotBreakdown: [],
  };

  const kpiBlocks = [
    { title: 'ผู้ลงทะเบียนทั้งหมด', value: '2,458', unit: 'คน', change: '+12% จากสัปดาห์ที่แล้ว', isUp: true, icon: Users },
    { title: 'ผู้บริจาคโลหิต', value: '1,862', unit: 'คน', change: '+8% จากสัปดาห์ที่แล้ว', isUp: true, icon: UserCheck },
    { title: 'ปริมาณโลหิตที่ได้รับ', value: '836', unit: 'ยูนิต', change: '+10% จากสัปดาห์ที่แล้ว', isUp: true, icon: Heart },
    { title: 'นัดหมายวันนี้', value: '128', unit: 'คน', change: '+5% จากเมื่อวาน', isUp: true, icon: Calendar },
    { title: 'อัตรา No-Show', value: '9.2%', unit: '', change: '-1.3% จากสัปดาห์ที่แล้ว', isUp: false, icon: Clock },
  ];

  const utilizationSlots = [
    { time: '08:00 - 09:00', percent: 78, booked: 78, max: 100, isOver: false },
    { time: '09:00 - 10:00', percent: 92, booked: 92, max: 100, isOver: false },
    { time: '10:00 - 11:00', percent: 112, booked: 112, max: 100, isOver: true },
    { time: '11:00 - 12:00', percent: 85, booked: 85, max: 100, isOver: false },
    { time: '13:00 - 14:00', percent: 63, booked: 63, max: 100, isOver: false },
    { time: '14:00 - 15:00', percent: 48, booked: 48, max: 100, isOver: false },
  ];

  const sampleRegistrations = [
    { code: 'REG-2026-00123', name: 'กิตติพงษ์ อินทร์ดี', phone: '081-234-5678', date: '16 ก.ย. 2026', time: '08:00 - 09:00', status: 'ยิรยันแล้ว', type: 'บริจาคโลหิต', dept: 'นักศึกษา', statusBg: 'bg-emerald-100 text-emerald-800' },
    { code: 'REG-2026-00124', name: 'พัชราภรณ์ วงค์สกุล', phone: '099-876-5432', date: '16 ก.ย. 2026', time: '09:00 - 10:00', status: 'รอการยืนยัน', type: 'บริจาคโลหิต', dept: 'บุคลากร', statusBg: 'bg-amber-100 text-amber-800' },
    { code: 'REG-2026-00125', name: 'วีรภัทร แสงทอง', phone: '080-111-2233', date: '16 ก.ย. 2026', time: '10:00 - 11:00', status: 'มาถึงแล้ว', type: 'บริจาคโลหิต', dept: 'ศิษย์เก่า', statusBg: 'bg-blue-100 text-blue-800' },
    { code: 'REG-2026-00126', name: 'ณัฐชา ศรีรุ่งเรือง', phone: '065-444-7788', date: '16 ก.ย. 2026', time: '11:00 - 12:00', status: 'ไม่มาตามนัด', type: 'บริจาคโลหิต', dept: 'บุคคลทั่วไป', statusBg: 'bg-red-100 text-red-800' },
    { code: 'REG-2026-00127', name: 'ธนพล อยู่สุข', phone: '090-555-9988', date: '16 ก.ย. 2026', time: '13:00 - 14:00', status: 'ยกเลิก', type: 'บริจาคโลหิต', dept: 'นักศึกษา', statusBg: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Header Matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5C7B8] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#8E0015] text-white flex items-center justify-center font-black">
            <Heart className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-[#8E0015] uppercase">ADMIN DASHBOARD • UI KIT</span>
              <span className="unit-tag-outline text-[9px]">UNIT 09</span>
            </div>
            <h1 className="text-xl font-black text-[#282828] sm:text-2xl">
              ระบบบริหารจัดการ การบริจาคโลหิต MUMT BLOOD DONATION 2026
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export"
            download
            className="inline-flex items-center gap-1.5 bg-[#8E0015] hover:bg-[#7A1020] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>ส่งออกข้อมูล Excel</span>
          </a>
        </div>
      </div>

      {/* 1. KPI NUMBER BLOCKS MATCHING IMAGE 1 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#8E0015] uppercase">1. KPI NUMBER BLOCKS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {kpiBlocks.map((block, idx) => {
            const Icon = block.icon;
            return (
              <div key={idx} className="bg-white border border-[#D5C7B8] rounded-xl p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#666666]">{block.title}</span>
                  <Icon className="h-4 w-4 text-[#8E0015]" />
                </div>
                <div className="text-2xl font-mono font-black text-[#282828]">
                  {block.value} <span className="text-xs font-sans font-bold text-[#666666]">{block.unit}</span>
                </div>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${block.isUp ? 'text-emerald-700' : 'text-emerald-700'}`}>
                  {block.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{block.change}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2 & 3: ARRIVAL FORECAST & TIME-SLOT UTILIZATION MATCHING IMAGE 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 2. Arrival Forecast Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#D5C7B8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D5C7B8] pb-3">
            <span className="text-xs font-mono font-bold text-[#8E0015] uppercase">
              2. ARRIVAL FORECAST (แนวโน้มผู้มาถึง)
            </span>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-[#666666]">
                <span className="h-2 w-4 border-b-2 border-dashed border-[#8E0015]"></span> คาดการณ์
              </span>
              <span className="flex items-center gap-1 text-[#8E0015]">
                <span className="h-2 w-4 bg-[#8E0015] rounded"></span> มาถึงจริง
              </span>
            </div>
          </div>

          {/* Simulated Arrival Forecast Curve Graph SVG */}
          <div className="relative h-48 w-full pt-4">
            <svg viewBox="0 0 600 160" className="h-full w-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="#E9E1D9" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="#E9E1D9" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#E9E1D9" strokeDasharray="3 3" />

              {/* Dotted Forecast Curve */}
              <path 
                d="M 20,130 Q 120,110 200,60 T 380,30 T 500,90 T 580,130" 
                fill="none" 
                stroke="#C13A2B" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
              />

              {/* Solid Actual Curve */}
              <path 
                d="M 20,140 Q 120,115 200,65 T 380,25 T 500,85 T 580,125" 
                fill="none" 
                stroke="#8E0015" 
                strokeWidth="3" 
              />

              {/* Peak Tooltip Callout at 11:00 */}
              <g transform="translate(380, 25)">
                <circle r="5" fill="#8E0015" />
                <rect x="-35" y="-32" width="70" height="24" rx="6" fill="#8E0015" />
                <text x="0" y="-20" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">11:00</text>
                <text x="0" y="-10" fill="white" fontSize="9" textAnchor="middle">142 คน</text>
              </g>
            </svg>

            <div className="flex justify-between text-[10px] font-mono text-[#666666] pt-2">
              <span>07:00</span>
              <span>08:00</span>
              <span>09:00</span>
              <span>10:00</span>
              <span>11:00</span>
              <span>12:00</span>
              <span>13:00</span>
              <span>14:00</span>
              <span>15:00</span>
            </div>
          </div>
        </div>

        {/* 3. Time-Slot Utilization Bars (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#D5C7B8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D5C7B8] pb-3">
            <span className="text-xs font-mono font-bold text-[#8E0015] uppercase">
              3. TIME-SLOT UTILIZATION (การใช้เวลาแต่ละรอบ)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {utilizationSlots.map((slot, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-[#282828]">{slot.time}</span>
                  <div className="flex items-center gap-3">
                    <span className={slot.isOver ? 'text-red-600 font-black' : 'text-[#666666]'}>{slot.percent}%</span>
                    <span className={`text-[11px] ${slot.isOver ? 'text-red-600 font-black' : 'text-[#282828]'}`}>
                      {slot.booked} / {slot.max}
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-[#E9E1D9] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${slot.isOver ? 'bg-red-600' : 'bg-[#8E0015]'}`} 
                    style={{ width: `${Math.min(slot.percent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. REGISTRATION DATA TABLE MATCHING IMAGE 1 */}
      <section className="bg-white border border-[#D5C7B8] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5C7B8] pb-4">
          <span className="text-xs font-mono font-bold text-[#8E0015] uppercase">
            4. REGISTRATION DATA TABLE (ตารางข้อมูลการลงทะเบียน)
          </span>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select className="editorial-input py-1.5 px-3 text-xs w-auto">
              <option>วันที่จัดกิจกรรม: ทั้งหมด</option>
            </select>

            <select className="editorial-input py-1.5 px-3 text-xs w-auto">
              <option>สถานะ: ทั้งหมด</option>
            </select>

            <div className="flex gap-1">
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..." 
                className="editorial-input py-1.5 px-3 text-xs w-48"
              />
              <button className="editorial-btn-primary py-1.5 px-3 text-xs">
                <span>ค้นหา</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D5C7B8] text-[#666666] font-mono uppercase text-[10px]">
                <th className="py-3 px-3"><input type="checkbox" className="rounded" /></th>
                <th className="py-3 px-3 font-bold">รหัสลงทะเบียน</th>
                <th className="py-3 px-3 font-bold">ชื่อ-นามสกุล</th>
                <th className="py-3 px-3 font-bold">เบอร์โทร</th>
                <th className="py-3 px-3 font-bold">วันที่นัดหมาย</th>
                <th className="py-3 px-3 font-bold">รอบเวลา</th>
                <th className="py-3 px-3 font-bold">สถานะ</th>
                <th className="py-3 px-3 font-bold">ประเภท</th>
                <th className="py-3 px-3 font-bold">หน่วยงาน</th>
                <th className="py-3 px-3 font-bold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-[#282828]">
              {sampleRegistrations.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F7F3EE]">
                  <td className="py-3 px-3"><input type="checkbox" className="rounded" /></td>
                  <td className="py-3 px-3 font-mono font-bold text-[#8E0015]">{row.code}</td>
                  <td className="py-3 px-3 font-bold">{row.name}</td>
                  <td className="py-3 px-3 font-mono">{row.phone}</td>
                  <td className="py-3 px-3">{row.date}</td>
                  <td className="py-3 px-3 font-mono font-bold">{row.time}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${row.statusBg}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">{row.type}</td>
                  <td className="py-3 px-3">{row.dept}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <button className="hover:text-[#8E0015]"><Eye className="h-4 w-4" /></button>
                      <button className="hover:text-[#8E0015]"><Edit className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#D5C7B8] text-xs font-medium text-[#666666]">
          <span>แสดง 1-5 จาก 2,458 รายการ</span>
          <div className="flex items-center gap-1 font-mono">
            <button className="px-2.5 py-1 rounded bg-[#8E0015] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200">2</button>
            <button className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200">3</button>
            <span>...</span>
            <button className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200">492</button>
          </div>
        </div>
      </section>

      {/* 5. CONTENT MANAGEMENT CARDS MATCHING IMAGE 1 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#8E0015] uppercase">
            5. CONTENT MANAGEMENT (จัดการเนื้อหา / อินโฟกราฟิก)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[#D5C7B8] rounded-2xl p-5 space-y-3 text-center shadow-xs">
            <div className="h-28 w-full rounded-xl bg-[#F7F3EE] flex items-center justify-center text-gray-400">
              🖼️
            </div>
            <h4 className="text-xs font-black text-[#282828]">ขั้นตอนการบริจาค</h4>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold inline-block">เผยแพร่แล้ว</span>
          </div>

          <div className="bg-white border border-[#D5C7B8] rounded-2xl p-5 space-y-3 text-center shadow-xs">
            <div className="h-28 w-full rounded-xl bg-[#F7F3EE] flex items-center justify-center text-gray-400">
              🖼️
            </div>
            <h4 className="text-xs font-black text-[#282828]">สิ่งที่ควรทำ-ไม่ควรทำ</h4>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold inline-block">เผยแพร่แล้ว</span>
          </div>

          <div className="bg-white border border-[#D5C7B8] rounded-2xl p-5 space-y-3 text-center shadow-xs">
            <div className="h-28 w-full rounded-xl bg-[#F7F3EE] flex items-center justify-center text-gray-400">
              🖼️
            </div>
            <h4 className="text-xs font-black text-[#282828]">คุณสมบัติผู้บริจาค</h4>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold inline-block">ร่างเผยแพร่</span>
          </div>

          <div className="border-2 border-dashed border-[#8E0015] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-[#8E0015] bg-[#F7F3EE]/50 hover:bg-[#F7F3EE] transition-all cursor-pointer">
            <Plus className="h-8 w-8" />
            <span className="text-xs font-black">เพิ่มเนื้อหาใหม่</span>
          </div>
        </div>
      </section>

    </div>
  );
}
