'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Clock, Check, ArrowRight, ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { MAHIDOL_FACULTIES, ACADEMIC_YEARS } from '@/lib/constants/mahidol';
import { formatTimeRange } from '@/lib/utils/format';
import { isTimeSlotSelectable } from '@/lib/registration/slot-availability';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { useLanguage, TRANSLATIONS } from '@/lib/i18n/LanguageContext';

interface TimeSlot {
  id: string;
  timeSlot: string;
  maxCapacity: number;
  currentBooked: number;
  remainingCapacity: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
}

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
  const { language, isTh, isEn } = useLanguage();
  const tReg = TRANSLATIONS.register;

  const PARTICIPANT_TYPES = [
    { id: 'STUDENT', name: tReg.typeStudent[language] },
    { id: 'STAFF', name: tReg.typeStaff[language] },
    { id: 'GENERAL_PUBLIC', name: tReg.typeGeneral[language] },
  ];

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
          setErrorMessage(tReg.errSlotLoad[language]);
        }
      } catch {
        setErrorMessage(tReg.errNetwork[language]);
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [language, tReg.errSlotLoad, tReg.errNetwork]);

  // Validation
  const validateStep1 = () => {
    if (!formData.firstName.trim()) return tReg.errFirstName[language];
    if (!formData.lastName.trim()) return tReg.errLastName[language];
    if (!formData.phone.trim()) return tReg.errPhone[language];
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 10) return tReg.errPhoneInvalid[language];
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) return tReg.errEmailInvalid[language];
    }
    return null;
  };

  const validateStep2 = () => {
    if (!formData.participantType) return tReg.errParticipantType[language];
    if (formData.participantType !== 'GENERAL_PUBLIC' && (!formData.faculty || formData.faculty === '')) {
      return tReg.errFaculty[language];
    }
    if (formData.participantType === 'STUDENT' && !formData.academicYear) {
      return tReg.errYear[language];
    }
    if (!formData.donationExperience) return tReg.errExp[language];
    return null;
  };

  const validateStep3 = () => {
    if (!formData.timeSlotId) return tReg.errSlot[language];
    if (!formData.privacyAccepted) return tReg.errPrivacy[language];
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
        setErrorMessage(data.message || data.error || (isTh ? 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง' : 'Registration error. Please try again.'));
      }
    } catch {
      setErrorMessage(tReg.errNetwork[language]);
    } finally {
      setLoading(false);
    }
  };

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
        setWaitlistMessage({ 
          type: 'success', 
          text: data.message || (isTh ? 'ลงชื่อในรายการรอเรียบร้อยแล้ว' : 'Successfully added to waitlist') 
        });
        setWaitlistSlot(null);
      } else {
        setWaitlistMessage({ 
          type: 'error', 
          text: data.message || (isTh ? 'ไม่สามารถเข้ารายการรอได้' : 'Failed to join waitlist') 
        });
      }
    } catch {
      setWaitlistMessage({ 
        type: 'error', 
        text: tReg.errNetwork[language] 
      });
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
          <h1 className="text-2xl font-black text-[var(--ink)] sm:text-4xl">
            {tReg.title[language]}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)] font-medium leading-relaxed">
            {tReg.subtitle[language]}
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
                {step === 1 && tReg.step1Title[language]}
                {step === 2 && tReg.step2Title[language]}
                {step === 3 && tReg.step3Title[language]}
              </h2>
              <p className="text-xs text-editorial-muted">
                {step === 1 && tReg.step1Sub[language]}
                {step === 2 && tReg.step2Sub[language]}
                {step === 3 && tReg.step3Sub[language]}
              </p>
            </div>

            {/* Step Progress Indicators */}
            <div className="space-y-3 pt-2">
              <div className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
                step === 1 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs' : step > 1 ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-400'
              }`}>
                <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">01</span>
                <div>
                  <p className="font-black text-gray-900">{tReg.step1Title[language]}</p>
                  <p className="text-[10px] text-gray-500 font-normal">{tReg.step1Sub[language]}</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
                step === 2 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs' : step > 2 ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-400'
              }`}>
                <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">02</span>
                <div>
                  <p className="font-black text-gray-900">{tReg.step2Title[language]}</p>
                  <p className="text-[10px] text-gray-500 font-normal">{tReg.step2Sub[language]}</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
                step === 3 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs' : 'border-gray-100 text-gray-400'
              }`}>
                <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">03</span>
                <div>
                  <p className="font-black text-gray-900">{tReg.step3Title[language]}</p>
                  <p className="text-[10px] text-gray-500 font-normal">{tReg.step3Sub[language]}</p>
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
                      {tReg.section1[language]}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-firstName" className="block text-xs font-bold text-editorial-ink mb-1.5">
                        {tReg.firstName[language]} <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="reg-firstName"
                        type="text"
                        required
                        placeholder={tReg.firstNamePlaceholder[language]}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="editorial-input text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="reg-lastName" className="block text-xs font-bold text-editorial-ink mb-1.5">
                        {tReg.lastName[language]} <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="reg-lastName"
                        type="text"
                        required
                        placeholder={tReg.lastNamePlaceholder[language]}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="editorial-input text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className="block text-xs font-bold text-editorial-ink mb-1.5">
                      {tReg.phone[language]} <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      placeholder={tReg.phonePlaceholder[language]}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="editorial-input text-sm font-mono"
                    />
                    <p className="mt-1.5 text-[11px] text-editorial-muted font-medium flex items-center flex-wrap gap-1">
                      <span>{tReg.phoneHelp[language]}</span>
                      <Link href="/lookup" className="font-bold text-[var(--burgundy-700)] hover:underline inline-flex items-center gap-0.5">
                        ({tReg.forgotPassLink[language]})
                      </Link>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-bold text-editorial-ink mb-1.5">
                      {tReg.email[language]}
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder={tReg.emailPlaceholder[language]}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="editorial-input text-sm"
                    />
                    <p className="mt-1.5 text-[11px] text-editorial-muted font-medium">
                      {tReg.emailHelp[language]}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: FACULTY & AFFILIATION */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="border-b border-[var(--rose-100)] pb-2 flex items-baseline justify-between">
                    <h3 className="text-sm font-black text-[var(--burgundy-700)] uppercase tracking-wider">
                      {tReg.section2[language]}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                      {tReg.participantType[language]} <span className="text-red-600">*</span>
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
                              faculty: isGeneral ? (isTh ? 'บุคคลทั่วไป' : 'General Public') : (formData.faculty === 'บุคคลทั่วไป' || formData.faculty === 'General Public' ? '' : formData.faculty),
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
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Faculty selector — only for Students and University Staff */}
                  {formData.participantType !== 'GENERAL_PUBLIC' && (
                    <div>
                      <label htmlFor="reg-faculty" className="block text-xs font-bold text-editorial-ink mb-1.5">
                        {tReg.faculty[language]} <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="reg-faculty"
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        className="editorial-input text-sm"
                      >
                        <option value="">-- {tReg.selectFaculty[language]} --</option>
                        {MAHIDOL_FACULTIES.map((fac) => (
                          <option key={fac.code} value={fac.name}>
                            {isEn && fac.enLabel ? fac.enLabel : fac.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.participantType === 'STUDENT' && (
                    <div>
                      <label htmlFor="reg-academicYear" className="block text-xs font-bold text-editorial-ink mb-1.5">
                        {tReg.academicYear[language]} <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="reg-academicYear"
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="editorial-input text-sm"
                      >
                        <option value="">-- {tReg.selectYear[language]} --</option>
                        {ACADEMIC_YEARS.map((yr) => (
                          <option key={yr.value} value={yr.value}>
                            {isEn && yr.enLabel ? yr.enLabel : yr.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-editorial-ink mb-1.5">
                      {tReg.donationExp[language]} <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { 
                          id: 'FIRST_TIME', 
                          title: tReg.expFirst[language], 
                          desc: tReg.expFirstDesc[language], 
                          icon: Sparkles 
                        },
                        { 
                          id: 'RETURNING', 
                          title: tReg.expRegular[language], 
                          desc: tReg.expRegularDesc[language], 
                          icon: Heart 
                        },
                      ].map((exp) => {
                        const ExpIcon = exp.icon;
                        return (
                          <button
                            key={exp.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, donationExperience: exp.id })}
                            className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                              formData.donationExperience === exp.id
                                ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-1 ring-[var(--burgundy-700)] shadow-xs'
                                : 'border-gray-200 hover:border-gray-300 text-[var(--ink)] bg-white'
                            }`}
                          >
                            <ExpIcon className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-black block">{exp.title}</span>
                              <span className="text-[11px] text-gray-500 block font-normal mt-0.5">{exp.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: TIME SLOT SELECTION */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-1.5 border-b border-[var(--rose-100)] pb-2">
                    <h3 className="text-sm font-black text-[var(--burgundy-700)] uppercase tracking-wider">
                      {tReg.section3[language]}
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      {tReg.slotNotice[language]}
                    </p>
                  </div>

                  {/* 100 Exclusive Gifts Notice */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-2 font-black text-amber-950 text-xs">
                      <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        🎁 {isTh ? 'สิทธิพิเศษ: ผู้ลงทะเบียน 100 ท่านแรกที่เช็กอินตรงเวลาและบริจาคสำเร็จ จะได้รับของที่ระลึกสุดพิเศษ' : 'Special: First 100 on-time check-in donors who complete donation will receive exclusive souvenirs'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                      {isTh ? 'โปรดเลือกช่วงเวลาที่สะดวก และมาถึงเพื่อเช็กอินภายในรอบเวลาที่ลงทะเบียนไว้' : 'Please select your preferred time slot and arrive for check-in on time.'}
                    </p>
                  </div>

                  {slotsLoading ? (
                    <div className="py-8 text-center text-xs font-bold text-editorial-muted">
                      {tReg.errSlotLoad[language]}
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
                                : isSelected
                                ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-2 ring-[var(--burgundy-700)] shadow-sm'
                                : 'border-gray-200 bg-white hover:border-[var(--burgundy-700)] text-editorial-ink'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Clock className={`h-4.5 w-4.5 ${isSelected ? 'text-[var(--burgundy-700)]' : 'text-gray-400'}`} />
                              <div>
                                <span className="text-sm font-black block font-mono">{slot.timeSlot}</span>
                                <span className="text-[11px] font-normal text-gray-500">
                                  {isTh ? 'รอบเวลาแนะนำเดินทางมาถึง' : 'Recommended Arrival Window'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isSelectable ? (
                                <span className="text-[11px] font-bold text-gray-400">{isTh ? 'เต็มแล้ว' : 'Full'}</span>
                              ) : isSelected ? (
                                <div className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center shadow-xs">
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                              ) : (
                                <span className="text-[11px] font-bold text-gray-400">{isTh ? 'เลือกช่วงเวลานี้' : 'Select'}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* PRIVACY CONSENT */}
                  <label className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.privacyAccepted}
                      onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                      className="mt-0.5 h-4 w-4 accent-[var(--burgundy-700)]"
                    />
                    <span className="text-[11px] leading-relaxed font-medium text-editorial-muted">
                      {tReg.privacyNotice.accept[language]}
                      <span className="text-red-600 font-bold ml-1">*</span>
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
                    className="editorial-btn-secondary text-xs py-2.5 px-4 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{tReg.btnBack[language]}</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="editorial-btn-primary text-xs py-3.5 px-6 ml-auto inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{tReg.btnNext[language]}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="editorial-btn-primary text-xs py-3.5 px-8 ml-auto inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading ? (
                      <span>{tReg.btnSubmitting[language]}</span>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 fill-white" />
                        <span>{tReg.btnSubmit[language]}</span>
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
  const { isTh } = useLanguage();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const lastFocused = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);

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
            {isTh ? `รอบ ${slotLabel} เต็มแล้ว` : `Time Slot ${slotLabel} is Full`}
          </h3>
          <p id="waitlist-dialog-desc" className="text-xs text-editorial-muted font-medium leading-relaxed">
            {isTh
              ? 'ลงชื่อไว้ในรายการรอ — หากมีผู้ยกเลิก ระบบจะเปิดที่ว่างให้อัตโนมัติ เจ้าหน้าที่จะติดต่อกลับทางโทรศัพท์'
              : 'Join the waitlist — if a spot opens up, staff will contact you by phone.'}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--bg)] border border-[var(--line)] p-3.5 text-xs space-y-1.5">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500 font-bold">{isTh ? 'ชื่อ' : 'Name'}</span>
            <span className="font-black text-editorial-ink">{firstName} {lastName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500 font-bold">{isTh ? 'เบอร์โทร' : 'Phone'}</span>
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
            className="editorial-btn-secondary text-xs py-2 px-4 cursor-pointer"
          >
            {isTh ? 'กลับไปก่อน' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="editorial-btn-primary text-xs py-2 px-4 cursor-pointer"
          >
            {loading 
              ? (isTh ? 'กำลังลงชื่อ...' : 'Joining...') 
              : (isTh ? 'ยืนยันเข้ารายการรอ' : 'Join Waitlist')}
          </button>
        </div>
      </div>
    </div>
  );
}
