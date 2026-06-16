import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async (params: any) => {
  const reqLocale = params.locale || (params.requestLocale ? await params.requestLocale : undefined);
  const currentLocale = reqLocale || routing.defaultLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(currentLocale as any)) {
    return {
      locale: routing.defaultLocale,
      messages: (await import(`../../messages/${routing.defaultLocale}.json`)).default
    };
  }

  return {
    locale: currentLocale,
    messages: (await import(`../../messages/${currentLocale}.json`)).default
  };
});
