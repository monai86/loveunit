import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/server';

export default async function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/staff/login');
  }

  const allowed: string[] = ['STAFF', 'TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN'];
  if (!allowed.includes(user.profile.role)) {
    redirect('/staff/login');
  }

  // First login — must set a personal password before using the portal.
  if (user.mustChangePassword) {
    redirect('/staff/change-password');
  }

  return <>{children}</>;
}
