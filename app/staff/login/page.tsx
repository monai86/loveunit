'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowLeft 
} from 'lucide-react';
import { authClient } from '@/lib/auth/client';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in? Redirect to /admin.
  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res?.data?.session) {
        router.replace('/admin');
      }
    }).catch(() => {});
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authClient.signIn.email({ 
        email: email.trim().toLowerCase(), 
        password 
      });

      if (res?.error) {
        setError(
          res.error.status === 401 || res.error.status === 400
            ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
            : 'การเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
        );
        return;
      }

      router.replace('/admin');
    } catch (err) {
      console.error(err);
      setError('การเข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 sm:px-6">
      
      {/* Container Card */}
      <div className="w-full max-w-md space-y-6">
        
        {/* Return to Home link */}
        <div className="text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--burgundy-700)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>กลับสู่หน้าหลักผู้บริจาค</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-[var(--line)] p-7 sm:p-9 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg)] p-2 border border-[var(--line)] shadow-xs">
              <Image src="/images/logo.png" alt="MUMT Logo" width={48} height={48} className="h-full w-auto object-contain" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] text-[10px] font-black uppercase tracking-wider border border-[var(--burgundy-300)]/40">
                  ADMIN PORTAL
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
                เข้าสู่ระบบผู้ดูแลระบบ (Admin)
              </h1>
              <p className="text-xs text-[var(--muted)] font-medium">
                MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ครั้งที่ 9”
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="staff-email" className="block text-xs font-black text-[var(--ink)]">
                อีเมลเข้าสู่ระบบ (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="staff-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@mahidol.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50/50 focus:bg-white text-xs font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)] transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Eye Toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="staff-password" className="block text-xs font-black text-[var(--ink)]">
                  รหัสผ่าน (Password)
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50/50 focus:bg-white text-xs font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
                    <span>กำลังตรวจสอบสิทธิ์...</span>
                  </span>
                ) : (
                  <span>เข้าสู่ระบบ</span>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Security strip footer */}
        <div className="text-center space-y-1 text-[11px] text-[var(--muted)]">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>ระบบความปลอดภัยและควบคุมสิทธิ์การจัดการระบบ</span>
          </p>
          <p className="text-gray-400 font-mono text-[10px]">
            Faculty of Medical Technology, Mahidol University
          </p>
        </div>

      </div>

    </div>
  );
}
