'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  BookOpen, 
  ShieldCheck, 
  Menu, 
  X, 
  Monitor,
  Sparkles
} from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full win95-raised bg-[#C0C0C0] shadow-md select-none">
      
      {/* Top Application Title Bar */}
      <div className="win95-titlebar px-3 py-1">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="MUMT Logo" className="h-5 w-auto object-contain bg-white rounded p-0.5" />
          <span className="font-bold text-xs sm:text-sm text-white truncate">
            MUMT Blood Donation 2026 (ครั้งที่ 9) — [WinApp 95]
          </span>
        </div>
        
        {/* Titlebar Window Controls [ _ ] [ ▢ ] [ X ] */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="win95-control-btn">_</span>
          <span className="win95-control-btn">▢</span>
          <span className="win95-control-btn text-red-900 bg-gray-200">X</span>
        </div>
      </div>

      {/* Main Navbar Contents */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-6">
        
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform active:scale-95">
          <div className="win95-sunken p-1 bg-white flex items-center justify-center">
            <img src="/images/logo.png" alt="MUMT LOVE UNIT Logo" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black tracking-wider text-[#7A1020] uppercase">MUMT Blood Donation 2026</span>
              <span className="win95-raised px-1.5 py-0.2 text-[10px] font-extrabold bg-[#7A1020] text-white">ครั้งที่ 9</span>
            </div>
            <h1 className="text-xs font-bold text-black sm:text-sm">
              เติมรักให้เต็ม Unit <span className="text-[#7A1020]">ต่อชีวิตด้วยโลหิตคุณ</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Navigation Menu Links */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link 
            href="/" 
            className={`win95-btn ${pathname === '/' ? 'active' : ''}`}
          >
            <Monitor className="h-3.5 w-3.5 text-[#7A1020]" />
            <span>หน้าแรก</span>
          </Link>

          <Link 
            href="/prepare" 
            className={`win95-btn ${pathname === '/prepare' ? 'active' : ''}`}
          >
            <BookOpen className="h-3.5 w-3.5 text-[#7A1020]" />
            <span>ข้อปฏิบัติ</span>
          </Link>

          <Link 
            href="/location" 
            className={`win95-btn ${pathname === '/location' ? 'active' : ''}`}
          >
            <MapPin className="h-3.5 w-3.5 text-[#7A1020]" />
            <span>สถานที่ & การเดินทาง</span>
          </Link>

          <Link 
            href="/staff/login" 
            className={`win95-btn ${pathname.startsWith('/staff') ? 'active' : ''}`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
            <span>เจ้าหน้าที่</span>
          </Link>

          <Link
            href="/register"
            className="win95-btn win95-btn-primary ml-2 py-1.5 px-3.5 text-xs"
          >
            <Calendar className="h-4 w-4 text-amber-300" />
            <span>ลงทะเบียนออนไลน์</span>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="win95-btn h-9 w-9 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu (Win95 Inset Box) */}
      {mobileMenuOpen && (
        <div className="border-t-2 border-[#808080] bg-[#C0C0C0] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="win95-btn w-full justify-start py-2"
            >
              <Monitor className="h-4 w-4 text-[#7A1020]" />
              <span>หน้าแรก (Desktop)</span>
            </Link>

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="win95-btn win95-btn-primary w-full justify-start py-2.5"
            >
              <Calendar className="h-4 w-4 text-amber-300" />
              <span>ลงทะเบียนบริจาคโลหิต</span>
            </Link>

            <Link
              href="/prepare"
              onClick={() => setMobileMenuOpen(false)}
              className="win95-btn w-full justify-start py-2"
            >
              <BookOpen className="h-4 w-4 text-[#7A1020]" />
              <span>การเตรียมตัวก่อนบริจาค</span>
            </Link>

            <Link
              href="/location"
              onClick={() => setMobileMenuOpen(false)}
              className="win95-btn w-full justify-start py-2"
            >
              <MapPin className="h-4 w-4 text-[#7A1020]" />
              <span>สถานที่และการเดินทาง</span>
            </Link>

            <Link
              href="/staff/login"
              onClick={() => setMobileMenuOpen(false)}
              className="win95-btn w-full justify-start py-2 text-gray-800"
            >
              <ShieldCheck className="h-4 w-4 text-amber-700" />
              <span>ระบบเจ้าหน้าที่ (Staff Portal)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
