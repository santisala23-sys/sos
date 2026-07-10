import type { NextConfig } from "next";

/** CSP allowlists for GTM + GA4 — https://developers.google.com/tag-platform/security/guides/csp */
const gtmScriptSources = [
  "https://www.googletagmanager.com",
  "https://*.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
].join(" ");

const gtmConnectSources = [
  "https://www.googletagmanager.com",
  "https://*.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://analytics.google.com",
  "https://*.analytics.google.com",
  "https://www.google.com",
  "https://www.google.com.ar",
  "https://*.g.doubleclick.net",
].join(" ");

const gtmImgSources = [
  "https://www.googletagmanager.com",
  "https://*.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://www.google.com",
  "https://www.google.com.ar",
  "https://*.g.doubleclick.net",
].join(" ");

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "https://accounts.google.com",
  gtmScriptSources,
].join(" ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      `script-src-elem ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: https: blob: ${gtmImgSources}`,
      "media-src 'self' data: blob:",
      "font-src 'self' data:",
      `connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com ${gtmConnectSources}`,
      "frame-src https://accounts.google.com https://maps.google.com https://www.google.com https://www.youtube-nocookie.com https://www.youtube.com https://www.googletagmanager.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "sosme.app" }],
        destination: "https://sosme.com.ar/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sosme.app" }],
        destination: "https://sosme.com.ar/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "sos-alpha-lime.vercel.app" }],
        destination: "https://sosme.com.ar/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sosme.com.ar" }],
        destination: "https://sosme.com.ar/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
