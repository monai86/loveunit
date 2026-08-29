'use client';

import { useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';

export function ResetTestDataButton({ label = 'เริ่มเลข Registration Code ใหม่' }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  async function reset() {
    if (!window.confirm('ล้างข้อมูลผู้บริจาคและ waitlist ทั้งหมดของกิจกรรมนี้ใช่หรือไม่?')) return;
    if (!window.confirm('ยืนยันอีกครั้ง: ข้อมูล registrations ที่ล้างแล้วจะกู้คืนไม่ได้')) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reset-test-data', { method: 'POST' });
      const data = await response.json();
      window.alert(response.ok && data.success ? `${data.message}\nลบ registrations ${data.deletedRegistrations} รายการ และ waitlist ${data.deletedWaitlist} รายการ` : data.message || 'ไม่สามารถล้างข้อมูลได้');
      if (response.ok && data.success) window.location.reload();
    } catch { window.alert('ไม่สามารถเชื่อมต่อระบบได้'); }
    finally { setLoading(false); }
  }
  return <button type="button" onClick={() => void reset()} disabled={loading} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-800 hover:bg-red-100 disabled:opacity-60" title="ล้างข้อมูลทดสอบและเริ่ม Registration Code ใหม่ที่ 001">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}{label}</button>;
}
