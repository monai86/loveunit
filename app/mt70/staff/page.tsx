import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { getAuthenticatedUser } from '@/lib/auth/server';
import { getAllStaffMembers } from '@/services/admin-service';
import { StaffRoleManagement } from '@/components/admin/StaffRoleManagement';

export const dynamic = 'force-dynamic';

export default async function AdminStaffPage() {
  const user = await getAuthenticatedUser();
  const staffMembers = await getAllStaffMembers();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex flex-col gap-3 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--burgundy-700)]">
            <Shield className="h-4 w-4" />
            <span>การเข้าถึงระบบ</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-[var(--ink)] font-display">จัดการ Staff</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">เชิญ แก้ไข ระงับ หรือดูแลบัญชีเจ้าหน้าที่หน้างาน</p>
        </div>
        <Link href="/mt70" className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-[var(--line)] bg-white px-3.5 text-xs font-bold text-[var(--ink)] hover:bg-gray-50 cursor-pointer sm:self-auto">
          <ArrowLeft className="h-4 w-4" /> กลับ Dashboard
        </Link>
      </header>

      <StaffRoleManagement currentUserRole={user?.profile.role} currentUserEmail={user?.email} initialStaffList={staffMembers} />
    </div>
  );
}
