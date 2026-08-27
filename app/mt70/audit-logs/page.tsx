'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, RefreshCw, ScrollText, ShieldAlert } from 'lucide-react';
import { formatActionLabel } from '@/lib/utils/format';

interface LogEntry {
  id: string;
  createdAt: string;
  action: string;
  performedBy: string | null;
  registrationCode: string | null;
  donorName: string | null;
  metadata: unknown;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const qs = filter ? `?action=${encodeURIComponent(filter)}` : '';
      const res = await fetch(`/api/admin/audit-logs${qs}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs || []);
        if (data.actions) setActions(data.actions);
      } else {
        setMessage({ type: 'error', text: data.message || 'ไม่สามารถโหลดบันทึกการใช้งานได้' });
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div>
          <Link href="/mt70" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--burgundy-700)] hover:underline mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> <span>กลับหน้าแดชบอร์ด</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display">
            ประวัติการทำงาน (Audit Log)
          </h1>
          <p className="mt-0.5 text-xs text-[var(--muted)] font-medium">
            บันทึกการเปลี่ยนแปลงสถานะและกิจกรรมในระบบ ({logs.length} รายการ)
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold text-[var(--ink)] hover:bg-gray-50 shadow-2xs transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl text-xs font-bold border bg-red-50 border-red-200 text-red-700">
          {message.text}
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-bold text-[var(--muted)]">กรองตามการกระทำ:</label>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setLoading(true); }}
          className="rounded-xl border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-700)]/20"
        >
          <option value="">ทั้งหมด</option>
          {actions.map((a) => (
            <option key={a} value={a}>{formatActionLabel(a)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex py-16 justify-center items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--burgundy-600)]" />
          <span>กำลังโหลดข้อมูล...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center gap-2 rounded-2xl border border-[var(--line)] bg-white p-8">
          <ScrollText className="h-8 w-8 text-gray-300" />
          <span>ยังไม่มีบันทึกประวัติการใช้งาน</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-gray-50/80 border-b border-[var(--line)] text-gray-600 font-bold">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">เวลา</th>
                  <th className="px-4 py-3 whitespace-nowrap">การกระทำ</th>
                  <th className="px-4 py-3 whitespace-nowrap">ผู้บริจาค</th>
                  <th className="px-4 py-3 whitespace-nowrap">รหัส</th>
                  <th className="px-4 py-3 whitespace-nowrap">ผู้ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-600 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--rose-100)] px-2 py-0.5 text-[10px] font-bold text-[var(--burgundy-700)]">
                        <ShieldAlert className="h-3 w-3" />
                        <span>{formatActionLabel(log.action)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-[var(--ink)] whitespace-nowrap">{log.donorName || '-'}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">{log.registrationCode || '-'}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">{log.performedBy || 'ระบบ'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
