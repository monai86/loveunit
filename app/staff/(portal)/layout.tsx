import { redirect } from 'next/navigation';
import { getAuthenticatedUser, isStaffPortalRole } from '@/lib/auth/server';

export default async function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user || !isStaffPortalRole(user.profile.role)) {
    redirect('/staff/login');
  }

  // First login — must set a personal password before using the portal.
  if (user.mustChangePassword) {
    redirect('/staff/change-password');
  }

  return <>{children}</>;
}
