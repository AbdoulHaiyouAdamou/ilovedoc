'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Heart from 'lucide-react/dist/esm/icons/heart';
import Globe from 'lucide-react/dist/esm/icons/globe';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import Check from 'lucide-react/dist/esm/icons/check';
import AtSign from 'lucide-react/dist/esm/icons/at-sign';
import Code from 'lucide-react/dist/esm/icons/code';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Video from 'lucide-react/dist/esm/icons/video';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

// Columns array moved inside the component to access translations
const socials = [
  { label: 'Twitter / X', icon: <AtSign size={18} />, href: 'https://x.com/ilovedoc' },
  { label: 'GitHub', icon: <Code size={18} />, href: 'https://github.com/ilovedoc' },
  { label: 'LinkedIn', icon: <Briefcase size={18} />, href: 'https://linkedin.com/company/ilovedoc' },
  { label: 'YouTube', icon: <Video size={18} />, href: 'https://youtube.com/@ilovedoc' },
];

const LANGUAGES = [
  'English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português', '日本語', 'Русский', '한국어',
  '中文 (简体)', 'العربية', 'Български', 'Català', 'Nederlands', 'Ελληνικά', 'हिन्दी', 'Bahasa Indonesia',
  'Bahasa Melayu', 'Polski', 'Svenska', 'ภาษาไทย', 'Türkçe', 'Українська', 'Tiếng Việt', 'Kiswahili',
  'Azərbaycan', 'Čeština', 'Dansk', 'Euskara', 'فارسی', 'Gaeilge', 'Hrvatski', 'Magyar', 'മലയാളം', 'Norsk', 'Română', 'Slovenčina', 'Slovenščina', 'Српски'
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
  '中文 (简体)': 'zh',
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
  'Kiswahili': 'sw',
  'Azərbaycan': 'az',
  'Čeština': 'cs',
  'Dansk': 'da',
  'Euskara': 'eu',
  'فارسی': 'fa',
  'Gaeilge': 'ga',
  'Hrvatski': 'hr',
  'Magyar': 'hu',
  'മലയാളം': 'ml',
  'Norsk': 'no',
  'Română': 'ro',
  'Slovenčina': 'sk',
  'Slovenščina': 'sl',
  'Српски': 'sr'
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
  'sw': 'Kiswahili',
  'az': 'Azərbaycan',
  'cs': 'Čeština',
  'da': 'Dansk',
  'eu': 'Euskara',
  'fa': 'فارسی',
  'ga': 'Gaeilge',
  'hr': 'Hrvatski',
  'hu': 'Magyar',
  'ml': 'മലയാളം',
  'no': 'Norsk',
  'ro': 'Română',
  'sk': 'Slovenčina',
  'sl': 'Slovenščina',
  'sr': 'Српски'
};

import { useTranslations } from 'next-intl';

export default function Footer() {
  const tFooter = useTranslations('Footer');
  const tTools = useTranslations('Tools');
  const tHero = useTranslations('Hero');

  const columns = [
    {
      title: tFooter('popular'),
      links: [
        { href: '/merge-pdf', label: tTools('merge-pdf.name') },
        { href: '/split-pdf', label: tTools('split-pdf.name') },
        { href: '/compress-pdf', label: tTools('compress-pdf.name') },
        { href: '/rotate-pdf', label: tTools('rotate-pdf.name') },
        { href: '/remove-pages', label: tTools('remove-pages.name') },
        { href: '/organize-pdf', label: tTools('organize-pdf.name') },
      ],
    },
    {
      title: tFooter('convert'),
      links: [
        { href: '/pdf-to-word', label: tTools('pdf-to-word.name') },
        { href: '/pdf-to-excel', label: tTools('pdf-to-excel.name') },
        { href: '/pdf-to-jpg', label: tTools('pdf-to-jpg.name') },
        { href: '/pdf-to-ppt', label: tTools('pdf-to-ppt.name') },
        { href: '/word-to-pdf', label: tTools('word-to-pdf.name') },
        { href: '/jpg-to-pdf', label: tTools('jpg-to-pdf.name') },
        { href: '/excel-to-pdf', label: tTools('excel-to-pdf.name') },
      ],
    },
    {
      title: tFooter('about'),
      links: [
        { href: '/about', label: tFooter('about_us') },
        { href: '/contact', label: tFooter('contact') },
        { href: '/blog', label: tFooter('blog') },
        { href: '/faq', label: tFooter('faq') },
      ],
    },
    {
      title: tFooter('legal'),
      links: [
        { href: '/terms', label: tFooter('terms') },
        { href: '/privacy', label: tFooter('privacy') },
        { href: '/privacy', label: tFooter('cookies') },
      ],
    },
  ];

  const locale = useLocale();
  const selectedLang = CODE_TO_LANG[locale] || 'Français';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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

  const selectLanguage = (langName: string) => {
    const code = LANGUAGE_CODES[langName];
    if (code && code !== locale) {
      router.replace(pathname, { locale: code });
    }
    setIsOpen(false);
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 40,
            paddingBottom: 48,
          }}
        >
          {/* Brand column */}
          <div>
            <Link prefetch={false} href="/" style={{ textDecoration: 'none' }}>
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
              {tHero('subtitle')}
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
                  className="footer-social-btn"
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
                    transition: 'background .2s, border-color .2s, transform .2s, color .2s',
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
              © {new Date().getFullYear()} iLoveDoc. {tFooter('rights')}
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
                    maxHeight: '60vh',
                    overflowY: 'auto',
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
      <style jsx>{`
        .footer-social-btn:hover {
          color: #fff !important;
          background: rgba(167,139,250,0.15) !important;
          border-color: rgba(167,139,250,0.4) !important;
          transform: translateY(-3px);
        }
      `}</style>
    </footer>
  );
}
