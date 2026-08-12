import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: "MUMT Blood Donation 2026 — เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9",
  description: "ระบบลงทะเบียนออนไลน์กิจกรรมบริจาคโลหิต MUMT Blood Donation 2026 จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ สภากาชาดไทย",
  keywords: ["MUMT", "บริจาคโลหิต", "มหิดล", "เทคนิคการแพทย์", "Blood Donation 2026", "สภากาชาดไทย"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-[#F7F3EE] text-[#282828] pb-16 lg:pb-0" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
