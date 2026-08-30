import React from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://loveunit.vercel.app';

export function JsonLd() {
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'MUMT Blood Donation 2026 — เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9',
    alternateName: 'MUMT LoveUnit ครั้งที่ 9',
    description: 'กิจกรรมบริจาคโลหิตประจำปี 2026 จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี สภากาชาดไทย',
    startDate: '2026-09-16T09:00:00+07:00',
    endDate: '2026-09-16T14:00:00+07:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ศาลายา',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '999 ถนนพุทธมณฑลสาย 4 ตำบลศาลายา',
        addressLocality: 'อำเภอพุทธมณฑล',
        addressRegion: 'จังหวัดนครปฐม',
        postalCode: '73170',
        addressCountry: 'TH',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '13.7937',
        longitude: '100.3242',
      },
    },
    image: [
      `${BASE_URL}/images/poster-th.jpg`,
      `${BASE_URL}/images/og-image.png`,
      `${BASE_URL}/images/logo.png`,
    ],
    organizer: {
      '@type': 'EducationalOrganization',
      name: 'คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล (Faculty of Medical Technology, Mahidol University)',
      url: 'https://mt.mahidol.ac.th',
      logo: `${BASE_URL}/images/logo.png`,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-08-01T00:00:00+07:00',
      url: `${BASE_URL}/register`,
    },
    performer: {
      '@type': 'Organization',
      name: 'ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี สภากาชาดไทย',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+66-9-6986-6245',
        contactType: 'customer service',
        availableLanguage: ['Thai', 'English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+66-6-5627-4319',
        contactType: 'customer service',
        availableLanguage: ['Thai', 'English'],
      },
    ],
    sameAs: [
      'https://www.instagram.com/mumt_loveunit/',
      'https://www.tiktok.com/@mumt_loveunit',
      'https://www.facebook.com/profile.php?id=100064643707063',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
