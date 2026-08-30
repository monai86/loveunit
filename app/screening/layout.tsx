import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แบบประเมินความพร้อมก่อนบริจาคโลหิต 24 ข้อ (Self-Screening)',
  description: 'เช็กความพร้อมและคุณสมบัติเบื้องต้นของผู้บริจาคโลหิตตามเกณฑ์มาตรฐานของศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย 24 ข้อ ทราบผลทันที',
  alternates: {
    canonical: '/screening',
  },
  openGraph: {
    title: 'แบบประเมินตนเอง 24 ข้อก่อนบริจาคโลหิต | MUMT Blood Donation 2026',
    description: 'ประเมินสุขภาพและความพร้อมของตนเองก่อนเดินทางมาบริจาคโลหิต เพื่อความปลอดภัยและมั่นใจ',
    url: '/screening',
  },
};

export default function ScreeningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
