import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/api-docs/:path*',
        destination: `${backendUrl}/api-docs/:path*`,
      }
    ];
  },
};

export default nextConfig;
