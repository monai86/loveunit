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

  // PUBLIC DONOR NAVIGATION LINKS ONLY
  const navLinks = [
    { href: '/', label: 'หน้าแรก', icon: Home },
    { href: '/prepare', label: 'ข้อปฏิบัติตัวก่อนบริจาค', icon: BookOpen },
    { href: '/location', label: 'สถานที่ & การเดินทาง', icon: MapPin },
  ];

  // Do not render public navbar on staff/admin routes (they use StaffHeader)
  if (pathname.startsWith('/staff') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D5C7B8] bg-[#F7F3EE]/95 backdrop-blur-md select-none" suppressHydrationWarning>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Public Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1 border border-[#D5C7B8] shadow-xs">
            <img 
              src="/images/logo.png" 
              alt="MUMT LOVE UNIT Logo" 
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black tracking-widest text-[#8E0015] uppercase">MUMT BLOOD DONATION 2026</span>
              <span className="px-1.5 py-0.5 rounded bg-[#E9E1D9] text-[#7A1020] text-[9px] font-mono font-bold">ครั้งที่ 9</span>
            </div>
            <h1 className="text-xs font-black text-[#282828] sm:text-sm">
              เติมรักให้เต็ม Unit <span className="text-[#C13A2B]">ต่อชีวิตด้วยโลหิตคุณ</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Public Navigation */}
        <nav className="hidden items-center gap-2 lg:flex">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#E9E1D9] text-[#7A1020]'
                    : 'text-[#282828] hover:bg-[#E9E1D9]/50 hover:text-[#7A1020]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#7A1020]' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="ml-3 border-l border-[#D5C7B8] pl-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#8E0015] hover:bg-[#7A1020] text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>ลงทะเบียนบริจาคโลหิต</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>

        {/* Mobile Action & Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/register"
            className="inline-flex items-center gap-1 bg-[#8E0015] text-white font-extrabold px-3 py-2 rounded-xl text-xs shadow-xs"
          >
            <Heart className="h-3.5 w-3.5 fill-white" />
            <span>ลงทะเบียน</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D5C7B8] bg-white text-[#7A1020]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Public Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#D5C7B8] bg-[#F7F3EE] px-4 py-4 shadow-xl lg:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#E9E1D9] text-[#7A1020]'
                      : 'text-[#282828] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[#7A1020]" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              );
            })}

            <div className="mt-2 pt-2 border-t border-[#D5C7B8]">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 bg-[#8E0015] text-white font-extrabold w-full py-3 text-xs rounded-xl shadow-md"
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
