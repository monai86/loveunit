import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'คู่มือและข้อควรปฏิบัติก่อน-หลังบริจาคโลหิต',
  description: 'คำแนะนำการเตรียมตัวก่อนบริจาคโลหิต (ดื่มน้ำ นอนหลับพักผ่อน งดอาหารไขมันสูง) ข้อควรระวังระหว่างบริจาค และการดูแลตนเองหลังบริจาคโลหิตอย่างถูกต้องและปลอดภัย',
  alternates: {
    canonical: '/prepare',
  },
  openGraph: {
    title: 'คู่มือการเตรียมตัวบริจาคโลหิต | MUMT Blood Donation 2026',
    description: 'เตรียมตัวให้พร้อมเพื่อการบริจาคโลหิตที่ราบรื่นและปลอดภัย',
    url: '/prepare',
  },
};

export default function PrepareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
