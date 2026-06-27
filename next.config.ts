import type { NextConfig } from "next";

/**
 * Content-Security-Policy aligned with the third-party resources actually used:
 * - Google AdSense (pagead2.googlesyndication.com, *.google.com)
 * - Google Translate (translate.google.com, translate.googleapis.com)
 * - pdf.js loaded from cdnjs.cloudflare.com
 * - Groq API called server-side (allowed via connect-src for safety)
 *
 * Note: 'unsafe-inline' is required for the inline theme/style bootstrap in
 * layout.tsx and for AdSense. Consider migrating to nonces later to drop it.
 */
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://translate.google.com https://translate.googleapis.com https://cdnjs.cloudflare.com https://*.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://api.groq.com https://cdnjs.cloudflare.com https://translate.googleapis.com https://*.googlesyndication.com https://*.google.com https://*.google",
  "worker-src 'self' blob: https://cdnjs.cloudflare.com",
  "frame-src https://googleads.g.doubleclick.net https://*.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default withAnalyzer(withNextIntl(nextConfig));
