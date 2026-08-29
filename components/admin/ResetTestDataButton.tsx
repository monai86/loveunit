'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw, X } from 'lucide-react';

export function ResetTestDataButton({ label = 'เริ่มเลข Registration Code ใหม่' }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ registrations: number; waitlist: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = () => {
    if (loading) return;
    setOpen(false);
    setAcknowledged(false);
    setError('');
    setResult(null);
  };

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  async function reset() {
    if (!acknowledged) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/reset-test-data', { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'ไม่สามารถล้างข้อมูลได้');
        return;
      }
      setResult({ registrations: data.deletedRegistrations || 0, waitlist: data.deletedWaitlist || 0 });
    } catch { setError('ไม่สามารถเชื่อมต่อระบบได้'); }
    finally { setLoading(false); }
  }

  return <>
    <button ref={triggerRef} type="button" onClick={() => setOpen(true)} disabled={loading} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-800 transition-colors hover:bg-red-100 disabled:opacity-60" title="ล้างข้อมูลทดสอบและเริ่ม Registration Code ใหม่ที่ 001"><RotateCcw className="h-4 w-4" />{label}</button>

    {open && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="reset-registration-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl">
        {result ? <div className="px-5 py-6 text-center sm:px-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-6 w-6" /></div>
          <h2 id="reset-registration-title" className="mt-3 text-xl font-black text-[var(--ink)]">เริ่มเลข Registration Code ใหม่แล้ว</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">ลบข้อมูลผู้ลงทะเบียน {result.registrations} รายการ และ Waitlist {result.waitlist} รายการเรียบร้อยแล้ว</p>
          <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">รายการถัดไปจะเริ่มที่ LVU26-001</p>
          <button type="button" onClick={() => window.location.reload()} className="editorial-btn-primary mt-5 min-h-11 w-full justify-center">รีโหลดรายการ</button>
        </div> : <>
          <div className="flex items-start justify-between border-b border-red-100 bg-red-50 px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700"><AlertTriangle className="h-5 w-5" /></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">ข้อมูลทดสอบ</p><h2 id="reset-registration-title" className="mt-0.5 text-lg font-black text-[var(--ink)]">เริ่มเลข Registration Code ใหม่</h2></div>
            </div>
            <button type="button" onClick={close} disabled={loading} aria-label="ปิดหน้าต่างรีเซ็ต" className="rounded-lg p-1.5 text-gray-500 hover:bg-white/70"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-4 px-5 py-5 sm:px-6">
            <p className="text-sm leading-6 text-gray-600">การดำเนินการนี้จะล้างข้อมูลผู้ลงทะเบียนและ Waitlist ทั้งหมดของกิจกรรม เพื่อให้ Registration Code เริ่มต้นใหม่ที่ <strong className="font-mono text-[var(--burgundy-700)]">LVU26-001</strong></p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-900"><strong>โปรดทราบ:</strong> ข้อมูลที่ลบแล้วกู้คืนไม่ได้ แต่ Audit Log จะยังคงอยู่</div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--line)] p-3 text-xs font-medium text-[var(--ink)]"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} disabled={loading} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-700 focus:ring-red-600" /><span>ฉันเข้าใจว่าข้อมูลผู้ลงทะเบียนและ Waitlist จะถูกลบถาวร</span></label>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
            <div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={close} disabled={loading} className="editorial-btn-secondary min-h-11 px-5">ยกเลิก</button>
              <button type="button" onClick={() => void reset()} disabled={!acknowledged || loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-bold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> กำลังเริ่มใหม่...</> : <><RotateCcw className="h-4 w-4" /> ยืนยันและเริ่มเลขใหม่</>}</button>
            </div>
          </div>
        </>}
      </section>
    </div>}
  </>;
}
