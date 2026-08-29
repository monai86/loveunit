'use client';

import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth/client';

export function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await authClient.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      // Hard redirect to clear server state and cookies cleanly
      window.location.href = '/staff/login';
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50 p-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 hover:text-red-800 active:scale-95 sm:px-3"
      title="ออกจากระบบ"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
      ) : (
        <LogOut className="h-4 w-4 text-red-600" />
      )}
      <span className="hidden sm:inline">ออกจากระบบ</span>
    </button>
  );
}
