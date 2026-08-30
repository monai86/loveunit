'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  UserX,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { StaffListItem } from '@/services/admin-service';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';

interface Props {
  currentUserRole?: string;
  currentUserEmail?: string;
  initialStaffList?: StaffListItem[];
}

interface StaffApplication {
  id: string; referenceCode: string; status: string; email: string; displayName: string; team: string; rejectionReason: string | null;
}

export function StaffRoleManagement({ currentUserRole, currentUserEmail, initialStaffList = [] }: Props) {
  const [staffList, setStaffList] = useState<StaffListItem[]>(initialStaffList);
  const [loading, setLoading] = useState(initialStaffList.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffListItem | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);

  // Deletion modal state
  const [deletingStaff, setDeletingStaff] = useState<StaffListItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteDialogRef = useRef<HTMLElement | null>(null);

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
  const [applications, setApplications] = useState<StaffApplication[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState<Record<string, string>>({});
  const [reviewError, setReviewError] = useState('');

  const closeModal = useCallback(() => {
    if (!submitting) setModalOpen(false);
  }, [submitting]);

  const closeDeleteModal = useCallback(() => {
    if (!deleteSubmitting) {
      setDeletingStaff(null);
      setDeleteError(null);
    }
  }, [deleteSubmitting]);

  useFocusTrap(modalOpen, modalRef, closeModal);
  useFocusTrap(!!deletingStaff, deleteDialogRef, closeDeleteModal);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (data.success && data.staff) {
        setStaffList(data.staff);
      }
      if (data.success && currentUserRole === 'SUPER_ADMIN') {
        const appRes = await fetch('/api/admin/staff-applications');
        const appData = await appRes.json();
        if (appData.success) setApplications(appData.applications || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [currentUserRole]);

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

  useEffect(() => {
    if (currentUserRole !== 'SUPER_ADMIN') return;
    fetch('/api/admin/staff-applications').then((res) => res.json()).then((data) => {
      if (data.success) setApplications(data.applications || []);
    }).catch(() => {});
  }, [currentUserRole]);

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

  const handleOpenDelete = (staff: StaffListItem) => {
    setDeletingStaff(staff);
    setDeleteError(null);
  };

  const confirmDeleteStaff = async () => {
    if (!deletingStaff) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deletingStaff.userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ไม่สามารถลบบัญชีได้');
      await fetchStaff();
      setDeletingStaff(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'ไม่สามารถลบบัญชีได้');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const canDelete = (staff: StaffListItem) => staff.email.toLowerCase() !== currentUserEmail?.toLowerCase();

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
        setFormSuccess('อัปเดตข้อมูล Staff เรียบร้อย');
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
        setFormSuccess('ส่งคำเชิญ Staff เรียบร้อยแล้ว');
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
  const canManage = currentUserRole === 'SUPER_ADMIN';
  const pendingApplications = applications.filter((application) => application.status === 'PENDING');

  const reviewApplication = async (application: StaffApplication, action: 'APPROVE' | 'REJECT') => {
    setReviewError('');
    setReviewingId(application.id);
    const body = action === 'APPROVE'
      ? { action }
      : { action, reason: reviewReason[application.id] || 'ไม่ผ่านเกณฑ์การพิจารณา' };
    try {
      const res = await fetch(`/api/admin/staff-applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setReviewError(data.message || 'ไม่สามารถดำเนินการกับคำขอได้');
        return;
      }
      setApplications((current) =>
        current.map((item) =>
          item.id === application.id
            ? {
                ...item,
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                rejectionReason: action === 'REJECT' ? (reviewReason[application.id] || null) : null,
              }
            : item
        )
      );
      await fetchStaff();
    } catch {
      setReviewError('ไม่สามารถเชื่อมต่อระบบได้');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[var(--ink)] flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--burgundy-700)]" />
            <span>เจ้าหน้าที่ (Staff)</span>
          </h2>
          <p className="text-xs text-[var(--muted)] font-medium mt-0.5">
            ส่งคำเชิญและจัดการบัญชีเจ้าหน้าที่
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStaff}
            disabled={loading}
            className="inline-flex min-h-11 items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[var(--line)] text-xs font-bold text-[var(--ink)] hover:bg-gray-50 transition-all shadow-2xs"
            title="รีเฟรชรายชื่อ"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>

          {canManage && <button
            type="button"
            onClick={handleOpenCreate}
            className="editorial-btn-primary min-h-11 py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-2xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>เชิญ Staff</span>
          </button>}
        </div>
      </div>

      {!canManage && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">
          บัญชีนี้มีสิทธิ์ดูข้อมูลเท่านั้น การเพิ่ม แก้ไข ระงับ หรือลบบัญชีทำได้โดย Super Admin
        </div>
      )}

      {canManage && pendingApplications.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-amber-950 flex items-center gap-2">
                <span>คำขอสมัคร Staff ({pendingApplications.length})</span>
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                ผู้สมัครตั้งรหัสผ่านความปลอดภัยสูงด้วยตนเองแล้ว Super Admin สามารถกดตอบรับเพื่อเปิดใช้งานบัญชีได้ทันที
              </p>
            </div>
          </div>

          {reviewError && (
            <div role="alert" className="rounded-xl bg-red-100 border border-red-200 px-3 py-2 text-xs font-bold text-red-800">
              {reviewError}
            </div>
          )}

          <div className="space-y-2.5">
            {pendingApplications.map((application) => (
              <div key={application.id} className="rounded-xl border border-amber-200 bg-white p-3.5 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0">
                      {application.displayName ? application.displayName.charAt(0) : 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-[var(--ink)]">{application.displayName}</p>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                          {application.referenceCode}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-gray-500 mt-0.5">
                        {application.email} · ฝ่าย: {application.team}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={reviewingId === application.id}
                      onClick={() => void reviewApplication(application, 'APPROVE')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-4 py-2 text-xs font-extrabold text-white transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                    >
                      {reviewingId === application.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>กำลังตอบรับ...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>ตอบรับ / อนุมัติ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Reject Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <input
                    aria-label={`เหตุผลปฏิเสธ ${application.displayName}`}
                    placeholder="เหตุผลการปฏิเสธ (ถ้ามี)..."
                    value={reviewReason[application.id] || ''}
                    onChange={(e) => setReviewReason((v) => ({ ...v, [application.id]: e.target.value }))}
                    className="min-w-0 flex-1 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    disabled={reviewingId === application.id}
                    onClick={() => void reviewApplication(application, 'REJECT')}
                    className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary Pill & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">
            ทั้งหมด <strong className="font-mono text-[var(--ink)]">{staffList.length}</strong> บัญชี
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
            ใช้งานอยู่ <strong className="font-mono">{activeCount}</strong> บัญชี
          </span>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรืออีเมล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[var(--line)] bg-white text-xs font-medium text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)]"
          />
        </div>
      </div>

      {/* Staff / Admin List */}
      <div className="rounded-2xl border border-[var(--line)] bg-white shadow-2xs overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-xs">
            ไม่พบบัญชี Staff ที่ค้นหา
          </div>
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="block md:hidden divide-y divide-gray-100">
              {filteredStaff.map((staff) => (
                <div key={staff.userId} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0">
                        {staff.displayName ? staff.displayName.charAt(0) : 'A'}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[var(--ink)]">{staff.displayName}</div>
                        <div className="text-[11px] font-mono text-gray-500">{staff.email}</div>
                      </div>
                    </div>

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
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-xs">
                    <span className="text-gray-500 text-[11px]">{staff.role === 'SUPER_ADMIN' ? 'Super Admin' : staff.role === 'ADMIN' ? 'Admin (ดูอย่างเดียว)' : 'Staff'} · ฝ่าย: {staff.team || 'Management'}</span>
                    {canManage && <button
                      type="button"
                      onClick={() => handleOpenEdit(staff)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--line)] bg-gray-50 hover:bg-gray-100 text-xs font-bold text-[var(--ink)]"
                    >
                      <Edit2 className="h-3 w-3 text-gray-500" />
                      <span>แก้ไข / รหัสผ่าน</span>
                    </button>}
                    {canManage && canDelete(staff) && <button type="button" onClick={() => handleOpenDelete(staff)} className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700">
                      <Trash2 className="h-3 w-3" /><span>ลบ</span>
                    </button>}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--ink)] min-w-[540px]">
                <thead className="bg-gray-50/80 border-b border-[var(--line)] text-gray-600 font-bold">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Username / Email</th>
                    <th className="px-4 py-3 whitespace-nowrap">บทบาท</th>
                    <th className="px-4 py-3 whitespace-nowrap">ฝ่าย / ทีม</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">สถานะ</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] font-medium">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.userId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center font-bold text-xs uppercase font-mono">
                            {staff.displayName ? staff.displayName.charAt(0) : 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-[var(--ink)]">{staff.displayName}</div>
                            <div className="text-[11px] font-mono text-gray-500">{staff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${staff.role === 'ADMIN' ? 'bg-[var(--rose-100)] text-[var(--burgundy-700)]' : 'bg-gray-100 text-gray-700'}`}>
                          {staff.role === 'SUPER_ADMIN' ? 'Super Admin' : staff.role === 'ADMIN' ? 'Admin (ดูอย่างเดียว)' : 'Staff'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">
                        {staff.team || 'Management'}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
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
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {canManage && <button
                          type="button"
                          onClick={() => handleOpenEdit(staff)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--line)] bg-white hover:bg-gray-50 text-xs font-bold text-[var(--ink)] transition-colors shadow-2xs"
                        >
                          <Edit2 className="h-3 w-3 text-gray-500" />
                          <span>แก้ไข / รหัสผ่าน</span>
                        </button>}
                        {canManage && canDelete(staff) && <button type="button" onClick={() => handleOpenDelete(staff)} className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 transition-colors shadow-2xs">
                          <Trash2 className="h-3 w-3" /><span>ลบ</span>
                        </button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <section ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="staff-dialog-title" tabIndex={-1} className="w-full max-w-md bg-white rounded-2xl border border-[var(--line)] shadow-2xl p-5 sm:p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[var(--rose-100)] text-[var(--burgundy-700)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 id="staff-dialog-title" className="text-sm sm:text-base font-bold text-[var(--ink)]">
                  {editingStaff ? 'แก้ไขข้อมูล Staff' : 'เชิญ Staff ใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="ปิดหน้าต่างเชิญ Staff"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="staff-email" className="block text-xs font-bold text-[var(--ink)]">
                  Email
                </label>
                <input
                  id="staff-email"
                  type="email"
                  required
                  disabled={!!editingStaff}
                  placeholder="name@student.mahidol.ac.th หรือ name@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white text-xs font-medium text-[var(--ink)] disabled:opacity-60 disabled:cursor-not-allowed font-mono"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label htmlFor="staff-display-name" className="block text-xs font-bold text-[var(--ink)]">
                  Username
                </label>
                <input
                  id="staff-display-name"
                  type="text"
                  required
                  placeholder="เช่น somchai_j"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white text-xs font-medium text-[var(--ink)]"
                />
              </div>

              {/* Team / Department */}
              <div className="space-y-1">
                <label htmlFor="staff-team" className="block text-xs font-bold text-[var(--ink)]">
                  ฝ่าย / ทีม
                </label>
                <input
                  id="staff-team"
                  type="text"
                  placeholder="เช่น คณะเทคนิคการแพทย์"
                  value={formTeam}
                  onChange={(e) => setFormTeam(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white text-xs font-medium text-[var(--ink)]"
                />
              </div>

              {/* Passwords are set by the recipient through the invitation link. */}
              <div className="hidden space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[var(--ink)]">
                    {editingStaff ? 'เปลี่ยนรหัสผ่าน' : 'รหัสผ่าน'}
                  </label>
                  {editingStaff && (
                    <span className="text-[10px] text-gray-400">เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={false}
                    placeholder={editingStaff ? 'พิมพ์รหัสผ่านใหม่...' : 'อย่างน้อย 6 ตัวอักษร'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-[var(--line)] bg-gray-50 focus:bg-white text-xs font-medium text-[var(--ink)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Active Toggle (Edit mode) */}
              {editingStaff && (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ink)]">เปิดใช้งานบัญชี</span>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    aria-pressed={formIsActive}
                    aria-label="เปิดใช้งานบัญชี"
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      formIsActive ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        formIsActive ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-11 px-3 py-2 rounded-xl border border-[var(--line)] bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="editorial-btn-primary py-2 px-4 text-xs font-bold"
                >
                  {submitting ? 'กำลังบันทึก...' : (editingStaff ? 'บันทึก' : 'ส่งคำเชิญ')}
                </button>
              </div>

            </form>

          </section>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {deletingStaff && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px] animate-in fade-in duration-150"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeDeleteModal(); }}
          onKeyDown={(event) => { if (event.key === 'Escape') closeDeleteModal(); }}
        >
          <section
            ref={deleteDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-staff-title"
            aria-describedby="delete-staff-description"
            tabIndex={-1}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="border-b border-red-100 bg-red-50 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 shadow-2xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-red-700">การดำเนินการถาวร</p>
                  <h2 id="delete-staff-title" className="mt-0.5 text-base font-black text-[var(--ink)]">ยืนยันการลบบัญชี Staff</h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <p id="delete-staff-description" className="text-xs leading-relaxed text-gray-600">
                คุณกำลังจะลบบัญชีของ <strong className="text-[var(--ink)]">{deletingStaff.displayName}</strong> ออกจากระบบผู้ดูแล
              </p>

              {/* Staff Info Card */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3.5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[var(--rose-100)] text-[var(--burgundy-700)] flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0">
                  {deletingStaff.displayName ? deletingStaff.displayName.charAt(0) : 'S'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[var(--ink)] truncate">{deletingStaff.displayName}</div>
                  <div className="text-[11px] font-mono text-gray-500 truncate">{deletingStaff.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                      ฝ่าย: {deletingStaff.team || 'Management'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                      {deletingStaff.role === 'SUPER_ADMIN' ? 'Super Admin' : deletingStaff.role === 'ADMIN' ? 'Admin' : 'Staff'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="rounded-xl bg-red-50/80 border border-red-200/70 p-3 text-[11px] font-medium text-red-800 leading-relaxed">
                ⚠️ บัญชีนี้จะไม่สามารถเข้าสู่ระบบหรือปฏิบัติหน้าที่ในระบบได้อีก และการดำเนินการนี้ไม่สามารถยกเลิกได้
              </div>

              {/* Error Message */}
              {deleteError && (
                <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse gap-2 border-t border-[var(--line)] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteSubmitting}
                  className="min-h-11 px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  id="confirm-delete-staff-btn"
                  type="button"
                  onClick={() => void confirmDeleteStaff()}
                  disabled={deleteSubmitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 px-5 text-xs font-extrabold text-white shadow-md shadow-red-900/20 active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {deleteSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>กำลังลบบัญชี...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>ลบบัญชีถาวร</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
