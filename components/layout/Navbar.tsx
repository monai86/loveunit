'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  Menu, 
  X, 
  BookOpen, 
  MapPin, 
  ShieldCheck, 
  Home,
  ArrowRight
} from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'หน้าแรก', icon: Home },
    { href: '/prepare', label: 'ข้อปฏิบัติ', icon: BookOpen },
    { href: '/location', label: 'สถานที่ & การเดินทาง', icon: MapPin },
    { href: '/staff/login', label: 'เจ้าหน้าที่', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#F0C4CC] bg-[#FFF9F9]/95 backdrop-blur-md select-none" suppressHydrationWarning>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand Logo & Editorial Title */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1 border border-[#F0C4CC] shadow-xs">
            <img 
              src="/images/logo.png" 
              alt="MUMT LOVE UNIT Logo" 
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black tracking-widest text-[#7A1020] uppercase">MUMT / BLOOD DONATION / 2026</span>
              <span className="unit-tag-outline text-[9px] py-0 px-1.5">ครั้งที่ 9</span>
            </div>
            <h1 className="text-xs font-extrabold text-editorial-ink sm:text-sm">
              เติมรักให้เต็ม Unit <span className="text-editorial-red">ต่อชีวิตด้วยโลหิตคุณ</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Editorial Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#FCE8EC] text-[#7A1020]'
                    : 'text-editorial-ink hover:bg-[#FCE8EC]/50 hover:text-[#7A1020]'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="ml-3 border-l border-[#F0C4CC] pl-3">
            <Link
              href="/register"
              className="editorial-btn-primary py-2 px-4 text-xs"
            >
              <span>ลงทะเบียนบริจาคโลหิต</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>

        {/* Mobile Action & Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/register"
            className="editorial-btn-primary py-1.5 px-3 text-xs"
          >
            <span>ลงทะเบียน</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#F0C4CC] bg-white text-[#7A1020]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Editorial Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#F0C4CC] bg-[#FFF9F9] px-4 py-4 shadow-xl lg:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((item) => {
              const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FCE8EC] text-[#7A1020]'
                      : 'text-editorial-ink hover:bg-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              );
            })}

            <div className="mt-2 pt-2 border-t border-[#F0C4CC]">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="editorial-btn-primary w-full py-3 text-xs justify-center"
              >
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
