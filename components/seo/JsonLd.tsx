import React from 'react';
import { EVENT_CONFIG } from '@/lib/constants/event';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://loveunit.vercel.app';

export function JsonLd() {
  const mainOrganizer = EVENT_CONFIG.organizers[0];
  const mobilePartner = EVENT_CONFIG.organizers[1];

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${EVENT_CONFIG.name} — ${EVENT_CONFIG.thaiName}`,
    alternateName: `MUMT LoveUnit ${EVENT_CONFIG.editionLabelTh}`,
    description: `กิจกรรมบริจาคโลหิตประจำปี 2026 จัดโดย ${mainOrganizer.name} ร่วมกับ ${mobilePartner.name}`,
    startDate: `${EVENT_CONFIG.dateIso}T${EVENT_CONFIG.startTime}:00+07:00`,
    endDate: `${EVENT_CONFIG.dateIso}T${EVENT_CONFIG.endTime}:00+07:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: `${EVENT_CONFIG.venue.rooms} (${EVENT_CONFIG.venue.floor}) ${EVENT_CONFIG.venue.building} ${EVENT_CONFIG.venue.faculty} ${EVENT_CONFIG.venue.university} ${EVENT_CONFIG.venue.campus}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${EVENT_CONFIG.venue.address.street} ${EVENT_CONFIG.venue.address.subdistrict}`,
        addressLocality: EVENT_CONFIG.venue.address.district,
        addressRegion: EVENT_CONFIG.venue.address.province,
        postalCode: EVENT_CONFIG.venue.address.postalCode,
        addressCountry: EVENT_CONFIG.venue.address.country,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: EVENT_CONFIG.venue.geo.latitude,
        longitude: EVENT_CONFIG.venue.geo.longitude,
      },
    },
    image: [
      `${BASE_URL}/images/poster-th.jpg`,
      `${BASE_URL}/images/og-image.png`,
      `${BASE_URL}/images/logo.png`,
    ],
    organizer: {
      '@type': 'EducationalOrganization',
      name: `${mainOrganizer.name} (${mainOrganizer.nameEn})`,
      url: mainOrganizer.url || 'https://mt.mahidol.ac.th',
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
      name: mobilePartner.name,
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: mainOrganizer.name,
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    contactPoint: EVENT_CONFIG.contacts.map((c) => ({
      '@type': 'ContactPoint',
      telephone: `+66-${c.phone.replace(/^0/, '')}`,
      contactType: 'customer service',
      availableLanguage: ['Thai', 'English'],
    })),
    sameAs: [
      EVENT_CONFIG.social.instagram,
      EVENT_CONFIG.social.tiktok,
      EVENT_CONFIG.social.facebook,
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
