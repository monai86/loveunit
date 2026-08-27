import type { Metadata, Viewport } from "next";
import { Prompt, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
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
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "MUMT Blood Donation 2026 — เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9",
  description: "ระบบลงทะเบียนออนไลน์กิจกรรมบริจาคโลหิต MUMT Blood Donation 2026 จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี",
  keywords: ["MUMT", "บริจาคโลหิต", "มหิดล", "เทคนิคการแพทย์", "Blood Donation 2026", "สภากาชาดไทย"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`h-full antialiased ${prompt.variable} ${notoSansThai.variable}`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-[var(--bg)] text-[var(--ink)] pb-16 lg:pb-0" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
