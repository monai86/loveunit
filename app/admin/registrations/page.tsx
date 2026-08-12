'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ArrowLeft,
  Loader2,
  XCircle,
  Eye
} from 'lucide-react';
import { Registration } from '@/lib/types/database';
import { formatTimeRange, getParticipantTypeLabel, getRegistrationStatusBadge, getDonationExperienceLabel, formatThaiDate } from '@/lib/utils/format';

export default function AdminRegistrationsPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterExperience, setFilterExperience] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/registrations?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setRegistrations(data.registrations || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery]);

  // Client-side filtering
  const filteredList = registrations.filter(r => {
    if (filterType !== 'ALL' && r.participant_type !== filterType) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (filterExperience !== 'ALL' && r.donation_experience !== filterExperience) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#FCE8EC] pb-6">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-xs font-bold text-[#7A1020] hover:underline mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> กลับหน้า Dashboard
          </Link>
          <h1 className="text-2xl font-black text-[#29272A] sm:text-3xl">
            รายชื่อผู้ลงทะเบียนบริจาคโลหิต ({filteredList.length})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7A1020] to-[#B42336] px-4 py-2.5 text-xs font-bold text-white shadow hover:scale-105"
          >
            <FileSpreadsheet className="h-4 w-4" />
            ดาวน์โหลดไฟล์ Excel (.xlsx)
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 rounded-3xl border border-[#FCE8EC] bg-white p-4 shadow-sm space-y-4">
        
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหารหัสลงทะเบียน, ชื่อ-นามสกุล, หรือเบอร์โทรศัพท์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-[#29272A] focus:ring-2 focus:ring-[#7A1020]"
            >
              <option value="ALL">-- ทุกประเภทผู้เข้าร่วม --</option>
              <option value="STUDENT">นักศึกษามหิดล</option>
              <option value="STAFF">บุคลากรมหิดล</option>
              <option value="GENERAL_PUBLIC">บุคคลทั่วไป</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-[#29272A] focus:ring-2 focus:ring-[#7A1020]"
            >
              <option value="ALL">-- ทุกสถานะ --</option>
              <option value="REGISTERED">ลงทะเบียนแล้ว</option>
              <option value="CHECKED_IN">เช็คอินแล้ว</option>
              <option value="COMPLETED">เสร็จสิ้น</option>
              <option value="CANCELLED">ยกเลิกแล้ว</option>
            </select>

            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold text-[#29272A] focus:ring-2 focus:ring-[#7A1020]"
            >
              <option value="ALL">-- ทุกประสบการณ์ --</option>
              <option value="FIRST_TIME">บริจาคครั้งแรก</option>
              <option value="RETURNING">เคยบริจาคแล้ว</option>
            </select>

          </div>

        </div>

      </div>

      {/* Table Data View */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-[#FCE8EC] bg-white shadow-sm">
        {loading ? (
          <div className="flex py-16 justify-center items-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#7A1020]" />
            กำลังโหลดข้อมูลรายชื่อ...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500">
            ไม่พบข้อมูลผู้ลงทะเบียนตามเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#29272A]">
              <thead className="bg-[#FFF9F9] border-b border-[#FCE8EC] text-gray-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-4">รหัสลงทะเบียน</th>
                  <th className="p-4">ชื่อ-นามสกุล</th>
                  <th className="p-4">ประเภทผู้เข้าร่วม</th>
                  <th className="p-4">เบอร์โทรศัพท์</th>
                  <th className="p-4">ช่วงเวลาที่เลือก</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4">ที่มา</th>
                  <th className="p-4 text-center">ดูข้อมูล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((row) => {
                  const badge = getRegistrationStatusBadge(row.status);

                  return (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-extrabold text-[#7A1020]">
                        {row.registration_code}
                      </td>
                      <td className="p-4 font-bold">
                        {row.first_name} {row.last_name}
                      </td>
                      <td className="p-4">
                        {getParticipantTypeLabel(row.participant_type)}
                        {row.faculty && <span className="block text-[10px] text-gray-500">{row.faculty}</span>}
                      </td>
                      <td className="p-4 text-gray-700">
                        {row.phone}
                      </td>
                      <td className="p-4 text-[#B42336] font-medium">
                        {row.time_slot ? formatTimeRange(row.time_slot.start_at, row.time_slot.end_at) : 'ไม่ระบุ'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] font-semibold text-gray-500">
                        {row.source}
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          href={`/registration/${row.registration_code}`}
                          target="_blank"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-gray-700 hover:bg-[#7A1020] hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
