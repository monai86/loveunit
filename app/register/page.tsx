'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  GraduationCap,
  Building,
  Calendar,
  Loader2
} from 'lucide-react';
import { MAHIDOL_FACULTIES, ACADEMIC_YEARS } from '@/lib/constants/mahidol';
import { formatTimeRange, formatThaiDate } from '@/lib/utils/format';

interface TimeSlot {
  id: string;
  start_at: string;
  end_at: string;
  capacity: number;
  booked_count: number;
}

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [event, setEvent] = useState<any>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateCode, setDuplicateCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    participantType: 'STUDENT' as 'STUDENT' | 'STAFF' | 'ALUMNI' | 'GENERAL_PUBLIC',
    faculty: '',
    academicYear: '',
    donationExperience: 'FIRST_TIME' as 'FIRST_TIME' | 'RETURNING',
    slotId: '',
    privacyAccepted: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchSlots() {
      try {
        setLoadingSlots(true);
        const res = await fetch('/api/events/mumt-2026/slots');
        const data = await res.json();
        if (res.ok && data.success) {
          setSlots(data.slots || []);
          setEvent(data.event || null);
          if (data.slots && data.slots.length > 0) {
            const firstAvailable = data.slots.find((s: TimeSlot) => s.booked_count < s.capacity);
            if (firstAvailable) {
              setFormData((prev) => ({ ...prev, slotId: firstAvailable.id }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    setErrorMsg(null);
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'กรุณากรอกชื่อจริง';
    if (!formData.lastName.trim()) errors.lastName = 'กรุณากรอกนามสกุล';
    
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      errors.phone = 'กรุณากรอกเบอร์โทรศัพท์มือถือ';
    } else if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      errors.phone = 'กรุณากรอกเบอร์โทรศัพท์มือถือ 10 หลักให้ถูกต้อง (เช่น 0812345678)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.participantType) {
      errors.participantType = 'กรุณาเลือกประเภทผู้เข้าร่วม';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!formData.slotId) {
      errors.slotId = 'กรุณาเลือกช่วงเวลาที่แนะนำเดินทางมาถึง';
    }
    if (!formData.privacyAccepted) {
      errors.privacyAccepted = 'กรุณายอมรับประกาศความเป็นส่วนตัวก่อนดำเนินการ';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setDuplicateCode(null);

      const res = await fetch('/api/events/mumt-2026/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(`/registration/${data.registration.registration_code}`);
      } else {
        if (data.duplicateCode) {
          setDuplicateCode(data.duplicateCode);
        }
        setErrorMsg(data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('ไม่สามารถเชื่อมต่อระบบได้ กรุณาตรวจสอบอินเทอร์เน็ต');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white p-2 border border-[#F9D5DC] shadow-xs">
            <img src="/images/logo.png" alt="MUMT Logo" className="h-full w-auto object-contain" />
          </div>
        </div>
        
        <span className="bloom-badge py-1 px-3.5 text-xs">
          <Heart className="h-3.5 w-3.5 fill-[#7A1020]" />
          ระบบลงทะเบียนผู้บริจาคโลหิตออนไลน์
        </span>
        
        <h1 className="text-2xl font-black text-[#1F1A1C] sm:text-3xl">
          ลงทะเบียนบริจาคโลหิต MUMT 2026
        </h1>
        <p className="text-xs text-gray-600 sm:text-sm max-w-md mx-auto">
          กรอกข้อมูลสั้นๆ เลือกช่วงเวลาแนะนำเดินทางมาถึง แล้วรับ QR Code เช็คอินวันงานได้ทันที
        </p>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="flex items-center justify-between px-2">
        <div className={`flex flex-col items-center gap-1 ${step >= 1 ? 'text-[#7A1020]' : 'text-gray-400'}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? 'bg-[#7A1020] text-white shadow-sm' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <span className="text-[11px] font-bold">ข้อมูลทั่วไป</span>
        </div>

        <div className={`h-1 flex-1 mx-3 rounded-full ${step >= 2 ? 'bg-[#7A1020]' : 'bg-gray-200'}`} />

        <div className={`flex flex-col items-center gap-1 ${step >= 2 ? 'text-[#7A1020]' : 'text-gray-400'}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? 'bg-[#7A1020] text-white shadow-sm' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <span className="text-[11px] font-bold">ประเภทผู้เข้าร่วม</span>
        </div>

        <div className={`h-1 flex-1 mx-3 rounded-full ${step >= 3 ? 'bg-[#7A1020]' : 'bg-gray-200'}`} />

        <div className={`flex flex-col items-center gap-1 ${step >= 3 ? 'text-[#7A1020]' : 'text-gray-400'}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step >= 3 ? 'bg-[#7A1020] text-white shadow-sm' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
          <span className="text-[11px] font-bold">ช่วงเวลา & ยืนยัน</span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bloom-card p-6 sm:p-10 bg-white">

        {/* Global Error Alert */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 text-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm">{errorMsg}</h4>
                {duplicateCode && (
                  <div className="mt-3">
                    <Link
                      href={`/registration/${duplicateCode}`}
                      className="bloom-btn-primary py-2 px-4 text-xs"
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
              <div className="border-b border-[#FCE8EC] pb-3">
                <h2 className="text-base font-extrabold text-[#1F1A1C]">ขั้นตอนที่ 1: ข้อมูลผู้ลงทะเบียน</h2>
                <p className="text-xs text-gray-500 mt-0.5">กรอกข้อมูลติดต่อสำหรับใช้ยืนยันการลงทะเบียน (ไม่มีการเก็บเลขบัตรประชาชน)</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#1F1A1C] mb-1">
                    ชื่อจริง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น สมชาย"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={`bloom-input ${fieldErrors.firstName ? 'border-red-500 bg-red-50/50' : ''}`}
                  />
                  {fieldErrors.firstName && <p className="mt-1 text-xs text-red-500 font-bold">{fieldErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1A1C] mb-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ใจดี"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={`bloom-input ${fieldErrors.lastName ? 'border-red-500 bg-red-50/50' : ''}`}
                  />
                  {fieldErrors.lastName && <p className="mt-1 text-xs text-red-500 font-bold">{fieldErrors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1A1C] mb-1">
                  เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="0812345678"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`bloom-input pl-10 ${fieldErrors.phone ? 'border-red-500 bg-red-50/50' : ''}`}
                  />
                </div>
                {fieldErrors.phone ? (
                  <p className="mt-1 text-xs text-red-500 font-bold">{fieldErrors.phone}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-gray-500">ใช้สำหรับค้นหาข้อมูลกรณีลืม QR Code หน้างาน</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1A1C] mb-1">
                  อีเมล (ไม่บังคับ)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="example@mahidol.ac.th"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`bloom-input pl-10 ${fieldErrors.email ? 'border-red-500 bg-red-50/50' : ''}`}
                  />
                </div>
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500 font-bold">{fieldErrors.email}</p>}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="bloom-btn-primary py-3 px-6 text-xs"
                >
                  ถัดไป: ประเภทผู้เข้าร่วม <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PARTICIPANT TYPE */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#FCE8EC] pb-3">
                <h2 className="text-base font-extrabold text-[#1F1A1C]">ขั้นตอนที่ 2: ประเภทผู้เข้าร่วม</h2>
                <p className="text-xs text-gray-500 mt-0.5">ช่วยสถิติการจัดสรรของที่ระลึกและเกียรติบัตร</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1A1C] mb-3">
                  ท่านลงทะเบียนในฐานะใด? <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => handleChange('participantType', 'STUDENT')}
                    className={`bloom-card p-4 text-center transition-all ${formData.participantType === 'STUDENT' ? 'border-[#7A1020] bg-[#FCE8EC]/60 ring-2 ring-[#7A1020]' : 'hover:border-[#F4B8C3]'}`}
                  >
                    <GraduationCap className="mx-auto h-6 w-6 text-[#7A1020] mb-1.5" />
                    <span className="block text-xs font-extrabold text-[#1F1A1C]">นักศึกษา</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('participantType', 'STAFF')}
                    className={`bloom-card p-4 text-center transition-all ${formData.participantType === 'STAFF' ? 'border-[#7A1020] bg-[#FCE8EC]/60 ring-2 ring-[#7A1020]' : 'hover:border-[#F4B8C3]'}`}
                  >
                    <Building className="mx-auto h-6 w-6 text-[#7A1020] mb-1.5" />
                    <span className="block text-xs font-extrabold text-[#1F1A1C]">บุคลากร / อาจารย์</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('participantType', 'ALUMNI')}
                    className={`bloom-card p-4 text-center transition-all ${formData.participantType === 'ALUMNI' ? 'border-[#7A1020] bg-[#FCE8EC]/60 ring-2 ring-[#7A1020]' : 'hover:border-[#F4B8C3]'}`}
                  >
                    <User className="mx-auto h-6 w-6 text-[#7A1020] mb-1.5" />
                    <span className="block text-xs font-extrabold text-[#1F1A1C]">ศิษย์เก่า</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('participantType', 'GENERAL_PUBLIC')}
                    className={`bloom-card p-4 text-center transition-all ${formData.participantType === 'GENERAL_PUBLIC' ? 'border-[#7A1020] bg-[#FCE8EC]/60 ring-2 ring-[#7A1020]' : 'hover:border-[#F4B8C3]'}`}
                  >
                    <Heart className="mx-auto h-6 w-6 text-[#7A1020] mb-1.5 fill-[#7A1020]/20" />
                    <span className="block text-xs font-extrabold text-[#1F1A1C]">บุคคลทั่วไป</span>
                  </button>
                </div>
              </div>

              {/* Faculty and Academic Year Dropdowns */}
              {(formData.participantType === 'STUDENT' || formData.participantType === 'STAFF' || formData.participantType === 'ALUMNI') && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-[#FCE8EC]">
                  <div>
                    <label className="block text-xs font-bold text-[#1F1A1C] mb-1">
                      คณะ / สถาบัน / วิทยาลัย (มหาวิทยาลัยมหิดล)
                    </label>
                    <select
                      value={formData.faculty}
                      onChange={(e) => handleChange('faculty', e.target.value)}
                      className="bloom-input"
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
                      <label className="block text-xs font-bold text-[#1F1A1C] mb-1">
                        ชั้นปี
                      </label>
                      <select
                        value={formData.academicYear}
                        onChange={(e) => handleChange('academicYear', e.target.value)}
                        className="bloom-input"
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
                  className="bloom-btn-secondary py-2.5 px-4 text-xs"
                >
                  <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  className="bloom-btn-primary py-3 px-6 text-xs"
                >
                  ถัดไป: เลือกช่วงเวลา <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TIME SLOT & CONFIRMATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#FCE8EC] pb-3">
                <h2 className="text-base font-extrabold text-[#1F1A1C]">ขั้นตอนที่ 3: เลือกช่วงเวลาและยืนยัน</h2>
                <p className="text-xs text-gray-500 mt-0.5">ประมาณการช่วงเวลาเดินทางมาถึง เพื่อให้ทีมงานต้อนรับท่านได้อย่างรวดเร็ว</p>
              </div>

              {/* Donation Experience */}
              <div>
                <label className="block text-xs font-bold text-[#1F1A1C] mb-2">
                  ท่านเคยบริจาคโลหิตมาก่อนหรือไม่? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('donationExperience', 'FIRST_TIME')}
                    className={`bloom-card p-3.5 text-center text-xs font-bold transition-all ${formData.donationExperience === 'FIRST_TIME' ? 'border-[#7A1020] bg-[#FCE8EC]/60 text-[#7A1020] ring-2 ring-[#7A1020]' : ''}`}
                  >
                    บริจาคเป็นครั้งแรก 🌟
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('donationExperience', 'RETURNING')}
                    className={`bloom-card p-3.5 text-center text-xs font-bold transition-all ${formData.donationExperience === 'RETURNING' ? 'border-[#7A1020] bg-[#FCE8EC]/60 text-[#7A1020] ring-2 ring-[#7A1020]' : ''}`}
                  >
                    เคยบริจาคแล้ว ❤️
                  </button>
                </div>
              </div>

              {/* Time Slot Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#1F1A1C]">
                    เลือกช่วงเวลาที่แนะนำให้เดินทางมาถึง <span className="text-red-500">*</span>
                  </label>
                  <span className="bloom-badge text-[11px]">
                    16 กันยายน 2569
                  </span>
                </div>

                <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-amber-900 text-xs leading-relaxed">
                  <span className="font-bold">⚠️ หมายเหตุสำคัญ:</span> เวลาที่เลือกเป็น<span className="font-bold underline">ช่วงเวลาที่แนะนำให้เดินทางมาถึง</span> เพื่อบริหารความหนาแน่นของคิว
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
                      const availableSpots = Math.max(0, s.capacity - s.booked_count);
                      const isSelected = formData.slotId === s.id;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => handleChange('slotId', s.id)}
                          className={`bloom-card p-3.5 flex items-center justify-between text-left transition-all ${
                            isFull 
                              ? 'bg-gray-100 opacity-50 cursor-not-allowed border-gray-200' 
                              : isSelected
                                ? 'border-[#7A1020] bg-[#FCE8EC]/70 ring-2 ring-[#7A1020]' 
                                : 'hover:border-[#F4B8C3]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Clock className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#7A1020]' : 'text-gray-400'}`} />
                            <span className="text-xs font-extrabold text-[#1F1A1C]">
                              {formatTimeRange(s.start_at, s.end_at)}
                            </span>
                          </div>

                          <div>
                            {isFull ? (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                เต็มแล้ว
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
                {fieldErrors.slotId && <p className="mt-1.5 text-xs text-red-500 font-bold">{fieldErrors.slotId}</p>}
              </div>

              {/* Privacy Notice */}
              <div className="rounded-2xl border border-[#F9D5DC] bg-[#FFF8F9] p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={(e) => handleChange('privacyAccepted', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#7A1020] focus:ring-[#7A1020]"
                  />
                  <div className="text-xs leading-relaxed text-[#1F1A1C]">
                    <span className="font-bold">ประกาศความเป็นส่วนตัว (Privacy Notice):</span> ข้อมูลของท่านจะถูกจัดเก็บเฉพาะเพื่อการบริหารจัดการกิจกรรมบริจาคโลหิต MUMT 2026 การประสานงานคิว และการรายงานสถิติสรุปภาพรวมเท่านั้น
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
                  className="bloom-btn-secondary py-2.5 px-4 text-xs"
                >
                  <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bloom-btn-primary py-3.5 px-8 text-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังบันทึกข้อมูล...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4.5 w-4.5" />
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
