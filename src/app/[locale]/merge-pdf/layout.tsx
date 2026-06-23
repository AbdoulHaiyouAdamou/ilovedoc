import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Tools' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ilove-doc.com';

  const title = `${t('merge-pdf.name')} | iLoveDoc`;
  const description = t('merge-pdf.description');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/merge-pdf`,
      siteName: 'iLoveDoc',
      type: 'website',
      locale,
    },
    alternates: {
      canonical: `${baseUrl}/${locale === routing.defaultLocale ? '' : locale + '/'}merge-pdf`,
    },
  };
}

export default function MergePdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
