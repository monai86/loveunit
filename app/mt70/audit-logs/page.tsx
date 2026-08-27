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
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rose-100)] pb-4">
        <div>
          <Link href="/mt70" className="flex items-center gap-1.5 text-xs font-bold text-[var(--burgundy-700)] hover:underline">
            <ArrowLeft className="h-4 w-4" /> <span>กลับหน้าแดชบอร์ดหลัก</span>
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <span className="unit-tag">ADMIN / AUDIT</span>
            <span className="unit-tag-outline">TRAIL</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-[var(--ink)]">บันทึกการใช้งาน (Audit Log)</h1>
          <p className="mt-1 text-xs text-gray-600">
            ประวัติการเปลี่ยนแปลงสถานะและกิจกรรมทั้งหมดในระบบ — {logs.length} รายการ
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--burgundy-700)]/30 bg-white px-3 py-2 text-xs font-bold text-[var(--burgundy-700)] hover:bg-[var(--rose-100)]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> รีเฟรช
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-xl text-xs font-bold border bg-red-50 border-red-200 text-red-700">
          {message.text}
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="text-xs font-bold text-gray-600">กรองตามการกระทำ:</label>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setLoading(true); }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-700)]"
        >
          <option value="">ทั้งหมด</option>
          {actions.map((a) => (
            <option key={a} value={a}>{formatActionLabel(a)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex py-16 justify-center items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--burgundy-600)]" /> กำลังโหลดบันทึก...
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <ScrollText className="h-10 w-10 text-gray-300" /> ยังไม่มีบันทึกการใช้งาน
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--rose-100)] bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg)] border-b border-[var(--rose-100)]">
              <tr>
                <th className="px-4 py-2.5 font-mono text-[11px] font-bold text-[var(--burgundy-700)] uppercase">เวลา</th>
                <th className="px-4 py-2.5 font-mono text-[11px] font-bold text-[var(--burgundy-700)] uppercase">การกระทำ</th>
                <th className="px-4 py-2.5 font-mono text-[11px] font-bold text-[var(--burgundy-700)] uppercase">ผู้บริจาค</th>
                <th className="px-4 py-2.5 font-mono text-[11px] font-bold text-[var(--burgundy-700)] uppercase">รหัส</th>
                <th className="px-4 py-2.5 font-mono text-[11px] font-bold text-[var(--burgundy-700)] uppercase">ผู้ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rose-100)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg)]">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-600 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--rose-100)] px-2 py-0.5 font-bold text-[var(--burgundy-600)]">
                      <ShieldAlert className="h-3 w-3" />
                      {formatActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-[var(--ink)]">{log.donorName || '-'}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500">{log.registrationCode || '-'}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500">{log.performedBy || 'ระบบ'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
