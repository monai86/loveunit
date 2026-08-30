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
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans antialiased text-[var(--ink)]">
      
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[var(--line)] shadow-2xs">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
            
            {/* Brand Logo & Title */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link href="/mt70" className="flex items-center gap-2 sm:gap-2.5 shrink min-w-0 group">
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-[var(--ink)] tracking-normal whitespace-nowrap font-display">
                      MUMT LoveUnit <span className="text-[var(--burgundy-600)] font-extrabold">ครั้งที่ 9</span>
                    </span>
                    <span className="inline-flex sm:hidden px-1.5 py-0.5 rounded-md bg-[var(--rose-100)] text-[var(--burgundy-700)] text-[9px] font-black uppercase font-mono">
                      {isSuper ? 'SUPER' : 'ADMIN'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] whitespace-nowrap block leading-tight font-medium">
                    แดชบอร์ดแอดมิน
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
                className="hidden h-11 lg:inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100"
                title="เปิดหน้าระบบสแกน QR Code หน้างาน"
              >
                <QrCode className="h-3.5 w-3.5 text-emerald-700" />
                <span>จุดสแกน QR</span>
              </Link>

              <div className="hidden h-6 w-px bg-gray-200 sm:block" />

              {/* User & Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  role="group"
                  aria-label={`บัญชีผู้ใช้ ${user.profile.display_name} (${isSuper ? 'Super Admin' : 'Admin'})`}
                  className="flex h-10 sm:h-11 min-w-0 items-center gap-2 rounded-xl border border-[var(--line)] bg-gray-50 px-2 sm:px-2.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--rose-100)] text-[var(--burgundy-700)]">
                    <Shield className="h-4 w-4 text-[var(--burgundy-700)]" />
                  </div>
                  <div className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-[116px] truncate text-xs font-black leading-tight text-[var(--ink)]">
                      {user.profile.display_name}
                    </span>
                    <span className="block text-[10px] font-bold leading-tight text-[var(--muted)]">
                      {isSuper ? 'Super Admin' : 'Admin'}
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
      <main className="flex-1">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-[var(--line)] bg-white py-4 text-center text-xs text-[var(--muted)] font-medium">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MUMT LoveUnit ครั้งที่ 9 · แดชบอร์ดผู้ดูแลระบบ</span>
          <span className="font-mono text-[11px] text-gray-400">ระบบปฏิบัติการออนไลน์ คณะเทคนิคการแพทย์ ม.มหิดล</span>
        </div>
      </footer>

    </div>
  );
}
