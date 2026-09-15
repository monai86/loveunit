import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/server';
import { 
  QrCode, 
  Shield
} from 'lucide-react';
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { AdminDesktopNav } from '@/components/admin/AdminDesktopNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  // Non-admin or no session → staff login page.
  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.profile.role)) {
    redirect('/staff/login');
  }

  // First login — must set a personal password before accessing admin.
  if (user.mustChangePassword) {
    redirect('/staff/change-password');
  }

  const isSuper = user.profile.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDFD] via-[#FAF4F5] to-[#F5ECEE] flex flex-col font-sans antialiased text-[var(--ink)] relative selection:bg-rose-100 selection:text-rose-900">
      {/* Ambient background glow accents (subtle, non-distracting depth) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-40 right-[-10%] h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-red-100/20 blur-3xl" />
      </div>

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-rose-100/80 shadow-[0_4px_20px_-4px_rgba(110,16,30,0.04)]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 relative z-10">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
            
            {/* Brand Logo & Title */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link href="/mt70" className="flex items-center gap-2.5 sm:gap-3 shrink min-w-0 group">
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[var(--ink)] tracking-tight whitespace-nowrap font-display">
                      MUMT LoveUnit <span className="text-[var(--burgundy-700)] font-extrabold">ครั้งที่ 9</span>
                    </span>
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300/70 text-amber-900 text-[10px] font-black uppercase font-mono tracking-wider shadow-2xs">
                      {isSuper ? '★ SUPER ADMIN' : 'ADMIN'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] whitespace-nowrap block leading-tight font-medium mt-0.5">
                    ระบบบัญชาการและแดชบอร์ดแอดมิน
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <AdminDesktopNav />

            {/* Right Side: Quick Portal Links & User Profile */}
            <div className="flex shrink-0 items-center gap-2">
              
              <Link
                href="/staff/checkin"
                className="hidden h-10 sm:h-11 lg:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 text-xs font-black text-white shadow-sm shadow-emerald-700/20 transition-all hover:shadow-md hover:shadow-emerald-700/30 active:scale-95"
                title="เปิดหน้าระบบสแกน QR Code หน้างาน"
              >
                <QrCode className="h-4 w-4" />
                <span>จุดสแกน QR</span>
              </Link>

              <div className="hidden h-7 w-px bg-rose-200/60 sm:block" />

              {/* User & Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  role="group"
                  aria-label={`บัญชีผู้ใช้ ${user.profile.display_name} (${isSuper ? 'Super Admin' : 'Admin'})`}
                  className="flex h-10 sm:h-11 min-w-0 items-center gap-2 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/50 to-white px-2.5 sm:px-3 shadow-2xs"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-xs">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-[120px] truncate text-xs font-black leading-tight text-[var(--ink)]">
                      {user.profile.display_name}
                    </span>
                    <span className="block text-[10px] font-bold leading-tight text-rose-700">
                      {isSuper ? 'ผู้ดูแลระบบสูงสุด' : 'ผู้ดูแลระบบ'}
                    </span>
                  </div>
                </div>

                <AdminLogoutButton />
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Responsive Symmetrical Mobile Admin Navigation */}
      <AdminMobileNav />

      {/* Main Admin Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="relative z-10 border-t border-rose-100/80 bg-white/80 backdrop-blur-md py-4 text-center text-xs text-[var(--muted)] font-medium">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-[var(--ink)]">MUMT LoveUnit ครั้งที่ 9 · แดชบอร์ดผู้ดูแลระบบ</span>
          <span className="font-mono text-[11px] text-gray-500">ระบบปฏิบัติการออนไลน์ คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล</span>
        </div>
      </footer>

    </div>
  );
}
