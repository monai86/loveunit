import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'บัตรลงทะเบียนผู้บริจาคโลหิต (Digital Pass) | MUMT LoveUnit 2026',
  description: 'บัตรลงทะเบียนผู้บริจาคโลหิตออนไลน์ MUMT LoveUnit ครั้งที่ 9',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RegistrationCodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
