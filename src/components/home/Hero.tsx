'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles, Lock, Cpu } from 'lucide-react';

const filesData = [
  // Left side
  { type: 'PDF', icon: '📄', color: '#ef4444', side: 'left', x: 4, top: 15 },
  { type: 'DOC', icon: '📝', color: '#2563eb', side: 'left', x: 16, top: 25 },
  { type: 'XLS', icon: '📊', color: '#16a34a', side: 'left', x: 8, top: 45 },
  { type: 'IMG', icon: '🖼️', color: '#9333ea', side: 'left', x: 18, top: 60 },
  { type: 'PDF', icon: '📄', color: '#ef4444', side: 'left', x: 6, top: 75 },
  { type: 'ZIP', icon: '📁', color: '#d97706', side: 'left', x: 14, top: 82 },

  // Right side
  { type: 'PDF', icon: '📄', color: '#ef4444', side: 'right', x: 5, top: 20 },
  { type: 'IMG', icon: '🖼️', color: '#9333ea', side: 'right', x: 15, top: 32 },
  { type: 'PDF', icon: '📄', color: '#ef4444', side: 'right', x: 7, top: 50 },
  { type: 'XLS', icon: '📊', color: '#16a34a', side: 'right', x: 17, top: 68 },
  { type: 'DOC', icon: '📝', color: '#2563eb', side: 'right', x: 9, top: 80 },
];

import { useTranslations } from 'next-intl';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('Hero');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous dynamic elements just in case
    const existingCards = container.querySelectorAll('.floating-file-card');
    existingCards.forEach(c => c.remove());

    const createdElements: HTMLDivElement[] = [];

    filesData.forEach((file) => {
      const card = document.createElement('div');
      card.className = 'floating-file-card';

      // Random variations
      const rotOffset = Math.random() * 24 - 12; // -12 to 12
      const opacVal = Math.random() * 0.3 + 0.5; // 0.5 to 0.8
      const durVal = Math.random() * 1.7 + 4.8; // 4.8 to 6.5
      const delayVal = Math.random() * 3; // 0 to 3
      const xOffset = Math.random() * 4 - 2; // -2 to 2
      const yOffset = Math.random() * 8 - 4; // -4 to 4

      const finalX = Math.max(1, file.x + xOffset);
      const finalY = Math.max(5, Math.min(90, file.top + yOffset));

      card.style.top = `${finalY}%`;
      if (file.side === 'left') {
        card.style.left = `${finalX}%`;
      } else {
        card.style.right = `${finalX}%`;
      }

      card.style.setProperty('--rot', `${rotOffset}deg`);
      card.style.setProperty('--opac', `${opacVal}`);
      card.style.setProperty('--dur', `${durVal}s`);
      card.style.setProperty('--delay', `${delayVal}s`);

      card.style.opacity = '0';
      card.style.animation = `fadeInFile 1.2s ease forwards, floatFile ${durVal}s ease-in-out ${delayVal}s infinite`;

      // Build inner layout
      card.innerHTML = `
        <div class="floating-file-card-fold"></div>
        <span style="font-size: 18px; margin-bottom: 2px; display: inline-block;">${file.icon}</span>
        <span style="background: ${file.color}; color: white; font-size: 8px; font-weight: 800; padding: 1.5px 5px; border-radius: 4px; text-transform: uppercase; margin-bottom: 4px; display: inline-block; line-height: 1; letter-spacing: 0.5px;">
          ${file.type}
        </span>
        <div style="height: 3px; background: rgba(255,255,255,0.18); border-radius: 2px; width: 85%; margin-bottom: 2px;"></div>
        <div style="height: 3px; background: rgba(255,255,255,0.18); border-radius: 2px; width: 60%; margin-bottom: 2px;"></div>
        <div style="height: 3px; background: rgba(255,255,255,0.18); border-radius: 2px; width: 75%;"></div>
      `;

      container.appendChild(card);
      createdElements.push(card);
    });

    // Cleanup function to remove elements on unmount
    return () => {
      createdElements.forEach(el => el.remove());
    };
  }, []);

  return (
    <section className="hero gradient-bg" ref={containerRef}>
      <div className="container" style={{ position: 'relative', zIndex: 5 }}>
        <div className="hero-content">
          <h1 className="hero-title hero-title-shimmer">
            {t('title')}
          </h1>
          <p className="hero-subtitle">
            {t('subtitle')}
          </p>
          <div className="hero-stats">
            <span className="badge"><Sparkles size={16} /> 46 Outils</span>
            <span className="badge"><Lock size={16} /> Vie Privée Garantie</span>
            <span className="badge"><Cpu size={16} /> Traitement Local</span>
          </div>
        </div>
      </div>
    </section>
  );
}
