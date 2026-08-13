'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Users, Loader2, UserCheck, XCircle, Clock } from 'lucide-react';
import { formatTimeRange } from '@/lib/utils/format';

interface WaitlistEntry {
  id: string;
  slotId?: string;
  slot_id?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  timeSlot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
  time_slot?: { startAt?: string; endAt?: string; start_at?: string; end_at?: string } | null;
}

interface Props {
  eventId: string;
}

export function WaitlistPanel({ eventId }: Props) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/waitlist');
      const data = await res.json();
      if (res.ok && data.success) {
        setEntries(data.waitlist || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer the initial load so it does not synchronously setState during the
    // effect body (avoids cascading renders).
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [eventId, load]);

  const pending = entries.filter((e) => e.status === 'WAITING');

  const handleAction = async (id: string, action: 'promote' | 'remove') => {
    setActing(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/waitlist/${id}`, {
        method: action === 'promote' ? 'POST' : 'DELETE',
      });
      const data = await res.json();
      setMessage({
        type: res.ok ? 'success' : 'error',
        text: data.message || (res.ok ? 'ดำเนินการสำเร็จ' : 'ดำเนินการไม่สำเร็จ'),
      });
      if (res.ok) load();
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setActing(null);
    }
  };

  const slotLabel = (e: WaitlistEntry) => {
    const slot = e.timeSlot || e.time_slot;
    return slot ? formatTimeRange(slot.startAt || slot.start_at || '', slot.endAt || slot.end_at || '') : 'ไม่ระบุรอบ';
  };

  return (
    <section className="bg-white border border-[#D5C7B8] rounded-2xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#D5C7B8] pb-3">
        <span className="text-xs font-mono font-bold text-[#8E0015] uppercase">
          6. WAITLIST (รายการรอผู้บริจาค — {pending.length} คน)
        </span>
        <button
          type="button"
          onClick={load}
          className="text-[11px] font-bold text-[#8E0015] hover:underline"
        >
          รีเฟรช
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-bold border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex py-8 justify-center items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-[#8E0015]" />
          กำลังโหลดรายการรอ...
        </div>
      ) : pending.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <Users className="h-8 w-8 text-gray-300" />
          ไม่มีผู้รอในรายการขณะนี้
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((e) => (
            <div key={e.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-[#D5C7B8] bg-[#FFF9F9]">
              <div className="space-y-0.5 min-w-0">
                <div className="text-sm font-black text-[#282828]">
                  {e.firstName || e.first_name} {e.lastName || e.last_name}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 text-[11px] font-bold text-[#666666]">
                  <span className="font-mono">{e.phone}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#8E0015]" />
                    {slotLabel(e)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={acting === e.id}
                  onClick={() => handleAction(e.id, 'promote')}
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  {acting === e.id ? 'กำลังดำเนินการ...' : 'เลื่อนขึ้นลงทะเบียน'}
                </button>
                <button
                  type="button"
                  disabled={acting === e.id}
                  onClick={() => handleAction(e.id, 'remove')}
                  className="inline-flex items-center gap-1.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 font-bold px-3 py-1.5 rounded-lg text-[11px]"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  นำออก
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
