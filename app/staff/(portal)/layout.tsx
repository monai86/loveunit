import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/server';

export default async function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user || user.profile.role !== 'ADMIN') {
    redirect('/staff/login');
  }

  // First login — must set a personal password before using the portal.
  if (user.mustChangePassword) {
    redirect('/staff/change-password');
  }

  return <>{children}</>;
}
