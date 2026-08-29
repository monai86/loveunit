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
  category: 'PHYSICAL' | 'MEDICAL_HISTORY' | 'MEDICATIONS_VACCINES' | 'PROCEDURES_LIFESTYLE';
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
    title: '1. ข้อมูลสุขภาพและความพร้อมทั่วไป',
    titleEn: '1. General Health & Physical Readiness',
    desc: 'อายุ น้ำหนัก การนอนหลับ และความพร้อมของร่างกายในวันนี้',
    descEn: 'Age, body weight, sleep duration, and physical wellness today',
    icon: 'Activity',
  },
  {
    id: 'MEDICAL_HISTORY',
    title: '2. ประวัติสุขภาพและโรคประจำตัว',
    titleEn: '2. Medical History & Chronic Conditions',
    desc: 'โรคเรื้อรัง การผ่าตัด และประวัติการเจ็บป่วยสำคัญ',
    descEn: 'Chronic illnesses, past surgeries, and clinical conditions',
    icon: 'ShieldAlert',
  },
  {
    id: 'MEDICATIONS_VACCINES',
    title: '3. ประวัติการใช้ยา อาหารเสริม และวัคซีน',
    titleEn: '3. Medications, Supplements & Vaccines',
    desc: 'ยาปฏิชีวนะ ยารักษาสิว ยาต้านเกล็ดเลือด และวัคซีนที่เพิ่งได้รับ',
    descEn: 'Antibiotics, acne meds, antiplatelet drugs, and recent immunizations',
    icon: 'Pill',
  },
  {
    id: 'PROCEDURES_LIFESTYLE',
    title: '4. หัตถการ ทันตกรรม และพฤติกรรมเสี่ยง',
    titleEn: '4. Procedures, Dental Care & Risk Factors',
    desc: 'การทำฟัน สัก เจาะผิวหนัง การเดินทาง และพฤติกรรมเสี่ยงโรคติดต่อ',
    descEn: 'Dental work, tattoos, body piercing, travel, and viral exposure risks',
    icon: 'Stethoscope',
  },
];

export const OFFICIAL_SCREENING_QUESTIONS: ScreeningQuestion[] = [
  // -------------------------------------------------------------
  // หมวด 1: ข้อมูลสุขภาพและความพร้อมทั่วไป (PHYSICAL)
  // -------------------------------------------------------------
  {
    id: 'q-healthy-today',
    category: 'PHYSICAL',
    number: 1,
    question: 'วันนี้ท่านรู้สึกสบายดี สุขภาพแข็งแรง พร้อมที่จะบริจาคโลหิต?',
    questionEn: 'Do you feel well, healthy, and ready to donate blood today?',
    subtext: 'ไม่มีอาการเป็นไข้ หวัด เจ็บคอ อ่อนเพลีย หรือปวดศีรษะ',
    subtextEn: 'Free of fever, cold, sore throat, severe fatigue, or headache',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'ร่างกายยังไม่พร้อมสมบูรณ์ มีอาการเจ็บป่วยเฉียบพลัน',
    deferralReasonEn: 'Acute illness or feeling unwell today',
    deferralDurationDays: 7,
    deferralDurationText: 'งดบริจาคจนกว่าจะหายดีอย่างน้อย 7 วัน',
    deferralDurationTextEn: 'Defer until fully recovered for at least 7 days',
    guidance: 'ผู้บริจาคโลหิตต้องมีสุขภาพแข็งแรงในวันที่มาบริจาค เพื่อความปลอดภัยของทั้งตัวผู้บริจาคเองและโลหิตที่ได้',
    guidanceEn: 'Donors must be in good general health on donation day to ensure donor safety and optimal blood quality.',
    officialReference: 'คู่มือ 2564 หน้า 23 ข้อ 1',
  },
  {
    id: 'q-sleep',
    category: 'PHYSICAL',
    number: 2,
    question: 'เมื่อคืนที่ผ่านมา ท่านนอนหลับพักผ่อนเพียงพอ ไม่น้อยกว่า 5-6 ชั่วโมงติดต่อกัน?',
    questionEn: 'Did you get at least 5-6 hours of continuous sleep last night?',
    subtext: 'การพักผ่อนไม่เพียงพอเพิ่มความเสี่ยงต่อการเป็นลม หน้ามืด หรือความดันโลหิตตก',
    subtextEn: 'Inadequate sleep significantly increases the risk of dizziness, vasovagal syncope, or hypotension',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'พักผ่อนไม่เพียงพอ (< 5 ชั่วโมง)',
    deferralReasonEn: 'Insufficient rest (< 5 hours of continuous sleep)',
    deferralDurationDays: 1,
    deferralDurationText: 'งดบริจาคในวันนี้ พักผ่อนให้เต็มที่แล้วมาใหม่ในวันถัดไป',
    deferralDurationTextEn: 'Defer for today. Rest adequately and return another day.',
    guidance: 'ควรนอนหลับพักผ่อนให้เพียงพออย่างน้อย 6 ชั่วโมง เพื่อให้หลอดเลือดและระบบไหลเวียนโลหิตปรับตัวได้ดี',
    guidanceEn: 'At least 5-6 hours of sleep helps blood pressure and vascular tone adapt smoothly during donation.',
    officialReference: 'คู่มือ 2564 หน้า 23 ข้อ 2 & มาตรฐาน 2567',
  },
  {
    id: 'q-fatty-food',
    category: 'PHYSICAL',
    number: 3,
    question: 'ท่านได้รับประทานอาหารที่มีไขมันสูง ภายใน 3-6 ชั่วโมงที่ผ่านมาหรือไม่?',
    questionEn: 'Have you consumed high-fat or oily foods within the last 3-6 hours?',
    subtext: 'เช่น ข้าวมันไก่ ข้าวขาหมู แกงกะทิ ของทอด พิซซ่า อาหารฟาสต์ฟู้ด ขนมหวานจัด',
    subtextEn: 'E.g., fried foods, pork knuckles, rich coconut curries, pizza, fast food, heavy desserts',
    idealAnswer: false,
    deferralType: 'CAUTION',
    deferralReason: 'อาจเกิดภาวะพลาสมาขุ่นขาวจากไขมัน (Lipemic Plasma)',
    deferralReasonEn: 'Risk of lipemic (milky white) plasma from elevated blood lipids',
    deferralDurationDays: 1,
    deferralDurationText: 'ควรเว้นระยะ 4-6 ชั่วโมงหลังมื้ออาหารไขมันสูง',
    deferralDurationTextEn: 'Wait 4-6 hours after high-fat meals before donating',
    guidance: 'ไขมันในอาหารจะทำให้พลาสมามีสีขาวขุ่น ไม่สามารถนำไปให้ผู้ป่วยได้ ควรรับประทานอาหารมื้อหลักที่มีไขมันต่ำก่อนมาบริจาค',
    guidanceEn: 'Dietary fat causes milky white plasma which cannot be safely transfused to patients.',
    officialReference: 'คู่มือ 2564 หน้า 23 ข้อ 3',
  },
  {
    id: 'q-alcohol',
    category: 'PHYSICAL',
    number: 4,
    question: 'ท่านได้ดื่มเครื่องดื่มแอลกอฮอล์ทุกชนิด ภายใน 24 ชั่วโมงที่ผ่านมาหรือไม่?',
    questionEn: 'Have you consumed any alcoholic beverages within the last 24 hours?',
    subtext: 'เบียร์ ไวน์ เหล้า หรือเครื่องดื่มผสมแอลกอฮอล์',
    subtextEn: 'Beer, wine, spirits, or alcohol-infused mixed drinks',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'แอลกอฮอล์ทำให้ร่างกายขาดน้ำและส่งผลต่อระบบหลอดเลือด',
    deferralReasonEn: 'Alcohol causes systemic dehydration and vasodilation',
    deferralDurationDays: 1,
    deferralDurationText: 'งดบริจาคโลหิต 24 ชั่วโมงหลังดื่มแอลกอฮอล์',
    deferralDurationTextEn: 'Avoid donating for 24 hours after alcohol consumption',
    guidance: 'แอลกอฮอล์มีฤทธิ์ขับปัสสาวะและทำให้หลอดเลือดขยายตัว เสี่ยงต่อการเป็นลมและภาวะแทรกซ้อน',
    guidanceEn: 'Alcohol acts as a diuretic and vasodilator, greatly increasing the likelihood of fainting and complications.',
    officialReference: 'คู่มือ 2564 หน้า 26 ข้อ 8',
  },
  {
    id: 'q-last-donation',
    category: 'PHYSICAL',
    number: 5,
    question: 'หากท่านเคยบริจาคโลหิตมาก่อน การบริจาคครั้งล่าสุดเว้นระยะห่างมาแล้วอย่างน้อย 3 เดือน?',
    questionEn: 'If you have donated before, has it been at least 3 months since your last donation?',
    subtext: 'สำหรับผู้บริจาค Whole Blood (ผู้บริจาคครั้งแรกให้เลือก ใช่ / Yes)',
    subtextEn: 'For Whole Blood donors (First-time donors select Yes)',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'ระยะห่างจากการบริจาคครั้งก่อนยังไม่ครบ 3 เดือน (90 วัน)',
    deferralReasonEn: 'Donation interval is less than 3 months (90 days)',
    deferralDurationDays: 90,
    deferralDurationText: 'ต้องเว้นระยะห่างอย่างน้อย 3 เดือน (ผู้หญิงอาจพิจารณา 3-4 เดือน)',
    deferralDurationTextEn: 'Must wait at least 3 months between donations',
    guidance: 'การเว้นระยะ 3 เดือนช่วยให้ไขกระดูกสร้างเม็ดเลือดแดงทดแทนและระดับสะสมธาตุเหล็ก (Ferritin) กลับสู่ภาวะปกติ',
    guidanceEn: 'A 3-month interval allows bone marrow to regenerate red cells and restores iron stores (ferritin).',
    officialReference: 'มาตรฐาน 2567 บทที่ 2 ข้อ 2.1.3',
  },

  // -------------------------------------------------------------
  // หมวด 2: ประวัติสุขภาพและโรคประจำตัว (MEDICAL_HISTORY)
  // -------------------------------------------------------------
  {
    id: 'q-chronic-heart-stroke',
    category: 'MEDICAL_HISTORY',
    number: 6,
    question: 'ท่านมีประวัติโรคหัวใจ โรคหลอดเลือดสมอง (Stroke) หรือความดันโลหิตสูงรุนแรงที่ควบคุมไม่ได้?',
    questionEn: 'Do you have a history of heart disease, stroke, or severe uncontrolled hypertension?',
    subtext: 'กล้ามเนื้อหัวใจขาดเลือด, หัวใจเต้นผิดจังหวะ, ลิ้นหัวใจผิดปกติ, เคยทำบอลลูน/บายพาส',
    subtextEn: 'Coronary artery disease, arrhythmia, valvular heart disease, stent or bypass surgery',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'โรคระบบหัวใจและหลอดเลือดสมอง มีความเสี่ยงสูงต่อภาวะแทรกซ้อนจากการสูญเสียปริมาตรโลหิต',
    deferralReasonEn: 'Cardiovascular / cerebrovascular conditions carry high risk of circulatory collapse',
    guidance: 'เพื่อความปลอดภัยของผู้บริจาคโลหิตเป็นสำคัญ ผู้ที่มีประวัติโรคหัวใจหรือหลอดเลือดสมองควรงดบริจาคโลหิตถาวร',
    guidanceEn: 'For donor safety, individuals with cardiovascular or cerebrovascular history are permanently deferred.',
    officialReference: 'คู่มือ 2564 หน้า 61 ข้อ 18 & หน้า 64 ข้อ 59',
  },
  {
    id: 'q-cancer-malignancy',
    category: 'MEDICAL_HISTORY',
    number: 7,
    question: 'ท่านเคยได้รับการวินิจฉัยว่าเป็นโรคมะเร็ง หรือโรคเนื้องอกร้ายแรงทุกชนิดหรือไม่?',
    questionEn: 'Have you ever been diagnosed with cancer or any malignant tumor?',
    subtext: 'มะเร็งเม็ดเลือดขาว (Leukemia), มะเร็งต่อมน้ำเหลือง (Lymphoma) หรือมะเร็งอวัยวะต่างๆ',
    subtextEn: 'Leukemia, lymphoma, or solid organ malignancies',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'ประวัติโรคมะเร็งและเนื้องอกร้ายแรง เป็นข้อห้ามบริจาคโลหิตถาวร',
    deferralReasonEn: 'History of malignancy is a permanent deferral criterion',
    guidance: 'ผู้ที่มีประวัติโรคมะเร็งทุกชนิดให้งดบริจาคโลหิตถาวร ยกเว้นมะเร็งผิวหนังชนิด Basal/Squamous cell ที่ตัดออกหมดแล้วตามดุลยพินิจแพทย์',
    guidanceEn: 'All individuals with malignancy history are permanently deferred for recipient safety.',
    officialReference: 'คู่มือ 2564 หน้า 61 ข้อ 17',
  },
  {
    id: 'q-bleeding-disorder',
    category: 'MEDICAL_HISTORY',
    number: 8,
    question: 'ท่านมีภาวะเลือดออกผิดปกติ เลือดออกไม่หยุด เกล็ดเลือดต่ำ หรือโรคฮีโมฟีเลียหรือไม่?',
    questionEn: 'Do you have bleeding disorders, abnormal bleeding, low platelets, or hemophilia?',
    subtext: 'จ้ำเลือดตามตัว เลือดกำเดาไหลไม่หยุด เลือดออกในข้อ',
    subtextEn: 'Spontaneous bruising, frequent severe nosebleeds, hemarthrosis',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'ภาวะเลือดออกง่ายและหยุดยาก (Bleeding / Coagulation Disorders)',
    deferralReasonEn: 'Bleeding / coagulation disorders risk severe hematoma and blood loss',
    guidance: 'การเจาะเส้นเลือดดำใหญ่เพื่อบริจาคโลหิตอาจทำให้เลือดออกใต้ผิวหนัง (Hematoma) รุนแรงและเป็นอันตราย',
    guidanceEn: 'Large-gauge venipuncture may cause uncontrollable bleeding or hematoma.',
    officialReference: 'คู่มือ 2564 หน้า 61 ข้อ 21 & หน้า 65 ข้อ 81',
  },
  {
    id: 'q-autoimmune-sle',
    category: 'MEDICAL_HISTORY',
    number: 9,
    question: 'ท่านเป็นโรคแพ้ภูมิตนเอง (SLE), รูมาตอยด์รุนแรง, หรือโรคภูมิคุ้มกันบกพร่องหรือไม่?',
    questionEn: 'Do you have systemic autoimmune disease (SLE), severe rheumatoid arthritis, or immunodeficiency?',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'โรคแพ้ภูมิตัวเอง (Systemic Lupus Erythematosus) และโรคทางระบบภูมิคุ้มกัน',
    deferralReasonEn: 'Autoimmune disorders (SLE) contain pathogenic autoantibodies and immune complexes',
    guidance: 'ผู้ป่วยโรคแพ้ภูมิตนเองมักมีสารแอนติบอดีที่อาจส่งผลต่อผู้รับโลหิต และการบริจาคอาจกระตุ้นให้โรคกำเริบ',
    guidanceEn: 'Autoantibodies can harm recipients and donation may trigger disease flare-ups.',
    officialReference: 'คู่มือ 2564 หน้า 65 ข้อ 79',
  },
  {
    id: 'q-epilepsy-seizures',
    category: 'MEDICAL_HISTORY',
    number: 10,
    question: 'ท่านมีประวัติโรคลมชัก หรือเคยมีอาการชักในช่วง 3 ปีที่ผ่านมาหรือไม่?',
    questionEn: 'Do you have a history of epilepsy or had seizures within the past 3 years?',
    subtext: 'หากหยุดยาและไม่มีอาการชักติดต่อกันเกิน 3 ปี สามารถปรึกษาแพทย์ได้',
    subtextEn: 'If off medication and seizure-free for over 3 years, physician evaluation is required',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'โรคลมชักที่ยังควบคุมไม่ได้ หรือหยุดยาไม่ถึง 3 ปี',
    deferralReasonEn: 'Uncontrolled epilepsy or off medication for less than 3 years',
    deferralDurationDays: 1095,
    deferralDurationText: 'ต้องไม่มีอาการชักและหยุดยามาแล้วอย่างน้อย 3 ปี',
    deferralDurationTextEn: 'Must be seizure-free and medication-free for at least 3 years',
    guidance: 'การสูญเสียปริมาตรโลหิตและความเครียดอาจกระตุ้นให้เกิดอาการชักระหว่างหรือหลังบริจาค',
    guidanceEn: 'Hypovolemia and vasovagal stress may trigger acute seizures during donation.',
    officialReference: 'คู่มือ 2564 หน้า 61 ข้อ 24',
  },
  {
    id: 'q-hepatitis-history',
    category: 'MEDICAL_HISTORY',
    number: 11,
    question: 'ท่านเคยเป็นโรคตับอักเสบจากไวรัสบี หรือไวรัสซี หรือตรวจพบเชื้อ HBsAg / Anti-HCV เป็นบวกหรือไม่?',
    questionEn: 'Have you had Hepatitis B or C, or ever tested positive for HBsAg / Anti-HCV?',
    subtext: 'สำหรับไวรัสตับอักเสบเอ (HAV) หากหายขาดเกิน 1 ปี สามารถบริจาคได้',
    subtextEn: 'For Hepatitis A (HAV), donation is permitted if fully recovered for > 1 year',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'การติดเชื้อไวรัสตับอักเสบบี (HBV) หรือไวรัสตับอักเสบซี (HCV)',
    deferralReasonEn: 'Hepatitis B (HBV) or Hepatitis C (HCV) infection history',
    guidance: 'เชื้อไวรัสตับอักเสบบีและซีสามารถติดต่อผ่านการให้โลหิตและทำให้เกิดโรคตับแข็งหรือมะเร็งตับในผู้รับโลหิต',
    guidanceEn: 'HBV and HCV are major transfusion-transmitted infections that cause chronic cirrhosis and liver cancer.',
    officialReference: 'คู่มือ 2564 หน้า 62 ข้อ 37 & บทที่ 4 การตรวจคัดกรอง 2568',
  },
  {
    id: 'q-pregnancy-breastfeeding',
    category: 'MEDICAL_HISTORY',
    number: 12,
    question: 'ท่านอยู่ในระหว่างตั้งครรภ์ ให้นมบุตร หรือเพิ่งคลอดบุตร/แท้งบุตรภายใน 6 เดือนที่ผ่านมา?',
    questionEn: 'Are you currently pregnant, breastfeeding, or given birth/had a miscarriage within the past 6 months?',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'อยู่ระหว่างตั้งครรภ์ ให้นมบุตร หรือคลอดบุตรไม่ถึง 6 เดือน',
    deferralReasonEn: 'Pregnancy, lactation, or post-partum period (< 6 months)',
    deferralDurationDays: 180,
    deferralDurationText: 'งดบริจาคระหว่างตั้งครรภ์/ให้นมบุตร และเว้น 6 เดือนหลังคลอดหรือแท้งบุตร',
    deferralDurationTextEn: 'Defer during pregnancy/breastfeeding and wait 6 months post-delivery',
    guidance: 'ร่างกายของคุณแม่ต้องการธาตุเหล็กและสารอาหารสูงเพื่อทารก การบริจาคอาจทำให้เกิดภาวะโลหิตจางรุนแรง',
    guidanceEn: 'Maternal iron stores must be preserved for infant development; donation risks severe anemia.',
    officialReference: 'คู่มือ 2564 หน้า 26 ข้อ 11-12 & หน้า 64 ข้อ 69',
  },

  // -------------------------------------------------------------
  // หมวด 3: ประวัติการใช้ยา อาหารเสริม และวัคซีน (MEDICATIONS_VACCINES)
  // -------------------------------------------------------------
  {
    id: 'q-antibiotics',
    category: 'MEDICATIONS_VACCINES',
    number: 13,
    question: 'ท่านได้รับประทานหรือฉีดยาปฏิชีวนะ (ยาฆ่าเชื้อแบคทีเรีย/เชื้อรา/ไวรัส) ภายใน 7 วันที่ผ่านมาหรือไม่?',
    questionEn: 'Have you taken or received oral/injected antibiotics or antifungals within the last 7 days?',
    subtext: 'เช่น Amoxicillin, Augmentin, Ciprofloxacin, Azithromycin, Acyclovir ฯลฯ',
    subtextEn: 'E.g., Amoxicillin, Augmentin, Ciprofloxacin, Azithromycin, Acyclovir, etc.',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'เพิ่งรับประทานยาฆ่าเชื้อ/ปฏิชีวนะ หรือเพิ่งหายจากการติดเชื้อ',
    deferralReasonEn: 'Recent antimicrobial medication or acute infection recovery',
    deferralDurationDays: 7,
    deferralDurationText: 'งดบริจาค 7 วันหลังหยุดยาและหายจากอาการติดเชื้อเป็นปกติ',
    deferralDurationTextEn: 'Defer for 7 days after finishing full course and full recovery',
    guidance: 'ต้องงด 7 วันหลังรับประทานยาครบ เพื่อให้แน่ใจว่าการติดเชื้อหายสนิทและไม่มีตัวยาตกค้างในกระแสเลือด',
    guidanceEn: 'Waiting 7 days ensures the bacterial infection is eradicated and residual drugs are cleared.',
    officialReference: 'คู่มือ 2564 หน้า 25 ข้อ 5 & หน้า 70 ข้อ 5',
  },
  {
    id: 'q-acne-isotretinoin',
    category: 'MEDICATIONS_VACCINES',
    number: 14,
    question: 'ท่านรับประทานยารักษาสิวกลุ่มอนุพันธ์วิตามินเอ (Isotretinoin / Roaccutane / Acnotin / Sotret) ในช่วง 1 เดือนที่ผ่านมาหรือไม่?',
    questionEn: 'Have you taken oral retinoid acne medications (Isotretinoin / Roaccutane / Acnotin) within the past month?',
    subtext: 'หรือยากลุ่ม Acitretin (Neotigason) ในช่วง 3 ปีที่ผ่านมา',
    subtextEn: 'Or Acitretin (Neotigason) within the past 3 years',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ยารักษาสิวกลุ่มวิตามินเอ มีผลทำให้ทารกในครรภ์พิการรุนแรง (Teratogenic)',
    deferralReasonEn: 'Retinoids are highly teratogenic to developing fetuses',
    deferralDurationDays: 30,
    deferralDurationText: 'Isotretinoin งด 1 เดือน (4 สัปดาห์) / Acitretin งด 3 ปี / Etretinate งดถาวร',
    deferralDurationTextEn: 'Isotretinoin: defer 1 month (4 weeks) / Acitretin: defer 3 years',
    guidance: 'หากโลหิตที่มีตัวยานี้ถูกนำไปให้หญิงตั้งครรภ์ จะทำให้ทารกในครรภ์เกิดความพิการแต่กำเนิดอย่างรุนแรง',
    guidanceEn: 'Residual retinoids transfused to a pregnant recipient cause devastating birth defects.',
    officialReference: 'มาตรฐาน 2567 บทที่ 2 ข้อ 2.2.5.2 & คู่มือ 2564 หน้า 70 ข้อ 2',
  },
  {
    id: 'q-aspirin-nsaid',
    category: 'MEDICATIONS_VACCINES',
    number: 15,
    question: 'ท่านรับประทานยา Aspirin หรือยาแก้ปวดต้านการอักเสบกลุ่ม NSAIDs ภายใน 48 ชั่วโมงที่ผ่านมาหรือไม่?',
    questionEn: 'Have you taken Aspirin or NSAID painkillers (Ibuprofen, Arcoxia, Celecoxib) within the last 48 hours?',
    subtext: 'เช่น Ibuprofen, Naproxen, Diclofenac, Celecoxib, Arcoxia (บริจาคเลือดรวมได้ แต่นำไปแยกเกล็ดเลือดไม่ได้)',
    subtextEn: 'Whole blood can be donated, but platelets cannot be harvested for transfusion',
    idealAnswer: false,
    deferralType: 'CAUTION',
    deferralReason: 'ยา Aspirin/NSAIDs มีผลยับยั้งการทำงานของเกล็ดเลือดชั่วคราว',
    deferralReasonEn: 'Aspirin and NSAIDs inhibit platelet aggregation temporarily',
    deferralDurationDays: 2,
    deferralDurationText: 'บริจาคเลือดรวม (Whole Blood) ได้ แต่เกล็ดเลือดจะไม่ถูกนำไปใช้ / หากบริจาคเกล็ดเลือดต้องงด 48 ชม.',
    deferralDurationTextEn: 'Whole blood donation is permitted; platelet harvesting deferred for 48 hours',
    guidance: 'Aspirin และ NSAIDs ยับยั้งการเกาะกลุ่มของเกล็ดเลือด ผู้บริจาค Whole Blood สามารถบริจาคได้ แต่ต้องแจ้งเจ้าหน้าที่คัดกรอง',
    guidanceEn: 'Whole blood donation is safe, but inform screening staff so platelets are not separated.',
    officialReference: 'คู่มือ 2564 หน้า 25 ข้อ 6 & มาตรฐาน 2567 ข้อ 2.2.5.1',
  },
  {
    id: 'q-hairloss-prostate',
    category: 'MEDICATIONS_VACCINES',
    number: 16,
    question: 'ท่านรับประทานยารักษาผมร่วงหรือต่อมลูกหมากโต (Finasteride / Dutasteride / Proscar / Avodart) หรือไม่?',
    questionEn: 'Have you taken hair loss or prostate medications (Finasteride / Dutasteride / Proscar)?',
    subtext: 'Finasteride งด 1 เดือน / Dutasteride งด 6 เดือน',
    subtextEn: 'Finasteride: defer 1 month / Dutasteride: defer 6 months',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ยา Finasteride / Dutasteride มีผลกระทบต่อพัฒนาการอวัยวะเพศของทารกเพศชายในครรภ์',
    deferralReasonEn: 'Finasteride/Dutasteride disrupt male fetal genital development',
    deferralDurationDays: 30,
    deferralDurationText: 'Finasteride งด 1 เดือน (30 วัน) / Dutasteride งด 6 เดือน',
    deferralDurationTextEn: 'Finasteride: defer 1 month / Dutasteride: defer 6 months',
    guidance: 'ตัวยาสามารถผ่านรกและส่งผลต่อพัฒนาการของทารก จึงต้องเว้นระยะเวลาให้ยาถูกขับออกจากร่างกายจนหมด',
    guidanceEn: '5-alpha reductase inhibitors cross the placenta and interfere with male fetal genitalia.',
    officialReference: 'มาตรฐาน 2567 ข้อ 2.2.5.3',
  },
  {
    id: 'q-prep-pep',
    category: 'MEDICATIONS_VACCINES',
    number: 17,
    question: 'ท่านเคยรับประทานยาป้องกันการติดเชื้อเอชไอวี PrEP (Pre-exposure) หรือ PEP (Post-exposure prophylaxis) หรือไม่?',
    questionEn: 'Have you taken HIV prevention medications: PrEP (Pre-exposure) or PEP (Post-exposure)?',
    subtext: 'ยาแบบรับประทาน งด 4 เดือน / ยาแบบฉีด งด 12 เดือน (1 ปี)',
    subtextEn: 'Oral PrEP/PEP: defer 4 months / Injectable PrEP: defer 12 months (1 year)',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ยา PrEP/PEP อาจกดระดับเชื้อ HIV จนตรวจไม่พบด้วยวิธีมาตรฐาน (Delay viral rebound & antibody detection)',
    deferralReasonEn: 'PrEP/PEP suppresses viral replication and delays detectable antibody / NAT response',
    deferralDurationDays: 120,
    deferralDurationText: 'งดบริจาค 4 เดือนหลังหยุดยา PrEP/PEP แบบกิน (หรือ 12 เดือนสำหรับยาฉีด)',
    deferralDurationTextEn: 'Defer 4 months after oral PrEP/PEP (12 months for injectables)',
    guidance: 'ยา PrEP/PEP อาจทำให้การตรวจทางห้องปฏิบัติการเกิดผลลบลวงในระยะแรก จึงต้องเว้นระยะความปลอดภัย 4 เดือน',
    guidanceEn: 'Antiretrovirals may cause false-negative laboratory screening during early infection.',
    officialReference: 'มาตรฐาน 2567 บทที่ 2 ข้อ 2.2.6 & Vox Sang 2021',
  },
  {
    id: 'q-vaccines-recent',
    category: 'MEDICATIONS_VACCINES',
    number: 18,
    question: 'ท่านเพิ่งได้รับวัคซีนชนิดเชื้อเป็น (Live Attenuated) เช่น หัด หัดเยอรมัน คางทูม (MMR), อีสุกอีใส, ไข้เหลือง ภายใน 4 สัปดาห์ที่ผ่านมาหรือไม่?',
    questionEn: 'Have you received live attenuated vaccines (MMR, Varicella, Yellow Fever) within the last 4 weeks?',
    subtext: 'สำหรับวัคซีนไข้หวัดใหญ่, COVID-19, พิษสุนัขบ้า (ป้องกันล่วงหน้า) เว้น 7 วันหลังฉีดและไม่มีผลข้างเคียง',
    subtextEn: 'Inactivated/mRNA vaccines (Flu, COVID-19): wait 7 days with no side effects',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'วัคซีนชนิดเชื้อเป็น (Live Attenuated Vaccines)',
    deferralReasonEn: 'Live attenuated viral vaccines risk viremia transmission to immunocompromised patients',
    deferralDurationDays: 28,
    deferralDurationText: 'วัคซีนเชื้อเป็นงด 4 สัปดาห์ / วัคซีนเชื้อตาย-mRNA งด 7 วัน (หากไม่มีอาการข้างเคียง)',
    deferralDurationTextEn: 'Live vaccines: defer 4 weeks / Inactivated or mRNA: defer 7 days',
    guidance: 'วัคซีนเชื้อเป็นอาจมีไวรัสที่ลดความรุนแรงอยู่ในกระแสเลือด ซึ่งอาจเป็นอันตรายต่อผู้ป่วยภูมิคุ้มกันต่ำ',
    guidanceEn: 'Live vaccines may carry transient low-level viremia hazardous to immunocompromised recipients.',
    officialReference: 'คู่มือ 2564 หน้า 85-87 ข้อ 26',
  },

  // -------------------------------------------------------------
  // หมวด 4: หัตถการ ทันตกรรม และพฤติกรรมเสี่ยง (PROCEDURES_LIFESTYLE)
  // -------------------------------------------------------------
  {
    id: 'q-dental-procedures',
    category: 'PROCEDURES_LIFESTYLE',
    number: 19,
    question: 'ท่านเพิ่งทำฟัน: อุดฟัน/ขูดหินปูน (ภายใน 3 วัน) หรือถอนฟัน/ผ่าฟันคุด/รักษารากฟัน (ภายใน 7 วัน) หรือไม่?',
    questionEn: 'Have you had dental work: scaling/fillings (within 3 days) or extraction/root canal/surgery (within 7 days)?',
    subtext: 'หากแผลยังไม่หายดี มีเลือดออก หรือมีอาการอักเสบติดเชื้อ ให้งดจนกว่าแผลจะหายสนิท',
    subtextEn: 'If wounds are still healing, bleeding, or inflamed, defer until completely healed',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'หัตถการทันตกรรมอาจทำให้เกิดภาวะเชื้อแบคทีเรียเข้าสู่กระแสเลือดชั่วคราว (Transient Bacteremia)',
    deferralReasonEn: 'Dental procedures frequently cause transient bacteremia',
    deferralDurationDays: 7,
    deferralDurationText: 'ขูดหินปูน/อุดฟัน งด 3 วัน | ถอนฟัน/ผ่าฟันคุด/รักษารากฟัน/รากเทียม งด 7 วันและแผลต้องหายดี',
    deferralDurationTextEn: 'Scaling/fillings: defer 3 days | Extraction/surgery: defer 7 days with healed gums',
    guidance: 'แบคทีเรียในช่องปากอาจเข้าสู่กระแสเลือดระหว่างทำฟันโดยไม่แสดงอาการ หากนำโลหิตไปใช้อาจก่อให้เกิดการติดเชื้อในผู้รับ',
    guidanceEn: 'Oral bacteria entering blood circulation can proliferate in stored blood bags, posing severe risks.',
    officialReference: 'คู่มือ 2564 หน้า 27 ข้อ 16 & หน้า 76 ข้อ 13',
  },
  {
    id: 'q-tattoo-piercing',
    category: 'PROCEDURES_LIFESTYLE',
    number: 20,
    question: 'ท่านเคยสักผิวหนัง เจาะหู/อวัยวะ ฝังเข็ม ฝังสีคิ้ว/ปาก หรือกรีดผิวหนัง ภายใน 4 เดือนที่ผ่านมาหรือไม่?',
    questionEn: 'Have you had tattoos, ear/body piercings, microblading, or acupuncture within the last 4 months?',
    subtext: 'หากทำในสถานที่ที่ไม่ใช่โรงพยาบาลปลอดเชื้อ ต้องงดบริจาค 4 เดือน',
    subtextEn: 'Procedures outside sterile hospital settings require a 4-month safety window',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ความเสี่ยงต่อการติดเชื้อทางกระแสเลือดและไวรัสตับอักเสบบี ซี เอชไอวี ผ่านเข็มหรือสีสัก',
    deferralReasonEn: 'Potential bloodborne viral exposure (HBV, HCV, HIV) via non-sterile equipment',
    deferralDurationDays: 120,
    deferralDurationText: 'งดบริจาคโลหิตอย่างน้อย 4 เดือนนับจากวันที่ทำหัตถการ',
    deferralDurationTextEn: 'Defer blood donation for at least 4 months from procedure date',
    guidance: 'เข็มและอุปกรณ์สักเจาะมีความเสี่ยงแพร่กระจายเชื้อไวรัสทางโลหิต จึงต้องรอให้พ้นระยะฟักตัว (Window Period) อย่างน้อย 4 เดือน',
    guidanceEn: 'A 4-month waiting period ensures that potential bloodborne viral infections surpass the diagnostic window period.',
    officialReference: 'คู่มือ 2564 หน้า 75 ข้อ 1 & มาตรฐาน 2567 ข้อ 2.2.4',
  },
  {
    id: 'q-major-surgery-endoscopy',
    category: 'PROCEDURES_LIFESTYLE',
    number: 21,
    question: 'ท่านได้รับการผ่าตัดใหญ่ (Major Surgery) หรือการส่องกล้องตรวจทางเดินอาหาร/ทางเดินหายใจ ภายใน 4-6 เดือนที่ผ่านมาหรือไม่?',
    questionEn: 'Have you undergone major surgery or flexible endoscopy within the last 4-6 months?',
    subtext: 'ผ่าตัดใหญ่ งด 6 เดือน / ส่องกล้อง Flexible endoscopy งด 4-6 เดือน / ผ่าตัดเล็ก งด 1-4 สัปดาห์ตามแผลหาย',
    subtextEn: 'Major surgery: defer 6 months / Endoscopy: defer 4-6 months / Minor surgery: defer until healed (1-4 weeks)',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'การฟื้นตัวจากการผ่าตัดใหญ่ และความเสี่ยงจากการส่องกล้องตรวจระบบทางเดินอาหาร',
    deferralReasonEn: 'Post-operative tissue recovery and potential micro-mucosal breach from endoscopy',
    deferralDurationDays: 180,
    deferralDurationText: 'ผ่าตัดใหญ่งด 6 เดือน / ส่องกล้องงด 4-6 เดือน / ผ่าตัดเล็กงดจนกว่าแผลหายดี (1-4 สัปดาห์)',
    deferralDurationTextEn: 'Major surgery: 6 months / Endoscopy: 4-6 months / Minor surgery: until fully healed',
    guidance: 'ผู้ป่วยหลังผ่าตัดใหญ่ต้องการเวลาฟื้นฟูปริมาตรเลือดและโปรตีนในร่างกายให้สมบูรณ์ก่อนบริจาคโลหิต',
    guidanceEn: 'Surgical recovery requires adequate plasma volume and red cell reconstitution before blood donation.',
    officialReference: 'คู่มือ 2564 หน้า 75-76',
  },
  {
    id: 'q-blood-transfusion-received',
    category: 'PROCEDURES_LIFESTYLE',
    number: 22,
    question: 'ท่านเคยได้รับโลหิต เซลล์ต้นกำเนิด หรือส่วนประกอบโลหิตจากผู้อื่น ภายใน 1 ปี (12 เดือน) ที่ผ่านมาหรือไม่?',
    questionEn: 'Have you received blood transfusions, stem cells, or blood components within the past 12 months?',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'เคยได้รับโลหิตหรือส่วนประกอบโลหิต (Blood Transfusion Recipient)',
    deferralReasonEn: 'Recipient of human blood or blood components within 12 months',
    deferralDurationDays: 365,
    deferralDurationText: 'งดบริจาคโลหิตอย่างน้อย 1 ปี (12 เดือน)',
    deferralDurationTextEn: 'Defer blood donation for at least 1 year (12 months)',
    guidance: 'เพื่อป้องกันการแพร่กระจายเชื้อโรคติดต่อที่อาจได้รับมา และป้องกันปัญหาหมู่โลหิตผสมหรือแอนติบอดีแปลกปลอม',
    guidanceEn: 'Prevents transmission of secondary bloodborne agents and interference from donor-derived atypical antibodies.',
    officialReference: 'คู่มือ 2564 หน้า 75 ข้อ 4 & มาตรฐาน 2567',
  },
  {
    id: 'q-high-risk-sexual-behavior',
    category: 'PROCEDURES_LIFESTYLE',
    number: 23,
    question: 'ท่านหรือคู่ของท่านมีพฤติกรรมเสี่ยงทางเพศสัมพันธ์ เช่น มีเพศสัมพันธ์กับผู้ที่ไม่ใช่คู่ตนเอง, มีคู่นอนหลายคน, หรือมีเพศสัมพันธ์ระหว่างชายกับชาย (MSM) หรือไม่?',
    questionEn: 'Do you or your partner have high-risk sexual behavior (multiple partners, commercial sex, or male-to-male sex)?',
    subtext: 'ตามนโยบายความปลอดภัยสูงสุดระดับชาติของศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย',
    subtextEn: 'In accordance with National Blood Centre (Thai Red Cross Society) safety guidelines',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'พฤติกรรมเสี่ยงต่อการติดเชื้อทางเพศสัมพันธ์และโรคติดต่อทางโลหิต (HIV, Syphilis, HBV, HCV)',
    deferralReasonEn: 'High risk of bloodborne and sexually transmitted pathogens (HIV, Syphilis, HBV, HCV)',
    guidance: 'แม้ว่าห้องปฏิบัติการจะใช้การตรวจแบบ ID-NAT แต่ในช่วง Window Period ระยะแรกสุด เชื้ออาจยังไม่สามารถตรวจพบได้ จึงต้องมีมาตรการคัดกรองพฤติกรรมเสี่ยงอย่างเข้มงวด',
    guidanceEn: 'Even with advanced ID-NAT testing, ultra-early window period viral loads may remain below detection thresholds.',
    officialReference: 'คู่มือ 2564 หน้า 26 ข้อ 13 & หน้า 27',
  },
  {
    id: 'q-drugs-injection',
    category: 'PROCEDURES_LIFESTYLE',
    number: 24,
    question: 'ท่านเคยใช้สารเสพติดชนิดฉีดเข้าเส้นเลือด หรือเคยได้รับโทษจำคุกเกิน 72 ชั่วโมงในรอบ 1 ปีที่ผ่านมาหรือไม่?',
    questionEn: 'Have you ever injected non-prescribed drugs or been incarcerated for > 72 hours within the past year?',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'ประวัติการใช้สารเสพติดชนิดฉีด หรือเพิ่งพ้นโทษจำคุก',
    deferralReasonEn: 'History of intravenous drug use or recent detention > 72 hours',
    deferralDurationDays: 365,
    deferralDurationText: 'ประวัติใช้สารเสพติดชนิดฉีดงดถาวร / พ้นโทษจำคุกงด 1 ปี',
    deferralDurationTextEn: 'IV drug use: permanent deferral / Incarceration: defer 1 year',
    guidance: 'การใช้สารเสพติดชนิดฉีดมีความเสี่ยงสูงมากต่อการติดเชื้อทางกระแสเลือดทุกชนิด ให้งดบริจาคโลหิตถาวร',
    guidanceEn: 'Intravenous drug use carries extreme risk of bloodborne viral and bacterial transmission; permanent deferral is required.',
    officialReference: 'คู่มือ 2564 หน้า 27 ข้อ 14-15',
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
        ? `You have a temporary health restriction, procedure, or medication requiring a safety waiting period.${earliestDateStr ? ` You are estimated to be eligible around ${earliestDateStr}.` : ''}`
        : `ท่านมีประวัติหรือข้อจำกัดทางสุขภาพบางประการที่ต้องเว้นระยะเวลาเพื่อให้ร่างกายพร้อมสมบูรณ์ หรือพ้นระยะปลอดภัยของยา/หัตถการ${earliestDateStr ? ` โดยคาดว่าจะพร้อมบริจาคได้ประมาณวันที่ ${earliestDateStr}` : ''}`,
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
        ? 'Precaution Noted / Eligible with Conditions'
        : 'ท่านมีข้อควรระวัง / สามารถบริจาคได้ตามเงื่อนไข',
      summaryBadge: isEn ? 'Caution / Conditional' : 'มีข้อควรระวัง',
      summaryMessage: isEn
        ? 'You are eligible to donate. Please inform the screening staff and medical officer on-site about your condition (such as high-fat meal or NSAID medication) before donation.'
        : 'ท่านสามารถเข้าร่วมบริจาคโลหิตได้ตามปกติ แต่โปรดแจ้งข้อปฏิบัติตัว (เช่น การรับประทานอาหารไขมันสูง หรือการใช้ยาแก้ปวด NSAIDs) ให้แพทย์และเจ้าหน้าที่ประจำหน่วยคัดกรองทราบในวันงาน',
      colorClass: 'bg-blue-50 border-blue-300 text-blue-900',
      flaggedQuestions: flagged,
      canProceedToRegister: true,
    };
  }

  return {
    status: 'ELIGIBLE',
    summaryTitle: isEn
      ? 'Congratulations! You are preliminarily eligible to donate blood'
      : 'ยินดีด้วย! ท่านมีความพร้อมเบื้องต้นในการบริจาคโลหิต',
    summaryBadge: isEn ? 'Ready to Donate 🩸' : 'พร้อมบริจาคโลหิต 🩸',
    summaryMessage: isEn
      ? 'Your self-assessment matches National Blood Centre (Thai Red Cross Society) criteria. Please proceed to book your preferred appointment slot and prepare your body before donation day.'
      : 'สุขภาพของท่านตรงตามเกณฑ์มาตรฐานของศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย กรุณาลงทะเบียนจองรอบเวลาล่วงหน้า และเตรียมร่างกายให้พร้อมก่อนวันงาน',
    colorClass: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    flaggedQuestions: [],
    canProceedToRegister: true,
  };
}
