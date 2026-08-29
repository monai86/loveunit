import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is only needed for Docker builds.
  // When deploying on Vercel (process.env.VERCEL is set), omit standalone to let Vercel's native builder trace functions.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/mt70',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/mt70/:path*',
        permanent: false,
      },
      {
        source: '/mt70/login',
        destination: '/staff/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
