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
  Sparkles,
  ChevronRight
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

  const handleQuickFillHealthy = () => {
    const perfectAnswers: Record<string, boolean> = {};
    for (const q of OFFICIAL_SCREENING_QUESTIONS) {
      perfectAnswers[q.id] = q.idealAnswer;
    }
    setAnswers(perfectAnswers);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-10">
      
      {/* Header */}
      <div className="pb-6 border-b border-[var(--line)]">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--burgundy-600)]">{isTh ? 'หน้าแรก' : 'Home'}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[var(--burgundy-700)]">
            {isTh ? 'แบบประเมินสุขภาพตนเองก่อนบริจาคโลหิต' : 'Self-Screening Assessment'}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--rose-100)] px-3 py-1 text-xs font-black text-[var(--burgundy-700)] border border-[var(--line)]">
              <ShieldCheck className="h-4 w-4 text-[var(--burgundy-700)]" />
              <span>{isTh ? 'มาตรฐานศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (2567)' : 'National Blood Centre Standard, Thai Red Cross (2024)'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--ink)]">
              {isTh ? 'แบบประเมินสุขภาพตนเอง' : 'Donor Self-Screening'}
            </h1>
            <p className="text-[15px] leading-relaxed text-[var(--muted)] font-medium max-w-2xl">
              {isTh
                ? 'ตรวจเช็กความพร้อมของร่างกาย โรคประจำตัว ยา และหัตถการต่างๆ ก่อนเดินทางมาบริจาค เพื่อความปลอดภัยสูงสุดของทั้งตัวท่านและผู้ป่วย'
                : 'Evaluate your physical readiness, health history, medications, and risk factors before donating blood for maximum donor and patient safety.'}
            </p>
          </div>

          {!submitted && (
            <button
              type="button"
              onClick={handleQuickFillHealthy}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--burgundy-700)] bg-[var(--rose-100)] hover:bg-[var(--rose-200)] border border-[var(--line)] px-3.5 py-2.5 rounded-xl transition-all self-start md:self-auto shrink-0 cursor-pointer"
              title={isTh ? 'ตอบตามเกณฑ์มาตรฐานกรณีผู้บริจาคสุขภาพสมบูรณ์' : 'Simulate fully eligible donor'}
            >
              <Sparkles className="h-3.5 w-3.5 fill-[var(--burgundy-700)]" />
              <span>{isTh ? 'ทดลองตรวจด่วน (สุขภาพสมบูรณ์)' : 'Quick Test (All Clear)'}</span>
            </button>
          )}
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
                  <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-sm">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                )}
                {result.status === 'CAUTION' && (
                  <div className="p-3 rounded-xl bg-blue-600 text-white shadow-sm">
                    <Info className="h-8 w-8" />
                  </div>
                )}
                {result.status === 'TEMPORARY_DEFERRAL' && (
                  <div className="p-3 rounded-xl bg-amber-500 text-white shadow-sm">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                )}
                {result.status === 'PERMANENT_DEFERRAL' && (
                  <div className="p-3 rounded-xl bg-red-600 text-white shadow-sm">
                    <XCircle className="h-8 w-8" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-black/10">
                      {result.summaryBadge}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">{result.summaryTitle}</h2>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed font-medium pt-2 border-t border-black/10">
              {result.summaryMessage}
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              {result.canProceedToRegister ? (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--burgundy-700)] hover:bg-[var(--burgundy-800)] text-white font-extrabold px-6 py-3 text-sm shadow-md transition-all active:scale-95"
                >
                  <Heart className="h-4 w-4 fill-white" />
                  <span>{isTh ? 'ดำเนินการลงทะเบียนจองรอบเวลา' : 'Proceed to Registration'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/prepare"
                  className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-gray-50 text-[var(--ink)] font-extrabold px-5 py-3 text-sm border border-[var(--line)] shadow-sm transition-all"
                >
                  <span>{isTh ? 'อ่านแนวทางการเตรียมตัว' : 'View Preparation Guide'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black bg-white/80 hover:bg-white px-4 py-3 rounded-xl border border-black/10 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isTh ? 'ทำแบบประเมินใหม่อีกครั้ง' : 'Retake Assessment'}</span>
              </button>
            </div>
          </div>

          {/* Flagged Issues Breakdown (If any) */}
          {result.flaggedQuestions.length > 0 && (
            <div className="editorial-card p-6 sm:p-8 space-y-6">
              <div className="space-y-1 border-b border-[var(--line)] pb-3">
                <h3 className="text-lg font-black text-[var(--ink)] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>{isTh ? 'ข้อกำหนดและคำแนะนำที่เกี่ยวข้องกับคำตอบของท่าน' : 'Flagged Criteria & Clinical Guidance'}</span>
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {isTh
                    ? 'รายละเอียดข้อจำกัดทางสุขภาพ ระยะเวลาที่ต้องงด และแนวทางปฏิบัติ'
                    : 'Details on identified health restrictions, safety deferral periods, and recommendations.'}
                </p>
              </div>

              <div className="space-y-4">
                {result.flaggedQuestions.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="h-5 w-5 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {item.question.number}
                        </span>
                        <p className="font-bold text-[var(--ink)] text-xs sm:text-sm">
                          {isEn ? (item.question.questionEn || item.question.question) : item.question.question}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0 bg-gray-200 text-gray-800">
                        {isTh ? 'คำตอบ:' : 'Answer:'} {item.userAnswer ? (isTh ? 'ใช่' : 'Yes') : (isTh ? 'ไม่ใช่' : 'No')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-950 font-medium">
                      ⚠️ <strong>{isTh ? 'เหตุผล:' : 'Reason:'}</strong> {item.reason}
                    </div>

                    {item.durationText && (
                      <p className="text-[11px] font-bold text-[var(--burgundy-700)]">
                        ⏳ {isTh ? 'ระยะเวลางด:' : 'Duration:'} {item.durationText}
                      </p>
                    )}

                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                      💡 {isTh ? 'คำแนะนำ:' : 'Guidance:'} {item.guidance}
                    </p>

                    {item.question.officialReference && (
                      <p className="text-[10px] text-gray-400 font-mono">
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
              <h4 className="text-sm font-black text-[var(--ink)]">
                {isTh ? 'ต้องการศึกษามาตรฐานการตรวจคัดกรองทางแล็บเพิ่มเติม?' : 'Want to learn more about blood lab screening standards?'}
              </h4>
              <p className="text-xs text-[var(--muted)]">
                {isTh ? 'เรียนรู้เกี่ยวกับระบบ ABO, Rh, Antibody Screen และการตรวจ ID-NAT' : 'Learn about ABO, Rh blood groups, Antibody Screen, and ID-NAT testing'}
              </p>
            </div>
            <Link href="/knowledge" className="editorial-btn-secondary text-xs py-2.5 px-4 shrink-0">
              <span>{isTh ? 'ศูนย์ความรู้ & การตรวจแล็บ →' : 'Knowledge & Labs Hub →'}</span>
            </Link>
          </div>

        </div>
      ) : (
        /* WIZARD QUESTION VIEW */
        <div className="space-y-8">
          
          {/* Progress Bar & Category Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
              <span>{isTh ? 'ความคืบหน้าการตอบคำถาม' : 'Question Progress'}</span>
              <span className="font-mono text-[var(--burgundy-700)]">
                {answeredCount} / {totalQuestions} {isTh ? 'ข้อ' : 'items'} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-[var(--burgundy-600)] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
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
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'border-[var(--burgundy-700)] bg-[var(--rose-100)] text-[var(--burgundy-700)] shadow-xs ring-1 ring-[var(--burgundy-700)]'
                        : isDone
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black uppercase text-gray-400 font-mono">
                        {isTh ? `หมวด ${idx + 1}` : `Part ${idx + 1}`}
                      </span>
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    </div>
                    <span className="font-black truncate">{shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Category Questions Card */}
          <div className="editorial-card p-6 sm:p-8 space-y-6">
            <div className="space-y-1 border-b border-[var(--line)] pb-4">
              <span className="text-[11px] font-mono font-bold text-[var(--burgundy-700)] uppercase block">
                CATEGORY {currentCategoryIndex + 1} OF {SCREENING_CATEGORIES.length}
              </span>
              <h2 className="text-xl font-black text-editorial-ink">
                {isEn ? (activeCategory.titleEn || activeCategory.title) : activeCategory.title}
              </h2>
              <p className="text-xs text-editorial-muted">
                {isEn ? (activeCategory.descEn || activeCategory.desc) : activeCategory.desc}
              </p>
            </div>

            {/* Question Items */}
            <div className="space-y-5">
              {categoryQuestions.map((q) => {
                const currentVal = answers[q.id];
                const qText = isEn ? (q.questionEn || q.question) : q.question;
                const qSub = isEn ? (q.subtextEn || q.subtext) : q.subtext;

                return (
                  <div
                    key={q.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      currentVal === undefined
                        ? 'border-gray-200 bg-white hover:border-gray-300'
                        : currentVal === q.idealAnswer
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-amber-200 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-start gap-2.5">
                          <span className="h-6 w-6 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                            {q.number}
                          </span>
                          <div>
                            <p className="text-sm font-extrabold text-[var(--ink)] leading-snug">
                              {qText}
                            </p>
                            {qSub && (
                              <p className="text-xs text-[var(--muted)] font-medium mt-1 leading-relaxed">
                                {qSub}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Yes / No Choice Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, true)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            currentVal === true
                              ? 'bg-[var(--burgundy-700)] text-white shadow-md scale-105'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isTh ? 'ใช่' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, false)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            currentVal === false
                              ? 'bg-[var(--burgundy-700)] text-white shadow-md scale-105'
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
            <div className="pt-6 border-t border-[var(--line)] flex items-center justify-between">
              {currentCategoryIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevCategory}
                  className="editorial-btn-secondary text-xs py-2.5 px-4 cursor-pointer"
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
                  className="editorial-btn-primary text-xs py-3 px-6 ml-auto cursor-pointer"
                >
                  <span>{isTh ? 'หมวดถัดไป →' : 'Next Part →'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEvaluate}
                  className="editorial-btn-primary text-xs py-3.5 px-8 ml-auto flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isTh ? 'สรุปผลการประเมินสุขภาพ' : 'Calculate Readiness'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
