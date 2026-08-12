'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#FCE8EC] bg-white text-[#29272A]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7A1020] text-white">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <span className="text-base font-extrabold text-[#7A1020]">MUMT Blood Donation 2026</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#29272A]/70">
              โครงการ “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9” จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[#7A1020] uppercase">ลิงก์เมนู</h3>
            <ul className="mt-3 space-y-2 text-xs font-medium text-[#29272A]/80">
              <li>
                <Link href="/" className="hover:text-[#7A1020]">หน้าแรก</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#7A1020]">ลงทะเบียนบริจาคโลหิต</Link>
              </li>
              <li>
                <Link href="/prepare" className="hover:text-[#7A1020]">ข้อปฏิบัติตัวก่อนบริจาค</Link>
              </li>
              <li>
                <Link href="/location" className="hover:text-[#7A1020]">แผนที่และการเดินทาง</Link>
              </li>
              <li>
                <Link href="/staff/login" className="hover:text-[#7A1020]">ระบบสำหรับเจ้าหน้าที่ (Staff Portal)</Link>
              </li>
            </ul>
          </div>

          {/* Venue & Contact */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[#7A1020] uppercase">สถานที่จัดงาน & ติดต่อสอบถาม</h3>
            <div className="mt-3 space-y-2 text-xs text-[#29272A]/80">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#B42336]" />
                <span>ห้องประชุม 217 และ 218 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#B42336]" />
                <span>02-441-4370 ต่อ 2101</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#B42336]" />
                <span>mumtblooddonation@mahidol.ac.th</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 border-t border-[#FCE8EC] pt-6 text-center text-[11px] text-[#29272A]/60">
          <p>© 2026 Faculty of Medical Technology, Mahidol University (MUMT). All rights reserved.</p>
          <p className="mt-1">ระบบลงทะเบียนและบริหารจัดการกิจกรรมบริจาคโลหิต MUMT Blood Donation System v1.0</p>
        </div>
      </div>
    </footer>
  );
}
