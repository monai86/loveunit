'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Download, 
  BarChart3, 
  UserCheck, 
  Heart, 
  GraduationCap, 
  Building2, 
  Activity,
  FileSpreadsheet,
  Settings,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { DashboardKPIs } from '@/lib/types/database';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  useEffect(() => {
    async function loadKPIs() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        if (res.ok && data.success) {
          setKpis(data.kpis);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadKPIs();
  }, []);

  if (loading || !kpis) {
    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#7A1020]" />
        <span className="ml-3 text-sm font-bold text-gray-600">กำลังคำนวณสถิติ Operational Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#FCE8EC] pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7A1020] px-3 py-1 text-xs font-bold text-white">
            <BarChart3 className="h-3.5 w-3.5" />
            Operations & Analytics Dashboard
          </span>
          <h1 className="mt-2 text-2xl font-black text-[#29272A] sm:text-3xl">
            ผู้บริหาร & ทีมงาน MUMT Blood Donation 2026
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/registrations"
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50"
          >
            <Users className="h-4 w-4 text-[#7A1020]" />
            จัดการรายชื่อ ({kpis.totalRegistrations})
          </Link>

          <Link
            href="/admin/content"
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50"
          >
            <ImageIcon className="h-4 w-4 text-[#7A1020]" />
            จัดการสื่อ & อินโฟกราฟิก
          </Link>

          <a
            href="/api/admin/export"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7A1020] to-[#B42336] px-4 py-2 text-xs font-bold text-white shadow hover:scale-105"
          >
            <FileSpreadsheet className="h-4 w-4" />
            ส่งออกไฟล์ Excel (.xlsx)
          </a>
        </div>
      </div>

      {/* KPI STAT CARDS GRID */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-2xl border border-[#FCE8EC] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">ยอดลงทะเบียนรวม</span>
            <Users className="h-5 w-5 text-[#7A1020]" />
          </div>
          <p className="mt-2 text-3xl font-black text-[#29272A]">{kpis.totalRegistrations} <span className="text-xs font-normal text-gray-500">คน</span></p>
          <p className="mt-1 text-[11px] text-gray-500">รวมทุกช่องทาง (ออนไลน์ + Walk-in)</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">เช็คอินหน้างานแล้ว</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-950">{kpis.checkedInCount} <span className="text-xs font-normal text-emerald-700">คน</span></p>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
            <span>อัตราเข้าร่วม: {kpis.attendanceRatePercent}%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">ผู้บริจาค Walk-in</span>
            <UserCheck className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-black text-amber-950">{kpis.walkInCount} <span className="text-xs font-normal text-amber-700">คน</span></p>
          <p className="mt-1 text-[11px] text-amber-800">ลงทะเบียนด่วนหน้างาน</p>
        </div>

        <div className="rounded-2xl border border-[#FCE8EC] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">บริจาคครั้งแรก (First-time)</span>
            <Heart className="h-5 w-5 text-[#B42336]" />
          </div>
          <p className="mt-2 text-3xl font-black text-[#7A1020]">{kpis.firstTimeDonors} <span className="text-xs font-normal text-gray-500">คน</span></p>
          <p className="mt-1 text-[11px] text-gray-500">คิดเป็น {kpis.totalRegistrations > 0 ? Math.round((kpis.firstTimeDonors / kpis.totalRegistrations) * 100) : 0}% ของผู้ลงทะเบียน</p>
        </div>

      </div>

      {/* DETAILED STATS SECTION */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Column: Arrival Forecast & Time Slot Distribution */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-[#FCE8EC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#FCE8EC] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#29272A]">ประมาณการเวลาเดินทางมาถึง (Arrival Forecast)</h3>
                <p className="text-xs text-gray-500 mt-0.5">การกระจายตัวของผู้ลงทะเบียนรายช่วงเวลา</p>
              </div>
              <span className="text-xs font-bold text-[#7A1020]">Flow & Location Planning</span>
            </div>

            <div className="mt-6 space-y-4">
              {kpis.slotBreakdown.map((slot) => {
                const percentBooked = Math.round((slot.bookedCount / slot.capacity) * 100);

                return (
                  <div key={slot.slotId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#29272A] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#7A1020]" />
                        {slot.timeLabel} น.
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">
                          ลงทะเบียน {slot.bookedCount}/{slot.capacity} คน
                        </span>
                        <span className="text-emerald-700">
                          (เช็คอินแล้ว {slot.checkedInCount} คน)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden flex">
                      <div
                        className="bg-[#7A1020] h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, percentBooked)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Participant Demographics Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-[#FCE8EC] bg-white p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-[#29272A] border-b border-[#FCE8EC] pb-4">
              สัดส่วนประเภทผู้เข้าร่วม (Demographics)
            </h3>

            <div className="mt-6 space-y-4">
              
              <div className="flex items-center justify-between rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A1020] text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#29272A]">นักศึกษามหิดล</h4>
                    <p className="text-[10px] text-gray-500">ทุกคณะและชั้นปี</p>
                  </div>
                </div>
                <span className="text-lg font-black text-[#7A1020]">{kpis.studentsCount} คน</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B42336] text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#29272A]">บุคลากรมหิดล</h4>
                    <p className="text-[10px] text-gray-500">อาจารย์และเจ้าหน้าที่</p>
                  </div>
                </div>
                <span className="text-lg font-black text-[#B42336]">{kpis.staffCount} คน</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#29272A]">บุคคลทั่วไป</h4>
                    <p className="text-[10px] text-gray-500">ผู้มีจิตศรัทธา</p>
                  </div>
                </div>
                <span className="text-lg font-black text-gray-900">{kpis.generalPublicCount} คน</span>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
