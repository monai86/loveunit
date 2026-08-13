import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MUMT Blood Donation 2026 — ระบบสตาฟและผู้บริจาค',
    short_name: 'MUMT 2026',
    description: 'ระบบลงทะเบียน เช็คอิน และจัดการคิวผู้บริจาคโลหิต MUMT Blood Donation 2026 ครั้งที่ 9',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF9F9',
    theme_color: '#7A1020',
    icons: [
      {
        src: '/images/logo.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
