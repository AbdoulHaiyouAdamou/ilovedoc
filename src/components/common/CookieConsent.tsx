'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const CONSENT_KEY = 'ilovedoc-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Show banner after a short delay for smooth entrance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
    // Apply stored consent on load
    applyConsent(stored === 'granted');
  }, []);

  const applyConsent = (granted: boolean) => {
    const status = granted ? 'granted' : 'denied';

    // Google Consent Mode v2
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: status,
        ad_user_data: status,
        ad_personalization: status,
        analytics_storage: granted ? 'granted' : 'denied',
      });
    }
  };

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'granted');
    applyConsent(true);
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, 'denied');
    applyConsent(false);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        opacity: visible ? 1 : 0,
        transition: 'transform .5s cubic-bezier(.4,0,.2,1), opacity .4s',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto 16px',
          padding: '22px 28px',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: 18,
          border: '1px solid rgba(99,69,215,0.1)',
          boxShadow: '0 -4px 40px rgba(99,69,215,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap' as const,
        }}
      >
        {/* Icon */}
        <span style={{ fontSize: 28, flexShrink: 0 }}>🍪</span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--text-primary, #1a1a2e)',
            }}
          >
            Nous utilisons des cookies pour améliorer votre expérience et afficher des publicités
            pertinentes. En cliquant sur &laquo;&nbsp;Accepter&nbsp;&raquo;, vous consentez à
            l&apos;utilisation de cookies conformément à notre{' '}
            <a
              href="/politique-confidentialite"
              style={{
                color: 'var(--primary, #6345d7)',
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              politique de confidentialité
            </a>
            .
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={handleReject}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '1.5px solid rgba(99,69,215,0.2)',
              background: 'transparent',
              color: 'var(--text-secondary, #555)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'border-color .2s, color .2s',
              fontFamily: 'inherit',
            }}
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #6345d7, #8b5cf6)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform .15s, box-shadow .2s',
              boxShadow: '0 4px 16px rgba(99,69,215,0.25)',
              fontFamily: 'inherit',
            }}
          >
            Accepter
          </button>
        </div>
      </div>

      {/* Dark mode overrides */}
      <style jsx>{`
        [data-theme='dark'] div[role='dialog'] > div {
          background: rgba(26, 26, 46, 0.88) !important;
          border-color: rgba(167, 139, 250, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
