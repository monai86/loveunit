/**
 * Authoritative Medical Standards & Criteria for Blood Donation
 * Primary Source: ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (National Blood Centre, Thai Red Cross Society)
 * References:
 *  - มาตรฐานธนาคารเลือดและงานบริการโลหิต ฉบับพิมพ์ครั้งที่ 5, พ.ศ. 2567 (Standards 2567)
 *  - คู่มือการรับบริจาคโลหิต ฉบับพิมพ์ครั้งที่ 1, พ.ศ. 2564 (Manual 2564)
 *  - บทที่ 4 การทดสอบโลหิตบริจาค ฉบับปรับปรุง 21 มีนาคม 2568 (Chapter 4 2568)
 */

export const MEDICAL_STANDARDS = {
  citations: {
    standards2567: {
      titleTh: 'มาตรฐานธนาคารเลือดและงานบริการโลหิต ฉบับพิมพ์ครั้งที่ 5, พ.ศ. 2567',
      titleEn: 'Standards for Blood Banks and Transfusion Services, 5th Edition (2024)',
      publisher: 'ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย',
      year: 2567,
    },
    manual2564: {
      titleTh: 'คู่มือการรับบริจาคโลหิต ฉบับพิมพ์ครั้งที่ 1, พ.ศ. 2564',
      titleEn: 'Blood Donation Manual, 1st Edition (2021)',
      publisher: 'ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย',
      year: 2564,
    },
    testingChapter4: {
      titleTh: 'บทที่ 4 การทดสอบโลหิตบริจาค (ฉบับปรับปรุง 21 มีนาคม 2568)',
      titleEn: 'Chapter 4: Testing of Donated Blood (Revised March 21, 2025)',
      publisher: 'ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย',
      year: 2568,
    },
  },

  // Section 2.1.1 Age Criteria
  age: {
    minYears: 17,
    consentRequiredUnderYears: 18,
    firstTimeMaxYears: 60,
    regularDonorEvery3MonthsMaxYears: 65,
    regularDonorEvery6MonthsMaxYears: 70,
    mobileUnitMaxYears: 65, // Standards 2567 Section 2.1.1: >65-70 yrs strictly not accepted at mobile units
  },

  // Section 2.1.2 Weight Criteria
  weight: {
    minKg: 45,
    volume350mlMinKg: 45,
    volume350mlMaxKg: 49,
    volume450mlMinKg: 50,
  },

  // Section 2.1.3 Donation Interval
  donationInterval: {
    wholeBloodMonths: 3, // Every 12 weeks / 3 months
    wholeBloodDays: 90,
  },

  // Section 2.1.4 & 2.1.5 Vital Signs Criteria
  vitalSigns: {
    systolicMinMmHg: 100, // Standard 2567 Section 2.1.4: 100 - 160 mmHg
    systolicMaxMmHg: 160,
    diastolicMinMmHg: 50, // Standard 2567 Section 2.1.4: 50 - 100 mmHg
    diastolicMaxMmHg: 100,
    pulseMinBpm: 50, // Standard 2567 Section 2.1.5: 50 - 100 bpm regular
    pulseMaxBpm: 100,
    temperatureMaxCelsius: 37.5,
  },

  // Section 2.1.6 Hemoglobin Criteria (POCT Hemoglobinometer)
  hemoglobin: {
    femaleMinGdl: 12.5,
    femaleMaxGdl: 16.5,
    femaleHctMinPercent: 37,
    femaleHctMaxPercent: 49,
    maleMinGdl: 13.0,
    maleMaxGdl: 18.5,
    maleHctMinPercent: 39,
    maleHctMaxPercent: 55,
  },

  // Pre-donation preparation (Manual 2564)
  preparation: {
    sleepMinHoursContinuous: 5,
    highFatMealAvoidanceHours: 6, // Avoid high-fat meals for at least 6 hours (do not fast)
    waterIntakeMlMin: 300,
    waterIntakeMlMax: 500,
    waterIntakeTimingMinutes: 30, // ~30 minutes prior
    alcoholAbstinenceHours: 24,
    smokingAbstinenceHoursPrePost: 1, // 1 hour before and 1 hour after
  },

  // Deferral Periods (Standards 2567 & Manual 2564)
  deferrals: {
    antibioticsDays: 7, // 7 days after course completion and symptom resolution
    aspirinPlateletsDays: 3,
    nsaidPlateletsHours: 48,
    isotretinoinMonths: 1,
    acitretinYears: 3,
    finasterideMonths: 1,
    dutasterideMonths: 6,
    dentalScalingFillingDays: 3,
    dentalExtractionRootCanalDays: 7,
    minorSurgeryDays: 7,
    majorSurgeryMonths: 6,
    bloodTransfusionMonths: 12,
    tattooPiercingStandardMonths: 4,
    endoscopyMonths: 4,
    pregnancyPostpartumMonths: 6,
    inactivatedVaccineDays: 7,
    liveAttenuatedVaccineWeeks: 4,
  },
} as const;
