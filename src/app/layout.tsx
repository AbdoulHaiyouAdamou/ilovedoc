import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import GoogleTranslate from '@/components/common/GoogleTranslate';
import './globals.css';
import './workspace.css';

/* ── Google Font ────────────────────────────────────────────── */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

/* ── Metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: 'iLoveDoc - Outils PDF en Ligne Gratuits',
    template: '%s | iLoveDoc',
  },
  description:
    'Fusionnez, compressez, convertissez et éditez vos fichiers PDF gratuitement. Outils PDF en ligne rapides, sécurisés et sans inscription.',
  keywords: [
    'PDF',
    'fusionner PDF',
    'compresser PDF',
    'convertir PDF',
    'outils PDF en ligne',
    'éditeur PDF gratuit',
    'iLoveDoc',
  ],
  authors: [{ name: 'iLoveDoc' }],
  creator: 'iLoveDoc',
  publisher: 'iLoveDoc',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://ilovedoc.com'
  ),
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'iLoveDoc - Outils PDF en Ligne Gratuits',
    description:
      'Fusionnez, compressez, convertissez et éditez vos fichiers PDF gratuitement. Rapide, sécurisé, sans inscription.',
    siteName: 'iLoveDoc',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'iLoveDoc - Outils PDF en Ligne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iLoveDoc - Outils PDF en Ligne Gratuits',
    description:
      'Fusionnez, compressez, convertissez et éditez vos fichiers PDF gratuitement.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7c3aed' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0b1a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/* ── JSON-LD Structured Data ────────────────────────────────── */
function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'iLoveDoc',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ilovedoc.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ilovedoc.com'}/logo.png`,
    description:
      'Outils PDF en ligne gratuits : fusionner, compresser, convertir et éditer des fichiers PDF.',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['French', 'English'],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ilovedoc.com'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/* ── Google AdSense (production only) ───────────────────────── */
function GoogleAdSense() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!publisherId) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
    />
  );
}

/* ── Root Layout ────────────────────────────────────────────── */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('ilovedoc-theme')?.value || '';

  return (
    <html lang="fr" className={`${inter.variable} ${theme}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('ilovedoc-dark');
                var isDark = false;
                if (stored === 'true') {
                  isDark = true;
                } else if (stored === 'false') {
                  isDark = false;
                } else {
                  isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html.light, html.light body {
                background-color: #ffffff;
              }
              html.dark, html.dark body {
                background-color: #0f0b1a;
              }
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .skiptranslate, .goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame {
                display: none !important;
              }
              body {
                top: 0px !important;
              }
              .goog-tooltip, .goog-tooltip:hover {
                display: none !important;
              }
              .goog-text-highlight {
                background-color: transparent !important;
                border: none !important;
                box-shadow: none !important;
              }
            `,
          }}
        />
        <JsonLd />
        {process.env.NODE_ENV === 'production' && <GoogleAdSense />}
      </head>
      <body className={inter.className}>
        {children}
        <GoogleTranslate />
      </body>
    </html>
  );
}
