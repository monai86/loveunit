'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Calendar, MapPin, BookOpen, ShieldCheck, Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#FCE8EC] bg-[#FFF9F9]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <img src="/images/logo.png" alt="MUMT LOVE UNIT Logo" className="h-11 w-auto object-contain" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-wider text-[#B42336] uppercase">MUMT Blood Donation 2026</span>
              <span className="rounded bg-[#7A1020] px-1.5 py-0.5 text-[10px] font-extrabold text-white">ครั้งที่ 9</span>
            </div>
            <h1 className="text-sm font-extrabold text-[#29272A] sm:text-base">
              เติมรักให้เต็ม Unit <span className="text-[#7A1020]">ต่อชีวิตด้วยโลหิตคุณ</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-semibold text-[#29272A] transition-colors hover:text-[#7A1020]">
            หน้าแรก
          </Link>
          <Link href="/prepare" className="flex items-center gap-1.5 text-sm font-semibold text-[#29272A] transition-colors hover:text-[#7A1020]">
            <BookOpen className="h-4 w-4 text-[#B42336]" />
            การเตรียมตัว
          </Link>
          <Link href="/location" className="flex items-center gap-1.5 text-sm font-semibold text-[#29272A] transition-colors hover:text-[#7A1020]">
            <MapPin className="h-4 w-4 text-[#B42336]" />
            สถานที่และการเดินทาง
          </Link>
          <Link href="/staff/login" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-[#7A1020]">
            <ShieldCheck className="h-3.5 w-3.5" />
            สำหรับเจ้าหน้าที่
          </Link>

          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7A1020] to-[#B42336] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#7A1020]/25 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            <Calendar className="h-4 w-4" />
            ลงทะเบียนบริจาคโลหิต
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#FCE8EC] bg-white text-[#29272A] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-[#FCE8EC] bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-[#29272A] hover:bg-[#FCE8EC]"
            >
              หน้าแรก
            </Link>
            <Link
              href="/prepare"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#29272A] hover:bg-[#FCE8EC]"
            >
              <BookOpen className="h-4 w-4 text-[#B42336]" />
              การเตรียมตัวก่อนบริจาค
            </Link>
            <Link
              href="/location"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#29272A] hover:bg-[#FCE8EC]"
            >
              <MapPin className="h-4 w-4 text-[#B42336]" />
              สถานที่และการเดินทาง
            </Link>
            <Link
              href="/staff/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-[#FCE8EC]"
            >
              <ShieldCheck className="h-4 w-4" />
              สำหรับเจ้าหน้าที่
            </Link>

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#7A1020] px-4 py-3 text-center text-sm font-bold text-white shadow-md shadow-[#7A1020]/20"
            >
              <Calendar className="h-4 w-4" />
              ลงทะเบียนบริจาคโลหิต
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
