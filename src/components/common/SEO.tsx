import React from 'react';
import { getToolBySlug } from '@/config/tools';
import { getSEOData } from '@/config/seoData';

interface SEOProps {
  slug: string;
}

export default function SEO({ slug }: SEOProps) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const seo = getSEOData(slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ilovedoc.com';
  const toolUrl = `${baseUrl}/${slug}`;

  // Build Structured Data @graph linking all schemas together
  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. SoftwareApplication
      {
        '@type': 'SoftwareApplication',
        '@id': `${toolUrl}#software`,
        'name': tool.name,
        'description': seo.description,
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'EUR',
        },
        'browserRequirements': 'Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.',
      },
      // 2. FAQPage
      {
        '@type': 'FAQPage',
        '@id': `${toolUrl}#faq`,
        'mainEntity': seo.faq.map((item) => ({
          '@type': 'Question',
          'name': item.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': item.answer,
          },
        })),
      },
      // 3. BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        '@id': `${toolUrl}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Accueil',
            'item': baseUrl,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': tool.name,
            'item': toolUrl,
          },
        ],
      },
      // 4. HowTo
      {
        '@type': 'HowTo',
        '@id': `${toolUrl}#howto`,
        'name': `Comment utiliser ${tool.name} en ligne`,
        'description': seo.description,
        'step': seo.steps.map((step, index) => ({
          '@type': 'HowToStep',
          'position': index + 1,
          'name': step.name,
          'text': step.text,
          'url': `${toolUrl}#step-${index + 1}`,
        })),
      },
    ],
  };

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      
      {/* OpenGraph & Twitter tags */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={toolUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={toolUrl} />
      
      {/* Structured Data script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
    </>
  );
}
