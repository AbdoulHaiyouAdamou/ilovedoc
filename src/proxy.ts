import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, type NextRequest } from 'next/server';
import { kv } from '@vercel/kv';

const intlMiddleware = createMiddleware(routing);

const MAX_REQUESTS = 20;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect API routes from bots to save Serverless Function Invocations
  if (pathname.startsWith('/api/')) {
    const userAgent = req.headers.get('user-agent') || '';
    const uaLower = userAgent.toLowerCase();
    if (!userAgent || uaLower.includes('curl') || uaLower.includes('python') || uaLower.includes('bot') || uaLower.includes('scraper')) {
      return new NextResponse('Accès interdit', { status: 403 });
    }

    // Edge Rate Limiting via KV
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const key = `ratelimit:edge:${ip}`;
        const count = await kv.incr(key);
        if (count === 1) {
          await kv.expire(key, 60);
        }
        if (count > MAX_REQUESTS) {
          return new NextResponse('Trop de requêtes', { status: 429 });
        }
      } catch (e) {
        console.warn('KV edge rate limit failed:', e);
      }
    }
    
    return NextResponse.next();
  }

  // Handle i18n routing for pages
  return intlMiddleware(req);
}

export const config = {
  // Match API routes and internationalized pathnames
  matcher: [
    '/api/:path*',
    '/',
    '/(fr|en|es|de|it|pt|ja|ru|ko|zh|ar|bg|ca|nl|el|hi|id|ms|pl|sv|th|tr|uk|vi|sw|az|cs|da|eu|fa|ga|hr|hu|ml|no|ro|sk|sl|sr)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
