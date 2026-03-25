import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/project-brief.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
