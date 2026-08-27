import React from 'react';

interface SocialLinksProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function SocialLinks({ className = '', size = 'sm' }: SocialLinksProps) {
  const isSm = size === 'sm';
  const paddingClass = isSm ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-sm';
  const iconSize = isSm ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className={`flex flex-wrap items-center gap-2 font-bold ${className}`}>
      {/* Instagram */}
      <a
        href="https://www.instagram.com/mumt_loveunit/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram: @mumt_loveunit"
        className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 text-pink-700 border border-pink-200 hover:border-pink-400 hover:shadow-xs transition-all active:scale-95 ${paddingClass}`}
      >
        <svg className={`${iconSize} fill-current shrink-0`} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        <span>Instagram</span>
      </a>

      {/* TikTok */}
      <a
        href="https://www.tiktok.com/@mumt_loveunit"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok: @mumt_loveunit"
        className={`inline-flex items-center gap-1.5 rounded-full bg-gray-900 text-white hover:bg-black hover:shadow-xs transition-all active:scale-95 ${paddingClass}`}
      >
        <svg className={`${iconSize} fill-current shrink-0`} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.96-4.47V8.92a8.28 8.28 0 0 0 4.81 1.54v-3.77z" />
        </svg>
        <span>TikTok</span>
      </a>

      {/* Facebook */}
      <a
        href="https://www.facebook.com/profile.php?id=100064643707063&utm_source=ig&utm_medium=social&utm_content=link_in_bio"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook Page: MUMT LoveUnit"
        className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 hover:shadow-xs transition-all active:scale-95 ${paddingClass}`}
      >
        <svg className={`${iconSize} fill-current shrink-0`} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>Facebook Page</span>
      </a>
    </div>
  );
}
