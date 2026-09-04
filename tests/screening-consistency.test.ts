import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { OFFICIAL_SCREENING_QUESTIONS, evaluateScreeningAnswers } from '../lib/constants/screening-rules';

describe('Screening Consistency & Non-Diagnostic Framing', () => {
  it('should have 7 consolidated official screening questions', () => {
    assert.strictEqual(OFFICIAL_SCREENING_QUESTIONS.length, 7);
  });

  it('should not contain stale "24 ข้อ" in screening layout or rules', () => {
    const layoutPath = path.join(process.cwd(), 'app/screening/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    assert.ok(!layoutContent.includes('24 ข้อ'), 'app/screening/layout.tsx must not contain "24 ข้อ"');
    assert.ok(!layoutContent.includes('24 questions'), 'app/screening/layout.tsx must not contain "24 questions"');
  });

  it('should evaluate all ideal answers as ELIGIBLE', () => {
    const perfectAnswers: Record<string, boolean> = {};
    for (const q of OFFICIAL_SCREENING_QUESTIONS) {
      perfectAnswers[q.id] = q.idealAnswer;
    }

    const result = evaluateScreeningAnswers(perfectAnswers, 'th');
    assert.strictEqual(result.status, 'ELIGIBLE');
    assert.strictEqual(result.canProceedToRegister, true);
    assert.strictEqual(result.flaggedQuestions.length, 0);
  });

  it('should detect permanent guidance on chronic disease history and guide to personal wellness', () => {
    const answers: Record<string, boolean> = {
      'q-chronic-viral-risks': true, // answered YES to chronic disease
    };

    const result = evaluateScreeningAnswers(answers, 'th');
    assert.strictEqual(result.status, 'PERMANENT_DEFERRAL');
    assert.strictEqual(result.canProceedToRegister, false);
    assert.ok(result.flaggedQuestions.some(f => f.question.id === 'q-chronic-viral-risks'));
  });

  it('should detect temporary interval on recent procedures/tattoo/dental with 120-day interval', () => {
    const answers: Record<string, boolean> = {
      'q-procedures-tattoo-dental': true, // answered YES to recent procedures
    };

    const result = evaluateScreeningAnswers(answers, 'th');
    assert.strictEqual(result.status, 'TEMPORARY_DEFERRAL');
    assert.strictEqual(result.canProceedToRegister, false);
    assert.ok(result.earliestEligibleDate !== undefined);
  });
});
