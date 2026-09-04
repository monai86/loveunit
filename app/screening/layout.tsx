import type { Metadata } from 'next';
import { OFFICIAL_SCREENING_QUESTIONS } from '@/lib/constants/screening-rules';

const count = OFFICIAL_SCREENING_QUESTIONS.length;

export const metadata: Metadata = {
  title: `แบบประเมินความพร้อมก่อนบริจาคโลหิตเบื้องต้น ${count} ข้อ (Self-Screening)`,
  description: `ประเมินความพร้อมและคุณสมบัติเบื้องต้นของผู้บริจาคโลหิตตามแนวทางศูนย์บริการโลหิต ${count} ข้อ ก่อนเดินทางมาจุดรับบริจาค (ไม่ใช่การวินิจฉัยทางการแพทย์)`,
  alternates: {
    canonical: '/screening',
  },
  openGraph: {
    title: `แบบประเมินตนเองเบื้องต้น ${count} ข้อก่อนบริจาคโลหิต | MUMT Blood Donation 2026`,
    description: `ประเมินสุขภาพและความพร้อมของตนเองเบื้องต้นก่อนเดินทางมาบริจาคโลหิต เพื่อความปลอดภัยและมั่นใจ`,
    url: '/screening',
  },
};

export default function ScreeningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
