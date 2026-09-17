'use client';

import React, { useEffect, useState } from 'react';
import { SiteTheme } from '@/lib/types/database';

interface ThemeInjectorProps {
  initialTheme?: SiteTheme | null;
}

export function ThemeInjector({ initialTheme }: ThemeInjectorProps) {
  const [theme, setTheme] = useState<SiteTheme | null>(initialTheme || null);

  useEffect(() => {
    // 1. Listen for live preview events dispatched by the admin theme editor
    const handlePreviewUpdate = (e: CustomEvent<SiteTheme>) => {
      if (e.detail) {
        setTheme(e.detail);
      }
    };

    window.addEventListener('site-theme-preview' as string, handlePreviewUpdate as EventListener);

    // 2. Fetch latest active theme from public API with cache: 'no-store'
    // Guarantees real-time updates across visits without stale caching
    fetch('/api/theme', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.theme) {
          setTheme(data.theme);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('site-theme-preview' as string, handlePreviewUpdate as EventListener);
    };
  }, []);

  if (!theme) return null;

  const heroBg = theme.hero_gradient_enabled
    ? `linear-gradient(${theme.hero_gradient_angle ?? 140}deg, ${theme.hero_gradient_start}, ${theme.hero_gradient_end})`
    : (theme.primary_hover_color || theme.primary_color);

  const btnBg = theme.button_gradient_enabled
    ? `linear-gradient(${theme.button_gradient_angle ?? 90}deg, ${theme.button_gradient_start}, ${theme.button_gradient_end})`
    : theme.primary_color;

  return (
    <style id="dynamic-site-theme" dangerouslySetInnerHTML={{
      __html: `
        :root {
          --burgundy-950: ${theme.hero_gradient_end || '#38060F'} !important;
          --burgundy-900: ${theme.primary_hover_color || '#560D19'} !important;
          --burgundy-800: ${theme.primary_hover_color || '#560D19'} !important;
          --burgundy-700: ${theme.primary_color || '#6E101E'} !important;
          --burgundy-600: ${theme.primary_color || '#6E101E'} !important;
          --burgundy-500: ${theme.accent_color || '#A81B2D'} !important;
          --burgundy-400: ${theme.accent_color || '#A81B2D'} !important;
          --bg: ${theme.bg_color || '#FBF7F6'} !important;
          --surface: ${theme.surface_color || '#FFFFFF'} !important;
          --hero-custom-bg: ${heroBg} !important;
          --btn-custom-bg: ${btnBg} !important;
          --btn-custom-text: ${theme.button_text_color || '#FFFFFF'} !important;
          --btn-custom-hover: ${theme.primary_hover_color || '#560D19'} !important;
        }

        body {
          background-color: var(--bg) !important;
        }

        .hero-field {
          background: var(--hero-custom-bg) !important;
        }

        .editorial-btn-primary,
        .btn-primary,
        [class*="from-[#D92231]"] {
          background: var(--btn-custom-bg) !important;
          color: var(--btn-custom-text) !important;
        }

        .editorial-btn-primary:hover,
        .btn-primary:hover,
        [class*="from-[#D92231]"]:hover {
          filter: brightness(0.92) !important;
        }

        .editorial-card,
        .editorial-card-flat {
          background-color: var(--surface) !important;
        }

        .text-burgundy,
        [class*="text-[#A6192E]"] {
          color: var(--burgundy-700) !important;
        }
      `,
    }} />
  );
}
