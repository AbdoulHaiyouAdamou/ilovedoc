'use client';

import React, { useEffect, useState } from 'react';

export default function GoogleTranslate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Global callback required by Google Translate script
    (window as any).googleTranslateElementInit = function() {
      try {
        if ((window as any).google && (window as any).google.translate) {
          new (window as any).google.translate.TranslateElement({
            pageLanguage: 'fr',
            includedLanguages: 'en,es,fr,de,it,pt,ja,ru,ko,zh-CN,zh-TW,ar,bg,ca,nl,el,hi,id,ms,pl,sv,th,tr,uk,vi,sw',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
        }
      } catch (e) {
        console.error('Google Translate Init error:', e);
      }
    };

    // Dynamically insert the Google Translate JS bundle
    const scriptId = 'google-translate-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      // If script was already loaded, manually trigger the init function
      if (typeof (window as any).googleTranslateElementInit === 'function') {
        (window as any).googleTranslateElementInit();
      }
    }
  }, []);

  return (
    <div 
      id="google_translate_element" 
      style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }} 
      suppressHydrationWarning
    />
  );
}
