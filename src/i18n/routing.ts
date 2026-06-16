import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  locales: ['fr', 'en', 'es', 'de', 'it', 'pt', 'ja', 'ru', 'ko', 'zh', 'ar', 'bg', 'ca', 'nl', 'el', 'hi', 'id', 'ms', 'pl', 'sv', 'th', 'tr', 'uk', 'vi', 'sw', 'az', 'cs', 'da', 'eu', 'fa', 'ga', 'hr', 'hu', 'ml', 'no', 'ro', 'sk', 'sl', 'sr'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
});
 
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
