'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, Heart, AlertCircle, Loader2 } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Demo authentication simulation (or Supabase Auth)
      if (email.trim() && password.trim()) {
        // Store staff session in localStorage for local state
        localStorage.setItem('mumt_staff_session', JSON.stringify({
          email,
          role: email.includes('admin') ? 'ADMIN' : 'STAFF',
          displayName: email.split('@')[0],
        }));
        
        router.push(email.includes('admin') ? '/admin' : '/staff/checkin');
      } else {
        setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      }
    } catch (err) {
      console.error(err);
      setError('การเข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      
      <div className="text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7A1020] text-white shadow-lg shadow-[#7A1020]/20">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-black text-[#29272A]">Staff Portal Login</h1>
        <p className="mt-1 text-xs text-gray-600">
          ระบบเข้าสู่ระบบสำหรับเจ้าหน้าที่จุดเช็คอินและผู้ดูแลระบบ MUMT 2026
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-[#FCE8EC] bg-white p-6 shadow-sm sm:p-8">
        
        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-[#29272A] mb-1">
              อีเมลเจ้าหน้าที่ (Staff Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="staff@mahidol.ac.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29272A] mb-1">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7A1020] to-[#B42336] py-3 text-sm font-bold text-white shadow-md shadow-[#7A1020]/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : (
              <>
                เข้าสู่ระบบสำหรับเจ้าหน้าที่ <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="mt-6 rounded-2xl bg-[#FFF9F9] p-3.5 border border-[#FCE8EC] text-[11px] text-gray-600">
          <span className="font-bold text-[#7A1020]">💡 Quick Login (สำหรับทดลองระบบ):</span>
          <div className="mt-1 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setEmail('staff@mahidol.ac.th'); setPassword('staff1234'); }}
              className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-gray-800 border border-gray-300 hover:border-[#7A1020]"
            >
              เจ้าหน้าที่ (Staff)
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@mahidol.ac.th'); setPassword('admin1234'); }}
              className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-gray-800 border border-gray-300 hover:border-[#7A1020]"
            >
              ผู้ดูแลระบบ (Admin)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
