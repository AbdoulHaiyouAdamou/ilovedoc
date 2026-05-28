'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Heart, Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';
import { tools, toolCategories, getToolsByCategory } from '@/config/tools';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [convertirOpen, setConvertirOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const convertirRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const convertirTimeout = useRef<NodeJS.Timeout | null>(null);
  const megaMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  /* ---- scroll listener ---- */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---- dark mode persistence ---- */
  useEffect(() => {
    const stored = localStorage.getItem('ilovedoc-dark');
    let isDark = false;
    if (stored === 'true') {
      isDark = true;
    } else if (stored === 'false') {
      isDark = false;
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.cookie = "ilovedoc-theme=dark; path=/; max-age=31536000";
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.cookie = "ilovedoc-theme=light; path=/; max-age=31536000";
    }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.add('theme-transition');
    if (next) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.cookie = "ilovedoc-theme=dark; path=/; max-age=31536000";
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.cookie = "ilovedoc-theme=light; path=/; max-age=31536000";
    }
    localStorage.setItem('ilovedoc-dark', String(next));
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 500);
  };

  /* ---- close dropdowns on outside click ---- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (convertirRef.current && !convertirRef.current.contains(e.target as Node)) {
        setConvertirOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openConvertir = () => {
    if (convertirTimeout.current) clearTimeout(convertirTimeout.current);
    setConvertirOpen(true);
  };
  const closeConvertir = () => {
    convertirTimeout.current = setTimeout(() => setConvertirOpen(false), 200);
  };
  const openMegaMenu = () => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setMegaMenuOpen(true);
  };
  const closeMegaMenu = () => {
    megaMenuTimeout.current = setTimeout(() => setMegaMenuOpen(false), 200);
  };

  const convertirItems = [
    ...getToolsByCategory('convert-to'),
    ...getToolsByCategory('convert-from')
  ].slice(0, 8); // Just show a few in the simple dropdown

  return (
    <>
      <header
        className="header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          transition: 'background .3s, box-shadow .3s, backdrop-filter .3s',
          background: isScrolled
            ? 'var(--glass-bg)'
            : 'var(--color-surface)',
          backdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
          boxShadow: isScrolled ? '0 2px 24px rgba(99,69,215,0.08)' : 'none',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <nav
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            height: 64,
          }}
        >
          {/* ---- Logo ---- */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                letterSpacing: '-0.5px',
              }}
            >
              i<Heart size={24} fill="#e44d7b" color="#e44d7b" style={{ margin: '0 2px' }} />Doc
            </span>
          </Link>

          {/* ---- Desktop Nav ---- */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            className="header-desktop-nav"
          >
            <Link href="/merge-pdf" className="header-nav-link" style={{ textDecoration: 'none', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', padding: '8px 14px', borderRadius: 8, transition: 'color .2s, background .2s', letterSpacing: '0.02em' }}>
              FUSIONNER PDF
            </Link>
            <Link href="/split-pdf" className="header-nav-link" style={{ textDecoration: 'none', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', padding: '8px 14px', borderRadius: 8, transition: 'color .2s, background .2s', letterSpacing: '0.02em' }}>
              DIVISER PDF
            </Link>
            <Link href="/compress-pdf" className="header-nav-link" style={{ textDecoration: 'none', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', padding: '8px 14px', borderRadius: 8, transition: 'color .2s, background .2s', letterSpacing: '0.02em' }}>
              COMPRESSER PDF
            </Link>

            {/* ---- Convertir Dropdown ---- */}
            <div
              ref={convertirRef}
              style={{ position: 'relative' }}
            >
              <button
                onClick={() => setConvertirOpen((v) => !v)}
                className="header-nav-link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: convertirOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  padding: '8px 14px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'color .2s, background .2s',
                  letterSpacing: '0.02em',
                  fontFamily: 'inherit',
                }}
              >
                CONVERTIR PDF
                <ChevronDown size={14} style={{ transition: 'transform .2s', transform: convertirOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: `translateX(-50%) translateY(${convertirOpen ? '0' : '-8px'})`,
                  opacity: convertirOpen ? 1 : 0,
                  pointerEvents: convertirOpen ? 'auto' : 'none',
                  transition: 'opacity .25s, transform .25s',
                  background: 'var(--glass-bg-heavy)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 14,
                  boxShadow: '0 12px 40px rgba(99,69,215,0.15)',
                  border: '1px solid var(--color-border)',
                  padding: '10px 6px',
                  minWidth: 220,
                  marginTop: 6,
                  zIndex: 100,
                }}
              >
                {convertirItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${item.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 16px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: 'var(--color-text, #1a1a2e)',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'background .15s',
                    }}
                    onClick={() => setConvertirOpen(false)}
                    className="dropdown-item"
                  >
                    <item.icon size={18} color={item.color[0]} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* ---- Mega-menu: Tous les outils ---- */}
            <div
              ref={megaMenuRef}
              style={{ position: 'relative' }}
            >
              <button
                onClick={() => setMegaMenuOpen((v) => !v)}
                className="header-nav-link"
                style={{
                  background: megaMenuOpen ? 'rgba(99,69,215,0.07)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: megaMenuOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  padding: '8px 14px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'color .2s, background .2s',
                  letterSpacing: '0.02em',
                  fontFamily: 'inherit',
                }}
              >
                TOUS LES OUTILS
                <ChevronDown size={14} style={{ transition: 'transform .2s', transform: megaMenuOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Mega-menu panel */}
              <div
                style={{
                  position: 'fixed',
                  left: '50%',
                  transform: `translateX(-50%) translateY(${megaMenuOpen ? '0' : '-12px'})`,
                  top: 64,
                  opacity: megaMenuOpen ? 1 : 0,
                  pointerEvents: megaMenuOpen ? 'auto' : 'none',
                  transition: 'opacity .3s, transform .3s',
                  background: 'var(--glass-bg-heavy)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  borderRadius: '0 0 20px 20px',
                  boxShadow: '0 20px 60px rgba(99,69,215,0.2)',
                  border: '1px solid var(--color-border)',
                  borderTop: 'none',
                  padding: '28px 36px 32px',
                  width: '100%',
                  maxWidth: 1300,
                  zIndex: 999,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 24,
                }}
              >
                {Object.entries(toolCategories).map(([key, cat]) => {
                  const catTools = getToolsByCategory(key as any);
                  if (catTools.length === 0) return null;
                  return (
                    <div key={key}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--primary, #6345d7)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <cat.icon size={16} />
                        {cat.label}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {catTools.map((t) => (
                          <Link
                            key={t.slug}
                            href={`/${t.slug}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '7px 10px',
                              borderRadius: 8,
                              textDecoration: 'none',
                              color: 'var(--color-text, #1a1a2e)',
                              fontSize: 14,
                              fontWeight: 500,
                              transition: 'background .15s, transform .15s',
                            }}
                            className="dropdown-item"
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            <t.icon size={16} color={t.color[0]} />
                            {t.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---- Right side: dark toggle + hamburger ---- */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="icon-btn"
              style={{
                background: 'none',
                border: '1.5px solid var(--border-color, rgba(99,69,215,0.15))',
                borderRadius: 10,
                width: 38,
                height: 38,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background .2s, border-color .2s, transform .2s',
                color: 'var(--color-text)',
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="header-hamburger icon-btn"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menu"
              style={{
                display: 'none', /* shown via media query */
                background: 'none',
                border: '1.5px solid var(--border-color, rgba(99,69,215,0.15))',
                borderRadius: 10,
                width: 38,
                height: 38,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text)',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* ---- Mega Menu Overlay ---- */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 11, 26, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 998,
          opacity: megaMenuOpen ? 1 : 0,
          pointerEvents: megaMenuOpen ? 'auto' : 'none',
          transition: 'opacity .3s',
        }}
        onClick={() => setMegaMenuOpen(false)}
      />

      {/* ---- Mobile Slide Menu ---- */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 998,
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
          transition: 'opacity .3s',
        }}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '85%',
          maxWidth: 360,
          height: '100dvh',
          background: 'var(--glass-bg, rgba(255,255,255,0.97))',
          backdropFilter: 'blur(24px)',
          zIndex: 999,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: mobileMenuOpen ? '-8px 0 40px rgba(99,69,215,0.12)' : 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text, #1a1a2e)',
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link href="/merge-pdf" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none' }}>FUSIONNER PDF</Link>
          <Link href="/split-pdf" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none' }}>DIVISER PDF</Link>
          <Link href="/compress-pdf" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none' }}>COMPRESSER PDF</Link>

          {Object.entries(toolCategories).map(([key, cat]) => {
            const catTools = getToolsByCategory(key as any);
            if (catTools.length === 0) return null;
            return (
              <div key={key} style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary, #6345d7)', textTransform: 'uppercase', padding: '0 16px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <cat.icon size={14} /> {cat.label}
                </div>
                {catTools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/${t.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      padding: '9px 16px',
                    }}
                  >
                    <t.icon size={15} color={t.color[0]} /> {t.name}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .header-desktop-nav { display: none !important; }
          .header-hamburger { display: flex !important; }
        }
        .header-nav-link:hover {
          color: var(--primary, #6345d7) !important;
          background: rgba(99,69,215,0.07) !important;
        }
        .dropdown-item:hover {
          background: rgba(99,69,215,0.07) !important;
          transform: translateX(4px);
        }
        .icon-btn:hover {
          background: rgba(99,69,215,0.07) !important;
          transform: rotate(15deg);
        }
        [data-theme='dark'] .header-nav-link:hover { color: #a78bfa !important; }
      `}</style>
    </>
  );
}
