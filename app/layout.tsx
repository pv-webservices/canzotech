import type { Metadata } from 'next';
import { Archivo, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './home.css';
import './pages.css';
import { Masthead } from '@/components/Masthead';
import { SiteFoot } from '@/components/SiteFoot';
import { ScrollEffects } from '@/components/ScrollEffects';
import { company } from '@/lib/site-data';

const display = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-display' });
const body = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-body' });
const accent = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], display: 'swap', variable: '--font-accent' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.canzotech.com'),
  title: {
    default: 'CanzoTech — Software Engineering Studio',
    template: '%s — CanzoTech',
  },
  description: company.description,
  alternates: { canonical: '/' },
  icons: { icon: '/canzotech-mark.webp' },
  openGraph: {
    title: 'CanzoTech — Software Engineering Studio',
    description: company.description,
    type: 'website',
    siteName: 'CanzoTech',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CanzoTech — Software Engineering Studio',
    description: company.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: 'https://www.canzotech.com',
    email: company.email,
    telephone: company.mobile,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'BSI Business Park H161 Sector 63',
      addressLocality: 'Noida',
      addressCountry: 'IN',
    },
    sameAs: [company.linkedin].filter(Boolean),
    description: company.description,
  };

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${accent.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Masthead />
        <main id="main">{children}</main>
        <SiteFoot />
        <ScrollEffects />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
