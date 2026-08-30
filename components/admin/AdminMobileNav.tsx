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
  QrCode 
} from 'lucide-react';

export function AdminMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/mt70', label: 'แดชบอร์ด', icon: LayoutDashboard, exact: true },
    { href: '/mt70/registrations', label: 'ผู้บริจาค', icon: Users },
    { href: '/mt70/staff', label: 'Staff', icon: Shield },
    { href: '/mt70/content', label: 'สื่อ/โปสเตอร์', icon: FileText },
    { href: '/mt70/audit-logs', label: 'Audit Log', icon: ScrollText },
  ];

  return (
    <nav 
      aria-label="เมนูผู้ดูแลระบบบนมือถือ" 
      className="sticky top-16 z-30 flex items-center gap-1.5 overflow-x-auto border-b border-[var(--line)] bg-white/95 backdrop-blur-md px-3 py-2 md:hidden no-scrollbar shadow-2xs"
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
                ? 'bg-[var(--burgundy-700)] text-white shadow-xs'
                : 'bg-gray-50 text-[var(--ink)] border border-gray-200/60 hover:bg-[var(--rose-100)] hover:text-[var(--burgundy-700)]'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[var(--burgundy-700)]'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <Link
        href="/staff/checkin"
        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 transition-all hover:bg-emerald-100"
      >
        <QrCode className="h-3.5 w-3.5 text-emerald-700" />
        <span>สแกน QR</span>
      </Link>
    </nav>
  );
}
