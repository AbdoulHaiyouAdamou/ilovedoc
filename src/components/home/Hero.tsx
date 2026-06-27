import React from 'react';
import { Sparkles, Lock, Cpu } from 'lucide-react';
import { useTranslations } from 'next-intl';

const filesData = [
  // Left side
  { type: 'PDF', icon: '📄', color: '#ef4444', side: 'left', x: 4.5, top: 16, rot: -5.3, opac: 0.65, dur: 5.2, delay: 0.4 },
  { type: 'DOC', icon: '📝', color: '#2563eb', side: 'left', x: 15.2, top: 27, rot: 8.1, opac: 0.72, dur: 6.1, delay: 1.2 },
  { type: 'XLS', icon: '📊', color: '#16a34a', side: 'left', x: 7.8, top: 46, rot: -11.2, opac: 0.55, dur: 4.9, delay: 2.1 },
  { type: 'IMG', icon: '🖼️', color: '#9333ea', side: 'left', x: 17.5, top: 58, rot: 3.4, opac: 0.78, dur: 5.8, delay: 0.7 },
  { type: 'PDF', icon: '📄', color: '#ef4444', side: 'left', x: 5.9, top: 76, rot: -2.1, opac: 0.61, dur: 6.4, delay: 1.8 },
  { type: 'ZIP', icon: '📁', color: '#d97706', side: 'left', x: 13.8, top: 83, rot: 10.5, opac: 0.69, dur: 5.5, delay: 2.5 },

  // Right side
  { type: 'PDF', icon: '📄', color: '#ef4444', side: 'right', x: 5.5, top: 21, rot: 6.2, opac: 0.58, dur: 5.1, delay: 0.2 },
  { type: 'IMG', icon: '🖼️', color: '#9333ea', side: 'right', x: 14.8, top: 31, rot: -8.7, opac: 0.75, dur: 6.3, delay: 1.5 },
  { type: 'PDF', icon: '📄', color: '#ef4444', side: 'right', x: 7.2, top: 51, rot: 1.8, opac: 0.63, dur: 5.7, delay: 2.8 },
  { type: 'XLS', icon: '📊', color: '#16a34a', side: 'right', x: 16.5, top: 67, rot: -9.4, opac: 0.71, dur: 4.8, delay: 0.9 },
  { type: 'DOC', icon: '📝', color: '#2563eb', side: 'right', x: 8.9, top: 81, rot: 4.5, opac: 0.66, dur: 6.0, delay: 1.7 },
];

export default function Hero() {
  const t = useTranslations('Hero');

  return (
    <section className="hero gradient-bg">
      <div className="container" style={{ position: 'relative', zIndex: 5 }}>
        <div className="hero-content">
          <h1 className="hero-title hero-title-shimmer">
            {t('title')}
          </h1>
          <p className="hero-subtitle">
            {t('subtitle')}
          </p>
          <div className="hero-stats">
            <span className="badge"><Sparkles size={16} /> {t('badge_tools')}</span>
            <span className="badge"><Lock size={16} /> {t('badge_privacy')}</span>
            <span className="badge"><Cpu size={16} /> {t('badge_local')}</span>
          </div>
        </div>
      </div>

      {filesData.map((file, i) => (
        <div
          key={i}
          className="floating-file-card"
          style={{
            top: `${file.top}%`,
            [file.side]: `${file.x}%`,
            opacity: 0,
            animation: `fadeInFile 1.2s ease forwards, floatFile ${file.dur}s ease-in-out ${file.delay}s infinite`,
            ...( {
              '--rot': `${file.rot}deg`,
              '--opac': file.opac,
              '--dur': `${file.dur}s`,
              '--delay': `${file.delay}s`
            } as React.CSSProperties)
          }}
        >
          <div className="floating-file-card-fold"></div>
          <span style={{ fontSize: 18, marginBottom: 2, display: 'inline-block' }}>{file.icon}</span>
          <span style={{ background: file.color, color: 'white', fontSize: 8, fontWeight: 800, padding: '1.5px 5px', borderRadius: 4, textTransform: 'uppercase', marginBottom: 4, display: 'inline-block', lineHeight: 1, letterSpacing: 0.5 }}>
            {file.type}
          </span>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.18)', borderRadius: 2, width: '85%', marginBottom: 2 }}></div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.18)', borderRadius: 2, width: '60%', marginBottom: 2 }}></div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.18)', borderRadius: 2, width: '75%' }}></div>
        </div>
      ))}
    </section>
  );
}
