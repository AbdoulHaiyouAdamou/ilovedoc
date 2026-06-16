import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['fr', 'en', 'es', 'de'],

  // Used when no locale matches
  defaultLocale: 'fr',
  localePrefix: 'as-needed' // Removes the prefix for the default locale (e.g. /merge-pdf instead of /fr/merge-pdf)
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en|es|de)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
