import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import GoogleTranslate from '@/components/common/GoogleTranslate';
import ScrollToTop from '@/components/common/ScrollToTop';
import CookieConsent from '@/components/common/CookieConsent';
import '../globals.css';
import '../workspace.css';


const inter = Inter({
  subsets: ['latin'],
  display: 'block', // Prevent font flash (FOUT)
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});


// SEO metadata per locale
const seoData: Record<string, { title: string; description: string; keywords: string[] }> = {
  fr: {
    title: 'iLoveDoc - Outils PDF en Ligne Gratuits',
    description: 'Fusionnez, compressez, convertissez et éditez vos fichiers PDF gratuitement. Outils PDF en ligne rapides, sécurisés et sans inscription.',
    keywords: ['PDF', 'fusionner PDF', 'compresser PDF', 'convertir PDF', 'outils PDF en ligne', 'éditeur PDF gratuit', 'iLoveDoc'],
  },
  en: {
    title: 'iLoveDoc - Free Online PDF Tools',
    description: 'Merge, compress, convert and edit your PDF files for free. Fast, secure and no sign-up required online PDF tools.',
    keywords: ['PDF', 'merge PDF', 'compress PDF', 'convert PDF', 'online PDF tools', 'free PDF editor', 'iLoveDoc'],
  },
  es: {
    title: 'iLoveDoc - Herramientas PDF en Línea Gratis',
    description: 'Fusiona, comprime, convierte y edita tus archivos PDF gratis. Herramientas PDF en línea rápidas, seguras y sin registro.',
    keywords: ['PDF', 'unir PDF', 'comprimir PDF', 'convertir PDF', 'herramientas PDF online', 'editor PDF gratis', 'iLoveDoc'],
  },
  de: {
    title: 'iLoveDoc - Kostenlose Online-PDF-Tools',
    description: 'PDF-Dateien kostenlos zusammenführen, komprimieren, konvertieren und bearbeiten. Schnelle, sichere Online-PDF-Tools ohne Anmeldung.',
    keywords: ['PDF', 'PDF zusammenführen', 'PDF komprimieren', 'PDF konvertieren', 'Online-PDF-Tools', 'kostenloser PDF-Editor', 'iLoveDoc'],
  },
  it: {
    title: 'iLoveDoc - Strumenti PDF Online Gratuiti',
    description: 'Unisci, comprimi, converti e modifica i tuoi file PDF gratuitamente. Strumenti PDF online veloci, sicuri e senza registrazione.',
    keywords: ['PDF', 'unire PDF', 'comprimere PDF', 'convertire PDF', 'strumenti PDF online', 'editor PDF gratuito', 'iLoveDoc'],
  },
  pt: {
    title: 'iLoveDoc - Ferramentas PDF Online Grátis',
    description: 'Junte, comprima, converta e edite seus arquivos PDF gratuitamente. Ferramentas PDF online rápidas, seguras e sem cadastro.',
    keywords: ['PDF', 'juntar PDF', 'comprimir PDF', 'converter PDF', 'ferramentas PDF online', 'editor PDF grátis', 'iLoveDoc'],
  },
  ja: {
    title: 'iLoveDoc - 無料オンラインPDFツール',
    description: 'PDFファイルを無料で結合、圧縮、変換、編集。高速で安全、登録不要のオンラインPDFツール。',
    keywords: ['PDF', 'PDF結合', 'PDF圧縮', 'PDF変換', 'オンラインPDFツール', '無料PDFエディター', 'iLoveDoc'],
  },
  ar: {
    title: 'iLoveDoc - أدوات PDF مجانية عبر الإنترنت',
    description: 'دمج وضغط وتحويل وتحرير ملفات PDF مجانًا. أدوات PDF سريعة وآمنة بدون تسجيل.',
    keywords: ['PDF', 'دمج PDF', 'ضغط PDF', 'تحويل PDF', 'أدوات PDF', 'محرر PDF مجاني', 'iLoveDoc'],
  },
  zh: {
    title: 'iLoveDoc - 免费在线PDF工具',
    description: '免费合并、压缩、转换和编辑PDF文件。快速、安全、无需注册的在线PDF工具。',
    keywords: ['PDF', '合并PDF', '压缩PDF', '转换PDF', '在线PDF工具', '免费PDF编辑器', 'iLoveDoc'],
  },
  ko: {
    title: 'iLoveDoc - 무료 온라인 PDF 도구',
    description: 'PDF 파일을 무료로 병합, 압축, 변환 및 편집하세요. 빠르고 안전하며 가입 불필요한 온라인 PDF 도구.',
    keywords: ['PDF', 'PDF 병합', 'PDF 압축', 'PDF 변환', '온라인 PDF 도구', '무료 PDF 편집기', 'iLoveDoc'],
  },
  ru: {
    title: 'iLoveDoc - Бесплатные PDF-инструменты онлайн',
    description: 'Объединяйте, сжимайте, конвертируйте и редактируйте PDF-файлы бесплатно. Быстрые, безопасные онлайн PDF-инструменты без регистрации.',
    keywords: ['PDF', 'объединить PDF', 'сжать PDF', 'конвертировать PDF', 'онлайн PDF инструменты', 'бесплатный PDF редактор', 'iLoveDoc'],
  },
  hi: {
    title: 'iLoveDoc - मुफ्त ऑनलाइन PDF टूल्स',
    description: 'अपनी PDF फाइलों को मुफ्त में मर्ज, कंप्रेस, कन्वर्ट और एडिट करें। तेज, सुरक्षित और बिना साइन-अप के ऑनलाइन PDF टूल्स।',
    keywords: ['PDF', 'PDF मर्ज', 'PDF कंप्रेस', 'PDF कन्वर्ट', 'ऑनलाइन PDF टूल्स', 'मुफ्त PDF एडिटर', 'iLoveDoc'],
  },
  tr: {
    title: 'iLoveDoc - Ücretsiz Çevrimiçi PDF Araçları',
    description: 'PDF dosyalarınızı ücretsiz birleştirin, sıkıştırın, dönüştürün ve düzenleyin. Hızlı, güvenli ve kayıt gerektirmeyen çevrimiçi PDF araçları.',
    keywords: ['PDF', 'PDF birleştir', 'PDF sıkıştır', 'PDF dönüştür', 'çevrimiçi PDF araçları', 'ücretsiz PDF düzenleyici', 'iLoveDoc'],
  },
  pl: {
    title: 'iLoveDoc - Darmowe Narzędzia PDF Online',
    description: 'Łącz, kompresuj, konwertuj i edytuj pliki PDF za darmo. Szybkie, bezpieczne narzędzia PDF online bez rejestracji.',
    keywords: ['PDF', 'połącz PDF', 'kompresuj PDF', 'konwertuj PDF', 'narzędzia PDF online', 'darmowy edytor PDF', 'iLoveDoc'],
  },
  nl: {
    title: 'iLoveDoc - Gratis Online PDF-tools',
    description: 'Voeg samen, comprimeer, converteer en bewerk uw PDF-bestanden gratis. Snelle, veilige online PDF-tools zonder registratie.',
    keywords: ['PDF', 'PDF samenvoegen', 'PDF comprimeren', 'PDF converteren', 'online PDF-tools', 'gratis PDF-editor', 'iLoveDoc'],
  },
};

// Fallback for locales not explicitly defined above
const defaultSeo = seoData.fr;

import { routing } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ilovedoc.com';
  const seo = seoData[locale] || defaultSeo;

  let title = 'iLoveDoc';
  let description = '';
  try {
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    title = t('home_title');
    description = t('home_desc');
  } catch (e) {
    // Fallback if translations fail
  }

  // Build hreflang alternates for all locales
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = loc === routing.defaultLocale ? baseUrl : `${baseUrl}/${loc}`;
  }
  languages['x-default'] = baseUrl;

  return {
    title: {
      default: title,
      template: '%s | iLoveDoc',
    },
    description: description,
    authors: [{ name: 'iLoveDoc' }],
    creator: 'iLoveDoc',
    publisher: 'iLoveDoc',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: locale === routing.defaultLocale ? '/' : `/${locale}`,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: locale === routing.defaultLocale ? '/' : `/${locale}`,
      title: title,
      description: description,
      siteName: 'iLoveDoc',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'iLoveDoc',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
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
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7c3aed' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0b1a' },
  ],
  width: 'device-width',
  initialScale: 1,
};


function JsonLd({ description }: { description: string }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'iLoveDoc',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ilovedoc.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ilovedoc.com'}/logo.png`,
    description: description,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '',
      contactType: 'customer service',
      email: 'contact@ilovedoc.com',
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


import { setRequestLocale } from 'next-intl/server';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  console.log("RootLayout params:", resolvedParams);
  const { locale } = resolvedParams;
  setRequestLocale(locale);
  const cookieStore = await cookies();
  const theme = cookieStore.get('ilovedoc-theme')?.value || '';
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${theme}`} suppressHydrationWarning>
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.history && 'scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
              }
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
        <JsonLd description={messages?.Metadata?.home_desc || ''} />
        {process.env.NODE_ENV === 'production' && <GoogleAdSense />}
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ScrollToTop />
          {children}
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
