import React from 'react';
import { HeroClient } from '@/components/home/HeroClient';
import { HomeSectionsClient } from '@/components/home/HomeSectionsClient';
import { getEventBySlug, getEventContentBlocks } from '@/services/event-service';
import { pickField } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const event = await getEventBySlug('mumt-2026');

  if (!event) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="editorial-card p-8 text-center">
          <h2 className="text-lg font-bold text-[var(--burgundy-500)]">ไม่พบข้อมูลกิจกรรมบริจาคโลหิต</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">กรุณาตรวจสอบ URL หรือติดต่อผู้ดูแลระบบ</p>
        </div>
      </div>
    );
  }

  const contentBlocks = await getEventContentBlocks(event.id);
  const urgentBanner = contentBlocks.find(b => {
    const key = pickField<string>(b, 'contentKey', 'content_key');
    const isVisible = pickField<boolean>(b, 'isVisible', 'is_visible');
    return key === 'urgent_banner' && Boolean(isVisible);
  });

  const startAt = pickField<string>(event, 'startAt', 'start_at') || '';
  const endAt = pickField<string>(event, 'endAt', 'end_at') || '';

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Urgent Announcement Bar if enabled by Super Admin */}
      {urgentBanner && (
        <aside 
          aria-label="ประกาศด่วนสำคัญ"
          className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-amber-950 font-bold px-4 py-3 text-center text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md border-b border-amber-500/40"
        >
          <span className="bg-amber-950 text-amber-100 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-xs">
            ประกาศสำคัญ
          </span>
          <span className="font-extrabold">{urgentBanner.description || urgentBanner.title}</span>
        </aside>
      )}

      {/* HERO — full-bleed red field with TH/EN toggle */}
      <HeroClient description={event.description} startAt={startAt} endAt={endAt} status={event.status} />

      {/* Main Home Sections with unified reactive language support */}
      <HomeSectionsClient />
    </div>
  );
}
