import type { Metadata, Viewport } from 'next';
import { Archivo, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './home.css';
import './pages.css';
import { JsonLd } from '@/components/JsonLd';
import { Masthead } from '@/components/Masthead';
import { SiteFoot } from '@/components/SiteFoot';
import { ScrollEffects } from '@/components/ScrollEffects';
import { company } from '@/lib/site-data';
import { absoluteUrl, ORGANIZATION_ID, SITE_LOCALE, SITE_NAME, SITE_URL, WEBSITE_ID } from '@/lib/seo';

// One Archivo instance serves both display and body text (previously it was loaded twice).
const sans = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-display' });
const accent = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', display: 'swap', variable: '--font-accent' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

// Pages set their own title, description, canonical and Open Graph tags through `pageMetadata` in lib/seo.ts.
// Nothing page-specific (such as a canonical) lives here, so no route can inherit the homepage's values.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CanzoTech — Software Engineering Studio',
    template: `%s — ${SITE_NAME}`,
  },
  description: company.description,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { type: 'website', siteName: SITE_NAME, locale: SITE_LOCALE },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
  colorScheme: 'light',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: company.name,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/canzotech-logo.webp'), width: 500, height: 500 },
      description: company.description,
      email: company.email,
      telephone: company.phoneE164,
      address: {
        '@type': 'PostalAddress',
        streetAddress: company.streetAddress,
        addressLocality: company.city,
        addressRegion: company.region,
        postalCode: company.postalCode,
        addressCountry: 'IN',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: company.email,
        telephone: company.phoneE164,
        areaServed: 'IN',
        availableLanguage: 'English',
      },
      sameAs: [company.linkedin].filter(Boolean),
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'en-IN',
      publisher: { '@id': ORGANIZATION_ID },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${accent.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Masthead />
        <main id="main">{children}</main>
        <SiteFoot />
        <ScrollEffects />
        <JsonLd data={organizationSchema} />
      </body>
    </html>
  );
}
