import type { Metadata, Viewport } from "next";
import { Prompt, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import { StaffHeader } from "@/components/layout/StaffHeader";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { JsonLd } from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://loveunit.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "MUMT Blood Donation 2026 — เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9",
    template: "%s | MUMT Blood Donation 2026",
  },
  description: "ระบบลงทะเบียนออนไลน์กิจกรรมบริจาคโลหิต MUMT Blood Donation 2026 ครั้งที่ 9 จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี สภากาชาดไทย 16 กันยายน 2569",
  applicationName: "MUMT LoveUnit",
  authors: [{ name: "คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล", url: "https://mt.mahidol.ac.th" }],
  creator: "MUMT LoveUnit Team",
  publisher: "คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล",
  keywords: [
    "MUMT",
    "LoveUnit",
    "MUMT Blood Donation",
    "บริจาคโลหิต",
    "บริจาคเลือด",
    "มหิดล",
    "เทคนิคการแพทย์ มหิดล",
    "สภากาชาดไทย",
    "ภาคบริการโลหิตแห่งชาติที่ 4",
    "อาคารสิริวิทยา",
    "ศาลายา",
    "Blood Donation 2026",
    "เติมรักให้เต็ม Unit",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "th-TH": "/",
      "en-US": "/?lang=en",
    },
  },
  openGraph: {
    title: "MUMT Blood Donation 2026 — เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9",
    description: "ระบบลงทะเบียนออนไลน์กิจกรรมบริจาคโลหิต 16 กันยายน 2569 ณ อาคารสิริวิทยา คณะเทคนิคการแพทย์ ม.มหิดล ศาลายา ร่วมสร้างกุศลและส่งต่อโลหิตช่วยชีวิตเพื่อนมนุษย์",
    url: BASE_URL,
    siteName: "MUMT LoveUnit",
    images: [
      {
        url: "/images/poster-th.jpg",
        width: 1200,
        height: 630,
        alt: "โปสเตอร์ประชาสัมพันธ์ MUMT Blood Donation 2026 ครั้งที่ 9",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MUMT Blood Donation 2026 — เติมรักให้เต็ม Unit ครั้งที่ 9",
    description: "ลงทะเบียนบริจาคโลหิตออนไลน์ 16 กันยายน 2569 อาคารสิริวิทยา ม.มหิดล ศาลายา",
    images: ["/images/poster-th.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  category: "health",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`h-full antialiased ${prompt.variable} ${notoSansThai.variable}`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-[var(--bg)] text-[var(--ink)] pb-16 lg:pb-0" suppressHydrationWarning>
        <LanguageProvider>
          <JsonLd />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--burgundy-700)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
          >
            ข้ามไปยังเนื้อหาหลัก
          </a>
          <Navbar />
          <StaffHeader />
          <OfflineBanner />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
          <MobileBottomNav />
          <ServiceWorkerRegister />
        </LanguageProvider>
      </body>
    </html>
  );
}
