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
    desc: 'สุขภาพ การนอนหลับพักผ่อน น้ำหนักตัว อาหาร น้ำ และแอลกอฮอล์',
    descEn: 'General wellness, sleep, body weight, meals, hydration, and alcohol',
    icon: 'Activity',
  },
  {
    id: 'MEDICATIONS_VACCINES',
    title: '2. การใช้ยาสำคัญ',
    titleEn: '2. Key Medications',
    desc: 'ยารักษาสิวกลุ่มอนุพันธ์วิตามินเอ (Isotretinoin) และยาปฏิชีวนะ',
    descEn: 'Oral retinoid acne medications (Isotretinoin) and antibiotics',
    icon: 'Pill',
  },
  {
    id: 'PROCEDURES_LIFESTYLE',
    title: '3. หัตถการ ทันตกรรม และประวัติสุขภาพ',
    titleEn: '3. Procedures, Dental & Clinical History',
    desc: 'ทันตกรรม เสริมความงาม สัก เจาะร่างกาย ผ่าตัด และประวัติสุขภาพสำคัญ',
    descEn: 'Dental work, aesthetic procedures, tattoos, piercings, surgery, and clinical history',
    icon: 'Stethoscope',
  },
];

export const OFFICIAL_SCREENING_QUESTIONS: ScreeningQuestion[] = [
  // -------------------------------------------------------------
  // หมวด 1: ข้อมูลสุขภาพและความพร้อมทั่วไป (PHYSICAL)
  // -------------------------------------------------------------
  {
    id: 'q-general-health-sleep',
    category: 'PHYSICAL',
    number: 1,
    question: 'วันนี้ท่านรู้สึกสบายดี สุขภาพแข็งแรง (ไม่มีไข้ หวัด เจ็บคอ อ่อนเพลีย ท้องเสีย) และเมื่อคืนได้นอนหลับพักผ่อนติดต่อกันอย่างน้อย 5 ชั่วโมง?',
    questionEn: 'Do you feel well and healthy today (free of fever, cold, sore throat, fatigue, diarrhea) and did you get at least 5 hours of continuous sleep last night?',
    subtext: 'ผู้บริจาคต้องมีสุขภาพแข็งแรงในวันที่บริจาค และนอนหลับอย่างน้อย 5 ชม. เพื่อให้ระบบไหลเวียนโลหิตและหลอดเลือดปรับตัวได้ดี ป้องกันอาการหน้ามืดเป็นลม',
    subtextEn: 'Donors must be in good health and have at least 5 hours of restful sleep to ensure cardiovascular stability and prevent fainting during donation.',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'ร่างกายยังไม่พร้อมสมบูรณ์จากอาการเจ็บป่วยเฉียบพลัน หรือนอนหลับพักผ่อนน้อยกว่า 5 ชั่วโมง',
    deferralReasonEn: 'Not fully physically ready due to acute illness or less than 5 hours of continuous sleep',
    deferralDurationDays: 7,
    deferralDurationText: 'เกณฑ์ระยะเวลาความพร้อม: พักผ่อนให้เต็มที่อย่างน้อย 5 ชั่วโมง หรือรอให้หายป่วยเป็นปกติอย่างน้อย 7 วัน',
    deferralDurationTextEn: 'Readiness criteria: Get at least 5 hours of continuous sleep or wait 7 days after full recovery from illness',
    guidance: 'สอนวิธีเตรียมตัว: หากมีไข้หวัดหรือไม่สบาย แนะนำให้พักผ่อนจนหายสนิทอย่างน้อย 7 วัน และในคืนก่อนวันบริจาคควรนอนหลับพักผ่อนให้เพียงพอติดต่อกันไม่น้อยกว่า 5 ชั่วโมง เพื่อให้ร่างกายสดชื่นพร้อมบริจาคอย่างปลอดภัย',
    guidanceEn: 'Preparation guide: Rest until fully recovered from any illness for at least 7 days, and ensure at least 5 hours of continuous sleep on the night before donation.',
    officialReference: 'คู่มือการรับบริจาคโลหิต ศูนย์บริการโลหิตแห่งชาติ (2564) หน้า 23 ข้อ 1-2',
  },
  {
    id: 'q-weight-age',
    category: 'PHYSICAL',
    number: 2,
    question: 'ท่านมีน้ำหนักตัวตั้งแต่ 45 กิโลกรัมขึ้นไป และมีอายุอยู่ในเกณฑ์ที่สามารถบริจาคได้?',
    questionEn: 'Is your body weight at least 45 kg (99 lbs) and is your age within eligible donation criteria?',
    subtext: 'อายุ 17 ปีบริบูรณ์ต้องมีหนังสือยินยอมจากผู้ปกครอง / ผู้บริจาคครั้งแรกอายุต้องไม่เกิน 60 ปี / ผู้บริจาคประจำอายุ 60–65 ปี (สำหรับหน่วยเคลื่อนที่นี้ไม่รับผู้บริจาคอายุเกิน 65 ปี)',
    subtextEn: 'Age 17 requires parental consent form. First-time donors must be ≤ 60 years. Regular donors aged 60–65. (Donors > 65 years cannot donate at mobile units).',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'น้ำหนักตัวน้อยกว่า 45 กิโลกรัม หรืออยู่นอกเกณฑ์ช่วงอายุสำหรับหน่วยรับบริจาคโลหิตเคลื่อนที่',
    deferralReasonEn: 'Body weight under 45 kg or outside eligible age criteria for mobile collection unit',
    deferralDurationDays: 30,
    deferralDurationText: 'เกณฑ์ความพร้อม: ต้องมีน้ำหนักตัวไม่น้อยกว่า 45 กก. และอยู่ในช่วงอายุตามเกณฑ์มาตรฐาน',
    deferralDurationTextEn: 'Readiness criteria: Must weigh at least 45 kg and meet age eligibility criteria',
    guidance: 'สอนวิธีเตรียมตัว: ปริมาตรโลหิตที่เจาะสัมพันธ์กับน้ำหนักตัว ผู้มีน้ำหนักต่ำกว่า 45 กก. เสี่ยงต่อภาวะความดันตกจากการสูญเสียปริมาตรเลือด แนะนำให้ดูแลโภชนาการให้ร่างกายมีน้ำหนักถึงเกณฑ์เพื่อความปลอดภัย',
    guidanceEn: 'Preparation guide: Blood collection volume is proportional to body weight. Weighing under 45 kg risks hypotension. Maintain balanced nutrition to safely reach 45+ kg.',
    officialReference: 'มาตรฐานงานบริการโลหิต (2567) บทที่ 2 ข้อ 2.1.1 & 2.1.2',
  },
  {
    id: 'q-meal-water-alcohol',
    category: 'PHYSICAL',
    number: 3,
    question: 'ท่านได้รับประทานอาหารมื้อหลัก (เลี่ยงของมัน/ทอดอย่างน้อย 6 ชม.), ดื่มน้ำ 300–500 มล. ก่อนบริจาค และไม่อยู่ในภาวะดื่มแอลกอฮอล์ใน 24 ชม. ที่ผ่านมา?',
    questionEn: 'Have you eaten a non-fatty meal (avoiding oily/fried foods for 6 hours), drunk 300–500 mL of water, and refrained from alcohol in the past 24 hours?',
    subtext: 'ไม่อดอาหาร หลีกเลี่ยงของทอด/ข้าวมันไก่/ขาหมู/กะทิ อย่างน้อย 6 ชม. เพื่อป้องกันพลาสมาขุ่นขาว (Lipemic Plasma) ดื่มน้ำ 3-4 แก้ว และงดแอลกอฮอล์เพื่อป้องกันร่างกายขาดน้ำ',
    subtextEn: 'Do not fast. Avoid high-fat meals for 6 hours to prevent lipemic plasma. Drink 3-4 glasses of water and avoid alcohol to prevent acute dehydration and dizziness.',
    idealAnswer: true,
    deferralType: 'CAUTION',
    deferralReason: 'ยังไม่ได้รับประทานอาหาร, รับประทานอาหารไขมันสูงมาภายใน 6 ชม., ดื่มน้ำน้อย หรือดื่มแอลกอฮอล์ภายใน 24 ชม.',
    deferralReasonEn: 'Fasting, high-fat meal within 6 hours, insufficient hydration, or alcohol consumption within 24 hours',
    deferralDurationDays: 1,
    deferralDurationText: 'เกณฑ์ระยะเวลาความพร้อม: ดื่มน้ำ 300-500 มล., ทานอาหารมื้อเบาไขมันต่ำ และเว้นอย่างน้อย 24 ชม. หลังดื่มแอลกอฮอล์',
    deferralDurationTextEn: 'Readiness criteria: Drink 300-500 mL water, eat a light low-fat meal, and wait 24 hours after alcohol',
    guidance: 'สอนวิธีเตรียมตัว: รับประทานอาหารมื้อเบา เช่น ข้าวต้ม ก๋วยเตี๋ยว แซนด์วิช (หลีกเลี่ยงของทอดและแกงกะทิ) ดื่มน้ำ 3-4 แก้ว (300-500 มล.) ประมาณ 30 นาทีก่อนบริจาคเพื่อเพิ่มปริมาตรเลือด และเว้น 24 ชั่วโมงหลังจากดื่มแอลกอฮอล์เพื่อให้ระบบไหลเวียนโลหิตพร้อมสมบูรณ์',
    guidanceEn: 'Preparation guide: Eat a light, low-fat meal (e.g., porridge, noodles, sandwich), drink 3-4 glasses of water 30 mins before donation, and abstain from alcohol for 24 hours.',
    officialReference: 'คู่มือการรับบริจาคโลหิต (2564) หน้า 23 ข้อ 3 & หน้า 26 ข้อ 8',
  },

  // -------------------------------------------------------------
  // หมวด 2: การใช้ยาสำคัญ (MEDICATIONS_VACCINES)
  // -------------------------------------------------------------
  {
    id: 'q-acne-isotretinoin',
    category: 'MEDICATIONS_VACCINES',
    number: 4,
    question: 'ท่านรับประทานยารักษาสิวกลุ่มอนุพันธ์วิตามินเอ (Isotretinoin / Roaccutane / Acnotin / Sotret) ในช่วง 1 เดือนที่ผ่านมาหรือไม่?',
    questionEn: 'Have you taken oral retinoid acne medications (Isotretinoin / Roaccutane / Acnotin / Sotret) within the past 1 month?',
    subtext: 'หรือยากลุ่ม Acitretin (Neotigason) ในช่วง 3 ปี / Finasteride (ยาปลูกผม) ในช่วง 1 เดือน / Dutasteride ในช่วง 6 เดือน',
    subtextEn: 'Or Acitretin (Neotigason) within 3 years / Finasteride within 1 month / Dutasteride within 6 months',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ยารักษาสิวกลุ่มอนุพันธ์วิตามินเอ (Isotretinoin) มีผลต่อทารกในครรภ์ จึงต้องเว้นระยะความปลอดภัยให้ร่างกายขับยาออกหมด',
    deferralReasonEn: 'Oral retinoids (Isotretinoin) have severe teratogenic risks to unborn fetuses, requiring safety clearance time',
    deferralDurationDays: 30,
    deferralDurationText: 'เกณฑ์ระยะเวลาความพร้อม: เว้น 1 เดือน (4 สัปดาห์) หลังหยุดยา Isotretinoin / Roaccutane (หากเป็น Acitretin เว้น 3 ปี)',
    deferralDurationTextEn: 'Readiness criteria: Wait 1 month (4 weeks) after stopping Isotretinoin / Roaccutane (Acitretin: 3 years)',
    guidance: 'สอนวิธีเตรียมตัว: หากกำลังรับประทานยารักษาสิวกลุ่มนี้ แนะนำให้รับประทานยาตามที่แพทย์สั่งให้จบคอร์สรักษา และเมื่อหยุดยาครบ 1 เดือนเต็ม ร่างกายจะขจัดตัวยาออกจากกระแสเลือดอย่างสมบูรณ์ พร้อมสำหรับการบริจาคโลหิตที่ปลอดภัยสูงสุดต่อผู้รับโลหิต',
    guidanceEn: 'Preparation guide: Complete your prescribed acne treatment course as directed by your physician. Once you have stopped taking the medication for 1 full month, residual drug will be cleared, making you fully ready to donate safely.',
    officialReference: 'มาตรฐานงานบริการโลหิต (2567) ข้อ 2.2.5.2 & คู่มือ 2564 หน้า 70 ข้อ 2',
  },
  {
    id: 'q-antibiotics-7d',
    category: 'MEDICATIONS_VACCINES',
    number: 5,
    question: 'ท่านได้รับประทานหรือฉีดยาปฏิชีวนะ (ยาฆ่าเชื้อแบคทีเรีย/ไวรัส) ภายใน 7 วันที่ผ่านมาหรือไม่?',
    questionEn: 'Have you taken or received oral/injected antibiotics or antiviral medications within the past 7 days?',
    subtext: 'เช่น Amoxicillin, Augmentin, Ciprofloxacin, Azithromycin, Doxycycline, Acyclovir ฯลฯ',
    subtextEn: 'E.g., Amoxicillin, Augmentin, Ciprofloxacin, Azithromycin, Doxycycline, Acyclovir, etc.',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'เพิ่งรับประทานยาฆ่าเชื้อหรือเพิ่งหายจากการติดเชื้อ ร่างกายต้องใช้เวลาฟื้นฟูและขับยาออกจากกระแสเลือด',
    deferralReasonEn: 'Recent antibiotic/antiviral medication or acute infection recovery period',
    deferralDurationDays: 7,
    deferralDurationText: 'เกณฑ์ระยะเวลาความพร้อม: เว้น 7 วันหลังหยุดยาปฏิชีวนะและหายจากโรคเป็นปกติสมบูรณ์',
    deferralDurationTextEn: 'Readiness criteria: Wait 7 days after stopping antibiotics and achieving full recovery',
    guidance: 'สอนวิธีเตรียมตัว: แนะนำให้รับประทานยาปฏิชีวนะให้ครบตามแพทย์สั่งจนหายป่วยสนิท จากนั้นนับระยะเวลาเว้นช่วง 7 วันหลังทานยาวันสุดท้าย เพื่อให้ร่างกายกำจัดตัวยาตกค้างและระบบภูมิคุ้มกันฟื้นตัวเต็มที่',
    guidanceEn: 'Preparation guide: Complete your prescribed antibiotics course until fully recovered, then wait 7 days after the last dose to allow complete drug clearance and immune stabilization.',
    officialReference: 'คู่มือการรับบริจาคโลหิต (2564) หน้า 25 ข้อ 5 & หน้า 70 ข้อ 5',
  },

  // -------------------------------------------------------------
  // หมวด 3: หัตถการ ทันตกรรม และประวัติสุขภาพ (PROCEDURES_LIFESTYLE)
  // -------------------------------------------------------------
  {
    id: 'q-procedures-tattoo-dental',
    category: 'PROCEDURES_LIFESTYLE',
    number: 6,
    question: 'ท่านเพิ่งทำฟัน, ฉีดโบท็อกซ์/ฟิลเลอร์/เลเซอร์, สักผิวหนัง, เจาะหู/ร่างกาย หรือผ่าตัด ภายในระยะเวลาเฝ้าระวังหรือไม่?',
    questionEn: 'Have you recently had dental work, aesthetic procedures (Botox/fillers/laser), tattoos, body piercings, or surgery within the safety interval?',
    subtext: 'ทันตกรรม: ขูดหินปูน/อุดฟัน (3 วัน), ถอนฟัน/ผ่าฟันคุด (7 วัน) | เสริมความงาม: โบท็อกซ์/ฟิลเลอร์/เมโส/เลเซอร์ (7 วัน) | สัก/เจาะร่างกาย (4 เดือน) | ผ่าตัดใหญ่ (6 เดือน)',
    subtextEn: 'Dental: scaling/fillings (3 days), extraction/wisdom tooth (7 days) | Aesthetics: Botox/fillers/laser (7 days) | Tattoos/piercings (4 months) | Major surgery (6 months)',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'มีประวัติทำหัตถการ ทันตกรรม เสริมความงาม หรือสักเจาะผิวหนังที่ต้องเว้นระยะเวลาความปลอดภัย',
    deferralReasonEn: 'Recent dental, aesthetic, tattoo/piercing, or surgical procedure requiring a safety interval',
    deferralDurationDays: 120,
    deferralDurationText: 'เกณฑ์ระยะเวลาความพร้อม: ทันตกรรม 3-7 วัน / เสริมความงาม 7 วัน / สัก เจาะหู เจาะร่างกาย 4 เดือน / ผ่าตัดใหญ่ 6 เดือน',
    deferralDurationTextEn: 'Readiness criteria: Dental 3-7 days / Aesthetics 7 days / Tattoos & piercings 4 months / Major surgery 6 months',
    guidance: 'สอนวิธีเตรียมตัว: ตรวจสอบวันที่ท่านทำหัตถการ เมื่อครบกำหนดระยะเวลาตามเกณฑ์ข้างต้นและแผลหายสนิทไม่มีการอักเสบ ร่างกายจะมีความพร้อมสมบูรณ์สำหรับการบริจาคโลหิต',
    guidanceEn: 'Preparation guide: Check your procedure date. Once the specified safety interval has elapsed and all wounds are completely healed without inflammation, you will be fully ready to donate.',
    officialReference: 'คู่มือการรับบริจาคโลหิต (2564) หน้า 27 ข้อ 16, หน้า 75-76 & มาตรฐาน 2567 ข้อ 2.2.4',
  },
  {
    id: 'q-chronic-viral-risks',
    category: 'PROCEDURES_LIFESTYLE',
    number: 7,
    question: 'ท่านมีประวัติโรคประจำตัวสำคัญ เช่น โรคหัวใจ มะเร็ง ไวรัสตับอักเสบบีหรือซี ภาวะเลือดออกผิดปกติ หรือโรคไตเรื้อรัง หรือไม่?',
    questionEn: 'Do you have a history of major medical conditions such as heart disease, cancer, Hepatitis B or C, bleeding disorders, or chronic kidney disease?',
    subtext: 'ตามแนวทางมาตรฐานการประเมินความปลอดภัยของผู้บริจาคและผู้รับโลหิตของศูนย์บริการโลหิต (สำหรับข้อมูลสุขภาพเชิงลึกจะมีการสัมภาษณ์อย่างเป็นส่วนตัวโดยเจ้าหน้าที่หน้างาน)',
    subtextEn: 'In accordance with safety standards of the Blood Service Centre. Detailed clinical history will be reviewed confidentially by medical staff on-site.',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'มีประวัติโรคเรื้อรังหรือโรคสำคัญที่ต้องได้รับการดูแลเป็นพิเศษ',
    deferralReasonEn: 'History of major chronic medical condition requiring specialized clinical care',
    deferralDurationDays: undefined,
    deferralDurationText: 'เกณฑ์ความพร้อม: แนะนำปรึกษาแพทย์ประจำตัวหรือเจ้าหน้าที่หน้างาน',
    deferralDurationTextEn: 'Readiness criteria: Consult personal physician or on-site staff',
    guidance: 'สอนวิธีเตรียมตัว: เพื่อสุขภาพและความปลอดภัยสูงสุดของตัวท่าน ผู้มีโรคประจำตัวกลุ่มนี้แนะนำให้เน้นการดูแลสุขภาพตนเองเป็นลำดับแรก หรือปรึกษาแพทย์ประจำตัว และท่านสามารถมีส่วนร่วมกับโครงการได้ผ่านกิจกรรมจิตอาสาและส่งต่อข่าวสาร',
    guidanceEn: 'Preparation guide: For your safety, prioritize personal health management or consult your doctor. You can also actively champion blood donation as a volunteer advocate.',
    officialReference: 'คู่มือการรับบริจาคโลหิต (2564) หน้า 26-27 & หน้า 61-65',
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

  // Calculate earliest eligible date if temporary interval exists
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
        ? 'Health Guidance: Recommended Focus on Personal Wellness'
        : 'คำแนะนำเบื้องต้น: ข้อแนะนำเพื่อการดูแลสุขภาพตนเอง',
      summaryBadge: isEn ? 'Health Guidance' : 'ข้อแนะนำดูแลสุขภาพ',
      summaryMessage: isEn
        ? 'Based on your health history, we recommend prioritizing your personal health and consulting your physician. You can also actively support the blood drive as a valued volunteer and advocate!'
        : 'จากข้อมูลประวัติสุขภาพ เพื่อความปลอดภัยและสุขภาพที่ดีของตัวท่านเอง แนะนำให้เน้นการดูแลสุขภาพตนเองเป็นอันดับแรกหรือปรึกษาแพทย์ประจำตัว ทั้งนี้ท่านยังสามารถเป็นกำลังสำคัญในการร่วมสนับสนุนโครงการผ่านการส่งต่อข่าวสารและกิจกรรมจิตอาสาได้',
      colorClass: 'bg-red-50 border-red-300 text-red-900',
      flaggedQuestions: flagged,
      canProceedToRegister: false,
    };
  }

  if (hasTemporary) {
    return {
      status: 'TEMPORARY_DEFERRAL',
      summaryTitle: isEn
        ? 'Preparation Guidance: Recommended Readiness Interval'
        : 'คำแนะนำเบื้องต้น: ข้อแนะนำและเกณฑ์ระยะเวลาเตรียมความพร้อม',
      summaryBadge: isEn ? 'Preparation Guidance' : 'ข้อแนะนำเตรียมความพร้อม',
      summaryMessage: isEn
        ? `Based on your responses, there are health, medication, or procedure factors with specific safety readiness intervals. Once the recommended interval is reached (approx. ${earliestDateStr || 'as guided'}), you will be ready for on-site evaluation.`
        : `จากข้อมูลที่ท่านระบุ มีปัจจัยเรื่องสุขภาพ ยา หรือหัตถการที่มีเกณฑ์ระยะเวลาความพร้อมเพื่อให้ร่างกายสมบูรณ์ที่สุด โดยแนะนำให้รอครบระยะเวลาความพร้อม (ประมาณวันที่ ${earliestDateStr || 'ตามเกณฑ์ที่ระบุ'}) ก่อนเข้ารับการประเมินโดยเจ้าหน้าที่หน้างาน`,
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
        ? 'Preparation Guidance: Pre-Donation Tips'
        : 'คำแนะนำเบื้องต้น: เตรียมความพร้อมเพิ่มเติมก่อนรับการประเมินหน้างาน',
      summaryBadge: isEn ? 'Preparation Needed' : 'ควรเตรียมตัวเพิ่มเติม',
      summaryMessage: isEn
        ? 'Please drink 300–500 mL of water, have a light low-fat meal, and inform on-site staff about your readiness before donation.'
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
      : 'จากข้อมูลเบื้องต้น ร่างกายของท่านมีความพร้อม',
    summaryBadge: isEn ? 'Ready for On-site Screening' : 'พร้อมรับการประเมินหน้างาน',
    summaryMessage: isEn
      ? 'Based on your answers, you meet preliminary readiness criteria. You may proceed to select an arrival time slot. (Official health screening and hemoglobin testing will be conducted by blood service staff on-site).'
      : 'จากข้อมูลเบื้องต้น ท่านมีความพร้อมตามเกณฑ์เบื้องต้น สามารถดำเนินการเลือกช่วงเวลาเดินทางเพื่อมาเข้ารับการประเมินและคัดกรองโดยเจ้าหน้าที่ ณ จุดรับบริจาคโลหิต (ทั้งนี้ ผู้บริจาคทุกท่านจะต้องผ่านการซักประวัติตรวจคัดกรองและตรวจความเข้มข้นโลหิตโดยเจ้าหน้าที่ศูนย์บริการโลหิตหน้างานก่อนการบริจาคจริง)',
    colorClass: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    flaggedQuestions: [],
    canProceedToRegister: true,
  };
}
