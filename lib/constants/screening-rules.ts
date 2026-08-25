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
  subtext?: string;
  idealAnswer: boolean; // What answer corresponds to ELIGIBLE (true = Yes, false = No)
  deferralType: 'PERMANENT' | 'TEMPORARY' | 'CAUTION';
  deferralReason: string;
  deferralDurationDays?: number;
  deferralDurationText?: string;
  guidance: string;
  officialReference?: string;
}

export const SCREENING_CATEGORIES = [
  {
    id: 'PHYSICAL',
    title: '1. ข้อมูลสุขภาพและความพร้อมทั่วไป',
    desc: 'อายุ น้ำหนัก การนอนหลับ และความพร้อมของร่างกายในวันนี้',
    icon: 'Activity',
  },
  {
    id: 'MEDICAL_HISTORY',
    title: '2. ประวัติสุขภาพและโรคประจำตัว',
    desc: 'โรคเรื้อรัง การผ่าตัด และประวัติการเจ็บป่วยสำคัญ',
    icon: 'ShieldAlert',
  },
  {
    id: 'MEDICATIONS_VACCINES',
    title: '3. ประวัติการใช้ยา อาหารเสริม และวัคซีน',
    desc: 'ยาปฏิชีวนะ ยารักษาสิว ยาต้านเกล็ดเลือด และวัคซีนที่เพิ่งได้รับ',
    icon: 'Pill',
  },
  {
    id: 'PROCEDURES_LIFESTYLE',
    title: '4. หัตถการ ทันตกรรม และพฤติกรรมเสี่ยง',
    desc: 'การทำฟัน สัก เจาะผิวหนัง การเดินทาง และพฤติกรรมเสี่ยงโรคติดต่อ',
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
    subtext: 'ไม่มีอาการเป็นไข้ หวัด เจ็บคอ อ่อนเพลีย หรือปวดศีรษะ',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'ร่างกายยังไม่พร้อมสมบูรณ์ มีอาการเจ็บป่วยเฉียบพลัน',
    deferralDurationDays: 7,
    deferralDurationText: 'งดบริจาคจนกว่าจะหายดีอย่างน้อย 7 วัน',
    guidance: 'ผู้บริจาคโลหิตต้องมีสุขภาพแข็งแรงในวันที่มาบริจาค เพื่อความปลอดภัยของทั้งตัวผู้บริจาคเองและโลหิตที่ได้',
    officialReference: 'คู่มือ 2564 หน้า 23 ข้อ 1',
  },
  {
    id: 'q-sleep',
    category: 'PHYSICAL',
    number: 2,
    question: 'เมื่อคืนที่ผ่านมา ท่านนอนหลับพักผ่อนเพียงพอ ไม่น้อยกว่า 5-6 ชั่วโมงติดต่อกัน?',
    subtext: 'การพักผ่อนไม่เพียงพอเพิ่มความเสี่ยงต่อการเป็นลม หน้ามืด หรือความดันโลหิตตก',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'พักผ่อนไม่เพียงพอ (< 5 ชั่วโมง)',
    deferralDurationDays: 1,
    deferralDurationText: 'งดบริจาคในวันนี้ พักผ่อนให้เต็มที่แล้วมาใหม่ในวันถัดไป',
    guidance: 'ควรนอนหลับพักผ่อนให้เพียงพออย่างน้อย 6 ชั่วโมง เพื่อให้หลอดเลือดและระบบไหลเวียนโลหิตปรับตัวได้ดี',
    officialReference: 'คู่มือ 2564 หน้า 23 ข้อ 2 & มาตรฐาน 2567',
  },
  {
    id: 'q-fatty-food',
    category: 'PHYSICAL',
    number: 3,
    question: 'ท่านได้รับประทานอาหารที่มีไขมันสูง ภายใน 3-6 ชั่วโมงที่ผ่านมาหรือไม่?',
    subtext: 'เช่น ข้าวมันไก่ ข้าวขาหมู แกงกะทิ ของทอด พิซซ่า อาหารฟาสต์ฟู้ด ขนมหวานจัด',
    idealAnswer: false,
    deferralType: 'CAUTION',
    deferralReason: 'อาจเกิดภาวะพลาสมาขุ่นขาวจากไขมัน (Lipemic Plasma)',
    deferralDurationDays: 1,
    deferralDurationText: 'ควรเว้นระยะ 4-6 ชั่วโมงหลังมื้ออาหารไขมันสูง',
    guidance: 'ไขมันในอาหารจะทำให้พลาสมามีสีขาวขุ่น ไม่สามารถนำไปให้ผู้ป่วยได้ ควรรับประทานอาหารมื้อหลักที่มีไขมันต่ำก่อนมาบริจาค',
    officialReference: 'คู่มือ 2564 หน้า 23 ข้อ 3',
  },
  {
    id: 'q-alcohol',
    category: 'PHYSICAL',
    number: 4,
    question: 'ท่านได้ดื่มเครื่องดื่มแอลกอฮอล์ทุกชนิด ภายใน 24 ชั่วโมงที่ผ่านมาหรือไม่?',
    subtext: 'เบียร์ ไวน์ เหล้า หรือเครื่องดื่มผสมแอลกอฮอล์',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'แอลกอฮอล์ทำให้ร่างกายขาดน้ำและส่งผลต่อระบบหลอดเลือด',
    deferralDurationDays: 1,
    deferralDurationText: 'งดบริจาคโลหิต 24 ชั่วโมงหลังดื่มแอลกอฮอล์',
    guidance: 'แอลกอฮอล์มีฤทธิ์ขับปัสสาวะและทำให้หลอดเลือดขยายตัว เสี่ยงต่อการเป็นลมและภาวะแทรกซ้อน',
    officialReference: 'คู่มือ 2564 หน้า 26 ข้อ 8',
  },
  {
    id: 'q-last-donation',
    category: 'PHYSICAL',
    number: 5,
    question: 'หากท่านเคยบริจาคโลหิตมาก่อน การบริจาคครั้งล่าสุดเว้นระยะห่างมาแล้วอย่างน้อย 3 เดือน?',
    subtext: 'สำหรับผู้บริจาค Whole Blood (ผู้บริจาคครั้งแรกให้เลือก ใช่)',
    idealAnswer: true,
    deferralType: 'TEMPORARY',
    deferralReason: 'ระยะห่างจากการบริจาคครั้งก่อนยังไม่ครบ 3 เดือน (90 วัน)',
    deferralDurationDays: 90,
    deferralDurationText: 'ต้องเว้นระยะห่างอย่างน้อย 3 เดือน (ผู้หญิงอาจพิจารณา 3-4 เดือน)',
    guidance: 'การเว้นระยะ 3 เดือนช่วยให้ไขกระดูกสร้างเม็ดเลือดแดงทดแทนและระดับสะสมธาตุเหล็ก (Ferritin) กลับสู่ภาวะปกติ',
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
    subtext: 'กล้ามเนื้อหัวใจขาดเลือด, หัวใจเต้นผิดจังหวะ, ลิ้นหัวใจผิดปกติ, เคยทำบอลลูน/บายพาส',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'โรคระบบหัวใจและหลอดเลือดสมอง มีความเสี่ยงสูงต่อภาวะแทรกซ้อนจากการสูญเสียปริมาตรโลหิต',
    guidance: 'เพื่อความปลอดภัยของผู้บริจาคโลหิตเป็นสำคัญ ผู้ที่มีประวัติโรคหัวใจหรือหลอดเลือดสมองควรงดบริจาคโลหิตถาวร',
    officialReference: 'คู่มือ 2564 หน้า 61 ข้อ 18 & หน้า 64 ข้อ 59',
  },
  {
    id: 'q-cancer-malignancy',
    category: 'MEDICAL_HISTORY',
    number: 7,
    question: 'ท่านเคยได้รับการวินิจฉัยว่าเป็นโรคมะเร็ง หรือโรคเนื้องอกร้ายแรงทุกชนิดหรือไม่?',
    subtext: 'มะเร็งเม็ดเลือดขาว (Leukemia), มะเร็งต่อมน้ำเหลือง (Lymphoma) หรือมะเร็งอวัยวะต่างๆ',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'ประวัติโรคมะเร็งและเนื้องอกร้ายแรง เป็นข้อห้ามบริจาคโลหิตถาวร',
    guidance: 'ผู้ที่มีประวัติโรคมะเร็งทุกชนิดให้งดบริจาคโลหิตถาวร ยกเว้นมะเร็งผิวหนังชนิด Basal/Squamous cell ที่ตัดออกหมดแล้วตามดุลยพินิจแพทย์',
    officialReference: 'คู่มือ 2564 หน้า 61 ข้อ 17',
  },
  {
    id: 'q-bleeding-disorder',
    category: 'MEDICAL_HISTORY',
    number: 8,
    question: 'ท่านมีภาวะเลือดออกผิดปกติ เลือดออกไม่หยุด เกล็ดเลือดต่ำ หรือโรคฮีโมฟีเลียหรือไม่?',
    subtext: 'จ้ำเลือดตามตัว เลือดกำเดาไหลไม่หยุด เลือดออกในข้อ',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'ภาวะเลือดออกง่ายและหยุดยาก (Bleeding / Coagulation Disorders)',
    guidance: 'การเจาะเส้นเลือดดำใหญ่เพื่อบริจาคโลหิตอาจทำให้เลือดออกใต้ผิวหนัง (Hematoma) รุนแรงและเป็นอันตราย',
    officialReference: 'คู่มือ 2564 หน้า 61 ข้อ 21 & หน้า 65 ข้อ 81',
  },
  {
    id: 'q-autoimmune-sle',
    category: 'MEDICAL_HISTORY',
    number: 9,
    question: 'ท่านเป็นโรคแพ้ภูมิตนเอง (SLE), รูมาตอยด์รุนแรง, หรือโรคภูมิคุ้มกันบกพร่องหรือไม่?',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'โรคแพ้ภูมิตัวเอง (Systemic Lupus Erythematosus) และโรคทางระบบภูมิคุ้มกัน',
    guidance: 'ผู้ป่วยโรคแพ้ภูมิตนเองมักมีสารแอนติบอดีที่อาจส่งผลต่อผู้รับโลหิต และการบริจาคอาจกระตุ้นให้โรคกำเริบ',
    officialReference: 'คู่มือ 2564 หน้า 65 ข้อ 79',
  },
  {
    id: 'q-epilepsy-seizures',
    category: 'MEDICAL_HISTORY',
    number: 10,
    question: 'ท่านมีประวัติโรคลมชัก หรือเคยมีอาการชักในช่วง 3 ปีที่ผ่านมาหรือไม่?',
    subtext: 'หากหยุดยาและไม่มีอาการชักติดต่อกันเกิน 3 ปี สามารถปรึกษาแพทย์ได้',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'โรคลมชักที่ยังควบคุมไม่ได้ หรือหยุดยาไม่ถึง 3 ปี',
    deferralDurationDays: 1095,
    deferralDurationText: 'ต้องไม่มีอาการชักและหยุดยามาแล้วอย่างน้อย 3 ปี',
    guidance: 'การสูญเสียปริมาตรโลหิตและความเครียดอาจกระตุ้นให้เกิดอาการชักระหว่างหรือหลังบริจาค',
    officialReference: 'คู่มือ 2564 หน้า 61 ข้อ 24',
  },
  {
    id: 'q-hepatitis-history',
    category: 'MEDICAL_HISTORY',
    number: 11,
    question: 'ท่านเคยเป็นโรคตับอักเสบจากไวรัสบี หรือไวรัสซี หรือตรวจพบเชื้อ HBsAg / Anti-HCV เป็นบวกหรือไม่?',
    subtext: 'สำหรับไวรัสตับอักเสบเอ (HAV) หากหายขาดเกิน 1 ปี สามารถบริจาคได้',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'การติดเชื้อไวรัสตับอักเสบบี (HBV) หรือไวรัสตับอักเสบซี (HCV)',
    guidance: 'เชื้อไวรัสตับอักเสบบีและซีสามารถติดต่อผ่านการให้โลหิตและทำให้เกิดโรคตับแข็งหรือมะเร็งตับในผู้รับโลหิต',
    officialReference: 'คู่มือ 2564 หน้า 62 ข้อ 37 & บทที่ 4 การตรวจคัดกรอง 2568',
  },
  {
    id: 'q-pregnancy-breastfeeding',
    category: 'MEDICAL_HISTORY',
    number: 12,
    question: 'ท่านอยู่ในระหว่างตั้งครรภ์ ให้นมบุตร หรือเพิ่งคลอดบุตร/แท้งบุตรภายใน 6 เดือนที่ผ่านมา?',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'อยู่ระหว่างตั้งครรภ์ ให้นมบุตร หรือคลอดบุตรไม่ถึง 6 เดือน',
    deferralDurationDays: 180,
    deferralDurationText: 'งดบริจาคระหว่างตั้งครรภ์/ให้นมบุตร และเว้น 6 เดือนหลังคลอดหรือแท้งบุตร',
    guidance: 'ร่างกายของคุณแม่ต้องการธาตุเหล็กและสารอาหารสูงเพื่อทารก การบริจาคอาจทำให้เกิดภาวะโลหิตจางรุนแรง',
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
    subtext: 'เช่น Amoxicillin, Augmentin, Ciprofloxacin, Azithromycin, Acyclovir ฯลฯ',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'เพิ่งรับประทานยาฆ่าเชื้อ/ปฏิชีวนะ หรือเพิ่งหายจากการติดเชื้อ',
    deferralDurationDays: 7,
    deferralDurationText: 'งดบริจาค 7 วันหลังหยุดยาและหายจากอาการติดเชื้อเป็นปกติ',
    guidance: 'ต้องงด 7 วันหลังรับประทานยาครบ เพื่อให้แน่ใจว่าการติดเชื้อหายสนิทและไม่มีตัวยาตกค้างในกระแสเลือด',
    officialReference: 'คู่มือ 2564 หน้า 25 ข้อ 5 & หน้า 70 ข้อ 5',
  },
  {
    id: 'q-acne-isotretinoin',
    category: 'MEDICATIONS_VACCINES',
    number: 14,
    question: 'ท่านรับประทานยารักษาสิวกลุ่มอนุพันธ์วิตามินเอ (Isotretinoin / Roaccutane / Acnotin / Sotret) ในช่วง 1 เดือนที่ผ่านมาหรือไม่?',
    subtext: 'หรือยากลุ่ม Acitretin (Neotigason) ในช่วง 3 ปีที่ผ่านมา',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ยารักษาสิวกลุ่มวิตามินเอ มีผลทำให้ทารกในครรภ์พิการรุนแรง (Teratogenic)',
    deferralDurationDays: 30,
    deferralDurationText: 'Isotretinoin งด 1 เดือน (4 สัปดาห์) / Acitretin งด 3 ปี / Etretinate งดถาวร',
    guidance: 'หากโลหิตที่มีตัวยานี้ถูกนำไปให้หญิงตั้งครรภ์ จะทำให้ทารกในครรภ์เกิดความพิการแต่กำเนิดอย่างรุนแรง',
    officialReference: 'มาตรฐาน 2567 บทที่ 2 ข้อ 2.2.5.2 & คู่มือ 2564 หน้า 70 ข้อ 2',
  },
  {
    id: 'q-aspirin-nsaid',
    category: 'MEDICATIONS_VACCINES',
    number: 15,
    question: 'ท่านรับประทานยา Aspirin หรือยาแก้ปวดต้านการอักเสบกลุ่ม NSAIDs ภายใน 48 ชั่วโมงที่ผ่านมาหรือไม่?',
    subtext: 'เช่น Ibuprofen, Naproxen, Diclofenac, Celecoxib, Arcoxia (บริจาคเลือดรวมได้ แต่นำไปแยกเกล็ดเลือดไม่ได้)',
    idealAnswer: false,
    deferralType: 'CAUTION',
    deferralReason: 'ยา Aspirin/NSAIDs มีผลยับยั้งการทำงานของเกล็ดเลือดชั่วคราว',
    deferralDurationDays: 2,
    deferralDurationText: 'บริจาคเลือดรวม (Whole Blood) ได้ แต่เกล็ดเลือดจะไม่ถูกนำไปใช้ / หากบริจาคเกล็ดเลือดต้องงด 48 ชม.',
    guidance: 'Aspirin และ NSAIDs ยับยั้งการเกาะกลุ่มของเกล็ดเลือด ผู้บริจาค Whole Blood สามารถบริจาคได้ แต่ต้องแจ้งเจ้าหน้าที่คัดกรอง',
    officialReference: 'คู่มือ 2564 หน้า 25 ข้อ 6 & มาตรฐาน 2567 ข้อ 2.2.5.1',
  },
  {
    id: 'q-hairloss-prostate',
    category: 'MEDICATIONS_VACCINES',
    number: 16,
    question: 'ท่านรับประทานยารักษาผมร่วงหรือต่อมลูกหมากโต (Finasteride / Dutasteride / Proscar / Avodart) หรือไม่?',
    subtext: 'Finasteride งด 1 เดือน / Dutasteride งด 6 เดือน',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ยา Finasteride / Dutasteride มีผลกระทบต่อพัฒนาการอวัยวะเพศของทารกเพศชายในครรภ์',
    deferralDurationDays: 30,
    deferralDurationText: 'Finasteride งด 1 เดือน (30 วัน) / Dutasteride งด 6 เดือน',
    guidance: 'ตัวยาสามารถผ่านรกและส่งผลต่อพัฒนาการของทารก จึงต้องเว้นระยะเวลาให้ยาถูกขับออกจากร่างกายจนหมด',
    officialReference: 'มาตรฐาน 2567 ข้อ 2.2.5.3',
  },
  {
    id: 'q-prep-pep',
    category: 'MEDICATIONS_VACCINES',
    number: 17,
    question: 'ท่านเคยรับประทานยาป้องกันการติดเชื้อเอชไอวี PrEP (Pre-exposure) หรือ PEP (Post-exposure prophylaxis) หรือไม่?',
    subtext: 'ยาแบบรับประทาน งด 4 เดือน / ยาแบบฉีด งด 12 เดือน (1 ปี)',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ยา PrEP/PEP อาจกดระดับเชื้อ HIV จนตรวจไม่พบด้วยวิธีมาตรฐาน (Delay viral rebound & antibody detection)',
    deferralDurationDays: 120,
    deferralDurationText: 'งดบริจาค 4 เดือนหลังหยุดยา PrEP/PEP แบบกิน (หรือ 12 เดือนสำหรับยาฉีด)',
    guidance: 'ยา PrEP/PEP อาจทำให้การตรวจทางห้องปฏิบัติการเกิดผลลบลวงในระยะแรก จึงต้องเว้นระยะความปลอดภัย 4 เดือน',
    officialReference: 'มาตรฐาน 2567 บทที่ 2 ข้อ 2.2.6 & Vox Sang 2021',
  },
  {
    id: 'q-vaccines-recent',
    category: 'MEDICATIONS_VACCINES',
    number: 18,
    question: 'ท่านเพิ่งได้รับวัคซีนชนิดเชื้อเป็น (Live Attenuated) เช่น หัด หัดเยอรมัน คางทูม (MMR), อีสุกอีใส, ไข้เหลือง ภายใน 4 สัปดาห์ที่ผ่านมาหรือไม่?',
    subtext: 'สำหรับวัคซีนไข้หวัดใหญ่, COVID-19, พิษสุนัขบ้า (ป้องกันล่วงหน้า) เว้น 7 วันหลังฉีดและไม่มีผลข้างเคียง',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'วัคซีนชนิดเชื้อเป็น (Live Attenuated Vaccines)',
    deferralDurationDays: 28,
    deferralDurationText: 'วัคซีนเชื้อเป็นงด 4 สัปดาห์ / วัคซีนเชื้อตาย-mRNA งด 7 วัน (หากไม่มีอาการข้างเคียง)',
    guidance: 'วัคซีนเชื้อเป็นอาจมีไวรัสที่ลดความรุนแรงอยู่ในกระแสเลือด ซึ่งอาจเป็นอันตรายต่อผู้ป่วยภูมิคุ้มกันต่ำ',
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
    subtext: 'หากแผลยังไม่หายดี มีเลือดออก หรือมีอาการอักเสบติดเชื้อ ให้งดจนกว่าแผลจะหายสนิท',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'หัตถการทันตกรรมอาจทำให้เกิดภาวะเชื้อแบคทีเรียเข้าสู่กระแสเลือดชั่วคราว (Transient Bacteremia)',
    deferralDurationDays: 7,
    deferralDurationText: 'ขูดหินปูน/อุดฟัน งด 3 วัน | ถอนฟัน/ผ่าฟันคุด/รักษารากฟัน/รากเทียม งด 7 วันและแผลต้องหายดี',
    guidance: 'แบคทีเรียในช่องปากอาจเข้าสู่กระแสเลือดระหว่างทำฟันโดยไม่แสดงอาการ หากนำโลหิตไปใช้อาจก่อให้เกิดการติดเชื้อในผู้รับ',
    officialReference: 'คู่มือ 2564 หน้า 27 ข้อ 16 & หน้า 76 ข้อ 13',
  },
  {
    id: 'q-tattoo-piercing',
    category: 'PROCEDURES_LIFESTYLE',
    number: 20,
    question: 'ท่านเคยสักผิวหนัง เจาะหู/อวัยวะ ฝังเข็ม ฝังสีคิ้ว/ปาก หรือกรีดผิวหนัง ภายใน 4 เดือนที่ผ่านมาหรือไม่?',
    subtext: 'หากทำในสถานที่ที่ไม่ใช่โรงพยาบาลปลอดเชื้อ ต้องงดบริจาค 4 เดือน',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'ความเสี่ยงต่อการติดเชื้อทางกระแสเลือดและไวรัสตับอักเสบบี ซี เอชไอวี ผ่านเข็มหรือสีสัก',
    deferralDurationDays: 120,
    deferralDurationText: 'งดบริจาคโลหิตอย่างน้อย 4 เดือนนับจากวันที่ทำหัตถการ',
    guidance: 'เข็มและอุปกรณ์สักเจาะมีความเสี่ยงแพร่กระจายเชื้อไวรัสทางโลหิต จึงต้องรอให้พ้นระยะฟักตัว (Window Period) อย่างน้อย 4 เดือน',
    officialReference: 'คู่มือ 2564 หน้า 75 ข้อ 1 & มาตรฐาน 2567 ข้อ 2.2.4',
  },
  {
    id: 'q-major-surgery-endoscopy',
    category: 'PROCEDURES_LIFESTYLE',
    number: 21,
    question: 'ท่านได้รับการผ่าตัดใหญ่ (Major Surgery) หรือการส่องกล้องตรวจทางเดินอาหาร/ทางเดินหายใจ ภายใน 4-6 เดือนที่ผ่านมาหรือไม่?',
    subtext: 'ผ่าตัดใหญ่ งด 6 เดือน / ส่องกล้อง Flexible endoscopy งด 4-6 เดือน / ผ่าตัดเล็ก งด 1-4 สัปดาห์ตามแผลหาย',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'การฟื้นตัวจากการผ่าตัดใหญ่ และความเสี่ยงจากการส่องกล้องตรวจระบบทางเดินอาหาร',
    deferralDurationDays: 180,
    deferralDurationText: 'ผ่าตัดใหญ่งด 6 เดือน / ส่องกล้องงด 4-6 เดือน / ผ่าตัดเล็กงดจนกว่าแผลหายดี (1-4 สัปดาห์)',
    guidance: 'ผู้ป่วยหลังผ่าตัดใหญ่ต้องการเวลาฟื้นฟูปริมาตรเลือดและโปรตีนในร่างกายให้สมบูรณ์ก่อนบริจาคโลหิต',
    officialReference: 'คู่มือ 2564 หน้า 75-76',
  },
  {
    id: 'q-blood-transfusion-received',
    category: 'PROCEDURES_LIFESTYLE',
    number: 22,
    question: 'ท่านเคยได้รับโลหิต เซลล์ต้นกำเนิด หรือส่วนประกอบโลหิตจากผู้อื่น ภายใน 1 ปี (12 เดือน) ที่ผ่านมาหรือไม่?',
    idealAnswer: false,
    deferralType: 'TEMPORARY',
    deferralReason: 'เคยได้รับโลหิตหรือส่วนประกอบโลหิต (Blood Transfusion Recipient)',
    deferralDurationDays: 365,
    deferralDurationText: 'งดบริจาคโลหิตอย่างน้อย 1 ปี (12 เดือน)',
    guidance: 'เพื่อป้องกันการแพร่กระจายเชื้อโรคติดต่อที่อาจได้รับมา และป้องกันปัญหาหมู่โลหิตผสมหรือแอนติบอดีแปลกปลอม',
    officialReference: 'คู่มือ 2564 หน้า 75 ข้อ 4 & มาตรฐาน 2567',
  },
  {
    id: 'q-high-risk-sexual-behavior',
    category: 'PROCEDURES_LIFESTYLE',
    number: 23,
    question: 'ท่านหรือคู่ของท่านมีพฤติกรรมเสี่ยงทางเพศสัมพันธ์ เช่น มีเพศสัมพันธ์กับผู้ที่ไม่ใช่คู่ตนเอง, มีคู่นอนหลายคน, หรือมีเพศสัมพันธ์ระหว่างชายกับชาย (MSM) หรือไม่?',
    subtext: 'ตามนโยบายความปลอดภัยสูงสุดระดับชาติของศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'พฤติกรรมเสี่ยงต่อการติดเชื้อทางเพศสัมพันธ์และโรคติดต่อทางโลหิต (HIV, Syphilis, HBV, HCV)',
    guidance: 'แม้ว่าห้องปฏิบัติการจะใช้การตรวจแบบ ID-NAT แต่ในช่วง Window Period ระยะแรกสุด เชื้ออาจยังไม่สามารถตรวจพบได้ จึงต้องมีมาตรการคัดกรองพฤติกรรมเสี่ยงอย่างเข้มงวด',
    officialReference: 'คู่มือ 2564 หน้า 26 ข้อ 13 & หน้า 27',
  },
  {
    id: 'q-drugs-injection',
    category: 'PROCEDURES_LIFESTYLE',
    number: 24,
    question: 'ท่านเคยใช้สารเสพติดชนิดฉีดเข้าเส้นเลือด หรือเคยได้รับโทษจำคุกเกิน 72 ชั่วโมงในรอบ 1 ปีที่ผ่านมาหรือไม่?',
    idealAnswer: false,
    deferralType: 'PERMANENT',
    deferralReason: 'ประวัติการใช้สารเสพติดชนิดฉีด หรือเพิ่งพ้นโทษจำคุก',
    deferralDurationDays: 365,
    deferralDurationText: 'ประวัติใช้สารเสพติดชนิดฉีดงดถาวร / พ้นโทษจำคุกงด 1 ปี',
    guidance: 'การใช้สารเสพติดชนิดฉีดมีความเสี่ยงสูงมากต่อการติดเชื้อทางกระแสเลือดทุกชนิด ให้งดบริจาคโลหิตถาวร',
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

export function evaluateScreeningAnswers(answers: Record<string, boolean>): ScreeningEvaluationResult {
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
        reason: q.deferralReason,
        durationText: q.deferralDurationText,
        guidance: q.guidance,
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
    earliestDateStr = d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (hasPermanent) {
    return {
      status: 'PERMANENT_DEFERRAL',
      summaryTitle: 'ขออภัย ท่านยังไม่สามารถบริจาคโลหิตได้ (งดบริจาคถาวร)',
      summaryBadge: 'ไม่ผ่านเกณฑ์การบริจาค',
      summaryMessage: 'จากข้อมูลประวัติสุขภาพ เพื่อความปลอดภัยสูงสุดของตัวท่านเองและผู้ป่วยที่รับโลหิต ท่านอยู่ในเกณฑ์ที่ต้องงดบริจาคโลหิตอย่างถาวร แต่ท่านยังสามารถร่วมเป็นส่วนหนึ่งในการประชาสัมพันธ์ ส่งต่อข่าวสาร และทำกิจกรรมจิตอาสาช่วยเหลือสังคมได้',
      colorClass: 'bg-red-50 border-red-300 text-red-900',
      flaggedQuestions: flagged,
      canProceedToRegister: false,
    };
  }

  if (hasTemporary) {
    return {
      status: 'TEMPORARY_DEFERRAL',
      summaryTitle: 'ท่านต้องงดบริจาคโลหิตชั่วคราว',
      summaryBadge: 'งดบริจาคชั่วคราว',
      summaryMessage: `ท่านมีประวัติหรือข้อจำกัดทางสุขภาพบางประการที่ต้องเว้นระยะเวลาเพื่อให้ร่างกายพร้อมสมบูรณ์ หรือพ้นระยะปลอดภัยของยา/หัตถการ${earliestDateStr ? ` โดยคาดว่าจะพร้อมบริจาคได้ประมาณวันที่ ${earliestDateStr}` : ''}`,
      colorClass: 'bg-amber-50 border-amber-300 text-amber-900',
      flaggedQuestions: flagged,
      earliestEligibleDate: earliestDateStr,
      canProceedToRegister: false,
    };
  }

  if (hasCaution) {
    return {
      status: 'CAUTION',
      summaryTitle: 'ท่านมีข้อควรระวัง / สามารถบริจาคได้ตามเงื่อนไข',
      summaryBadge: 'มีข้อควรระวัง',
      summaryMessage: 'ท่านสามารถเข้าร่วมบริจาคโลหิตได้ตามปกติ แต่โปรดแจ้งข้อปฏิบัติตัว (เช่น การรับประทานอาหารไขมันสูง หรือการใช้ยาแก้ปวด NSAIDs) ให้แพทย์และเจ้าหน้าที่ประจำหน่วยคัดกรองทราบในวันงาน',
      colorClass: 'bg-blue-50 border-blue-300 text-blue-900',
      flaggedQuestions: flagged,
      canProceedToRegister: true,
    };
  }

  return {
    status: 'ELIGIBLE',
    summaryTitle: 'ยินดีด้วย! ท่านมีความพร้อมเบื้องต้นในการบริจาคโลหิต',
    summaryBadge: 'พร้อมบริจาคโลหิต 🩸',
    summaryMessage: 'สุขภาพของท่านตรงตามเกณฑ์มาตรฐานของศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย กรุณาลงทะเบียนจองรอบเวลาล่วงหน้า และเตรียมร่างกายให้พร้อมก่อนวันงาน',
    colorClass: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    flaggedQuestions: [],
    canProceedToRegister: true,
  };
}
