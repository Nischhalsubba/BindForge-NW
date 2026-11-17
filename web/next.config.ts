import type { NextConfig } from "next";

// Configure headers in Next.js as well as netlify.toml: Netlify's static
// headers rules do not necessarily apply to dynamically rendered responses.
const browserSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["terminal.local"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: browserSecurityHeaders }];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
