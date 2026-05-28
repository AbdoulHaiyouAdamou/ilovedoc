import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Seuls les protocoles HTTP et HTTPS sont autorisés.' }, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Vérification anti-SSRF (blocage des adresses privées et locales)
    const isPrivate = 
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname === '0.0.0.0' ||
      /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.|127\.)/.test(hostname);

    if (isPrivate) {
      return NextResponse.json({ error: 'Accès aux adresses locales ou privées non autorisé.' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const html = await response.text();
    return NextResponse.json({ contents: html });
  } catch (error: any) {
    console.error('Proxy fetch error:', error);
    return NextResponse.json({ error: error.message || 'Impossible de récupérer la page' }, { status: 500 });
  }
}
