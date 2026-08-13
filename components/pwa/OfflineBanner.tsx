'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CloudUpload, Loader2 } from 'lucide-react';
import { getPendingActionCount, flushOfflineQueue, subscribePendingCount } from '@/lib/pwa/offline-queue';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // Defer the initial state reads so the effect body never synchronously
    // setStates (avoids cascading renders).
    const t = setTimeout(() => {
      setIsOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
      setPending(getPendingActionCount());
    }, 0);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync queued actions as soon as connectivity returns.
      void flushOfflineQueue().then(({ synced, failed }) => {
        if (synced > 0) setNotice(`ซิงค์สำเร็จ ${synced} รายการ`);
        else if (failed > 0) setNotice('ยังมีรายการที่ซิงค์ไม่ได้');
      });
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsub = subscribePendingCount((count) => setPending(count));

    return () => {
      clearTimeout(t);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, []);

  const handleFlush = useCallback(async () => {
    setSyncing(true);
    setNotice(null);
    try {
      const { synced, failed } = await flushOfflineQueue();
      if (synced > 0) setNotice(`ซิงค์สำเร็จ ${synced} รายการ`);
      if (failed > 0 && synced === 0) setNotice('ยังออฟไลน์อยู่ ลองอีกครั้งเมื่อมีสัญญาณ');
    } finally {
      setSyncing(false);
    }
  }, []);

  if (isOnline && pending === 0) return null;

  const offline = !isOnline;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[11px] font-bold border-b ${
        offline ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}
      role="status"
    >
      <div className="flex items-center gap-2">
        {offline ? (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            <span>ออฟไลน์ — การกระทำจะถูกบันทึกไว้ในเครื่องและซิงค์อัตโนมัติเมื่อมีสัญญาณ</span>
          </>
        ) : (
          <>
            <CloudUpload className="h-3.5 w-3.5" />
            <span>กลับมาออนไลน์แล้ว — มี {pending} รายการรอซิงค์</span>
          </>
        )}
        {pending > 0 && (
          <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] border border-current">
            {pending} รายการ
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {notice && <span className="text-[10px] opacity-80">{notice}</span>}
        {pending > 0 && (
          <button
            type="button"
            onClick={handleFlush}
            disabled={syncing}
            className="inline-flex items-center gap-1 rounded-lg bg-current text-white px-2.5 py-1 text-[10px] font-black hover:opacity-90 disabled:opacity-50"
          >
            {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            ซิงค์ตอนนี้
          </button>
        )}
      </div>
    </div>
  );
}
