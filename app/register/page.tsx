'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Phone, 
  Mail, 
  GraduationCap, 
  Building2, 
  Users, 
  Clock, 
  Heart, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { publicRegistrationSchema, PublicRegistrationInput } from '@/lib/validation/schemas';
import { ParticipantType, DonationExperience, TimeSlot } from '@/lib/types/database';
import { formatTimeRange, formatThaiDate } from '@/lib/utils/format';
import { MAHIDOL_FACULTIES, ACADEMIC_YEARS } from '@/lib/constants/mahidol';

export default function RegisterPage() {
  const router = useRouter();

  // Multi-step form state (1: Info, 2: Type, 3: Slot & Submit)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateCode, setDuplicateCode] = useState<string | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    participantType: ParticipantType;
    faculty: string;
    academicYear: string;
    donationExperience: DonationExperience;
    slotId: string;
    privacyAccepted: boolean;
  }>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    participantType: 'STUDENT',
    faculty: '',
    academicYear: '',
    donationExperience: 'FIRST_TIME',
    slotId: '',
    privacyAccepted: false,
  });

  const [event, setEvent] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch available slots on mount
  useEffect(() => {
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        const res = await fetch('/api/events/mumt-2026/slots');
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots || []);
          if (data.event) setEvent(data.event);
        }
      } catch (e) {
        console.error('Failed to load slots', e);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setErrorMsg(null);
    setDuplicateCode(null);
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'กรุณากรอกชื่อจริง';
    if (!formData.lastName.trim()) errors.lastName = 'กรุณากรอกนามสกุล';
    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10 || !cleanedPhone.startsWith('0')) {
      errors.phone = 'กรุณากรอกเบอร์โทรศัพท์มือถือ 10 หลัก (เช่น 0812345678)';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.participantType) errors.participantType = 'กรุณาเลือกประเภทผู้เข้าร่วม';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 & Full Submit Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDuplicateCode(null);

    const validationResult = publicRegistrationSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/events/mumt-2026/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationResult.data),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errorCode === 'DUPLICATE_REGISTRATION') {
          setErrorMsg('พบการลงทะเบียนสำหรับหมายเลขโทรศัพท์นี้แล้ว');
          if (data.registrationCode) {
            setDuplicateCode(data.registrationCode);
          }
        } else if (data.errorCode === 'SLOT_FULL') {
          setErrorMsg('ช่วงเวลานี้เพิ่งเต็ม กรุณาเลือกช่วงเวลาอื่น');
          // Refresh slots
          const freshSlots = await fetch('/api/events/mumt-2026/slots').then(r => r.json());
          if (freshSlots.slots) setSlots(freshSlots.slots);
        } else {
          setErrorMsg(data.message || 'การลงทะเบียนยังไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        }
        return;
      }

      // Success -> Redirect to confirmation page
      router.push(`/registration/${data.registration.registration_code}`);
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      
      {/* Header */}
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          <img src="/images/logo.png" alt="MUMT LOVE UNIT Logo" className="h-16 w-auto object-contain" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7A1020]/10 px-3 py-1 text-xs font-bold text-[#7A1020]">
          <Heart className="h-3.5 w-3.5 fill-[#7A1020]" />
          ระบบลงทะเบียนผู้บริจาคโลหิตออนไลน์
        </span>
        <h1 className="mt-3 text-2xl font-black text-[#29272A] sm:text-3xl">
          ลงทะเบียนบริจาคโลหิต MUMT 2026
        </h1>
        <p className="mt-1 text-xs text-[#29272A]/70 sm:text-sm">
          กรอกข้อมูลสั้นๆ เลือกช่วงเวลาแนะนำเพื่อเดินทางมาถึง แล้วรับ QR Code เช็คอินวันงานได้ทันที
        </p>
      </div>

      {/* Step Indicator Bar */}
      <div className="mt-8 mb-8">
        <div className="flex items-center justify-between">
          
          <div className={`flex flex-col items-center gap-1 ${step >= 1 ? 'text-[#7A1020]' : 'text-gray-400'}`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? 'bg-[#7A1020] text-white shadow-md shadow-[#7A1020]/20' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <span className="text-[11px] font-semibold">ข้อมูลพื้นฐาน</span>
          </div>

          <div className={`h-1 flex-1 mx-2 rounded ${step >= 2 ? 'bg-[#7A1020]' : 'bg-gray-200'}`} />

          <div className={`flex flex-col items-center gap-1 ${step >= 2 ? 'text-[#7A1020]' : 'text-gray-400'}`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? 'bg-[#7A1020] text-white shadow-md shadow-[#7A1020]/20' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <span className="text-[11px] font-semibold">ประเภทผู้เข้าร่วม</span>
          </div>

          <div className={`h-1 flex-1 mx-2 rounded ${step >= 3 ? 'bg-[#7A1020]' : 'bg-gray-200'}`} />

          <div className={`flex flex-col items-center gap-1 ${step >= 3 ? 'text-[#7A1020]' : 'text-gray-400'}`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${step >= 3 ? 'bg-[#7A1020] text-white shadow-md shadow-[#7A1020]/20' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className="text-[11px] font-semibold">เลือกช่วงเวลา</span>
          </div>

        </div>
      </div>

      {/* Main Card Container */}
      <div className="rounded-3xl border border-[#FCE8EC] bg-white p-6 shadow-sm sm:p-10">

        {/* Global Error Alert */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">{errorMsg}</h4>
                {duplicateCode && (
                  <div className="mt-3">
                    <Link
                      href={`/registration/${duplicateCode}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#7A1020] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#8F1327]"
                    >
                      ดูข้อมูลการลงทะเบียนของคุณ ({duplicateCode}) →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#FCE8EC] pb-4">
                <h2 className="text-lg font-bold text-[#29272A]">ขั้นตอนที่ 1: ข้อมูลผู้ลงทะเบียน</h2>
                <p className="text-xs text-gray-500 mt-1">กรอกข้อมูลติดต่อสำหรับใช้ยืนยันการลงทะเบียน (ไม่มีการเก็บเลขบัตรประชาชนหรือประวัติการรักษา)</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#29272A] mb-1">
                    ชื่อจริง <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="เช่น สมชาย"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020] ${fieldErrors.firstName ? 'border-red-500 bg-red-50/50' : 'border-gray-300'}`}
                    />
                  </div>
                  {fieldErrors.firstName && <p className="mt-1 text-xs text-red-500">{fieldErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29272A] mb-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ใจดี"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020] ${fieldErrors.lastName ? 'border-red-500 bg-red-50/50' : 'border-gray-300'}`}
                  />
                  {fieldErrors.lastName && <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#29272A] mb-1">
                  เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="0812345678"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020] ${fieldErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-300'}`}
                  />
                </div>
                {fieldErrors.phone ? (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-gray-500">ใช้สำหรับค้นหาข้อมูลกรณีลืม QR Code หน้างาน</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#29272A] mb-1">
                  อีเมล (ไม่บังคับ)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="example@mahidol.ac.th"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020] ${fieldErrors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-300'}`}
                  />
                </div>
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[#7A1020] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#7A1020]/20 hover:bg-[#8F1327]"
                >
                  ถัดไป: ประเภทผู้เข้าร่วม <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PARTICIPANT TYPE */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#FCE8EC] pb-4">
                <h2 className="text-lg font-bold text-[#29272A]">ขั้นตอนที่ 2: ประเภทผู้เข้าร่วม</h2>
                <p className="text-xs text-gray-500 mt-1">ช่วยสถิติการจัดสรรของที่ระลึกและเกียรติบัตร</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#29272A] mb-3">
                  ท่านลงทะเบียนในฐานะใด? <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  
                  <button
                    type="button"
                    onClick={() => handleChange('participantType', 'STUDENT')}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${formData.participantType === 'STUDENT' ? 'border-[#7A1020] bg-[#FCE8EC]/50 ring-2 ring-[#7A1020]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <GraduationCap className={`h-8 w-8 mb-2 ${formData.participantType === 'STUDENT' ? 'text-[#7A1020]' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold text-[#29272A]">นักศึกษามหิดล</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('participantType', 'STAFF')}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${formData.participantType === 'STAFF' ? 'border-[#7A1020] bg-[#FCE8EC]/50 ring-2 ring-[#7A1020]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <Building2 className={`h-8 w-8 mb-2 ${formData.participantType === 'STAFF' ? 'text-[#7A1020]' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold text-[#29272A]">บุคลากรมหิดล</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('participantType', 'GENERAL_PUBLIC')}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${formData.participantType === 'GENERAL_PUBLIC' ? 'border-[#7A1020] bg-[#FCE8EC]/50 ring-2 ring-[#7A1020]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <Users className={`h-8 w-8 mb-2 ${formData.participantType === 'GENERAL_PUBLIC' ? 'text-[#7A1020]' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold text-[#29272A]">บุคคลทั่วไป</span>
                  </button>

                </div>
              </div>

              {/* Student & Staff Faculty/Year Fields */}
              {formData.participantType !== 'GENERAL_PUBLIC' && (
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC] sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#29272A] mb-1">
                      คณะ / สถาบัน / วิทยาลัย
                    </label>
                    <select
                      value={formData.faculty}
                      onChange={(e) => handleChange('faculty', e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
                    >
                      <option value="">-- เลือกคณะ / สถาบัน --</option>
                      {MAHIDOL_FACULTIES.map((fac) => (
                        <option key={fac.code} value={fac.name}>
                          {fac.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.participantType === 'STUDENT' && (
                    <div>
                      <label className="block text-xs font-bold text-[#29272A] mb-1">
                        ชั้นปี
                      </label>
                      <select
                        value={formData.academicYear}
                        onChange={(e) => handleChange('academicYear', e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
                      >
                        <option value="">-- เลือกชั้นปี --</option>
                        {ACADEMIC_YEARS.map((yr) => (
                          <option key={yr.value} value={yr.value}>
                            {yr.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[#7A1020] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#7A1020]/20 hover:bg-[#8F1327]"
                >
                  ถัดไป: เลือกช่วงเวลา <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DONATION EXPERIENCE & TIME SLOT */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#FCE8EC] pb-4">
                <h2 className="text-lg font-bold text-[#29272A]">ขั้นตอนที่ 3: เลือกช่วงเวลาและยืนยัน</h2>
                <p className="text-xs text-gray-500 mt-1">ประมาณการช่วงเวลาเดินทางมาถึง เพื่อให้ทีมงานต้อนรับท่านได้อย่างรวดเร็ว</p>
              </div>

              {/* Donation Experience Field */}
              <div>
                <label className="block text-xs font-bold text-[#29272A] mb-2">
                  ท่านเคยบริจาคโลหิตมาก่อนหรือไม่? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('donationExperience', 'FIRST_TIME')}
                    className={`rounded-xl border p-3.5 text-center text-xs font-bold transition-all ${formData.donationExperience === 'FIRST_TIME' ? 'border-[#7A1020] bg-[#FCE8EC]/60 text-[#7A1020] ring-2 ring-[#7A1020]' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                  >
                    บริจาคเป็นครั้งแรก 🌟
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('donationExperience', 'RETURNING')}
                    className={`rounded-xl border p-3.5 text-center text-xs font-bold transition-all ${formData.donationExperience === 'RETURNING' ? 'border-[#7A1020] bg-[#FCE8EC]/60 text-[#7A1020] ring-2 ring-[#7A1020]' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                  >
                    เคยบริจาคแล้ว ❤️
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  * ข้อมูลนี้ใช้เพื่อสถิติการวางแผนงานเท่านั้น ไม่ใช่การประเมินคุณสมบัติทางการแพทย์
                </p>
              </div>

              {/* Time Slot Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#29272A]">
                    เลือกช่วงเวลาที่แนะนำให้เดินทางมาถึง <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#B42336] font-semibold">
                    {event ? formatThaiDate(event.start_at) : 'วันพุธที่ 16 กันยายน 2569'}
                  </span>
                </div>

                {/* Explicit Disclaimer required by specification */}
                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-amber-900 text-xs leading-relaxed">
                  <span className="font-bold">⚠️ หมายเหตุสำคัญ:</span> เวลาที่เลือกเป็น<span className="font-bold underline">ช่วงเวลาที่แนะนำให้เดินทางมาถึง</span> ไม่ใช่เวลารับบริจาคที่รับประกัน
                </div>

                {loadingSlots ? (
                  <div className="flex py-8 justify-center items-center gap-2 text-xs text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin text-[#7A1020]" />
                    กำลังโหลดช่วงเวลาที่เปิดรับ...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {slots.map((s) => {
                      const isFull = s.booked_count >= s.capacity;
                      const isNearlyFull = s.booked_count >= s.capacity * 0.8 && !isFull;
                      const availableSpots = Math.max(0, s.capacity - s.booked_count);
                      const isSelected = formData.slotId === s.id;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => handleChange('slotId', s.id)}
                          className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                            isFull 
                              ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed' 
                              : isSelected
                                ? 'border-[#7A1020] bg-[#FCE8EC]/70 ring-2 ring-[#7A1020]' 
                                : 'border-gray-200 bg-white hover:border-[#7A1020]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Clock className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#7A1020]' : 'text-gray-400'}`} />
                            <div>
                              <span className="text-xs font-bold text-[#29272A]">
                                {formatTimeRange(s.start_at, s.end_at)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            {isFull ? (
                              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                                เต็มแล้ว (Full)
                              </span>
                            ) : isNearlyFull ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                เหลืออีก {availableSpots} ที่
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                ว่าง {availableSpots} ที่
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {fieldErrors.slotId && <p className="mt-1.5 text-xs text-red-500">{fieldErrors.slotId}</p>}
              </div>

              {/* Privacy Notice Checkbox */}
              <div className="rounded-2xl border border-gray-200 bg-[#FFF9F9] p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={(e) => handleChange('privacyAccepted', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#7A1020] focus:ring-[#7A1020]"
                  />
                  <div className="text-xs leading-relaxed text-[#29272A]">
                    <span className="font-bold">ประกาศความเป็นส่วนตัว (Privacy Notice):</span> ข้อมูลของท่านจะถูกจัดเก็บเฉพาะเพื่อการบริหารจัดการกิจกรรมบริจาคโลหิต MUMT 2026 การประสานงานคิว และการรายงานสถิติสรุปภาพรวมเท่านั้น โดยจะไม่ถูกเปิดเผยแก่บุคคลภายนอกโดยไม่ได้รับอนุญาต
                    <br />
                    <span className="font-bold text-[#7A1020] mt-1 inline-block">
                      ข้าพเจ้าได้อ่านและรับทราบประกาศเกี่ยวกับการเก็บและใช้ข้อมูลสำหรับกิจกรรมนี้
                    </span>
                  </div>
                </label>
                {fieldErrors.privacyAccepted && (
                  <p className="mt-2 text-xs font-bold text-red-500">{fieldErrors.privacyAccepted}</p>
                )}
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7A1020] to-[#B42336] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7A1020]/25 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังบันทึกการลงทะเบียน...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      ยืนยันลงทะเบียนบริจาคโลหิต
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </form>
      </div>

    </div>
  );
}
