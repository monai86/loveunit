'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, Phone, Mail, ShieldCheck, ExternalLink, Calendar, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#F0C4CC] bg-white text-ink-dark select-none">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* Brand Info Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF5F7] p-1 border border-[#F0C4CC]">
                <img src="/images/logo.png" alt="MUMT Logo" className="h-full w-auto object-contain" />
              </div>
              <div>
                <span className="text-xs font-black tracking-wider text-[#7A1020] uppercase block">MUMT Blood Donation 2026</span>
                <span className="text-sm font-extrabold text-ink-dark">ครั้งที่ 9 “เติมรักให้เต็ม Unit”</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-body-dark font-medium">
              โครงการบริจาคโลหิต จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ สภากาชาดไทย ณ อาคารสิริวิทยา มหาวิทยาลัยมหิดล ศาลายา
            </p>
            <div className="pt-1">
              <span className="bloom-badge text-[11px]">
                <Heart className="h-3 w-3 fill-[#7A1020]" />
                16 กันยายน 2569 (08:00 - 15:00 น.)
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-xs font-black tracking-wider text-[#7A1020] uppercase mb-3 pb-1 border-b border-[#FCE8EC]">
              📌 ลิงก์เมนูด่วน
            </h3>
            <ul className="space-y-2 text-xs font-bold text-body-dark">
              <li>
                <Link href="/" className="hover:text-[#7A1020] hover:underline flex items-center gap-1.5">
                  <span>• หน้าหลัก</span>
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#7A1020] hover:underline flex items-center gap-1.5 text-[#7A1020]">
                  <span>• ลงทะเบียนบริจาคโลหิตออนไลน์</span>
                </Link>
              </li>
              <li>
                <Link href="/prepare" className="hover:text-[#7A1020] hover:underline flex items-center gap-1.5">
                  <span>• ข้อปฏิบัติตัวก่อนบริจาค</span>
                </Link>
              </li>
              <li>
                <Link href="/location" className="hover:text-[#7A1020] hover:underline flex items-center gap-1.5">
                  <span>• แผนที่สถานที่และการเดินทาง</span>
                </Link>
              </li>
              <li>
                <Link href="/staff/login" className="hover:text-[#7A1020] hover:underline flex items-center gap-1.5 text-gray-600">
                  <span>• ระบบเจ้าหน้าที่ (Staff Portal)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Contact Details Column */}
          <div>
            <h3 className="text-xs font-black tracking-wider text-[#7A1020] uppercase mb-3 pb-1 border-b border-[#FCE8EC]">
              📞 ติดต่อสอบถาม
            </h3>
            <div className="space-y-3 text-xs text-body-dark font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-[#B42336] mt-0.5" />
                <span className="leading-relaxed">
                  ห้องประชุม 217 และ 218 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา
                </span>
              </div>
              
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#B42336] mt-0.5" />
                <div className="space-y-1 font-bold">
                  <p>คุณเปา: <a href="tel:0969866245" className="hover:underline text-[#7A1020]">09-6986-6245</a></p>
                  <p>คุณแตงโม: <a href="tel:0656274319" className="hover:underline text-[#7A1020]">06-5627-4319</a></p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#B42336]" />
                <a href="mailto:mumt68blooddonation@gmail.com" className="font-bold hover:underline text-[#7A1020]">
                  mumt68blooddonation@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-10 pt-6 border-t border-[#FCE8EC] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-body-dark font-bold">
          <div>© 2026 Faculty of Medical Technology, Mahidol University (MUMT)</div>
          <div>เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9</div>
        </div>
      </div>
    </footer>
  );
}
