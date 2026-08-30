import React from 'react';

export default function AdminLoading() {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-label="กำลังโหลดข้อมูลแดชบอร์ด..."
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 animate-pulse"
    >
      {/* Top Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded-md" />
          <div className="h-8 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-72 bg-gray-100 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-200 rounded-xl" />
          <div className="h-10 w-28 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-gray-200 rounded-md" />
              <div className="h-8 w-8 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-9 w-20 bg-gray-200 rounded-lg" />
            <div className="h-3 w-36 bg-gray-100 rounded-md" />
          </div>
        ))}
      </div>

      {/* Breakdown and Status Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-2xs space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded-md" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-2xs space-y-4">
          <div className="h-5 w-36 bg-gray-200 rounded-md" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
