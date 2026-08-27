'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide footer on staff checkin tablet layout if needed or keep subtle
  if (pathname.startsWith('/staff/checkin')) {
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
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/mumt_loveunit/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 text-pink-700 border border-pink-200 hover:border-pink-400 hover:shadow-xs transition-all"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@mumt_loveunit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white hover:bg-black hover:shadow-xs transition-all"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.96-4.47V8.92a8.28 8.28 0 0 0 4.81 1.54v-3.77z" />
                </svg>
                <span>TikTok</span>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=100064643707063&utm_source=ig&utm_medium=social&utm_content=link_in_bio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 hover:shadow-xs transition-all"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook Page</span>
              </a>
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
