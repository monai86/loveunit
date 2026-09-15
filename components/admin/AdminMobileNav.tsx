'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  FileText, 
  ScrollText, 
  QrCode,
  BarChart3 
} from 'lucide-react';

export function AdminMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/mt70', label: 'แดชบอร์ด', icon: LayoutDashboard, exact: true },
    { href: '/mt70/registrations', label: 'ผู้บริจาค', icon: Users },
    { href: '/mt70/analytics', label: 'สถิติ', icon: BarChart3 },
    { href: '/mt70/staff', label: 'Staff', icon: Shield },
    { href: '/mt70/content', label: 'สื่อ/โปสเตอร์', icon: FileText },
    { href: '/mt70/audit-logs', label: 'Audit Log', icon: ScrollText },
  ];

  return (
    <nav 
      aria-label="เมนูผู้ดูแลระบบบนมือถือ" 
      className="sticky top-16 z-30 flex items-center gap-1.5 overflow-x-auto border-b border-rose-100/80 bg-white/95 backdrop-blur-md px-3 py-2.5 md:hidden no-scrollbar shadow-sm"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact 
          ? pathname === item.href 
          : pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-800)] text-white shadow-sm shadow-rose-950/20 font-black'
                : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-rose-50 hover:text-[var(--burgundy-700)]'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-rose-100' : 'text-[var(--burgundy-700)]'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <Link
        href="/staff/checkin"
        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-black text-white shadow-sm shadow-emerald-700/20 transition-all hover:brightness-105"
      >
        <QrCode className="h-3.5 w-3.5 text-white" />
        <span>สแกน QR</span>
      </Link>
    </nav>
  );
}
