'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Search, 
  ShieldCheck, 
  User, 
  Mail, 
  Building2, 
  KeyRound 
} from 'lucide-react';

export default function StaffApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    displayName: '', 
    email: '', 
    team: '', 
  });
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); 
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch('/api/staff/applications', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          displayName: form.displayName,
          email: form.email,
          team: form.team,
        }) 
      });
      const data = await res.json();
      if (!res.ok || !data.success) { 
        setStatus({ message: data.message || 'ส่งคำขอไม่สำเร็จ', tone: 'error' }); 
        return; 
      }
      setReference(data.application.referenceCode);
      setStatus({ 
        message: 'ส่งคำขอสมัครเรียบร้อยแล้ว เมื่อผู้ดูแลระบบสูงสุดอนุมัติ คุณจะสามารถเข้าสู่ระบบด้วยรหัสผ่านเริ่มต้น loveunit2026 ได้ทันที', 
        tone: 'success' 
      });
      setForm({ displayName: '', email: '', team: '' });
    } catch { 
      setStatus({ message: 'ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่', tone: 'error' }); 
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-xl items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-[var(--line)] bg-white p-6 shadow-xl sm:p-8">
        
        {/* Navigation back */}
        <Link 
          href="/staff/login" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--burgundy-700)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>กลับหน้าเข้าสู่ระบบ</span>
        </Link>

        {/* Header */}
        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--rose-100)] p-3 text-[var(--burgundy-700)] shadow-2xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--burgundy-700)]">
              Staff Access
            </p>
            <h1 className="text-2xl font-black text-[var(--ink)]">
              สมัครเป็น Staff
            </h1>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
          กรอกข้อมูลเพื่อส่งคำขอสมัคร เมื่อผู้ดูแลระบบสูงสุดกดตอบรับ บัญชีจะเปิดใช้งานและสามารถเข้าสู่ระบบด้วยรหัสผ่านเริ่มต้น <strong className="font-mono text-[var(--burgundy-700)]">loveunit2026</strong> ได้ทันที
        </p>

        {/* Application Form */}
        <form onSubmit={submit} className="mt-6 space-y-4">
          
          {/* Username */}
          <div className="space-y-1">
            <label htmlFor="apply-username" className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gray-500" />
              <span>Username</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              required
              id="apply-username"
              type="text"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="เช่น somchai_j"
              className="editorial-input w-full text-xs"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="apply-email" className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-500" />
              <span>Email</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              required
              id="apply-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@student.mahidol.ac.th หรือ name@example.com"
              className="editorial-input w-full text-xs font-mono"
              disabled={loading}
            />
          </div>

          {/* Team / Department */}
          <div className="space-y-1">
            <label htmlFor="apply-team" className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-gray-500" />
              <span>หน่วยงาน / ทีม</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              required
              id="apply-team"
              type="text"
              value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
              placeholder="เช่น ฝ่ายเทคนิคการแพทย์ หรือ ฝ่ายต้อนรับ"
              className="editorial-input w-full text-xs"
              disabled={loading}
            />
          </div>

          {/* Default Password Notice Box */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5 flex items-start gap-3">
            <div className="rounded-xl bg-rose-100 p-2 text-[var(--burgundy-700)] shrink-0 mt-0.5">
              <KeyRound className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[var(--burgundy-800)]">
                รหัสผ่านเริ่มต้นสำหรับสตาฟทุกคน:
              </p>
              <p className="text-xs text-gray-600">
                เมื่อได้รับการอนุมัติ บัญชีของคุณจะมีรหัสผ่านเริ่มต้นคือ <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs font-black text-[var(--burgundy-700)] border border-rose-200">loveunit2026</code>
              </p>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div 
              role="alert" 
              className={`rounded-xl px-4 py-3 text-xs font-medium ${
                status.tone === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {status.message}
            </div>
          )}

          {/* Reference Code Card */}
          {reference && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>เลขอ้างอิงคำขอสมัคร</span>
              </div>
              <p className="font-mono text-xl font-black tracking-wider text-emerald-950">
                {reference}
              </p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                บันทึกเลขนี้ไว้สำหรับตรวจสอบสถานะ เมื่อผู้ดูแลระบบสูงสุดกดตอบรับแล้ว คุณจะสามารถเข้าสู่ระบบด้วย Email และรหัสผ่านเริ่มต้น <strong className="font-mono">loveunit2026</strong> ได้ทันที
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="editorial-btn-primary min-h-11 w-full justify-center text-xs font-extrabold shadow-md shadow-red-950/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังส่งคำขอ...</span>
              </>
            ) : (
              'ส่งคำขอสมัคร'
            )}
          </button>
        </form>

        {/* Reference Lookup Section */}
        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <p className="text-xs font-bold text-[var(--ink)]">
            มีเลขอ้างอิงแล้ว?
          </p>
          <form 
            className="mt-2 flex gap-2" 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (reference.trim()) router.push(`/staff/apply/status?reference=${encodeURIComponent(reference.trim())}`); 
            }}
          >
            <input 
              aria-label="เลขอ้างอิงคำขอ" 
              value={reference} 
              onChange={(e) => setReference(e.target.value.toUpperCase())} 
              placeholder="STF-XXXXXXXXXX" 
              className="editorial-input min-w-0 flex-1 text-xs font-mono" 
            />
            <button 
              type="submit" 
              className="editorial-btn-secondary min-h-11 px-4 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span>ตรวจสอบ</span>
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
