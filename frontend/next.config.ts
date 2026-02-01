import type { NextConfig } from "next";
import config from "./config";

const nextConfig: NextConfig = {
  // Docker için optimize edilmiş standalone build
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${config.BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
