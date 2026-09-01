'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, Clock, Check, ArrowRight, ArrowLeft, Sparkles, AlertTriangle, User, ShieldCheck, MapPin, Building, Calendar, CheckCircle2, Edit3 } from 'lucide-react';
import { MAHIDOL_FACULTIES, ACADEMIC_YEARS } from '@/lib/constants/mahidol';
import { formatTimeRange, formatBangkokTime, isEventDay } from '@/lib/utils/format';
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

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, isTh, isEn } = useLanguage();
  const tReg = TRANSLATIONS.register;

  // Determine if Walk-in mode is active (either event day 2026-09-16 or ?mode=walkin)
  const isWalkInQuery = searchParams.get('mode') === 'walkin';
  const isWalkInMode = isWalkInQuery || isEventDay();

  const totalSteps = isWalkInMode ? 3 : 4;

  const PARTICIPANT_TYPES = [
    { id: 'STUDENT', name: tReg.typeStudent[language] },
    { id: 'STAFF', name: tReg.typeStaff[language] },
    { id: 'GENERAL_PUBLIC', name: tReg.typeGeneral[language] },
  ];

  // Wizard state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(!isWalkInMode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available Time Slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Waitlist (for full slots)
  const [waitlistSlot, setWaitlistSlot] = useState<TimeSlot | null>(null);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PR Channel state
  const [selectedPrChannel, setSelectedPrChannel] = useState<string>('');
  const [customPrChannel, setCustomPrChannel] = useState<string>('');

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
    prChannel: '',
    timeSlotId: '',
    privacyAccepted: false,
  });

  // Fetch Time Slots on Mount (if advance mode)
  useEffect(() => {
    if (isWalkInMode) return;

    let ignore = false;
    async function fetchSlots() {
      try {
        const res = await fetch('/api/events/mumt-2026/slots', { cache: 'no-store' });
        if (ignore) return;
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
        if (!ignore) setErrorMessage(tReg.errNetwork[language]);
      } finally {
        if (!ignore) setSlotsLoading(false);
      }
    }
    fetchSlots();
    return () => { ignore = true; };
  }, [isWalkInMode, language, tReg.errSlotLoad, tReg.errNetwork]);

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
    if (isWalkInMode && !formData.privacyAccepted) {
      return tReg.errPrivacy[language];
    }
    return null;
  };

  const validateStep3Advance = () => {
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
    } else if (step === 3 && !isWalkInMode) {
      const err = validateStep3Advance();
      if (err) return setErrorMessage(err);
      setStep(4);
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isWalkInMode) {
      const err = validateStep2();
      if (err) return setErrorMessage(err);
    } else {
      const err = validateStep3Advance();
      if (err) return setErrorMessage(err);
    }

    setLoading(true);
    try {
      const { timeSlotId, ...rest } = formData;
      const payload = {
        ...rest,
        slotId: isWalkInMode ? undefined : timeSlotId,
        source: isWalkInMode ? 'WALK_IN' : 'ONLINE',
      };
      const res = await fetch('/api/events/mumt-2026/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const regCode = data.registration?.registrationCode || data.registration?.registration_code;
      if (res.ok && data.success && regCode) {
        router.push(`/registration/${regCode}`);
      } else {
        setErrorMessage(data.message || data.error || (isTh ? 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง' : 'Registration error. Please try again.'));
        setLoading(false);
      }
    } catch {
      setErrorMessage(tReg.errNetwork[language]);
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

  const selectedSlotObj = timeSlots.find(s => s.id === formData.timeSlotId);

  return (
    <>
      {loading && <LoadingOverlay variant="donor-register" />}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        
        {/* Header Banner */}
        <div className="mb-8 pb-6 border-b border-[var(--line)]">
          <div className="flex items-center gap-2 mb-2.5">
            {isWalkInMode ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] text-white shadow-sm shadow-red-950/20 border border-white/20">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                <span>{tReg.walkinBadge[language]}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] text-white shadow-sm shadow-red-950/20 border border-white/20 hover:shadow-md transition-all">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <Calendar className="h-3.5 w-3.5 text-white" />
                <span className="font-bold tracking-normal">{isTh ? 'ลงทะเบียนล่วงหน้า' : 'Advance Registration'}</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-[var(--ink)] sm:text-4xl font-display">
            {isWalkInMode ? tReg.walkinTitle[language] : tReg.title[language]}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)] font-medium leading-relaxed">
            {isWalkInMode ? tReg.walkinSubtitle[language] : tReg.subtitle[language]}
          </p>
        </div>

        {/* Asymmetric 2-Column Desktop Form Shell */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Progress Column (Desktop Only — 4 Cols) */}
          <div className="hidden md:block md:col-span-4 editorial-card p-6 space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                STEP {step} OF {totalSteps}
              </span>
              <h2 className="text-base sm:text-lg font-black text-editorial-ink">
                {step === 1 && tReg.step1Title[language]}
                {step === 2 && tReg.step2Title[language]}
                {step === 3 && (isWalkInMode ? tReg.stepReviewTitle[language] : tReg.step3Title[language])}
                {step === 4 && tReg.stepReviewTitle[language]}
              </h2>
              <p className="text-xs text-editorial-muted">
                {step === 1 && tReg.step1Sub[language]}
                {step === 2 && tReg.step2Sub[language]}
                {step === 3 && (isWalkInMode ? tReg.stepReviewSub[language] : tReg.step3Sub[language])}
                {step === 4 && tReg.stepReviewSub[language]}
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

              {!isWalkInMode && (
                <div className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
                  step === 3 ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs' : step > 3 ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-gray-100 text-gray-400'
                }`}>
                  <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">03</span>
                  <div>
                    <p className="font-black text-gray-900">{tReg.step3Title[language]}</p>
                    <p className="text-[10px] text-gray-500 font-normal">{tReg.step3Sub[language]}</p>
                  </div>
                </div>
              )}

              <div className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${
                (isWalkInMode ? step === 3 : step === 4) ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs' : 'border-gray-100 text-gray-400'
              }`}>
                <span className="h-6 w-6 rounded-full bg-[var(--burgundy-700)] text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">
                  {isWalkInMode ? '03' : '04'}
                </span>
                <div>
                  <p className="font-black text-gray-900">{tReg.stepReviewTitle[language]}</p>
                  <p className="text-[10px] text-gray-500 font-normal">{tReg.stepReviewSub[language]}</p>
                </div>
              </div>
            </div>

            {/* Quick Find My Pass Link */}
            <div className="pt-4 border-t border-[var(--line)]">
              <Link
                href="/lookup"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--burgundy-700)] hover:underline"
              >
                <span>🔍 {isTh ? 'เคยลงทะเบียนแล้ว? ค้นหาตั๋ว/QR' : 'Already registered? Find pass'}</span>
              </Link>
            </div>
          </div>

          {/* Right Form Control Column (8 Cols on desktop, full width on mobile) */}
          <div className="md:col-span-8 editorial-card p-5 sm:p-8">
            
            {/* Mobile-Only Compact Step Indicator (Takes only ~40px height, ensures form is immediately visible above the fold on mobile) */}
            <div className="block md:hidden mb-5 pb-3.5 border-b border-[var(--line)]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-[var(--burgundy-700)]">
                  {isTh ? `ขั้นตอนที่ ${step} จาก ${totalSteps}` : `Step ${step} of ${totalSteps}`}
                </span>
                <span className="font-bold text-[var(--ink)] text-right truncate max-w-[210px]">
                  {step === 1 && tReg.step1Title[language]}
                  {step === 2 && tReg.step2Title[language]}
                  {step === 3 && (isWalkInMode ? tReg.stepReviewTitle[language] : tReg.step3Title[language])}
                  {step === 4 && tReg.stepReviewTitle[language]}
                </span>
              </div>
              <div className={`grid ${totalSteps === 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-1.5 h-1.5 w-full`}>
                {Array.from({ length: totalSteps }).map((_, idx) => {
                  const stepNum = idx + 1;
                  return (
                    <div
                      key={stepNum}
                      className={`h-full rounded-full transition-all duration-300 ${
                        step >= stepNum ? 'bg-[var(--burgundy-700)]' : 'bg-gray-200'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
            
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-[var(--danger-bg)] border border-[#E8B9C1] text-sm font-bold text-[var(--danger)] flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: PERSONAL INFO */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-[var(--rose-100)] pb-2 flex items-baseline justify-between">
                    <h3 className="text-sm font-bold text-[var(--burgundy-700)] uppercase tracking-wider font-mono">
                      {tReg.section1[language]}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor="reg-firstName" className="block text-xs font-bold text-gray-700 mb-1">
                        {tReg.firstName[language]} <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="reg-firstName"
                        type="text"
                        required
                        placeholder={tReg.firstNamePlaceholder[language]}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="editorial-input text-sm py-2.5 px-3 rounded-xl"
                      />
                    </div>

                    <div>
                      <label htmlFor="reg-lastName" className="block text-xs font-bold text-gray-700 mb-1">
                        {tReg.lastName[language]} <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="reg-lastName"
                        type="text"
                        required
                        placeholder={tReg.lastNamePlaceholder[language]}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="editorial-input text-sm py-2.5 px-3 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className="block text-xs font-bold text-gray-700 mb-1">
                      {tReg.phone[language]} <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      placeholder={tReg.phonePlaceholder[language]}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="editorial-input text-sm font-mono py-2.5 px-3 rounded-xl"
                    />
                    <p className="mt-1 text-[11px] text-editorial-muted font-medium flex items-center flex-wrap gap-1">
                      <span>{tReg.phoneHelp[language]}</span>
                      <Link href="/lookup" className="font-bold text-[var(--burgundy-700)] hover:underline inline-flex items-center gap-0.5">
                        ({tReg.forgotPassLink[language]})
                      </Link>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-bold text-gray-700 mb-1">
                      {tReg.email[language]}
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder={tReg.emailPlaceholder[language]}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="editorial-input text-sm py-2.5 px-3 rounded-xl"
                    />
                    <p className="mt-1 text-[11px] text-editorial-muted font-medium">
                      {tReg.emailHelp[language]}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: FACULTY & AFFILIATION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-[var(--rose-100)] pb-2 flex items-baseline justify-between">
                    <h3 className="text-sm font-bold text-[var(--burgundy-700)] uppercase tracking-wider font-mono">
                      {tReg.section2[language]}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
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
                          className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center min-h-[46px] ${
                            formData.participantType === type.id
                              ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-1.5 ring-[var(--burgundy-700)] shadow-2xs font-bold'
                              : 'border-gray-200 hover:border-gray-300 text-editorial-ink bg-white font-medium'
                          }`}
                        >
                          <span className="text-xs sm:text-[13px] leading-tight break-words">{type.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Faculty selector — only for Students and University Staff */}
                  {formData.participantType !== 'GENERAL_PUBLIC' && (
                    <div>
                      <label htmlFor="reg-faculty" className="block text-xs font-bold text-gray-700 mb-1">
                        {tReg.faculty[language]} <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="reg-faculty"
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        className="editorial-input text-xs sm:text-sm py-2.5 px-3 rounded-xl"
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
                      <label htmlFor="reg-academicYear" className="block text-xs font-bold text-gray-700 mb-1">
                        {tReg.academicYear[language]} <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="reg-academicYear"
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="editorial-input text-xs sm:text-sm py-2.5 px-3 rounded-xl"
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
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
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
                                ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-1.5 ring-[var(--burgundy-700)] shadow-2xs'
                                : 'border-gray-200 hover:border-gray-300 text-[var(--ink)] bg-white'
                            }`}
                          >
                            <ExpIcon className="h-4 w-4 shrink-0 mt-0.5 text-[var(--burgundy-700)]" />
                            <div>
                              <span className="text-xs sm:text-sm font-bold block leading-snug">{exp.title}</span>
                              <span className="text-[11px] text-gray-500 block font-normal mt-0.5 leading-normal">{exp.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PR Source / Acquisition Channel (Optional) */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700">
                        {tReg.prSource[language]}
                      </label>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {tReg.prSourceOptional[language]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'Instagram', label: 'Instagram', icon: '📸' },
                        { id: 'Facebook', label: 'Facebook', icon: '📘' },
                        { id: 'LINE', label: 'LINE / OpenChat', icon: '💬' },
                        { id: 'TikTok', label: 'TikTok', icon: '🎵' },
                        { id: 'Poster', label: isTh ? 'โปสเตอร์ / ป้าย' : 'Poster / Banner', icon: '📢' },
                        { id: 'PR_Walk', label: isTh ? 'ขบวนเดิน PR ในมอ' : 'On-campus PR', icon: '🚶' },
                        { id: 'Referral', label: isTh ? 'เพื่อน / คนรู้จัก' : 'Friend Referral', icon: '👥' },
                        { id: 'Other', label: isTh ? 'อื่นๆ' : 'Other', icon: '🌐' },
                      ].map((pr) => {
                        const isSelected = selectedPrChannel === pr.id;
                        return (
                          <button
                            key={pr.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedPrChannel('');
                                setFormData({ ...formData, prChannel: '' });
                              } else {
                                setSelectedPrChannel(pr.id);
                                if (pr.id !== 'Other') {
                                  setFormData({ ...formData, prChannel: pr.id });
                                } else {
                                  setFormData({ ...formData, prChannel: customPrChannel.trim() || (isTh ? 'อื่นๆ' : 'Other') });
                                }
                              }
                            }}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                              isSelected
                                ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-1.5 ring-[var(--burgundy-700)] shadow-2xs font-black'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm">{pr.icon}</span>
                            <span className="truncate">{pr.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedPrChannel === 'Other' && (
                      <div className="mt-2.5 animate-in fade-in-50 duration-150">
                        <input
                          type="text"
                          value={customPrChannel}
                          onChange={(e) => {
                            setCustomPrChannel(e.target.value);
                            setFormData({ ...formData, prChannel: e.target.value.trim() || (isTh ? 'อื่นๆ' : 'Other') });
                          }}
                          placeholder={tReg.prOtherPlaceholder[language]}
                          maxLength={100}
                          className="editorial-input text-xs sm:text-sm py-2 px-3 rounded-xl"
                        />
                      </div>
                    )}
                  </div>

                  {/* If Walk-in mode, show PDPA Consent here in Step 2 (Frameless) */}
                  {isWalkInMode && (
                    <div className="mt-5 pt-4 border-t border-[var(--rose-100)] space-y-2.5">
                      <div className="flex items-start gap-2 text-[var(--burgundy-700)]">
                        <ShieldCheck className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                        <h4 className="text-xs font-bold text-gray-900">
                          {tReg.privacyNotice.title[language]}
                        </h4>
                      </div>
                      <p className="text-[11.5px] text-gray-600 leading-relaxed break-words pl-6.5">
                        {tReg.privacyNotice.body[language]}
                      </p>

                      <label className="flex items-start gap-2.5 pt-1 pl-6.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.privacyAccepted}
                          onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                          className="mt-0.5 h-4 w-4 accent-[var(--burgundy-700)] shrink-0 rounded cursor-pointer"
                        />
                        <span className="text-xs leading-relaxed font-bold text-gray-800 break-words">
                          {tReg.privacyNotice.accept[language]}
                          <span className="text-red-600 font-bold ml-1">*</span>
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: TIME SLOT SELECTION (Advance Mode Only) */}
              {!isWalkInMode && step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1 border-b border-[var(--rose-100)] pb-2">
                    <h3 className="text-sm font-bold text-[var(--burgundy-700)] uppercase tracking-wider font-mono">
                      {tReg.section3[language]}
                    </h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed break-words">
                      {tReg.slotNotice[language]}
                    </p>
                  </div>

                  {slotsLoading ? (
                    <div className="py-6 text-center text-xs font-bold text-editorial-muted">
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
                            className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                              !isSelectable
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-75'
                                : isSelected
                                ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] ring-1.5 ring-[var(--burgundy-700)] shadow-2xs'
                                : 'border-gray-200 bg-white hover:border-[var(--burgundy-700)] text-editorial-ink'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Clock className={`h-4.5 w-4.5 ${isSelected ? 'text-[var(--burgundy-700)]' : 'text-gray-400'}`} />
                              <div>
                                <span className="text-sm font-bold block font-mono">{slot.timeSlot}</span>
                                <span className="text-[11px] font-normal text-gray-500 block">
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

                  {/* PRIVACY CONSENT - Frameless */}
                  <div className="mt-5 pt-4 border-t border-[var(--rose-100)] space-y-2.5">
                    <div className="flex items-start gap-2 text-[var(--burgundy-700)]">
                      <ShieldCheck className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <h4 className="text-xs font-bold text-gray-900">
                        {tReg.privacyNotice.title[language]}
                      </h4>
                    </div>
                    <p className="text-[11.5px] text-gray-600 leading-relaxed break-words pl-6.5">
                      {tReg.privacyNotice.body[language]}
                    </p>

                    <label className="flex items-start gap-2.5 pt-1 pl-6.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.privacyAccepted}
                        onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                        className="mt-0.5 h-4 w-4 accent-[var(--burgundy-700)] shrink-0 rounded cursor-pointer"
                      />
                      <span className="text-xs leading-relaxed font-bold text-gray-800 break-words">
                        {tReg.privacyNotice.accept[language]}
                        <span className="text-red-600 font-bold ml-1">*</span>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* FINAL STEP: REVIEW & CONFIRMATION SUMMARY */}
              {((isWalkInMode && step === 3) || (!isWalkInMode && step === 4)) && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  <div className="space-y-1 border-b border-[var(--rose-100)] pb-2.5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--burgundy-700)] uppercase font-mono">
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                      <span>{tReg.reviewHeading[language]}</span>
                    </h3>
                    <p className="text-xs text-[var(--muted)] font-medium leading-relaxed break-words">
                      {tReg.reviewPrompt[language]}
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 sm:p-5 space-y-4 shadow-2xs">
                    
                    {/* Section: Donor Info */}
                    <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                          {isTh ? 'ผู้ลงทะเบียนบริจาค' : 'Donor Information'}
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-[var(--ink)] flex items-center gap-2 break-words">
                          <User className="h-4 w-4 text-[var(--burgundy-700)] shrink-0" />
                          <span>{formData.firstName} {formData.lastName}</span>
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[var(--muted)] flex-wrap pt-0.5">
                          <span className="font-mono font-bold text-gray-700">📞 {formData.phone}</span>
                          {formData.email && (
                            <span className="text-gray-600">✉️ {formData.email}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-[var(--burgundy-700)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>{tReg.btnEdit[language]}</span>
                      </button>
                    </div>

                    {/* Section: Affiliation & Status */}
                    <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                          {isTh ? 'สังกัดและสถานะ' : 'Affiliation & Status'}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="px-2.5 py-0.5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-800)] font-bold border border-[var(--burgundy-200)]">
                            {formData.participantType === 'STUDENT' ? (isTh ? 'นักศึกษา ม.มหิดล' : 'Mahidol Student') : formData.participantType === 'STAFF' ? (isTh ? 'บุคลากร ม.มหิดล' : 'Mahidol Staff') : (isTh ? 'บุคคลทั่วไป' : 'General Public')}
                          </span>
                          {formData.participantType !== 'GENERAL_PUBLIC' && formData.faculty && (
                            <span className="text-gray-700 font-bold flex items-center gap-1">
                              <Building className="h-3.5 w-3.5 text-gray-400" />
                              {formData.faculty}
                            </span>
                          )}
                          {formData.participantType === 'STUDENT' && formData.academicYear && (
                            <span className="text-gray-500 font-medium">({formData.academicYear})</span>
                          )}
                        </div>
                        <div className="pt-0.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          {formData.donationExperience === 'FIRST_TIME' ? (
                            <>
                              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                              <span>{tReg.expFirst[language]}</span>
                            </>
                          ) : (
                            <>
                              <Heart className="h-3.5 w-3.5 text-red-600 fill-red-600" />
                              <span>{tReg.expRegular[language]}</span>
                            </>
                          )}
                        </div>
                        {formData.prChannel && (
                          <div className="pt-1 text-[11px] text-gray-500 font-medium flex items-center gap-1">
                            <span>📢 {isTh ? 'ทราบข่าวจาก:' : 'Heard via:'}</span>
                            <span className="font-bold text-gray-700">{formData.prChannel}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-bold text-[var(--burgundy-700)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>{tReg.btnEdit[language]}</span>
                      </button>
                    </div>

                    {/* Section: Arrival Window & Venue */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                          {isWalkInMode 
                            ? (isTh ? 'เวลาลงทะเบียนและสถานที่' : 'Registration Time & Venue')
                            : (isTh ? 'รอบเวลาและสถานที่' : 'Time Window & Venue')}
                        </span>
                        <div className="flex items-center gap-2 font-mono font-black text-sm text-[var(--burgundy-800)]">
                          <Clock className="h-4 w-4 text-[var(--burgundy-700)] shrink-0" />
                          <span>
                            {isWalkInMode 
                              ? (isTh ? `เวลาลงทะเบียน: ${formatBangkokTime(new Date())}` : `Registration Time: ${formatBangkokTime(new Date())}`)
                              : (selectedSlotObj?.timeSlot || '09:00 – 14:00 น.')}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-gray-600 pt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <span className="break-words">
                            {isEn 
                              ? 'Room 217, Sirividhaya Building, Faculty of Liberal Arts, Mahidol Salaya' 
                              : 'ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา'}
                          </span>
                        </div>
                      </div>
                      {!isWalkInMode && (
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="text-xs font-bold text-[var(--burgundy-700)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>{tReg.btnEdit[language]}</span>
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Assurance Notice */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="break-words">
                      {isTh
                        ? 'เมื่อกดยืนยัน ระบบจะสร้างตั๋ว Digital Ticket Pass และ QR Code สำหรับแสดงต่อเจ้าหน้าที่ทันที'
                        : 'Upon confirmation, your Digital Ticket Pass & QR Code will be generated instantly.'}
                    </span>
                  </div>
                </div>
              )}

              {/* WIZARD ACTIONS */}
              <div className="pt-5 border-t border-[var(--line)] flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="editorial-btn-secondary text-xs py-2.5 px-4 inline-flex items-center gap-1.5 cursor-pointer rounded-xl"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{tReg.btnBack[language]}</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < totalSteps ? (
                  <button
                    key="wizard-next-btn"
                    type="button"
                    onClick={handleNext}
                    className="editorial-btn-primary text-xs sm:text-sm font-bold py-2.5 px-6 ml-auto inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 transition-all rounded-xl"
                  >
                    <span>{step === (totalSteps - 1) ? tReg.btnReview[language] : tReg.btnNext[language]}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    key="wizard-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="editorial-btn-primary text-xs sm:text-sm font-bold py-2.5 px-6 ml-auto inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98 transition-all rounded-xl"
                  >
                    {loading ? (
                      <span>{tReg.btnSubmitting[language]}</span>
                    ) : (
                      <>
                        <Heart className="h-3.5 w-3.5 fill-white" />
                        <span>{tReg.btnSubmitAndGetTicket[language]}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>

          </div>

        </div>

        {/* Mobile Quick Find My Pass Link */}
        <div className="block md:hidden mt-4 text-center">
          <Link
            href="/lookup"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--burgundy-700)] hover:underline py-2"
          >
            <span>🔍 {isTh ? 'เคยลงทะเบียนแล้ว? ค้นหาตั๋ว/QR' : 'Already registered? Find pass'}</span>
          </Link>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs font-mono font-bold text-gray-400">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-dialog-title"
      ref={dialogRef}
      tabIndex={-1}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 border border-[var(--line)]">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-[var(--burgundy-600)] uppercase">WAITLIST</span>
          <h3 id="waitlist-dialog-title" className="text-lg font-black text-editorial-ink">
            {isTh ? `รอบ ${slotLabel} เต็มแล้ว` : `Time Slot ${slotLabel} is Full`}
          </h3>
          <p className="text-xs text-editorial-muted font-medium leading-relaxed">
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
