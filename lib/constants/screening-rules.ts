/**
 * MUMT Blood Donation 2026 — Clinical Screening Rules & Standard Criteria
 * 
 * Sources of Truth:
 * 1. คู่มือการรับบริจาคโลหิต ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (พ.ศ. 2564)
 * 2. มาตรฐานธนาคารเลือดและงานบริการโลหิต ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (ฉบับพิมพ์ครั้งที่ 5, พ.ศ. 2567)
 * 3. บทที่ 4 การทดสอบโลหิตบริจาค (ฉบับปรับปรุง 21 มีนาคม 2568)
 * 4. สภากาชาดไทย (redcross.or.th)
 */

import { MEDICAL_STANDARDS } from './medical';

export interface ScreeningQuestion {
  id: string;
  category: 'PHYSICAL' | 'MEDICATIONS_VACCINES' | 'PROCEDURES_LIFESTYLE';
  number: number;
  question: string;
  questionEn?: string;
  subtext?: string;
  subtextEn?: string;
  idealAnswer: boolean; // What answer corresponds to ELIGIBLE (true = Yes, false = No)
  deferralType: 'PERMANENT' | 'TEMPORARY' | 'CAUTION';
  deferralReason: string;
  deferralReasonEn?: string;
  deferralDurationDays?: number;
  deferralDurationText?: string;
  deferralDurationTextEn?: string;
  guidance: string;
  guidanceEn?: string;
  officialReference?: string;
}

export const SCREENING_CATEGORIES = [
  {
    id: 'PHYSICAL',
    title: '1. ความพร้อมและสุขภาพทั่วไป',
    titleEn: '1. General Health & Physical Readiness',
    desc: 'อายุ น้ำหนัก การนอนหลับพักผ่อน และความพร้อมของร่างกายในวันนี้',
    descEn: 'Age, body weight, sleep duration, and physical wellness today',
    icon: 'Activity',
  },
  {
    id: 'MEDICATIONS_VACCINES',
    title: '2. ยา อาหาร และแอลกอฮอล์',
    titleEn: '2. Medications, Diet & Lifestyle',
    desc: 'ยาปฏิชีวนะ ยารักษาสิว แอลกอฮอล์ และการบริโภคน้ำ/อาหาร',
    descEn: 'Antibiotics, acne meds, alcohol consumption, and meals/hydration',
    icon: 'Pill',
  },
  {
    id: 'PROCEDURES_LIFESTYLE',
    title: '3. หัตถการ ทันตกรรม และประวัติสุขภาพสำคัญ',
    titleEn: '3. Procedures, Dental & Clinical History',
    desc: 'การทำฟัน สัก เจาะผิวหนัง การผ่าตัด และประวัติความเสี่ยงสำคัญ',
    descEn: 'Dental work, tattoos, body piercing, surgery, and key risk factors',
    icon: 'Stethoscope',
  },
];

export const OFFICIAL_SCREENING_QUESTIONS: ScreeningQuestion[] = [
  // -------------------------------------------------------------
  // หมวด 1: ข้อมูลสุขภาพและความพร้อมทั่วไป (PHYSICAL)
  // -------------------------------------------------------------
  {
    id: 'q-general-health',
    category: 'PHYSICAL',
    number: 1,
    question: 'วันนี้ท่านรู้สึกสบายดี สุขภาพแข็งแรง ไม่มีอาการเจ็บป่วย เป็นไข้ หวัด เจ็บคอ อ่อนเพลีย หรือท้องเสีย?',
    questionEn: 'Do you feel well, healthy, and free of fever, cough, cold, sore throat, severe fatigue, or diarrhea today?',
    subtext: 'ผู้บริจาคต้องมีสุขภาพแข็งแรงสมบูรณ์ในวันที่มาบริจาค เพื่อความปลอดภัยของทั้งตัวท่านและคุณภาพโลหิต',
    subtextEn: 'Donors must be in good general health on donation day for both donor wellness and optimal blood quality.',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'ร่างกายยังไม่พร้อมสมบูรณ์ มีอาการเจ็บป่วยเฉียบพลัน',
    deferralReasonEn: 'Acute illness or feeling unwell today',
    deferralDurationDays: 7,
    deferralDurationText: 'งดบริจาคจนกว่าจะหายดีเป็นปกติอย่างน้อย 7 วัน',
    deferralDurationTextEn: 'Defer until fully recovered for at least 7 days',
    guidance: 'ผู้บริจาคโลหิตต้องมีสุขภาพแข็งแรงในวันที่มาบริจาค เพื่อให้ระบบไหลเวียนโลหิตและร่างกายปรับตัวได้ดี',
    guidanceEn: 'Donors must be in good health to ensure physiological stability during blood donation.',
    officialReference: 'คู่มือการรับบริจาคโลหิต ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (2564) หน้า 23 ข้อ 1',
  },
  {
    id: 'q-sleep-rest',
    category: 'PHYSICAL',
    number: 2,
    question: 'เมื่อคืนที่ผ่านมา ท่านได้นอนหลับพักผ่อนติดต่อกันอย่างน้อย 5 ชั่วโมง?',
    questionEn: 'Did you get at least 5 hours of continuous, restful sleep last night?',
    subtext: 'การอดนอนหรือพักผ่อนไม่เพียงพอ เพิ่มความเสี่ยงต่อการหน้ามืด เป็นลม หรือความดันโลหิตตก',
    subtextEn: 'Inadequate sleep significantly increases the risk of vasovagal syncope, dizziness, or acute hypotension.',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'พักผ่อนไม่เพียงพอ (< 5 ชั่วโมงติดต่อกัน)',
    deferralReasonEn: 'Insufficient sleep (< 5 hours of continuous rest)',
    deferralDurationDays: 1,
    deferralDurationText: 'งดบริจาคในวันนี้ พักผ่อนให้เต็มที่แล้วมาใหม่ในวันถัดไป',
    deferralDurationTextEn: 'Defer for today. Get adequate sleep and return another day.',
    guidance: 'ควรนอนหลับติดต่อกันอย่างน้อย 5 ชั่วโมง เพื่อให้หลอดเลือดและระดับความดันโลหิตปรับตัวได้อย่างราบรื่น',
    guidanceEn: 'At least 5 hours of continuous sleep allows cardiovascular tone to adapt smoothly during donation.',
    officialReference: 'คู่มือ 2564 หน้า 23 ข้อ 2 & มาตรฐาน 2567',
  },
  {
    id: 'q-weight-age',
    category: 'PHYSICAL',
    number: 3,
    question: 'ท่านมีน้ำหนักตัวตั้งแต่ 45 กิโลกรัมขึ้นไป และมีอายุอยู่ในเกณฑ์ที่สามารถบริจาคในหน่วยนี้ได้?',
    questionEn: 'Is your body weight at least 45 kg (99 lbs) and is your age within eligible criteria for this mobile unit?',
    subtext: 'อายุ 17 ปีบริบูรณ์ต้องมีหนังสือยินยอมจากผู้ปกครอง / ผู้บริจาคครั้งแรกอายุต้องไม่เกิน 60 ปี / ผู้บริจาคประจำอายุ 60–65 ปี (สำหรับหน่วยเคลื่อนที่นี้ไม่รับผู้บริจาคอายุเกิน 65 ปี)',
    subtextEn: 'Age 17 requires parental consent form. First-time donors must be ≤ 60 years. Regular donors aged 60–65. (Donors > 65 years cannot donate at mobile units and must donate at fixed blood centres).',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'น้ำหนักตัวไม่ถึงเกณฑ์ (น้อยกว่า 45 กก.) หรืออยู่นอกเกณฑ์ช่วงอายุสำหรับหน่วยรับบริจาคโลหิตเคลื่อนที่',
    deferralReasonEn: 'Body weight under 45 kg or outside eligible age criteria for mobile collection unit',
    deferralDurationDays: 30,
    deferralDurationText: 'ต้องมีน้ำหนักตัวไม่น้อยกว่า 45 กก. และอยู่ในช่วงอายุตามเกณฑ์มาตรฐาน',
    deferralDurationTextEn: 'Must weigh at least 45 kg and meet age eligibility criteria',
    guidance: 'ปริมาตรโลหิตที่เจาะสัมพันธ์กับน้ำหนักตัว ผู้มีน้ำหนักต่ำกว่า 45 กก. เสี่ยงต่อภาวะช็อกจากการสูญเสียปริมาตรเลือด และผู้มีอายุ >65 ปีต้องรับการตรวจสุขภาพประจำปีและบริจาค ณ ศูนย์บริการโลหิตประจำที่',
    guidanceEn: 'Donation volume is calculated relative to total weight. Under 45 kg risks hypovolemia. Donors > 65 years must donate at fixed blood centres with annual health checks.',
    officialReference: 'มาตรฐาน 2567 บทที่ 2 ข้อ 2.1.1 & 2.1.2',
  },
  {
    id: 'q-meal-water',
    category: 'PHYSICAL',
    number: 4,
    question: 'ท่านได้รับประทานอาหารมื้อหลัก (หลีกเลี่ยงอาหารไขมันสูงอย่างน้อย 6 ชั่วโมง) และดื่มน้ำ 300–500 มล. ก่อนมาบริจาค?',
    questionEn: 'Have you eaten a non-fatty meal (avoiding high-fat foods for at least 6 hours) and drunk 300–500 mL of water before donation?',
    subtext: 'หลีกเลี่ยงของทอด ข้าวมันไก่ ข้าวขาหมู แกงกะทิ อย่างน้อย 6 ชั่วโมง (ไม่อดอาหาร) เพื่อป้องกันพลาสมาขุ่นขาว (Lipemic Plasma)',
    subtextEn: 'Avoid oily/fried foods at least 6 hours before donation (do not fast) to prevent lipemic (milky white) plasma.',
    idealAnswer: true,
    deferralType: 'CAUTION',
    deferralReason: 'ยังไม่ได้รับประทานอาหาร หรือรับประทานอาหารไขมันสูงมาภายใน 6 ชั่วโมง',
    deferralReasonEn: 'Fasting or recent high-fat meal consumption within 6 hours',
    deferralDurationDays: 1,
    deferralDurationText: 'รับประทานอาหารมื้อเบาไขมันต่ำและดื่มน้ำ 300–500 มล. (2–3 แก้ว) ประมาณ 30 นาทีก่อนบริจาค',
    deferralDurationTextEn: 'Have a light low-fat meal and drink 300–500 mL of water ~30 minutes before donation.',
    guidance: 'การดื่มน้ำช่วยเพิ่มปริมาตรสารน้ำในหลอดเลือด ลดโอกาสหน้ามืดเป็นลม และอาหารไขมันต่ำช่วยให้พลาสมามีคุณภาพดีพร้อมส่งต่อให้ผู้ป่วย',
    guidanceEn: 'Hydration expands plasma volume to prevent syncope, and low-fat meals ensure clear, transfusable plasma.',
    officialReference: 'คู่มือ 2564 หน้า 23 ข้อ 3',
  },

  // -------------------------------------------------------------
  // หมวด 2: ยา อาหาร และแอลกอฮอล์ (MEDICATIONS_VACCINES)
  // -------------------------------------------------------------
  {
    id: 'q-alcohol-24h',
    category: 'MEDICATIONS_VACCINES',
    number: 5,
    question: 'ท่านได้ดื่มเครื่องดื่มแอลกอฮอล์ทุกชนิด ภายใน 24 ชั่วโมงที่ผ่านมาหรือไม่?',
    questionEn: 'Have you consumed any alcoholic drinks (beer, wine, spirits) within the last 24 hours?',
    subtext: 'แอลกอฮอล์ทำให้ร่างกายขาดน้ำ เส้นเลือดขยายตัว และเสี่ยงต่อการเป็นลมรุนแรง',
    subtextEn: 'Alcohol causes systemic dehydration and vasodilation, sharply increasing fainting risks.',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ดื่มแอลกอฮอล์ภายใน 24 ชั่วโมง',
    deferralReasonEn: 'Alcohol consumption within 24 hours',
    deferralDurationDays: 1,
    deferralDurationText: 'งดบริจาค 24 ชั่วโมงหลังจากดื่มแอลกอฮอล์',
    deferralDurationTextEn: 'Defer for 24 hours after alcohol consumption',
    guidance: 'แอลกอฮอล์มีฤทธิ์ขับปัสสาวะและทำให้หลอดเลือดขยายตัว เสี่ยงต่อการเป็นลมและภาวะแทรกซ้อน',
    guidanceEn: 'Alcohol acts as a diuretic and vasodilator, greatly increasing the likelihood of fainting.',
    officialReference: 'คู่มือ 2564 หน้า 26 ข้อ 8',
  },
  {
    id: 'q-antibiotics-7d',
    category: 'MEDICATIONS_VACCINES',
    number: 6,
    question: 'ท่านได้รับประทานหรือฉีดยาปฏิชีวนะ (ยาฆ่าเชื้อแบคทีเรีย/ไวรัส) ภายใน 7 วันที่ผ่านมาหรือไม่?',
    questionEn: 'Have you taken or received oral/injected antibiotics or antiviral drugs within the last 7 days?',
    subtext: 'เช่น Amoxicillin, Augmentin, Ciprofloxacin, Azithromycin, Acyclovir ฯลฯ',
    subtextEn: 'E.g., Amoxicillin, Augmentin, Ciprofloxacin, Azithromycin, Acyclovir, etc.',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'เพิ่งรับประทานยาฆ่าเชื้อ/ปฏิชีวนะ หรือเพิ่งหายจากการติดเชื้อ',
    deferralReasonEn: 'Recent antibiotic medication or acute infection recovery',
    deferralDurationDays: 7,
    deferralDurationText: 'งดบริจาค 7 วันหลังจากหยุดยาและหายจากโรคเป็นปกติ',
    deferralDurationTextEn: 'Defer for 7 days after finishing medication course and full recovery.',
    guidance: 'ต้องเว้น 7 วันหลังหยุดยาเพื่อให้การติดเชื้อหายสนิทและไม่มีตัวยาตกค้างในกระแสเลือด',
    guidanceEn: 'Waiting 7 days ensures the infection is eradicated and residual antimicrobial drugs are cleared.',
    officialReference: 'คู่มือ 2564 หน้า 25 ข้อ 5 & หน้า 70 ข้อ 5',
  },
  {
    id: 'q-acne-isotretinoin',
    category: 'MEDICATIONS_VACCINES',
    number: 7,
    question: 'ท่านรับประทานยารักษาสิวกลุ่มอนุพันธ์วิตามินเอ (Isotretinoin / Roaccutane / Acnotin / Sotret) ในช่วง 1 เดือนที่ผ่านมาหรือไม่?',
    questionEn: 'Have you taken oral retinoid acne medications (Isotretinoin / Roaccutane / Acnotin) within the past month?',
    subtext: 'หรือยากลุ่ม Acitretin (Neotigason) ในช่วง 3 ปี / Finasteride (ยาปลูกผม) ในช่วง 1 เดือน / Dutasteride ในช่วง 6 เดือน',
    subtextEn: 'Or Acitretin within 3 years / Finasteride within 1 month / Dutasteride within 6 months',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ยารักษาสิวกลุ่มวิตามินเอ มีผลทำให้ทารกในครรภ์พิการรุนแรง (Teratogenic)',
    deferralReasonEn: 'Oral retinoids are highly teratogenic to developing fetuses',
    deferralDurationDays: 30,
    deferralDurationText: 'Isotretinoin งด 1 เดือน (4 สัปดาห์) / Acitretin งด 3 ปี / Finasteride งด 1 เดือน',
    deferralDurationTextEn: 'Isotretinoin: defer 1 month / Acitretin: defer 3 years / Finasteride: defer 1 month',
    guidance: 'หากโลหิตที่มีตัวยานี้ถูกนำไปให้หญิงตั้งครรภ์ จะทำให้ทารกในครรภ์เกิดความพิการแต่กำเนิดอย่างรุนแรง',
    guidanceEn: 'Residual retinoids transfused to a pregnant recipient cause devastating congenital birth defects.',
    officialReference: 'มาตรฐาน 2567 ข้อ 2.2.5.2 & คู่มือ 2564 หน้า 70 ข้อ 2',
  },

  // -------------------------------------------------------------
  // หมวด 3: หัตถการ ทันตกรรม และประวัติสุขภาพสำคัญ (PROCEDURES_LIFESTYLE)
  // -------------------------------------------------------------
  {
    id: 'q-dental-surgery',
    category: 'PROCEDURES_LIFESTYLE',
    number: 8,
    question: 'ท่านเพิ่งทำฟัน (ขูดหินปูน/อุดฟันใน 3 วัน, ถอนฟัน/ผ่าฟันคุดใน 7 วัน) หรือรับการผ่าตัดใหญ่ภายใน 6 เดือนที่ผ่านมาหรือไม่?',
    questionEn: 'Have you had dental work (scaling/fillings within 3 days, extraction/surgery within 7 days) or major surgery within 6 months?',
    subtext: 'แผลในช่องปากหรือแผลผ่าตัดต้องหายสนิท ไม่มีอาการอักเสบหรือเลือดออก',
    subtextEn: 'Gums and surgical wounds must be fully healed with no active inflammation or bleeding.',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'แบคทีเรียในช่องปากเข้าสู่กระแสเลือดชั่วคราว (Transient Bacteremia) หรือการฟื้นตัวจากการผ่าตัด',
    deferralReasonEn: 'Transient bacteremia from dental work or post-surgical recovery period',
    deferralDurationDays: 7,
    deferralDurationText: 'ทำฟันทั่วไปงด 3-7 วัน (แผลต้องหายดี) / ผ่าตัดใหญ่งด 6 เดือน',
    deferralDurationTextEn: 'Dental work: defer 3-7 days / Major surgery: defer 6 months',
    guidance: 'แบคทีเรียในช่องปากอาจเข้าสู่กระแสเลือดระหว่างทำฟันและขยายตัวในถุงโลหิต จึงต้องรอให้แผลหายสนิท',
    guidanceEn: 'Oral bacteria entering circulation can proliferate in stored blood bags; wounds must be completely healed.',
    officialReference: 'คู่มือ 2564 หน้า 27 ข้อ 16 & หน้า 75-76',
  },
  {
    id: 'q-tattoo-piercing',
    category: 'PROCEDURES_LIFESTYLE',
    number: 9,
    question: 'ท่านเคยสักผิวหนัง เจาะหู/ร่างกาย ฝังสีคิ้ว/ปาก หรือฝังเข็มในสถานที่ที่ไม่ใช่สถานพยาบาลปลอดเชื้อ ภายใน 4 เดือนที่ผ่านมาหรือไม่?',
    questionEn: 'Have you had tattoos, body piercings, microblading, or non-clinical acupuncture within the last 4 months?',
    subtext: 'ตามเกณฑ์ความปลอดภัยมาตรฐานระยะฟักตัวของเชื้อไวรัสทางกระแสเลือด (Window Period)',
    subtextEn: 'Safety waiting period to surpass the diagnostic window period for bloodborne pathogens.',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ความเสี่ยงต่อการติดเชื้อทางกระแสเลือด (HBV, HCV, HIV) ผ่านเข็มหรือสีสัก',
    deferralReasonEn: 'Potential bloodborne viral exposure (HBV, HCV, HIV) via piercing/tattoo equipment',
    deferralDurationDays: 120,
    deferralDurationText: 'งดบริจาคโลหิตอย่างน้อย 4 เดือนนับจากวันที่ทำหัตถการ',
    deferralDurationTextEn: 'Defer blood donation for at least 4 months from procedure date.',
    guidance: 'เข็มและอุปกรณ์สักเจาะมีความเสี่ยงแพร่เชื้อไวรัส จึงต้องรอให้พ้นระยะฟักตัว 4 เดือนเพื่อความปลอดภัย',
    guidanceEn: 'A 4-month waiting period ensures potential bloodborne viral infections surpass the diagnostic window.',
    officialReference: 'คู่มือ 2564 หน้า 75 ข้อ 1 & มาตรฐาน 2567 ข้อ 2.2.4',
  },
  {
    id: 'q-chronic-viral-risks',
    category: 'PROCEDURES_LIFESTYLE',
    number: 10,
    question: 'ท่านมีประวัติโรคหัวใจ มะเร็ง ไวรัสตับอักเสบบี/ซี ภาวะเลือดออกผิดปกติ หรือมีพฤติกรรมเสี่ยงทางเพศสัมพันธ์หรือไม่?',
    questionEn: 'Do you have a history of heart disease, cancer, Hepatitis B/C, bleeding disorders, or high-risk sexual behavior?',
    subtext: 'ตามนโยบายความปลอดภัยระดับชาติของศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย',
    subtextEn: 'In accordance with National Blood Centre (Thai Red Cross Society) safety guidelines.',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'โรคเรื้อรังสำคัญ โรคติดต่อทางกระแสเลือด หรือพฤติกรรมเสี่ยงทางเพศ',
    deferralReasonEn: 'High-risk clinical conditions, bloodborne viral carriage, or behavioral risk criteria',
    guidance: 'เพื่อความปลอดภัยของผู้บริจาคและผู้ป่วยที่รับโลหิต ผู้ที่มีประวัติกลุ่มนี้เป็นเกณฑ์งดบริจาคถาวร',
    guidanceEn: 'For donor wellness and recipient safety, these conditions require permanent deferral.',
    officialReference: 'คู่มือ 2564 หน้า 26-27 & หน้า 61-65',
  },
];

export interface ScreeningEvaluationResult {
  status: 'ELIGIBLE' | 'TEMPORARY_DEFERRAL' | 'PERMANENT_DEFERRAL' | 'CAUTION';
  summaryTitle: string;
  summaryBadge: string;
  summaryMessage: string;
  colorClass: string;
  flaggedQuestions: {
    question: ScreeningQuestion;
    userAnswer: boolean;
    reason: string;
    durationText?: string;
    guidance: string;
  }[];
  earliestEligibleDate?: string;
  canProceedToRegister: boolean;
}

export function evaluateScreeningAnswers(
  answers: Record<string, boolean>,
  lang: 'th' | 'en' = 'th'
): ScreeningEvaluationResult {
  const isEn = lang === 'en';
  const flagged: ScreeningEvaluationResult['flaggedQuestions'] = [];
  let hasPermanent = false;
  let hasTemporary = false;
  let hasCaution = false;
  let maxDays = 0;

  for (const q of OFFICIAL_SCREENING_QUESTIONS) {
    const userVal = answers[q.id];
    if (userVal === undefined) continue;

    // Check if the answer differs from ideal
    if (userVal !== q.idealAnswer) {
      flagged.push({
        question: q,
        userAnswer: userVal,
        reason: isEn && q.deferralReasonEn ? q.deferralReasonEn : q.deferralReason,
        durationText: isEn && q.deferralDurationTextEn ? q.deferralDurationTextEn : q.deferralDurationText,
        guidance: isEn && q.guidanceEn ? q.guidanceEn : q.guidance,
      });

      if (q.deferralType === 'PERMANENT') {
        hasPermanent = true;
      } else if (q.deferralType === 'TEMPORARY') {
        hasTemporary = true;
        if (q.deferralDurationDays && q.deferralDurationDays > maxDays) {
          maxDays = q.deferralDurationDays;
        }
      } else if (q.deferralType === 'CAUTION') {
        hasCaution = true;
      }
    }
  }

  // Calculate earliest eligible date if temporary deferral exists
  let earliestDateStr: string | undefined = undefined;
  if (maxDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + maxDays);
    earliestDateStr = isEn
      ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  if (hasPermanent) {
    return {
      status: 'PERMANENT_DEFERRAL',
      summaryTitle: isEn
        ? 'Preliminary Guidance: Permanent Deferral Criteria Met'
        : 'คำแนะนำเบื้องต้น: อยู่ในเกณฑ์งดบริจาคโลหิตถาวร',
      summaryBadge: isEn ? 'Permanent Deferral' : 'เกณฑ์งดบริจาคถาวร',
      summaryMessage: isEn
        ? 'Based on your medical history, you meet permanent deferral criteria under National Blood Centre standards for your safety and recipient protection. You can still support our campaign through volunteering and public awareness!'
        : 'จากข้อมูลประวัติสุขภาพ เพื่อความปลอดภัยของตัวท่านเองและผู้ป่วยที่รับโลหิต ท่านอยู่ในเกณฑ์ที่ต้องงดบริจาคโลหิตอย่างถาวรตามมาตรฐานศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย ทั้งนี้ท่านยังสามารถร่วมสนับสนุนโครงการผ่านการส่งต่อข่าวสารและกิจกรรมจิตอาสาได้',
      colorClass: 'bg-red-50 border-red-300 text-red-900',
      flaggedQuestions: flagged,
      canProceedToRegister: false,
    };
  }

  if (hasTemporary) {
    return {
      status: 'TEMPORARY_DEFERRAL',
      summaryTitle: isEn
        ? 'Preliminary Guidance: Temporary Deferral Recommended'
        : 'คำแนะนำเบื้องต้น: ควรเลื่อนการบริจาคโลหิตชั่วคราว',
      summaryBadge: isEn ? 'Temporary Deferral' : 'ควรเลื่อนชั่วคราว',
      summaryMessage: isEn
        ? `Based on your responses, there are temporary health, procedure, or medication factors that require a safety waiting period. You will be eligible to be evaluated again around ${earliestDateStr || 'the specified waiting period'}.`
        : `จากข้อมูลที่ท่านตอบ มีปัจจัยทางสุขภาพ การใช้ยา หรือหัตถการที่ควรเว้นระยะเวลาความปลอดภัยชั่วคราว โดยคาดว่าจะสามารถเข้ารับการประเมินได้อีกครั้งประมาณวันที่ ${earliestDateStr || 'ตามระยะเวลาที่กำหนด'}`,
      colorClass: 'bg-amber-50 border-amber-300 text-amber-900',
      flaggedQuestions: flagged,
      earliestEligibleDate: earliestDateStr,
      canProceedToRegister: false,
    };
  }

  if (hasCaution) {
    return {
      status: 'CAUTION',
      summaryTitle: isEn
        ? 'Preliminary Guidance: Additional Pre-Donation Preparation Recommended'
        : 'คำแนะนำเบื้องต้น: ควรเตรียมความพร้อมเพิ่มเติมก่อนรับการประเมินหน้างาน',
      summaryBadge: isEn ? 'Preparation Needed' : 'ควรเตรียมตัวเพิ่มเติม',
      summaryMessage: isEn
        ? 'Please drink 300–500 mL of water, have a non-fatty meal, and inform the on-site screening staff about your condition before donation.'
        : 'แนะนำให้ดื่มน้ำ 300–500 มล. (2–3 แก้ว) รับประทานอาหารมื้อหลักที่มีไขมันต่ำ และแจ้งเจ้าหน้าที่คัดกรองหน้างานเพื่อประเมินความพร้อมก่อนเจาะบริจาค',
      colorClass: 'bg-blue-50 border-blue-300 text-blue-900',
      flaggedQuestions: flagged,
      canProceedToRegister: true,
    };
  }

  return {
    status: 'ELIGIBLE',
    summaryTitle: isEn
      ? 'Preliminary Self-Screening Complete'
      : 'จากข้อมูลเบื้องต้น ไม่พบปัจจัยที่ระบบใช้แจ้งให้เลื่อนการบริจาค',
    summaryBadge: isEn ? 'Ready for On-site Screening' : 'พร้อมรับการประเมินหน้างาน',
    summaryMessage: isEn
      ? 'Based on your answers, no preliminary deferral factors were identified. You may proceed to choose your arrival time slot. (Official eligibility is determined on-site by Thai Red Cross medical staff after medical questionnaire review and hemoglobin screening).'
      : 'จากข้อมูลที่ท่านตอบ ไม่พบข้อบ่งชี้ที่ต้องเลื่อนการบริจาคในเบื้องต้น สามารถดำเนินการเลือกช่วงเวลาเดินทางเพื่อมาเข้ารับการประเมินและคัดกรองโดยเจ้าหน้าที่ ณ จุดรับบริจาคโลหิต (ทั้งนี้ ผู้บริจาคทุกท่านจะต้องผ่านการซักประวัติตรวจคัดกรองและตรวจความเข้มข้นโลหิตโดยเจ้าหน้าที่สภากาชาดหน้างานก่อนการบริจาคจริง)',
    colorClass: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    flaggedQuestions: [],
    canProceedToRegister: true,
  };
}
