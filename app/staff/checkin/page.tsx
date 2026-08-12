'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Phone, 
  User, 
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Registration } from '@/lib/types/database';
import { formatTimeRange, getParticipantTypeLabel, getRegistrationStatusBadge } from '@/lib/utils/format';

export default function StaffCheckinPage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'search'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Registration[]>([]);

  // Active Donor Selected for Checkin
  const [selectedDonor, setSelectedDonor] = useState<Registration | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual search trigger
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setAlertMsg(null);
      const res = await fetch(`/api/staff/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchResults(data.registrations || []);
        if (data.registrations.length === 0) {
          setAlertMsg({ type: 'error', text: `ไม่พบข้อมูลผู้บริจาคจากคำค้น "${searchQuery}"` });
        }
      }
    } catch (err) {
      console.error(err);
      setAlertMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล' });
    } finally {
      setSearching(false);
    }
  };

  // Perform Check In Action
  const handlePerformCheckin = async (donor: Registration) => {
    try {
      setCheckinLoading(true);
      setAlertMsg(null);

      const res = await fetch('/api/staff/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: donor.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAlertMsg({ type: 'success', text: `เช็คอินสำเร็จ: คุณ${data.registration.first_name} ${data.registration.last_name}` });
        setSelectedDonor(data.registration);
        
        // Update item in search results if list view active
        setSearchResults(prev => prev.map(item => item.id === donor.id ? data.registration : item));
      } else {
        setAlertMsg({ type: 'error', text: data.message || 'ไม่สามารถเช็คอินได้' });
      }
    } catch (err) {
      console.error(err);
      setAlertMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการทำรายการเช็คอิน' });
    } finally {
      setCheckinLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      
      {/* Header & Quick Nav */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#FCE8EC] pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7A1020] px-3 py-1 text-xs font-bold text-white">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Staff Operation Check-in
          </span>
          <h1 className="mt-2 text-2xl font-black text-[#29272A] sm:text-3xl">
            จุดเช็คอินบริจาคโลหิต MUMT 2026
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/staff/walk-in"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7A1020] to-[#B42336] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105"
          >
            <UserPlus className="h-4 w-4" />
            ลงทะเบียน Walk-in (30 วินาที)
          </Link>

          <Link
            href="/admin"
            className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div className={`mt-6 flex items-center justify-between rounded-2xl border p-4 text-xs font-bold ${
          alertMsg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {alertMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="mt-6 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
            activeTab === 'search' ? 'border-[#7A1020] text-[#7A1020]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="h-4 w-4" />
          ค้นหาด้วยรหัส / ชื่อ / เบอร์โทร
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
            activeTab === 'qr' ? 'border-[#7A1020] text-[#7A1020]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <QrCode className="h-4 w-4" />
          สแกนกล้อง QR Code
        </button>
      </div>

      {/* TAB 1: MANUAL SEARCH MODE */}
      {activeTab === 'search' && (
        <div className="mt-6 space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="กรอกรหัสลงทะเบียน (เช่น MBD26-XXXXXX), ชื่อ-นามสกุล หรือเบอร์โทร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 pl-10 pr-4 py-3 text-sm text-[#29272A] focus:outline-none focus:ring-2 focus:ring-[#7A1020]"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="flex items-center gap-2 rounded-2xl bg-[#7A1020] px-6 py-3 text-xs font-bold text-white shadow hover:bg-[#8F1327] disabled:opacity-50"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ค้นหาข้อมูล'}
            </button>
          </form>

          {/* Quick Demo Pre-filled Chips */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>ตัวอย่างคำค้นหา:</span>
            <button
              type="button"
              onClick={() => { setSearchQuery('MBD26-DEMO01'); handleSearch(); }}
              className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-bold text-[#7A1020] hover:bg-gray-200"
            >
              MBD26-DEMO01
            </button>
            <button
              type="button"
              onClick={() => { setSearchQuery('สมชาย'); handleSearch(); }}
              className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-bold text-[#7A1020] hover:bg-gray-200"
            >
              สมชาย
            </button>
          </div>

          {/* Search Results List */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                ผลการค้นพบ ({searchResults.length} รายการ)
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {searchResults.map((donor) => {
                  const badge = getRegistrationStatusBadge(donor.status);
                  const isCheckedIn = donor.status === 'CHECKED_IN' || donor.status === 'IN_PROCESS' || donor.status === 'COMPLETED';

                  return (
                    <div
                      key={donor.id}
                      className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#7A1020] text-sm">
                            {donor.registration_code}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.colorClass}`}>
                            {badge.label}
                          </span>
                        </div>

                        <h4 className="mt-1 font-bold text-[#29272A] text-base">
                          {donor.first_name} {donor.last_name}
                        </h4>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-gray-400" /> {donor.phone}
                          </span>
                          <span>•</span>
                          <span>{getParticipantTypeLabel(donor.participant_type)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#B42336] font-semibold">
                            <Clock className="h-3.5 w-3.5" />
                            {donor.time_slot ? formatTimeRange(donor.time_slot.start_at, donor.time_slot.end_at) : 'ไม่ระบุช่วงเวลา'}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="h-4 w-4" /> เช็คอินแล้ว
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={checkinLoading}
                            onClick={() => handlePerformCheckin(donor)}
                            className="flex items-center gap-1.5 rounded-xl bg-[#7A1020] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#8F1327] disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            กดเช็คอิน (Check In)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEBCAM QR SCANNER SIMULATION */}
      {activeTab === 'qr' && (
        <div className="mt-6 rounded-3xl border border-[#FCE8EC] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto max-w-sm">
            <div className="relative mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-3xl border-4 border-dashed border-[#7A1020] bg-[#FFF9F9]">
              <QrCode className="h-16 w-16 text-[#7A1020] animate-pulse" />
              <span className="mt-2 text-xs font-bold text-[#7A1020]">กล้องสแกน QR Code</span>
            </div>

            <p className="mt-4 text-xs text-gray-600">
              จ่อ QR Code บนมือถือของผู้บริจาคตรงหน้ากล้องเพื่อเช็คอินอัตโนมัติ
            </p>

            {/* Simulated Scan Input for Testing */}
            <div className="mt-6 rounded-2xl bg-[#FFF9F9] p-4 border border-[#FCE8EC]">
              <label className="block text-xs font-bold text-[#29272A] mb-1">
                ทดลองสแกนด้วยรหัส QR Token:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="MBD26_QR_MBD26-DEMO01_test123"
                  id="qrInputSim"
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-xs text-[#29272A]"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const val = (document.getElementById('qrInputSim') as HTMLInputElement)?.value;
                    if (!val) return;
                    setCheckinLoading(true);
                    const res = await fetch('/api/staff/checkin', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ qrToken: val }),
                    }).then(r => r.json());

                    if (res.success) {
                      setAlertMsg({ type: 'success', text: `เช็คอินจาก QR สำเร็จ: คุณ${res.registration.first_name} ${res.registration.last_name}` });
                    } else {
                      setAlertMsg({ type: 'error', text: res.message });
                    }
                    setCheckinLoading(false);
                  }}
                  className="rounded-xl bg-[#7A1020] px-4 py-2 text-xs font-bold text-white"
                >
                  จำลองสแกน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
