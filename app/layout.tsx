import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Win95Taskbar } from "@/components/layout/Win95Taskbar";

export const metadata: Metadata = {
  title: "MUMT Blood Donation 2026 — เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9",
  description: "ระบบลงทะเบียนออนไลน์กิจกรรมบริจาคโลหิต MUMT Blood Donation 2026 จัดโดย คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ สภากาชาดไทย",
  keywords: ["MUMT", "บริจาคโลหิต", "มหิดล", "เทคนิคการแพทย์", "Blood Donation 2026", "สภากาชาดไทย"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[#008080] text-black">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Win95Taskbar />
      </body>
    </html>
  );
}
