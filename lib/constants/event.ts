/**
 * MUMT LoveUnit 2026 — Single Source of Truth for Event Information
 * 
 * This file serves as the definitive static typed configuration for event metadata,
 * venue details, organizers, public contacts, and operating hours.
 * 
 * All client pages, components, SEO metadata, JSON-LD schemas, and communication templates
 * MUST consume these values directly to prevent information drift.
 */

export interface EventVenue {
  rooms: string;
  roomsEn: string;
  floor: string;
  floorEn: string;
  building: string;
  buildingEn: string;
  faculty: string;
  facultyEn: string;
  university: string;
  universityEn: string;
  campus: string;
  campusEn: string;
  address: {
    street: string;
    subdistrict: string;
    district: string;
    province: string;
    postalCode: string;
    country: string;
  };
  geo: {
    latitude: string;
    longitude: string;
  };
  googleMapsUrl: string;
}

export interface EventOrganizer {
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  url?: string;
}

export interface EventContact {
  name: string;
  nameEn: string;
  role: string;
  phone: string;
  tel: string;
}

export interface EventConfig {
  name: string;
  edition: number;
  editionLabelTh: string;
  editionLabelEn: string;
  thaiName: string;
  taglineTh: string;
  taglineEn: string;
  dateTh: string;
  dateEn: string;
  dateIso: string;
  startTime: string;
  endTime: string;
  timeLabelTh: string;
  timeLabelEn: string;
  venue: EventVenue;
  organizers: EventOrganizer[];
  contacts: EventContact[];
  publicEmail: string;
  social: {
    instagram: string;
    tiktok: string;
    facebook: string;
  };
}

export const EVENT_CONFIG: EventConfig = {
  name: 'MUMT Blood Donation 2026',
  edition: 9,
  editionLabelTh: 'ครั้งที่ 9',
  editionLabelEn: '9th Edition',
  thaiName: 'เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9',
  taglineTh: 'เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ',
  taglineEn: 'Fill Love to the Unit, Save Lives with Your Blood',
  dateTh: 'วันพุธที่ 16 กันยายน 2569',
  dateEn: 'Wednesday, September 16, 2026',
  dateIso: '2026-09-16',
  startTime: '09:00',
  endTime: '14:00',
  timeLabelTh: '09:00 – 14:00 น.',
  timeLabelEn: '09:00 AM – 02:00 PM',
  venue: {
    rooms: 'ห้องประชุม 217 - 218',
    roomsEn: 'Meeting Room 217 - 218',
    floor: 'ชั้น 2',
    floorEn: '2nd Floor',
    building: 'อาคารสิริวิทยา',
    buildingEn: 'Sirividhaya Building',
    faculty: 'คณะศิลปศาสตร์',
    facultyEn: 'Faculty of Liberal Arts',
    university: 'มหาวิทยาลัยมหิดล',
    universityEn: 'Mahidol University',
    campus: 'ศาลายา',
    campusEn: 'Salaya',
    address: {
      street: '999 ถนนพุทธมณฑลสาย 4',
      subdistrict: 'ตำบลศาลายา',
      district: 'อำเภอพุทธมณฑล',
      province: 'จังหวัดนครปฐม',
      postalCode: '73170',
      country: 'TH',
    },
    geo: {
      latitude: '13.7937',
      longitude: '100.3242',
    },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=อาคารสิริวิทยา+คณะศิลปศาสตร์+มหาวิทยาลัยมหิดล+ศาลายา',
  },
  organizers: [
    {
      name: 'คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล',
      nameEn: 'Faculty of Medical Technology, Mahidol University',
      role: 'ผู้จัดโครงการหลัก',
      roleEn: 'Main Project Organizer',
      url: 'https://mt.mahidol.ac.th',
    },
    {
      name: 'ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี สภากาชาดไทย',
      nameEn: 'Regional Blood Centre 4 Ratchaburi, Thai Red Cross Society',
      role: 'หน่วยรับบริจาคโลหิตเคลื่อนที่',
      roleEn: 'Mobile Blood Donation Unit',
    },
  ],
  contacts: [
    {
      name: 'เปา',
      nameEn: 'Pao',
      role: 'ฝ่ายประสานงานและดูแลผู้บริจาค',
      phone: '09-6986-6245',
      tel: '0969866245',
    },
    {
      name: 'แตงโม',
      nameEn: 'Tangmo',
      role: 'ฝ่ายประสานงานและดูแลผู้บริจาค',
      phone: '06-5627-4319',
      tel: '0656274319',
    },
  ],
  publicEmail: 'mumt68blooddonation@gmail.com',
  social: {
    instagram: 'https://www.instagram.com/mumt_loveunit/',
    tiktok: 'https://www.tiktok.com/@mumt_loveunit',
    facebook: 'https://www.facebook.com/profile.php?id=100064643707063',
  },
} as const;

/**
 * Helper to get the full formatted venue string in active language
 */
export function getFormattedVenue(lang: 'th' | 'en' = 'th'): string {
  if (lang === 'en') {
    return `${EVENT_CONFIG.venue.roomsEn} (${EVENT_CONFIG.venue.floorEn}), ${EVENT_CONFIG.venue.buildingEn}, ${EVENT_CONFIG.venue.facultyEn}, ${EVENT_CONFIG.venue.universityEn} ${EVENT_CONFIG.venue.campusEn}`;
  }
  return `${EVENT_CONFIG.venue.rooms} (${EVENT_CONFIG.venue.floor}) ${EVENT_CONFIG.venue.building} ${EVENT_CONFIG.venue.faculty} ${EVENT_CONFIG.venue.university} ${EVENT_CONFIG.venue.campus}`;
}
