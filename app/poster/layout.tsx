import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'โปสเตอร์ประชาสัมพันธ์ & สื่อภาพกิจกรรม',
  description: 'ดาวน์โหลดโปสเตอร์ประชาสัมพันธ์กิจกรรม MUMT Blood Donation 2026 ทั้งภาษาไทยและภาษาอังกฤษ พร้อมภาพแกลเลอรีและรายละเอียดกิจกรรม',
  alternates: {
    canonical: '/poster',
  },
  openGraph: {
    title: 'โปสเตอร์ประชาสัมพันธ์ | MUMT Blood Donation 2026',
    description: 'ดาวน์โหลดโปสเตอร์ความละเอียดสูงเพื่อร่วมเป็นกระบอกเสียงชวนเพื่อนๆ มาร่วมบริจาคโลหิต',
    url: '/poster',
    images: [
      {
        url: '/images/poster-th.jpg',
        width: 1200,
        height: 630,
        alt: 'โปสเตอร์ประชาสัมพันธ์ MUMT Blood Donation 2026 ภาษาไทย',
      },
    ],
  },
};

export default function PosterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
