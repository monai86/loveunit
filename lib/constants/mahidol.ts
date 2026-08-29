export interface FacultyOption {
  code: string;
  name: string;
  label: string;
  enLabel?: string;
}

export const MAHIDOL_FACULTIES: FacultyOption[] = [
  { code: 'SI', name: 'คณะแพทยศาสตร์ศิริราชพยาบาล', label: 'คณะแพทยศาสตร์ศิริราชพยาบาล (SI)', enLabel: 'Faculty of Medicine Siriraj Hospital (SI)' },
  { code: 'RA', name: 'คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี', label: 'คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี (RA)', enLabel: 'Faculty of Medicine Ramathibodi Hospital (RA)' },
  { code: 'DT', name: 'คณะทันตแพทยศาสตร์', label: 'คณะทันตแพทยศาสตร์ (DT)', enLabel: 'Faculty of Dentistry (DT)' },
  { code: 'PY', name: 'คณะเภสัชศาสตร์', label: 'คณะเภสัชศาสตร์ (PY)', enLabel: 'Faculty of Pharmacy (PY)' },
  { code: 'NS', name: 'คณะพยาบาลศาสตร์', label: 'คณะพยาบาลศาสตร์ (NS)', enLabel: 'Faculty of Nursing (NS)' },
  { code: 'MT', name: 'คณะเทคนิคการแพทย์', label: 'คณะเทคนิคการแพทย์ (MT)', enLabel: 'Faculty of Medical Technology (MT)' },
  { code: 'PT', name: 'คณะกายภาพบำบัด', label: 'คณะกายภาพบำบัด (PT)', enLabel: 'Faculty of Physical Therapy (PT)' },
  { code: 'PH', name: 'คณะสาธารณสุขศาสตร์', label: 'คณะสาธารณสุขศาสตร์ (PH)', enLabel: 'Faculty of Public Health (PH)' },
  { code: 'VS', name: 'คณะสัตวแพทยศาสตร์', label: 'คณะสัตวแพทยศาสตร์ (VS)', enLabel: 'Faculty of Veterinary Science (VS)' },
  { code: 'SC', name: 'คณะวิทยาศาสตร์', label: 'คณะวิทยาศาสตร์ (SC)', enLabel: 'Faculty of Science (SC)' },
  { code: 'EG', name: 'คณะวิศวกรรมศาสตร์', label: 'คณะวิศวกรรมศาสตร์ (EG)', enLabel: 'Faculty of Engineering (EG)' },
  { code: 'ICT', name: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร', label: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร (ICT)', enLabel: 'Faculty of ICT (ICT)' },
  { code: 'EN', name: 'คณะสิ่งแวดล้อมและทรัพยากรศาสตร์', label: 'คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ (EN)', enLabel: 'Faculty of Environment and Resource Studies (EN)' },
  { code: 'LA', name: 'คณะศิลปศาสตร์', label: 'คณะศิลปศาสตร์ (LA)', enLabel: 'Faculty of Liberal Arts (LA)' },
  { code: 'SH', name: 'คณะสังคมศาสตร์และมนุษยศาสตร์', label: 'คณะสังคมศาสตร์และมนุษยศาสตร์ (SH)', enLabel: 'Faculty of Social Sciences and Humanities (SH)' },
  { code: 'GR', name: 'บัณฑิตวิทยาลัย', label: 'บัณฑิตวิทยาลัย (GR)', enLabel: 'Faculty of Graduate Studies (GR)' },
  { code: 'MS', name: 'วิทยาลัยดุริยางคศิลป์', label: 'วิทยาลัยดุริยางคศิลป์ (MS)', enLabel: 'College of Music (MS)' },
  { code: 'MUIC', name: 'วิทยาลัยนานาชาติ', label: 'วิทยาลัยนานาชาติ (MUIC)', enLabel: 'Mahidol University International College (MUIC)' },
  { code: 'CMMU', name: 'วิทยาลัยการจัดการ', label: 'วิทยาลัยการจัดการ (CMMU)', enLabel: 'College of Management (CMMU)' },
  { code: 'CRS', name: 'วิทยาลัยศาสนศึกษา', label: 'วิทยาลัยศาสนศึกษา (CRS)', enLabel: 'College of Religious Studies (CRS)' },
  { code: 'RS', name: 'วิทยาลัยราชสุดา', label: 'วิทยาลัยราชสุดา (RS)', enLabel: 'Ratchasuda College (RS)' },
  { code: 'SS', name: 'วิทยาลัยวิทยาศาสตร์และเทคโนโลยีการกีฬา', label: 'วิทยาลัยวิทยาศาสตร์และเทคโนโลยีการกีฬา (SS)', enLabel: 'College of Sports Science and Technology (SS)' },
  { code: 'KA', name: 'วิทยาเขตกาญจนบุรี', label: 'วิทยาเขตกาญจนบุรี (KA)', enLabel: 'Kanchanaburi Campus (KA)' },
  { code: 'NW', name: 'วิทยาเขตนครสวรรค์', label: 'วิทยาเขตนครสวรรค์ (NW)', enLabel: 'Nakhonsawan Campus (NW)' },
  { code: 'AM', name: 'วิทยาเขตอำนาจเจริญ', label: 'วิทยาเขตอำนาจเจริญ (AM)', enLabel: 'Amnatcharoen Campus (AM)' },
  { code: 'OTHER', name: 'สถาบันอื่น / บุคคลภายนอก', label: 'สถาบันอื่น / บุคคลภายนอก', enLabel: 'Other Institution / External' },
];

export interface AcademicYearOption {
  value: string;
  label: string;
  enLabel?: string;
}

export const ACADEMIC_YEARS: AcademicYearOption[] = [
  { value: 'ปี 1', label: 'ชั้นปีที่ 1', enLabel: 'Year 1 (Freshman)' },
  { value: 'ปี 2', label: 'ชั้นปีที่ 2', enLabel: 'Year 2 (Sophomore)' },
  { value: 'ปี 3', label: 'ชั้นปีที่ 3', enLabel: 'Year 3 (Junior)' },
  { value: 'ปี 4', label: 'ชั้นปีที่ 4', enLabel: 'Year 4 (Senior)' },
  { value: 'ปี 5', label: 'ชั้นปีที่ 5', enLabel: 'Year 5' },
  { value: 'ปี 6', label: 'ชั้นปีที่ 6', enLabel: 'Year 6' },
  { value: 'บัณฑิตศึกษา', label: 'ระดับบัณฑิตศึกษา', enLabel: 'Graduate Studies' },
  { value: 'อื่นๆ', label: 'อื่นๆ / ไม่ระบุ', enLabel: 'Other / Unspecified' },
];

export function getFacultyLabel(codeOrName: string, lang: 'th' | 'en' = 'th'): string {
  const found = MAHIDOL_FACULTIES.find(
    (f) => f.code === codeOrName || f.name === codeOrName || f.label === codeOrName
  );
  if (!found) return codeOrName;
  return lang === 'en' ? (found.enLabel || found.name) : found.name;
}

export function getYearLabel(yearVal: string, lang: 'th' | 'en' = 'th'): string {
  const found = ACADEMIC_YEARS.find((y) => y.value === yearVal);
  if (!found) return yearVal;
  return lang === 'en' ? (found.enLabel || found.value) : found.value;
}
