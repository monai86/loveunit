import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/server';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ScrollText, 
  QrCode, 
  Shield
} from 'lucide-react';
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  // Non-admin or no session → staff login page.
  if (!user || user.profile.role !== 'ADMIN') {
    redirect('/staff/login');
  }

  // First login — must set a personal password before accessing admin.
  if (user.mustChangePassword) {
    redirect('/staff/change-password');
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans antialiased text-[var(--ink)]">
      
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[var(--line)] shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <Link href="/mt70" className="flex items-center gap-2.5 group">
                <div className="h-9 w-9 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center shadow-xs overflow-hidden">
                  <Image src="/images/logo.png" alt="MUMT Logo" width={28} height={28} className="h-6 w-6 object-contain rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[var(--burgundy-700)] font-display">MUMT LoveUnit</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[var(--rose-100)] text-[var(--burgundy-700)]">ครั้งที่ 9</span>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--muted)] block leading-tight">แดชบอร์ดแอดมิน</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-black">
              <Link
                href="/mt70"
                className="px-3.5 py-2 rounded-xl text-[var(--ink)] hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)] transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4 text-[var(--burgundy-600)]" />
                <span>แดชบอร์ด</span>
              </Link>

              <Link
                href="/mt70/registrations"
                className="px-3.5 py-2 rounded-xl text-[var(--ink)] hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)] transition-all flex items-center gap-1.5"
              >
                <Users className="h-4 w-4 text-blue-600" />
                <span>รายชื่อผู้ลงทะเบียน</span>
              </Link>

              <Link
                href="/mt70/content"
                className="px-3.5 py-2 rounded-xl text-[var(--ink)] hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)] transition-all flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4 text-amber-600" />
                <span>สื่อ & โปสเตอร์</span>
              </Link>

              <Link
                href="/mt70/audit-logs"
                className="px-3.5 py-2 rounded-xl text-[var(--ink)] hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)] transition-all flex items-center gap-1.5"
              >
                <ScrollText className="h-4 w-4 text-gray-600" />
                <span>Audit Log</span>
              </Link>
            </nav>

            {/* Right Side: Quick Portal Links & User Profile */}
            <div className="flex items-center gap-2.5">
              
              <Link
                href="/staff/checkin"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-all"
                title="เปิดหน้าระบบสแกน QR Code หน้างาน"
              >
                <QrCode className="h-3.5 w-3.5 text-emerald-700" />
                <span>จุดสแกน QR</span>
              </Link>

              <div className="h-4 w-px bg-gray-200 hidden sm:block" />

              {/* User & Logout */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-gray-50 border border-[var(--line)]">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-black text-[var(--ink)] block leading-tight truncate max-w-[130px]">
                      {user.profile.display_name}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--muted)]">Admin</span>
                  </div>

                  <div className="h-7 w-7 rounded-lg bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center">
                    <Shield className="h-4 w-4 text-[var(--burgundy-700)]" />
                  </div>
                </div>

                <AdminLogoutButton />
              </div>

            </div>

          </div>
        </div>
      </header>

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
