'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, UserPlus, BarChart3, LogOut, ShieldCheck } from 'lucide-react';

export function StaffHeader() {
  const pathname = usePathname();

  // Only render on staff or admin routes
  if (!pathname.startsWith('/staff') && !pathname.startsWith('/admin')) {
    return null;
  }

  const tabs = [
    { href: '/staff/checkin', label: '📌 สแกน & เช็คอิน', icon: QrCode },
    { href: '/staff/walk-in', label: '➕ ลงทะเบียน Walk-in', icon: UserPlus },
    { href: '/admin', label: '📊 แดชบอร์ดผู้บริหาร', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1F1A1C] text-white border-b border-[#282828] select-none shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Staff Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8E0015] p-1 border border-white/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black tracking-widest text-[#E43F3F] uppercase">STAFF & ADMIN ONLY</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-[9px] font-mono font-bold">OPERATIONAL</span>
            </div>
            <h1 className="text-xs font-black text-white sm:text-sm">
              ระบบสตาฟและผู้ดูแลระบบ — MUMT 2026
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (tab.href !== '/admin' && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-[#8E0015] text-white shadow-md'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Public Return / Logout */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">กลับหน้าประชาชน</span>
        </Link>
      </div>

      {/* Mobile Switcher Bar */}
      <div className="flex items-center justify-around border-t border-white/10 bg-[#161314] p-1.5 md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold ${
                isActive ? 'bg-[#8E0015] text-white font-black' : 'text-white/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
