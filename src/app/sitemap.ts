import { MetadataRoute } from 'next';
import { tools } from '@/config/tools';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ilove-doc.com';
  const locales = routing.locales;
  const defaultLocale = routing.defaultLocale;

  // Helper: build URL for a given route and locale
  function buildUrl(route: string, locale: string): string {
    if (locale === defaultLocale) {
      return route ? `${baseUrl}/${route}` : baseUrl;
    }
    return route ? `${baseUrl}/${locale}/${route}` : `${baseUrl}/${locale}`;
  }

  // Helper: build alternates for a given route
  function buildAlternates(route: string): Record<string, string> {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = buildUrl(route, locale);
    }
    // x-default points to the default locale version
    languages['x-default'] = buildUrl(route, defaultLocale);
    return languages;
  }

  // Static routes
  const staticPaths = ['', 'about', 'contact', 'faq', 'privacy', 'terms', 'blog'];
  const staticEntries: MetadataRoute.Sitemap = [];

  for (const route of staticPaths) {
    for (const locale of locales) {
      staticEntries.push({
        url: buildUrl(route, locale),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '' ? 1.0 : 0.6,
        alternates: {
          languages: buildAlternates(route),
        },
      });
    }
  }

  // Tool routes (46 tools × 39 locales)
  const toolEntries: MetadataRoute.Sitemap = [];

  for (const tool of tools) {
    for (const locale of locales) {
      toolEntries.push({
        url: buildUrl(tool.slug, locale),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: {
          languages: buildAlternates(tool.slug),
        },
      });
    }
  }

  return [...staticEntries, ...toolEntries];
}
