import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en|es|de|it|pt|ja|ru|ko|zh|ar|bg|ca|nl|el|hi|id|ms|pl|sv|th|tr|uk|vi|sw|az|cs|da|eu|fa|ga|hr|hu|ml|no|ro|sk|sl|sr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
