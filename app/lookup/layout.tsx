import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ค้นหาบัตรลงทะเบียน & Digital Pass (ค้นหาด้วยเบอร์โทรศัพท์ / อีเมล)',
  description: 'ค้นหาและเปิดดูตั๋วลงทะเบียนพร้อม QR Code สำหรับเช็คอินวันงาน MUMT Blood Donation 2026 ด้วยหมายเลขโทรศัพท์ที่ลงทะเบียนไว้',
  alternates: {
    canonical: '/lookup',
  },
  openGraph: {
    title: 'ค้นหาตั๋วลงทะเบียน / Digital Pass | MUMT Blood Donation 2026',
    description: 'กรอกเบอร์โทรศัพท์เพื่อค้นหาและเปิดดูตั๋วลงทะเบียนพร้อม QR Code ของคุณได้ทันที',
    url: '/lookup',
  },
};

export default function LookupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
