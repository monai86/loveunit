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
  BarChart3 
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/mt70', label: 'แดชบอร์ด', icon: LayoutDashboard, exact: true },
  { href: '/mt70/registrations', label: 'รายชื่อผู้ลงทะเบียน', icon: Users },
  { href: '/mt70/analytics', label: 'สถิติเจาะลึก', icon: BarChart3 },
  { href: '/mt70/staff', label: 'จัดการ Staff', icon: Shield },
  { href: '/mt70/content', label: 'สื่อ & โปสเตอร์', icon: FileText },
  { href: '/mt70/audit-logs', label: 'Audit Log', icon: ScrollText },
];

export function AdminDesktopNav() {
  const pathname = usePathname();

  return (
    <nav 
      aria-label="เมนูผู้ดูแลระบบบนคอมพิวเตอร์"
      className="hidden min-w-0 items-center justify-center gap-1 overflow-x-auto text-xs font-black md:flex"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            aria-current={isActive ? 'page' : undefined}
            className={`flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-800)] text-white shadow-md shadow-rose-950/15 font-black scale-[1.02]'
                : 'text-gray-700 hover:bg-rose-50/80 hover:text-[var(--burgundy-700)]'
            }`}
          >
            <Icon 
              className={`h-4 w-4 transition-colors ${
                isActive ? 'text-rose-100' : 'text-gray-400 group-hover:text-[var(--burgundy-700)]'
              }`} 
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
