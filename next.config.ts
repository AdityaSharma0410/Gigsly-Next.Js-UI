import type { NextConfig } from "next";

/** Where the Spring Cloud Gateway listens; browser calls use same-origin `/api` via rewrites when NEXT_PUBLIC_API_URL is unset. */
const apiProxyTarget =
  (process.env.API_PROXY_TARGET ||
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:9090"
  ).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
  
  // Image optimization for user avatars and gig images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9090',
        pathname: '/api/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },

  // Empty turbopack config to silence warning
  turbopack: {},
};

export default nextConfig;
