import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ค้นหาบัตรลงทะเบียน & Digital Pass QR Code',
  description: 'ค้นหาตั๋วลงทะเบียนและ QR Code สำหรับเช็คอินวันงาน MUMT Blood Donation 2026 ด้วยหมายเลขโทรศัพท์ที่ได้ลงทะเบียนไว้',
  alternates: {
    canonical: '/lookup',
  },
  openGraph: {
    title: 'ค้นหาตั๋วลงทะเบียน / QR Code | MUMT Blood Donation 2026',
    description: 'กรอกเบอร์โทรศัพท์เพื่อค้นหาและแสดงบัตร Digital Pass ของคุณ',
    url: '/lookup',
  },
};

export default function LookupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
