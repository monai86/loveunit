import React from 'react';
import { getDashboardKPIs, getAllRegistrations } from '@/services/admin-service';
import { getEventBySlug } from '@/services/event-service';
import { getAuthenticatedUser } from '@/lib/auth/server';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const currentUser = await getAuthenticatedUser();
  const event = await getEventBySlug('mumt-2026');
  const emptyKpis = {
    totalRegistrations: 0,
    expectedAttendance: 0,
    firstTimeDonors: 0,
    returningDonors: 0,
    studentsCount: 0,
    staffCount: 0,
    generalPublicCount: 0,
    checkedInCount: 0,
    walkInCount: 0,
    inProcessCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
    attendanceRatePercent: 0,
    slotBreakdown: [],
  };

  const [kpis, allRegistrations] = event
    ? await Promise.all([getDashboardKPIs(event.id), getAllRegistrations(event.id)])
    : [emptyKpis, []];

  return (
    <AdminDashboardClient
      initialKpis={kpis}
      initialRegistrations={allRegistrations}
      currentUserRole={currentUser?.profile.role}
      eventId={event?.id || 'ev-mumt-2026'}
    />
  );
}
