'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Crown, 
  Shield, 
  Users, 
  Smartphone, 
  Check, 
  X, 
  Edit2, 
  Search, 
  Sparkles, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { StaffRole } from '@/lib/types/database';
import { StaffListItem } from '@/services/admin-service';

const ROLE_DEFINITIONS: Record<StaffRole, {
  label: string;
  badgeClass: string;
  icon: React.ElementType;
  description: string;
  permissions: string[];
}> = {
  SUPER_ADMIN: {
    label: 'Super Admin (ผู้ดูแลระบบสูงสุด)',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    icon: Crown,
    description: 'เข้าถึงทุกฟังก์ชันในระบบ มอบหมายสิทธิ์ Super Admin และจัดการฐานข้อมูลขั้นสูง',
    permissions: ['ดูและจัดการทุกอย่าง', 'มอบหมายสิทธิ์ Super Admin', 'ลบ/ระงับบัญชี', 'เข้าถึง Audit Log ทุกประเภท'],
  },
  ADMIN: {
    label: 'Admin (ผู้ดูแลระบบกลาง)',
    badgeClass: 'bg-[var(--rose-100)] text-[var(--burgundy-700)] border-[var(--burgundy-300)]',
    icon: Shield,
    description: 'บริหารจัดการภาพรวม งานบริจาคโลหิต จัดการผู้ลงทะเบียน สื่อประชาสัมพันธ์ และเจ้าหน้าที่',
    permissions: ['Dashboard & KPIs', 'จัดการผู้ลงทะเบียนทั้งหมด', 'จัดการคิวสำรอง (Waitlist)', 'จัดการเนื้อหา & โปสเตอร์', 'เพิ่ม/แก้ไขสิทธิ์เจ้าหน้าที่', 'Export รายงาน Excel'],
  },
  TEAM_LEAD: {
    label: 'Team Lead (หัวหน้าทีมปฏิบัติการ)',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: Users,
    description: 'ดูแลการไหลเวียนคิวหน้างาน ตรวจสอบจุดเช็คอิน แก้ไขสถานะ และรับลงทะเบียน Walk-in',
    permissions: ['เข้าถึงระบบ Check-in Staff', 'ลงทะเบียน Walk-in หน้างาน', 'จัดการคิวสถานี (Station Queue)', 'ยกเลิก/เลื่อนคิวผู้บริจาค'],
  },
  STAFF: {
    label: 'Staff (เจ้าหน้าที่ประจำจุด)',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    icon: Smartphone,
    description: 'เจ้าหน้าที่สแกน QR Code ตรวจสอบข้อมูลผู้บริจาค และเปลี่ยนสถานะเช็คอิน',
    permissions: ['สแกน QR Code เช็คอิน', 'ค้นหาผู้บริจาคด้วยเบอร์โทร/รหัส', 'บันทึกสถานะกำลังบริจาค/เสร็จสิ้น'],
  },
};

interface Props {
  currentUserRole?: StaffRole;
  initialStaffList?: StaffListItem[];
}

export function StaffRoleManagement({ currentUserRole = 'ADMIN', initialStaffList = [] }: Props) {
  const [staffList, setStaffList] = useState<StaffListItem[]>(initialStaffList);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffListItem | null>(null);

  // Form State
  const [formEmail, setFormEmail] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<StaffRole>('STAFF');
  const [formTeam, setFormTeam] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
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
  };

  useEffect(() => {
    if (initialStaffList.length === 0) {
      fetchStaff();
    }
  }, []);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormEmail('');
    setFormDisplayName('');
    setFormPassword('');
    setFormRole('STAFF');
    setFormTeam('จุดเช็คอิน ห้อง 217');
    setFormError('');
    setFormSuccess('');
    setModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffListItem) => {
    setEditingStaff(staff);
    setFormEmail(staff.email);
    setFormDisplayName(staff.displayName);
    setFormPassword('');
    setFormRole(staff.role);
    setFormTeam(staff.team || '');
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
            role: formRole,
            team: formTeam,
            isActive: true,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || data.error);
        setFormSuccess('อัปเดตบทบาทเจ้าหน้าที่เรียบร้อย');
      } else {
        // Create Mode (POST)
        const res = await fetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formEmail,
            displayName: formDisplayName,
            password: formPassword,
            role: formRole,
            team: formTeam,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || data.error);
        setFormSuccess('เพิ่มเจ้าหน้าที่และมอบหมายบทบาทสำเร็จ');
      }

      await fetchStaff();
      setTimeout(() => {
        setModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch = 
      s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.team && s.team.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--burgundy-600)]" />
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)]">
              การจัดการเจ้าหน้าที่และบทบาท (Staff & RBAC Roles)
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] font-medium">
            กำหนดสิทธิ์การเข้าถึงระบบตามสายงาน ตั้งแต่ Super Admin, Admin, Team Lead ไปจนถึง Staff จุดสแกน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStaff}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:bg-gray-50 transition-all"
            title="รีเฟรชรายชื่อ"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="editorial-btn-primary py-2.5 px-5 text-xs flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>เพิ่มเจ้าหน้าที่ / มอบหมาย Role</span>
          </button>
        </div>
      </div>

      {/* 4 Role Hierarchy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(ROLE_DEFINITIONS) as StaffRole[]).map((roleKey) => {
          const def = ROLE_DEFINITIONS[roleKey];
          const Icon = def.icon;
          const count = staffList.filter((s) => s.role === roleKey).length;

          return (
            <div key={roleKey} className="p-4 rounded-2xl bg-white border border-[var(--line)] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${def.badgeClass}`}>
                    {roleKey}
                  </span>
                  <span className="text-xs font-mono font-black text-[var(--muted)]">
                    {count} บัญชี
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[var(--ink)]" />
                  <h3 className="text-xs font-black text-[var(--ink)]">{def.label.split(' (')[0]}</h3>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">{def.description}</p>
              </div>

              <div className="border-t border-gray-100 pt-2 space-y-1 text-[10px] text-gray-500 font-medium">
                {def.permissions.slice(0, 3).map((p, idx) => (
                  <p key={idx} className="flex items-center gap-1.5 truncate">
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Table Card */}
      <div className="editorial-card p-6 space-y-6">
        
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล หรือทีม/สถานี..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[var(--line)] bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--burgundy-600)]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-[var(--muted)] whitespace-nowrap">กรองตาม Role:</span>
            {['ALL', 'SUPER_ADMIN', 'ADMIN', 'TEAM_LEAD', 'STAFF'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  roleFilter === r
                    ? 'bg-[var(--burgundy-700)] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {r === 'ALL' ? 'ทั้งหมด' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[var(--line)] rounded-xl overflow-hidden">
            <thead className="bg-[var(--rose-100)] text-[var(--burgundy-700)] font-black text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5 border-b border-[var(--line)]">เจ้าหน้าที่ / ชื่อ-สกุล</th>
                <th className="p-3.5 border-b border-[var(--line)]">อีเมลเข้าสู่ระบบ</th>
                <th className="p-3.5 border-b border-[var(--line)]">บทบาท (Role)</th>
                <th className="p-3.5 border-b border-[var(--line)]">ทีม / สถานีปฏิบัติการ</th>
                <th className="p-3.5 border-b border-[var(--line)]">สถานะ</th>
                <th className="p-3.5 border-b border-[var(--line)] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-medium text-[var(--ink)]">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                    ไม่พบข้อมูลเจ้าหน้าที่ตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => {
                  const roleDef = ROLE_DEFINITIONS[s.role] || ROLE_DEFINITIONS.STAFF;
                  return (
                    <tr key={s.userId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-bold">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] font-black text-xs flex items-center justify-center font-mono">
                            {s.displayName.charAt(0)}
                          </div>
                          <span>{s.displayName}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-gray-600">{s.email}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${roleDef.badgeClass}`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-600 font-medium">
                        {s.team || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="p-3.5">
                        {s.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            <span>พร้อมใช้งาน</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                            <span>ปิดใช้งาน</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--burgundy-700)] hover:underline"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>แก้ไข Role</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: ADD / EDIT STAFF */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[var(--line)] space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--burgundy-700)]" />
                <h3 className="text-base font-black text-[var(--ink)]">
                  {editingStaff ? 'แก้ไขบทบาทและข้อมูลเจ้าหน้าที่' : 'เพิ่มเจ้าหน้าที่ใหม่และมอบหมายสิทธิ์ (RBAC)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-[var(--ink)] block">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายเทคนิค การแพทย์"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--burgundy-600)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--ink)] block">อีเมลเข้าสู่ระบบ (Email) *</label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingStaff)}
                  placeholder="name@mahidol.ac.th"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--burgundy-600)] disabled:opacity-60 font-mono"
                />
              </div>

              {!editingStaff && (
                <div className="space-y-1">
                  <label className="font-bold text-[var(--ink)] block">รหัสผ่านเริ่มต้น (อย่างน้อย 8 ตัวอักษร) *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--burgundy-600)] font-mono"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-[var(--ink)] block">บทบาทในระบบ (Role) *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as StaffRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--burgundy-600)] font-bold text-[var(--ink)]"
                >
                  <option value="STAFF">STAFF (เจ้าหน้าที่จุดสแกน QR Code & เช็คอิน)</option>
                  <option value="TEAM_LEAD">TEAM_LEAD (หัวหน้าทีมปฏิบัติการ / Walk-in / จัดการคิว)</option>
                  <option value="ADMIN">ADMIN (ผู้ดูแลระบบกลาง / จัดการข้อมูลและสิทธิ์)</option>
                  {currentUserRole === 'SUPER_ADMIN' && (
                    <option value="SUPER_ADMIN">SUPER_ADMIN (ผู้ดูแลระบบสูงสุด)</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--ink)] block">ทีม / สถานีปฏิบัติการ</label>
                <input
                  type="text"
                  placeholder="เช่น จุดเช็คอิน QR Code (ห้อง 217), จุดเจาะเก็บโลหิต, ฝ่ายประสานงาน"
                  value={formTeam}
                  onChange={(e) => setFormTeam(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--burgundy-600)]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="editorial-btn-secondary py-2.5 px-4 text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="editorial-btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
                >
                  {submitting ? 'กำลังบันทึก...' : editingStaff ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันเพิ่มเจ้าหน้าที่'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
