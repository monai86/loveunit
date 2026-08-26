'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Shield, 
  Check, 
  X, 
  Edit2, 
  Search, 
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  UserX
} from 'lucide-react';
import { StaffListItem } from '@/services/admin-service';

interface Props {
  currentUserRole?: string;
  initialStaffList?: StaffListItem[];
}

export function StaffRoleManagement({ initialStaffList = [] }: Props) {
  const [staffList, setStaffList] = useState<StaffListItem[]>(initialStaffList);
  const [loading, setLoading] = useState(initialStaffList.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffListItem | null>(null);

  // Form State
  const [formEmail, setFormEmail] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formTeam, setFormTeam] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (data.success && data.staff) {
        setStaffList(data.staff);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (initialStaffList.length === 0) {
      fetch('/api/admin/staff')
        .then((res) => res.json())
        .then((data) => {
          if (!ignore && data.success && data.staff) {
            setStaffList(data.staff);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [initialStaffList.length]);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormEmail('');
    setFormDisplayName('');
    setFormPassword('');
    setFormTeam('Management');
    setFormIsActive(true);
    setShowPassword(false);
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffListItem) => {
    setEditingStaff(staff);
    setFormEmail(staff.email);
    setFormDisplayName(staff.displayName);
    setFormPassword('');
    setFormTeam(staff.team || 'Management');
    setFormIsActive(staff.isActive);
    setShowPassword(false);
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      if (editingStaff) {
        // Edit Mode (PATCH)
        const res = await fetch('/api/admin/staff', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingStaff.userId,
            displayName: formDisplayName,
            team: formTeam,
            isActive: formIsActive,
            password: formPassword || undefined,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || data.error);
        setFormSuccess(formPassword ? 'อัปเดตข้อมูลและเปลี่ยนรหัสผ่านเรียบร้อย' : 'อัปเดตข้อมูลผู้ดูแลระบบเรียบร้อย');
      } else {
        // Create Mode (POST)
        const res = await fetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formEmail,
            displayName: formDisplayName,
            password: formPassword,
            team: formTeam,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || data.error);
        setFormSuccess('เพิ่มผู้ดูแลระบบ (Admin) สำเร็จ');
      }

      await fetchStaff();
      setTimeout(() => {
        setModalOpen(false);
      }, 1000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.displayName.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      (s.team && s.team.toLowerCase().includes(query))
    );
  });

  const activeCount = staffList.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--burgundy-600)]" />
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
              การจัดการผู้ดูแลระบบ (Admin Accounts)
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] font-medium">
            จัดการบัญชีผู้ดูแลระบบ (Admin) เพิ่มผู้ดูแลใหม่ และแก้ไข/รีเซ็ตรหัสผ่านได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStaff}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:bg-gray-50 transition-all shadow-2xs"
            title="รีเฟรชรายชื่อ"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="editorial-btn-primary py-2.5 px-5 text-xs flex items-center gap-2 shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>เพิ่มผู้ดูแลระบบ (Admin)</span>
          </button>
        </div>
      </div>

      {/* Admin Summary Card */}
      <div className="p-4 rounded-2xl bg-white border border-[var(--line)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--ink)]">บทบาทผู้ดูแลระบบ (Single Admin Role)</h3>
            <p className="text-xs text-[var(--muted)]">ผู้ดูแลระบบทุกคนมีสิทธิ์เข้าถึงทุกฟังก์ชัน ทั้งแดชบอร์ด, จุดสแกน QR, จัดการคิว และจัดการข้อมูล</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
            ทั้งหมด <strong className="font-mono text-[var(--ink)]">{staffList.length}</strong> บัญชี
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            เปิดใช้งาน <strong className="font-mono">{activeCount}</strong> บัญชี
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล หรือฝ่าย..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--line)] bg-white text-xs font-bold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)]"
          />
        </div>
      </div>

      {/* Staff / Admin Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--ink)]">
            <thead className="bg-gray-50/80 border-b border-[var(--line)] text-gray-600 font-bold">
              <tr>
                <th className="px-4 py-3 sm:px-6">ชื่อ-นามสกุล / อีเมล</th>
                <th className="px-4 py-3">บทบาท</th>
                <th className="px-4 py-3">ฝ่าย / ทีม</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
                <th className="px-4 py-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-medium">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    ไม่พบบัญชีผู้ดูแลระบบที่ตรงกับการค้นหา
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.userId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center font-bold text-xs uppercase font-mono">
                          {staff.displayName ? staff.displayName.charAt(0) : 'A'}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--ink)] text-xs sm:text-sm">{staff.displayName}</div>
                          <div className="text-[11px] font-mono text-[var(--muted)]">{staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[var(--rose-100)] text-[var(--burgundy-700)] border border-[var(--burgundy-300)]/40">
                        <Shield className="h-3 w-3" />
                        <span>ADMIN</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 font-bold">
                      {staff.team || 'Management'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {staff.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <UserCheck className="h-3 w-3" />
                          <span>ใช้งาน</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <UserX className="h-3 w-3" />
                          <span>ระงับ</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(staff)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-white hover:bg-gray-100 text-xs font-bold text-[var(--ink)] transition-colors shadow-2xs"
                      >
                        <Edit2 className="h-3 w-3 text-gray-500" />
                        <span>แก้ไข / รหัสผ่าน</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[var(--line)] shadow-2xl p-6 sm:p-7 space-y-5">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-[var(--rose-100)] text-[var(--burgundy-700)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base font-black text-[var(--ink)]">
                  {editingStaff ? 'แก้ไขข้อมูล / ตั้งรหัสผ่าน Admin' : 'เพิ่มผู้ดูแลระบบใหม่ (Add Admin)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--ink)]">
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingStaff}
                  placeholder="admin@mahidol.ac.th"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white text-xs font-bold text-[var(--ink)] disabled:opacity-60 disabled:cursor-not-allowed font-mono"
                />
              </div>

              {/* Display Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--ink)]">
                  ชื่อ-นามสกุล (Display Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อ.ดร. สมชาย ใจดี"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white text-xs font-bold text-[var(--ink)]"
                />
              </div>

              {/* Team / Department */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[var(--ink)]">
                  แผนก / ฝ่าย (Department / Team)
                </label>
                <input
                  type="text"
                  placeholder="เช่น คณะเทคนิคการแพทย์ / Management"
                  value={formTeam}
                  onChange={(e) => setFormTeam(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white text-xs font-bold text-[var(--ink)]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[var(--ink)]">
                    {editingStaff ? 'ตั้งรหัสผ่านใหม่ (Reset Password)' : 'รหัสผ่าน (Password)'}
                  </label>
                  {editingStaff && (
                    <span className="text-[10px] text-gray-400">เว้นว่างไว้หากไม่ต้องการเปลี่ยน</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingStaff}
                    placeholder={editingStaff ? 'พิมพ์เพื่อเปลี่ยนรหัสผ่านใหม่...' : 'อย่างน้อย 6 ตัวอักษร'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white text-xs font-bold text-[var(--ink)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Active Toggle (Edit mode) */}
              {editingStaff && (
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ink)]">สถานะการใช้งานบัญชี</span>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formIsActive ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formIsActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--line)] bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="editorial-btn-primary py-2.5 px-5 text-xs font-black"
                >
                  {submitting ? 'กำลังบันทึก...' : (editingStaff ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มผู้ดูแลระบบ')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
