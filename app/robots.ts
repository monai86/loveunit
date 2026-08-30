import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://loveunit.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/register',
          '/screening',
          '/knowledge',
          '/prepare',
          '/location',
          '/poster',
          '/lookup',
          '/staff/apply',
          '/images/*',
        ],
        disallow: [
          '/api/*',
          '/staff/*',
          '/mt70/*',
          '/registration/*', // Protect donor personal tickets & QR tokens from indexation
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
