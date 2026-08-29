'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { QrCode, UserPlus, BarChart3, LogOut, Loader2, ArrowLeft } from 'lucide-react';
import { authClient } from '@/lib/auth/client';

export function StaffHeader() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    if (!pathname.startsWith('/staff/')) return;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setIsAdmin(data?.user?.profile?.role === 'ADMIN'))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  // Only render on operational staff routes (not on login, change-password, or admin which has its own layout)
  if (
    pathname.startsWith('/staff/login') ||
    pathname.startsWith('/staff/change-password') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/mt70') ||
    !pathname.startsWith('/staff')
  ) {
    return null;
  }

  const tabs = [
    { href: '/staff/checkin', label: 'สแกน QR', icon: QrCode },
    { href: '/staff/walk-in', label: 'ลงทะเบียน Walk-in', icon: UserPlus },
    ...(isAdmin ? [{ href: '/mt70', label: 'แดชบอร์ด Admin', icon: BarChart3 }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md text-[var(--ink)] border-b border-[var(--line)] select-none shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16 sm:px-6">
        
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link href="/staff/checkin" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--burgundy-700)] text-white p-1 shadow-xs overflow-hidden">
              <Image src="/images/logo.png" alt="MUMT Logo" width={28} height={28} className="h-6 w-6 object-contain rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[var(--burgundy-700)] font-display">MUMT LoveUnit</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[var(--rose-100)] text-[var(--burgundy-700)]">ครั้งที่ 9</span>
              </div>
              <h1 className="text-xs font-bold text-[var(--muted)] leading-tight">
                ระบบหน้างาน
              </h1>
            </div>
          </Link>
        </div>

        {/* Tab Switcher */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (tab.href !== '/mt70' && tab.href !== '/admin' && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.href === '/staff/checkin' ? 'เปิดหน้าสแกน QR' : tab.label}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[var(--burgundy-700)] text-white shadow-xs'
                    : 'text-[var(--ink)] hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[var(--burgundy-700)] px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>หน้าหลัก</span>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Mobile Bottom Subnav */}
      <div className="flex items-center justify-around border-t border-[var(--line)] bg-gray-50/90 p-1.5 md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.href === '/staff/checkin' ? 'เปิดหน้าสแกน QR' : tab.label}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg text-[10px] font-bold ${
                isActive ? 'bg-[var(--burgundy-700)] text-white font-black' : 'text-gray-600'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label.split(' (')[0]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

function LogoutButton() {
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      window.location.href = '/staff/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={signingOut}
      className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-2 rounded-xl text-xs transition-all"
    >
      {signingOut ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">ออกจากระบบ</span>
    </button>
  );
}
