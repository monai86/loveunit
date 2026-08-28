'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface InvitationDetails {
  email: string;
  displayName: string;
  team: string | null;
}

export default function StaffInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('กำลังตรวจสอบคำเชิญ...');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/staff/invitations/${encodeURIComponent(token)}`)
      .then(async (res) => ({ res, data: await res.json() }))
      .then(({ res, data }) => {
        if (!res.ok) throw new Error(data.message);
        setInvitation(data.invitation);
        setMessage('');
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'ไม่สามารถตรวจสอบคำเชิญได้'));
  }, [token]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    if (password !== confirmPassword) return setMessage('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch(`/api/staff/invitations/${encodeURIComponent(token)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('เปิดใช้งานสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => router.replace('/staff/login'), 1000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ไม่สามารถเปิดใช้งานบัญชีได้');
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-10">
    <section className="w-full rounded-2xl border border-[var(--line)] bg-white p-6 shadow-xl">
      <h1 className="text-xl font-black text-[var(--ink)]">เปิดใช้งานบัญชี Staff</h1>
      {invitation && <p className="mt-2 text-sm text-[var(--muted)]">{invitation.displayName} · {invitation.email}</p>}
      {message && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-[var(--burgundy-700)]">{message}</p>}
      {invitation && <form className="mt-5 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-bold">รหัสผ่านใหม่<input className="mt-1 w-full rounded-lg border p-2" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <label className="block text-sm font-bold">ยืนยันรหัสผ่าน<input className="mt-1 w-full rounded-lg border p-2" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
        <button className="editorial-btn-primary w-full py-2" disabled={submitting} type="submit">{submitting ? 'กำลังเปิดใช้งาน...' : 'ตั้งรหัสผ่านและเปิดใช้งาน'}</button>
      </form>}
      <Link className="mt-4 block text-center text-sm text-[var(--burgundy-700)] underline" href="/staff/login">ไปหน้าเข้าสู่ระบบ</Link>
    </section>
  </main>;
}
