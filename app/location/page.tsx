import type { Metadata } from 'next';
import { getEventBySlug, getEventContentBlocks } from '@/services/event-service';
import { pickField } from '@/lib/utils/format';
import { LocationClient } from '@/components/location/LocationClient';

export const metadata: Metadata = {
  title: 'สถานที่จัดงาน & แผนที่การเดินทาง',
  description: 'แผนที่และข้อมูลการเดินทางสู่ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ศาลายา สถานที่จัดกิจกรรม MUMT Blood Donation 2026',
  alternates: {
    canonical: '/location',
  },
  openGraph: {
    title: 'สถานที่จัดงาน & แผนที่การเดินทาง | MUMT Blood Donation 2026',
    description: 'ห้องประชุม 217 อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา พร้อมข้อมูลจุดจอดรถและเส้นทางรถประจำทาง',
    url: '/location',
  },
};

export const dynamic = 'force-dynamic';

export default async function LocationPage() {
  const event = await getEventBySlug('mumt-2026');
  const contentBlocks = event ? await getEventContentBlocks(event.id) : [];
  const locationInfographicBlock = contentBlocks.find(b => pickField<string>(b, 'contentKey', 'content_key') === 'location_infographic');
  const transportInfographicBlock = contentBlocks.find(b => pickField<string>(b, 'contentKey', 'content_key') === 'transportation_infographic');

  const locationInfographic = locationInfographicBlock ? {
    title: locationInfographicBlock.title,
    description: locationInfographicBlock.description || undefined,
    imageUrl: pickField<string>(locationInfographicBlock, 'imageUrl', 'image_url'),
    altText: pickField<string>(locationInfographicBlock, 'altText', 'alt_text'),
  } : null;

  const transportInfographic = transportInfographicBlock ? {
    title: transportInfographicBlock.title,
    description: transportInfographicBlock.description || undefined,
    imageUrl: pickField<string>(transportInfographicBlock, 'imageUrl', 'image_url'),
    altText: pickField<string>(transportInfographicBlock, 'altText', 'alt_text'),
  } : null;

  return (
    <LocationClient
      locationInfographic={locationInfographic}
      transportInfographic={transportInfographic}
    />
  );
}
