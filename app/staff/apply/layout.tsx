import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'สมัครเป็น Staff ร่วมจัดกิจกรรม',
  description: 'เปิดรับสมัครนักศึกษาและบุคลากรเข้าร่วมเป็นทีมงาน Staff กิจกรรมบริจาคโลหิต MUMT Blood Donation 2026',
  alternates: {
    canonical: '/staff/apply',
  },
  openGraph: {
    title: 'สมัครเป็น Staff ร่วมจัดกิจกรรม | MUMT Blood Donation 2026',
    description: 'ร่วมเป็นส่วนหนึ่งของทีมงานจิตอาสา MUMT LoveUnit ครั้งที่ 9',
    url: '/staff/apply',
  },
};

export default function StaffApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
