'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { authClient } from '@/lib/auth/client';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Not signed in at all → login page. Signed in but flag already cleared →
    // straight to the portal (no need to change the password).
    authClient.getSession().then(async (res) => {
      if (!res?.data?.session) {
        router.replace('/staff/login');
        return;
      }
      const me = await fetch('/api/auth/me').then((r) => r.json()).catch(() => ({}));
      if (me?.user?.mustChangePassword === false) {
        const role = me?.user?.profile?.role;
        router.replace(role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/admin' : '/staff/checkin');
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่กับยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/complete-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setError(data?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่');
        return;
      }

      router.replace(data.redirect || '/staff/checkin');
    } catch (err) {
      console.error(err);
      setError('เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ink)] text-white shadow-xl">
          <KeyRound className="h-8 w-8 text-[var(--danger)]" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded bg-[var(--burgundy-600)] text-white text-[11px] font-mono font-bold uppercase">
          FIRST LOGIN • SECURITY
        </div>
        <h1 className="text-2xl font-black text-[var(--ink)]">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-xs text-[var(--muted)] font-medium">
          ครั้งแรกที่เข้าสู่ระบบ กรุณาเปลี่ยนรหัสผ่านที่ระบบตั้งไว้ให้ เป็นรหัสผ่านเฉพาะของคุณ
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8 space-y-6">
        
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cp-current" className="block text-xs font-bold text-[var(--ink)] mb-1">
              รหัสผ่านปัจจุบัน
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                id="cp-current"
                type="password"
                required
                placeholder="รหัสที่ระบบแจกให้ครั้งแรก"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="editorial-input pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cp-new" className="block text-xs font-bold text-[var(--ink)] mb-1">
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                id="cp-new"
                type="password"
                required
                minLength={8}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="editorial-input pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cp-confirm" className="block text-xs font-bold text-[var(--ink)] mb-1">
              ยืนยันรหัสผ่านใหม่
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                id="cp-confirm"
                type="password"
                required
                minLength={8}
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="editorial-input pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="editorial-btn-primary w-full py-3.5 text-xs justify-center font-black"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </span>
            ) : (
              <span>บันทึกรหัสผ่านใหม่</span>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 font-medium">
          <Link href="/staff/login" className="underline">
            กลับไปหน้าล็อกอิน
          </Link>
        </p>

      </div>

      <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-[var(--ink)]/[0.03] border border-[var(--line)] text-[11px] text-[var(--muted)]">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-[var(--burgundy-600)]" />
        <span>
          การเปลี่ยนรหัสผ่านจะยกเลิกเซสชันอื่น ๆ ที่ล็อกอินอยู่ทั้งหมด เพื่อความปลอดภัยของบัญชี
        </span>
      </div>

    </div>
  );
}
