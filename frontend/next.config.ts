import type { NextConfig } from "next";
import config from "./config";

const nextConfig: NextConfig = {
  // Docker için optimize edilmiş standalone build
  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${config.backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
