import { EVENT_CONFIG, getFormattedVenue } from '@/lib/constants/event';

export type Language = 'th' | 'en';

export const TRANSLATIONS = {
  nav: {
    home: { th: 'หน้าแรก', en: 'Home' },
    screening: { th: 'ประเมินตนเอง', en: 'Self-Screen' },
    knowledge: { th: 'ความรู้ & แล็บ', en: 'Knowledge & Lab' },
    prepare: { th: 'การเตรียมตัว', en: 'Preparation' },
    poster: { th: 'โปสเตอร์', en: 'Posters' },
    location: { th: 'สถานที่จัดงาน', en: 'Location' },
    register: { th: 'ลงทะเบียนบริจาคโลหิต', en: 'Register to Donate' },
    registerWalkIn: { th: 'ลงทะเบียน Walk-in', en: 'Walk-in Register' },
    lookup: { th: 'ค้นหาตั๋ว/QR', en: 'Find My QR' },
    brandSub: { th: 'เติมรักให้เต็ม Unit · ต่อชีวิตด้วยโลหิตคุณ', en: 'Give Blood · Share Love · Save Lives' },
    eventBadge: { th: EVENT_CONFIG.editionLabelTh, en: EVENT_CONFIG.editionLabelEn },
  },
  home: {
    badge: { th: `${EVENT_CONFIG.editionLabelTh} · ${EVENT_CONFIG.name}`, en: `${EVENT_CONFIG.editionLabelEn} · ${EVENT_CONFIG.name}` },
    title1a: { th: 'เติมรักให้เต็ม', en: 'Fill Your' },
    title1b: { th: 'UNIT', en: 'Unit' },
    title1c: { th: '', en: 'with Love' },
    title2: { th: 'ต่อชีวิตด้วยโลหิตคุณ', en: 'Save Lives with Your Blood' },
    description: {
      th: `โครงการบริจาคโลหิต MUMT LoveUnit ${EVENT_CONFIG.editionLabelTh} จัดโดย ${EVENT_CONFIG.organizers[0].name} ร่วมกับ ${EVENT_CONFIG.organizers[1].name} ณ ${EVENT_CONFIG.venue.building} ${EVENT_CONFIG.venue.faculty} ${EVENT_CONFIG.venue.university} ${EVENT_CONFIG.venue.campus}`,
      en: `Join the 9th MUMT Love Unit Blood Donation! Organized by the Faculty of Medical Technology, Mahidol University, together with Regional Blood Centre 4 Ratchaburi, Thai Red Cross Society at Sirividhaya Building, Mahidol University Salaya.`
    },
    venue: { th: getFormattedVenue('th'), en: getFormattedVenue('en') },
    date: { th: EVENT_CONFIG.dateTh, en: EVENT_CONFIG.dateEn },
    time: { th: EVENT_CONFIG.timeLabelTh, en: EVENT_CONFIG.timeLabelEn },
    ctaRegister: { th: 'ลงทะเบียนบริจาคโลหิตออนไลน์', en: 'Register Online' },
    ctaRegisterWalkIn: { th: 'ลงทะเบียน Walk-in หน้างาน', en: 'Walk-in Registration' },
    ctaLookup: { th: 'ค้นหาตั๋ว / QR Code ของฉัน', en: 'Find My QR Code Pass' },
    ctaPrepare: { th: 'ดูการเตรียมตัวก่อนบริจาค', en: 'Preparation Guide' },
    ctaScreening: { th: 'ทำแบบประเมินความพร้อมตนเอง', en: 'Pre-Screening Readiness' },
    statsTarget: { th: 'เป้าหมายผู้บริจาคโลหิต', en: 'Donor Target Goal' },
    statsUnits: { th: 'ยูนิต', en: 'Units' },
    statsSouvenirTitle: { th: 'อาหารว่าง & ดูแลสุขภาพ', en: 'Care & Refreshments' },
    statsSouvenirDesc: { th: 'อาหารว่าง เครื่องดื่มบำรุงสุขภาพ และจุดนั่งพักผ่อนดูแลผู้บริจาคทุกท่าน', en: 'Nourishing snacks, beverages, and recovery care for all participants' },
  },
  register: {
    title: { th: 'ลงทะเบียนบริจาคโลหิตออนไลน์', en: 'Online Blood Donation Registration' },
    subtitle: {
      th: 'กรอกข้อมูลและเลือกรอบเวลาเดินทาง เพื่อรับ QR Code สำหรับแสดงในวันงาน',
      en: 'Fill in your details and choose an arrival time slot to receive your check-in QR Code'
    },
    walkinTitle: { th: 'ลงทะเบียนบริจาคโลหิต Walk-in หน้างาน', en: 'Walk-in Blood Donation Registration' },
    walkinSubtitle: {
      th: 'กรอกข้อมูลเพื่อรับตั๋วและ QR Code สำหรับแสดงต่อเจ้าหน้าที่ในวันงานทันที',
      en: 'Register on-site to immediately receive your check-in QR Code pass'
    },
    walkinBadge: { th: 'โหมด Walk-in วันงาน (16 ก.ย. 2569)', en: 'Event Day Walk-in Mode (16 Sep 2026)' },
    walkinSlotLabel: { th: 'เวลาลงทะเบียน Walk-in (บันทึกเวลาหน้างานทันที)', en: 'Walk-in Registration Time (Recorded at event)' },
    step1Title: { th: 'ข้อมูลส่วนตัว', en: 'Personal Information' },
    step1Sub: { th: 'ใช้เวลาลงทะเบียนประมาณ 2 นาที', en: 'Takes approx. 2 minutes' },
    step2Title: { th: 'สังกัดและสถานภาพ', en: 'Affiliation & Status' },
    step2Sub: { th: 'เลือกสถานะและประสบการณ์การบริจาค', en: 'Select status and donation experience' },
    step3Title: { th: 'รอบเวลาเดินทาง', en: 'Arrival Time Slot' },
    step3Sub: { th: 'เลือกรอบเวลาที่คุณสะดวกเดินทางมาถึง', en: 'Choose your preferred arrival window' },
    stepReviewTitle: { th: 'ตรวจสอบข้อมูล', en: 'Review Information' },
    stepReviewSub: { th: 'ตรวจสอบความถูกต้องก่อนยืนยันรับตั๋ว', en: 'Review your details before confirmation' },
    reviewHeading: { th: 'ตรวจสอบข้อมูลการลงทะเบียน', en: 'Review Registration Details' },
    reviewPrompt: {
      th: 'กรุณาตรวจสอบความถูกต้องของข้อมูล หากถูกต้องเรียบร้อยแล้วกด "ยืนยันและรับตั๋ว QR Code"',
      en: 'Please verify your details. Click "Confirm & Get QR Pass" when ready.'
    },
    
    // Step 1 Form
    section1: { th: '01. ข้อมูลผู้ลงทะเบียน', en: '01. Personal Information' },
    firstName: { th: 'ชื่อจริง', en: 'First Name' },
    firstNamePlaceholder: { th: 'เช่น สมชาย', en: 'e.g. Somchai' },
    lastName: { th: 'นามสกุล', en: 'Last Name' },
    lastNamePlaceholder: { th: 'เช่น ใจดี', en: 'e.g. Jaidee' },
    phone: { th: 'เบอร์โทรศัพท์มือถือ', en: 'Mobile Phone Number' },
    phonePlaceholder: { th: 'เช่น 0812345678', en: 'e.g. 0812345678' },
    phoneHelp: { th: '* ใช้สำหรับค้นหาประวัติการลงทะเบียนกรณีลืม QR Code', en: '* Used to lookup your registration if you lose your QR Code' },
    forgotPassLink: { th: 'ลืม QR Code? ค้นหาที่นี่', en: 'Forgot QR Code? Find here' },
    email: { th: 'อีเมล (ไม่บังคับ)', en: 'Email Address (Optional)' },
    emailPlaceholder: { th: 'เช่น somchai@example.com', en: 'e.g. somchai@example.com' },
    emailHelp: { th: '* ระบบจะส่งอีเมลยืนยันพร้อม QR Code ให้ที่อีเมลนี้ (ถ้าระบุ)', en: '* A confirmation email with QR Code will be sent here if provided' },
    
    // Step 2 Form
    section2: { th: '02. สังกัดและสถานภาพ', en: '02. Affiliation & Status' },
    participantType: { th: 'ประเภทผู้เข้าร่วม', en: 'Participant Category' },
    typeStudent: { th: 'นักศึกษา ม.มหิดล', en: 'Mahidol Student' },
    typeStaff: { th: 'บุคลากร ม.มหิดล', en: 'Mahidol Staff' },
    typeGeneral: { th: 'บุคคลทั่วไป', en: 'General Public' },
    faculty: { th: 'คณะ / ส่วนงาน / หน่วยงาน', en: 'Faculty / Department / Affiliation' },
    selectFaculty: { th: 'เลือกคณะ / หน่วยงาน', en: 'Select Faculty / Organization' },
    academicYear: { th: 'ระดับชั้นปีการศึกษา', en: 'Academic Year' },
    selectYear: { th: 'เลือกระดับชั้นปี', en: 'Select Academic Year' },
    donationExp: { th: 'ประสบการณ์การบริจาคโลหิต', en: 'Blood Donation Experience' },
    expFirst: { th: 'บริจาคครั้งแรก', en: 'First-time Donor' },
    expFirstDesc: { th: 'ยังไม่เคยบริจาคโลหิตมาก่อน', en: 'Never donated blood before' },
    expRegular: { th: 'เคยบริจาคแล้ว', en: 'Regular Donor' },
    expRegularDesc: { th: 'เคยบริจาคโลหิตมาแล้วอย่างน้อย 1 ครั้ง', en: 'Have donated blood at least once before' },
    prSource: { th: 'แหล่งข่าวสารที่ทำให้ทราบกิจกรรมนี้', en: 'How did you hear about this event?' },
    prSourceOptional: { th: '(ไม่บังคับ)', en: '(Optional)' },
    prOtherPlaceholder: { th: 'ระบุแหล่งข่าวสารอื่นๆ...', en: 'Please specify other source...' },
    
    // Step 3 Form
    section3: { th: '03. เลือกรอบเวลาเดินทาง', en: '03. Choose Arrival Time Slot' },
    slotNotice: {
      th: 'การลงทะเบียนล่วงหน้ามีวัตถุประสงค์เพื่อช่วยให้การจัดสรรและบริหารจัดการหน้างานเป็นไปอย่างราบรื่น ลดความแออัด และเตรียมพร้อมรองรับทั้งผู้ที่เดินทางมาแบบ walk-in และผู้ที่ลงทะเบียนล่วงหน้าได้อย่างมีประสิทธิภาพ ทั้งนี้ แต่ละช่วงเวลาไม่ใช่การล็อกคิว โดยลำดับการเข้ารับบริการจะยึดตามเวลาที่เดินทางมาถึงและการตรวจคัดกรองหน้างาน',
      en: 'Advance registration is designed to streamline on-site management, reduce congestion, and smoothly accommodate both walk-in and registered donors. Time slot selection is for arrival distribution and is not a locked queue. Service order follows your arrival and on-site clinical screening.'
    },
    privacyNotice: {
      title: { th: 'ประกาศคุ้มครองข้อมูลส่วนบุคคล', en: 'Personal Data Protection Notice' },
      body: {
        th: 'คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี สภากาชาดไทย ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พุทธศักราช 2562 ทั้งนี้ แบบประเมินสุขภาพเบื้องต้นจะไม่มีการบันทึกไว้ในระบบหรือฐานข้อมูลใดทั้งสิ้น โดยระบบจะจัดเก็บเฉพาะข้อมูลติดต่อ ได้แก่ ชื่อ นามสกุล หมายเลขโทรศัพท์ อีเมล และสังกัด เพื่อใช้ในการจัดสรรรอบเวลา ออกตั๋วลงทะเบียนออนไลน์ ยืนยันตัวตน ประสานงานหน้างาน และนำไปใช้สำหรับการพัฒนาปรับปรุงโครงการ เพื่อให้ทราบประวัติผู้ที่เคยร่วมบริจาคกับโครงการ รวมถึงการเสริมสร้างความสัมพันธ์และการมีส่วนร่วมของผู้บริจาคโลหิตในระยะยาว โดยไม่มีการเปิดเผยต่อบุคคลภายนอก',
        en: 'Faculty of Medical Technology, Mahidol University, together with Regional Blood Centre 4 Ratchaburi, Thai Red Cross Society, respects your privacy under the Personal Data Protection Act. Preliminary health assessment results will not be recorded or stored in any database. The system only stores contact details, including your name, phone number, email, and affiliation, to manage arrival scheduling, generate digital passes, verify identity on-site, and support continuous project improvement, historical donor tracking, and ongoing donor engagement without unauthorized third-party disclosure.'
      },
      accept: {
        th: 'ข้าพเจ้าได้อ่านและยินยอมตามประกาศคุ้มครองข้อมูลส่วนบุคคล และรับทราบคำแนะนำการเตรียมตัว',
        en: 'I have read and consent to the Personal Data Protection Notice and acknowledge preparation guidelines.'
      }
    },
    
    // Buttons & Navigation
    btnNext: { th: 'ถัดไป', en: 'Next' },
    btnBack: { th: 'ย้อนกลับ', en: 'Back' },
    btnReview: { th: 'ตรวจสอบข้อมูล', en: 'Review Information' },
    btnEdit: { th: 'แก้ไขข้อมูล', en: 'Edit Details' },
    btnSubmit: { th: 'ยืนยันการลงทะเบียน', en: 'Confirm Registration' },
    btnSubmitAndGetTicket: { th: 'ยืนยันและรับตั๋ว QR Code', en: 'Confirm & Get QR Pass' },
    btnSubmitting: { th: 'กำลังบันทึกข้อมูลและสร้างตั๋ว...', en: 'Registering & Generating Pass...' },
    
    // Validation Errors
    errFirstName: { th: 'กรุณากรอกชื่อจริง', en: 'Please enter your first name' },
    errLastName: { th: 'กรุณากรอกนามสกุล', en: 'Please enter your last name' },
    errPhone: { th: 'กรุณากรอกเบอร์โทรศัพท์มือถือ', en: 'Please enter your mobile phone number' },
    errPhoneInvalid: { th: 'กรุณากรอกเบอร์โทรศัพท์ 9-10 หลักให้ถูกต้อง', en: 'Please enter a valid 9-10 digit phone number' },
    errEmailInvalid: { th: 'กรุณากรอกอีเมลให้ถูกต้อง หรือเว้นว่างไว้', en: 'Please enter a valid email address or leave blank' },
    errParticipantType: { th: 'กรุณาเลือกประเภทผู้เข้าร่วม', en: 'Please select participant category' },
    errFaculty: { th: 'กรุณาเลือกคณะ / หน่วยงาน', en: 'Please select faculty or organization' },
    errYear: { th: 'กรุณาเลือกระดับชั้นปีการศึกษา', en: 'Please select academic year' },
    errExp: { th: 'กรุณาเลือกประสบการณ์การบริจาค', en: 'Please select donation experience' },
    errSlot: { th: 'กรุณาเลือกรอบเวลาที่ต้องการเดินทางมาถึง', en: 'Please select an arrival time slot' },
    errPrivacy: { th: 'กรุณายอมรับประกาศความเป็นส่วนตัวเพื่อดำเนินการต่อ', en: 'Please accept the privacy notice to proceed' },
    errNetwork: { th: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้ง', en: 'Network connection error. Please try again.' },
    errSlotLoad: { th: 'ไม่สามารถโหลดข้อมูลช่วงเวลาได้ กรุณาลองใหม่อีกครั้ง', en: 'Unable to load time slots. Please try again.' },
  },
  ticket: {
    confirmedBadge: { th: 'ลงทะเบียนสำเร็จแล้ว', en: 'Registration Confirmed' },
    title: { th: 'บัตรลงทะเบียนบริจาคโลหิต', en: 'Blood Donation Donor Pass' },
    subTitle: { th: 'กรุณาบันทึกภาพหน้าจอหรือแสดง QR Code นี้แก่เจ้าหน้าที่ในวันงาน', en: 'Please save this screenshot or present this QR Code to staff at the event' },
    registrationCode: { th: 'รหัสลงทะเบียน', en: 'Registration Code' },
    donorName: { th: 'ชื่อผู้บริจาค', en: 'Donor Name' },
    phone: { th: 'เบอร์โทรศัพท์', en: 'Phone' },
    faculty: { th: 'สังกัด / คณะ', en: 'Affiliation / Faculty' },
    appointment: { th: 'รอบเวลานัดหมาย', en: 'Appointment Time' },
    date: { th: 'วันที่จัดกิจกรรม', en: 'Event Date' },
    venue: { th: 'สถานที่จัดกิจกรรม', en: 'Event Venue' },
    copyCode: { th: 'คัดลอกรหัส', en: 'Copy Code' },
    copied: { th: 'คัดลอกแล้ว!', en: 'Copied!' },
    downloadPass: { th: 'บันทึกภาพบัตรลงทะเบียน', en: 'Download Donor Pass' },
    downloading: { th: 'กำลังดาวน์โหลด...', en: 'Downloading...' },
    addToCalendar: { th: 'เพิ่มลง Google Calendar', en: 'Add to Google Calendar' },
    downloadIcs: { th: 'ดาวน์โหลดปฏิทิน (.ics)', en: 'Download .ICS Calendar' },
    share: { th: 'แชร์บัตรลงทะเบียน', en: 'Share Pass' },
    importantNotice: {
      title: { th: 'สิ่งที่ต้องเตรียมมาในวันงาน', en: 'What to bring on event day' },
      item1: { th: 'บัตรประจำตัวประชาชนตัวจริง (หรือเอกสารที่ทางราชการออกให้)', en: 'Original National ID Card (or government-issued ID)' },
      item2: { th: 'นอนหลับพักผ่อนให้เพียงพอติดต่อกันอย่างน้อย 5 ชั่วโมง', en: 'Sleep continuously for at least 5 hours prior to donation' },
      item3: { th: 'ดื่มน้ำ 300–500 มล. (2–3 แก้ว) ก่อนเข้าบริจาคประมาณ 30 นาที', en: 'Drink 300–500 mL water ~30 mins before donation' },
      item4: { th: 'หลีกเลี่ยงอาหารที่มีไขมันสูงก่อนบริจาคอย่างน้อย 6 ชั่วโมง (ไม่อดอาหาร)', en: 'Avoid high-fat meals at least 6 hours before donation (do not fast)' },
    },
    backHome: { th: 'กลับสู่หน้าหลัก', en: 'Back to Home' },
    newLookup: { th: 'ค้นหาบัตรอื่น', en: 'Search Another Pass' },
  },
  footer: {
    orgTitle: { th: 'โครงการบริจาคโลหิต MUMT LoveUnit ครั้งที่ 9', en: '9th MUMT LoveUnit Blood Donation Project' },
    orgDesc: {
      th: 'จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี สภากาชาดไทย ณ อาคารสิริวิทยา มหาวิทยาลัยมหิดล ศาลายา',
      en: 'Organized by Faculty of Medical Technology, Mahidol University in collaboration with Regional Blood Centre 4 Ratchaburi, Thai Red Cross Society at Sirividhaya Building, Mahidol University Salaya.'
    },
    eventDate: { th: '16 กันยายน 2569 (09:00 - 14:00 น.)', en: 'September 16, 2026 (09:00 AM - 02:00 PM)' },
    donorLinksTitle: { th: 'สำหรับผู้บริจาค', en: 'For Donors' },
    linkHome: { th: 'หน้าหลัก', en: 'Home' },
    linkRegister: { th: 'ลงทะเบียนออนไลน์', en: 'Online Registration' },
    linkScreening: { th: 'แบบประเมินความพร้อมตนเอง (Pre-Screening)', en: 'Self-Screening Form' },
    linkPrepare: { th: 'คู่มือการเตรียมตัว', en: 'Preparation Guide' },
    linkKnowledge: { th: 'ความรู้เรื่องโลหิต & แล็บ', en: 'Blood Knowledge & Labs' },
    linkLocation: { th: 'สถานที่จัดงาน & แผนที่', en: 'Venue & Directions' },
    linkLookup: { th: 'ค้นหาบัตรลงทะเบียน / QR Code', en: 'Find Registration / QR Code' },
    contactTitle: { th: 'ติดต่อสอบถาม', en: 'Contact & Inquiries' },
    contactFaculty: { th: 'คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล', en: 'Faculty of Medical Technology, Mahidol University' },
    contactPhone: { th: 'โทร. 0 2441 4371-5', en: 'Tel: +66 2441 4371-5' },
    copyright: {
      th: '© 2026 คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล (MUMT). สงวนลิขสิทธิ์ทั้งหมด.',
      en: '© 2026 Faculty of Medical Technology, Mahidol University (MUMT). All rights reserved.'
    }
  },
  common: {
    loading: { th: 'กำลังโหลด...', en: 'Loading...' },
    error: { th: 'เกิดข้อผิดพลาด', en: 'An error occurred' },
    tryAgain: { th: 'ลองใหม่อีกครั้ง', en: 'Try Again' },
    close: { th: 'ปิด', en: 'Close' },
    save: { th: 'บันทึก', en: 'Save' },
    cancel: { th: 'ยกเลิก', en: 'Cancel' },
  }
} as const;
