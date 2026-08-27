'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  Loader2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowLeft
} from 'lucide-react';
import { authClient } from '@/lib/auth/client';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        router.replace(role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/mt70' : '/staff/checkin');
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
      setError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
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
        setError(data?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาตรวจสอบรหัสผ่านเดิม');
        return;
      }

      router.replace(data.redirect || '/staff/checkin');
    } catch (err) {
      console.error(err);
      setError('เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 sm:px-6">
      
      <div className="w-full max-w-md space-y-6">
        
        {/* Return to Login link */}
        <div className="text-left">
          <Link
            href="/staff/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--burgundy-700)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-[var(--line)] p-7 sm:p-9 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--rose-100)] p-2 border border-[var(--line)] shadow-xs">
              <KeyRound className="h-7 w-7 text-[var(--burgundy-700)]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300/60">
                  FIRST LOGIN • SECURITY SETUP
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
                ตั้งรหัสผ่านเฉพาะของคุณ
              </h1>
              <p className="text-xs text-[var(--muted)] font-medium">
                สำหรับการเข้าใช้งานครั้งแรก กรุณาเปลี่ยนรหัสผ่านเริ่มต้นเพื่อความปลอดภัย
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Current Password */}
            <div className="space-y-1">
              <label htmlFor="cp-current" className="block text-xs font-black text-[var(--ink)]">
                รหัสผ่านปัจจุบัน (รหัสที่ระบบแจกให้) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="cp-current"
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="เช่น SuperAdmin@MUMT2026"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50/50 focus:bg-white text-xs font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                  aria-label={showCurrent ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label htmlFor="cp-new" className="block text-xs font-black text-[var(--ink)]">
                รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="cp-new"
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="กำหนดรหัสผ่านใหม่"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50/50 focus:bg-white text-xs font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                  aria-label={showNew ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label htmlFor="cp-confirm" className="block text-xs font-black text-[var(--ink)]">
                ยืนยันรหัสผ่านใหม่อีกครั้ง *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="cp-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50/50 focus:bg-white text-xs font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                  aria-label={showConfirm ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[var(--burgundy-700)] hover:bg-[var(--burgundy-800)] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>กำลังบันทึกรหัสผ่านใหม่...</span>
                  </span>
                ) : (
                  <span>บันทึกและเข้าสู่ระบบ</span>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Security hint */}
        <div className="text-center space-y-1 text-[11px] text-[var(--muted)]">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>การเปลี่ยนรหัสผ่านจะช่วยปกป้องความปลอดภัยของระบบและข้อมูลผู้บริจาค</span>
          </p>
        </div>

      </div>

    </div>
  );
}
