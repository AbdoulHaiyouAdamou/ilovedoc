import React from 'react';
import { getToolBySlug } from '@/config/tools';
import { useTranslations } from 'next-intl';

interface SEOProps {
  slug: string;
}

export default function SEO({ slug }: SEOProps) {
  const tCommon = useTranslations('Common');
  const tTools = useTranslations('Tools');
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ilove-doc.com';
  const toolUrl = `${baseUrl}/${slug}`;

  // Build Structured Data @graph linking all schemas together
  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. SoftwareApplication
      {
        '@type': 'SoftwareApplication',
        '@id': `${toolUrl}#software`,
        'name': tTools(`${slug}.name`),
        'description': tTools(`${slug}.description`),
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'EUR',
        },
        'featureList': [
          tCommon('trust_private'),
          tCommon('trust_no_upload'),
          tCommon('trust_local'),
          tCommon('trust_fast')
        ],
        'browserRequirements': 'Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.',
      },
      // 2. BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        '@id': `${toolUrl}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'iLoveDoc',
            'item': baseUrl,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': tTools(`${slug}.name`),
            'item': toolUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
    />
  );
}
