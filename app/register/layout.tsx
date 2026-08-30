import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ลงทะเบียนบริจาคโลหิตออนไลน์',
  description: 'ลงทะเบียนจองรอบเวลาบริจาคโลหิตล่วงหน้า หรือลงทะเบียน Walk-in หน้างาน กิจกรรม MUMT Blood Donation 2026 วันที่ 16 กันยายน 2569 ณ อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล',
  alternates: {
    canonical: '/register',
  },
  openGraph: {
    title: 'ลงทะเบียนบริจาคโลหิตออนไลน์ | MUMT Blood Donation 2026',
    description: 'เลือกช่วงเวลาที่สะดวกและรับ Digital Pass QR Code ทันที 16 ก.ย. 2569 อาคารสิริวิทยา ม.มหิดล ศาลายา',
    url: '/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
