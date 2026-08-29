'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Clock, Check, ArrowRight, ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { MAHIDOL_FACULTIES, ACADEMIC_YEARS } from '@/lib/constants/mahidol';
import { formatTimeRange } from '@/lib/utils/format';
import { isTimeSlotSelectable } from '@/lib/registration/slot-availability';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';

const PARTICIPANT_TYPES = [
  { id: 'STUDENT', name: 'นักศึกษา ม.มหิดล', enName: 'Mahidol Student' },
  { id: 'STAFF', name: 'บุคลากร ม.มหิดล', enName: 'Mahidol Staff' },
  { id: 'GENERAL_PUBLIC', name: 'บุคคลทั่วไป', enName: 'General Public' },
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
          setErrorMessage('ไม่สามารถโหลดข้อมูลช่วงเวลาได้ กรุณาลองใหม่อีกครั้ง (Unable to load time slots)');
        }
      } catch {
        setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย (Network connection error)');
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, []);

  // Validation
  const validateStep1 = () => {
    if (!formData.firstName.trim()) return 'กรุณากรอกชื่อจริง (Please enter first name)';
    if (!formData.lastName.trim()) return 'กรุณากรอกนามสกุล (Please enter last name)';
    if (!formData.phone.trim()) return 'กรุณากรอกเบอร์โทรศัพท์ (Please enter phone number)';
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 10) return 'กรุณากรอกเบอร์โทรศัพท์ 9-10 หลักให้ถูกต้อง (Please enter valid 9-10 digit phone number)';
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) return 'กรุณากรอกอีเมลให้ถูกต้อง หรือเว้นว่างไว้ (Please enter valid email)';
    }
    return null;
  };

  const validateStep2 = () => {
    if (!formData.participantType) return 'กรุณาเลือกประเภทผู้เข้าร่วม (Please select participant type)';
    if (formData.participantType !== 'GENERAL_PUBLIC' && (!formData.faculty || formData.faculty === '')) {
      return 'กรุณาเลือกคณะ / หน่วยงาน (Please select faculty or organization)';
    }
    if (formData.participantType === 'STUDENT' && !formData.academicYear) {
      return 'กรุณาเลือกระดับชั้นปีการศึกษา (Please select academic year)';
    }
    if (!formData.donationExperience) return 'กรุณาเลือกประสบการณ์การบริจาค (Please select donation experience)';
    return null;
  };

  const validateStep3 = () => {
    if (!formData.timeSlotId) return 'กรุณาเลือกรอบเวลาที่ต้องการเดินทางมาถึง (Please select arrival time slot)';
    if (!formData.privacyAccepted) return 'กรุณายอมรับประกาศความเป็นส่วนตัวเพื่อดำเนินการต่อ (Please accept privacy notice)';
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
    } catch {
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
    } catch {
      setWaitlistMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <>
    {loading && <LoadingOverlay variant="donor-register" />}
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--line)]">
        <h1 className="text-2xl font-black text-[var(--ink)] sm:text-4xl flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span>ลงทะเบียนบริจาคโลหิตออนไลน์</span>
          <span className="text-base sm:text-xl font-bold text-gray-500 font-sans">/ Online Blood Donation Registration</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)] font-medium leading-relaxed">
          กรอกข้อมูลและเลือกรอบเวลาเดินทาง เพื่อรับ QR Code สำหรับแสดงในวันงาน
          <span className="block text-xs text-gray-400 mt-0.5">(Fill in your details and choose an arrival time slot to receive your check-in QR Code)</span>
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
            <h2 className="text-base sm:text-lg font-black text-editorial-ink">
              {step === 1 && 'ข้อมูลส่วนตัว / Personal Info'}
              {step === 2 && 'สังกัดและคณะ / Affiliation'}
              {step === 3 && 'รอบเวลาเดินทาง / Time Slot'}
            </h2>
            <p className="text-xs text-editorial-muted">ใช้เวลาลงทะเบียนประมาณ 2 นาที (Takes ~2 mins)</p>
          </div>

          {/* Step Progress Indicators */}
          <div className="space-y-3 pt-2">
            <div className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
              step === 1 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs' : step > 1 ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-400'
            }`}>
              <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">01</span>
              <div>
                <p className="font-black text-gray-900">1. ข้อมูลส่วนตัว</p>
                <p className="text-[10px] text-gray-500 font-normal">Personal Information</p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
              step === 2 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs' : step > 2 ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-400'
            }`}>
              <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">02</span>
              <div>
                <p className="font-black text-gray-900">2. สังกัดและคณะ</p>
                <p className="text-[10px] text-gray-500 font-normal">Affiliation & Faculty</p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
              step === 3 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs' : 'border-gray-100 text-gray-400'
            }`}>
              <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">03</span>
              <div>
                <p className="font-black text-gray-900">3. รอบเวลาเดินทาง</p>
                <p className="text-[10px] text-gray-500 font-normal">Arrival Time Slot</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Control Column (8 Cols) */}
        <div className="md:col-span-8 editorial-card p-6 sm:p-8">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--danger-bg)] border border-[#E8B9C1] text-sm font-bold text-[var(--danger)] flex items-start gap-2.5 shadow-xs">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: PERSONAL INFO */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="border-b border-[var(--rose-100)] pb-2 flex items-baseline justify-between">
                  <h3 className="text-sm font-black text-[var(--burgundy-700)] uppercase tracking-wider">
                    01. ข้อมูลผู้ลงทะเบียน <span className="text-xs text-gray-500 font-normal">/ Personal Information</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-firstName" className="block text-xs font-bold text-editorial-ink mb-1.5">
                      ชื่อจริง <span className="text-gray-500 font-normal">/ First Name</span> <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="reg-firstName"
                      type="text"
                      required
                      placeholder="เช่น สมชาย (e.g. Somchai)"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="editorial-input text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-lastName" className="block text-xs font-bold text-editorial-ink mb-1.5">
                      นามสกุล <span className="text-gray-500 font-normal">/ Last Name</span> <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="reg-lastName"
                      type="text"
                      required
                      placeholder="เช่น ใจดี (e.g. Jaidee)"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="editorial-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-bold text-editorial-ink mb-1.5">
                    เบอร์โทรศัพท์มือถือ <span className="text-gray-500 font-normal">/ Mobile Phone</span> <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="เช่น 0812345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="editorial-input text-sm font-mono"
                  />
                  <p className="mt-1.5 text-[11px] text-editorial-muted font-medium">
                    * ใช้สำหรับค้นหาประวัติการลงทะเบียนกรณีลืม QR Code{" "}
                    <Link href="/lookup" className="font-bold text-[var(--burgundy-700)] hover:underline inline-flex items-center gap-0.5">
                      (ลืม QR Code? ค้นหาที่นี่ / Forgot Pass?)
                    </Link>
                  </p>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-bold text-editorial-ink mb-1.5">
                    อีเมล <span className="text-gray-500 font-normal">/ Email Address</span> <span className="text-gray-400 font-medium text-[11px]">(ไม่บังคับ / Optional)</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="เช่น somchai@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="editorial-input text-sm"
                  />
                  <p className="mt-1.5 text-[11px] text-editorial-muted font-medium">
                    * ระบบจะส่งอีเมลยืนยันพร้อม QR Code ให้ที่อีเมลนี้ (ถ้าระบุ) / Confirmation email with pass will be sent here
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: FACULTY & AFFILIATION */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="border-b border-[var(--rose-100)] pb-2 flex items-baseline justify-between">
                  <h3 className="text-sm font-black text-[var(--burgundy-700)] uppercase tracking-wider">
                    02. สังกัดและสถานภาพ <span className="text-xs text-gray-500 font-normal">/ Affiliation & Status</span>
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                    ประเภทผู้เข้าร่วม <span className="text-gray-500 font-normal">/ Participant Type</span> <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {PARTICIPANT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          const isGeneral = type.id === 'GENERAL_PUBLIC';
                          setFormData({ 
                            ...formData, 
                            participantType: type.id,
                            faculty: isGeneral ? 'บุคคลทั่วไป' : (formData.faculty === 'บุคคลทั่วไป' ? '' : formData.faculty),
                            academicYear: isGeneral ? '' : formData.academicYear
                          });
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          formData.participantType === type.id
                            ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-1 ring-[var(--burgundy-700)] shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 text-editorial-ink bg-white'
                        }`}
                      >
                        <p className="text-xs font-black">{type.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">{type.enName}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Faculty selector — only for Students and University Staff */}
                {formData.participantType !== 'GENERAL_PUBLIC' && (
                  <div>
                    <label htmlFor="reg-faculty" className="block text-xs font-bold text-editorial-ink mb-1.5">
                      คณะ / หน่วยงาน <span className="text-gray-500 font-normal">/ Faculty or Organization</span> <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="reg-faculty"
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      className="editorial-input text-sm"
                    >
                      <option value="">-- กรุณาเลือกคณะ / หน่วยงาน (Select Faculty/Org) --</option>
                      {MAHIDOL_FACULTIES.map((fac) => (
                        <option key={fac.code} value={fac.name}>
                          {fac.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.participantType === 'STUDENT' && (
                  <div>
                    <label htmlFor="reg-academicYear" className="block text-xs font-bold text-editorial-ink mb-1.5">
                      ชั้นปีการศึกษา <span className="text-gray-500 font-normal">/ Academic Year</span> <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="reg-academicYear"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="editorial-input text-sm"
                    >
                      <option value="">-- กรุณาเลือกระดับชั้นปี (Select Year) --</option>
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
                    ประสบการณ์การบริจาคโลหิต <span className="text-gray-500 font-normal">/ Donation Experience</span> <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'FIRST_TIME', label: 'บริจาคครั้งแรก', enLabel: 'First-time Donor', icon: Sparkles },
                      { id: 'RETURNING', label: 'เคยบริจาคแล้ว', enLabel: 'Returning Donor', icon: Heart },
                    ].map((exp) => {
                      const ExpIcon = exp.icon;
                      return (
                        <button
                          key={exp.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, donationExperience: exp.id })}
                          className={`p-3.5 rounded-xl border text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                            formData.donationExperience === exp.id
                              ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-1 ring-[var(--burgundy-700)] shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 text-[var(--ink)] bg-white'
                          }`}
                        >
                          <ExpIcon className="h-4 w-4 shrink-0" />
                          <div>
                            <span className="text-xs font-black block">{exp.label}</span>
                            <span className="text-[10px] text-gray-500 block font-normal">{exp.enLabel}</span>
                          </div>
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
                <div className="space-y-1.5 border-b border-[var(--rose-100)] pb-2">
                  <h3 className="text-sm font-black text-[var(--burgundy-700)] uppercase tracking-wider">
                    03. เลือกรอบเวลาแนะนำเดินทางมาถึง <span className="text-xs text-gray-500 font-normal">/ Arrival Time (16 Sep 2026)</span>
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    เลือกช่วงเวลาที่ท่านสะดวก เพื่อให้เจ้าหน้าที่จัดเตรียมและดูแลท่านได้อย่างรวดเร็ว
                    <span className="block text-[11px] text-gray-400 mt-0.5">(Choose your preferred arrival window to help us serve you smoothly)</span>
                  </p>
                </div>

                {/* 100 Exclusive Gifts Notice */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 font-black text-amber-950 text-xs">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>🎁 สิทธิพิเศษ: 100 ท่านแรกที่ลงทะเบียน เช็กอินภายในรอบเวลา และบริจาคสำเร็จ จะได้รับของที่ระลึกสุดพิเศษ</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    โปรดเลือกช่วงเวลาที่สะดวก และมาถึงเพื่อเช็กอินภายในรอบเวลาที่ลงทะเบียนไว้ (Exclusive souvenirs for the first 100 on-time donors!)
                  </p>
                </div>

                {slotsLoading ? (
                  <div className="py-8 text-center text-xs font-bold text-editorial-muted">
                    กำลังโหลดข้อมูลช่วงเวลา... (Loading time slots...)
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {timeSlots.map((slot) => {
                      const isSelected = formData.timeSlotId === slot.id;
                      const isSelectable = isTimeSlotSelectable(slot);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!isSelectable}
                          onClick={() => {
                            if (!isSelectable) return;
                            setFormData({ ...formData, timeSlotId: slot.id });
                          }}
                          className={`w-full p-4 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            !isSelectable
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-75'
                              :
                            isSelected
                              ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-2 ring-[var(--burgundy-700)] shadow-sm'
                              : 'border-gray-200 bg-white hover:border-[var(--burgundy-700)] text-editorial-ink'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className={`h-4.5 w-4.5 ${isSelected ? 'text-[var(--burgundy-700)]' : 'text-gray-400'}`} />
                            <div>
                              <span className="text-sm font-black block font-mono">{slot.timeSlot}</span>
                              <span className="text-[11px] font-normal text-gray-500">รอบเวลาแนะนำเดินทางมาถึง (Arrival Window)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isSelectable ? (
                              <span className="text-[11px] font-bold text-gray-400">เต็มแล้ว (Full)</span>
                            ) : isSelected ? (
                              <div className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center shadow-xs">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-400">เลือกช่วงเวลานี้ (Select)</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* PRIVACY CONSENT (required — matches server-side Zod schema) */}
                <label className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-[var(--burgundy-700)]"
                  />
                  <span className="text-[11px] leading-relaxed font-medium text-editorial-muted">
                    ข้าพเจ้ายอมรับและเข้าใจว่า ข้อมูลส่วนตัวของข้าพเจ้าจะถูกใช้เพื่อการจัดการลงทะเบียน
                    การติดต่อกลับ และบันทึกประวัติการบริจาคโลหิตในกิจกรรมนี้เท่านั้น
                    <span className="block text-[10px] text-gray-400 mt-0.5">(I agree to the Privacy Notice and consent to the use of my personal data for event management and blood donation records.)</span>
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
                  className="editorial-btn-secondary text-xs py-2.5 px-4 inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>ย้อนกลับ / Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="editorial-btn-primary text-xs py-3.5 px-6 ml-auto inline-flex items-center gap-1.5"
                >
                  <span>ถัดไป / Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="editorial-btn-primary text-xs py-3.5 px-8 ml-auto inline-flex items-center gap-1.5"
                >
                  {loading ? (
                    <span>กำลังบันทึกข้อมูล... (Saving...)</span>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 fill-white" />
                      <span>ยืนยันการลงทะเบียน / Complete</span>
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
    </>
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
            รอบ {slotLabel} เต็มแล้ว (Slot Full)
          </h3>
          <p id="waitlist-dialog-desc" className="text-xs text-editorial-muted font-medium leading-relaxed">
            ลงชื่อไว้ในรายการรอ — หากมีผู้ยกเลิก ระบบจะเปิดที่ว่างให้อัตโนมัติ เจ้าหน้าที่จะติดต่อกลับทางโทรศัพท์
            <span className="block text-[11px] text-gray-400 mt-0.5">(Join the waitlist — if a spot opens up, staff will contact you via phone.)</span>
          </p>
        </div>

        <div className="rounded-xl bg-[var(--bg)] border border-[var(--line)] p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500 font-bold">ชื่อ / Name</span>
            <span className="font-black text-editorial-ink">{firstName} {lastName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500 font-bold">เบอร์โทร / Phone</span>
            <span className="font-mono font-black text-editorial-ink">{phone}</span>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-bold border ${
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
            กลับไปก่อน / Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="editorial-btn-primary text-xs py-2 px-4"
          >
            {loading ? 'กำลังลงชื่อ... (Joining...)' : 'ยืนยันเข้ารายการรอ / Join Waitlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
