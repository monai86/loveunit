'use client';

import React, { useEffect, useState } from 'react';
import { SiteTheme } from '@/lib/types/database';

interface ThemeInjectorProps {
  initialTheme?: SiteTheme | null;
}

export function ThemeInjector({ initialTheme }: ThemeInjectorProps) {
  const [theme, setTheme] = useState<SiteTheme | null>(initialTheme || null);

  useEffect(() => {
    // Listen for custom live preview events dispatched by the admin theme editor
    const handlePreviewUpdate = (e: CustomEvent<SiteTheme>) => {
      if (e.detail) {
        setTheme(e.detail);
      }
    };

    window.addEventListener('site-theme-preview' as string, handlePreviewUpdate as EventListener);

    // If initialTheme wasn't provided, fetch public theme
    if (!initialTheme) {
      fetch('/api/theme')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.theme) {
            setTheme(data.theme);
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('site-theme-preview' as string, handlePreviewUpdate as EventListener);
    };
  }, [initialTheme]);

  if (!theme) return null;

  const defaultHeroBg = 'radial-gradient(100% 75% at 85% 0%, rgba(240, 100, 85, 0.32) 0%, transparent 60%), radial-gradient(90% 80% at 10% 100%, rgba(210, 45, 60, 0.38) 0%, transparent 65%), radial-gradient(60% 60% at 50% 30%, rgba(185, 25, 45, 0.25) 0%, transparent 70%), linear-gradient(140deg, #9C1528 0%, #7E0E1D 30%, #5E0B17 65%, #3B060F 100%)';
  const defaultBtnBg = 'linear-gradient(to right, #D92231, #A6192E, #7E1120)';

  const heroBg = theme.preset_name === 'default'
    ? defaultHeroBg
    : theme.hero_gradient_enabled
      ? `linear-gradient(${theme.hero_gradient_angle}deg, ${theme.hero_gradient_start}, ${theme.hero_gradient_end})`
      : theme.primary_hover_color || theme.primary_color;

  const btnBg = theme.preset_name === 'default'
    ? defaultBtnBg
    : theme.button_gradient_enabled
      ? `linear-gradient(${theme.button_gradient_angle}deg, ${theme.button_gradient_start}, ${theme.button_gradient_end})`
      : theme.primary_color;

  return (
    <style id="dynamic-site-theme" dangerouslySetInnerHTML={{
      __html: `
        :root {
          --burgundy-700: ${theme.primary_color} !important;
          --burgundy-800: ${theme.primary_hover_color} !important;
          --burgundy-500: ${theme.accent_color} !important;
          --bg: ${theme.bg_color} !important;
          --surface: ${theme.surface_color} !important;
          --hero-custom-bg: ${heroBg} !important;
          --btn-custom-bg: ${btnBg} !important;
          --btn-custom-text: ${theme.button_text_color} !important;
        }
      `,
    }} />
  );
}
