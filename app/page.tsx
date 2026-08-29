import React from 'react';
import { HeroClient } from '@/components/home/HeroClient';
import { HomeSectionsClient } from '@/components/home/HomeSectionsClient';
import { getEventBySlug } from '@/services/event-service';
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

  const startAt = pickField<string>(event, 'startAt', 'start_at') || '';
  const endAt = pickField<string>(event, 'endAt', 'end_at') || '';

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO — full-bleed red field with TH/EN toggle */}
      <HeroClient description={event.description} startAt={startAt} endAt={endAt} />

      {/* Main Home Sections with unified reactive language support */}
      <HomeSectionsClient />
    </div>
  );
}
