'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

const sizeMap: Record<string, React.CSSProperties> = {
  horizontal: { minHeight: 90, width: '100%' },
  rectangle: { minHeight: 250, width: '100%', maxWidth: 336 },
  vertical: { minHeight: 600, width: '100%', maxWidth: 160 },
};

export default function AdUnit({ slot, format = 'horizontal', className }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (!isProduction) return;
    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense may not be loaded yet
    }
  }, [isProduction]);

  const sizes = sizeMap[format] || sizeMap.horizontal;

  /* ---- Development placeholder ---- */
  if (!isProduction) {
    return (
      <div
        className={className}
        style={{
          ...sizes,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'repeating-linear-gradient(135deg, rgba(99,69,215,0.03) 0px, rgba(99,69,215,0.03) 10px, transparent 10px, transparent 20px)',
          border: '1.5px dashed rgba(99,69,215,0.15)',
          borderRadius: 12,
          color: 'rgba(99,69,215,0.35)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.04em',
          margin: '16px auto',
        }}
      >
        Publicité — {format} ({slot})
      </div>
    );
  }

  /* ---- Production: real AdSense ---- */
  return (
    <div className={className} style={{ margin: '16px auto', textAlign: 'center' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...sizes }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PID || ''}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
