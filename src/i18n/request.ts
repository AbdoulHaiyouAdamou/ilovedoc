import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
export const routing = {
  locales: ['fr', 'en', 'es', 'de'],
  defaultLocale: 'fr'
};

export default getRequestConfig(async ({locale}) => {
  const currentLocale = locale || routing.defaultLocale;
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(currentLocale as any)) notFound();

  return {
    locale: currentLocale,
    messages: (await import(`../../messages/${currentLocale}.json`)).default
  };
});
