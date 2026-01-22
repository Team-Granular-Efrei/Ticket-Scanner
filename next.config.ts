import type { NextConfig } from "next";
import { validateEnv } from "./src/lib/env";

validateEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: { compilationMode: "infer" },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
