'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  BookOpen, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Monitor, 
  Volume2, 
  HelpCircle, 
  Power,
  Sparkles
} from 'lucide-react';

export function Win95Taskbar() {
  const pathname = usePathname();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Start Menu Overlay Popup */}
      {startMenuOpen && (
        <div 
          className="fixed bottom-10 left-1 z-50 w-72 win95-window shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex">
            {/* Sidebar Banner */}
            <div className="w-9 bg-gradient-to-t from-[#000080] via-[#1084D0] to-[#7A1020] p-1 flex flex-col justify-end items-center">
              <span className="-rotate-90 text-sm font-black tracking-widest text-white whitespace-nowrap opacity-90">
                MUMT 95
              </span>
            </div>

            {/* Menu Links */}
            <div className="flex-1 bg-[#C0C0C0] p-1 space-y-1 text-xs font-bold text-black">
              <div className="px-3 py-1.5 bg-[#000080] text-white flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>MUMT Blood Donation 2026</span>
              </div>

              <Link
                href="/"
                onClick={() => setStartMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#000080] hover:text-white rounded-none"
              >
                <Monitor className="h-4 w-4 text-[#7A1020]" />
                <span>หน้าหลัก (Desktop)</span>
              </Link>

              <Link
                href="/register"
                onClick={() => setStartMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#000080] hover:text-white rounded-none"
              >
                <Calendar className="h-4 w-4 text-[#7A1020]" />
                <span>ลงทะเบียนบริจาคโลหิต</span>
              </Link>

              <Link
                href="/prepare"
                onClick={() => setStartMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#000080] hover:text-white rounded-none"
              >
                <BookOpen className="h-4 w-4 text-[#7A1020]" />
                <span>การเตรียมตัวก่อนบริจาค</span>
              </Link>

              <Link
                href="/location"
                onClick={() => setStartMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#000080] hover:text-white rounded-none"
              >
                <MapPin className="h-4 w-4 text-[#7A1020]" />
                <span>สถานที่และการเดินทาง</span>
              </Link>

              <div className="my-1 border-t border-[#808080] border-b border-white" />

              <Link
                href="/staff/login"
                onClick={() => setStartMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#000080] hover:text-white rounded-none text-gray-800"
              >
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <span>ระบบเจ้าหน้าที่ (Staff Portal)</span>
              </Link>

              <div className="my-1 border-t border-[#808080] border-b border-white" />

              <div className="px-3 py-1.5 text-[10px] text-gray-600 flex items-center justify-between">
                <span>Mahidol University (MT)</span>
                <span className="font-mono">v9.5.2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Overlay to close Start Menu */}
      {startMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setStartMenuOpen(false)} 
        />
      )}

      {/* Fixed Bottom Win95 Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-9 bg-[#C0C0C0] border-t-2 border-white flex items-center justify-between px-1 shadow-lg select-none">
        
        {/* Left Side: Start Button & Active Windows */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          
          {/* Win95 Start Button */}
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`win95-btn h-7 px-2.5 gap-1.5 shrink-0 ${startMenuOpen ? 'active' : ''}`}
          >
            <div className="flex items-center gap-0.5">
              <span className="h-2 w-2 bg-red-600 rounded-none inline-block"></span>
              <span className="h-2 w-2 bg-green-600 rounded-none inline-block"></span>
              <span className="h-2 w-2 bg-blue-600 rounded-none inline-block"></span>
              <span className="h-2 w-2 bg-yellow-500 rounded-none inline-block"></span>
            </div>
            <span className="font-extrabold text-xs text-black">เริ่มต้น</span>
          </button>

          <div className="h-5 w-0.5 bg-[#808080] border-r border-white mx-0.5" />

          {/* Active Navigation Task Buttons */}
          <Link
            href="/"
            className={`win95-btn h-7 px-2.5 text-xs truncate max-w-[130px] sm:max-w-[160px] ${
              pathname === '/' ? 'active bg-[#D4D0C8]' : ''
            }`}
          >
            <Monitor className="h-3.5 w-3.5 text-[#7A1020] shrink-0" />
            <span className="truncate">หน้าหลัก</span>
          </Link>

          <Link
            href="/register"
            className={`win95-btn h-7 px-2.5 text-xs truncate max-w-[130px] sm:max-w-[160px] ${
              pathname === '/register' ? 'active bg-[#D4D0C8]' : ''
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-[#7A1020] shrink-0" />
            <span className="truncate">ลงทะเบียน</span>
          </Link>

          <Link
            href="/prepare"
            className={`hidden md:inline-flex win95-btn h-7 px-2.5 text-xs truncate max-w-[150px] ${
              pathname === '/prepare' ? 'active bg-[#D4D0C8]' : ''
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-[#7A1020] shrink-0" />
            <span className="truncate">ข้อปฏิบัติ</span>
          </Link>

          <Link
            href="/location"
            className={`hidden md:inline-flex win95-btn h-7 px-2.5 text-xs truncate max-w-[150px] ${
              pathname === '/location' ? 'active bg-[#D4D0C8]' : ''
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-[#7A1020] shrink-0" />
            <span className="truncate">สถานที่</span>
          </Link>
        </div>

        {/* Right Side: System Tray Clock */}
        <div className="win95-sunken px-2.5 py-0.5 h-7 flex items-center gap-2 text-xs font-mono font-bold text-black shrink-0">
          <Volume2 className="h-3.5 w-3.5 text-gray-700 hidden sm:block" />
          <span>{currentTime || '08:00'}</span>
        </div>

      </div>
    </>
  );
}
