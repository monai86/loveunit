'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, Phone, Mail, Monitor, ShieldCheck, HardDrive, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-12 win95-raised bg-[#C0C0C0] text-black border-t-2 border-white select-none">
      
      {/* Top Footer Status Strip */}
      <div className="bg-[#000080] px-4 py-1.5 text-white flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-amber-300" />
          <span>MUMT Blood Donation 2026 System Core</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <Cpu className="h-3.5 w-3.5 text-green-400" />
          <span className="hidden sm:inline">Status: ONLINE (Neon Postgres 18)</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Brand Info */}
          <div className="win95-sunken p-4 bg-[#FFFFFF]">
            <div className="flex items-center gap-2.5">
              <div className="win95-sunken p-1 bg-white">
                <img src="/images/logo.png" alt="MUMT Logo" className="h-7 w-auto object-contain" />
              </div>
              <span className="text-sm font-extrabold text-[#7A1020]">MUMT Blood Donation 2026</span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-gray-800">
              โครงการ “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9” จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ สภากาชาดไทย
            </p>
          </div>

          {/* Quick Links */}
          <div className="win95-sunken p-4 bg-[#FFFFFF]">
            <h3 className="text-xs font-black tracking-wider text-[#7A1020] uppercase mb-2 border-b-2 border-gray-200 pb-1">
              📌 ลิงก์เมนูด่วน
            </h3>
            <ul className="space-y-1.5 text-xs font-bold text-gray-800">
              <li>
                <Link href="/" className="hover:underline hover:text-[#7A1020]">▶ หน้าแรก (Desktop)</Link>
              </li>
              <li>
                <Link href="/register" className="hover:underline hover:text-[#7A1020]">▶ ลงทะเบียนบริจาคโลหิต</Link>
              </li>
              <li>
                <Link href="/prepare" className="hover:underline hover:text-[#7A1020]">▶ ข้อปฏิบัติตัวก่อนบริจาค</Link>
              </li>
              <li>
                <Link href="/location" className="hover:underline hover:text-[#7A1020]">▶ แผนที่และการเดินทาง</Link>
              </li>
              <li>
                <Link href="/staff/login" className="hover:underline hover:text-[#7A1020]">▶ ระบบเจ้าหน้าที่ (Staff Portal)</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="win95-sunken p-4 bg-[#FFFFFF]">
            <h3 className="text-xs font-black tracking-wider text-[#7A1020] uppercase mb-2 border-b-2 border-gray-200 pb-1">
              📞 ติดต่อสอบถาม
            </h3>
            <div className="space-y-2 text-xs text-gray-800">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#B42336] mt-0.5" />
                <span>ห้องประชุม 217 และ 218 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา</span>
              </div>
              
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#B42336] mt-0.5" />
                <div className="space-y-0.5 font-bold">
                  <p>คุณเปา: <a href="tel:0969866245" className="hover:underline text-[#7A1020]">09-6986-6245</a></p>
                  <p>คุณแตงโม: <a href="tel:0656274319" className="hover:underline text-[#7A1020]">06-5627-4319</a></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#B42336]" />
                <a href="mailto:mumt68blooddonation@gmail.com" className="font-bold hover:underline text-[#7A1020]">
                  mumt68blooddonation@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Win95 Status Bar */}
        <div className="mt-6 win95-statusbar justify-between flex-wrap gap-2 text-gray-700">
          <div>© 2026 Faculty of Medical Technology, Mahidol University (MUMT)</div>
          <div className="font-mono font-bold text-black">Windows 95 Classic Edition</div>
        </div>
      </div>
    </footer>
  );
}
