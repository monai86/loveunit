import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is only needed for Docker builds.
  // When deploying on Vercel (process.env.VERCEL is set), omit standalone to let Vercel's native builder trace functions.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
