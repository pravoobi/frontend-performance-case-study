import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Pass 1: serve modern formats; AVIF first, WebP fallback.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
