import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is only needed for Docker builds.
  // When deploying on Vercel (process.env.VERCEL is set), omit standalone to let Vercel's native builder trace functions.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
