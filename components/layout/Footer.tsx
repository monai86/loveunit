'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { SocialLinks } from '@/components/common/SocialLinks';

export function Footer() {
  const pathname = usePathname();

  // Hide footer on staff and admin portal routes
  if (pathname.startsWith('/staff') || pathname.startsWith('/admin') || pathname.startsWith('/mt70')) {
    return null;
  }

  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-white text-[var(--ink)] select-none">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          
          {/* Brand Info (5 columns) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--bg)] p-1 border border-[var(--line)] overflow-hidden">
                <Image src="/images/logo.png" alt="MUMT Logo" width={40} height={40} className="h-full w-auto object-contain rounded-full" />
              </div>
              <div>
                <span className="text-sm font-black text-[var(--ink)] block font-display">MUMT LoveUnit <span className="text-[var(--burgundy-600)]">ครั้งที่ 9</span></span>
                <span className="text-xs font-bold text-[var(--muted)]">“เติมรักให้เต็ม Unit · ต่อชีวิตด้วยโลหิตคุณ”</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[var(--muted)] font-medium max-w-md">
              โครงการบริจาคโลหิต จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี ณ อาคารสิริวิทยา มหาวิทยาลัยมหิดล ศาลายา
            </p>
            <div>
              <span className="px-3 py-1 rounded bg-[var(--rose-100)] text-[var(--burgundy-700)] text-xs font-bold border border-[var(--line)]">
                16 กันยายน 2569 (09:00 - 14:00 น.)
              </span>
            </div>
            {/* Social channels with clickable icon buttons */}
            <div className="pt-2">
              <SocialLinks />
            </div>
          </div>

          {/* Quick Links for Donors (3 columns) */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-sm font-black text-[var(--ink)] block border-b border-[var(--line)] pb-1">
              สำหรับผู้บริจาค
            </span>
            <ul className="text-sm font-bold text-[var(--ink)]">
              <li>
                <Link href="/" className="hover:text-[var(--burgundy-600)] hover:underline flex items-center justify-between py-1.5">
                  <span>หน้าหลัก</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[var(--burgundy-600)] hover:underline flex items-center justify-between py-1.5 text-[var(--burgundy-600)]">
                  <span>ลงทะเบียนออนไลน์</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/screening" className="hover:text-[var(--burgundy-600)] hover:underline flex items-center justify-between py-1.5 text-amber-800">
                  <span>แบบคัดกรองตนเอง (Self-Screen)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-amber-700" />
                </Link>
              </li>
              <li>
                <Link href="/knowledge" className="hover:text-[var(--burgundy-600)] hover:underline flex items-center justify-between py-1.5">
                  <span>ความรู้ & การตรวจแล็บ</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link href="/prepare" className="hover:text-[var(--burgundy-600)] hover:underline flex items-center justify-between py-1.5">
                  <span>ข้อปฏิบัติตัวก่อนบริจาค</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link href="/poster" className="hover:text-[var(--burgundy-600)] hover:underline flex items-center justify-between py-1.5">
                  <span>โปสเตอร์ประชาสัมพันธ์</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link href="/location" className="hover:text-[var(--burgundy-600)] hover:underline flex items-center justify-between py-1.5">
                  <span>สถานที่และการเดินทาง</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link href="/lookup" className="hover:text-[var(--burgundy-600)] hover:underline flex items-center justify-between py-1.5">
                  <span>ลืม QR Code? ค้นหาที่นี่</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Staff Login Portal Link (4 columns) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-sm font-black text-[var(--ink)] block border-b border-[var(--line)] pb-1">
              ติดต่อ & เจ้าหน้าที่
            </span>
            <div className="space-y-3 text-sm text-[var(--ink)] font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--burgundy-500)] mt-0.5" />
                <div className="space-y-1">
                  <span className="leading-relaxed block">
                    ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา
                  </span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=อาคารสิริวิทยา+คณะศิลปศาสตร์+มหาวิทยาลัยมหิดล+ศาลายา"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--burgundy-600)] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>🗺️ เปิดดูแผนที่ Google Maps</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[var(--burgundy-500)] mt-0.5" />
                <div className="space-y-1 font-bold">
                  <p>เปา: <a href="tel:0969866245" className="hover:underline text-[var(--burgundy-600)] inline-block py-0.5">09-6986-6245</a></p>
                  <p>แตงโม: <a href="tel:0656274319" className="hover:underline text-[var(--burgundy-600)] inline-block py-0.5">06-5627-4319</a></p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 min-w-0">
                <Mail className="h-4 w-4 shrink-0 text-[var(--burgundy-500)] mt-0.5" />
                <a href="mailto:mumt68blooddonation@gmail.com" className="font-bold hover:underline text-[var(--burgundy-600)] break-all min-w-0 inline-block py-1.5">
                  mumt68blooddonation@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-12 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)] font-bold">
          <div>© 2026 Faculty of Medical Technology, Mahidol University (MUMT)</div>
          <div className="font-mono">เติมรักให้เต็ม Unit ครั้งที่ 9</div>
        </div>
      </div>
    </footer>
  );
}
