'use client';

import React from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Download from 'lucide-react/dist/esm/icons/download';
import { useTranslations } from 'next-intl';

interface ToolResultProps {
  accentColor: string;
  accentColorDark?: string;
  successMessage: string;
  subtitle?: string;
  resultUrl: string;
  downloadName: string;
  resetLabel?: string;
  onReset: () => void;
}

export default function ToolResult({
  accentColor,
  accentColorDark,
  successMessage,
  subtitle,
  resultUrl,
  downloadName,
  resetLabel,
  onReset,
}: ToolResultProps) {
  const tCommon = useTranslations('Common');
  const gradientEnd = accentColorDark || accentColor;

  return (
    <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
      <div
        className="success-icon animation-bounce"
        style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}
      >
        <CheckCircle size={64} color={accentColor} />
      </div>
      <h2 style={{ marginBottom: '0.5rem' }}>{successMessage}</h2>
      {subtitle && (
        <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>{subtitle}</p>
      )}
      <a
        href={resultUrl}
        download={downloadName}
        className="btn btn-primary btn-xl"
        style={{
          backgroundColor: accentColor,
          borderColor: accentColor,
          backgroundImage: `linear-gradient(to right, ${accentColor}, ${gradientEnd})`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <Download size={24} /> {tCommon('download_file')}
      </a>
      <div style={{ marginTop: '0.8rem', fontSize: '13px', color: 'var(--color-text-tertiary)', fontWeight: 'bold' }}>
        {downloadName}
      </div>
      <div style={{ marginTop: '2rem' }}>
        <button className="btn btn-outline" onClick={onReset}>
          {resetLabel || tCommon('process_another')}
        </button>
      </div>
    </div>
  );
}
