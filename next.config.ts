import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // src/lib/bundle.ts reads public/content-bundle/** off local disk (readFile,
  // not fetch) from server code. Next's serverless file-tracer builds that
  // path dynamically and can't detect it statically, so on Vercel the
  // deployed function bundle omits these files -> ENOENT at runtime. Force
  // inclusion for every route.
  outputFileTracingIncludes: {
    "/*": ["public/content-bundle/**/*"],
  },
};

export default nextConfig;
