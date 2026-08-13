import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output produces a minimal server bundle (server.js) for Docker
  // deployment: COPY .next/standalone + .next/static + public into the image.
  output: "standalone",
  // Allow E2E/CI to build into a separate directory (e.g. .next-e2e) so a
  // production build never clobbers a running dev server's .next artifacts.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
