import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Allow any HTTPS image source (dev / hackathon mode)
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // Native experimental.viewTransition lands in Next 15.2+. We're pinned to
  // 15.1.7, so the flag would emit a config warning. Until upgrade, view
  // transitions are wired purely via CSS in globals.css (::view-transition-old
  // / ::view-transition-new) — they activate on any browser that ships the
  // View Transitions API and degrade gracefully elsewhere.
};

export default nextConfig;
