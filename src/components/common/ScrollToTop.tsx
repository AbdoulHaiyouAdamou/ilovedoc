'use client';

import { useEffect } from 'react';

export default function ScrollToTop() {
  useEffect(() => {
    // Désactiver la restauration automatique du scroll du navigateur
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Forcer le défilement en haut au montage du composant
    window.scrollTo(0, 0);
  }, []);

  return null;
}
