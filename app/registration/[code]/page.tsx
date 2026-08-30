import React from 'react';
import { notFound } from 'next/navigation';
import { getRegistrationByCode } from '@/services/registration-service';
import { formatTimeRange, formatBangkokTime, isWalkInRecord } from '@/lib/utils/format';
import { RegistrationPoster } from '@/components/registration/RegistrationPoster';
import { RegistrationPassClient } from '@/components/registration/RegistrationPassClient';

// Registration may arrive from either the Drizzle backend (camelCase) or the
// legacy in-memory backend (snake_case); this view type covers both shapes.
interface RegistrationView {
  registrationCode?: string;
  registration_code?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  phone?: string;
  qrToken?: string;
  qr_token?: string;
  faculty?: string | null;
  status?: string;
  source?: string;
  registeredAt?: string;
  registered_at?: string;
  createdAt?: string;
  created_at?: string;
  timeSlot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
  time_slot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
}

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function RegistrationDetailPage({ params }: PageProps) {
  const { code } = await params;
  const registration = await getRegistrationByCode(code);

  if (!registration) {
    notFound();
  }

  const reg = registration as RegistrationView;
  const regCode = reg.registrationCode || reg.registration_code || code;
  const isWalkIn = isWalkInRecord(regCode) || reg.source === 'WALK_IN';
  const firstName = reg.firstName || reg.first_name || '';
  const lastName = reg.lastName || reg.last_name || '';
  const phone = reg.phone || '';
  const qrToken = reg.qrToken || reg.qr_token || '';
  const slot = reg.timeSlot || reg.time_slot;
  const regTime = reg.registeredAt || reg.registered_at || reg.createdAt || reg.created_at;
  const timeSlot = isWalkIn
    ? (regTime ? formatBangkokTime(regTime) : formatBangkokTime(new Date()))
    : (slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : '09:00 – 14:00 น.');
  const facultyName = reg.faculty || 'มหาวิทยาลัยมหิดล';

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 space-y-8">
      {/* Interactive Registration Pass with live Cancellation & Modal */}
      <RegistrationPassClient
        registrationCode={regCode}
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        faculty={facultyName}
        timeSlot={timeSlot}
        date="พุธที่ 16 กันยายน 2569"
        venue="ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา"
        qrToken={qrToken}
        initialStatus={reg.status || 'REGISTERED'}
      />

      {/* Event poster matching the visitor's saved language (TH/EN toggle) */}
      <RegistrationPoster />
    </div>
  );
}
