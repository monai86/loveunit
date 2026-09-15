'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl text-[var(--ink)] border-b border-rose-100/80 select-none shadow-[0_4px_20px_-4px_rgba(110,16,30,0.04)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16 sm:h-20 sm:px-6">
        
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link href="/staff/overview" className="flex items-center gap-2.5 sm:gap-3 shrink min-w-0 group">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-rose-50 p-1 border border-rose-200/80 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-rose-900/10 overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="MUMT LOVE UNIT Logo" 
                width={44} 
                height={44} 
                className="h-full w-full object-contain rounded-xl" 
                priority 
              />
            </div>
            <div className="shrink-0 flex flex-col justify-center">
              <span className="text-xs sm:text-sm font-bold text-[var(--ink)] tracking-tight whitespace-nowrap font-display">
                MUMT LoveUnit <span className="text-[var(--burgundy-700)] font-extrabold">ครั้งที่ 9</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <h1 className="text-[11px] text-[var(--muted)] whitespace-nowrap block leading-tight font-medium">
                  ระบบปฏิบัติการหน้างาน
                </h1>
              </div>
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
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-800)] text-white shadow-md shadow-rose-950/15 font-black scale-[1.02]'
                    : 'text-gray-700 hover:bg-rose-50/80 hover:text-[var(--burgundy-700)]'
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-rose-100' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
          <Link 
            href="/staff/checkin" 
            aria-label="เปิดหน้าสแกน QR" 
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 py-2 text-xs font-black text-white shadow-sm shadow-emerald-700/20 transition-all hover:shadow-md active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            <span>จุดสแกน QR</span>
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
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[var(--burgundy-700)] px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>หน้าหลัก</span>
          </Link>
          <LogoutButton />
        </div>
      </div>

    </header>
    <nav 
      className={`fixed inset-x-0 bottom-0 z-50 grid h-[calc(4.75rem+env(safe-area-inset-bottom))] ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} items-end border-t border-rose-100/80 bg-white/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(51,25,31,0.06)] backdrop-blur md:hidden`} 
      aria-label="เมนูหน้างาน"
    >
      <Link href="/staff/overview" className={`flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${pathname.startsWith('/staff/overview') ? 'text-[var(--burgundy-700)] font-black' : 'text-[var(--muted)]'}`}>
        <ClipboardList className="h-5 w-5" />
        <span>ภาพรวม</span>
      </Link>
      <Link href="/staff/checkin" aria-label="เปิดหน้าสแกน QR" className="-mt-6 flex h-14 w-14 justify-self-center flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-rose-700 to-red-800 text-[10px] font-black text-white shadow-lg shadow-rose-900/30 active:scale-95 transition-transform">
        <QrCode className="h-5 w-5" />
        <span>สแกน</span>
      </Link>
      <Link href="/staff/walk-in" className={`flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${pathname.startsWith('/staff/walk-in') ? 'text-[var(--burgundy-700)] font-black' : 'text-[var(--muted)]'}`}>
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
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      router.replace('/staff/login');
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={signingOut}
      className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-2xs active:scale-95"
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
