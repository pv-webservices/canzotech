import type { NextConfig } from 'next';

const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = ONE_DAY * 7;
const THIRTY_DAYS = ONE_DAY * 30;

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // AVIF first (smallest), WebP as the fallback for browsers without AVIF support.
    formats: ['image/avif', 'image/webp'],
    // Site imagery only changes with a deploy, so optimised variants can be cached for a month.
    minimumCacheTTL: THIRTY_DAYS,
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Public files are not content-hashed, so cache for a week and revalidate in the background.
        source: '/:file(images/.*|canzotech-logo.webp|canzotech-mark.webp)',
        headers: [{ key: 'Cache-Control', value: `public, max-age=${ONE_WEEK}, stale-while-revalidate=${ONE_DAY}` }],
      },
    ];
  },
};

export default nextConfig;
