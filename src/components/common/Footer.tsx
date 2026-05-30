'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { AtSign, Code, Briefcase, Video, Heart, Globe, ChevronUp, Check } from 'lucide-react';

const columns = [
  {
    title: 'Outils Populaires',
    links: [
      { href: '/merge-pdf', label: 'Fusionner PDF' },
      { href: '/split-pdf', label: 'Diviser PDF' },
      { href: '/compress-pdf', label: 'Compresser PDF' },
      { href: '/rotate-pdf', label: 'Rotation PDF' },
      { href: '/remove-pages', label: 'Supprimer des pages' },
      { href: '/organize-pdf', label: 'Organiser PDF' },
    ],
  },
  {
    title: 'Convertir PDF',
    links: [
      { href: '/pdf-to-word', label: 'PDF en Word' },
      { href: '/pdf-to-excel', label: 'PDF en Excel' },
      { href: '/pdf-to-jpg', label: 'PDF en JPG' },
      { href: '/pdf-to-ppt', label: 'PDF en PowerPoint' },
      { href: '/word-to-pdf', label: 'Word en PDF' },
      { href: '/jpg-to-pdf', label: 'JPG en PDF' },
      { href: '/excel-to-pdf', label: 'Excel en PDF' },
    ],
  },
  {
    title: 'À Propos',
    links: [
      { href: '/about', label: 'Qui sommes-nous' },
      { href: '/contact', label: 'Contactez-nous' },
      { href: '/blog', label: 'Blog' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { href: '/terms', label: 'Mentions légales' },
      { href: '/privacy', label: 'Politique de confidentialité' },
      { href: '/terms', label: "Conditions d'utilisation" },
      { href: '/privacy', label: 'Politique de cookies' },
    ],
  },
];

const socials = [
  { label: 'Twitter / X', icon: <AtSign size={18} />, href: 'https://x.com' },
  { label: 'GitHub', icon: <Code size={18} />, href: 'https://github.com' },
  { label: 'LinkedIn', icon: <Briefcase size={18} />, href: 'https://linkedin.com' },
  { label: 'YouTube', icon: <Video size={18} />, href: 'https://youtube.com' },
];

const LANGUAGES = [
  'English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português', '日本語', 'Русский', '한국어',
  '中文 (简体)', '中文 (繁體)', 'العربية', 'Български', 'Català', 'Nederlands', 'Ελληνικά', 'हिन्दी', 'Bahasa Indonesia',
  'Bahasa Melayu', 'Polski', 'Svenska', 'ภาษาไทย', 'Türkçe', 'Українська', 'Tiếng Việt', 'Kiswahili'
];

const LANGUAGE_CODES: Record<string, string> = {
  'English': 'en',
  'Español': 'es',
  'Français': 'fr',
  'Deutsch': 'de',
  'Italiano': 'it',
  'Português': 'pt',
  '日本語': 'ja',
  'Русский': 'ru',
  '한국어': 'ko',
  '中文 (简体)': 'zh-CN',
  '中文 (繁體)': 'zh-TW',
  'العربية': 'ar',
  'Български': 'bg',
  'Català': 'ca',
  'Nederlands': 'nl',
  'Ελληνικά': 'el',
  'हिन्दी': 'hi',
  'Bahasa Indonesia': 'id',
  'Bahasa Melayu': 'ms',
  'Polski': 'pl',
  'Svenska': 'sv',
  'ภาษาไทย': 'th',
  'Türkçe': 'tr',
  'Українська': 'uk',
  'Tiếng Việt': 'vi',
  'Kiswahili': 'sw'
};

const CODE_TO_LANG: Record<string, string> = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt': 'Português',
  'ja': '日本語',
  'ru': 'Русский',
  'ko': '한국어',
  'zh': '中文 (简体)',
  'ar': 'العربية',
  'bg': 'Български',
  'ca': 'Català',
  'nl': 'Nederlands',
  'el': 'Ελληνικά',
  'hi': 'हिन्दी',
  'id': 'Bahasa Indonesia',
  'ms': 'Bahasa Melayu',
  'pl': 'Polski',
  'sv': 'Svenska',
  'th': 'ภาษาไทย',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'vi': 'Tiếng Việt',
  'sw': 'Kiswahili'
};

export default function Footer() {
  const [selectedLang, setSelectedLang] = useState('Français');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle Google Translate cookie logic on mount — NO auto-reload
  useEffect(() => {
    // Helper to extract cookie values
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return '';
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
      return '';
    };

    // If a reload was just triggered by us, don't do anything else
    const reloadPending = sessionStorage.getItem('ilovedoc-lang-reload');
    if (reloadPending) {
      sessionStorage.removeItem('ilovedoc-lang-reload');
      const pendingLang = localStorage.getItem('ilovedoc-lang') || 'Français';
      setSelectedLang(pendingLang);
      return;
    }

    // Check if the user already chose a language before (manually)
    const isManual = localStorage.getItem('ilovedoc-lang-manual') === 'true';
    const savedLang = localStorage.getItem('ilovedoc-lang');

    // Detect browser language
    const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'fr';
    const detectedLang = CODE_TO_LANG[browserLang] || 'Français';

    // If they manually chose a language, respect it. Otherwise, follow the browser language.
    const targetLang = (isManual && savedLang) ? savedLang : detectedLang;
    setSelectedLang(targetLang);
    localStorage.setItem('ilovedoc-lang', targetLang);

    // Ensure cookie matches target language
    const targetCode = LANGUAGE_CODES[targetLang] || 'fr';
    const currentGoogTrans = getCookie('googtrans');
    const currentCode = currentGoogTrans ? currentGoogTrans.split('/').pop() : '';

    if (currentCode !== targetCode) {
      // Don't trigger a reload if target language is French and it's already showing French (empty currentCode)
      if (targetCode === 'fr' && !currentCode) {
        return;
      }

      const hostname = window.location.hostname;
      const domainParts = hostname.split('.');
      const cookieDomain = domainParts.length > 1 ? `.${domainParts.slice(-2).join('.')}` : hostname;

      document.cookie = `googtrans=/fr/${targetCode}; path=/; domain=${hostname}; SameSite=Lax`;
      document.cookie = `googtrans=/fr/${targetCode}; path=/; domain=${cookieDomain}; SameSite=Lax`;
      document.cookie = `googtrans=/fr/${targetCode}; path=/; SameSite=Lax`;

      sessionStorage.setItem('ilovedoc-lang-reload', 'true');
      window.location.reload();
    }
  }, []);

  const selectLanguage = (lang: string) => {
    setSelectedLang(lang);
    setIsOpen(false);
    localStorage.setItem('ilovedoc-lang', lang);
    localStorage.setItem('ilovedoc-lang-manual', 'true'); // Flag manual selection to ignore automatic browser override

    const code = LANGUAGE_CODES[lang];
    if (code) {
      const hostname = window.location.hostname;
      const domainParts = hostname.split('.');
      const cookieDomain = domainParts.length > 1 ? `.${domainParts.slice(-2).join('.')}` : hostname;

      // Set target language translate cookie
      document.cookie = `googtrans=/fr/${code}; path=/; domain=${hostname}; SameSite=Lax`;
      document.cookie = `googtrans=/fr/${code}; path=/; domain=${cookieDomain}; SameSite=Lax`;
      document.cookie = `googtrans=/fr/${code}; path=/; SameSite=Lax`;

      // Try to trigger Google Translate directly without reload
      const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectEl) {
        selectEl.value = code;
        selectEl.dispatchEvent(new Event('change'));
      } else {
        // Mark that we're reloading intentionally, then reload
        sessionStorage.setItem('ilovedoc-lang-reload', 'true');
        window.location.reload();
      }
    }
  };

  return (
    <footer
      style={{
        background: 'linear-gradient(165deg, #1a1a2e 0%, #16162a 50%, #0f0f1e 100%)',
        color: '#c4c4d4',
        padding: '64px 24px 0',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* ---- Top: Logo + columns ---- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 40,
            paddingBottom: 48,
          }}
        >
          {/* Brand column */}
          <div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                i<Heart size={26} fill="#e44d7b" color="#e44d7b" style={{ margin: '0 2px' }} />Doc
              </span>
            </Link>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: '#9494ae',
                marginTop: 14,
                maxWidth: 260,
              }}
            >
              Tous vos outils PDF en un seul endroit.
              Gratuit, sécurisé, 100&nbsp;% en ligne.
              Aucune inscription requise.
            </p>

            {/* Socials */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid rgba(167,139,250,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    color: '#a78bfa',
                    textDecoration: 'none',
                    transition: 'background .2s, border-color .2s, transform .2s',
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#e4e4ef',
                  marginBottom: 16,
                }}
              >
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map((link, idx) => (
                  <li key={`${link.href}-${idx}`}>
                    <Link
                      href={link.href}
                      style={{
                        color: '#9494ae',
                        textDecoration: 'none',
                        fontSize: 14,
                        transition: 'color .2s',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ---- Divider ---- */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.2), transparent)',
          }}
        />

        {/* ---- Bottom bar ---- */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            padding: '24px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#6b6b82' }}>
              © {new Date().getFullYear()} iLoveDoc. Tous droits réservés.
            </span>

            {/* Language Dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(167,139,250,0.18)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  color: '#c4c4d4',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#c4c4d4';
                }}
              >
                <Globe size={15} />
                <span>{selectedLang}</span>
                <ChevronUp size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {isOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 10px)',
                    left: 0,
                    width: '600px',
                    maxWidth: '90vw',
                    background: '#16162a',
                    border: '1px solid rgba(167,139,250,0.25)',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    padding: 16,
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {LANGUAGES.map((lang) => {
                      const isSelected = lang === selectedLang;
                      return (
                        <button
                          key={lang}
                          onClick={() => {
                            selectLanguage(lang);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: isSelected ? 'rgba(167,139,250,0.1)' : 'transparent',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 10px',
                            color: isSelected ? '#a78bfa' : '#9494ae',
                            fontSize: 13,
                            textAlign: 'left',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'color 0.15s, background 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              e.currentTarget.style.color = '#fff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#9494ae';
                            }
                          }}
                        >
                          <span>{lang}</span>
                          {isSelected && <Check size={14} color="#a78bfa" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <span
            style={{
              fontSize: 13,
              color: '#9494ae',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Fait avec
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #e44d7b, #ff6b9d)',
                borderRadius: 6,
                padding: '4px 6px',
                color: '#fff',
              }}
            >
              <Heart size={14} fill="#fff" color="#fff" />
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
