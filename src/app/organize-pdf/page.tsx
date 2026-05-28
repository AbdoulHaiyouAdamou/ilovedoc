'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { reorderPDFPages } from '@/features/pdf/organize';
import { getPdfPageCount } from '@/features/pdf/split';
import { Rows3, ArrowRight, GripVertical, RotateCcw, ArrowDownNarrowWide, CheckCircle, X } from 'lucide-react';

const ACCENT = '#a78bfa';
const ACCENT_DARK = '#7c3aed';

export default function OrganizePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]); // 0-indexed
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag & drop state using refs for stability
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggedState, setDraggedState] = useState<number | null>(null);
  const [dragOverState, setDragOverState] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      dragItem.current = null;
      dragOverItem.current = null;
      setDraggedState(null);
      setDragOverState(null);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
        setPageOrder(Array.from({ length: count }, (_, i) => i));
      } catch {
        setError("Impossible de lire ce PDF. Il est peut-être corrompu.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  // --- Robust HTML5 Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setDraggedState(index);
    // Needed for Firefox
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragItem.current !== null && dragItem.current !== index) {
      dragOverItem.current = index;
      setDragOverState(index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragItem.current !== null && dragItem.current !== index) {
      const newOrder = [...pageOrder];
      const draggedItemContent = newOrder[dragItem.current];
      newOrder.splice(dragItem.current, 1);
      newOrder.splice(index, 0, draggedItemContent);
      setPageOrder(newOrder);
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedState(null);
    setDragOverState(null);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedState(null);
    setDragOverState(null);
  };

  // --- Fallback movement buttons & deletion ---
  const removePage = (index: number) => {
    if (pageOrder.length === 1) {
      setError("Vous ne pouvez pas supprimer toutes les pages du document.");
      return;
    }
    const newOrder = [...pageOrder];
    newOrder.splice(index, 1);
    setPageOrder(newOrder);
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index > 0) {
      const newOrder = [...pageOrder];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;
      setPageOrder(newOrder);
    } else if (direction === 'right' && index < pageOrder.length - 1) {
      const newOrder = [...pageOrder];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;
      setPageOrder(newOrder);
    }
  };

  // Reset order to sequential
  const handleReset = () => {
    setPageOrder(Array.from({ length: totalPages }, (_, i) => i));
    setError(null);
  };

  // Sort by page number (ascending)
  const handleSortByNumber = () => {
    const sorted = [...pageOrder].sort((a, b) => a - b);
    setPageOrder(sorted);
  };

  const handleOrganize = async () => {
    if (!file) return;

    // Check if order changed
    const isOriginalOrder = pageOrder.every((p, i) => p === i);
    if (isOriginalOrder) {
      setError("L'ordre des pages n'a pas été modifié.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const reorderedBytes = await reorderPDFPages(file, pageOrder, (p) => setProgress(p));

      const blob = new Blob([reorderedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_organized.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la réorganisation.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── State 1: No file selected ──────────────────────────────────
  if (!file) {
    return (
      <>
        <SEO slug="organize-pdf" />
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
              Organiser PDF
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Triez et réorganisez les pages de votre document PDF par simple glisser-déposer.
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
                boxShadow: `0 10px 25px rgba(167, 139, 250, 0.4)`,
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
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment organiser un PDF</h2>
              <ol className="steps-list">
                <li>Sélectionnez votre fichier PDF ou glissez-déposez-le.</li>
                <li>Réorganisez les pages par glisser-déposer dans l&apos;espace de travail.</li>
                <li>Utilisez le bouton « Trier par numéro » pour remettre les pages dans l&apos;ordre.</li>
                <li>Cliquez sur « Organiser » pour générer votre nouveau PDF réordonné.</li>
                <li>Le téléchargement de votre fichier se lancera automatiquement.</li>
              </ol>
            </section>

            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── State 3: Processing / Result ───────────────────────────────
  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            {isProcessing ? (
              <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <h2>Réorganisation en cours...</h2>
                <div className="progress-container" style={{ marginTop: '2rem' }}>
                  <div className="progress">
                    <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})` }}></div>
                  </div>
                  <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
                </div>
              </div>
            ) : (
              <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle size={64} color="#10b981" />
                </div>
                <h2>🎉 Les pages ont été réorganisées !</h2>
                <p style={{ marginBottom: '2rem' }}>Votre nouveau document PDF est prêt.</p>
                <a href={resultUrl!} download={`${file.name.replace('.pdf', '')}_organized.pdf`} className="btn btn-primary btn-xl" style={{ backgroundColor: ACCENT, borderColor: ACCENT, backgroundImage: `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})` }}>
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

  // ─── State 2: Workspace ─────────────────────────────────────────
  const isOriginalOrder = pageOrder.length === totalPages && pageOrder.every((p, i) => p === i);

  // Generate a hue for each original page number (consistent color per page)
  const getPageColor = (originalPageIndex: number) => {
    return `hsl(${(originalPageIndex * 30) % 360}, 70%, 55%)`;
  };

  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
        {/* LEFT: Page thumbnails grid with drag & drop */}
        <div className="workspace-preview" style={{
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '2rem',
          alignContent: 'start'
        }}>
          {pageOrder.map((originalPageIdx, displayIndex) => {
            const isDragging = draggedState === displayIndex;
            const isDragOver = dragOverState === displayIndex;
            const pageColor = getPageColor(originalPageIdx);

            return (
              <div
                key={`page-${originalPageIdx}-${displayIndex}`}
                draggable
                onDragStart={(e) => handleDragStart(e, displayIndex)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, displayIndex)}
                onDrop={(e) => handleDrop(e, displayIndex)}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => setHoveredIndex(displayIndex)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="pdf-page-card"
                style={{
                  cursor: 'grab',
                  width: '100%',
                  height: '220px',
                  opacity: isDragging ? 0.4 : 1,
                  transform: isDragging ? 'scale(0.95)' : isDragOver ? 'scale(1.05)' : 'none',
                  border: isDragOver ? `3px solid ${ACCENT}` : '2px solid transparent',
                  boxShadow: isDragOver
                    ? `0 0 0 3px rgba(167, 139, 250, 0.3), 0 10px 25px rgba(0,0,0,0.15)`
                    : undefined,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  userSelect: 'none',
                }}
              >
                {/* Delete overlay on hover */}
                {hoveredIndex === displayIndex && pageOrder.length > 1 && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); removePage(displayIndex); }}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      zIndex: 20,
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '50%',
                      padding: '4px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="Supprimer la page"
                  >
                    <X size={16} />
                  </div>
                )}

                {/* Drag handle indicator */}
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  zIndex: 10,
                  color: 'var(--color-text-tertiary)',
                  opacity: 0.5,
                  display: hoveredIndex === displayIndex ? 'none' : 'block'
                }}>
                  <GripVertical size={16} />
                </div>

                {/* Order badge */}
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  zIndex: 10,
                  backgroundColor: ACCENT,
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}>
                  {displayIndex + 1}
                </div>

                <div className="pdf-page-header" style={{
                  backgroundColor: pageColor,
                }}>
                  Page {originalPageIdx + 1}
                </div>
                <div className="pdf-page-content" style={{ pointerEvents: 'none' }}>
                  <div className="pdf-page-line"></div>
                  <div className="pdf-page-line"></div>
                  <div className="pdf-page-line short"></div>
                  <div className="pdf-page-line short"></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--glass-bg)', borderTop: '1px solid var(--glass-border)' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); movePage(displayIndex, 'left'); }}
                    disabled={displayIndex === 0}
                    style={{ background: 'none', border: 'none', cursor: displayIndex === 0 ? 'not-allowed' : 'pointer', color: displayIndex === 0 ? '#cbd5e1' : ACCENT, fontSize: '1.2rem' }}
                    title="Déplacer vers la gauche"
                  >
                    ◀
                  </button>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Page {originalPageIdx + 1}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); movePage(displayIndex, 'right'); }}
                    disabled={displayIndex === pageOrder.length - 1}
                    style={{ background: 'none', border: 'none', cursor: displayIndex === pageOrder.length - 1 ? 'not-allowed' : 'pointer', color: displayIndex === pageOrder.length - 1 ? '#cbd5e1' : ACCENT, fontSize: '1.2rem' }}
                    title="Déplacer vers la droite"
                  >
                    ▶
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: ACCENT }}>
              <Rows3 size={24} /> Organiser PDF
            </h2>
          </div>

          <div className="workspace-sidebar-content">
            {/* File info */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>Fichiers :</span>
                <button
                  onClick={handleReset}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RotateCcw size={14} /> Réinitialiser tout
                </button>
              </div>

              {/* File item */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}>
                <GripVertical size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                    {totalPages} pages
                  </p>
                </div>
              </div>
            </div>

            {/* Order info */}
            <div style={{
              padding: '1.25rem',
              background: `rgba(167, 139, 250, 0.1)`,
              border: `2px dashed ${ACCENT}`,
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <h3 style={{ color: ACCENT, marginBottom: '8px', fontSize: '1.1rem' }}>
                {isOriginalOrder ? 'Ordre original' : 'Ordre modifié'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>
                Glissez-déposez les pages dans l&apos;espace de travail pour les réorganiser.
              </p>
            </div>

            {/* Sort button */}
            <button
              className="btn btn-outline"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                alignItems: 'center',
              }}
              onClick={handleSortByNumber}
            >
              <ArrowDownNarrowWide size={18} /> Trier les fichiers par numéro
            </button>
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
                backgroundImage: `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})`,
                opacity: isOriginalOrder ? 0.7 : 1,
                cursor: isOriginalOrder ? 'not-allowed' : 'pointer',
              }}
              onClick={handleOrganize}
              disabled={isOriginalOrder}
            >
              Organiser <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
