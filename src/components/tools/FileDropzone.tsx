'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  accentColor: string;
  title: string;
  description: string;
  selectLabel: string;
  dropLabel?: string;
  onDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
}

export default function FileDropzone({
  accentColor,
  title,
  description,
  selectLabel,
  dropLabel,
  onDrop,
  accept = { 'application/pdf': ['.pdf'] },
  maxFiles = 1,
}: FileDropzoneProps) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept,
    maxFiles,
  });

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <h1 className="dropzone-title">
        {title}
      </h1>
      <p className="dropzone-desc">
        {description}
      </p>

      <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
        <input {...getInputProps()} />
        <button
          className="dropzone-btn"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 10px 25px ${accentColor}66`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 14px 35px ${accentColor}88`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 10px 25px ${accentColor}66`;
          }}
        >
          <Upload size={28} />
          {selectLabel}
        </button>
        {isDragActive && (
          <p style={{ marginTop: '1.5rem', color: accentColor, fontSize: '1.2rem', fontWeight: 600 }}>
            {'⬇ '}{dropLabel || 'Drop here'}
          </p>
        )}
        {!isDragActive && dropLabel && (
          <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>
            {dropLabel}
          </p>
        )}
      </div>
    </div>
  );
}
