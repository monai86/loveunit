export interface FacultyOption {
  code: string;
  name: string;
  label: string;
}

export const MAHIDOL_FACULTIES: FacultyOption[] = [
  { code: 'SI', name: 'คณะแพทยศาสตร์ศิริราชพยาบาล', label: 'คณะแพทยศาสตร์ศิริราชพยาบาล (SI)' },
  { code: 'RA', name: 'คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี', label: 'คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี (RA)' },
  { code: 'DT', name: 'คณะทันตแพทยศาสตร์', label: 'คณะทันตแพทยศาสตร์ (DT)' },
  { code: 'PY', name: 'คณะเภสัชศาสตร์', label: 'คณะเภสัชศาสตร์ (PY)' },
  { code: 'NS', name: 'คณะพยาบาลศาสตร์', label: 'คณะพยาบาลศาสตร์ (NS)' },
  { code: 'MT', name: 'คณะเทคนิคการแพทย์', label: 'คณะเทคนิคการแพทย์ (MT)' },
  { code: 'PT', name: 'คณะกายภาพบำบัด', label: 'คณะกายภาพบำบัด (PT)' },
  { code: 'PH', name: 'คณะสาธารณสุขศาสตร์', label: 'คณะสาธารณสุขศาสตร์ (PH)' },
  { code: 'VS', name: 'คณะสัตวแพทยศาสตร์', label: 'คณะสัตวแพทยศาสตร์ (VS)' },
  { code: 'SC', name: 'คณะวิทยาศาสตร์', label: 'คณะวิทยาศาสตร์ (SC)' },
  { code: 'EG', name: 'คณะวิศวกรรมศาสตร์', label: 'คณะวิศวกรรมศาสตร์ (EG)' },
  { code: 'ICT', name: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร', label: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร (ICT)' },
  { code: 'EN', name: 'คณะสิ่งแวดล้อมและทรัพยากรศาสตร์', label: 'คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ (EN)' },
  { code: 'LA', name: 'คณะศิลปศาสตร์', label: 'คณะศิลปศาสตร์ (LA)' },
  { code: 'SH', name: 'คณะสังคมศาสตร์และมนุษยศาสตร์', label: 'คณะสังคมศาสตร์และมนุษยศาสตร์ (SH)' },
  { code: 'GR', name: 'บัณฑิตวิทยาลัย', label: 'บัณฑิตวิทยาลัย (GR)' },
  { code: 'MS', name: 'วิทยาลัยดุริยางคศิลป์', label: 'วิทยาลัยดุริยางคศิลป์ (MS)' },
  { code: 'MUIC', name: 'วิทยาลัยนานาชาติ', label: 'วิทยาลัยนานาชาติ (MUIC)' },
  { code: 'CMMU', name: 'วิทยาลัยการจัดการ', label: 'วิทยาลัยการจัดการ (CMMU)' },
  { code: 'CRS', name: 'วิทยาลัยศาสนศึกษา', label: 'วิทยาลัยศาสนศึกษา (CRS)' },
  { code: 'RS', name: 'วิทยาลัยราชสุดา', label: 'วิทยาลัยราชสุดา (RS)' },
  { code: 'SS', name: 'วิทยาลัยวิทยาศาสตร์และเทคโนโลยีการกีฬา', label: 'วิทยาลัยวิทยาศาสตร์และเทคโนโลยีการกีฬา (SS)' },
  { code: 'KA', name: 'วิทยาเขตกาญจนบุรี', label: 'วิทยาเขตกาญจนบุรี (KA)' },
  { code: 'NW', name: 'วิทยาเขตนครสวรรค์', label: 'วิทยาเขตนครสวรรค์ (NW)' },
  { code: 'AM', name: 'วิทยาเขตอำนาจเจริญ', label: 'วิทยาเขตอำนาจเจริญ (AM)' },
  { code: 'OTHER', name: 'สถาบันอื่น / บุคคลภายนอก', label: 'สถาบันอื่น / บุคคลภายนอก' },
];

export interface AcademicYearOption {
  value: string;
  label: string;
}

export const ACADEMIC_YEARS: AcademicYearOption[] = [
  { value: 'ปี 1', label: 'ชั้นปีที่ 1' },
  { value: 'ปี 2', label: 'ชั้นปีที่ 2' },
  { value: 'ปี 3', label: 'ชั้นปีที่ 3' },
  { value: 'ปี 4', label: 'ชั้นปีที่ 4' },
  { value: 'ปี 5', label: 'ชั้นปีที่ 5' },
  { value: 'ปี 6', label: 'ชั้นปีที่ 6' },
  { value: 'บัณฑิตศึกษา', label: 'ระดับบัณฑิตศึกษา' },
  { value: 'อื่นๆ', label: 'อื่นๆ / ไม่ระบุ' },
];
