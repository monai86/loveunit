'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ListOrdered, Loader2, RefreshCw, UserCheck, Phone, Users } from 'lucide-react';

interface QueueDonor {
  id: string;
  registrationCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  registeredAt: string;
}

interface QueueSlot {
  slotId: string;
  slotLabel: string;
  waiting: number;
  donors: QueueDonor[];
}

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'รอเช็คอิน',
  CHECKED_IN: 'เช็คอินแล้ว',
  IN_PROCESS: 'กำลังบริจาค',
  COMPLETED: 'บริจาคสำเร็จ · รับของที่ระลึก 🎁',
  CANCELLED: 'ยกเลิก',
};

export default function StaffQueuePage() {
  const [queue, setQueue] = useState<QueueSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/queue');
      const data = await res.json();
      if (res.ok && data.success) {
        setQueue(data.queue || []);
      } else if (res.status === 401 || res.status === 403) {
        setMessage({ type: 'error', text: data.message || 'ไม่มีสิทธิ์เข้าถึงคิว กรุณาเข้าสู่ระบบก่อน' });
      }
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer the initial load so it does not synchronously setState during the
    // effect body (avoids cascading re-renders).
    const t = setTimeout(() => void load(), 0);
    // Auto-refresh every 30s so the queue stays current during the event.
    const timer = setInterval(() => void load(), 30000);
    return () => {
      clearTimeout(t);
      clearInterval(timer);
    };
  }, [load]);

  const handleCallNext = async (slotId: string) => {
    setActing(slotId);
    setMessage(null);
    try {
      const res = await fetch('/api/staff/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      });
      const data = await res.json();
      setMessage({
        type: res.ok ? 'success' : 'error',
        text: data.message || (res.ok ? 'เรียกคนถัดไปแล้ว' : 'ดำเนินการไม่สำเร็จ'),
      });
      if (res.ok) await load();
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setActing(null);
    }
  };

  const totalWaiting = queue.reduce((sum, s) => sum + s.waiting, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display">
            คิวผู้บริจาคตามรอบเวลา
          </h1>
          <p className="mt-0.5 text-xs text-[var(--muted)] font-medium">
            MUMT LoveUnit ครั้งที่ 9 · ติดตามสถานะและการรับของที่ระลึก
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold text-[var(--ink)] hover:bg-gray-50 cursor-pointer shadow-2xs transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-[var(--muted)]">รอบเวลา</div>
          <div className="mt-1 text-2xl font-black font-mono text-[var(--ink)]">{queue.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-700">รอเช็คอิน</div>
          <div className="mt-1 text-2xl font-black font-mono text-amber-800">{totalWaiting}</div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-700">เช็คอินแล้ว</div>
          <div className="mt-1 text-2xl font-black font-mono text-blue-800">
            {queue.reduce((s, x) => s + x.donors.filter((d) => d.status === 'CHECKED_IN').length, 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-700">บริจาคสำเร็จ</div>
          <div className="mt-1 text-2xl font-black font-mono text-emerald-800">
            {queue.reduce((s, x) => s + x.donors.filter((d) => d.status === 'COMPLETED').length, 0)}
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex py-16 justify-center items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--burgundy-600)]" />
          กำลังโหลดคิว...
        </div>
      ) : queue.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <Users className="h-10 w-10 text-gray-300" />
          ยังไม่มีผู้บริจาคในคิว
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((slot) => (
            <section key={slot.slotId} className="rounded-2xl border border-[var(--rose-100)] bg-white overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rose-100)] bg-[var(--bg)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <ListOrdered className="h-4 w-4 text-[var(--burgundy-600)]" />
                  <span className="text-sm font-black text-[var(--ink)]">{slot.slotLabel}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    slot.waiting > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    รอ {slot.waiting} คน
                  </span>
                </div>
                <button
                  type="button"
                  disabled={acting === slot.slotId || slot.waiting === 0}
                  onClick={() => handleCallNext(slot.slotId)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-3.5 text-xs font-bold text-white"
                >
                  {acting === slot.slotId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" />
                  )}
                  เรียกคนถัดไป
                </button>
              </div>

              {slot.donors.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-gray-400">ยังไม่มีผู้บริจาคในรอบนี้</div>
              ) : (
                <ul className="divide-y divide-[var(--rose-100)]">
                  {slot.donors.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-[11px] font-bold text-gray-400">{d.registrationCode}</span>
                        <span className="text-sm font-bold text-[var(--ink)] truncate">
                          {d.firstName} {d.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] font-mono text-gray-500">
                          <Phone className="h-3 w-3" /> {d.phone}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          d.status === 'REGISTERED'
                            ? 'bg-amber-100 text-amber-800'
                            : d.status === 'CHECKED_IN'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-violet-100 text-violet-800'
                        }`}>
                          {STATUS_LABEL[d.status] || d.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
