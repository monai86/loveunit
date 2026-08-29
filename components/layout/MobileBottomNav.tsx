'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MapPin, BookOpen, CheckSquare } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Do not render public mobile bottom nav on staff or admin or mt70 pages
  if (pathname.startsWith('/staff') || pathname.startsWith('/admin') || pathname.startsWith('/mt70')) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'หน้าแรก', icon: Home, isPrimary: false },
    { href: '/screening', label: 'คัดกรอง', icon: CheckSquare, isPrimary: false },
    { href: '/prepare', label: 'เตรียมตัว', icon: BookOpen, isPrimary: false },
    { href: '/location', label: 'สถานที่', icon: MapPin, isPrimary: false },
    { href: '/register', label: 'ลงทะเบียน', icon: Heart, isPrimary: true },
  ];

  return (
    <nav 
      aria-label="เมนูหลักบนมือถือ"
      className="fixed bottom-0 left-0 right-0 z-40 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden pointer-events-none select-none"
    >
      <div className="mx-auto max-w-md bg-[var(--burgundy-700)]/95 text-white rounded-2xl p-1 shadow-2xl border border-white/20 grid grid-cols-5 items-stretch pointer-events-auto backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-11 min-w-11 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
                item.isPrimary
                  ? 'bg-gradient-to-r from-red-500 to-[var(--burgundy-400)] text-white shadow-md font-black'
                  : isActive
                    ? 'bg-white/20 font-black text-white shadow-2xs'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${item.isPrimary ? 'fill-white text-white' : ''}`} />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
