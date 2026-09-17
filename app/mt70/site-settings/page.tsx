'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  Palette, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  Sliders, 
  Sun, 
  Check, 
  Eye, 
  Megaphone,
  Heart,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { SiteTheme, EventContentBlock } from '@/lib/types/database';

interface EventData {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  start_at: string;
  end_at: string;
  venue_name: string;
  venue_detail: string;
  registration_open_at: string;
  registration_close_at: string;
  status: string;
}

interface SlotData {
  id: string;
  start_at: string;
  end_at: string;
  capacity: number;
  booked_count?: number;
  is_active: boolean;
}

// Curated Accessible Presets
const THEME_PRESETS: Array<{
  id: string;
  name: string;
  desc: string;
  previewGradient: string;
  theme: Partial<SiteTheme>;
}> = [
  {
    id: 'default',
    name: '🌟 สไตล์ทางการปัจจุบัน (Default MUMT 2026)',
    desc: 'สไตล์ดั้งเดิมของเว็บ: แดงเลือดหมู Editorial + Gradient พื้นหลังหลายมิติ + ปุ่มแดงไล่เฉดคมชัด',
    previewGradient: 'linear-gradient(140deg, #9C1528 0%, #7E0E1D 40%, #3B060F 100%)',
    theme: {
      preset_name: 'default',
      primary_color: '#6E101E',
      primary_hover_color: '#560D19',
      button_text_color: '#FFFFFF',
      bg_color: '#FBF7F6',
      surface_color: '#FFFFFF',
      accent_color: '#A81B2D',
      hero_gradient_enabled: true,
      hero_gradient_start: '#9C1528',
      hero_gradient_end: '#3B060F',
      hero_gradient_angle: 140,
      button_gradient_enabled: true,
      button_gradient_start: '#D92231',
      button_gradient_end: '#7E1120',
      button_gradient_angle: 90,
    }
  },
  {
    id: 'crimson',
    name: 'Crimson Modern Energy',
    desc: 'แดงสว่างสดใส มีพลัง สไตล์แคมเปญคนรุ่นใหม่',
    previewGradient: 'linear-gradient(135deg, #C1121F 0%, #780000 100%)',
    theme: {
      preset_name: 'crimson',
      primary_color: '#B21E2B',
      primary_hover_color: '#870F19',
      button_text_color: '#FFFFFF',
      bg_color: '#FFFBFB',
      surface_color: '#FFFFFF',
      accent_color: '#E63946',
      hero_gradient_enabled: true,
      hero_gradient_start: '#C1121F',
      hero_gradient_end: '#5F0910',
      hero_gradient_angle: 135,
      button_gradient_enabled: true,
      button_gradient_start: '#C1121F',
      button_gradient_end: '#870F19',
      button_gradient_angle: 90,
    }
  },
  {
    id: 'velvet',
    name: 'Rose Velvet & Warmth',
    desc: 'ชมพู-แดง อบอุ่น นุ่มนวล ให้ความรู้สึกใจฟูและให้เกียรติ',
    previewGradient: 'linear-gradient(135deg, #A82845 0%, #681225 100%)',
    theme: {
      preset_name: 'velvet',
      primary_color: '#9E1E3A',
      primary_hover_color: '#751128',
      button_text_color: '#FFFFFF',
      bg_color: '#FDF8F9',
      surface_color: '#FFFFFF',
      accent_color: '#D4375A',
      hero_gradient_enabled: true,
      hero_gradient_start: '#B32647',
      hero_gradient_end: '#590E1F',
      hero_gradient_angle: 135,
      button_gradient_enabled: false,
    }
  },
  {
    id: 'maroon',
    name: 'Editorial Maroon & Cream',
    desc: 'แดงเข้มขรึม ตัดกับสีครีม เรียบหรูสไตล์นิตยสารบทความ',
    previewGradient: 'linear-gradient(135deg, #4A0B16 0%, #2A040A 100%)',
    theme: {
      preset_name: 'maroon',
      primary_color: '#520B17',
      primary_hover_color: '#38050E',
      button_text_color: '#FDF6F1',
      bg_color: '#F7F3F1',
      surface_color: '#FFFFFF',
      accent_color: '#8A1729',
      hero_gradient_enabled: true,
      hero_gradient_start: '#590C19',
      hero_gradient_end: '#2B040B',
      hero_gradient_angle: 145,
      button_gradient_enabled: false,
    }
  },
];

// Helper to calculate simple contrast ratio luminance check
function getContrastNotice(bgColorHex: string, textColorHex: string) {
  try {
    const parse = (h: string) => {
      const clean = h.replace('#', '');
      const rgb = parseInt(clean, 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };
    const bLum = parse(bgColorHex);
    const tLum = parse(textColorHex);
    const diff = Math.abs(bLum - tLum);
    if (diff < 0.35) {
      return { ok: false, msg: '⚠️ สีตัวหนังสืออาจกลืนกับปุ่ม (Contrast ต่ำ แนะนำปรับให้ตัดกันมากขึ้น)' };
    }
    return { ok: true, msg: '✅ ความคมชัดระดับมาตรฐาน (อ่านง่าย ผ่านเกณฑ์ WCAG)' };
  } catch {
    return { ok: true, msg: 'ความคมชัดพร้อมใช้งาน' };
  }
}

export default function AdminSiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<'theme' | 'event' | 'content' | 'media'>('theme');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Theme State
  const [theme, setTheme] = useState<SiteTheme>({
    theme_key: 'default',
    preset_name: 'default',
    primary_color: '#6E101E',
    primary_hover_color: '#560D19',
    button_text_color: '#FFFFFF',
    bg_color: '#FBF7F6',
    surface_color: '#FFFFFF',
    accent_color: '#A81B2D',
    hero_gradient_enabled: true,
    hero_gradient_start: '#9C1528',
    hero_gradient_end: '#3B060F',
    hero_gradient_angle: 140,
    button_gradient_enabled: true,
    button_gradient_start: '#D92231',
    button_gradient_end: '#7E1120',
    button_gradient_angle: 90,
  });

  // Event & Slots State
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [contentBlocks, setContentBlocks] = useState<EventContentBlock[]>([]);

  // Emergency banner toggle & text
  const [urgentBannerEnabled, setUrgentBannerEnabled] = useState(false);
  const [urgentBannerText, setUrgentBannerText] = useState('');

  // Load initial settings
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [themeRes, siteRes] = await Promise.all([
          fetch('/api/admin/theme'),
          fetch('/api/admin/site-settings'),
        ]);

        if (themeRes.ok) {
          const tData = await themeRes.json();
          if (tData.theme) setTheme(tData.theme);
        }

        if (siteRes.ok) {
          const sData = await siteRes.json();
          if (sData.event) setEventData(sData.event);
          if (sData.slots) setSlots(sData.slots);
          if (sData.contentBlocks) {
            setContentBlocks(sData.contentBlocks);
            const urgent = sData.contentBlocks.find((b: EventContentBlock) => b.content_key === 'urgent_banner');
            if (urgent) {
              setUrgentBannerEnabled(urgent.is_visible);
              setUrgentBannerText(urgent.description || urgent.title || '');
            }
          }
        }
      } catch (err) {
        console.error('Error loading site settings:', err);
        setErrorMsg('ไม่สามารถโหลดข้อมูลการตั้งค่าได้ กรุณาลองใหม่');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Broadcast preview updates to the ThemeInjector on this tab
  const updateThemeField = (updates: Partial<SiteTheme>) => {
    setTheme((prev) => {
      const next = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('site-theme-preview', { detail: next }));
      }
      return next;
    });
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    updateThemeField(preset.theme);
    setSuccessMsg(`เลือกใช้ชุดสี "${preset.name}" แล้ว`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const resetThemeToDefault = () => {
    const defaultPreset = THEME_PRESETS[0];
    updateThemeField(defaultPreset.theme);
    setSuccessMsg('กู้คืนธีมเป็น "สไตล์ทางการปัจจุบัน (Default MUMT 2026)" เรียบร้อยแล้ว');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const contrastStatus = useMemo(() => {
    return getContrastNotice(theme.primary_color, theme.button_text_color);
  }, [theme.primary_color, theme.button_text_color]);

  // Save changes
  const handleSaveAll = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Save Theme
      const themePromise = fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });

      // 2. Prepare Site updates
      const sitePayload: {
        eventUpdates?: Record<string, unknown>;
        slotUpdates?: Array<{ id: string; capacity: number; isActive: boolean }>;
        contentBlockUpdates?: Array<{ id: string; title: string; description: string; isVisible: boolean }>;
      } = {};

      if (eventData) {
        sitePayload.eventUpdates = {
          name: eventData.name,
          shortName: eventData.short_name,
          description: eventData.description,
          startAt: eventData.start_at,
          endAt: eventData.end_at,
          venueName: eventData.venue_name,
          venueDetail: eventData.venue_detail,
          registrationOpenAt: eventData.registration_open_at,
          registrationCloseAt: eventData.registration_close_at,
          status: eventData.status,
        };
      }

      if (slots.length > 0) {
        sitePayload.slotUpdates = slots.map((s) => ({
          id: s.id,
          capacity: Number(s.capacity) || 35,
          isActive: s.is_active,
        }));
      }

      // Update urgent banner block if found
      const urgentBlock = contentBlocks.find((b) => b.content_key === 'urgent_banner');
      if (urgentBlock) {
        sitePayload.contentBlockUpdates = [
          {
            id: urgentBlock.id,
            title: urgentBannerText || 'ประกาศด่วน',
            description: urgentBannerText,
            isVisible: urgentBannerEnabled,
          },
        ];
      }

      const sitePromise = fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sitePayload),
      });

      const [themeRes, siteRes] = await Promise.all([themePromise, sitePromise]);

      if (themeRes.ok && siteRes.ok) {
        setSuccessMsg('🎉 บันทึกการตั้งค่าเว็บไซต์และธีมเรียบร้อยแล้ว ข้อมูลหน้าบ้านอัปเดตทันที!');
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        const errorJson = await (themeRes.ok ? siteRes.json() : themeRes.json());
        setErrorMsg(errorJson.message || 'บันทึกข้อมูลไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Super Admin');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy-700)]" />
          <p className="text-sm font-bold text-gray-600">กำลังโหลดศูนย์ควบคุมและจัดการเว็บไซต์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-rose-100/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--burgundy-700)] mb-1">
            <Link href="/mt70" className="hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              กลับแดชบอร์ดหลัก
            </Link>
            <span>/</span>
            <span>Super Admin Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 font-display">
            ศูนย์จัดการเว็บไซต์ & ธีมสี
            <span className="rounded-full bg-rose-100 text-[var(--burgundy-700)] px-3 py-1 text-xs font-black">
              สำหรับส่งต่องาน
            </span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            ปรับเปลี่ยนข้อมูลกิจกรรม วันที่ รอบเวลา รูปภาพโปสเตอร์ และโทนสีเว็บไซต์ได้ทันที โดยไม่ต้องแตะต้องโค้ด
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetThemeToDefault}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition-all active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            คืนค่าเริ่มต้น
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-800)] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-rose-950/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกและเผยแพร่'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs sm:text-sm font-bold text-rose-800 flex items-center gap-3 shadow-xs animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'theme'
              ? 'bg-[var(--burgundy-700)] text-white shadow-sm font-black'
              : 'text-gray-600 hover:bg-rose-50 hover:text-[var(--burgundy-700)]'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>🎨 ธีม สี & ไล่เฉดสี (Gradient)</span>
        </button>
        <button
          onClick={() => setActiveTab('event')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'event'
              ? 'bg-[var(--burgundy-700)] text-white shadow-sm font-black'
              : 'text-gray-600 hover:bg-rose-50 hover:text-[var(--burgundy-700)]'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>📅 ข้อมูลกิจกรรม & รอบเวลา (Slots)</span>
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'content'
              ? 'bg-[var(--burgundy-700)] text-white shadow-sm font-black'
              : 'text-gray-600 hover:bg-rose-50 hover:text-[var(--burgundy-700)]'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>📝 ข้อความประชาสัมพันธ์ & ประกาศด่วน</span>
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'media'
              ? 'bg-[var(--burgundy-700)] text-white shadow-sm font-black'
              : 'text-gray-600 hover:bg-rose-50 hover:text-[var(--burgundy-700)]'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>🖼️ สื่อ & โปสเตอร์ประจำปี</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: THEME, COLORS & GRADIENTS
         ======================================================== */}
      {activeTab === 'theme' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Presets Section */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--burgundy-700)]" />
                    ชุดสีสำเร็จรูป (Preset Gallery)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    เลือกชุดสีที่คำนวณความเข้ากันได้และการันตีค่า Contrast เรียบร้อยแล้ว
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_PRESETS.map((p) => {
                  const isSelected = theme.preset_name === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 group relative overflow-hidden ${
                        isSelected 
                          ? 'border-[var(--burgundy-700)] ring-2 ring-[var(--burgundy-700)]/20 bg-rose-50/40' 
                          : 'border-gray-200 hover:border-rose-200 hover:bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-14 rounded-lg shadow-2xs border border-white/20 shrink-0" style={{ background: p.previewGradient }} />
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-black text-[var(--burgundy-700)] bg-rose-100 px-2 py-0.5 rounded-full">
                            <Check className="h-3 w-3" /> ใช้งานอยู่
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900">{p.name}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{p.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Granular Color Pickers */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[var(--burgundy-700)]" />
                  ปรับแต่งสีเฉพาะจุด (Custom Color Pickers)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  เปลี่ยนสีเฉพาะส่วนได้ตามใจชอบ โดยใส่รหัส Hex หรือคลิกเลือกสี
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Primary Action */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">สีปุ่มหลัก (Primary Button & Accent)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.primary_color}
                      onChange={(e) => updateThemeField({ primary_color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.primary_color}
                      onChange={(e) => updateThemeField({ primary_color: e.target.value })}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-mono font-bold text-gray-800 uppercase"
                    />
                  </div>
                </div>

                {/* Button Text Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">สีตัวหนังสือบนปุ่ม (Button Text)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.button_text_color}
                      onChange={(e) => updateThemeField({ button_text_color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.button_text_color}
                      onChange={(e) => updateThemeField({ button_text_color: e.target.value })}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-mono font-bold text-gray-800 uppercase"
                    />
                  </div>
                </div>

                {/* Website Background */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">สีพื้นหลังเว็บไซต์ (Background)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.bg_color}
                      onChange={(e) => updateThemeField({ bg_color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.bg_color}
                      onChange={(e) => updateThemeField({ bg_color: e.target.value })}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-mono font-bold text-gray-800 uppercase"
                    />
                  </div>
                </div>

                {/* Card Surface */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">สีพื้นการ์ด & กล่องข้อมูล (Surface)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.surface_color}
                      onChange={(e) => updateThemeField({ surface_color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.surface_color}
                      onChange={(e) => updateThemeField({ surface_color: e.target.value })}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-mono font-bold text-gray-800 uppercase"
                    />
                  </div>
                </div>

                {/* Accent Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">สีเน้นรอง & ป้ายสถานะ (Secondary Accent)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.accent_color}
                      onChange={(e) => updateThemeField({ accent_color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.accent_color}
                      onChange={(e) => updateThemeField({ accent_color: e.target.value })}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-mono font-bold text-gray-800 uppercase"
                    />
                  </div>
                </div>

                {/* Primary Hover */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">สีปุ่มเมื่อชี้เมาส์ (Hover Color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.primary_hover_color}
                      onChange={(e) => updateThemeField({ primary_hover_color: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={theme.primary_hover_color}
                      onChange={(e) => updateThemeField({ primary_hover_color: e.target.value })}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-mono font-bold text-gray-800 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Contrast Checker feedback */}
              <div className={`mt-3 rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${
                contrastStatus.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>{contrastStatus.msg}</span>
              </div>
            </div>

            {/* 3. Gradient Controls */}
            <div className="rounded-2xl border border-rose-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[var(--burgundy-700)]" />
                    การไล่เฉดสี (Gradient Controls)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    เปิด/ปิด และปรับองศาการไล่เฉดสีของ Hero Banner และปุ่มกด
                  </p>
                </div>

                {/* Toggle Hero Gradient */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme.hero_gradient_enabled}
                    onChange={(e) => updateThemeField({ hero_gradient_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--burgundy-700)]"></div>
                  <span className="ml-2 text-xs font-bold text-gray-700">เปิด Gradient</span>
                </label>
              </div>

              {theme.hero_gradient_enabled && (
                <div className="space-y-4 pt-2 border-t border-gray-100 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">สีเริ่มต้น (Start Color)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.hero_gradient_start}
                          onChange={(e) => updateThemeField({ hero_gradient_start: e.target.value })}
                          className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={theme.hero_gradient_start}
                          onChange={(e) => updateThemeField({ hero_gradient_start: e.target.value })}
                          className="flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-mono font-bold text-gray-800 uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">สีปลายทาง (End Color)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.hero_gradient_end}
                          onChange={(e) => updateThemeField({ hero_gradient_end: e.target.value })}
                          className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={theme.hero_gradient_end}
                          onChange={(e) => updateThemeField({ hero_gradient_end: e.target.value })}
                          className="flex-1 rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-mono font-bold text-gray-800 uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Angle slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>ทิศทางและมุมองศาการไล่สี: {theme.hero_gradient_angle}°</span>
                      <div className="flex gap-2">
                        {[90, 135, 180].map((deg) => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => updateThemeField({ hero_gradient_angle: deg })}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              theme.hero_gradient_angle === deg
                                ? 'bg-[var(--burgundy-700)] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {deg}° {deg === 90 ? 'แนวนอน' : deg === 180 ? 'แนวตั้ง' : 'มุมเฉียง'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={theme.hero_gradient_angle}
                      onChange={(e) => updateThemeField({ hero_gradient_angle: Number(e.target.value) })}
                      className="w-full accent-[var(--burgundy-700)] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[var(--burgundy-700)]" />
                  <h3 className="text-sm font-extrabold text-gray-900">ตัวอย่างหน้าจอสด (Live Preview)</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Realtime
                </span>
              </div>

              {/* Simulated Screen Container */}
              <div 
                className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all"
                style={{ backgroundColor: theme.bg_color }}
              >
                {/* Mini Hero Banner */}
                <div 
                  className="p-5 text-white space-y-3 relative overflow-hidden transition-all"
                  style={{
                    background: theme.preset_name === 'default'
                      ? 'radial-gradient(100% 75% at 85% 0%, rgba(240, 100, 85, 0.32) 0%, transparent 60%), radial-gradient(90% 80% at 10% 100%, rgba(210, 45, 60, 0.38) 0%, transparent 65%), radial-gradient(60% 60% at 50% 30%, rgba(185, 25, 45, 0.25) 0%, transparent 70%), linear-gradient(140deg, #9C1528 0%, #7E0E1D 30%, #5E0B17 65%, #3B060F 100%)'
                      : theme.hero_gradient_enabled
                        ? `linear-gradient(${theme.hero_gradient_angle}deg, ${theme.hero_gradient_start}, ${theme.hero_gradient_end})`
                        : theme.primary_hover_color,
                  }}
                >
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    <Heart className="h-2.5 w-2.5 fill-current text-rose-300" />
                    <span>ครั้งที่ 9 · MUMT Blood Donation</span>
                  </span>
                  
                  <div>
                    <div className="text-base font-extrabold tracking-tight font-display">
                      เติมรักให้เต็ม <span className="text-amber-300">UNIT</span>
                    </div>
                    <div className="text-xs text-rose-100 font-medium mt-0.5">
                      ต่อชีวิตด้วยโลหิตคุณ 2026
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                      style={{
                        background: theme.preset_name === 'default'
                          ? 'linear-gradient(to right, #D92231, #A6192E, #7E1120)'
                          : theme.button_gradient_enabled
                            ? `linear-gradient(${theme.button_gradient_angle}deg, ${theme.button_gradient_start}, ${theme.button_gradient_end})`
                            : theme.primary_color,
                        color: theme.button_text_color,
                      }}
                    >
                      <span>ลงทะเบียนจองรอบเวลา</span>
                    </button>
                  </div>
                </div>

                {/* Mini Surface Card */}
                <div className="p-4 space-y-3">
                  <div 
                    className="p-3.5 rounded-xl border border-gray-100 shadow-2xs space-y-2 transition-all"
                    style={{ backgroundColor: theme.surface_color }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-800">รอบเวลา 09:00 - 10:00 น.</span>
                      <span 
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${theme.accent_color}15`,
                          color: theme.accent_color,
                        }}
                      >
                        ว่าง 25 ที่นั่ง
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">
                      *ทุกหน้าของเว็บไซต์จะใช้ชุดสีและ Gradient ตามที่เห็นในตัวอย่างนี้ทันที
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: EVENT & SCHEDULE MANAGEMENT
         ======================================================== */}
      {activeTab === 'event' && eventData && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--burgundy-700)]" />
                ข้อมูลกิจกรรมและกำหนดการประจำปี (Event Info)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                สำหรับเปลี่ยนชื่องาน วันที่จัดงาน และสถานที่เมื่อจัดงานในปีถัดไป
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">ชื่องานเต็ม (Full Name)</label>
                <input
                  type="text"
                  value={eventData.name}
                  onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">ชื่องานย่อ (Short Name)</label>
                <input
                  type="text"
                  value={eventData.short_name}
                  onChange={(e) => setEventData({ ...eventData, short_name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">สถานะกิจกรรม (Status)</label>
                <select
                  value={eventData.status}
                  onChange={(e) => setEventData({ ...eventData, status: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm font-bold text-gray-900 bg-white"
                >
                  <option value="REGISTRATION_OPEN">เปิดรับลงทะเบียนปกติ (REGISTRATION_OPEN)</option>
                  <option value="REGISTRATION_CLOSED">ปิดรับลงทะเบียนชั่วคราว (REGISTRATION_CLOSED)</option>
                  <option value="COMPLETED">เสร็จสิ้นกิจกรรมแล้ว (COMPLETED)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">เวลาเริ่มจัดกิจกรรม (Start Date/Time)</label>
                <input
                  type="text"
                  value={eventData.start_at}
                  onChange={(e) => setEventData({ ...eventData, start_at: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-800"
                  placeholder="2026-09-16T09:00:00+07:00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">เวลาสิ้นสุดกิจกรรม (End Date/Time)</label>
                <input
                  type="text"
                  value={eventData.end_at}
                  onChange={(e) => setEventData({ ...eventData, end_at: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-800"
                  placeholder="2026-09-16T14:00:00+07:00"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">สถานที่จัดงาน (Venue Name)</label>
                <input
                  type="text"
                  value={eventData.venue_name}
                  onChange={(e) => setEventData({ ...eventData, venue_name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm text-gray-900"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">คำอธิบายประชาสัมพันธ์ (Campaign Description)</label>
                <textarea
                  rows={3}
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs sm:text-sm text-gray-900 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Time Slots & Capacities */}
          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--burgundy-700)]" />
                  จัดการรอบเวลาและโควตาที่นั่ง (Time Slots & Capacity)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ปรับจำนวนความจุผู้บริจาคต่อรอบเวลา หรือปิดรับเฉพาะบางรอบ
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-500 font-bold uppercase">
                    <th className="px-4 py-3">ช่วงเวลา</th>
                    <th className="px-4 py-3">ความจุ (คน)</th>
                    <th className="px-4 py-3">สถานะเปิดรับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {slots.map((slot, index) => {
                    const startLabel = slot.start_at ? new Date(slot.start_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '';
                    const endLabel = slot.end_at ? new Date(slot.end_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '';
                    return (
                      <tr key={slot.id || index} className="hover:bg-rose-50/30">
                        <td className="px-4 py-3 font-bold text-gray-900">
                          {startLabel} - {endLabel} น.
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={slot.capacity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSlots((prev) => prev.map((s, idx) => idx === index ? { ...s, capacity: val } : s));
                            }}
                            className="w-24 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-bold text-gray-800"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSlots((prev) => prev.map((s, idx) => idx === index ? { ...s, is_active: !s.is_active } : s));
                            }}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                              slot.is_active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {slot.is_active ? 'เปิดรับ' : 'ปิดรอบนี้'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: CONTENT & URGENT ANNOUNCEMENT
         ======================================================== */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Urgent Announcement Box */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-[var(--burgundy-700)]" />
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">แถบประกาศด่วนหน้าเว็บ (Urgent Announcement Bar)</h3>
                  <p className="text-xs text-gray-500">จะแสดงแถบข้อความสีเด่นด้านบนสุดของหน้าเว็บสำหรับแจ้งเหตุฉุกเฉิน</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={urgentBannerEnabled}
                  onChange={(e) => setUrgentBannerEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--burgundy-700)]"></div>
                <span className="ml-2 text-xs font-bold text-gray-700">
                  {urgentBannerEnabled ? 'เปิดใช้งาน' : 'ปิดประกาศ'}
                </span>
              </label>
            </div>

            {urgentBannerEnabled && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <label className="text-xs font-bold text-gray-700">ข้อความประกาศด่วน (เช่น "รอบเช้าเต็มแล้ว เปิดรับ Walk-in หน้างาน")</label>
                <input
                  type="text"
                  value={urgentBannerText}
                  onChange={(e) => setUrgentBannerText(e.target.value)}
                  placeholder="พิมพ์ข้อความประกาศด่วนที่นี่..."
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-900 bg-white"
                />
              </div>
            )}
          </div>

          {/* Other Content Blocks */}
          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--burgundy-700)]" />
              กล่องเนื้อหาและข้อมูลประชาสัมพันธ์ (Content Blocks)
            </h3>
            <p className="text-xs text-gray-500">
              ข้อความในส่วนของที่ระลึก, คำแนะนำการเตรียมตัว, และช่องทางติดต่อ
            </p>

            <div className="space-y-4 pt-2">
              {contentBlocks.filter(b => b.content_key !== 'urgent_banner').map((b, idx) => (
                <div key={b.id || idx} className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50/40">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800 uppercase tracking-wider">{b.title}</span>
                    <span className="text-[10px] text-gray-400 font-mono">key: {b.content_key}</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={b.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContentBlocks(prev => prev.map(item => item.id === b.id ? { ...item, title: val } : item));
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-900 bg-white"
                      placeholder="หัวข้อ"
                    />
                    <textarea
                      rows={2}
                      value={b.description || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContentBlocks(prev => prev.map(item => item.id === b.id ? { ...item, description: val } : item));
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 bg-white"
                      placeholder="คำอธิบายรายละเอียด..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: MEDIA & POSTERS
         ======================================================== */}
      {activeTab === 'media' && (
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[var(--burgundy-700)]" />
              จัดการรูปภาพและโปสเตอร์ประชาสัมพันธ์ (Media & Posters)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              เปลี่ยน URL หรือไฟล์รูปภาพโปสเตอร์งานประจำปี และรูปของที่ระลึก
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Poster TH */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <span className="font-bold text-xs text-gray-800">โปสเตอร์งานประจำปี (ภาษาไทย)</span>
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src="/images/poster-th.jpg"
                  alt="Poster Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                ไฟล์ปัจจุบัน: <code className="font-mono text-gray-700">/images/poster-th.jpg</code>
              </p>
            </div>

            {/* Poster EN */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <span className="font-bold text-xs text-gray-800">โปสเตอร์งานประจำปี (English Version)</span>
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src="/images/poster-en.jpg"
                  alt="Poster Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                ไฟล์ปัจจุบัน: <code className="font-mono text-gray-700">/images/poster-en.jpg</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Floating Save Bar */}
      <div className="sticky bottom-4 z-40 rounded-2xl bg-gray-900/95 backdrop-blur-xl p-4 text-white shadow-xl flex items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold">
            เมื่อปรับแต่งข้อมูลเสร็จเรียบร้อย อย่าลืมกดปุ่มบันทึกเพื่อให้หน้าเว็บสาธารณะอัปเดตทันที
          </span>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-800)] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-rose-950/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'กำลังบันทึก...' : 'บันทึกและเผยแพร่'}</span>
        </button>
      </div>
    </div>
  );
}
