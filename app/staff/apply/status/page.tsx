'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Search } from 'lucide-react';

export default function StaffApplicationStatusPage() {
  const [reference, setReference] = useState('');
  const [result, setResult] = useState<{ status: string; rejectionReason: string | null } | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  async function lookup(value = reference) { if (!value.trim()) return; setLoading(true); setMessage(''); try { const res = await fetch(`/api/staff/applications/${encodeURIComponent(value.trim())}`); const data = await res.json(); if (!res.ok || !data.success) { setResult(null); setMessage(data.message || 'ไม่พบคำขอสมัคร'); } else setResult(data.application); } catch { setMessage('ไม่สามารถตรวจสอบสถานะได้'); } finally { setLoading(false); } }
  return <main className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-10"><div className="w-full rounded-3xl border border-[var(--line)] bg-white p-6 shadow-xl sm:p-8"><Link href="/staff/apply" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--burgundy-700)]"><ArrowLeft className="h-3.5 w-3.5" />กลับหน้าสมัคร</Link><h1 className="mt-6 text-2xl font-black text-[var(--ink)]">ตรวจสอบสถานะคำขอ</h1><form className="mt-5 flex gap-2" onSubmit={(e) => { e.preventDefault(); void lookup(); }}><input aria-label="เลขอ้างอิงคำขอ" value={reference} onChange={(e) => setReference(e.target.value.toUpperCase())} placeholder="STF-XXXXXXXXXX" className="editorial-input min-w-0 flex-1" /><button type="submit" disabled={loading} className="editorial-btn-primary min-h-11 px-3">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}ค้นหา</button></form>{message && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}{result && <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4"><p className="text-sm font-bold text-[var(--ink)]">สถานะ: <span className="text-[var(--burgundy-700)]">{result.status}</span></p>{result.rejectionReason && <p className="mt-2 text-sm text-red-700">เหตุผล: {result.rejectionReason}</p>}</div>}</div></main>;
}
