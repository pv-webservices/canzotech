import type { NextConfig } from 'next';

// The site runs as a Next.js Node.js app on Hostinger (LiteSpeed proxies to it), so redirects and headers live
// here rather than in .htaccess. Hostinger itself already redirects http:// to https://.

const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = ONE_DAY * 7;
const THIRTY_DAYS = ONE_DAY * 30;

/** Canonical origin. Must match SITE_URL in lib/seo.ts. */
const CANONICAL_HOST = 'www.canzotech.com';
const APEX_HOST = 'canzotech.com';

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
  // URLs have no trailing slash; /about/ answers with a permanent redirect to /about.
  trailingSlash: false,
  images: {
    // AVIF first (smallest), WebP as the fallback for browsers without AVIF support.
    formats: ['image/avif', 'image/webp'],
    // Site imagery only changes with a deploy, so optimised variants can be cached for a month.
    minimumCacheTTL: THIRTY_DAYS,
  },
  async redirects() {
    return [
      // One canonical host: canzotech.com/* → https://www.canzotech.com/*
      {
        source: '/:path*',
        has: [{ type: 'host', value: APEX_HOST }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        statusCode: 301,
      },
      { source: '/index.html', destination: '/', statusCode: 301 },
      { source: '/index.php', destination: '/', statusCode: 301 },
    ];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Public files are not content-hashed, so cache for a week and revalidate in the background.
        // (Next.js already serves the hashed /_next/static assets with a one-year immutable cache.)
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: `public, max-age=${ONE_WEEK}, stale-while-revalidate=${ONE_DAY}` }],
      },
      {
        source: '/:file(favicon.ico|favicon.svg|favicon-48x48.png|favicon-96x96.png|icon-192x192.png|icon-512x512.png|apple-touch-icon.png|site.webmanifest)',
        headers: [{ key: 'Cache-Control', value: `public, max-age=${ONE_DAY}, stale-while-revalidate=${ONE_WEEK}` }],
      },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
    ];
  },
};

export default nextConfig;
