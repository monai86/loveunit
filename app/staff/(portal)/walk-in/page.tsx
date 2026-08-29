'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Phone, Loader2 } from 'lucide-react';
import { ParticipantType, DonationExperience } from '@/lib/types/database';
import { MAHIDOL_FACULTIES } from '@/lib/constants/mahidol';

export default function StaffWalkInPage() {
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
        // API returns Drizzle camelCase (real DB) or legacy snake_case (memory).
        const reg = data.registration || {};
        const code = reg.registrationCode || reg.registration_code || '';
        const fname = reg.firstName || reg.first_name || '';
        const lname = reg.lastName || reg.last_name || '';
        setAlertMsg({
          type: 'success',
          text: `ลงทะเบียน & เช็คอินสำเร็จ! รหัส: ${code} (คุณ${fname} ${lname})`,
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
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <Link
          href="/staff/checkin"
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--burgundy-700)] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> <span>กลับสู่หน้าสแกน QR</span>
        </Link>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
          Walk-in
        </span>
      </div>

      <div className="mt-6 text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display">
          ลงทะเบียน Walk-in หน้างาน
        </h1>
        <p className="text-xs text-[var(--muted)] font-medium">
          สำหรับผู้ที่ไม่ได้ลงทะเบียนออนไลน์ล่วงหน้า (ระบบจะบันทึกและเช็คอินให้อัตโนมัติ)
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
      <div className="mt-6 rounded-3xl border border-[var(--rose-100)] bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="wi-firstName" className="block text-xs font-bold text-[var(--ink)] mb-1">
                ชื่อจริง <span className="text-red-500">*</span>
              </label>
              <input
                id="wi-firstName"
                type="text"
                placeholder="ชื่อจริง"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-700)]"
              />
            </div>

            <div>
              <label htmlFor="wi-lastName" className="block text-xs font-bold text-[var(--ink)] mb-1">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                id="wi-lastName"
                type="text"
                placeholder="นามสกุล"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-700)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="wi-phone" className="block text-xs font-bold text-[var(--ink)] mb-1">
              เบอร์โทรศัพท์ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                id="wi-phone"
                type="tel"
                placeholder="0812345678"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-700)]"
              />
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 block text-xs font-bold text-[var(--ink)]">ประเภทผู้บริจาค <span className="text-red-500">*</span></legend>
            <div className="grid grid-cols-3 gap-2">
              {([
                ['GENERAL_PUBLIC', 'บุคคลทั่วไป'],
                ['STUDENT', 'นักศึกษามหิดล'],
                ['STAFF', 'บุคลากรมหิดล'],
              ] as const).map(([value, label]) => (
                <label htmlFor={`wi-pt-${value}`} key={value} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 py-2.5 text-center text-xs font-bold transition-colors ${formData.participantType === value ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                  <input id={`wi-pt-${value}`} aria-label={label} type="radio" name="participant-type" value={value} checked={formData.participantType === value} onChange={() => setFormData((previous) => ({ ...previous, participantType: value }))} className="sr-only" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {formData.participantType !== 'GENERAL_PUBLIC' && (
            <div>
              <label htmlFor="wi-faculty" className="block text-xs font-bold text-[var(--ink)] mb-1">
                คณะ / สถาบัน / วิทยาลัย
              </label>
              <select
                id="wi-faculty"
                value={formData.faculty}
                onChange={(e) => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-700)]"
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

          <fieldset>
            <legend className="mb-2 block text-xs font-bold text-[var(--ink)]">ประสบการณ์การบริจาค <span className="text-red-500">*</span></legend>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['FIRST_TIME', 'บริจาคครั้งแรก'],
                ['RETURNING', 'เคยบริจาคแล้ว'],
              ] as const).map(([value, label]) => (
                <label htmlFor={`wi-exp-${value}`} key={value} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 py-2.5 text-center text-xs font-bold transition-colors ${formData.donationExperience === value ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                  <input id={`wi-exp-${value}`} aria-label={label} type="radio" name="donation-experience" value={value} checked={formData.donationExperience === value} onChange={() => setFormData((previous) => ({ ...previous, donationExperience: value }))} className="sr-only" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--burgundy-700)] to-[var(--burgundy-500)] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[var(--burgundy-700)]/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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
