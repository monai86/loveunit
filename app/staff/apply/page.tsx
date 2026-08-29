'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Search, ShieldCheck } from 'lucide-react';

export default function StaffApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', displayName: '', team: '' });
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setStatus(null);
    try {
      const res = await fetch('/api/staff/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok || !data.success) { setStatus({ message: data.message || 'ส่งคำขอไม่สำเร็จ', tone: 'error' }); return; }
      setReference(data.application.referenceCode);
      setStatus({ message: data.message, tone: 'success' });
      setForm({ email: '', displayName: '', team: '' });
    } catch { setStatus({ message: 'ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่', tone: 'error' }); }
    finally { setLoading(false); }
  }

  return <main className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-10">
    <div className="w-full rounded-3xl border border-[var(--line)] bg-white p-6 shadow-xl sm:p-8">
      <Link href="/staff/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--burgundy-700)]"><ArrowLeft className="h-3.5 w-3.5" />กลับหน้าเข้าสู่ระบบ</Link>
      <div className="mt-6 flex items-center gap-3"><div className="rounded-2xl bg-[var(--rose-100)] p-3 text-[var(--burgundy-700)]"><ShieldCheck className="h-6 w-6" /></div><div><p className="text-xs font-bold uppercase tracking-widest text-[var(--burgundy-700)]">Staff access</p><h1 className="text-2xl font-black text-[var(--ink)]">สมัครเป็น Staff</h1></div></div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">กรอกข้อมูลเพื่อส่งคำขอ ผู้ดูแลระบบสูงสุดจะตรวจสอบและอนุมัติก่อนเปิดใช้งานบัญชี</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {([['displayName','ชื่อ-นามสกุล','เช่น สมชาย ใจดี','text'],['email','อีเมล Mahidol','name@student.mahidol.edu','email'],['team','หน่วยงาน / ทีม','เช่น ฝ่ายเทคนิคการแพทย์','text']] as const).map(([key,label,placeholder,type]) => <label key={key} className="block space-y-1.5"><span className="text-sm font-bold text-[var(--ink)]">{label}</span><input required id={`apply-${key}`} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="editorial-input w-full" disabled={loading} /></label>)}
        {status && <div role="alert" className={`rounded-xl px-4 py-3 text-sm font-medium ${status.tone === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{status.message}</div>}
        {reference && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" />เลขอ้างอิงคำขอ</div><p className="mt-1 font-mono text-lg font-black tracking-wider text-emerald-900">{reference}</p><p className="mt-1 text-xs text-emerald-700">เก็บเลขนี้ไว้เพื่อตรวจสอบสถานะการสมัคร</p></div>}
        <button type="submit" disabled={loading} className="editorial-btn-primary min-h-11 w-full justify-center">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังส่งคำขอ...</> : 'ส่งคำขอสมัคร'}</button>
      </form>
      <div className="mt-6 border-t border-[var(--line)] pt-5"><p className="text-xs font-bold text-[var(--ink)]">มีเลขอ้างอิงแล้ว?</p><form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (reference.trim()) router.push(`/staff/apply/status?reference=${encodeURIComponent(reference.trim())}`); }}><input aria-label="เลขอ้างอิงคำขอ" value={reference} onChange={(e) => setReference(e.target.value.toUpperCase())} placeholder="STF-XXXXXXXXXX" className="editorial-input min-w-0 flex-1" /><button type="submit" className="editorial-btn-secondary min-h-11 px-3"><Search className="h-4 w-4" />ตรวจสอบ</button></form></div>
    </div>
  </main>;
}
