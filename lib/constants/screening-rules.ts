/**
 * MUMT Blood Donation 2026 — Clinical Screening Rules & Standard Criteria
 * 
 * Sources of Truth:
 * 1. คู่มือการรับบริจาคโลหิต ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (พ.ศ. 2564)
 * 2. มาตรฐานธนาคารเลือดและงานบริการโลหิต ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (ฉบับพิมพ์ครั้งที่ 5, พ.ศ. 2567)
 * 3. บทที่ 4 การทดสอบโลหิตบริจาค (ฉบับปรับปรุง 21 มีนาคม 2568)
 * 4. สภากาชาดไทย (redcross.or.th)
 */

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
    subtext: 'ผู้บริจาคต้องมีสุขภาพแข็งแรงสมบูรณ์ในวันที่มาบริจาค เพื่อความปลอดภัยของทั้งตัวท่านและโลหิตที่ได้',
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
    question: 'เมื่อคืนที่ผ่านมา ท่านได้นอนหลับพักผ่อนเพียงพอ ไม่น้อยกว่า 5-6 ชั่วโมงติดต่อกัน?',
    questionEn: 'Did you get at least 5-6 hours of continuous, restful sleep last night?',
    subtext: 'การอดนอนหรือพักผ่อนไม่เพียงพอ เพิ่มความเสี่ยงต่อการหน้ามืด เป็นลม หรือความดันโลหิตตกอย่างมาก',
    subtextEn: 'Inadequate sleep significantly increases the risk of vasovagal syncope, dizziness, or acute hypotension.',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'พักผ่อนไม่เพียงพอ (< 5 ชั่วโมง)',
    deferralReasonEn: 'Insufficient sleep (< 5 hours of continuous rest)',
    deferralDurationDays: 1,
    deferralDurationText: 'งดบริจาคในวันนี้ พักผ่อนให้เต็มที่แล้วมาใหม่ในวันถัดไป',
    deferralDurationTextEn: 'Defer for today. Get adequate sleep and return another day.',
    guidance: 'ควรนอนหลับอย่างน้อย 5-6 ชั่วโมง เพื่อให้หลอดเลือดและระดับความดันโลหิตปรับตัวได้อย่างราบรื่น',
    guidanceEn: '5-6 hours of continuous sleep allows cardiovascular tone to adapt smoothly during donation.',
    officialReference: 'คู่มือ 2564 หน้า 23 ข้อ 2 & มาตรฐาน 2567',
  },
  {
    id: 'q-weight-age',
    category: 'PHYSICAL',
    number: 3,
    question: 'ท่านมีน้ำหนักตัวตั้งแต่ 45 กิโลกรัมขึ้นไป และมีอายุระหว่าง 17-70 ปีบริบูรณ์?',
    questionEn: 'Is your body weight at least 45 kg (99 lbs) and are you between 17-70 years of age?',
    subtext: 'อายุ 17 ปีบริบูรณ์ต้องมีหนังสือยินยอมจากผู้ปกครอง / ผู้บริจาคครั้งแรกอายุต้องไม่เกิน 60 ปี',
    subtextEn: 'Age 17 requires signed parental consent form. First-time donors must be under 60 years old.',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'น้ำหนักตัวไม่ถึงเกณฑ์ (น้อยกว่า 45 กก.) หรืออยู่นอกเกณฑ์ช่วงอายุ',
    deferralReasonEn: 'Body weight under 45 kg or outside eligible age criteria',
    deferralDurationDays: 30,
    deferralDurationText: 'ต้องมีน้ำหนักตัวไม่น้อยกว่า 45 กก. จึงจะสามารถบริจาคโลหิตได้',
    deferralDurationTextEn: 'Must weigh at least 45 kg to donate blood safely',
    guidance: 'ปริมาตรโลหิตที่เจาะสัมพันธ์กับน้ำหนักตัว ผู้ที่มีน้ำหนักต่ำกว่า 45 กก. มีความเสี่ยงต่อภาวะช็อกจากการสูญเสียปริมาตรเลือด',
    guidanceEn: 'Donation blood volume is calculated relative to total weight; under 45 kg risks hypovolemia.',
    officialReference: 'มาตรฐาน 2567 บทที่ 2 ข้อ 2.1.1 & 2.1.2',
  },
  {
    id: 'q-meal-water',
    category: 'PHYSICAL',
    number: 4,
    question: 'ท่านได้รับประทานอาหารมื้อหลัก (ไม่ใช่อาหารมันจัด) และดื่มน้ำอย่างน้อย 3-4 แก้วก่อนมาบริจาค?',
    questionEn: 'Have you eaten a healthy meal (avoiding heavy/fatty foods) and drunk 3-4 glasses of water before donating?',
    subtext: 'หลีกเลี่ยงของทอด ข้าวมันไก่ ข้าวขาหมู แกงกะทิ ภายใน 3-4 ชั่วโมง เพื่อป้องกันพลาสมาขุ่นขาว (Lipemic Plasma)',
    subtextEn: 'Avoid oily/fried foods within 3-4 hours to prevent lipemic (milky white) plasma.',
    idealAnswer: true,
    deferralType: 'CAUTION',
    deferralReason: 'ยังไม่ได้รับประทานอาหาร หรือรับประทานอาหารไขมันสูงมา',
    deferralReasonEn: 'Fasting or recent high-fat meal consumption',
    deferralDurationDays: 1,
    deferralDurationText: 'รับประทานอาหารมื้อเบาและดื่มน้ำ 3-4 แก้วก่อนเข้าเจาะบริจาค',
    deferralDurationTextEn: 'Have a light meal and drink 3-4 glasses of water before donation.',
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
    subtext: 'หรือยากลุ่ม Acitretin (Neotigason) ในช่วง 3 ปี / Finasteride (ยาปลูกผม) ในช่วง 1 เดือน',
    subtextEn: 'Or Acitretin within 3 years / Finasteride (hair loss) within 1 month',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ยารักษาสิวกลุ่มวิตามินเอ มีผลทำให้ทารกในครรภ์พิการรุนแรง (Teratogenic)',
    deferralReasonEn: 'Oral retinoids are highly teratogenic to developing fetuses',
    deferralDurationDays: 30,
    deferralDurationText: 'Isotretinoin งด 1 เดือน (4 สัปดาห์) / Acitretin งด 3 ปี',
    deferralDurationTextEn: 'Isotretinoin: defer 1 month / Acitretin: defer 3 years',
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
    guidance: 'เข็มและอุปกรณ์สักเจาะมีความเสี่ยงแพร่เชื้อไวรัส จึงต้องรอให้พ้นระยะฟักตัว 4 เดือนเพื่อความปลอดภัยสูงสุด',
    guidanceEn: 'A 4-month waiting period ensures potential bloodborne viral infections surpass the diagnostic window.',
    officialReference: 'คู่มือ 2564 หน้า 75 ข้อ 1 & มาตรฐาน 2567 ข้อ 2.2.4',
  },
  {
    id: 'q-chronic-viral-risks',
    category: 'PROCEDURES_LIFESTYLE',
    number: 10,
    question: 'ท่านมีประวัติโรคหัวใจ มะเร็ง ไวรัสตับอักเสบบี/ซี ภาวะเลือดออกผิดปกติ หรือมีพฤติกรรมเสี่ยงทางเพศสัมพันธ์หรือไม่?',
    questionEn: 'Do you have a history of heart disease, cancer, Hepatitis B/C, bleeding disorders, or high-risk sexual behavior?',
    subtext: 'ตามนโยบายความปลอดภัยสูงสุดระดับชาติของศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย',
    subtextEn: 'In accordance with National Blood Centre (Thai Red Cross Society) safety guidelines.',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'โรคเรื้อรังร้ายแรง โรคติดต่อทางกระแสเลือด หรือพฤติกรรมเสี่ยงทางเพศ',
    deferralReasonEn: 'High-risk clinical conditions, bloodborne viral carriage, or behavioral risk criteria',
    guidance: 'เพื่อความปลอดภัยสูงสุดของผู้บริจาคและผู้ป่วยที่รับโลหิต ผู้ที่มีประวัติกลุ่มนี้เป็นเกณฑ์งดบริจาคถาวร',
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
        ? 'We are sorry, you are currently not eligible to donate blood (Permanent Deferral)'
        : 'ขออภัย ท่านยังไม่สามารถบริจาคโลหิตได้ (งดบริจาคถาวร)',
      summaryBadge: isEn ? 'Not Eligible' : 'ไม่ผ่านเกณฑ์การบริจาค',
      summaryMessage: isEn
        ? 'Based on your medical history, for the safety of both yourself and the blood recipient, you meet permanent deferral criteria. However, you can still support by sharing campaign news and participating in volunteer activities.'
        : 'จากข้อมูลประวัติสุขภาพ เพื่อความปลอดภัยสูงสุดของตัวท่านเองและผู้ป่วยที่รับโลหิต ท่านอยู่ในเกณฑ์ที่ต้องงดบริจาคโลหิตอย่างถาวร แต่ท่านยังสามารถร่วมเป็นส่วนหนึ่งในการประชาสัมพันธ์ ส่งต่อข่าวสาร และทำกิจกรรมจิตอาสาช่วยเหลือสังคมได้',
      colorClass: 'bg-red-50 border-red-300 text-red-900',
      flaggedQuestions: flagged,
      canProceedToRegister: false,
    };
  }

  if (hasTemporary) {
    return {
      status: 'TEMPORARY_DEFERRAL',
      summaryTitle: isEn
        ? 'Temporary Deferral Required'
        : 'ท่านต้องงดบริจาคโลหิตชั่วคราว',
      summaryBadge: isEn ? 'Temporary Deferral' : 'งดบริจาคชั่วคราว',
      summaryMessage: isEn
        ? `You have temporary health or medication factors that require waiting for safety. You will be eligible to donate again around ${earliestDateStr || 'in the future'}.`
        : `ท่านมีปัจจัยทางสุขภาพ การใช้ยา หรือหัตถการที่ต้องเว้นระยะเวลาความปลอดภัยชั่วคราว โดยท่านจะสามารถกลับมาบริจาคได้ประมาณวันที่ ${earliestDateStr || 'ตามระยะเวลาที่กำหนด'}`,
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
        ? 'Eligible with Pre-Donation Care & On-Site Screening'
        : 'สามารถบริจาคได้ (เตรียมตัวเพิ่มเติมและคัดกรองหน้างาน)',
      summaryBadge: isEn ? 'Eligible (With Care)' : 'ผ่านเกณฑ์ (มีข้อควรระวัง)',
      summaryMessage: isEn
        ? 'You are eligible to donate. Please drink 3-4 glasses of water, have a light meal, and inform the on-site screening staff about your condition before donation.'
        : 'ท่านสามารถบริจาคโลหิตได้ กรุณาดื่มน้ำ 3-4 แก้ว รับประทานอาหารมื้อหลักที่มีไขมันต่ำ และแจ้งเจ้าหน้าที่คัดกรองหน้างานอีกครั้งก่อนเจาะบริจาค',
      colorClass: 'bg-blue-50 border-blue-300 text-blue-900',
      flaggedQuestions: flagged,
      canProceedToRegister: true,
    };
  }

  return {
    status: 'ELIGIBLE',
    summaryTitle: isEn
      ? 'Congratulations! You Meet Pre-Screening Readiness Criteria'
      : 'ยินดีด้วย! ท่านผ่านการประเมินความพร้อมเบื้องต้น',
    summaryBadge: isEn ? 'Ready to Donate' : 'พร้อมบริจาคโลหิต',
    summaryMessage: isEn
      ? 'Your preliminary self-screening is complete. Please proceed to reserve your arrival time slot. (Note: On-site screening by Thai Red Cross staff is required before donation).'
      : 'ท่านมีความพร้อมเบื้องต้นในการบริจาคโลหิต สามารถดำเนินการเลือกรอบเวลาเดินทางได้เลย (หมายเหตุ: ท่านจะต้องผ่านการตรวจวัดความเข้มข้นโลหิตและคัดกรองกับเจ้าหน้าที่หน้างานอีกครั้ง)',
    colorClass: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    flaggedQuestions: [],
    canProceedToRegister: true,
  };
}
