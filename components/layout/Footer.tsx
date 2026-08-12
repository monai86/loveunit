'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[#F0C4CC] bg-white text-editorial-ink select-none">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          
          {/* Brand Info (5 columns) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF9F9] p-1 border border-[#F0C4CC]">
                <img src="/images/logo.png" alt="MUMT Logo" className="h-full w-auto object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#7A1020] uppercase block">MUMT / BLOOD DONATION / 2026</span>
                <span className="text-sm font-black text-editorial-ink">ครั้งที่ 9 “เติมรักให้เต็ม Unit”</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-editorial-muted font-medium max-w-md">
              โครงการบริจาคโลหิต จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ สภากาชาดไทย ณ อาคารสิริวิทยา มหาวิทยาลัยมหิดล ศาลายา
            </p>
            <div>
              <span className="unit-tag-outline text-[10px]">
                16 กันยายน 2569 (08:00 - 15:00 น.)
              </span>
            </div>
          </div>

          {/* Quick Links (3 columns) */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-[#7A1020] uppercase block border-b border-[#FCE8EC] pb-1">
              NAVIGATION
            </span>
            <ul className="space-y-2 text-xs font-bold text-editorial-ink">
              <li>
                <Link href="/" className="hover:text-[#7A1020] hover:underline flex items-center justify-between">
                  <span>หน้าแรก</span>
                  <ArrowRight className="h-3 w-3 opacity-40" />
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#7A1020] hover:underline flex items-center justify-between text-[#7A1020]">
                  <span>ลงทะเบียนออนไลน์</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/prepare" className="hover:text-[#7A1020] hover:underline flex items-center justify-between">
                  <span>ข้อปฏิบัติตัวก่อนบริจาค</span>
                  <ArrowRight className="h-3 w-3 opacity-40" />
                </Link>
              </li>
              <li>
                <Link href="/location" className="hover:text-[#7A1020] hover:underline flex items-center justify-between">
                  <span>สถานที่และการเดินทาง</span>
                  <ArrowRight className="h-3 w-3 opacity-40" />
                </Link>
              </li>
              <li>
                <Link href="/staff/login" className="hover:text-[#7A1020] hover:underline flex items-center justify-between text-gray-500">
                  <span>ระบบเจ้าหน้าที่ (Staff)</span>
                  <ArrowRight className="h-3 w-3 opacity-40" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (4 columns) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-[#7A1020] uppercase block border-b border-[#FCE8EC] pb-1">
              UNIT 05 / CONTACT
            </span>
            <div className="space-y-3 text-xs text-editorial-ink font-medium">
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
        <div className="mt-12 pt-6 border-t border-[#F0C4CC] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-editorial-muted font-bold">
          <div>© 2026 Faculty of Medical Technology, Mahidol University (MUMT)</div>
          <div className="font-mono">เติมรักให้เต็ม Unit ครั้งที่ 9</div>
        </div>
      </div>
    </footer>
  );
}
