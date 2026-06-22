'use client';

import React from 'react';

interface ToolProgressProps {
  progress: number;
  label: string;
  accentColor: string;
  accentColorDark?: string;
}

export default function ToolProgress({
  progress,
  label,
  accentColor,
  accentColorDark,
}: ToolProgressProps) {
  const gradientEnd = accentColorDark || accentColor;

  return (
    <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>{label}</h2>
      <div className="progress-container" style={{ marginTop: '2rem' }}>
        <div className="progress">
          <div
            className="progress-bar gradient-bg"
            style={{
              width: `${progress}%`,
              backgroundImage: `linear-gradient(to right, ${accentColor}, ${gradientEnd})`,
            }}
          />
        </div>
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
      </div>
    </div>
  );
}
