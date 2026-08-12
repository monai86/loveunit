'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Home
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
    { href: '/staff/login', label: 'สำหรับเจ้าหน้าที่', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#F9D5DC] bg-white/95 backdrop-blur-md shadow-xs select-none" suppressHydrationWarning>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand Logo & Event Title */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF8F9] p-1.5 border border-[#F9D5DC] shadow-xs">
            <img 
              src="/images/logo.png" 
              alt="MUMT LOVE UNIT Logo" 
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-wider text-[#7A1020] uppercase">MUMT Blood Donation 2026</span>
              <span className="bloom-badge py-0.5 px-2 text-[10px]">ครั้งที่ 9</span>
            </div>
            <h1 className="text-xs font-extrabold text-[#1F1A1C] sm:text-sm">
              เติมรักให้เต็ม Unit <span className="text-[#B42336]">ต่อชีวิตด้วยโลหิตคุณ</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#FCE8EC] text-[#7A1020]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#7A1020]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#7A1020]' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="ml-3 border-l border-gray-200 pl-3">
            <Link
              href="/register"
              className="bloom-btn-primary py-2 px-4.5 text-xs shadow-md"
            >
              <Heart className="h-4 w-4 fill-white text-white" />
              <span>ลงทะเบียนบริจาคโลหิต</span>
            </Link>
          </div>
        </nav>

        {/* Mobile Action & Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/register"
            className="bloom-btn-primary py-1.5 px-3 text-xs"
          >
            <Heart className="h-3.5 w-3.5 fill-white text-white" />
            <span>ลงทะเบียน</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F9D5DC] bg-[#FFF8F9] text-[#7A1020] hover:bg-[#FCE8EC]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#F9D5DC] bg-white px-4 py-4 shadow-xl lg:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FCE8EC] text-[#7A1020]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#7A1020]' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="mt-2 pt-2 border-t border-gray-100">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="bloom-btn-primary w-full py-3 text-xs justify-center"
              >
                <Heart className="h-4 w-4 fill-white text-white" />
                <span>ลงทะเบียนบริจาคโลหิตออนไลน์</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
