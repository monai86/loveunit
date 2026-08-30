'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Image as ImageIcon, Save, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { EventContentBlock } from '@/lib/types/database';

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<EventContentBlock[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then((res) => res.json()).then((data) => {
      setCanManage(data?.user?.profile?.role === 'SUPER_ADMIN');
    }).catch(() => setCanManage(false));
    async function loadContent() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const data = await res.json();
          if (data.contentBlocks) {
            setBlocks(data.contentBlocks);
          }
        }
      } catch (_err) {
        console.error('Failed to fetch content blocks:', _err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleUpdateBlock = (key: string, field: string, value: string | boolean | number | null) => {
    setBlocks(prev => prev.map(b => b.content_key === key ? { ...b, [field]: value } : b));
  };

  const handleSaveBlock = async (block: EventContentBlock) => {
    setSavingKey(block.content_key);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: block.id,
          title: block.title,
          description: block.description,
          imageUrl: block.image_url,
          altText: block.alt_text,
          isVisible: block.is_visible,
          displayOrder: block.display_order,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`บันทึกข้อมูลสื่อ "${block.title}" เรียบร้อยแล้ว`);
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setErrorMsg(data.message || 'บันทึกข้อมูลไม่สำเร็จ');
      }
    } catch (_err) {
      console.error(_err);
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      
      <div className="border-b border-[var(--line)] pb-4">
        <Link href="/mt70" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--burgundy-700)] hover:underline mb-1">
          <ArrowLeft className="h-3.5 w-3.5" /> <span>กลับหน้าแดชบอร์ด</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] font-display">
          จัดการสื่อ & โปสเตอร์ประชาสัมพันธ์
        </h1>
      <p className="mt-0.5 text-xs text-[var(--muted)] font-medium">
          MUMT LoveUnit ครั้งที่ 9
        </p>
        {!canManage && <p className="mt-2 text-sm font-medium text-blue-800">บัญชีนี้ดูข้อมูลได้อย่างเดียว การแก้ไขสื่อทำได้โดย Super Admin</p>}
      </div>

      {successMsg && (
        <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-900 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-xs text-gray-500 gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--burgundy-700)]" />
          กำลังโหลดรายการสื่อประชาสัมพันธ์...
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {blocks.map((block) => (
            <div key={block.id} className="rounded-3xl border border-[var(--rose-100)] bg-white p-6 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[var(--burgundy-500)] uppercase">Key: {block.content_key}</span>
                  <h2 className="text-base font-extrabold text-[var(--ink)]">{block.title}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor={`cb-vis-${block.content_key}`} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      id={`cb-vis-${block.content_key}`}
                      type="checkbox"
                      checked={block.is_visible}
                      onChange={(e) => handleUpdateBlock(block.content_key, 'is_visible', e.target.checked)}
                      disabled={!canManage}
                      className="rounded border-gray-300 text-[var(--burgundy-700)] focus:ring-[var(--burgundy-700)]"
                    />
                    แสดงผลสาธารณะ
                  </label>

                  <button
                    type="button"
                    onClick={() => handleSaveBlock(block)}
                    disabled={!canManage || savingKey === block.content_key}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--burgundy-700)] px-4 py-3.5 text-xs font-bold text-white shadow hover:bg-[var(--burgundy-900)] disabled:opacity-50"
                  >
                    {savingKey === block.content_key ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        บันทึกการเปลี่ยนแปลง
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-8 space-y-3">
                  <div>
                    <label htmlFor={`cb-title-${block.content_key}`} className="block text-xs font-bold text-gray-700 mb-1">หัวข้อสื่อ (Title)</label>
                    <input
                      id={`cb-title-${block.content_key}`}
                      type="text"
                      value={block.title}
                      onChange={(e) => handleUpdateBlock(block.content_key, 'title', e.target.value)}
                      disabled={!canManage}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)]"
                    />
                  </div>

                  <div>
                    <label htmlFor={`cb-desc-${block.content_key}`} className="block text-xs font-bold text-gray-700 mb-1">คำอธิบายเพิ่มเติม (Description)</label>
                    <textarea
                      id={`cb-desc-${block.content_key}`}
                      rows={2}
                      value={block.description || ''}
                      onChange={(e) => handleUpdateBlock(block.content_key, 'description', e.target.value)}
                      disabled={!canManage}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)]"
                    />
                  </div>

                  <div>
                    <label htmlFor={`cb-img-${block.content_key}`} className="block text-xs font-bold text-gray-700 mb-1">URL รูปภาพ (Image URL / Storage Public URL)</label>
                    <input
                      id={`cb-img-${block.content_key}`}
                      type="text"
                      placeholder="https://example.com/images/poster.png หรือ /images/poster.png"
                      value={block.image_url || ''}
                      onChange={(e) => handleUpdateBlock(block.content_key, 'image_url', e.target.value)}
                      disabled={!canManage}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--burgundy-600)]/20 focus:border-[var(--burgundy-600)]"
                    />
                  </div>
                </div>

                <div className="md:col-span-4">
                  <span className="block text-[11px] font-bold text-gray-700 mb-1">ตัวอย่างภาพพรีวิว (Preview)</span>
                  <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4 aspect-video flex flex-col items-center justify-center text-center overflow-hidden relative">
                    {block.image_url ? (
                      <Image src={block.image_url} alt={block.alt_text || block.title} width={300} height={200} unoptimized className="max-h-full max-w-full object-contain rounded-lg" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-1" />
                        <span className="text-[11px] font-bold text-gray-600">Placeholder UI Active</span>
                        <span className="text-[11px] text-gray-400 mt-0.5">ยังไม่ได้อัปโหลดไฟล์ภาพจริง</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
