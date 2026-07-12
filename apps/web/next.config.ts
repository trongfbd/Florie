import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/florie-media/**",
        search: "",
      },
    ],
    // Next.js blocks the image optimizer from fetching private/loopback IPs
    // (SSRF protection) — that includes our own dev MinIO on "localhost".
    // Production serves media from a real public domain (R2/S3/Nginx), so
    // optimization stays enabled there.
    unoptimized: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
