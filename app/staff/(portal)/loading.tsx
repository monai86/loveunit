import React from 'react';

export default function StaffPortalLoading() {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-label="กำลังโหลดข้อมูล..."
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6 animate-pulse"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-64 bg-gray-100 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-2">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-7 w-14 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-3">
        <div className="h-5 w-36 bg-gray-200 rounded" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
