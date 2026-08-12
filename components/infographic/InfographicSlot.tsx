'use client';

import React from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

interface InfographicSlotProps {
  contentKey: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  altText?: string | null;
  aspectRatio?: 'poster' | 'banner' | 'square' | 'video' | 'auto';
  className?: string;
}

export function InfographicSlot({
  title,
  description,
  imageUrl,
  altText,
  aspectRatio = 'poster',
  className = '',
}: InfographicSlotProps) {

  let aspectClass = 'aspect-[3/4]'; // Default poster ratio
  if (aspectRatio === 'banner') aspectClass = 'aspect-[21/9] sm:aspect-[3/1]';
  if (aspectRatio === 'square') aspectClass = 'aspect-square';
  if (aspectRatio === 'video') aspectClass = 'aspect-video';
  if (aspectRatio === 'auto') aspectClass = 'min-h-[220px]';

  return (
    <div className={`group relative w-full overflow-hidden rounded-2xl border border-[#FCE8EC] bg-white shadow-sm transition-all duration-300 hover:shadow-md ${className}`}>
      {imageUrl ? (
        <div className={`relative w-full ${aspectClass} overflow-hidden bg-slate-100`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={altText || title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        /* Polished Placeholder when image artwork is pending from PR/Media team */
        <div className={`relative flex w-full ${aspectClass} flex-col items-center justify-center border-2 border-dashed border-[#B42336]/20 bg-gradient-to-br from-[#FFF9F9] via-[#FCE8EC]/50 to-[#FFF9F9] p-6 text-center`}>
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#7A1020]/10">
            <ImageIcon className="h-7 w-7 text-[#7A1020]" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-[#B42336] animate-pulse" />
          </div>

          <span className="inline-flex items-center rounded-full bg-[#7A1020]/10 px-3 py-1 text-xs font-semibold text-[#7A1020]">
            Infographic coming soon
          </span>

          <h4 className="mt-3 text-base font-bold text-[#29272A]">{title}</h4>

          {description && (
            <p className="mt-1 max-w-sm text-xs text-[#29272A]/70 line-clamp-2">
              {description}
            </p>
          )}

          <p className="mt-4 text-[10px] font-medium tracking-wider text-[#7A1020]/60 uppercase">
            MUMT Media & PR Content Slot
          </p>
        </div>
      )}

      {/* Footer Info if image exists */}
      {imageUrl && (
        <div className="p-4 bg-white border-t border-[#FCE8EC]">
          <h4 className="font-bold text-[#29272A] text-sm">{title}</h4>
          {description && <p className="text-xs text-[#29272A]/70 mt-1">{description}</p>}
        </div>
      )}
    </div>
  );
}
