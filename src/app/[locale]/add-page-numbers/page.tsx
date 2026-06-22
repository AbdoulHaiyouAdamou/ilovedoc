'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { addPageNumbersToPDF, PageNumberPosition, PageNumberFormat } from '@/features/pdf/pageNumbers';
import { getPdfPageCount } from '@/features/pdf/split';
import { ArrowRight } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const ACCENT = '#8b5cf6';
const ACCENT_DARK = '#7c3aed';

const POSITIONS: { key: PageNumberPosition; row: number; col: number }[] = [
  { key: 'top-left', row: 0, col: 0 },
  { key: 'top-center', row: 0, col: 1 },
  { key: 'top-right', row: 0, col: 2 },
  { key: 'bottom-left', row: 1, col: 0 },
  { key: 'bottom-center', row: 1, col: 1 },
  { key: 'bottom-right', row: 1, col: 2 },
];

export default function AddPageNumbersPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file,
    isProcessing,
    progress,
    resultUrl,
    error,
    phase,
    onDrop,
    reset,
    startProcessing,
    finishProcessing,
    failProcessing,
    setProgress,
  } = useToolState();

  const [totalPages, setTotalPages] = useState<number>(1);
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [format, setFormat] = useState<PageNumberFormat>('page');
  const [startFrom, setStartFrom] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [pageFrom, setPageFrom] = useState(1);
  const [pageTo, setPageTo] = useState(1);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
        try {
          const count = await getPdfPageCount(acceptedFiles[0]);
          setTotalPages(count);
          setPageFrom(1);
          setPageTo(count);
        } catch {
          failProcessing('Impossible de lire ce fichier PDF.');
        }
      }
    },
    [onDrop, failProcessing]
  );

  const handleProcess = useCallback(async () => {
    if (!file) return;
    startProcessing();
    try {
      const resultBytes = await addPageNumbersToPDF(file, {
        position,
        format,
        fontSize,
        startFrom,
        margin: 30,
        pageRange: { from: pageFrom, to: pageTo },
        onProgress: (p) => setProgress(p),
      });
      const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
    } catch (err: any) {
      failProcessing(err.message || "Une erreur est survenue lors de la numérotation.");
    }
  }, [file, position, format, fontSize, startFrom, pageFrom, pageTo, startProcessing, finishProcessing, failProcessing, setProgress]);

  const handleReset = () => {
    reset();
    setPosition('bottom-center');
    setFormat('page');
    setStartFrom(1);
    setFontSize(12);
    setPageFrom(1);
    setPageTo(1);
  };

  const getDotStyle = (): React.CSSProperties => {
    const dotSize = 14;
    const dotMargin = 16;
    const base: React.CSSProperties = {
      position: 'absolute',
      width: `${dotSize}px`,
      height: `${dotSize}px`,
      borderRadius: '50%',
      backgroundColor: '#ef4444',
      boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.2)',
      transition: 'all 0.3s ease',
    };
    if (position.startsWith('top')) {
      base.top = `${dotMargin}px`;
    } else {
      base.bottom = `${dotMargin}px`;
    }
    if (position.endsWith('left')) {
      base.left = `${dotMargin}px`;
    } else if (position.endsWith('right')) {
      base.right = `${dotMargin}px`;
    } else {
      base.left = `calc(50% - ${dotSize / 2}px)`;
    }
    return base;
  };

  const workspacePreview = file && (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div
        style={{
          width: '350px',
          height: '495px',
          background: 'var(--glass-bg)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: '4px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div style={{ width: '70%', height: '14px', background: 'var(--color-text-tertiary)', opacity: 0.15, borderRadius: '4px', marginBottom: '1.2rem' }} />
        <div style={{ width: '100%', height: '8px', background: 'var(--color-text-tertiary)', opacity: 0.1, borderRadius: '3px', marginBottom: '8px' }} />
        <div style={{ width: '95%', height: '8px', background: 'var(--color-text-tertiary)', opacity: 0.1, borderRadius: '3px', marginBottom: '8px' }} />
        <div style={{ width: '85%', height: '8px', background: 'var(--color-text-tertiary)', opacity: 0.1, borderRadius: '3px', marginBottom: '8px' }} />
        <div style={{ width: '90%', height: '8px', background: 'var(--color-text-tertiary)', opacity: 0.1, borderRadius: '3px', marginBottom: '16px' }} />
        <div style={{ width: '100%', height: '8px', background: 'var(--color-text-tertiary)', opacity: 0.1, borderRadius: '3px', marginBottom: '8px' }} />
        <div style={{ width: '75%', height: '8px', background: 'var(--color-text-tertiary)', opacity: 0.1, borderRadius: '3px', marginBottom: '8px' }} />
        <div style={{ width: '80%', height: '8px', background: 'var(--color-text-tertiary)', opacity: 0.1, borderRadius: '3px', marginBottom: '16px' }} />
        <div style={{ width: '60%', height: '14px', background: 'var(--color-text-tertiary)', opacity: 0.15, borderRadius: '4px', marginBottom: '1.2rem' }} />
        <div style={{ width: '100%', height: '8px', background: 'var(--color-text-tertiary)', opacity: 0.1, borderRadius: '3px', marginBottom: '8px' }} />
        <div style={{ width: '92%', height: '8px', background: 'var(--color-text-tertiary)', opacity: 0.1, borderRadius: '3px', marginBottom: '8px' }} />
        <div style={getDotStyle()} />
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
        {file.name} — {totalPages} page{totalPages > 1 ? 's' : ''}
      </p>
    </div>
  );

  const workspaceSidebar = (
    <>
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
          Position :
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            width: '180px',
            height: '100px',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {POSITIONS.map((pos) => {
            const isActive = position === pos.key;
            return (
              <div
                key={pos.key}
                onClick={() => setPosition(pos.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRight: pos.col < 2 ? '1px solid var(--glass-border)' : 'none',
                  borderBottom: pos.row === 0 ? '1px solid var(--glass-border)' : 'none',
                  background: isActive ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#ef4444' : 'transparent',
                    border: isActive ? 'none' : '2px solid var(--glass-border)',
                    transition: 'all 0.2s',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
          Format :
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as PageNumberFormat)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.95rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="page">1</option>
          <option value="pageOfTotal">Page 1 sur 5</option>
          <option value="dash">- 1 -</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
          Commencer à partir de la page :
        </label>
        <input
          type="number"
          min={1}
          value={startFrom}
          onChange={(e) => setStartFrom(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            width: '80px',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.95rem',
            textAlign: 'center',
            outline: 'none',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
          Taille de police :
        </label>
        <input
          type="number"
          min={6}
          max={72}
          value={fontSize}
          onChange={(e) => setFontSize(Math.max(6, Math.min(72, parseInt(e.target.value) || 12)))}
          style={{
            width: '80px',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.95rem',
            textAlign: 'center',
            outline: 'none',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
          Pages :
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)' }}>de la page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageFrom}
            onChange={(e) => setPageFrom(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
            className="interval-input"
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)' }}>à</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={pageTo}
            onChange={(e) => setPageTo(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || totalPages)))}
            className="interval-input"
          />
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      slug="add-page-numbers"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={handleReset}
      onDrop={handleDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Numérotation en cours..."
      successMessage="Les numéros de pages ont été ajoutés !"
      successSubtitle="Votre document est prêt au téléchargement."
      actionLabel="Numéroter les pages"
      onAction={handleProcess}
      seoSection={
        <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment ajouter des numéros de pages à un PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez votre fichier PDF ou glissez-déposez-le dans la zone ci-dessus.</li>
            <li>Choisissez la position, le format et la taille de police des numéros de pages.</li>
            <li>Définissez la plage de pages à numéroter et le numéro de départ.</li>
            <li>Cliquez sur « Numéroter les pages » pour appliquer les modifications.</li>
            <li>Téléchargez votre fichier PDF numéroté instantanément.</li>
          </ol>
        </section>
      }
    />
  );
}
