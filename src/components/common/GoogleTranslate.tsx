'use client';

import React, { useEffect, useRef } from 'react';

// Module-level flag to prevent double-initialization across hot reloads
let translateInitialized = false;

export default function GoogleTranslate() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If already initialized, skip entirely
    if (translateInitialized) return;

    // Global callback required by Google Translate script
    (window as any).googleTranslateElementInit = function() {
      try {
        // Double-check: don't re-create if the widget already exists inside our container
        if (translateInitialized) return;
        if (containerRef.current && containerRef.current.childElementCount > 0) {
          translateInitialized = true;
          return;
        }

        if ((window as any).google && (window as any).google.translate) {
          new (window as any).google.translate.TranslateElement({
            pageLanguage: 'fr',
            includedLanguages: 'en,es,fr,de,it,pt,ja,ru,ko,zh-CN,zh-TW,ar,bg,ca,nl,el,hi,id,ms,pl,sv,th,tr,uk,vi,sw',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
          translateInitialized = true;
        }
      } catch (e) {
        console.error('Google Translate Init error:', e);
      }
    };

    // Dynamically insert the Google Translate JS bundle (once)
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // No cleanup — Google Translate modifies the DOM globally and
    // trying to tear it down causes more flickering than leaving it.
  }, []);

  return (
    <div 
      id="google_translate_element"
      ref={containerRef}
      style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }} 
      suppressHydrationWarning
    />
  );
}

