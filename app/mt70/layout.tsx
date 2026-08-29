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
  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.profile.role)) {
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
          <div className="grid h-20 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
            
            {/* Brand Logo & Title */}
            <div className="flex shrink-0 items-center gap-3">
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
            <nav className="hidden min-w-0 items-center justify-center gap-1 overflow-x-auto text-xs font-black md:flex">
              <Link
                href="/mt70"
                className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[var(--ink)] transition-all hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)]"
              >
                <LayoutDashboard className="h-4 w-4 text-[var(--burgundy-600)]" />
                <span>แดชบอร์ด</span>
              </Link>

              <Link
                href="/mt70/registrations"
                className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[var(--ink)] transition-all hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)]"
              >
                <Users className="h-4 w-4 text-blue-600" />
                <span>รายชื่อผู้ลงทะเบียน</span>
              </Link>

              <Link
                href="/mt70/staff"
                className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[var(--ink)] transition-all hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)]"
              >
                <Shield className="h-4 w-4 text-[var(--burgundy-600)]" />
                <span>จัดการ Staff</span>
              </Link>

              <Link
                href="/mt70/content"
                className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[var(--ink)] transition-all hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)]"
              >
                <FileText className="h-4 w-4 text-amber-600" />
                <span>สื่อ & โปสเตอร์</span>
              </Link>

              <Link
                href="/mt70/audit-logs"
                className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[var(--ink)] transition-all hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)]"
              >
                <ScrollText className="h-4 w-4 text-gray-600" />
                <span>Audit Log</span>
              </Link>
            </nav>

            {/* Right Side: Quick Portal Links & User Profile */}
            <div className="flex shrink-0 items-center gap-2.5">
              
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
              <div className="flex items-center gap-2">
                <div
                  role="group"
                  aria-label={`บัญชีผู้ใช้ ${user.profile.display_name} (${user.profile.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'})`}
                  className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-[var(--line)] bg-gray-50 px-2.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--rose-100)] text-[var(--burgundy-700)]">
                    <Shield className="h-4 w-4 text-[var(--burgundy-700)]" />
                  </div>
                  <div className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-[116px] truncate text-xs font-black leading-tight text-[var(--ink)]">
                      {user.profile.display_name}
                    </span>
                    <span className="block text-[10px] font-bold leading-tight text-[var(--muted)]">{user.profile.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span>
                  </div>
                </div>

                <AdminLogoutButton />
              </div>

            </div>

          </div>
        </div>
      </header>

      <nav aria-label="เมนูผู้ดูแลระบบบนมือถือ" className="flex gap-1 overflow-x-auto border-b border-[var(--line)] bg-white px-3 py-2 md:hidden">
        {[
          { href: '/mt70', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/mt70/registrations', label: 'ผู้บริจาค', icon: Users },
          { href: '/mt70/staff', label: 'Staff', icon: Shield },
          { href: '/staff/checkin', label: 'Scan', icon: QrCode },
        ].map((item) => {
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-[var(--ink)] hover:bg-[var(--rose-100)]"><Icon className="h-4 w-4 text-[var(--burgundy-700)]" />{item.label}</Link>;
        })}
      </nav>

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
