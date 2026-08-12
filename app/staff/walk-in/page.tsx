'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, CheckCircle2, ArrowLeft, Phone, User, GraduationCap, Building2, Users, Loader2, Zap } from 'lucide-react';
import { ParticipantType, DonationExperience } from '@/lib/types/database';
import { MAHIDOL_FACULTIES } from '@/lib/constants/mahidol';

export default function StaffWalkInPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    participantType: ParticipantType;
    faculty: string;
    donationExperience: DonationExperience;
  }>({
    firstName: '',
    lastName: '',
    phone: '',
    participantType: 'GENERAL_PUBLIC',
    faculty: '',
    donationExperience: 'FIRST_TIME',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg(null);

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      setAlertMsg({ type: 'error', text: 'กรุณากรอกชื่อ นามสกุล และเบอร์โทรศัพท์' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/staff/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAlertMsg({
          type: 'success',
          text: `ลงทะเบียน & เช็คอินสำเร็จ! รหัส: ${data.registration.registration_code} (คุณ${data.registration.first_name} ${data.registration.last_name})`,
        });

        // Reset form for next walk-in donor immediately
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          participantType: 'GENERAL_PUBLIC',
          faculty: '',
          donationExperience: 'FIRST_TIME',
        });
      } else {
        setAlertMsg({ type: 'error', text: data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน Walk-in' });
      }
    } catch (err) {
      console.error(err);
      setAlertMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-[#FCE8EC] pb-4">
        <Link
          href="/staff/checkin"
          className="flex items-center gap-1.5 text-xs font-bold text-[#7A1020] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> กลับสู่หน้าเช็คอิน
        </Link>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-700" />
          Fast Walk-in Mode (20-30s Target)
        </div>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-2xl font-black text-[#29272A] sm:text-3xl">
          ลงทะเบียนผู้บริจาคหน้างาน (Walk-in)
        </h1>
        <p className="mt-1 text-xs text-gray-600">
          ฟอร์มลงทะเบียนอย่างรวดเร็วสำหรับผู้บริจาคที่ไม่ได้ลงทะเบียนออนไลน์ล่วงหน้า ระบบจะทำการ Register & Check In ให้อัตโนมัติ
        </p>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div className={`mt-6 flex items-center justify-between rounded-2xl border p-4 text-xs font-bold ${
          alertMsg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'
        }`}>
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <CheckCircle2 className="h-5 w-5 text-red-600 shrink-0" />}
            <span>{alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* Ultra Fast Form */}
      <div className="mt-6 rounded-3xl border border-[#FCE8EC] bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#29272A] mb-1">
                ชื่อจริง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="ชื่อจริง"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#29272A] mb-1">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="นามสกุล"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29272A] mb-1">
              เบอร์โทรศัพท์ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                placeholder="0812345678"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29272A] mb-2">
              ประเภทผู้บริจาค <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, participantType: 'GENERAL_PUBLIC' }))}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold ${formData.participantType === 'GENERAL_PUBLIC' ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020]' : 'border-gray-200 text-gray-700'}`}
              >
                บุคคลทั่วไป
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, participantType: 'STUDENT' }))}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold ${formData.participantType === 'STUDENT' ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020]' : 'border-gray-200 text-gray-700'}`}
              >
                นักศึกษามหิดล
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, participantType: 'STAFF' }))}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold ${formData.participantType === 'STAFF' ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020]' : 'border-gray-200 text-gray-700'}`}
              >
                บุคลากรมหิดล
              </button>
            </div>
          </div>

          {formData.participantType !== 'GENERAL_PUBLIC' && (
            <div>
              <label className="block text-xs font-bold text-[#29272A] mb-1">
                คณะ / สถาบัน / วิทยาลัย
              </label>
              <select
                value={formData.faculty}
                onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
              >
                <option value="">-- เลือกคณะ / สถาบัน --</option>
                {MAHIDOL_FACULTIES.map((fac) => (
                  <option key={fac.code} value={fac.name}>
                    {fac.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#29272A] mb-2">
              ประสบการณ์การบริจาค <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, donationExperience: 'FIRST_TIME' }))}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold ${formData.donationExperience === 'FIRST_TIME' ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020]' : 'border-gray-200 text-gray-700'}`}
              >
                บริจาคครั้งแรก 🌟
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, donationExperience: 'RETURNING' }))}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold ${formData.donationExperience === 'RETURNING' ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020]' : 'border-gray-200 text-gray-700'}`}
              >
                เคยบริจาคแล้ว ❤️
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7A1020] to-[#B42336] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#7A1020]/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังลงทะเบียน Walk-in...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Register & Check In ทันที
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
