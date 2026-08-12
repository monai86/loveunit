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
      if (email.trim() && password.trim()) {
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
      
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F1A1C] text-white shadow-xl">
          <ShieldCheck className="h-8 w-8 text-[#E43F3F]" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded bg-[#8E0015] text-white text-[10px] font-mono font-bold uppercase">
          STAFF ONLY PORTAL
        </div>
        <h1 className="text-2xl font-black text-[#282828]">เข้าสู่ระบบสำหรับเจ้าหน้าที่</h1>
        <p className="text-xs text-[#666666] font-medium">
          ระบบสำหรับสตาฟผู้ปฏิบัติงานเช็คอินและผู้ดูแลระบบ (Admin)
        </p>
      </div>

      {/* DONOR NOTICE CARD */}
      <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 text-center space-y-1">
        <p>⚠️ หน้านี้สำหรับเจ้าหน้าที่สตาฟในวันงานเท่านั้น</p>
        <Link href="/register" className="text-[#8E0015] underline block font-extrabold">
          หากต้องการลงทะเบียนบริจาคโลหิต กรุณาคลิกที่นี่ →
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-[#D5C7B8] bg-white p-6 shadow-sm sm:p-8 space-y-6">
        
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#282828] mb-1">
              อีเมลเจ้าหน้าที่
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="staff@mahidol.ac.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="editorial-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#282828] mb-1">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                กำลังตรวจสอบสิทธิ์...
              </span>
            ) : (
              <span>เข้าสู่ระบบเจ้าหน้าที่</span>
            )}
          </button>
        </form>

      </div>

    </div>
  );
}
