import type { NextConfig } from "next";

// `npm run export` : génère un site 100 % statique dans /out (hébergement sans serveur).
const isExport = process.env.NEXT_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isExport ? { output: "export", images: { unoptimized: true } } : {}),
};

export default nextConfig;
