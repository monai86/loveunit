import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TRANSLATIONS } from '../lib/i18n/translations';
import { MAHIDOL_FACULTIES, ACADEMIC_YEARS, getFacultyLabel, getYearLabel } from '../lib/constants/mahidol';
import { OFFICIAL_SCREENING_QUESTIONS, SCREENING_CATEGORIES, evaluateScreeningAnswers } from '../lib/constants/screening-rules';

function validateLeafTranslations(obj: Record<string, unknown>, path = '') {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (value && typeof value === 'object') {
      if ('th' in value && 'en' in value) {
        const thVal = (value as { th: string }).th;
        const enVal = (value as { en: string }).en;
        assert.ok(typeof thVal === 'string' && thVal.trim().length > 0, `${currentPath}.th is empty`);
        assert.ok(typeof enVal === 'string' && enVal.trim().length > 0, `${currentPath}.en is empty`);
      } else {
        validateLeafTranslations(value as Record<string, unknown>, currentPath);
      }
    }
  }
}

describe('i18n Unified Translation Dictionary', () => {
  it('should have non-empty th and en strings for all nav keys', () => {
    validateLeafTranslations(TRANSLATIONS.nav, 'nav');
  });

  it('should have non-empty th and en strings for all register keys', () => {
    validateLeafTranslations(TRANSLATIONS.register, 'register');
  });

  it('should have non-empty th and en strings for all ticket keys', () => {
    validateLeafTranslations(TRANSLATIONS.ticket, 'ticket');
  });

  it('should have non-empty th and en strings for all footer keys', () => {
    validateLeafTranslations(TRANSLATIONS.footer, 'footer');
  });

  it('should have non-empty th and en strings for all common keys', () => {
    validateLeafTranslations(TRANSLATIONS.common, 'common');
  });

  it('should ensure all Mahidol faculties have code, name, label, and enLabel', () => {
    for (const fac of MAHIDOL_FACULTIES) {
      assert.ok(fac.code && fac.code.length > 0, 'Faculty code is missing');
      assert.ok(fac.name && fac.name.length > 0, `Faculty name missing for ${fac.code}`);
      assert.ok(fac.label && fac.label.length > 0, `Faculty label missing for ${fac.code}`);
      assert.ok(fac.enLabel && fac.enLabel.length > 0, `Faculty enLabel missing for ${fac.code}`);
    }
  });

  it('should resolve faculty and year labels in both languages correctly', () => {
    const medTechVal = 'คณะเทคนิคการแพทย์';
    assert.strictEqual(getFacultyLabel(medTechVal, 'th'), 'คณะเทคนิคการแพทย์');
    assert.strictEqual(getFacultyLabel(medTechVal, 'en'), 'Faculty of Medical Technology (MT)');

    const year1Val = 'ปี 1';
    assert.strictEqual(getYearLabel(year1Val, 'th'), 'ปี 1');
    assert.strictEqual(getYearLabel(year1Val, 'en'), 'Year 1 (Freshman)');

    assert.ok(ACADEMIC_YEARS.length > 0, 'ACADEMIC_YEARS should not be empty');
  });

  it('should ensure all 10 essential screening questions and categories have English translations', () => {
    assert.strictEqual(SCREENING_CATEGORIES.length, 3);
    for (const cat of SCREENING_CATEGORIES) {
      assert.ok(cat.title && cat.title.length > 0, 'Category title missing');
      assert.ok(cat.titleEn && cat.titleEn.length > 0, 'Category titleEn missing');
      assert.ok(cat.desc && cat.desc.length > 0, 'Category desc missing');
      assert.ok(cat.descEn && cat.descEn.length > 0, 'Category descEn missing');
    }

    assert.strictEqual(OFFICIAL_SCREENING_QUESTIONS.length, 10);
    for (const q of OFFICIAL_SCREENING_QUESTIONS) {
      assert.ok(q.question && q.question.length > 0, `Question ${q.id} missing th question`);
      assert.ok(q.questionEn && q.questionEn.length > 0, `Question ${q.id} missing en question`);
      assert.ok(q.deferralReason && q.deferralReason.length > 0, `Question ${q.id} missing th deferralReason`);
      assert.ok(q.deferralReasonEn && q.deferralReasonEn.length > 0, `Question ${q.id} missing en deferralReason`);
      assert.ok(q.guidance && q.guidance.length > 0, `Question ${q.id} missing th guidance`);
      assert.ok(q.guidanceEn && q.guidanceEn.length > 0, `Question ${q.id} missing en guidance`);
    }
  });

  it('should evaluate screening answers in both Thai and English correctly', () => {
    const perfectAnswers: Record<string, boolean> = {};
    for (const q of OFFICIAL_SCREENING_QUESTIONS) {
      perfectAnswers[q.id] = q.idealAnswer;
    }

    const thResult = evaluateScreeningAnswers(perfectAnswers, 'th');
    assert.strictEqual(thResult.status, 'ELIGIBLE');
    assert.strictEqual(thResult.summaryBadge, 'พร้อมรับการประเมินหน้างาน');

    const enResult = evaluateScreeningAnswers(perfectAnswers, 'en');
    assert.strictEqual(enResult.status, 'ELIGIBLE');
    assert.strictEqual(enResult.summaryBadge, 'Ready for On-site Screening');
    assert.ok(enResult.summaryTitle.includes('Preliminary Self-Screening Complete'));
  });
});
