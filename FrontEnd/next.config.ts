import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { hostname: 'placehold.co' },
      { hostname: 'upload.wikimedia.org' },
      { hostname: 'static.todamateria.com.br' },
    ],
  },
};

export default nextConfig;