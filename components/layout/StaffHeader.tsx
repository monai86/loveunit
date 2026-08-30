'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { QrCode, UserPlus, BarChart3, LogOut, Loader2, LayoutDashboard, ClipboardList, ArrowLeft } from 'lucide-react';
import { authClient } from '@/lib/auth/client';

export function StaffHeader() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    if (!pathname.startsWith('/staff/')) return;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setIsAdmin(['SUPER_ADMIN', 'ADMIN'].includes(data?.user?.profile?.role)))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  // Only render on operational staff routes (not on login, change-password, or admin which has its own layout)
  if (
    pathname === '/staff/checkin' ||
    pathname.startsWith('/staff/login') ||
    pathname.startsWith('/staff/change-password') ||
    pathname.startsWith('/staff/apply') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/mt70') ||
    !pathname.startsWith('/staff')
  ) {
    return null;
  }

  const tabs = [
    { href: '/staff/overview', label: 'ภาพรวม & รายชื่อ', icon: LayoutDashboard },
    { href: '/staff/walk-in', label: 'ลงทะเบียน Walk-in', icon: UserPlus },
    ...(isAdmin ? [{ href: '/mt70', label: 'แดชบอร์ด Admin', icon: BarChart3 }] : []),
  ];

  return (
    <>
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md text-[var(--ink)] border-b border-[var(--line)] select-none shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16 sm:px-6">
        
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link href="/staff/overview" className="flex items-center gap-2 sm:gap-2.5 shrink min-w-0 group">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-white p-1 border border-[var(--line)] shadow-xs transition-transform group-hover:scale-105 overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="MUMT LOVE UNIT Logo" 
                width={40} 
                height={40} 
                className="h-full w-full object-contain rounded-full" 
                priority 
              />
            </div>
            <div className="shrink-0 flex flex-col justify-center">
              <span className="text-xs sm:text-sm font-bold text-[var(--ink)] tracking-normal whitespace-nowrap font-display">
                MUMT LoveUnit <span className="text-[var(--burgundy-600)] font-extrabold">ครั้งที่ 9</span>
              </span>
              <h1 className="text-[10px] text-[var(--muted)] whitespace-nowrap block leading-tight font-medium">
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
                aria-label={tab.label}
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
          <Link href="/staff/checkin" aria-label="เปิดหน้าสแกน QR" className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white shadow-xs transition-colors hover:bg-emerald-700">
            <QrCode className="h-4 w-4" />
            <span>สแกน QR</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAdmin && (
            <Link
              href="/mt70"
              className="inline-flex md:hidden items-center gap-1 rounded-xl bg-gradient-to-r from-[var(--burgundy-800)] to-[var(--burgundy-600)] px-2.5 py-1.5 text-[11px] font-black text-white shadow-xs"
            >
              <BarChart3 className="h-3.5 w-3.5 text-amber-300" />
              <span>Admin</span>
            </Link>
          )}

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

    </header>
    <nav 
      className={`fixed inset-x-0 bottom-0 z-50 grid h-[calc(4.75rem+env(safe-area-inset-bottom))] ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} items-end border-t border-[var(--line)] bg-white/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(51,25,31,0.08)] backdrop-blur md:hidden`} 
      aria-label="เมนูหน้างาน"
    >
      <Link href="/staff/overview" className={`flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${pathname.startsWith('/staff/overview') ? 'text-[var(--burgundy-700)]' : 'text-[var(--muted)]'}`}>
        <ClipboardList className="h-5 w-5" />
        <span>ภาพรวม</span>
      </Link>
      <Link href="/staff/checkin" aria-label="เปิดหน้าสแกน QR" className="-mt-6 flex h-14 w-14 justify-self-center flex-col items-center justify-center rounded-full border-4 border-[var(--bg)] bg-[var(--burgundy-700)] text-[10px] font-black text-white shadow-lg">
        <QrCode className="h-5 w-5" />
        <span>สแกน</span>
      </Link>
      <Link href="/staff/walk-in" className={`flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${pathname.startsWith('/staff/walk-in') ? 'text-[var(--burgundy-700)]' : 'text-[var(--muted)]'}`}>
        <UserPlus className="h-5 w-5" />
        <span>Walk-in</span>
      </Link>
      {isAdmin && (
        <Link href="/mt70" className="flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-black text-[var(--burgundy-700)]">
          <BarChart3 className="h-5 w-5 text-[var(--burgundy-700)]" />
          <span>Admin</span>
        </Link>
      )}
    </nav>
    </>
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
