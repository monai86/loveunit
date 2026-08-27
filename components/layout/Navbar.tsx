'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  Menu, 
  X, 
  BookOpen, 
  MapPin, 
  Home, 
  ArrowRight,
  Image as ImageIcon,
  CheckSquare,
  Microscope
} from 'lucide-react';

const emptySubscribe = () => () => {};

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const pathname = usePathname();

  // PUBLIC DONOR NAVIGATION LINKS ONLY
  const navLinks = [
    { href: '/', label: 'หน้าแรก', icon: Home },
    { href: '/screening', label: 'ประเมินตนเอง', icon: CheckSquare },
    { href: '/knowledge', label: 'ความรู้ & แล็บตรวจ', icon: Microscope },
    { href: '/prepare', label: 'การเตรียมตัว', icon: BookOpen },
    { href: '/poster', label: 'โปสเตอร์', icon: ImageIcon },
    { href: '/location', label: 'สถานที่ & การเดินทาง', icon: MapPin },
  ];

  // Do not render public navbar on staff/admin routes (they use StaffHeader)
  if (pathname.startsWith('/staff') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-md select-none shadow-2xs" suppressHydrationWarning>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8 gap-4">
        
        {/* 1. Left: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink min-w-0 group">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 border border-[var(--line)] shadow-xs transition-transform group-hover:scale-105">
            <Image 
              src="/images/logo.png" 
              alt="MUMT LOVE UNIT Logo" 
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="shrink-0 flex flex-col justify-center">
            <span className="text-xs sm:text-sm font-bold text-[var(--ink)] tracking-normal whitespace-nowrap font-display">
              <span className="sm:hidden">MUMT 2026</span>
              <span className="hidden sm:inline">MUMT Blood Donation 2026</span>{' '}
              <span className="text-[var(--burgundy-600)] font-extrabold">ครั้งที่ 9</span>
            </span>
            <span className="text-[10px] sm:text-xs text-[var(--muted)] whitespace-nowrap hidden xl:block">
              เติมรักให้เต็ม Unit · ต่อชีวิตด้วยโลหิตคุณ
            </span>
          </div>
        </Link>

        {/* 2. Center: Public Navigation links distributed evenly */}
        <nav className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1.5 flex-1 min-w-0 mx-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 xl:gap-1.5 rounded-lg px-2 xl:px-2.5 py-1.5 text-xs xl:text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-2xs font-bold'
                    : 'text-[var(--ink)] hover:bg-black/5 hover:text-[var(--burgundy-700)]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0 ${isActive ? 'text-[var(--burgundy-700)]' : 'text-[var(--muted)]'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Right: Desktop CTA Button */}
        <div className="hidden lg:flex items-center shrink-0">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 bg-[var(--burgundy-700)] hover:bg-[var(--burgundy-800)] text-white font-bold px-3 xl:px-4 py-2 rounded-xl text-xs xl:text-[13px] shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <Heart className="h-3.5 w-3.5 fill-white shrink-0" />
            <span>ลงทะเบียน<span className="hidden xl:inline">บริจาคโลหิต</span></span>
            <ArrowRight className="h-3 w-3 shrink-0 hidden xl:inline" />
          </Link>
        </div>

        {/* Mobile Action & Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 lg:hidden">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 bg-[var(--burgundy-700)] hover:bg-[var(--burgundy-800)] text-white font-bold px-3 py-2 rounded-xl text-xs shadow-xs whitespace-nowrap shrink-0 transition-all active:scale-95"
          >
            <Heart className="h-3.5 w-3.5 fill-white shrink-0" />
            <span className="whitespace-nowrap font-extrabold">ลงทะเบียน</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--burgundy-700)] cursor-pointer shrink-0 shadow-2xs"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Public Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--line)] bg-[var(--bg)] px-4 py-4 shadow-xl lg:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[var(--rose-100)] text-[var(--burgundy-700)]'
                      : 'text-[var(--ink)] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[var(--burgundy-700)]" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              );
            })}

            <div className="mt-2 pt-2 border-t border-[var(--line)]">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 bg-[var(--burgundy-600)] text-white font-extrabold w-full py-3 text-sm rounded-xl shadow-md"
              >
                <Heart className="h-4 w-4 fill-white" />
                <span>ลงทะเบียนบริจาคโลหิตออนไลน์</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
