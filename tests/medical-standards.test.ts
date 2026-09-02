import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MEDICAL_STANDARDS } from '../lib/constants/medical';

describe('Medical Standards Alignment (Thai Red Cross 2567)', () => {
  it('should enforce exact blood pressure thresholds: 100-160 / 50-100 mmHg', () => {
    const { vitalSigns } = MEDICAL_STANDARDS;
    assert.strictEqual(vitalSigns.systolicMinMmHg, 100);
    assert.strictEqual(vitalSigns.systolicMaxMmHg, 160);
    assert.strictEqual(vitalSigns.diastolicMinMmHg, 50);
    assert.strictEqual(vitalSigns.diastolicMaxMmHg, 100);
  });

  it('should enforce pulse rate thresholds: 50-100 beats/min regular', () => {
    const { vitalSigns } = MEDICAL_STANDARDS;
    assert.strictEqual(vitalSigns.pulseMinBpm, 50);
    assert.strictEqual(vitalSigns.pulseMaxBpm, 100);
  });

  it('should enforce temperature threshold <= 37.5 Celsius', () => {
    const { vitalSigns } = MEDICAL_STANDARDS;
    assert.strictEqual(vitalSigns.temperatureMaxCelsius, 37.5);
  });

  it('should enforce sleep duration >= 5 hours', () => {
    const { preparation } = MEDICAL_STANDARDS;
    assert.strictEqual(preparation.sleepMinHoursContinuous, 5);
  });

  it('should require avoiding high-fat meals for at least 6 hours', () => {
    const { preparation } = MEDICAL_STANDARDS;
    assert.strictEqual(preparation.highFatMealAvoidanceHours, 6);
  });

  it('should require 300-500 mL water ~30 minutes prior', () => {
    const { preparation } = MEDICAL_STANDARDS;
    assert.strictEqual(preparation.waterIntakeMlMin, 300);
    assert.strictEqual(preparation.waterIntakeMlMax, 500);
    assert.strictEqual(preparation.waterIntakeTimingMinutes, 30);
  });

  it('should require abstaining from alcohol for >= 24 hours', () => {
    const { preparation } = MEDICAL_STANDARDS;
    assert.strictEqual(preparation.alcoholAbstinenceHours, 24);
  });

  it('should require abstaining from smoking for 1 hour before and after', () => {
    const { preparation } = MEDICAL_STANDARDS;
    assert.strictEqual(preparation.smokingAbstinenceHoursPrePost, 1);
  });

  it('should enforce age limits: 17-60 first-time, up to 65 regular, mobile unit limit strictly 65', () => {
    const { age } = MEDICAL_STANDARDS;
    assert.strictEqual(age.minYears, 17);
    assert.strictEqual(age.consentRequiredUnderYears, 18);
    assert.strictEqual(age.firstTimeMaxYears, 60);
    assert.strictEqual(age.regularDonorEvery3MonthsMaxYears, 65);
    assert.strictEqual(age.mobileUnitMaxYears, 65);
  });

  it('should enforce hemoglobin thresholds: female >= 12.5, male >= 13.0 g/dL', () => {
    const { hemoglobin } = MEDICAL_STANDARDS;
    assert.strictEqual(hemoglobin.femaleMinGdl, 12.5);
    assert.strictEqual(hemoglobin.femaleMaxGdl, 16.5);
    assert.strictEqual(hemoglobin.maleMinGdl, 13.0);
    assert.strictEqual(hemoglobin.maleMaxGdl, 18.5);
  });

  it('should enforce deferral rules: tattoo 4 months, antibiotics 7 days, dental extraction 7 days', () => {
    const { deferrals } = MEDICAL_STANDARDS;
    assert.strictEqual(deferrals.tattooPiercingStandardMonths, 4);
    assert.strictEqual(deferrals.antibioticsDays, 7);
    assert.strictEqual(deferrals.dentalExtractionRootCanalDays, 7);
    assert.strictEqual(deferrals.minorSurgeryDays, 7);
    assert.strictEqual(deferrals.majorSurgeryMonths, 6);
  });
});
