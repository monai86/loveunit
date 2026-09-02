import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ความรู้เรื่องโลหิต & การตรวจทางห้องปฏิบัติการทางการแพทย์',
  description: 'เรียนรู้กระบวนการตรวจวิเคราะห์โลหิตในห้องปฏิบัติการเทคนิคการแพทย์ (Blood Bank Testing, Infectious Disease Screening, ABO/Rh Compatibility) และการตรวจคัดกรองโลหิตบริจาคตามมาตรฐานสากล',
  keywords: [
    'ตรวจเลือด',
    'การตรวจทางห้องปฏิบัติการ',
    'เทคนิคการแพทย์',
    'หมู่เลือด ABO',
    'Rh',
    'ความเข้ากันได้ของเลือด',
    'การตรวจคัดกรองโรคติดเชื้อ',
    'ส่วนประกอบโลหิต',
  ],
  alternates: {
    canonical: '/knowledge',
  },
  openGraph: {
    title: 'ความรู้เรื่องโลหิต & การตรวจแล็บ | MUMT Blood Donation 2026',
    description: 'เจาะลึกวิทยาศาสตร์เบื้องหลังการบริจาคโลหิตและการตรวจทางห้องปฏิบัติการโดยนักเทคนิคการแพทย์ มหิดล',
    url: '/knowledge',
  },
};

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
