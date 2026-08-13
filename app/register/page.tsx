'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, User, Phone, School, GraduationCap, Clock, Check, ArrowRight, ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { MAHIDOL_FACULTIES, ACADEMIC_YEARS } from '@/lib/constants/mahidol';
import { formatTimeRange } from '@/lib/utils/format';

const PARTICIPANT_TYPES = [
  { id: 'STUDENT', name: 'นักศึกษา ม.มหิดล' },
  { id: 'STAFF', name: 'บุคลากร ม.มหิดล' },
  { id: 'GENERAL_PUBLIC', name: 'บุคคลทั่วไป' },
];

interface TimeSlot {
  id: string;
  timeSlot: string;
  maxCapacity: number;
  currentBooked: number;
  remainingCapacity: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
}

// Raw slot shape returned by GET /api/events/[slug]/slots (Drizzle fields),
// tolerant of both camelCase and snake_case.
interface ApiSlot {
  id: string;
  startAt?: string;
  start_at?: string;
  endAt?: string;
  end_at?: string;
  capacity?: number;
  max_capacity?: number;
  bookedCount?: number;
  booked_count?: number;
  status?: string;
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

  // Waitlist (for full slots)
  const [waitlistSlot, setWaitlistSlot] = useState<TimeSlot | null>(null);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    participantType: 'STUDENT',
    faculty: MAHIDOL_FACULTIES[0].name,
    academicYear: ACADEMIC_YEARS[0].value,
    donationExperience: 'FIRST_TIME',
    timeSlotId: '',
    privacyAccepted: false,
  });

  // Fetch Time Slots on Mount
  useEffect(() => {
    async function fetchSlots() {
      try {
        setSlotsLoading(true);
        const res = await fetch('/api/events/mumt-2026/slots');
        if (res.ok) {
          const data = await res.json();
          // Normalize both camelCase (Drizzle) and snake_case shapes.
          const slots: TimeSlot[] = (data.slots || []).map((s: ApiSlot) => {
            const capacity = s.capacity ?? s.max_capacity ?? 0;
            const booked = s.bookedCount ?? s.booked_count ?? 0;
            const remaining = capacity - booked;
            const status =
              s.status === 'FULL' || remaining <= 0
                ? 'FULL'
                : s.status === 'LIMITED' || remaining <= 15
                ? 'LIMITED'
                : 'AVAILABLE';
            return {
              id: s.id,
              timeSlot: formatTimeRange(s.startAt || s.start_at || '', s.endAt || s.end_at || ''),
              maxCapacity: capacity,
              currentBooked: booked,
              remainingCapacity: remaining,
              status,
            };
          });
          setTimeSlots(slots);
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
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) return 'กรุณากรอกอีเมลให้ถูกต้อง (หรือเว้นว่างไว้)';
    }
    return null;
  };

  const validateStep2 = () => {
    if (!formData.participantType) return 'กรุณาเลือกประเภทผู้เข้าร่วม';
    if (formData.participantType === 'STUDENT' && !formData.faculty) return 'กรุณาเลือกคณะ / หน่วยงาน';
    if (!formData.donationExperience) return 'กรุณาเลือกประสบการณ์การบริจาค';
    return null;
  };

  const validateStep3 = () => {
    if (!formData.timeSlotId) return 'กรุณาเลือกรอบเวลาที่ต้องการเดินทางมาถึง';
    if (!formData.privacyAccepted) return 'กรุณายอมรับประกาศความเป็นส่วนตัวเพื่อดำเนินการต่อ';
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
      // Form state uses `timeSlotId` internally, but the API schema expects
      // `slotId` — map before sending.
      const { timeSlotId, ...rest } = formData;
      const payload = { ...rest, slotId: timeSlotId };
      const res = await fetch('/api/events/mumt-2026/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.registration) {
        router.push(`/registration/${data.registration.registrationCode}`);
      } else {
        // Server returns { message } on failure — surface it instead of the
        // generic fallback so donors see the real reason (duplicate phone, etc.).
        setErrorMessage(data.message || data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
    } finally {
      setLoading(false);
    }
  };

  // Join the waitlist for a full slot (name/phone already collected in steps 1-2)
  const handleJoinWaitlist = async () => {
    if (!waitlistSlot) return;
    setWaitlistLoading(true);
    setWaitlistMessage(null);
    try {
      const res = await fetch('/api/events/mumt-2026/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: waitlistSlot.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaitlistMessage({ type: 'success', text: data.message || 'ลงชื่อในรายการรอเรียบร้อยแล้ว' });
        setWaitlistSlot(null);
      } else {
        setWaitlistMessage({ type: 'error', text: data.message || 'ไม่สามารถเข้ารายการรอได้' });
      }
    } catch (_err) {
      setWaitlistMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--line)]">
        <h1 className="text-3xl font-black text-[var(--ink)] sm:text-4xl">
          ลงทะเบียนบริจาคโลหิตออนไลน์
        </h1>
        <p className="mt-2 text-[15px] text-[var(--muted)] font-medium leading-relaxed">
          กรอกข้อมูลและเลือกรอบเวลาเดินทาง เพื่อรับ QR Code สำหรับแสดงในวันงาน
        </p>
      </div>

      {/* Asymmetric 2-Column Desktop Form Shell */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Progress Column (4 Cols) */}
        <div className="md:col-span-4 editorial-card p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
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
            <div className={`p-3 rounded-lg border text-sm font-bold transition-all flex items-center gap-3 ${
              step === 1 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)]' : step > 1 ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-400'
            }`}>
              <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold">01</span>
              <span>1. ข้อมูลส่วนตัว</span>
            </div>

            <div className={`p-3 rounded-lg border text-sm font-bold transition-all flex items-center gap-3 ${
              step === 2 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)]' : step > 2 ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-400'
            }`}>
              <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold">02</span>
              <span>2. สังกัดและคณะ</span>
            </div>

            <div className={`p-3 rounded-lg border text-sm font-bold transition-all flex items-center gap-3 ${
              step === 3 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)]' : 'border-gray-100 text-gray-400'
            }`}>
              <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold">03</span>
              <span>3. รอบเวลาเดินทาง</span>
            </div>
          </div>
        </div>

        {/* Right Form Control Column (8 Cols) */}
        <div className="md:col-span-8 editorial-card p-6 sm:p-8">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-[var(--danger-bg)] border border-[#E8B9C1] text-sm font-bold text-[var(--danger)] flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: PERSONAL INFO */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-sm font-black text-[var(--burgundy-700)] uppercase tracking-wider border-b border-[var(--rose-100)] pb-2">
                  01. ข้อมูลผู้ลงทะเบียน
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-firstName" className="block text-xs font-bold text-editorial-ink mb-1.5">
                      ชื่อจริง <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="reg-firstName"
                      type="text"
                      required
                      placeholder="เช่น สมชาย"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="editorial-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-lastName" className="block text-xs font-bold text-editorial-ink mb-1.5">
                      นามสกุล <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="reg-lastName"
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
                  <label htmlFor="reg-phone" className="block text-xs font-bold text-editorial-ink mb-1.5">
                    เบอร์โทรศัพท์มือถือ <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="เช่น 0812345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="editorial-input"
                  />
                  <p className="mt-1 text-[11px] text-editorial-muted font-medium">
                    * ใช้สำหรับค้นหาประวัติการลงทะเบียนกรณีลืม QR Code{" "}
                    <Link href="/lookup" className="font-bold text-[var(--burgundy-700)] hover:underline">
                      (ลืม QR Code? ค้นหาที่นี่)
                    </Link>
                  </p>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-bold text-editorial-ink mb-1.5">
                    อีเมล <span className="text-gray-400 font-medium">(ไม่บังคับ)</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="เช่น somchai@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="editorial-input"
                  />
                  <p className="mt-1 text-[11px] text-editorial-muted font-medium">
                    * ระบบจะส่งอีเมลยืนยันพร้อม QR Code ให้ที่อีเมลนี้ (ถ้าระบุ)
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: FACULTY & AFFILIATION */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-sm font-black text-[var(--burgundy-700)] uppercase tracking-wider border-b border-[var(--rose-100)] pb-2">
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
                            ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)]'
                            : 'border-gray-200 hover:border-gray-300 text-editorial-ink'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-faculty" className="block text-xs font-bold text-editorial-ink mb-1.5">
                    คณะ / หน่วยงาน <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="reg-faculty"
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
                    <label htmlFor="reg-academicYear" className="block text-xs font-bold text-editorial-ink mb-1.5">
                      ชั้นปีการศึกษา <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="reg-academicYear"
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

                <div>
                  <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                    ประสบการณ์การบริจาค <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'FIRST_TIME', label: 'บริจาคครั้งแรก', icon: Sparkles },
                      { id: 'RETURNING', label: 'เคยบริจาคแล้ว', icon: Heart },
                    ].map((exp) => {
                      const ExpIcon = exp.icon;
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, donationExperience: exp.id })}
                          className={`p-3 rounded-lg border text-center text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            formData.donationExperience === exp.id
                              ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)]'
                              : 'border-gray-200 hover:border-gray-300 text-[var(--ink)]'
                          }`}
                        >
                          <ExpIcon className="h-4 w-4" />
                          {exp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: TIME SLOT SELECTION (TIMETABLE LIST) */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-sm font-black text-[var(--burgundy-700)] uppercase tracking-wider border-b border-[var(--rose-100)] pb-2">
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
                          onClick={() => {
                            if (isFull) {
                              setWaitlistMessage(null);
                              setWaitlistSlot(slot);
                            } else {
                              setFormData({ ...formData, timeSlotId: slot.id });
                            }
                          }}
                          className={`w-full p-3.5 rounded-lg border text-left text-xs font-bold transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-1 ring-[var(--burgundy-700)]'
                              : isFull
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                              : 'border-gray-200 bg-white hover:border-[var(--burgundy-700)] text-editorial-ink'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className={`h-4 w-4 ${isSelected ? 'text-[var(--burgundy-700)]' : 'text-gray-400'}`} />
                            <span className="text-sm font-black">{slot.timeSlot}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {isFull ? (
                              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                เต็มแล้ว · คลิกเข้ารายการรอ
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
                              <div className="h-5 w-5 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* PRIVACY CONSENT (required — matches server-side Zod schema) */}
                <label className="mt-4 flex items-start gap-2.5 p-3.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-[var(--burgundy-700)]"
                  />
                  <span className="text-[11px] leading-relaxed font-medium text-editorial-muted">
                    ข้าพเจ้ายอมรับและเข้าใจว่า ข้อมูลส่วนตัวของข้าพเจ้าจะถูกใช้เพื่อการจัดการลงทะเบียน
                    การติดต่อกลับ และบันทึกประวัติการบริจาคโลหิตในกิจกรรมนี้เท่านั้น
                    <span className="text-red-600 font-bold">*</span>
                  </span>
                </label>
              </div>
            )}

            {/* WIZARD ACTIONS */}
            <div className="pt-6 border-t border-[var(--line)] flex items-center justify-between">
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
                  className="editorial-btn-primary text-xs py-3.5 px-6 ml-auto"
                >
                  <span>ถัดไป</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="editorial-btn-primary text-xs py-3.5 px-8 ml-auto"
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

      {/* WAITLIST CONFIRMATION MODAL (for full slots) */}
      {waitlistSlot && (
        <WaitlistDialog
          slotLabel={waitlistSlot.timeSlot}
          firstName={formData.firstName}
          lastName={formData.lastName}
          phone={formData.phone}
          loading={waitlistLoading}
          message={waitlistMessage}
          onConfirm={handleJoinWaitlist}
          onClose={() => {
            setWaitlistSlot(null);
            setWaitlistMessage(null);
          }}
        />
      )}

    </div>
  );
}

function WaitlistDialog({
  slotLabel,
  firstName,
  lastName,
  phone,
  loading,
  message,
  onConfirm,
  onClose,
}: {
  slotLabel: string;
  firstName: string;
  lastName: string;
  phone: string;
  loading: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  // Accessible modal: role="dialog" + aria-modal, Escape to close, focus trap,
  // initial focus inside, and focus restore to the trigger on close.
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const lastFocused = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    lastFocused.current = document.activeElement as HTMLElement | null;

    // Initial focus on the dialog (first focusable control = close button)
    const t = setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    // Escape to close
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);

    // Focus trap: Tab / Shift+Tab cycle within the dialog
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      // If focus sits on the dialog root (initial focus), direct it into the
      // dialog instead of letting it escape.
      if (active === dialog) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);

    // Restore focus to the trigger when unmounting
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keydown', trap);
      lastFocused.current?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-dialog-title"
      aria-describedby="waitlist-dialog-desc"
      ref={dialogRef}
      tabIndex={-1}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-[var(--burgundy-600)] uppercase">WAITLIST</span>
          <h3 id="waitlist-dialog-title" className="text-lg font-black text-editorial-ink">
            รอบ {slotLabel} น. เต็มแล้ว
          </h3>
          <p id="waitlist-dialog-desc" className="text-xs text-editorial-muted font-medium leading-relaxed">
            ลงชื่อไว้ในรายการรอ — หากมีผู้ยกเลิก ระบบจะเปิดที่ว่างให้อัตโนมัติ เจ้าหน้าที่จะติดต่อกลับทางโทรศัพท์
          </p>
        </div>

        <div className="rounded-lg bg-[var(--bg)] border border-[var(--line)] p-3 text-xs space-y-1">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500 font-bold">ชื่อ</span>
            <span className="font-black text-editorial-ink">{firstName} {lastName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500 font-bold">เบอร์โทร</span>
            <span className="font-mono font-black text-editorial-ink">{phone}</span>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-xs font-bold border ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="editorial-btn-secondary text-xs py-2 px-4"
          >
            กลับไปก่อน
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="editorial-btn-primary text-xs py-2 px-4"
          >
            {loading ? 'กำลังลงชื่อ...' : 'ยืนยันเข้ารายการรอ'}
          </button>
        </div>
      </div>
    </div>
  );
}
