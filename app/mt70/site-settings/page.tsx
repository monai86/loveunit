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
  Check, 
  Eye, 
  Megaphone,
  Heart,
  ShieldCheck,
  Zap,
  Plus,
  Trash2,
  QrCode,
  MapPin,
  ArrowRight,
  Search,
  Gift,
  Copy,
  User,
  Download,
  Monitor,
  Smartphone,
  Maximize2,
  X
} from 'lucide-react';
import { formatThaiDate, formatTimeRange } from '@/lib/utils/format';
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
  start_at?: string;
  end_at?: string;
  startAt?: string;
  endAt?: string;
  capacity: number;
  booked_count?: number;
  bookedCount?: number;
  is_active: boolean;
  isActive?: boolean;
  isNew?: boolean;
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

// Helpers for friendly Thai Date/Time conversion and ISO synchronization
function parseIsoToDateTimeParts(isoString: string | undefined): { date: string; time: string } {
  if (!isoString) return { date: '2026-09-16', time: '09:00' };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: '2026-09-16', time: '09:00' };
    
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const date = formatter.format(d);

    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const time = timeFormatter.format(d);
    return { date, time };
  } catch {
    return { date: '2026-09-16', time: '09:00' };
  }
}

function combineDateAndTimeToIso(dateStr: string, timeStr: string): string {
  const d = dateStr || '2026-09-16';
  const t = timeStr || '09:00';
  return `${d}T${t}:00+07:00`;
}

function formatThaiDateTimeDisplay(isoString: string | undefined): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' น.';
  } catch {
    return '-';
  }
}

function updateSlotTime(isoString: string | undefined, newTimeHHmm: string, fallbackDateStr: string): string {
  const baseDate = isoString ? parseIsoToDateTimeParts(isoString).date : fallbackDateStr;
  return combineDateAndTimeToIso(baseDate, newTimeHHmm);
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

  // Interactive Live Preview active screen tab & device
  const [previewScreen, setPreviewScreen] = useState<'home' | 'register' | 'pass'>('home');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // Event & Slots State
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [deletedSlotIds, setDeletedSlotIds] = useState<string[]>([]);
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
      const nextPresetName = updates.preset_name !== undefined ? updates.preset_name : 'custom';
      const next = { ...prev, ...updates, preset_name: nextPresetName };
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('site-theme-preview', { detail: next }));
      }
      return next;
    });
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    updateThemeField({ ...preset.theme, preset_name: preset.id });
    setSuccessMsg(`เลือกใช้ชุดสี "${preset.name}" แล้ว`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const resetThemeToDefault = () => {
    const defaultPreset = THEME_PRESETS[0];
    updateThemeField({ ...defaultPreset.theme, preset_name: 'default' });
    setSuccessMsg('กู้คืนธีมเป็น "สไตล์ทางการปัจจุบัน (Default MUMT 2026)" เรียบร้อยแล้ว');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const contrastStatus = useMemo(() => {
    return getContrastNotice(theme.primary_color, theme.button_text_color);
  }, [theme.primary_color, theme.button_text_color]);

  // Time Slot Management Handlers
  const handleAddSlot = () => {
    const eventDate = eventData?.start_at ? parseIsoToDateTimeParts(eventData.start_at).date : '2026-09-16';
    let nextStart = '14:00';
    let nextEnd = '15:00';
    if (slots.length > 0) {
      const lastSlot = slots[slots.length - 1];
      const lastEnd = parseIsoToDateTimeParts(lastSlot.endAt || lastSlot.end_at).time;
      if (lastEnd) {
        nextStart = lastEnd;
        const [h, m] = lastEnd.split(':').map(Number);
        const endH = ((h + 1) % 24).toString().padStart(2, '0');
        nextEnd = `${endH}:${(m || 0).toString().padStart(2, '0')}`;
      }
    }

    const newSlot: SlotData = {
      id: `new-${Date.now()}`,
      start_at: combineDateAndTimeToIso(eventDate, nextStart),
      end_at: combineDateAndTimeToIso(eventDate, nextEnd),
      startAt: combineDateAndTimeToIso(eventDate, nextStart),
      endAt: combineDateAndTimeToIso(eventDate, nextEnd),
      capacity: 35,
      booked_count: 0,
      bookedCount: 0,
      is_active: true,
      isActive: true,
      isNew: true,
    };

    setSlots((prev) => [...prev, newSlot]);
    setSuccessMsg('เพิ่มรอบเวลาใหม่แล้ว คุณสามารถปรับช่วงเวลาและความจุได้ทันที');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleResetStandardSlots = () => {
    const eventDate = eventData?.start_at ? parseIsoToDateTimeParts(eventData.start_at).date : '2026-09-16';
    const toDelete = slots.filter((s) => !s.isNew && !s.id.startsWith('new-')).map((s) => s.id);
    if (toDelete.length > 0) {
      setDeletedSlotIds((prev) => Array.from(new Set([...prev, ...toDelete])));
    }

    const standardSlots: SlotData[] = [
      {
        id: `new-${Date.now()}-1`,
        start_at: combineDateAndTimeToIso(eventDate, '09:00'),
        end_at: combineDateAndTimeToIso(eventDate, '11:00'),
        startAt: combineDateAndTimeToIso(eventDate, '09:00'),
        endAt: combineDateAndTimeToIso(eventDate, '11:00'),
        capacity: 9999,
        booked_count: 0,
        bookedCount: 0,
        is_active: true,
        isActive: true,
        isNew: true,
      },
      {
        id: `new-${Date.now()}-2`,
        start_at: combineDateAndTimeToIso(eventDate, '11:00'),
        end_at: combineDateAndTimeToIso(eventDate, '13:00'),
        startAt: combineDateAndTimeToIso(eventDate, '11:00'),
        endAt: combineDateAndTimeToIso(eventDate, '13:00'),
        capacity: 9999,
        booked_count: 0,
        bookedCount: 0,
        is_active: true,
        isActive: true,
        isNew: true,
      },
      {
        id: `new-${Date.now()}-3`,
        start_at: combineDateAndTimeToIso(eventDate, '13:00'),
        end_at: combineDateAndTimeToIso(eventDate, '14:00'),
        startAt: combineDateAndTimeToIso(eventDate, '13:00'),
        endAt: combineDateAndTimeToIso(eventDate, '14:00'),
        capacity: 9999,
        booked_count: 0,
        bookedCount: 0,
        is_active: true,
        isActive: true,
        isNew: true,
      },
    ];
    setSlots(standardSlots);
    setSuccessMsg('รีเซ็ตรอบเวลาเป็น 3 รอบมาตรฐานของงานเรียบร้อยแล้ว (อย่าลืมกดบันทึก)');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDeleteSlot = (index: number) => {
    const target = slots[index];
    const booked = target.bookedCount ?? target.booked_count ?? 0;
    if (booked > 0) {
      const confirm = window.confirm(
        `รอบเวลานี้มีผู้ลงทะเบียนแล้ว ${booked} คน หากลบรอบนี้ อาจทำให้ข้อมูลประวัติของผู้บริจาคไม่ตรงกับรอบเวลา\n\nแนะนำให้กด "ปิดรอบนี้" แทนการลบ\n\nคุณแน่ใจหรือไม่ว่าต้องการลบอย่างถาวร?`
      );
      if (!confirm) return;
    }

    if (!target.isNew && !target.id.startsWith('new-')) {
      setDeletedSlotIds((prev) => [...prev, target.id]);
    }
    setSlots((prev) => prev.filter((_, idx) => idx !== index));
    setSuccessMsg('ลบรอบเวลาแล้ว (กดบันทึกเพื่อยืนยันการเปลี่ยนแปลง)');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleUpdateSlotTime = (index: number, type: 'start' | 'end', timeHHmm: string) => {
    const eventDate = eventData?.start_at ? parseIsoToDateTimeParts(eventData.start_at).date : '2026-09-16';
    setSlots((prev) =>
      prev.map((s, idx) => {
        if (idx !== index) return s;
        const currentIso = type === 'start' ? (s.startAt || s.start_at) : (s.endAt || s.end_at);
        const newIso = updateSlotTime(currentIso, timeHHmm, eventDate);
        if (type === 'start') {
          return { ...s, startAt: newIso, start_at: newIso };
        } else {
          return { ...s, endAt: newIso, end_at: newIso };
        }
      })
    );
  };

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
        slotUpdates?: Array<{ id: string; startAt: string; endAt: string; capacity: number; isActive: boolean }>;
        createdSlots?: Array<{ startAt: string; endAt: string; capacity: number; isActive: boolean }>;
        deletedSlotIds?: string[];
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

      if (slots.length > 0 || deletedSlotIds.length > 0) {
        sitePayload.deletedSlotIds = deletedSlotIds;
        sitePayload.createdSlots = [];
        sitePayload.slotUpdates = [];

        for (const s of slots) {
          const startAt = s.startAt || s.start_at || '';
          const endAt = s.endAt || s.end_at || '';
          const capacity = Number(s.capacity) || 35;
          const isActive = s.isActive !== undefined ? Boolean(s.isActive) : Boolean(s.is_active);

          if (s.isNew || s.id.startsWith('new-')) {
            sitePayload.createdSlots.push({ startAt, endAt, capacity, isActive });
          } else {
            sitePayload.slotUpdates.push({ id: s.id, startAt, endAt, capacity, isActive });
          }
        }
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
        setSuccessMsg('🎉 บันทึกการตั้งค่าเว็บไซต์ กำหนดการ และรอบเวลาเรียบร้อยแล้ว ข้อมูลหน้าบ้านอัปเดตทันที!');
        setDeletedSlotIds([]);
        // Re-fetch site settings to sync persistent DB slot IDs
        const refreshRes = await fetch('/api/admin/site-settings');
        if (refreshRes.ok) {
          const sData = await refreshRes.json();
          if (sData.slots) setSlots(sData.slots);
        }
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
            <div className="rounded-2xl border border-rose-100 bg-white p-5 sm:p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[var(--burgundy-700)]" />
                  การไล่เฉดสี (Gradient Controls)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  เปิด/ปิด และปรับทิศทางองศาการไล่เฉดสีของ Hero Banner และปุ่มกดหลัก
                </p>
              </div>

              {/* 3.1 Hero Banner Gradient */}
              <div className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                      1. ไล่เฉดสีส่วนหัวเว็บไซต์ (Hero Banner Gradient)
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      ส่วนแบนเนอร์ด้านบนสุดของหน้าหลัก และบัตรคิว
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.hero_gradient_enabled}
                      onChange={(e) => updateThemeField({ hero_gradient_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--burgundy-700)]"></div>
                    <span className="ml-2 text-xs font-bold text-gray-700">เปิด Hero Gradient</span>
                  </label>
                </div>

                {theme.hero_gradient_enabled && (
                  <div className="space-y-3 pt-2 border-t border-gray-200 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-700">สีเริ่มต้น (Start Color)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={theme.hero_gradient_start}
                            onChange={(e) => updateThemeField({ hero_gradient_start: e.target.value })}
                            className="h-8 w-11 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={theme.hero_gradient_start}
                            onChange={(e) => updateThemeField({ hero_gradient_start: e.target.value })}
                            className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-mono font-bold text-gray-800 uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-700">สีปลายทาง (End Color)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={theme.hero_gradient_end}
                            onChange={(e) => updateThemeField({ hero_gradient_end: e.target.value })}
                            className="h-8 w-11 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={theme.hero_gradient_end}
                            onChange={(e) => updateThemeField({ hero_gradient_end: e.target.value })}
                            className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-mono font-bold text-gray-800 uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Angle slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>ทิศทางมุมองศา: {theme.hero_gradient_angle}°</span>
                        <div className="flex gap-1.5">
                          {[90, 135, 180].map((deg) => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => updateThemeField({ hero_gradient_angle: deg })}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                theme.hero_gradient_angle === deg
                                  ? 'bg-[var(--burgundy-700)] text-white'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
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
                        value={theme.hero_gradient_angle ?? 140}
                        onChange={(e) => updateThemeField({ hero_gradient_angle: Number(e.target.value) })}
                        className="w-full accent-[var(--burgundy-700)] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3.2 Button Gradient */}
              <div className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                      2. ไล่เฉดสีปุ่มกดหลัก (Primary Button Gradient)
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      ปุ่มลงทะเบียน, ปุ่มยืนยัน, และปุ่ม CTA ทั่วทั้งเว็บ
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.button_gradient_enabled}
                      onChange={(e) => updateThemeField({ button_gradient_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--burgundy-700)]"></div>
                    <span className="ml-2 text-xs font-bold text-gray-700">เปิด Button Gradient</span>
                  </label>
                </div>

                {theme.button_gradient_enabled && (
                  <div className="space-y-3 pt-2 border-t border-gray-200 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-700">สีเริ่มต้นปุ่ม (Start Color)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={theme.button_gradient_start || theme.primary_color}
                            onChange={(e) => updateThemeField({ button_gradient_start: e.target.value })}
                            className="h-8 w-11 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={theme.button_gradient_start || theme.primary_color}
                            onChange={(e) => updateThemeField({ button_gradient_start: e.target.value })}
                            className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-mono font-bold text-gray-800 uppercase"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-700">สีปลายทางปุ่ม (End Color)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={theme.button_gradient_end || theme.primary_hover_color}
                            onChange={(e) => updateThemeField({ button_gradient_end: e.target.value })}
                            className="h-8 w-11 cursor-pointer rounded-lg border border-gray-300 p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={theme.button_gradient_end || theme.primary_hover_color}
                            onChange={(e) => updateThemeField({ button_gradient_end: e.target.value })}
                            className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-mono font-bold text-gray-800 uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Angle slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>ทิศทางมุมองศาปุ่ม: {theme.button_gradient_angle ?? 90}°</span>
                        <div className="flex gap-1.5">
                          {[90, 135, 180].map((deg) => (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => updateThemeField({ button_gradient_angle: deg })}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                (theme.button_gradient_angle ?? 90) === deg
                                  ? 'bg-[var(--burgundy-700)] text-white'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
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
                        value={theme.button_gradient_angle ?? 90}
                        onChange={(e) => updateThemeField({ button_gradient_angle: Number(e.target.value) })}
                        className="w-full accent-[var(--burgundy-700)] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Preview Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[var(--burgundy-700)]" />
                  <h3 className="text-sm font-extrabold text-gray-900">ตัวอย่างหน้าจอสด (Live Preview)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Realtime Sync
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFullscreenPreview(true)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    title="ขยายดูแบบเต็มจอ"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Browser / Device Chrome Header & Viewport Controls */}
              <div className="rounded-xl border border-gray-200 bg-gray-100/90 p-2 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5 px-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="flex-1 max-w-[190px] rounded-lg bg-white px-2 py-1 text-[10px] font-mono text-gray-500 text-center truncate border border-gray-200/80 shadow-2xs">
                  mumt-loveunit.vercel.app{previewScreen === 'home' ? '' : previewScreen === 'register' ? '/register' : '/registration/LVU26-A042'}
                </div>
                {/* Device Mode Switcher */}
                <div className="flex items-center bg-gray-200/70 p-0.5 rounded-lg text-gray-600 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                      previewDevice === 'desktop' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                    }`}
                    title="มุมมองจอคอมพิวเตอร์ (Desktop)"
                  >
                    <Monitor className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                      previewDevice === 'mobile' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                    }`}
                    title="มุมมองมือถือ (Mobile)"
                  >
                    <Smartphone className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex p-1 bg-gray-100/80 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewScreen('home')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                    previewScreen === 'home'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  1. หน้าแรก (Home)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScreen('register')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                    previewScreen === 'register'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  2. ลงทะเบียน
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScreen('pass')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                    previewScreen === 'pass'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  3. บัตรคิว Pass
                </button>
              </div>

              {/* Simulated Screen Container */}
              {(() => {
                const previewHeroBg = theme.hero_gradient_enabled
                  ? (theme.preset_name === 'default'
                      ? 'radial-gradient(100% 75% at 85% 0%, rgba(240, 100, 85, 0.32) 0%, transparent 60%), radial-gradient(90% 80% at 10% 100%, rgba(210, 45, 60, 0.38) 0%, transparent 65%), radial-gradient(60% 60% at 50% 30%, rgba(185, 25, 45, 0.25) 0%, transparent 70%), linear-gradient(140deg, #9C1528 0%, #7E0E1D 30%, #5E0B17 65%, #3B060F 100%)'
                      : `linear-gradient(${theme.hero_gradient_angle ?? 140}deg, ${theme.hero_gradient_start}, ${theme.hero_gradient_end})`)
                  : (theme.primary_hover_color || theme.primary_color);

                const previewBtnBg = theme.button_gradient_enabled
                  ? (theme.preset_name === 'default'
                      ? 'linear-gradient(to right, #D92231, #A6192E, #7E1120)'
                      : `linear-gradient(${theme.button_gradient_angle ?? 90}deg, ${theme.button_gradient_start}, ${theme.button_gradient_end})`)
                  : theme.primary_color;

                const isRegClosed = eventData?.status === 'REGISTRATION_CLOSED';
                const isCompleted = eventData?.status === 'COMPLETED';

                return (
                  <div 
                    className={`rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all max-h-[640px] overflow-y-auto ${
                      previewDevice === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
                    }`}
                    style={{ backgroundColor: theme.bg_color }}
                  >
                    {/* ==============================================
                        VIEW 1: HOME PAGE (HERO & SECTIONS)
                       ============================================== */}
                    {previewScreen === 'home' && (
                      <div className="animate-in fade-in space-y-4 pb-4">
                        {/* Urgent Banner if enabled */}
                        {urgentBannerEnabled && (
                          <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-amber-950 font-bold px-3 py-1.5 text-center text-[10px] flex items-center justify-center gap-1.5 border-b border-amber-500/40">
                            <span className="bg-amber-950 text-amber-100 text-[8px] uppercase font-black px-1.5 py-0.2 rounded-full">
                              ประกาศสำคัญ
                            </span>
                            <span className="truncate">{urgentBannerText || 'ประกาศด่วนจากโครงการ'}</span>
                          </div>
                        )}

                        {/* 1.1 Authentic Public Navbar matching live site */}
                        <div className="bg-[#FFFBFB] px-3 py-2 border-b border-gray-200 flex items-center justify-between gap-1.5 shadow-2xs">
                          {/* Left: Round Logo + Text */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-gray-200 shadow-2xs overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-black text-gray-900 tracking-tight font-display">MUMT LoveUnit</span>
                              <span className="text-[11px] font-black text-[#A6192E]">ครั้งที่ 9</span>
                            </div>
                          </div>

                          {/* Center: Nav links (Desktop mode) */}
                          {previewDevice === 'desktop' && (
                            <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold text-gray-600 truncate">
                              <span className="text-[#A6192E] font-black bg-rose-50 px-1 py-0.5 rounded">หน้าแรก</span>
                              <span className="hover:text-gray-900">ประเมินตนเอง</span>
                              <span className="hover:text-gray-900">ความรู้ & แล็บ</span>
                              <span className="hover:text-gray-900">การเตรียมตัว</span>
                              <span className="hover:text-gray-900">โปสเตอร์</span>
                              <span className="hover:text-gray-900">สถานที่</span>
                            </div>
                          )}

                          {/* Right: Language switch + Red CTA Button */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="inline-flex items-center rounded-full bg-black/5 p-0.5 border border-gray-200 text-[8px] font-bold">
                              <span className="bg-white text-[#A6192E] font-black px-1.5 py-0.2 rounded-full shadow-2xs">TH</span>
                              <span className="px-1 text-gray-400">EN</span>
                            </div>
                            <div 
                              className="px-2 py-1 rounded-xl text-[9px] font-extrabold text-white flex items-center gap-1 shadow-xs whitespace-nowrap cursor-pointer"
                              style={{ background: previewBtnBg }}
                            >
                              <Heart className="h-2.5 w-2.5 fill-white shrink-0" />
                              <span className="truncate">
                                {isRegClosed ? 'ปิดรับลงทะเบียน' : isCompleted ? 'เสร็จสิ้น' : 'ลงทะเบียน'}
                              </span>
                              <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                            </div>
                          </div>
                        </div>

                        {/* 1.2 Authentic Hero Banner (2 Columns matching live site) */}
                        <div 
                          className="px-3.5 py-5 sm:px-5 sm:py-6 text-white relative overflow-hidden transition-all shadow-inner"
                          style={{ background: previewHeroBg }}
                        >
                          {/* Top Brand Chip */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20 text-rose-100 shadow-2xs">
                              {isRegClosed ? (
                                <>
                                  <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
                                  <span className="font-extrabold text-amber-200">ขณะนี้ปิดรับลงทะเบียนชั่วคราว</span>
                                </>
                              ) : isCompleted ? (
                                <>
                                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                  <span className="font-extrabold text-emerald-200">กิจกรรมเสร็จสิ้นเรียบร้อยแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <Heart className="h-2.5 w-2.5 fill-current text-rose-300" />
                                  <span>ครั้งที่ 9 · MUMT BLOOD DONATION 2026</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* 2-Column Grid for Desktop / Tablet */}
                          <div className={`grid gap-4 items-center ${previewDevice === 'desktop' ? 'grid-cols-1 sm:grid-cols-12' : 'grid-cols-1'}`}>
                            {/* Left Column: Headline, Facts, Buttons */}
                            <div className={`${previewDevice === 'desktop' ? 'sm:col-span-7' : ''} space-y-3`}>
                              <div>
                                <div className="text-xl sm:text-2xl font-bold tracking-tight font-display leading-tight">
                                  เติมรักให้เต็ม <span className="font-extrabold text-amber-200 tracking-wider">UNIT</span>
                                </div>
                                <div className="text-sm sm:text-base font-bold text-rose-100/90 mt-0.5">
                                  ต่อชีวิตด้วยโลหิตคุณ
                                </div>
                              </div>

                              <p className="text-[10px] sm:text-[11px] text-rose-100/80 leading-relaxed line-clamp-3">
                                {eventData?.description || 'ขอเชิญชวนทุกคนมาร่วมเป็นส่วนหนึ่งในการส่งต่อโอกาสและช่วยเหลือผู้ป่วยที่ต้องการโลหิตในกิจกรรม “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ” ครั้งที่ 9 โดยคณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี'}
                              </p>

                              {/* Souvenir Notice (Official 100 Donors Card) */}
                              <div className="flex items-center gap-2 rounded-xl bg-white/12 backdrop-blur-md border border-white/15 p-2 text-white shadow-2xs">
                                <div className="p-1.5 rounded-lg bg-white/15 text-amber-200 shrink-0">
                                  <Gift className="h-3.5 w-3.5 text-amber-200" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[8px] font-bold uppercase tracking-wider bg-white/15 text-amber-200 px-1 py-0.2 rounded font-mono">
                                      ของที่ระลึก
                                    </span>
                                    <span className="text-[10px] font-bold text-white truncate">
                                      ผู้บริจาค 100 ท่านแรก รับของที่ระลึก
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-rose-100/80 truncate">
                                    มอบให้ ณ จุดบริการหลังเสร็จสิ้นการบริจาคในวันงาน
                                  </p>
                                </div>
                              </div>

                              {/* 3 Event Fact Cards */}
                              <div className="grid grid-cols-3 gap-1 text-white">
                                <div className="rounded-lg bg-white/15 backdrop-blur-md border border-white/20 p-1.5 text-center">
                                  <div className="flex items-center justify-center gap-1 text-[8px] text-amber-200 font-mono font-bold">
                                    <Calendar className="h-2.5 w-2.5" /> วันที่
                                  </div>
                                  <div className="text-[9px] sm:text-[10px] font-extrabold text-white mt-0.5 truncate">
                                    {eventData?.start_at ? formatThaiDate(eventData.start_at) : '16 ก.ย. 69'}
                                  </div>
                                </div>
                                <div className="rounded-lg bg-white/15 backdrop-blur-md border border-white/20 p-1.5 text-center">
                                  <div className="flex items-center justify-center gap-1 text-[8px] text-amber-200 font-mono font-bold">
                                    <Clock className="h-2.5 w-2.5" /> เวลา
                                  </div>
                                  <div className="text-[9px] sm:text-[10px] font-extrabold text-white mt-0.5 truncate">
                                    {eventData?.start_at && eventData?.end_at ? formatTimeRange(eventData.start_at, eventData.end_at) : '09:00 - 14:00'}
                                  </div>
                                </div>
                                <div className="rounded-lg bg-white/15 backdrop-blur-md border border-white/20 p-1.5 text-center">
                                  <div className="flex items-center justify-center gap-1 text-[8px] text-amber-200 font-mono font-bold">
                                    <MapPin className="h-2.5 w-2.5" /> สถานที่
                                  </div>
                                  <div className="text-[9px] sm:text-[10px] font-extrabold text-white mt-0.5 truncate">
                                    {eventData?.venue_name || 'ห้อง 217 สิริวิทยา'}
                                  </div>
                                </div>
                              </div>

                              {/* Primary Hero CTA Button (Exact .btn-cream from live site!) */}
                              <div className="pt-0.5">
                                <button
                                  type="button"
                                  className="w-full py-2.5 px-3 rounded-xl text-xs font-black shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
                                  style={{
                                    backgroundColor: '#FFF8F0',
                                    color: '#7E0E1D',
                                  }}
                                >
                                  <span>
                                    {isRegClosed
                                      ? 'ขณะนี้ปิดรับลงทะเบียนแล้ว (ขอบคุณที่ให้ความสนใจ)'
                                      : isCompleted
                                      ? 'กิจกรรมเสร็จสิ้นแล้ว (ขอบคุณที่ร่วมบริจาค)'
                                      : 'ลงทะเบียนบริจาคโลหิตออนไลน์'}
                                  </span>
                                  <ArrowRight className="h-3.5 w-3.5 text-[#7E0E1D]" />
                                </button>
                              </div>

                              {/* Secondary 2-Column Actions */}
                              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                <div className="py-1.5 px-2 rounded-xl border border-amber-300/40 bg-amber-400/10 text-amber-200 text-center text-[9px] font-bold truncate">
                                  ประเมินความพร้อมตนเอง
                                </div>
                                <div className="py-1.5 px-2 rounded-xl border border-white/20 bg-white/10 text-white text-center text-[9px] font-bold flex items-center justify-center gap-1 truncate">
                                  <Search className="h-3 w-3" />
                                  <span>ค้นหาตั๋ว / QR</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Official Poster matching Screenshot 2 */}
                            <div className={`${previewDevice === 'desktop' ? 'sm:col-span-5' : ''} flex justify-center items-center`}>
                              <div className="w-full max-w-[170px] sm:max-w-[200px] aspect-[1/1.414] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/images/poster-th.jpg"
                                  alt="MUMT Blood Donation 2026 Official Poster"
                                  className="w-full h-full object-cover rounded-2xl"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 1.3 Page Body: Slots Section (Dynamic from admin slot management) */}
                        <div className="px-3.5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-900 font-display">
                              รอบเวลาเปิดรับลงทะเบียน (Time Slots)
                            </span>
                            <span className="text-[10px] font-bold text-gray-500">
                              {eventData?.venue_name || 'ห้อง 217 อาคารสิริวิทยา'}
                            </span>
                          </div>

                          {isRegClosed && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-center text-xs font-bold text-amber-800">
                              🔒 ขณะนี้ปิดรับการลงทะเบียนทุกรอบเวลาชั่วคราว
                            </div>
                          )}

                          {slots.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-500">
                              ยังไม่มีรอบเวลาในระบบ
                            </div>
                          ) : (
                            slots.slice(0, 3).map((slot) => {
                              const capacity = slot.capacity || 35;
                              const booked = slot.booked_count || 0;
                              const remaining = Math.max(0, capacity - booked);
                              const isSlotActive = slot.is_active !== false && slot.isActive !== false;
                              const timeStr = formatTimeRange(slot.start_at || slot.startAt || '', slot.end_at || slot.endAt || '');

                              return (
                                <div 
                                  key={slot.id}
                                  className={`p-2.5 rounded-xl border shadow-2xs space-y-1.5 transition-all ${
                                    !isSlotActive || isRegClosed ? 'bg-gray-50/80 border-gray-200 opacity-80' : ''
                                  }`}
                                  style={{ backgroundColor: !isSlotActive || isRegClosed ? undefined : theme.surface_color }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3 text-gray-500" />
                                      <span className="text-xs font-black text-gray-800 font-mono">{timeStr} น.</span>
                                    </div>
                                    <span 
                                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                                        !isSlotActive
                                          ? 'bg-gray-200 text-gray-600'
                                          : remaining <= 0
                                          ? 'bg-rose-100 text-rose-700'
                                          : 'bg-emerald-100 text-emerald-700'
                                      }`}
                                    >
                                      {!isSlotActive ? 'ปิดรอบนี้' : remaining <= 0 ? 'เต็มแล้ว' : `ว่าง ${remaining} ที่นั่ง`}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between pt-0.5">
                                    <span className="text-[9px] text-gray-500 truncate">
                                      โควตารวม {capacity} คน (จองแล้ว {booked})
                                    </span>
                                    <button
                                      type="button"
                                      disabled={!isSlotActive || remaining <= 0 || isRegClosed}
                                      className={`py-1 px-3 rounded-lg text-[9px] font-bold shadow-2xs transition-transform active:scale-95 ${
                                        !isSlotActive || remaining <= 0 || isRegClosed ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''
                                      }`}
                                      style={
                                        isSlotActive && remaining > 0 && !isRegClosed
                                          ? {
                                              background: previewBtnBg,
                                              color: theme.button_text_color,
                                            }
                                          : undefined
                                      }
                                    >
                                      {!isSlotActive ? 'ปิดรอบนี้' : isRegClosed ? 'ปิดรับ' : remaining <= 0 ? 'เต็มแล้ว' : 'จองรอบนี้'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* ==============================================
                        VIEW 2: REGISTER FORM (WIZARD OR CLOSED CARD)
                       ============================================== */}
                    {previewScreen === 'register' && (
                      <div className="animate-in fade-in space-y-3 pb-4">
                        {/* Header strip */}
                        <div 
                          className="px-4 py-3 text-white transition-all space-y-1 shadow-xs"
                          style={{ background: previewHeroBg }}
                        >
                          <div className="flex items-center justify-between text-[9px] text-rose-200 font-bold">
                            <span className="flex items-center gap-1">
                              <ArrowLeft className="h-3 w-3" /> กลับหน้าหลัก
                            </span>
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-white">
                              {isRegClosed ? 'ปิดรับลงทะเบียน' : 'ขั้นตอน 1 จาก 4'}
                            </span>
                          </div>
                          <div className="text-sm font-extrabold font-display">
                            {isRegClosed ? 'ปิดรับลงทะเบียนบริจาคโลหิต' : 'ลงทะเบียนบริจาคโลหิตออนไลน์'}
                          </div>
                        </div>

                        {isRegClosed ? (
                          /* Authentic Closed Card matching public /register */
                          <div className="p-4 sm:p-6 text-center space-y-3.5 mx-3 rounded-2xl border border-amber-200 bg-gradient-to-b from-white via-amber-50/20 to-white shadow-sm">
                            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md">
                              <Heart className="h-6 w-6 fill-white/20" />
                            </div>

                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                                ● ปิดรับลงทะเบียนชั่วคราว
                              </span>
                              <h4 className="text-sm sm:text-base font-black text-gray-900 font-display pt-1">
                                ขณะนี้ระบบปิดรับลงทะเบียนบริจาคโลหิต
                              </h4>
                              <p className="text-[10px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                                เนื่องจากมีผู้ลงทะเบียนครบตามโควตาที่กำหนด หรือระบบปิดรับการลงทะเบียนชั่วคราว ทางโครงการขอขอบพระคุณทุกท่านที่ให้ความสนใจเป็นอย่างยิ่ง
                              </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 pt-1">
                              <div className="py-2 px-3 rounded-xl bg-[var(--burgundy-700)] text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                <Search className="h-3 w-3" /> ค้นหาตั๋ว / QR
                              </div>
                              <div className="py-2 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-[10px] font-bold">
                                กลับหน้าหลัก
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Wizard Step Tracker & Form */
                          <div className="px-3.5 space-y-3">
                            <div className="flex items-center justify-between text-[9px] font-bold px-1">
                              <div className="flex items-center gap-1" style={{ color: theme.primary_color }}>
                                <span className="h-4 w-4 rounded-full text-white flex items-center justify-center text-[8px] font-black" style={{ background: theme.primary_color }}>1</span>
                                <span>ข้อมูลผู้บริจาค</span>
                              </div>
                              <div className="h-0.5 flex-1 mx-1.5 bg-gray-200"></div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <span className="h-4 w-4 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[8px] font-black">2</span>
                                <span>สังกัด/ประสบการณ์</span>
                              </div>
                              <div className="h-0.5 flex-1 mx-1.5 bg-gray-200"></div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <span className="h-4 w-4 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[8px] font-black">3</span>
                                <span>รอบเวลา</span>
                              </div>
                            </div>

                            {/* Form Card */}
                            <div 
                              className="p-3.5 rounded-xl border border-gray-200/80 shadow-2xs space-y-2.5 transition-all"
                              style={{ backgroundColor: theme.surface_color }}
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-700">ชื่อ - นามสกุล</span>
                                <div className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 bg-white">
                                  นายแพทย์ตัวอย่าง รักเรียน
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-gray-700">เบอร์โทรศัพท์</span>
                                  <div className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 bg-white font-mono">
                                    081-234-5678
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-gray-700">สังกัด / คณะ</span>
                                  <div className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 bg-white truncate">
                                    คณะเทคนิคการแพทย์
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="w-full py-2.5 px-3 rounded-xl text-xs font-black shadow-md transition-transform active:scale-98 flex items-center justify-center gap-1.5 mt-2"
                                style={{
                                  background: previewBtnBg,
                                  color: theme.button_text_color,
                                }}
                              >
                                <span>ดำเนินการต่อไปยังขั้นตอนถัดไป</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ==============================================
                        VIEW 3: PASS / TICKET (OFFICIAL DONOR PASS)
                       ============================================== */}
                    {previewScreen === 'pass' && (
                      <div className="animate-in fade-in space-y-3 p-3.5">
                        <div 
                          className="rounded-2xl border border-gray-200/90 overflow-hidden shadow-md transition-all"
                          style={{ backgroundColor: theme.surface_color }}
                        >
                          {/* Ticket Header matching DonorTicketPass */}
                          <div 
                            className="p-4 text-white text-center space-y-1 transition-all"
                            style={{ background: previewHeroBg }}
                          >
                            <div className="text-[9px] uppercase font-bold tracking-widest text-rose-200">
                              MUMT LOVEUNIT 2026 · คณะเทคนิคการแพทย์ ม.มหิดล
                            </div>
                            <div className="text-base font-black font-display tracking-tight">
                              ตั๋วลงทะเบียนบริจาคโลหิต
                            </div>
                            <div className="text-[10px] font-bold text-rose-100 uppercase">
                              บัตรยืนยันสิทธิ์เข้าร่วมกิจกรรม (OFFICIAL DIGITAL PASS)
                            </div>
                          </div>

                          {/* Ticket Notch Cutout Divider */}
                          <div className="relative flex items-center justify-between px-2 bg-white">
                            <div className="-ml-5 h-5 w-5 rounded-full border-r border-rose-200" style={{ backgroundColor: theme.bg_color }} />
                            <div className="flex-1 border-b-2 border-dashed border-rose-200 mx-2" />
                            <div className="-mr-5 h-5 w-5 rounded-full border-l border-rose-200" style={{ backgroundColor: theme.bg_color }} />
                          </div>

                          {/* Ticket Body */}
                          <div className="p-4 space-y-3.5">
                            {/* Registration Code Block */}
                            <div 
                              className="rounded-xl border p-3 flex items-center justify-between"
                              style={{
                                backgroundColor: `${theme.accent_color}10`,
                                borderColor: `${theme.accent_color}25`,
                              }}
                            >
                              <div>
                                <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: theme.accent_color }}>
                                  หมายเลขลงทะเบียน
                                </div>
                                <div className="font-mono text-xl font-black tracking-wider" style={{ color: theme.primary_color }}>
                                  LVU26-A042
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 shadow-2xs">
                                <Copy className="h-3 w-3" /> คัดลอกรหัส
                              </div>
                            </div>

                            {/* 2-Column Appointment Details */}
                            <div className="grid grid-cols-2 gap-2 text-left">
                              <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-2 space-y-0.5">
                                <div className="text-[9px] font-bold text-gray-500 flex items-center gap-1">
                                  <User className="h-3 w-3 text-[#A6192E]" /> ผู้ลงทะเบียน
                                </div>
                                <div className="text-xs font-black text-gray-900 truncate">
                                  นายแพทย์ตัวอย่าง รักเรียน
                                </div>
                              </div>

                              <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-2 space-y-0.5">
                                <div className="text-[9px] font-bold text-gray-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-[#A6192E]" /> วันจัดกิจกรรม
                                </div>
                                <div className="text-xs font-black text-gray-900 truncate">
                                  {eventData?.start_at ? formatThaiDate(eventData.start_at) : '16 ก.ย. 2569'}
                                </div>
                              </div>

                              <div 
                                className="rounded-lg border p-2 space-y-0.5 col-span-2"
                                style={{
                                  backgroundColor: `${theme.accent_color}0A`,
                                  borderColor: `${theme.accent_color}20`,
                                }}
                              >
                                <div className="text-[9px] font-bold flex items-center gap-1" style={{ color: theme.accent_color }}>
                                  <Clock className="h-3 w-3" /> รอบเวลาเดินทางมาถึง
                                </div>
                                <div className="text-sm font-black font-mono" style={{ color: theme.primary_color }}>
                                  09:00 – 10:00 น.
                                </div>
                                <div className="text-[10px] text-gray-600">
                                  {eventData?.venue_name || 'ห้องประชุม 217 อาคารสิริวิทยา'}
                                </div>
                              </div>
                            </div>

                            {/* Simulated QR Box */}
                            <div className="flex flex-col items-center justify-center py-2 bg-gray-50/80 rounded-xl border border-dashed border-gray-200">
                              <div 
                                className="p-2.5 rounded-xl bg-white border-2 flex items-center justify-center shadow-xs"
                                style={{ borderColor: theme.primary_color }}
                              >
                                <QrCode className="h-16 w-16" style={{ color: theme.primary_color }} />
                              </div>
                              <span className="text-[10px] font-bold text-gray-500 mt-1.5">
                                แสดง QR Code ต่อเจ้าหน้าที่ ณ จุดลงทะเบียนวันงาน
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-1.5 pt-1">
                              <button
                                type="button"
                                className="w-full py-2 px-3 rounded-xl text-xs font-black shadow-md transition-transform active:scale-98 flex items-center justify-center gap-1.5"
                                style={{
                                  background: previewBtnBg,
                                  color: theme.button_text_color,
                                }}
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>บันทึกภาพบัตรคิว</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Status Footer */}
                    <div className="p-2.5 text-center border-t border-gray-100 bg-white/80">
                      <p className="text-[10px] text-gray-500 font-medium">
                        *ทุกปุ่ม พื้นหลัง และสีบนหน้าเว็บจริงจะซิงก์ตามตัวอย่างนี้ทันทีเมื่อบันทึก
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Fullscreen Preview Modal */}
          {isFullscreenPreview && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200">
                {/* Modal Top Bar */}
                <div className="bg-gray-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-rose-500" />
                      <span className="h-3 w-3 rounded-full bg-amber-500" />
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-mono text-gray-300">
                      mumt-loveunit.vercel.app (Full Resolution Desktop Preview)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFullscreenPreview(false)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ backgroundColor: theme.bg_color }}>
                  {/* Reuse authentic desktop rendering */}
                  {(() => {
                    const modalHeroBg = theme.hero_gradient_enabled
                      ? (theme.preset_name === 'default'
                          ? 'radial-gradient(100% 75% at 85% 0%, rgba(240, 100, 85, 0.32) 0%, transparent 60%), radial-gradient(90% 80% at 10% 100%, rgba(210, 45, 60, 0.38) 0%, transparent 65%), radial-gradient(60% 60% at 50% 30%, rgba(185, 25, 45, 0.25) 0%, transparent 70%), linear-gradient(140deg, #9C1528 0%, #7E0E1D 30%, #5E0B17 65%, #3B060F 100%)'
                          : `linear-gradient(${theme.hero_gradient_angle ?? 140}deg, ${theme.hero_gradient_start}, ${theme.hero_gradient_end})`)
                      : (theme.primary_hover_color || theme.primary_color);

                    const modalBtnBg = theme.button_gradient_enabled
                      ? (theme.preset_name === 'default'
                          ? 'linear-gradient(to right, #D92231, #A6192E, #7E1120)'
                          : `linear-gradient(${theme.button_gradient_angle ?? 90}deg, ${theme.button_gradient_start}, ${theme.button_gradient_end})`)
                      : theme.primary_color;

                    const isRegClosed = eventData?.status === 'REGISTRATION_CLOSED';

                    return (
                      <div className="space-y-6">
                        {/* Navbar */}
                        <div className="bg-[#FFFBFB] px-6 py-3 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white p-0.5 border border-gray-200 shadow-2xs overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
                            </div>
                            <span className="text-sm font-black text-gray-900 font-display">
                              MUMT LoveUnit <span className="text-[#A6192E]">ครั้งที่ 9</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
                            <span className="text-[#A6192E] font-black bg-rose-50 px-2 py-1 rounded-lg">หน้าแรก</span>
                            <span>ประเมินตนเอง</span>
                            <span>ความรู้ & แล็บ</span>
                            <span>การเตรียมตัว</span>
                            <span>โปสเตอร์</span>
                            <span>สถานที่จัดงาน</span>
                            <span>ค้นหาตั๋ว/QR</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center rounded-full bg-black/5 p-1 border border-gray-200 text-xs font-bold">
                              <span className="bg-white text-[#A6192E] font-black px-2 py-0.5 rounded-full shadow-xs">TH</span>
                              <span className="px-1.5 text-gray-400">EN</span>
                            </div>
                            <div 
                              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 shadow-md"
                              style={{ background: modalBtnBg }}
                            >
                              <Heart className="h-3 w-3 fill-white" />
                              <span>{isRegClosed ? 'ปิดรับลงทะเบียน' : 'ลงทะเบียนบริจาคโลหิต'}</span>
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>

                        {/* Hero */}
                        <div 
                          className="rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl"
                          style={{ background: modalHeroBg }}
                        >
                          <div className="grid grid-cols-12 gap-8 items-center">
                            <div className="col-span-7 space-y-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/15 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 text-rose-100">
                                {isRegClosed ? '● ขณะนี้ปิดรับลงทะเบียนชั่วคราว' : '❤️ ครั้งที่ 9 • MUMT BLOOD DONATION 2026'}
                              </span>
                              <div>
                                <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight leading-tight">
                                  เติมรักให้เต็ม <span className="text-[#FDE68A]">UNIT</span>
                                </h1>
                                <div className="text-xl font-black text-rose-100/90 font-display mt-1">
                                  ต่อชีวิตด้วยโลหิตคุณ
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-rose-100/85 leading-relaxed">
                                {eventData?.description || 'ขอเชิญชวนทุกคนมาร่วมเป็นส่วนหนึ่งในการส่งต่อโอกาสและช่วยเหลือผู้ป่วยที่ต้องการโลหิตในกิจกรรม “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ” ครั้งที่ 9 โดยคณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี'}
                              </p>
                              <div className="flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-3 text-white">
                                <Gift className="h-6 w-6 text-amber-200" />
                                <div>
                                  <div className="text-xs font-extrabold text-white">ผู้บริจาค 100 ท่านแรก รับของที่ระลึกแทนคำขอบคุณ</div>
                                  <div className="text-[11px] text-rose-100/80">มอบให้ ณ จุดบริการหลังเสร็จสิ้นการบริจาคในวันงาน</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-white/15 p-3 text-center border border-white/20">
                                  <div className="text-xs font-bold text-amber-200">วันที่</div>
                                  <div className="text-xs font-black text-white mt-0.5">{eventData?.start_at ? formatThaiDate(eventData.start_at) : '16 ก.ย. 69'}</div>
                                </div>
                                <div className="rounded-xl bg-white/15 p-3 text-center border border-white/20">
                                  <div className="text-xs font-bold text-amber-200">เวลา</div>
                                  <div className="text-xs font-black text-white mt-0.5">{eventData?.start_at && eventData?.end_at ? formatTimeRange(eventData.start_at, eventData.end_at) : '09:00 - 14:00'}</div>
                                </div>
                                <div className="rounded-xl bg-white/15 p-3 text-center border border-white/20">
                                  <div className="text-xs font-bold text-amber-200">สถานที่</div>
                                  <div className="text-xs font-black text-white mt-0.5 truncate">{eventData?.venue_name || 'ห้อง 217 อาคารสิริวิทยา'}</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="w-full py-3.5 px-6 rounded-2xl text-sm font-black shadow-xl flex items-center justify-center gap-2"
                                style={{
                                  backgroundColor: '#FFF8F0',
                                  color: '#7E0E1D',
                                }}
                              >
                                <span>{isRegClosed ? 'ขณะนี้ปิดรับลงทะเบียนแล้ว' : 'ลงทะเบียนบริจาคโลหิตออนไลน์'}</span>
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="col-span-5 flex justify-center items-center">
                              <div className="w-full max-w-[280px] aspect-[1/1.414] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/40">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/images/poster-th.jpg"
                                  alt="MUMT Poster"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
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

              {/* Event Start Date & Time with Interactive Calendar & Time Picker */}
              <div className="space-y-2 rounded-2xl bg-gray-50/80 p-4 border border-gray-200/80 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[var(--burgundy-700)]" />
                    เวลาเริ่มจัดกิจกรรม (Start Date & Time)
                  </label>
                  <span className="text-[11px] font-bold text-[var(--burgundy-700)] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60">
                    {formatThaiDateTimeDisplay(eventData.start_at)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] font-bold text-gray-600 block mb-1">📅 เลือกวันที่</span>
                    <input
                      type="date"
                      value={parseIsoToDateTimeParts(eventData.start_at).date}
                      onChange={(e) => {
                        const parts = parseIsoToDateTimeParts(eventData.start_at);
                        setEventData({ ...eventData, start_at: combineDateAndTimeToIso(e.target.value, parts.time) });
                      }}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-900 shadow-2xs focus:border-[var(--burgundy-700)] focus:ring-1 focus:ring-[var(--burgundy-700)]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-600 block mb-1">⏰ เลือกเวลา</span>
                    <input
                      type="time"
                      value={parseIsoToDateTimeParts(eventData.start_at).time}
                      onChange={(e) => {
                        const parts = parseIsoToDateTimeParts(eventData.start_at);
                        setEventData({ ...eventData, start_at: combineDateAndTimeToIso(parts.date, e.target.value) });
                      }}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-900 shadow-2xs focus:border-[var(--burgundy-700)] focus:ring-1 focus:ring-[var(--burgundy-700)]"
                    />
                  </div>
                </div>
              </div>

              {/* Event End Date & Time with Interactive Calendar & Time Picker */}
              <div className="space-y-2 rounded-2xl bg-gray-50/80 p-4 border border-gray-200/80 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[var(--burgundy-700)]" />
                      เวลาสิ้นสุดกิจกรรม (End Date & Time)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const startParts = parseIsoToDateTimeParts(eventData.start_at);
                        const endParts = parseIsoToDateTimeParts(eventData.end_at);
                        setEventData({ ...eventData, end_at: combineDateAndTimeToIso(startParts.date, endParts.time) });
                      }}
                      className="text-[10px] font-bold text-[var(--burgundy-700)] hover:underline"
                    >
                      (ใช้วันเดียวกับวันเริ่ม)
                    </button>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--burgundy-700)] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60">
                    {formatThaiDateTimeDisplay(eventData.end_at)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] font-bold text-gray-600 block mb-1">📅 เลือกวันที่</span>
                    <input
                      type="date"
                      value={parseIsoToDateTimeParts(eventData.end_at).date}
                      onChange={(e) => {
                        const parts = parseIsoToDateTimeParts(eventData.end_at);
                        setEventData({ ...eventData, end_at: combineDateAndTimeToIso(e.target.value, parts.time) });
                      }}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-900 shadow-2xs focus:border-[var(--burgundy-700)] focus:ring-1 focus:ring-[var(--burgundy-700)]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-600 block mb-1">⏰ เลือกเวลา</span>
                    <input
                      type="time"
                      value={parseIsoToDateTimeParts(eventData.end_at).time}
                      onChange={(e) => {
                        const parts = parseIsoToDateTimeParts(eventData.end_at);
                        setEventData({ ...eventData, end_at: combineDateAndTimeToIso(parts.date, e.target.value) });
                      }}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-900 shadow-2xs focus:border-[var(--burgundy-700)] focus:ring-1 focus:ring-[var(--burgundy-700)]"
                    />
                  </div>
                </div>
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

          {/* Time Slots & Capacities - Dynamic Multi-Slot Real-Time Manager */}
          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[var(--burgundy-700)]" />
                  จัดการรอบเวลาและโควตาที่นั่ง (Time Slots & Capacity)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  เพิ่ม/ลดรอบเวลา ปรับช่วงเวลา และกำหนดโควตาผู้บริจาคต่อรอบ โดยส่งผลไปยังหน้าลงทะเบียนของผู้ใช้งานทันทีแบบ Realtime
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetStandardSlots}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all shadow-2xs"
                >
                  ⚡ รีเซ็ต 3 รอบมาตรฐาน
                </button>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--burgundy-700)] text-white hover:bg-[var(--burgundy-800)] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  เพิ่มรอบเวลาใหม่
                </button>
              </div>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-10 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-500">ยังไม่มีการกำหนดรอบเวลา</p>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="mt-3 px-4 py-2 rounded-xl bg-[var(--burgundy-700)] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  เพิ่มรอบแรก
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map((slot, index) => {
                  const startTime = parseIsoToDateTimeParts(slot.startAt || slot.start_at).time;
                  const endTime = parseIsoToDateTimeParts(slot.endAt || slot.end_at).time;
                  const isActive = slot.isActive !== undefined ? slot.isActive : slot.is_active;
                  const booked = slot.bookedCount ?? slot.booked_count ?? 0;
                  const capacity = slot.capacity ?? 35;

                  return (
                    <div
                      key={slot.id || index}
                      className={`p-4 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-white border-rose-100 shadow-xs hover:border-rose-300'
                          : 'bg-gray-50/70 border-gray-200 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Slot Time Range */}
                        <div className="space-y-1.5 min-w-[280px]">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-[var(--burgundy-700)] text-[11px] font-extrabold">
                              {index + 1}
                            </span>
                            <span className="text-xs font-extrabold text-gray-900">
                              ช่วงเวลา: {startTime} – {endTime} น.
                            </span>
                            {slot.isNew && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                รอบใหม่
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-gray-400">เริ่ม</span>
                              <input
                                type="time"
                                value={startTime}
                                onChange={(e) => handleUpdateSlotTime(index, 'start', e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-bold text-gray-800 focus:border-[var(--burgundy-700)] focus:ring-1 focus:ring-[var(--burgundy-700)]"
                              />
                            </div>
                            <span className="text-gray-400 text-xs font-bold">–</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-gray-400">ถึง</span>
                              <input
                                type="time"
                                value={endTime}
                                onChange={(e) => handleUpdateSlotTime(index, 'end', e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-bold text-gray-800 focus:border-[var(--burgundy-700)] focus:ring-1 focus:ring-[var(--burgundy-700)]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Capacity & Stepper */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-gray-500 block">
                            ความจุผู้บริจาค (คน)
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center rounded-xl border border-gray-300 bg-white shadow-2xs overflow-hidden">
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = Number(slot.capacity) || 35;
                                  setSlots((prev) =>
                                    prev.map((s, idx) =>
                                      idx === index ? { ...s, capacity: Math.max(1, cur - 5) } : s
                                    )
                                  );
                                }}
                                className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 text-xs font-bold transition-all"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="9999"
                                value={slot.capacity}
                                onChange={(e) => {
                                  const val = Math.max(1, Number(e.target.value));
                                  setSlots((prev) =>
                                    prev.map((s, idx) => (idx === index ? { ...s, capacity: val } : s))
                                  );
                                }}
                                className="w-16 text-center text-xs font-extrabold text-gray-900 border-x border-gray-200 py-1 focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = Number(slot.capacity) || 35;
                                  setSlots((prev) =>
                                    prev.map((s, idx) =>
                                      idx === index ? { ...s, capacity: cur + 5 } : s
                                    )
                                  );
                                }}
                                className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 text-xs font-bold transition-all"
                              >
                                +
                              </button>
                            </div>

                            {/* Quick capacity presets */}
                            <div className="hidden sm:flex items-center gap-1">
                              {[35, 50, 100].map((capVal) => (
                                <button
                                  key={capVal}
                                  type="button"
                                  onClick={() =>
                                    setSlots((prev) =>
                                      prev.map((s, idx) =>
                                        idx === index ? { ...s, capacity: capVal } : s
                                      )
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                                    slot.capacity === capVal
                                      ? 'bg-rose-50 border-[var(--burgundy-700)] text-[var(--burgundy-700)]'
                                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {capVal}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() =>
                                  setSlots((prev) =>
                                    prev.map((s, idx) =>
                                      idx === index ? { ...s, capacity: 9999 } : s
                                    )
                                  )
                                }
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                                  slot.capacity === 9999
                                    ? 'bg-rose-50 border-[var(--burgundy-700)] text-[var(--burgundy-700)]'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                ไม่จำกัด
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bookings & Progress */}
                        <div className="space-y-1 min-w-[140px]">
                          <span className="text-[11px] font-bold text-gray-500 block">
                            ยอดลงทะเบียนปัจจุบัน
                          </span>
                          <div className="text-xs font-extrabold text-gray-800">
                            {booked} / {capacity >= 9999 ? 'ไม่จำกัด' : `${capacity} คน`}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[var(--burgundy-700)] h-1.5 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, capacity > 0 ? (booked / capacity) * 100 : 0)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Status Toggle & Delete */}
                        <div className="flex items-center gap-2 pt-2 lg:pt-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSlots((prev) =>
                                prev.map((s, idx) => {
                                  if (idx !== index) return s;
                                  const currentActive = s.isActive !== undefined ? s.isActive : s.is_active;
                                  return { ...s, is_active: !currentActive, isActive: !currentActive };
                                })
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {isActive ? 'เปิดรับ' : 'ปิดรอบนี้'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(index)}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="ลบรอบเวลานี้"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                <label className="text-xs font-bold text-gray-700">ข้อความประกาศด่วน (เช่น &ldquo;รอบเช้าเต็มแล้ว เปิดรับ Walk-in หน้างาน&rdquo;)</label>
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
