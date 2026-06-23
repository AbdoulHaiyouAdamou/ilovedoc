import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Footer' });
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ilove-doc.com';

  const title = `${t('contact')} – iLoveDoc`;
  const description = tMeta('home_desc'); // Fallback description

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/contact`,
      siteName: 'iLoveDoc',
      type: 'website',
      locale,
    },
    alternates: {
      canonical: `${baseUrl}/${locale === routing.defaultLocale ? '' : locale + '/'}contact`,
    },
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
