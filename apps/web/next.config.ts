import type { NextConfig } from "next";

// Production media is served from a real domain (R2/S3/Nginx in front of
// MinIO), not "localhost:9000" — set MEDIA_PUBLIC_HOSTNAME (build-time env,
// no NEXT_PUBLIC_ prefix needed since next.config.ts runs in Node) to that
// domain so the image optimizer is allowed to fetch from it.
const productionMediaHostname = process.env.MEDIA_PUBLIC_HOSTNAME;

const nextConfig: NextConfig = {
  output: "standalone",
  // Conservative baseline only — no CSP or Cross-Origin-Opener-Policy here,
  // since a strict COOP is a known way to break the Google Sign-In popup's
  // postMessage callback, and a strict CSP would need real testing against
  // every inline script this app + its libraries use before it's safe.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/florie-media/**",
        search: "",
      },
      {
        // Google account profile pictures (Google Sign-In)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      ...(productionMediaHostname
        ? [{ protocol: "https" as const, hostname: productionMediaHostname }]
        : []),
    ],
    // Next.js blocks the image optimizer from fetching private/loopback IPs
    // (SSRF protection) — that includes our own dev MinIO on "localhost".
    // Production serves media from a real public domain (R2/S3/Nginx), so
    // optimization stays enabled there.
    unoptimized: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
