import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getEventBySlug } from '@/services/event-service';
import { getAllRegistrations, getDashboardKPIs, recordAuditLog } from '@/services/admin-service';
import { requireReadOnlyAdmin } from '@/lib/auth/server';
import { formatTimeRange, getParticipantTypeLabel, getRegistrationStatusBadge } from '@/lib/utils/format';

function pick<T>(obj: Record<string, T>, camel: string, snake: string): T | undefined {
  return obj[camel] ?? obj[snake];
}

/** Formats a Date/ISO string into a readable Thai datetime; empty when absent. */
function formatDateCell(value: unknown): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function GET() {
  try {
    let currentUser;
    try {
      currentUser = await requireReadOnlyAdmin();
    } catch (err: unknown) {
      const status = (err as Error).message === 'UNAUTHORIZED' ? 401 : 403;
      return NextResponse.json({ success: false, message: 'ไม่มีสิทธิ์ส่งออกข้อมูลผู้ลงทะเบียน' }, { status });
    }

    const event = await getEventBySlug('mumt-2026');
    if (!event) {
      return NextResponse.json({ success: false, message: 'ไม่พบกิจกรรม' }, { status: 404 });
    }

    const [registrations, kpis] = await Promise.all([
      getAllRegistrations(event.id),
      getDashboardKPIs(event.id),
    ]);

    await recordAuditLog({
      actorId: currentUser.profile.user_id,
      action: 'EXPORT_REGISTRATIONS_DATA',
      entityType: 'registrations',
      entityId: event.id,
      metadata: { record_count: registrations.length, format: 'XLSX' },
    });

    const workbook = XLSX.utils.book_new();

    // ============ Sheet 1: สรุปภาพรวม ============
    const kpiSummary: (string | number)[][] = [
      ['MUMT Blood Donation 2026 — รายงานสรุป (ครั้งที่ 9)'],
      ['วันที่ส่งออก', new Date().toLocaleString('th-TH')],
      [],
      ['ตัวชี้วัด', 'ค่า'],
      ['ผู้ลงทะเบียนทั้งหมด', kpis.totalRegistrations],
      ['มาถึง/เช็คอินแล้ว', kpis.checkedInCount],
      ['กำลังบริจาค', kpis.inProcessCount],
      ['บริจาคเสร็จสิ้น', kpis.completedCount],
      ['ยกเลิก', kpis.cancelledCount],
      ['ไม่มาตามนัด (NO SHOW)', kpis.noShowCount],
      ['อัตราการมาถึง (%)', kpis.attendanceRatePercent],
      ['Walk-in', kpis.walkInCount],
      ['บริจาคครั้งแรก', kpis.firstTimeDonors],
      ['เคยบริจาคแล้ว', kpis.returningDonors],
      ['นักศึกษา', kpis.studentsCount],
      ['บุคลากร', kpis.staffCount],
      ['บุคคลทั่วไป', kpis.generalPublicCount],
    ];

    // Sort slots chronologically for a readable report.
    const sortedSlots = [...kpis.slotBreakdown].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));
    const slotSummary: (string | number)[][] = [
      [],
      ['รอบเวลา', 'ความจุ (คน)', 'จองแล้ว', 'เช็คอินแล้ว', 'No-show', 'อัตราการมาถึง (%)'],
      ...sortedSlots.map((s) => [
        s.timeLabel,
        s.capacity,
        s.bookedCount,
        s.checkedInCount,
        Math.max(0, s.bookedCount - s.checkedInCount),
        s.bookedCount > 0 ? Math.round((s.checkedInCount / s.bookedCount) * 100) : 0,
      ]),
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet([...kpiSummary, ...slotSummary]);
    summarySheet['!cols'] = [{ wch: 28 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'สรุปภาพรวม');

    // ============ Sheet 2: รายชื่อผู้ลงทะเบียน ============
    const headers = [
      'รหัสลงทะเบียน',
      'ชื่อ',
      'นามสกุล',
      'เบอร์โทร',
      'อีเมล',
      'ประเภทผู้เข้าร่วม',
      'คณะ/หน่วยงาน',
      'ชั้นปี',
      'ประสบการณ์การบริจาค',
      'ช่องทางประชาสัมพันธ์',
      'รอบเวลา',
      'สถานะ',
      'แหล่งที่มา',
      'ลงทะเบียนเมื่อ',
      'เช็คอินเมื่อ',
    ];

    // Both Drizzle (camelCase) and memory (snake_case) shapes share these keys;
    // type loosely here because the two backends produce different object shapes.
    const rows = registrations.map((reg) => {
      const r = reg as unknown as Record<string, unknown>;
      const slot = (r.timeSlot || r.time_slot) as Record<string, unknown> | undefined;
      const slotStart = pick(slot ?? {}, 'startAt', 'start_at');
      const slotEnd = pick(slot ?? {}, 'endAt', 'end_at');
      const status = String(pick(r, 'status', 'status') ?? '');
      return [
        pick(r, 'registrationCode', 'registration_code') ?? '',
        pick(r, 'firstName', 'first_name') ?? '',
        pick(r, 'lastName', 'last_name') ?? '',
        r.phone ?? '',
        pick(r, 'email', 'email') ?? '',
        getParticipantTypeLabel((pick(r, 'participantType', 'participant_type') ?? 'GENERAL_PUBLIC') as never),
        pick(r, 'faculty', 'faculty') ?? '',
        pick(r, 'academicYear', 'academic_year') ?? '',
        pick(r, 'donationExperience', 'donation_experience') === 'FIRST_TIME' ? 'ครั้งแรก' : 'เคยบริจาค',
        pick(r, 'prChannel', 'pr_channel') ?? 'ไม่ได้ระบุ',
        slotStart && slotEnd ? formatTimeRange(String(slotStart), String(slotEnd)) : 'ไม่ระบุ',
        getRegistrationStatusBadge(status as never).label,
        pick(r, 'source', 'source') === 'WALK_IN' ? 'Walk-in' : pick(r, 'source', 'source') === 'ADMIN' ? 'Admin' : 'ออนไลน์',
        formatDateCell(pick(r, 'registeredAt', 'registered_at')),
        formatDateCell(pick(r, 'checkedInAt', 'checked_in_at')),
      ];
    });

    const regSheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    regSheet['!cols'] = [
      { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 24 },
      { wch: 20 }, { wch: 28 }, { wch: 12 }, { wch: 16 }, { wch: 24 }, { wch: 16 },
      { wch: 14 }, { wch: 10 }, { wch: 22 }, { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(workbook, regSheet, 'รายชื่อผู้ลงทะเบียน');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="MUMT_Blood_Donation_Report_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting registrations:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
