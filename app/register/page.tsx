'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, User, Phone, School, GraduationCap, Clock, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { MAHIDOL_FACULTIES, ACADEMIC_YEARS } from '@/lib/constants/mahidol';

const PARTICIPANT_TYPES = [
  { id: 'STUDENT', name: 'นักศึกษา ม.มหิดล' },
  { id: 'STAFF', name: 'บุคลากร ม.มหิดล' },
  { id: 'GENERAL', name: 'บุคคลทั่วไป' },
];

interface TimeSlot {
  id: string;
  timeSlot: string;
  maxCapacity: number;
  currentBooked: number;
  remainingCapacity: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
}

export default function RegisterPage() {
  const router = useRouter();

  // Wizard state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available Time Slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    participantType: 'STUDENT',
    faculty: MAHIDOL_FACULTIES[0].name,
    academicYear: ACADEMIC_YEARS[0].value,
    timeSlotId: '',
  });

  // Fetch Time Slots on Mount
  useEffect(() => {
    async function fetchSlots() {
      try {
        setSlotsLoading(true);
        const res = await fetch('/api/events/mumt-2026/slots');
        if (res.ok) {
          const data = await res.json();
          setTimeSlots(data.slots || []);
        } else {
          setErrorMessage('ไม่สามารถโหลดข้อมูลช่วงเวลาได้ กรุณาลองใหม่อีกครั้ง');
        }
      } catch (err) {
        setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, []);

  // Validation
  const validateStep1 = () => {
    if (!formData.firstName.trim()) return 'กรุณากรอกชื่อจริง';
    if (!formData.lastName.trim()) return 'กรุณากรอกนามสกุล';
    if (!formData.phone.trim()) return 'กรุณากรอกเบอร์โทรศัพท์';
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 10) return 'กรุณากรอกเบอร์โทรศัพท์ 9-10 หลักให้ถูกต้อง';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.participantType) return 'กรุณาเลือกประเภทผู้เข้าร่วม';
    if (formData.participantType === 'STUDENT' && !formData.faculty) return 'กรุณาเลือกคณะ / หน่วยงาน';
    return null;
  };

  const validateStep3 = () => {
    if (!formData.timeSlotId) return 'กรุณาเลือกรอบเวลาที่ต้องการเดินทางมาถึง';
    return null;
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) return setErrorMessage(err);
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) return setErrorMessage(err);
      setStep(3);
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const err = validateStep3();
    if (err) return setErrorMessage(err);

    setLoading(true);
    try {
      const res = await fetch('/api/events/mumt-2026/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success && data.registration) {
        router.push(`/registration/${data.registration.registrationCode}`);
      } else {
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      
      {/* Editorial Header */}
      <div className="mb-8 border-b border-[#F0C4CC] pb-4">
        <div className="flex items-center gap-2">
          <span className="unit-tag text-[10px]">UNIT 01 / REGISTRATION</span>
          <span className="unit-tag-outline text-[10px]">MUMT Blood Donation 2026</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-editorial-ink sm:text-3xl">
          ลงทะเบียนบริจาคโลหิตออนไลน์
        </h1>
        <p className="mt-1 text-xs text-editorial-muted font-medium">
          กรอกข้อมูลและเลือกรอบเวลาเดินทาง เพื่อรับ QR Code สำหรับแสดงในวันงาน
        </p>
      </div>

      {/* Asymmetric 2-Column Desktop Form Shell */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Progress Column (4 Cols) */}
        <div className="md:col-span-4 editorial-card p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-[#7A1020] uppercase block">
              STEP {step} OF 3
            </span>
            <h2 className="text-lg font-black text-editorial-ink">
              {step === 1 && 'ข้อมูลส่วนตัว'}
              {step === 2 && 'สังกัดและคณะ'}
              {step === 3 && 'รอบเวลาเดินทาง'}
            </h2>
            <p className="text-xs text-editorial-muted">ใช้เวลาลงทะเบียนประมาณ 2 นาที</p>
          </div>

          {/* Step Progress Indicators */}
          <div className="space-y-3 pt-2">
            <div className={`p-3 rounded-lg border text-xs font-bold transition-all flex items-center gap-3 ${
              step === 1 ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020]' : step > 1 ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-400'
            }`}>
              <span className="h-6 w-6 rounded-full bg-[#7A1020] text-white flex items-center justify-center text-[11px] font-mono font-bold">01</span>
              <span>1. ข้อมูลส่วนตัว</span>
            </div>

            <div className={`p-3 rounded-lg border text-xs font-bold transition-all flex items-center gap-3 ${
              step === 2 ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020]' : step > 2 ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-400'
            }`}>
              <span className="h-6 w-6 rounded-full bg-[#7A1020] text-white flex items-center justify-center text-[11px] font-mono font-bold">02</span>
              <span>2. สังกัดและคณะ</span>
            </div>

            <div className={`p-3 rounded-lg border text-xs font-bold transition-all flex items-center gap-3 ${
              step === 3 ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020]' : 'border-gray-100 text-gray-400'
            }`}>
              <span className="h-6 w-6 rounded-full bg-[#7A1020] text-white flex items-center justify-center text-[11px] font-mono font-bold">03</span>
              <span>3. รอบเวลาเดินทาง</span>
            </div>
          </div>
        </div>

        {/* Right Form Control Column (8 Cols) */}
        <div className="md:col-span-8 editorial-card p-6 sm:p-8">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: PERSONAL INFO */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-sm font-black text-[#7A1020] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
                  01. ข้อมูลผู้ลงทะเบียน
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                      ชื่อจริง <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น สมชาย"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="editorial-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                      นามสกุล <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ใจดี"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="editorial-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                    เบอร์โทรศัพท์มือถือ <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="เช่น 0812345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="editorial-input"
                  />
                  <p className="mt-1 text-[11px] text-editorial-muted font-medium">
                    * ใช้สำหรับค้นหาประวัติการลงทะเบียนกรณีลืม QR Code
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: FACULTY & AFFILIATION */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-sm font-black text-[#7A1020] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
                  02. สังกัดและสถานภาพ
                </h3>

                <div>
                  <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                    ประเภทผู้เข้าร่วม <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PARTICIPANT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, participantType: type.id })}
                        className={`p-3 rounded-lg border text-left text-xs font-bold transition-all ${
                          formData.participantType === type.id
                            ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020]'
                            : 'border-gray-200 hover:border-gray-300 text-editorial-ink'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                    คณะ / หน่วยงาน <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="editorial-input"
                  >
                    {MAHIDOL_FACULTIES.map((fac) => (
                      <option key={fac.code} value={fac.name}>
                        {fac.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.participantType === 'STUDENT' && (
                  <div>
                    <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                      ชั้นปีการศึกษา <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="editorial-input"
                    >
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

            {/* STEP 3: TIME SLOT SELECTION (TIMETABLE LIST) */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-sm font-black text-[#7A1020] uppercase tracking-wider border-b border-[#FCE8EC] pb-2">
                  03. เลือกรอบเวลาแนะนำเดินทางมาถึง (16 ก.ย. 2569)
                </h3>

                {slotsLoading ? (
                  <div className="py-8 text-center text-xs font-bold text-editorial-muted">
                    กำลังโหลดข้อมูลช่วงเวลา...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeSlots.map((slot) => {
                      const isSelected = formData.timeSlotId === slot.id;
                      const isFull = slot.status === 'FULL' || slot.remainingCapacity <= 0;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => setFormData({ ...formData, timeSlotId: slot.id })}
                          className={`w-full p-3.5 rounded-lg border text-left text-xs font-bold transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#7A1020] bg-[#FCE8EC] text-[#7A1020] ring-1 ring-[#7A1020]'
                              : isFull
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                              : 'border-gray-200 bg-white hover:border-[#7A1020] text-editorial-ink'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className={`h-4 w-4 ${isSelected ? 'text-[#7A1020]' : 'text-gray-400'}`} />
                            <span className="text-sm font-black">{slot.timeSlot} น.</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {isFull ? (
                              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                เต็มแล้ว
                              </span>
                            ) : slot.remainingCapacity <= 15 ? (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                เหลือ {slot.remainingCapacity} ที่
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                ว่าง ({slot.remainingCapacity} ที่)
                              </span>
                            )}

                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-[#7A1020] text-white flex items-center justify-center">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* WIZARD ACTIONS */}
            <div className="pt-6 border-t border-[#F0C4CC] flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="editorial-btn-secondary text-xs py-2.5 px-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>ย้อนกลับ</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="editorial-btn-primary text-xs py-2.5 px-6 ml-auto"
                >
                  <span>ถัดไป</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="editorial-btn-primary text-xs py-3 px-8 ml-auto"
                >
                  {loading ? (
                    <span>กำลังบันทึกข้อมูล...</span>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 fill-white" />
                      <span>ยืนยันการลงทะเบียน</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
