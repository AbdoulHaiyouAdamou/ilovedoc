import { NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FETCH_TIMEOUT_MS = 10_000; // 10s
const MAX_RESPONSE_BYTES = 5_000_000; // 5 MB
const MAX_REDIRECTS = 3;

/* ── Rate Limiter (in-memory) ───────────────────────── */
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 50;  // 50 requests per minute per IP

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    // start a new window
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

/**
 * Returns true if the IP (v4 or v6) targets a private, loopback,
 * link-local, or otherwise non-routable range.
 */
function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);

  if (version === 4) {
    const octets = ip.split('.').map(Number);
    if (octets.length !== 4 || octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) {
      return true; // malformed -> treat as unsafe
    }
    const [a, b] = octets;
    return (
      a === 0 || // 0.0.0.0/8
      a === 10 || // 10.0.0.0/8
      a === 127 || // loopback
      (a === 169 && b === 254) || // link-local + cloud metadata
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) || // 192.168.0.0/16
      a >= 224 // multicast / reserved
    );
  }

  if (version === 6) {
    const addr = ip.toLowerCase().split('%')[0];
    return (
      addr === '::1' || // loopback
      addr === '::' || // unspecified
      addr.startsWith('fe80') || // link-local
      addr.startsWith('fc') || // unique local fc00::/7
      addr.startsWith('fd') ||
      addr.startsWith('::ffff:') // IPv4-mapped -> reject (could embed private v4)
    );
  }

  return true; // unknown format -> unsafe
}

/**
 * Validates that a hostname does not resolve to any private address.
 * Checks every resolved record to mitigate DNS-rebinding.
 */
async function assertPublicHost(hostname: string): Promise<void> {
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('blocked');
    return;
  }

  const records = await lookup(hostname, { all: true });
  if (records.length === 0 || records.some((r) => isPrivateIp(r.address))) {
    throw new Error('blocked');
  }
}

function isAllowedProtocol(url: URL): boolean {
  return url.protocol === 'http:' || url.protocol === 'https:';
}

export async function GET(request: Request) {
  // Basic Origin/Referer check to prevent public open-proxy abuse
  const headersList = request.headers;
  const referer = headersList.get('referer') || '';
  const origin = headersList.get('origin') || '';
  const host = headersList.get('host') || '';
  const forwarded = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '';
  const clientIp = forwarded.split(',')[0].trim() || 'unknown';

  // Rate limiting check
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez patienter avant de réessayer.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(WINDOW_MS / 1000)) } }
    );
  }

  // In production, require strict matching of origin or referer
  if (process.env.NODE_ENV === 'production') {
    const isAllowed = referer.includes(host) || origin.includes(host);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Accès interdit. Seule l\'application iLoveDoc peut utiliser ce proxy.' }, { status: 403 });
    }
  }

  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url');

  if (!target) {
    return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 });
  }

  let currentUrl: URL;
  try {
    currentUrl = new URL(target);
  } catch {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
  }

  try {
    let response: Response | null = null;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!isAllowedProtocol(currentUrl)) {
        return NextResponse.json(
          { error: 'Seuls les protocoles HTTP et HTTPS sont autorisés.' },
          { status: 400 }
        );
      }

      try {
        await assertPublicHost(currentUrl.hostname);
      } catch {
        return NextResponse.json(
          { error: 'Accès aux adresses locales ou privées non autorisé.' },
          { status: 400 }
        );
      }

      response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) break;
        if (hop === MAX_REDIRECTS) {
          return NextResponse.json({ error: 'Trop de redirections.' }, { status: 502 });
        }
        currentUrl = new URL(location, currentUrl);
        continue;
      }

      break;
    }

    if (!response) {
      return NextResponse.json({ error: 'Impossible de récupérer la page' }, { status: 502 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur HTTP distante: ${response.status}` },
        { status: 502 }
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'Réponse vide' }, { status: 502 });
    }

    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.length;
        if (received > MAX_RESPONSE_BYTES) {
          await reader.cancel();
          return NextResponse.json(
            { error: 'La page distante est trop volumineuse.' },
            { status: 413 }
          );
        }
        chunks.push(value);
      }
    }

    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    const html = new TextDecoder('utf-8').decode(merged);

    return NextResponse.json({ contents: html });
  } catch (error: unknown) {
    console.error('Proxy fetch error:', error);
    const isTimeout = error instanceof Error && error.name === 'TimeoutError';
    return NextResponse.json(
      { error: isTimeout ? 'Délai dépassé lors de la récupération.' : 'Impossible de récupérer la page' },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
