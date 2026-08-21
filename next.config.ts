import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ai-learning",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
