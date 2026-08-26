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
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-md select-none" suppressHydrationWarning>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Public Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1 border border-[var(--line)] shadow-sm">
            <Image 
              src="/images/logo.png" 
              alt="MUMT LOVE UNIT Logo" 
              width={40}
              height={40}
              className="h-full w-auto object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-sm font-black text-[var(--ink)] sm:text-base">
              MUMT Blood Donation 2026 <span className="text-[var(--burgundy-400)]">ครั้งที่ 9</span>
            </h1>
            <p className="text-xs font-semibold text-[var(--muted)]">เติมรักให้เต็ม Unit · ต่อชีวิตด้วยโลหิตคุณ</p>
          </div>
        </Link>

        {/* Desktop Public Navigation */}
        <nav className="hidden items-center gap-1 xl:gap-2 lg:flex shrink-0">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 xl:gap-2 rounded-xl px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-black whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-[var(--rose-100)] text-[var(--burgundy-700)]'
                    : 'text-[var(--ink)] hover:bg-[var(--rose-100)]/60 hover:text-[var(--burgundy-700)]'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--burgundy-700)]' : 'text-[var(--muted)]'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}

          <div className="ml-2 xl:ml-3 border-l border-[var(--line)] pl-2 xl:pl-3 shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[var(--burgundy-600)] hover:bg-[var(--burgundy-700)] text-white font-extrabold px-3.5 xl:px-5 py-2.5 rounded-xl text-xs xl:text-sm shadow-md transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <Heart className="h-4 w-4 fill-white shrink-0" />
              <span>ลงทะเบียนบริจาคโลหิต</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </div>
        </nav>

        {/* Mobile Action & Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/register"
            className="inline-flex items-center gap-1 bg-[var(--burgundy-700)] text-white font-extrabold px-3.5 py-2.5 rounded-xl text-xs shadow-xs"
          >
            <Heart className="h-3.5 w-3.5 fill-white" />
            <span>ลงทะเบียน</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--burgundy-700)]"
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
