import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  // No session → staff login page.
  if (!user) {
    redirect('/staff/login');
  }

  // Logged in but not admin-level → staff checkin.
  if (user.profile.role !== 'ADMIN' && user.profile.role !== 'SUPER_ADMIN') {
    redirect('/staff/checkin');
  }

  // First login — must set a personal password before accessing admin.
  if (user.mustChangePassword) {
    redirect('/staff/change-password');
  }

  return <>{children}</>;
}
