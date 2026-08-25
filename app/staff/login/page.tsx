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
  ArrowLeft, 
  Crown, 
  Shield, 
  Users, 
  Smartphone,
  Sparkles,
  Check
} from 'lucide-react';
import { authClient } from '@/lib/auth/client';

const DEMO_PRESETS = [
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    email: 'superadmin@mahidol.ac.th',
    pass: 'SuperAdmin@MUMT2026',
    icon: Crown,
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200',
  },
  {
    role: 'ADMIN',
    label: 'Admin',
    email: 'admin@mahidol.ac.th',
    pass: 'Admin@MUMT2026',
    icon: Shield,
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200 hover:bg-rose-200',
  },
  {
    role: 'TEAM_LEAD',
    label: 'Team Lead',
    email: 'lead@mahidol.ac.th',
    pass: 'Lead@MUMT2026',
    icon: Users,
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200',
  },
  {
    role: 'STAFF',
    label: 'Staff สแกน QR',
    email: 'staff@mahidol.ac.th',
    pass: 'Staff@MUMT2026',
    icon: Smartphone,
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200 hover:bg-emerald-200',
  },
];

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@mahidol.ac.th');
  const [password, setPassword] = useState('SuperAdmin@MUMT2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('SUPER_ADMIN');

  const redirectByRole = (role?: string, mustChangePassword?: boolean) => {
    if (mustChangePassword) {
      router.replace('/staff/change-password');
      return;
    }
    router.replace(role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/admin' : '/staff/checkin');
  };

  // Already signed in? Skip the form.
  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res?.data?.session) {
        fetch('/api/auth/me').then((r) => r.json()).then((me) => {
          redirectByRole(me?.user?.profile?.role, me?.user?.mustChangePassword);
        }).catch(() => redirectByRole());
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setSelectedRole(preset.role);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authClient.signIn.email({ email, password });

      if (res?.error) {
        setError(
          res.error.status === 401 || res.error.status === 400
            ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
            : 'การเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
        );
        return;
      }

      const me = await fetch('/api/auth/me').then((r) => r.json());
      redirectByRole(me?.user?.profile?.role, me?.user?.mustChangePassword);
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
                  STAFF & ADMIN PORTAL
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
                เข้าสู่ระบบเจ้าหน้าที่
              </h1>
              <p className="text-xs text-[var(--muted)] font-medium">
                MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ครั้งที่ 9”
              </p>
            </div>
          </div>

          {/* Quick Account Preset Selector */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>เลือกบัญชีตามบทบาท (Quick Fill):</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_PRESETS.map((preset) => {
                const isSelected = email === preset.email;
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                      isSelected
                        ? `${preset.badgeColor} ring-1 ring-[var(--burgundy-600)] shadow-2xs`
                        : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{preset.label}</span>
                    </div>
                    {isSelected && <Check className="h-3 w-3 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <p>{error}</p>
                <p className="text-[11px] font-normal text-red-700">
                  คุณสามารถกดเลือกปุ่ม Quick Fill ด้านบนเพื่อกรอกรหัสผ่านเริ่มต้นที่ถูกต้องได้ทันที
                </p>
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
                  placeholder="name@mahidol.ac.th"
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
            <span>ระบบความปลอดภัยและควบคุมสิทธิ์แบบ Role-Based Access Control (RBAC)</span>
          </p>
          <p className="text-gray-400 font-mono text-[10px]">
            Faculty of Medical Technology, Mahidol University
          </p>
        </div>

      </div>

    </div>
  );
}
