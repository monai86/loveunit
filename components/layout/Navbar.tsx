'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  Menu, 
  X, 
  BookOpen, 
  MapPin, 
  Home, 
  ArrowRight,
  Image as ImageIcon,
  CheckSquare,
  Microscope,
  Globe
} from 'lucide-react';
import { useLanguage, TRANSLATIONS } from '@/lib/i18n/LanguageContext';

const emptySubscribe = () => () => {};

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const pathname = usePathname();
  const { language, setLanguage, isTh, isEn } = useLanguage();

  // PUBLIC DONOR NAVIGATION LINKS (DYNAMIC TRANSLATION)
  const navLinks = [
    { href: '/', label: TRANSLATIONS.nav.home[language], icon: Home },
    { href: '/screening', label: TRANSLATIONS.nav.screening[language], icon: CheckSquare },
    { href: '/knowledge', label: TRANSLATIONS.nav.knowledge[language], icon: Microscope },
    { href: '/prepare', label: TRANSLATIONS.nav.prepare[language], icon: BookOpen },
    { href: '/poster', label: TRANSLATIONS.nav.poster[language], icon: ImageIcon },
    { href: '/location', label: TRANSLATIONS.nav.location[language], icon: MapPin },
  ];

  // Do not render public navbar on staff/admin/mt70 routes (they use StaffHeader)
  if (pathname.startsWith('/staff') || pathname.startsWith('/admin') || pathname.startsWith('/mt70')) {
    return null;
  }

  const langSwitcher = (
    <div 
      className="flex items-center rounded-xl bg-black/5 p-0.5 border border-[var(--line)] shadow-2xs" 
      role="group" 
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('th')}
        className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
          isTh
            ? 'bg-white text-[var(--burgundy-700)] shadow-xs scale-100'
            : 'text-[var(--muted)] hover:text-[var(--ink)]'
        }`}
        aria-label="ภาษาไทย"
      >
        TH
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
          isEn
            ? 'bg-white text-[var(--burgundy-700)] shadow-xs scale-100'
            : 'text-[var(--muted)] hover:text-[var(--ink)]'
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-md select-none shadow-2xs" suppressHydrationWarning>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 xl:px-8 gap-3 sm:gap-4">
        
        {/* 1. Left: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink min-w-0 group">
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
              MUMT LoveUnit <span className="text-[var(--burgundy-600)] font-extrabold">{TRANSLATIONS.nav.eventBadge[language]}</span>
            </span>
            <span className="text-[10px] text-[var(--muted)] whitespace-nowrap hidden 2xl:block">
              {TRANSLATIONS.nav.brandSub[language]}
            </span>
          </div>
        </Link>

        {/* 2. Center: Public Navigation links (Desktop >= 1280px) */}
        <nav className="hidden xl:flex items-center justify-center gap-1 2xl:gap-2 flex-1 min-w-0 mx-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs 2xl:text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-2xs font-bold'
                    : 'text-[var(--ink)] hover:bg-black/5 hover:text-[var(--burgundy-700)]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 2xl:h-4 2xl:w-4 shrink-0 ${isActive ? 'text-[var(--burgundy-700)]' : 'text-[var(--muted)]'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Right: Language Switcher & Desktop CTA Button (>= 1280px) */}
        <div className="hidden xl:flex items-center gap-3 shrink-0">
          {langSwitcher}
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center gap-1.5 bg-[var(--burgundy-700)] hover:bg-[var(--burgundy-800)] text-white font-bold px-4 py-2 rounded-xl text-xs 2xl:text-[13px] shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <Heart className="h-3.5 w-3.5 fill-white shrink-0" />
            <span>{TRANSLATIONS.nav.register[language]}</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
          </Link>
        </div>

        {/* Mobile & Tablet Action & Hamburger (< 1280px) */}
        <div className="flex items-center gap-2 shrink-0 xl:hidden">
          {langSwitcher}

          <Link
            href="/register"
            className="inline-flex min-h-10 items-center gap-1 bg-[var(--burgundy-700)] hover:bg-[var(--burgundy-800)] text-white font-bold px-2.5 py-1.5 rounded-xl text-xs shadow-xs whitespace-nowrap shrink-0 transition-all active:scale-95"
          >
            <Heart className="h-3 w-3 fill-white shrink-0" />
            <span className="whitespace-nowrap font-extrabold">{isTh ? 'ลงทะเบียน' : 'Register'}</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--burgundy-700)] cursor-pointer shrink-0 shadow-2xs"
            aria-label={isTh ? 'เปิดเมนูหลัก' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div id="public-mobile-menu" className="border-t border-[var(--line)] bg-[var(--bg)] px-4 py-4 shadow-xl xl:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] px-2">
              <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>{isTh ? 'ภาษา / Language' : 'Language / ภาษา'}</span>
              </span>
              {langSwitcher}
            </div>

            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = mounted && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[var(--rose-100)] text-[var(--burgundy-700)]'
                      : 'text-[var(--ink)] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[var(--burgundy-700)]" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              );
            })}

            <div className="mt-2 pt-2 border-t border-[var(--line)]">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 bg-[var(--burgundy-600)] text-white font-extrabold w-full py-3 text-sm rounded-xl shadow-md"
              >
                <Heart className="h-4 w-4 fill-white" />
                <span>{TRANSLATIONS.nav.register[language]}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
