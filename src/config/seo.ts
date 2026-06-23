/* ============================================================
   iLoveDoc — SEO Configuration
   Default metadata, per-tool metadata, JSON-LD generators
   ============================================================ */

import type { Metadata } from 'next';
import type { Tool } from './tools';

/* ── Constants ───────────────────────────────────────────────── */
const SITE_NAME = 'iLoveDoc';
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://ilove-doc.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/* ── Default Metadata ────────────────────────────────────────── */
export const defaultMetadata: Metadata = {
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
    'outils PDF gratuits',
    'éditeur PDF en ligne',
    'iLoveDoc',
    'PDF en ligne',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    languages: { 'fr-FR': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'iLoveDoc - Outils PDF en Ligne Gratuits',
    description:
      'Fusionnez, compressez, convertissez et éditez vos fichiers PDF gratuitement.',
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
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
    images: [DEFAULT_OG_IMAGE],
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
};

/* ── Per-Tool Metadata ───────────────────────────────────────── */

/** Category labels for SEO titles */
const categoryTitleMap: Record<string, string> = {
  organize: 'Organiser',
  optimize: 'Optimiser',
  'convert-to': 'Convertir',
  'convert-from': 'Convertir',
  edit: 'Éditer',
  security: 'Sécurité',
  ai: 'Intelligence Artificielle',
};

/**
 * Generate Next.js Metadata for a specific tool page.
 */
export function generateToolMetadata(tool: Tool): Metadata {
  const title = `${tool.name} - ${tool.description}`;
  const url = `/tools/${tool.slug}`;

  return {
    title: tool.name,
    description: `${tool.description} Outil PDF en ligne gratuit et sécurisé, sans inscription.`,
    keywords: [
      ...(tool.keywords ?? []),
      'PDF',
      'en ligne',
      'gratuit',
      'iLoveDoc',
      categoryTitleMap[tool.category] ?? '',
    ].filter(Boolean),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      url,
      title,
      description: `${tool.description} Gratuit, rapide et sécurisé.`,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/og/${tool.slug}.png`,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.description,
      images: [`${SITE_URL}/og/${tool.slug}.png`],
    },
  };
}

/* ── JSON-LD Generators ──────────────────────────────────────── */

/** Organization schema (for homepage) */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Outils PDF en ligne gratuits : fusionner, compresser, convertir et éditer des fichiers PDF.',
    sameAs: [],
  };
}

/** WebApplication schema (for tool pages) */
export function generateToolJsonLd(tool: Tool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} - ${SITE_NAME}`,
    url: `${SITE_URL}/tools/${tool.slug}`,
    description: tool.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    featureList: [
      'Traitement 100% côté client',
      'Aucune inscription requise',
      'Fichiers non envoyés sur un serveur',
      'Utilisation illimitée',
      'Interface en français',
    ],
    browserRequirements: 'Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.',
    softwareVersion: '1.0.0',
  };
}

/** BreadcrumbList schema */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/** FAQ schema (for tool pages with FAQ sections) */
export function generateFaqJsonLd(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** HowTo schema (for tool instruction sections) */
export function generateHowToJsonLd(
  name: string,
  description: string,
  steps: { name: string; text: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    totalTime: 'PT1M',
    tool: {
      '@type': 'HowToTool',
      name: 'Navigateur web',
    },
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${SITE_URL}#step-${index + 1}`,
    })),
  };
}

/* ── Common FAQ Templates ────────────────────────────────────── */

export function getToolFaqs(tool: Tool): { question: string; answer: string }[] {
  return [
    {
      question: `Est-ce que ${tool.name} est gratuit ?`,
      answer: `Oui, ${tool.name} sur iLoveDoc est entièrement gratuit et sans limite d'utilisation. Aucune inscription n'est nécessaire.`,
    },
    {
      question: `Mes fichiers sont-ils sécurisés avec ${tool.name} ?`,
      answer:
        'Absolument. Tous les traitements sont effectués directement dans votre navigateur. Vos fichiers ne sont jamais envoyés sur nos serveurs, garantissant une confidentialité totale.',
    },
    {
      question: `Comment utiliser ${tool.name} ?`,
      answer: `Glissez-déposez vos fichiers PDF dans la zone prévue, configurez les options si nécessaire, puis cliquez sur le bouton d'action. Le résultat sera téléchargeable instantanément.`,
    },
    {
      question: 'Sur quels appareils puis-je utiliser cet outil ?',
      answer:
        'iLoveDoc fonctionne sur tous les appareils disposant d\'un navigateur web moderne : ordinateur, tablette et smartphone (Chrome, Firefox, Safari, Edge).',
    },
    {
      question: 'Y a-t-il une limite de taille de fichier ?',
      answer:
        'Les fichiers sont traités localement dans votre navigateur. La limite dépend de la mémoire disponible sur votre appareil, mais la plupart des fichiers jusqu\'à 100 Mo fonctionnent parfaitement.',
    },
  ];
}

/* ── Common HowTo Steps ──────────────────────────────────────── */

export function getToolHowToSteps(tool: Tool): { name: string; text: string }[] {
  return [
    {
      name: 'Sélectionnez vos fichiers',
      text: `Glissez-déposez vos fichiers PDF dans la zone de téléchargement, ou cliquez pour parcourir vos fichiers.`,
    },
    {
      name: 'Configurez les options',
      text: `Ajustez les paramètres selon vos besoins (ordre des fichiers, pages à inclure, etc.).`,
    },
    {
      name: `Lancez ${tool.name}`,
      text: `Cliquez sur le bouton d'action pour lancer le traitement. L'opération est effectuée instantanément dans votre navigateur.`,
    },
    {
      name: 'Téléchargez le résultat',
      text: `Une fois le traitement terminé, cliquez sur "Télécharger" pour sauvegarder votre fichier PDF modifié.`,
    },
  ];
}

export default {
  defaultMetadata,
  generateToolMetadata,
  generateOrganizationJsonLd,
  generateToolJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
  generateHowToJsonLd,
  getToolFaqs,
  getToolHowToSteps,
};
