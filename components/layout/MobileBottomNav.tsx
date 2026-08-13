'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MapPin, BookOpen } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Do not render public mobile bottom nav on staff or admin pages
  if (pathname.startsWith('/staff') || pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'หน้าแรก', icon: Home },
    { href: '/prepare', label: 'ข้อปฏิบัติ', icon: BookOpen },
    { href: '/location', label: 'สถานที่', icon: MapPin },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 lg:hidden pointer-events-none select-none">
      <div className="mx-auto max-w-md bg-[var(--burgundy-700)] text-white rounded-2xl p-1.5 shadow-2xl border border-white/20 flex items-center justify-around pointer-events-auto backdrop-blur-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all ${
                isActive ? 'bg-white/20 font-black text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="text-[11px] font-bold">{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/register"
          className="flex items-center gap-1.5 bg-[var(--burgundy-400)] hover:bg-[var(--burgundy-500)] text-white font-extrabold px-4 py-2 rounded-xl text-sm shadow-md transition-all active:scale-95"
        >
          <Heart className="h-4 w-4 fill-white text-white" />
          <span>ลงทะเบียน</span>
        </Link>
      </div>
    </div>
  );
}
