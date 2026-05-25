import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    localPatterns: [
      {
        pathname: '/api/image-proxy',
      },
      {
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
