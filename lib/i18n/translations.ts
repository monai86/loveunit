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
    eventBadge: { th: 'ครั้งที่ 9', en: '9th Edition' },
  },
  home: {
    badge: { th: 'ครั้งที่ 9 · MUMT Blood Donation 2026', en: '9th · MUMT Blood Donation 2026' },
    title1a: { th: 'เติมรักให้เต็ม', en: 'Fill Your' },
    title1b: { th: 'UNIT', en: 'Unit' },
    title1c: { th: '', en: 'with Love' },
    title2: { th: 'ต่อชีวิตด้วยโลหิตคุณ', en: 'Save Lives with Your Blood' },
    description: {
      th: 'โครงการบริจาคโลหิต MUMT LoveUnit ครั้งที่ 9 จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี สภากาชาดไทย ณ อาคารสิริวิทยา ม.มหิดล ศาลายา',
      en: 'Join the 9th MUMT Love Unit Blood Donation! Organized by the Faculty of Medical Technology, Mahidol University, together with Regional Blood Centre 4 Ratchaburi, Thai Red Cross Society at Sirividhaya Building, Mahidol University Salaya.'
    },
    venue: { th: 'ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ ม.มหิดล ศาลายา', en: 'Meeting Room 217, Sirividhaya Building, Mahidol University Salaya' },
    date: { th: 'วันพุธที่ 16 กันยายน 2569', en: 'Wednesday, September 16, 2026' },
    time: { th: '09:00 - 14:00 น.', en: '09:00 AM - 02:00 PM' },
    ctaRegister: { th: 'ลงทะเบียนบริจาคโลหิตออนไลน์', en: 'Register Online' },
    ctaRegisterWalkIn: { th: 'ลงทะเบียน Walk-in หน้างาน', en: 'Walk-in Registration' },
    ctaLookup: { th: 'ค้นหาตั๋ว / QR Code ของฉัน', en: 'Find My QR Code Pass' },
    ctaPrepare: { th: 'ดูการเตรียมตัวก่อนบริจาค', en: 'Preparation Guide' },
    ctaScreening: { th: 'ทำแบบประเมินสุขภาพตนเอง', en: 'Self-Screening' },
    statsTarget: { th: 'เป้าหมายผู้บริจาคโลหิต', en: 'Donor Target Goal' },
    statsUnits: { th: 'ยูนิต', en: 'Units' },
    statsSouvenirTitle: { th: 'ของที่ระลึกสุดพิเศษ', en: 'Exclusive Souvenir' },
    statsSouvenirDesc: { th: 'สำหรับผู้ลงทะเบียนออนไลน์ตรงเวลา 100 ท่านแรก และ Walk-in ที่บริจาคสำเร็จ 100 ท่านแรก', en: 'For the first 100 on-time online donors and first 100 completed walk-ins' },
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
    
    // Step 3 Form
    section3: { th: '03. เลือกรอบเวลาเดินทาง', en: '03. Choose Arrival Time Slot' },
    slotNotice: {
      th: '💡 เลือกรอบเวลาแนะนำการเดินทางมาถึงเพื่อช่วยกระจายความหนาแน่น ท่านสามารถเดินทางมาถึงและยืนยันตัวตนได้ตลอดช่วงเวลากิจกรรม (09:00 - 14:00 น.)',
      en: '💡 Choose your estimated arrival window to balance donor traffic. You are welcome to arrive and verify attendance anytime during event hours (09:00 AM - 02:00 PM).'
    },
    privacyNotice: {
      title: { th: 'ประกาศคุ้มครองข้อมูลส่วนบุคคล (PDPA Privacy Notice)', en: 'Personal Data Protection Notice (PDPA)' },
      body: {
        th: 'คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จ.ราชบุรี สภากาชาดไทย ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ข้อมูลของท่าน (ชื่อ-นามสกุล, เบอร์โทรศัพท์, สังกัด) จะถูกจัดเก็บและใช้เฉพาะเพื่อการจัดสรรรอบเวลา ออกตั๋วลงทะเบียนออนไลน์ (Digital Ticket Pass) ยืนยันตัวตน และประสานงานหน้างานเท่านั้น โดยไม่มีการเปิดเผยต่อบุคคลภายนอก และจะลบทำลายข้อมูลออกจากระบบภายใน 30 วันหลังเสร็จสิ้นโครงการ (ทั้งนี้ แบบประเมินสุขภาพเบื้องต้นถูกประมวลผลบนอุปกรณ์ของท่านโดยตรง ไม่มีการบันทึกประวัติสุขภาพลงฐานข้อมูล)',
        en: 'Faculty of Medical Technology, Mahidol University, together with Regional Blood Centre 4 Ratchaburi, Thai Red Cross Society, respects your privacy under the Personal Data Protection Act B.E. 2562 (PDPA). Your information (name, phone, affiliation) is processed solely for arrival scheduling, digital ticket generation, identity verification, and on-site event coordination without unauthorized third-party disclosure, and will be securely deleted within 30 days post-event. Preliminary health screening is computed locally on your device without storing health records in databases.'
      },
      accept: {
        th: 'ข้าพเจ้าได้อ่านและยินยอมตามประกาศคุ้มครองข้อมูลส่วนบุคคล (PDPA) และรับทราบคำแนะนำการเตรียมตัว',
        en: 'I have read and consent to the Personal Data Protection (PDPA) notice and acknowledge preparation guidelines.'
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
      item2: { th: 'นอนหลับพักผ่อนให้เพียงพออย่างน้อย 5 ชั่วโมง', en: 'Sleep at least 5 hours prior to donation' },
      item3: { th: 'ดื่มน้ำ 3-4 แก้วก่อนเข้าบริจาค 30 นาที', en: 'Drink 3-4 glasses of water 30 mins before donation' },
      item4: { th: 'หลีกเลี่ยงอาหารที่มีไขมันสูงก่อนบริจาคอย่างน้อย 6 ชั่วโมง', en: 'Avoid high-fat meals at least 6 hours before donation' },
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
    linkScreening: { th: 'แบบคัดกรองตนเอง (Self-Screen)', en: 'Self-Screening Form' },
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
