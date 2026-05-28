'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { addPageNumbersToPDF, PageNumberPosition, PageNumberFormat } from '@/features/pdf/pageNumbers';
import { getPdfPageCount } from '@/features/pdf/split';
import { ArrowRight, Download, RotateCcw } from 'lucide-react';

const ACCENT = '#8b5cf6';
const ACCENT_SHADOW = 'rgba(139, 92, 246, 0.4)';
const ACCENT_LIGHT = 'rgba(139, 92, 246, 0.08)';

const POSITIONS: { key: PageNumberPosition; row: number; col: number }[] = [
  { key: 'top-left', row: 0, col: 0 },
  { key: 'top-center', row: 0, col: 1 },
  { key: 'top-right', row: 0, col: 2 },
  { key: 'bottom-left', row: 1, col: 0 },
  { key: 'bottom-center', row: 1, col: 1 },
  { key: 'bottom-right', row: 1, col: 2 },
];

export default function AddPageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Options
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [format, setFormat] = useState<PageNumberFormat>('page');
  const [startFrom, setStartFrom] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [pageFrom, setPageFrom] = useState(1);
  const [pageTo, setPageTo] = useState(1);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
        setPageFrom(1);
        setPageTo(count);
      } catch {
        setError('Impossible de lire ce fichier PDF.');
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

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
      const name = `${file.name.replace(/\.pdf$/i, '')}_numerote.pdf`;
      setResultUrl(url);
      setResultFileName(name);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la numérotation.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultUrl(null);
    setResultFileName('');
    setError(null);
    setProgress(0);
    setPosition('bottom-center');
    setFormat('page');
    setStartFrom(1);
    setFontSize(12);
    setPageFrom(1);
    setPageTo(1);
  };

  // ─── State 1: No file selected ───────────────────────────────
  if (!file) {
    return (
      <>
        <SEO slug="add-page-numbers" />
      <Header />
        <main className="tool-page-layout" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            minHeight: 'calc(100vh - 70px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              Ajouter des numéros de pages
            </h1>
            <p style={{
              fontSize: '1.3rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '3rem',
              maxWidth: '800px',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              Numérotez facilement les pages de vos documents PDF avec un positionnement et un format personnalisés.
            </p>

            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: ACCENT,
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: `0 10px 25px ${ACCENT_SHADOW}`,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Sélectionner le fichier PDF
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>
                ou déposez le PDF ici
              </p>
            </div>
          </div>

          {/* Below the fold: SEO and Ads */}
          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />

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

            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── State 3: Processing / Result ────────────────────────────
  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            {isProcessing ? (
              <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <h2>Numérotation en cours...</h2>
                <div className="progress-container" style={{ marginTop: '2rem' }}>
                  <div className="progress">
                    <div
                      className="progress-bar gradient-bg"
                      style={{
                        width: `${progress}%`,
                        backgroundImage: `linear-gradient(to right, ${ACCENT}, #a78bfa)`
                      }}
                    />
                  </div>
                  <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
                </div>
              </div>
            ) : (
              <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <h2>🎉 Les numéros de pages ont été ajoutés !</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                  Votre document est prêt au téléchargement.
                </p>
                <a
                  href={resultUrl!}
                  download={resultFileName}
                  className="btn btn-primary btn-xl gradient-bg"
                  style={{
                    backgroundColor: ACCENT,
                    borderColor: ACCENT,
                    backgroundImage: `linear-gradient(to right, ${ACCENT}, #a78bfa)`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Download size={20} /> Télécharger le PDF
                </a>
                <div style={{ marginTop: '2rem' }}>
                  <button
                    className="btn btn-outline"
                    onClick={handleReset}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <RotateCcw size={16} /> Numéroter un autre fichier
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── State 2: Workspace ──────────────────────────────────────
  // Helper: compute dot position on the preview card
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

    // vertical
    if (position.startsWith('top')) {
      base.top = `${dotMargin}px`;
    } else {
      base.bottom = `${dotMargin}px`;
    }

    // horizontal
    if (position.endsWith('left')) {
      base.left = `${dotMargin}px`;
    } else if (position.endsWith('right')) {
      base.right = `${dotMargin}px`;
    } else {
      base.left = `calc(50% - ${dotSize / 2}px)`;
    }

    return base;
  };

  return (
    <>
      <Header />

      <div className="workspace">
        {/* ── LEFT: Document preview ── */}
        <div className="workspace-preview">
          {/* Large fake PDF page */}
          <div style={{
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
          }}>
            {/* Fake document content lines */}
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

            {/* Position indicator dot */}
            <div style={getDotStyle()} />
          </div>

          {/* File name label */}
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
            {file.name} — {totalPages} page{totalPages > 1 ? 's' : ''}
          </p>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>
              Numéroter les pages
            </h2>
          </div>

          <div className="workspace-sidebar-content">
            {/* ── Position grid (3×2) ── */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                Position :
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                width: '180px',
                height: '100px',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
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
                        background: isActive ? ACCENT_LIGHT : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#ef4444' : 'transparent',
                        border: isActive ? 'none' : '2px solid var(--glass-border)',
                        transition: 'all 0.2s',
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Format dropdown ── */}
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

            {/* ── Start from ── */}
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

            {/* ── Font size ── */}
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

            {/* ── Page range ── */}
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
          </div>

          {/* ── Footer with action button ── */}
          <div className="workspace-sidebar-footer">
            {error && (
              <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{error}</div>
            )}
            <button
              className="btn"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1.2rem',
                padding: '1.2rem',
                fontWeight: 'bold',
                backgroundColor: ACCENT,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: `0 4px 10px ${ACCENT_SHADOW}`,
                transition: 'transform 0.1s',
              }}
              onClick={handleProcess}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Numéroter les pages <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
