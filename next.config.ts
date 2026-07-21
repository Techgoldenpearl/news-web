import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "" },
      { protocol: "http", hostname: "localhost", port: "9002" },
      { protocol: "https", hostname: "**" },
    ],
    // Local MinIO runs on localhost in dev, which Next.js blocks by default as an SSRF guard.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    // Site logos are served as SVG; content is self-generated (base64-embedded PNG), not user-uploaded markup.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
