'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { rotatePDFPages, PageRotationMap, RotationDegrees } from '@/features/pdf/rotate';
import { getPdfPageCount } from '@/features/pdf/split';
import { RotateCw, RotateCcw, ArrowRight, RefreshCw, CheckCircle, Info } from 'lucide-react';

const ACCENT = '#0ea5e9';
const ACCENT_DARK = '#0284c7';
const ACCENT_GRADIENT = `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})`;

export default function RotatePDFPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<PageRotationMap>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      setPageRotations({});
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
      } catch {
        setError("Impossible de lire ce PDF. Il est peut-être corrompu.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  /** Rotate a single page by 90° clockwise */
  const rotateSinglePage = (pageIndex: number) => {
    setPageRotations(prev => {
      const current = (prev[pageIndex] || 0) as number;
      const next = ((current + 90) % 360) as RotationDegrees;
      if (next === 0) {
        const copy = { ...prev };
        delete copy[pageIndex];
        return copy;
      }
      return { ...prev, [pageIndex]: next };
    });
  };

  /** Rotate ALL pages by +90 or -90 */
  const rotateAll = (direction: 90 | -90) => {
    setPageRotations(prev => {
      const updated: PageRotationMap = {};
      for (let i = 0; i < totalPages; i++) {
        const current = (prev[i] || 0) as number;
        const raw = (current + direction + 360) % 360;
        if (raw !== 0) {
          updated[i] = raw as RotationDegrees;
        }
      }
      return updated;
    });
  };

  const resetAll = () => setPageRotations({});

  const handleRotate = async () => {
    if (!file) return;

    const hasRotations = Object.keys(pageRotations).length > 0;
    if (!hasRotations) {
      setError("Aucune rotation appliquée. Faites pivoter au moins une page.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const modifiedBytes = await rotatePDFPages(file, pageRotations, {
        onProgress: (p) => setProgress(p)
      });

      const blob = new Blob([modifiedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_rotated.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la rotation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const rotatedCount = Object.keys(pageRotations).length;

  /** Get the rotation label to show on a page badge */
  const getRotationLabel = (pageIndex: number): string | null => {
    const deg = pageRotations[pageIndex];
    if (!deg) return null;
    return `${deg}°`;
  };

  // ─── State 1: No file selected ──────────────────────────
  if (!file) {
    return (
      <>
        <SEO slug="rotate-pdf" />
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
              Pivoter des pages PDF
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Faites pivoter les pages de votre document PDF à 90°, 180° ou 270°.
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
                boxShadow: `0 10px 25px rgba(14, 165, 233, 0.4)`,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Sélectionner le fichier PDF
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>ou déposez le PDF ici</p>
            </div>
          </div>

          {/* Below the fold: SEO and Ads */}
          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />

            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment pivoter un PDF</h2>
              <ol className="steps-list">
                <li>Sélectionnez votre fichier PDF ou glissez-déposez-le.</li>
                <li>Survolez une page et cliquez sur l&apos;icône de rotation pour la faire pivoter de 90°.</li>
                <li>Utilisez les boutons « Droite » ou « Gauche » pour pivoter toutes les pages en un clic.</li>
                <li>Cliquez sur « Faire pivoter PDF » pour télécharger votre document modifié.</li>
              </ol>
            </section>

            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── State 3: Processing / Result ──────────────────────
  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            {isProcessing ? (
              <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <h2>Rotation en cours...</h2>
                <div className="progress-container" style={{ marginTop: '2rem' }}>
                  <div className="progress">
                    <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: ACCENT_GRADIENT }}></div>
                  </div>
                  <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
                </div>
              </div>
            ) : (
              <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle size={64} color="#10b981" />
                </div>
                <h2>🎉 Les pages ont été pivotées !</h2>
                <p style={{ marginBottom: '2rem' }}>Votre document PDF modifié est prêt.</p>
                <a href={resultUrl!} download={`${file.name.replace('.pdf', '')}_rotated.pdf`} className="btn btn-primary btn-xl" style={{ backgroundColor: ACCENT, borderColor: ACCENT, backgroundImage: ACCENT_GRADIENT }}>
                  Télécharger le PDF
                </a>
                <div style={{ marginTop: '2rem' }}>
                  <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); }}>Traiter un autre fichier</button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── State 2: Workspace ─────────────────────────────────
  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
        {/* LEFT: Page grid */}
        <div className="workspace-preview" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '2rem', alignContent: 'start' }}>
          {Array.from({ length: totalPages }).map((_, i) => {
            const rotation = pageRotations[i] || 0;
            const isRotated = rotation !== 0;
            return (
              <div
                key={i}
                className="pdf-page-card"
                style={{
                  cursor: 'pointer',
                  width: '100%',
                  height: '220px',
                  border: isRotated ? `3px solid ${ACCENT}` : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                }}
              >
                {/* Rotation badge */}
                {isRotated && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    backgroundColor: ACCENT,
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    zIndex: 20,
                    boxShadow: `0 2px 8px rgba(14, 165, 233, 0.4)`,
                  }}>
                    {getRotationLabel(i)}
                  </div>
                )}

                {/* Hover overlay with rotate icon */}
                <div
                  onClick={() => rotateSinglePage(i)}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    zIndex: 15,
                    backgroundColor: 'rgba(14, 165, 233, 0.08)',
                    borderRadius: '8px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                >
                  <div style={{
                    backgroundColor: ACCENT,
                    color: 'white',
                    borderRadius: '50%',
                    padding: '12px',
                    boxShadow: `0 4px 12px rgba(14, 165, 233, 0.4)`,
                    transition: 'transform 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <RotateCw size={28} />
                  </div>
                </div>

                {/* Page card content with visual rotation */}
                <div style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '8px' }}>
                  <div className="pdf-page-header" style={{
                    backgroundColor: `hsl(${(i * 30) % 360}, 70%, 55%)`
                  }}>
                    Page {i + 1}
                  </div>
                  <div className="pdf-page-content" style={{ pointerEvents: 'none' }}>
                    <div className="pdf-page-line"></div>
                    <div className="pdf-page-line"></div>
                    <div className="pdf-page-line short"></div>
                    <div className="pdf-page-line"></div>
                    <div className="pdf-page-line"></div>
                    <div className="pdf-page-line short"></div>
                  </div>
                </div>

                <div className="pdf-page-number" style={{
                  backgroundColor: isRotated ? `rgba(14, 165, 233, 0.08)` : undefined,
                  color: isRotated ? ACCENT : undefined
                }}>Page {i + 1}</div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: ACCENT }}>
              <RefreshCw size={24} /> Faire pivoter PDF
            </h2>
          </div>

          <div className="workspace-sidebar-content">
            {/* Info box */}
            <div style={{
              padding: '1.2rem',
              background: `rgba(14, 165, 233, 0.08)`,
              border: `1px solid rgba(14, 165, 233, 0.25)`,
              borderRadius: '12px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <Info size={20} color={ACCENT} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Survolez le PDF ci-dessous et une icône apparaîtra. Cliquez sur les flèches pour faire pivoter vos PDF.
              </p>
            </div>

            {/* Rotated count */}
            <div style={{
              padding: '1.2rem',
              background: `rgba(14, 165, 233, 0.06)`,
              border: `2px dashed ${ACCENT}`,
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: ACCENT, marginBottom: '6px', fontSize: '1.2rem' }}>{rotatedCount} page{rotatedCount !== 1 ? 's' : ''} modifiée{rotatedCount !== 1 ? 's' : ''}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', margin: 0 }}>
                sur {totalPages} page{totalPages !== 1 ? 's' : ''} au total
              </p>
            </div>

            {/* Reset link */}
            {rotatedCount > 0 && (
              <button
                className="btn btn-outline"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                onClick={resetAll}
              >
                <RotateCcw size={16} /> Réinitialiser tout
              </button>
            )}

            {/* Rotate all section */}
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '0.8rem', textAlign: 'center' }}>
                Pivoter toutes les pages
              </p>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button
                  onClick={() => rotateAll(-90)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '1.2rem 0.5rem',
                    border: '2px solid var(--glass-border)',
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: 'var(--color-text-secondary)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = ACCENT;
                    e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.06)';
                    e.currentTarget.style.color = ACCENT;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <RotateCcw size={28} />
                  GAUCHE
                </button>
                <button
                  onClick={() => rotateAll(90)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '1.2rem 0.5rem',
                    border: '2px solid var(--glass-border)',
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: 'var(--color-text-secondary)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = ACCENT;
                    e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.06)';
                    e.currentTarget.style.color = ACCENT;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <RotateCw size={28} />
                  DROITE
                </button>
              </div>
            </div>
          </div>

          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{error}</div>}

            <button
              className="btn btn-primary btn-xl"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '1.2rem',
                padding: '1rem',
                marginTop: '0.5rem',
                backgroundColor: ACCENT,
                borderColor: ACCENT,
                backgroundImage: ACCENT_GRADIENT,
                opacity: rotatedCount === 0 ? 0.7 : 1,
                cursor: rotatedCount === 0 ? 'not-allowed' : 'pointer'
              }}
              onClick={handleRotate}
              disabled={rotatedCount === 0}
            >
              Faire pivoter PDF <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
