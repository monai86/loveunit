'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  Heart, 
  Info, 
  ChevronRight,
  Clock,
  Stethoscope
} from 'lucide-react';
import { 
  OFFICIAL_SCREENING_QUESTIONS, 
  SCREENING_CATEGORIES, 
  evaluateScreeningAnswers, 
  ScreeningEvaluationResult 
} from '@/lib/constants/screening-rules';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ScreeningPage() {
  const { isTh, isEn } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const result: ScreeningEvaluationResult | null = useMemo(() => {
    if (!submitted) return null;
    return evaluateScreeningAnswers(answers, isEn ? 'en' : 'th');
  }, [submitted, answers, isEn]);

  const activeCategory = SCREENING_CATEGORIES[currentCategoryIndex];
  const categoryQuestions = OFFICIAL_SCREENING_QUESTIONS.filter(
    (q) => q.category === activeCategory.id
  );

  const totalQuestions = OFFICIAL_SCREENING_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectAnswer = (questionId: string, answer: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextCategory = () => {
    if (currentCategoryIndex < SCREENING_CATEGORIES.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleEvaluate();
    }
  };

  const handlePrevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEvaluate = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentCategoryIndex(0);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-[var(--line)]">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--burgundy-600)]">{isTh ? 'หน้าแรก' : 'Home'}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--burgundy-700)]">
            {isTh ? 'แบบประเมินความพร้อมตนเองก่อนบริจาคโลหิต' : 'Self-Screening Readiness Assessment'}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] px-4 py-1.5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-red-950/20 border border-white/20">
              <ShieldCheck className="h-4 w-4 text-white" />
              <span>{isTh ? 'เกณฑ์มาตรฐานศูนย์บริการโลหิต (ฉบับย่อ 7 ข้อหลัก)' : 'Blood Service Centre Criteria (Essential 7-Item Quick Check)'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--ink)] tracking-tight leading-tight">
              {isTh ? 'แบบประเมินความพร้อมตนเองก่อนบริจาคโลหิต' : 'Donor Pre-Screening Readiness'}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-[var(--muted)] font-medium max-w-3xl break-words">
              {isTh
                ? 'ตรวจเช็กความพร้อมของร่างกาย โรคประจำตัว ยา และหัตถการสำคัญล่วงหน้าก่อนเดินทาง เพื่อประเมินตนเองอย่างรวดเร็ว (ใช้เวลาประมาณ 1 นาที)'
                : 'Evaluate your health readiness, medications, and recent procedures before traveling to ensure safe blood donation (approx. 1 minute).'}
            </p>
          </div>
        </div>
      </div>

      {/* MANDATORY CLINICAL & ON-SITE SCREENING DISCLAIMER BANNER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 shadow-sm space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-xs">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 text-sm sm:text-base">
            <h3 className="font-black text-amber-900 flex items-center gap-1.5 text-base sm:text-lg">
              <span>{isTh ? '⚠️ คำชี้แจงสำคัญก่อนทำแบบประเมิน' : '⚠️ Important Clinical & Operational Disclaimer'}</span>
            </h3>
            <p className="leading-relaxed text-amber-950/90 font-medium break-words">
              {isTh ? (
                <>
                  แบบประเมินนี้เป็นเพียง <strong>การเตรียมความพร้อมของตัวเองเท่านั้น</strong> โดยไม่มีการบันทึกประวัติสุขภาพเข้าสู่ฐานข้อมูลศูนย์บริการโลหิต
                  <br className="hidden sm:block" />
                  <strong>ผู้บริจาคทุกท่านจะต้องทำแบบประเมินสุขภาพ ซักประวัติ และตรวจวัดความเข้มข้นโลหิตจากเจ้าหน้าที่หน้างานจริงอีกครั้งก่อนการเจาะบริจาค</strong>
                </>
              ) : (
                <>
                  This self-assessment is for <strong>personal preparation only</strong>. Responses are not stored in Blood Service Centre databases.
                  <br className="hidden sm:block" />
                  <strong>All donors must complete formal health screening, questionnaire review, and on-site hemoglobin testing with actual staff before donation.</strong>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* RESULT VIEW */}
      {submitted && result ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Main Verdict Banner */}
          <div className={`p-6 sm:p-8 rounded-2xl border ${result.colorClass} shadow-md space-y-4`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {result.status === 'ELIGIBLE' && (
                  <div className="p-3.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                )}
                {result.status === 'CAUTION' && (
                  <div className="p-3.5 rounded-xl bg-blue-600 text-white shadow-sm">
                    <Info className="h-9 w-9" />
                  </div>
                )}
                {result.status === 'TEMPORARY_DEFERRAL' && (
                  <div className="p-3.5 rounded-xl bg-amber-500 text-white shadow-sm">
                    <AlertTriangle className="h-9 w-9" />
                  </div>
                )}
                {result.status === 'PERMANENT_DEFERRAL' && (
                  <div className="p-3.5 rounded-xl bg-red-600 text-white shadow-sm">
                    <XCircle className="h-9 w-9" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider px-3 py-1 rounded-md bg-black/10">
                      {result.summaryBadge}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black">{result.summaryTitle}</h2>
                </div>
              </div>
            </div>

            <p className="text-base sm:text-lg leading-relaxed font-medium pt-3 border-t border-black/10 break-words">
              {result.summaryMessage}
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              {result.canProceedToRegister ? (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D92231] via-[#A6192E] to-[#7E1120] hover:from-[#C51D2C] hover:via-[#911426] hover:to-[#6E0F1D] text-white font-extrabold px-7 py-3.5 text-sm sm:text-base shadow-md shadow-red-950/20 transition-all active:scale-95 border border-white/20"
                >
                  <Heart className="h-5 w-5 fill-white" />
                  <span>{isTh ? 'ดำเนินการเลือกรอบเวลาเดินทาง' : 'Proceed to Reserve Arrival Slot'}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/prepare"
                  className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-gray-50 text-[var(--ink)] font-extrabold px-6 py-3.5 text-sm sm:text-base border border-[var(--line)] shadow-sm transition-all"
                >
                  <span>{isTh ? 'อ่านแนวทางการเตรียมตัว' : 'View Preparation Guide'}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-black bg-white/80 hover:bg-white px-5 py-3.5 rounded-xl border border-black/10 transition-all cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{isTh ? 'ทำแบบประเมินใหม่อีกครั้ง' : 'Retake Assessment'}</span>
              </button>
            </div>
          </div>

          {/* On-Site Screening Reminder Note */}
          <div className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-[var(--muted)] flex items-center gap-3 font-medium">
            <Info className="h-5 w-5 text-blue-600 shrink-0" />
            <span className="break-words">
              {isTh
                ? 'คำเตือน: ในวันงาน ขอให้เตรียมบัตรประชาชนตัวจริงเพื่อแสดงต่อเจ้าหน้าที่คัดกรองและเจาะตรวจความเข้มข้นเลือดก่อนบริจาค'
                : 'Reminder: Please bring your physical National ID card or Passport for official identity verification and blood screening on-site.'}
            </span>
          </div>

          {/* Flagged Issues Breakdown (If any) */}
          {result.flaggedQuestions.length > 0 && (
            <div className="editorial-card p-6 sm:p-8 space-y-6">
              <div className="space-y-1.5 border-b border-[var(--line)] pb-3.5">
                <h3 className="text-xl font-black text-[var(--ink)] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>{isTh ? 'ข้อแนะนำการเตรียมตัวและเกณฑ์ระยะเวลาความพร้อม' : 'Preparation Guidance & Readiness Criteria'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)]">
                  {isTh
                    ? 'รายละเอียดเกณฑ์ระยะเวลาความพร้อมและคำแนะนำวิธีปฏิบัติตัวเพื่อให้พร้อมบริจาค'
                    : 'Details on readiness time intervals and pre-donation preparation instructions.'}
                </p>
              </div>

              <div className="space-y-4">
                {result.flaggedQuestions.map((item, idx) => (
                  <div key={idx} className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <span className="h-6 w-6 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {item.question.number}
                        </span>
                        <p className="font-bold text-[var(--ink)] text-sm sm:text-base leading-snug break-words">
                          {isEn ? (item.question.questionEn || item.question.question) : item.question.question}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-bold shrink-0 self-start sm:self-auto bg-gray-200 text-gray-800">
                        {isTh ? 'คำตอบ:' : 'Answer:'} {item.userAnswer ? (isTh ? 'ใช่' : 'Yes') : (isTh ? 'ไม่ใช่' : 'No')}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-950 font-medium flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                      <span className="leading-relaxed break-words"><strong>{isTh ? 'ข้อมูล:' : 'Note:'}</strong> {item.reason}</span>
                    </div>

                    {item.durationText && (
                      <p className="text-xs sm:text-sm font-bold text-[var(--burgundy-700)] flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{item.durationText}</span>
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed flex items-start gap-2 break-words">
                      <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>{isTh ? 'คำแนะนำ:' : 'Guidance:'}</strong> {item.guidance}</span>
                    </p>

                    {item.question.officialReference && (
                      <p className="text-xs text-gray-400 font-mono pl-6">
                        {isTh ? 'อ้างอิง:' : 'Reference:'} {item.question.officialReference}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links to Knowledge Hub */}
          <div className="p-6 rounded-2xl bg-[var(--rose-100)]/60 border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-black text-[var(--ink)]">
                {isTh ? 'ต้องการศึกษามาตรฐานการตรวจคัดกรองทางแล็บเพิ่มเติม?' : 'Want to learn more about blood lab screening standards?'}
              </h4>
              <p className="text-xs sm:text-sm text-[var(--muted)]">
                {isTh ? 'เรียนรู้เกี่ยวกับระบบ ABO, Rh, Antibody Screen และการตรวจ ID-NAT' : 'Learn about ABO, Rh blood groups, Antibody Screen, and ID-NAT testing'}
              </p>
            </div>
            <Link href="/knowledge" className="editorial-btn-secondary text-xs sm:text-sm py-2.5 px-4 shrink-0">
              <span>{isTh ? 'ศูนย์ความรู้ & การตรวจแล็บ →' : 'Knowledge & Labs Hub →'}</span>
            </Link>
          </div>

        </div>
      ) : (
        /* WIZARD QUESTION VIEW */
        <div className="space-y-8">
          
          {/* Progress Bar & Category Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[var(--muted)]">
              <span>{isTh ? 'ความคืบหน้าการตอบคำถาม' : 'Question Progress'}</span>
              <span className="font-mono text-[var(--burgundy-700)]">
                {answeredCount} / {totalQuestions} {isTh ? 'ข้อ' : 'items'} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-[var(--burgundy-600)] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Category Tabs (3 Categories) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {SCREENING_CATEGORIES.map((cat, idx) => {
                const isActive = idx === currentCategoryIndex;
                const isDone = OFFICIAL_SCREENING_QUESTIONS.filter((q) => q.category === cat.id).every(
                  (q) => answers[q.id] !== undefined
                );
                const titleText = isEn ? (cat.titleEn || cat.title) : cat.title;
                const shortTitle = titleText.includes('. ') ? titleText.split('. ')[1] : titleText;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCurrentCategoryIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-2xs ring-1.5 ring-[var(--burgundy-700)]'
                        : isDone
                        ? 'border-gray-300 bg-gray-50 text-gray-800'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 font-mono">
                        {isTh ? `หมวด ${idx + 1}` : `Part ${idx + 1}`}
                      </span>
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-gray-500" />}
                    </div>
                    <span className="font-bold text-xs sm:text-sm leading-snug break-words">{shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Category Questions Card */}
          <div className="editorial-card p-5 sm:p-7 space-y-5">
            <div className="space-y-1 border-b border-[var(--line)] pb-3">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                PART {currentCategoryIndex + 1} OF {SCREENING_CATEGORIES.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-editorial-ink leading-snug">
                {isEn ? (activeCategory.titleEn || activeCategory.title) : activeCategory.title}
              </h2>
              <p className="text-xs sm:text-[13px] text-editorial-muted leading-relaxed">
                {isEn ? (activeCategory.descEn || activeCategory.desc) : activeCategory.desc}
              </p>
            </div>

            {/* Question Items */}
            <div className="space-y-3.5">
              {categoryQuestions.map((q) => {
                const currentVal = answers[q.id];
                const qText = isEn ? (q.questionEn || q.question) : q.question;
                const qSub = isEn ? (q.subtextEn || q.subtext) : q.subtext;

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                      currentVal === undefined
                        ? 'border-gray-200 bg-white hover:border-gray-300'
                        : 'border-gray-300 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-start gap-2.5">
                          <span className="h-6 w-6 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                            {q.number}
                          </span>
                          <div>
                            <p className="text-sm sm:text-[15px] font-bold text-[var(--ink)] leading-snug break-words">
                              {qText}
                            </p>
                            {qSub && (
                              <p className="text-xs text-[var(--muted)] font-normal mt-1 leading-normal break-words">
                                {qSub}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Yes / No Choice Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center mt-1 sm:mt-0">
                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, true)}
                          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            currentVal === true
                              ? 'bg-[var(--burgundy-700)] text-white shadow-xs scale-102'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isTh ? 'ใช่' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, false)}
                          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            currentVal === false
                              ? 'bg-[var(--burgundy-700)] text-white shadow-xs scale-102'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isTh ? 'ไม่ใช่' : 'No'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Navigation Footer */}
            <div className="pt-5 border-t border-[var(--line)] flex items-center justify-between">
              {currentCategoryIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevCategory}
                  className="editorial-btn-secondary text-xs py-2.5 px-4 cursor-pointer rounded-xl"
                >
                  <span>{isTh ? '← หมวดก่อนหน้า' : '← Previous'}</span>
                </button>
              ) : (
                <div />
              )}

              {currentCategoryIndex < SCREENING_CATEGORIES.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextCategory}
                  className="editorial-btn-primary text-xs sm:text-sm font-bold py-2.5 px-5 ml-auto cursor-pointer rounded-xl"
                >
                  <span>{isTh ? 'หมวดถัดไป →' : 'Next Part →'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEvaluate}
                  className="editorial-btn-primary text-xs sm:text-sm font-bold py-2.5 px-6 ml-auto flex items-center gap-1.5 cursor-pointer rounded-xl"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isTh ? 'สรุปผลการประเมินความพร้อม' : 'Calculate Readiness'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
