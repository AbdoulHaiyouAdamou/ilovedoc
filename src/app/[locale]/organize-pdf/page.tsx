'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { reorderPDFPages } from '@/features/pdf/organize';
import { getPdfPageCount } from '@/features/pdf/split';
import { GripVertical, RotateCcw, ArrowDownNarrowWide, X } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#a78bfa';

export default function OrganizePdfPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop: handleDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  // Drag & drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggedState, setDraggedState] = useState<number | null>(null);
  const [dragOverState, setDragOverState] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      handleDrop(acceptedFiles);
      dragItem.current = null; dragOverItem.current = null;
      setDraggedState(null); setDragOverState(null);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
        setPageOrder(Array.from({ length: count }, (_, i) => i));
      } catch {
        failProcessing("Impossible de lire ce PDF. Il est peut-être corrompu.");
      }
    }
  }, [handleDrop, failProcessing]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index; setDraggedState(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    }
  };
  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragItem.current !== null && dragItem.current !== index) {
      dragOverItem.current = index; setDragOverState(index);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  };
  const handleElementDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragItem.current !== null && dragItem.current !== index) {
      const newOrder = [...pageOrder];
      const draggedItemContent = newOrder[dragItem.current];
      newOrder.splice(dragItem.current, 1);
      newOrder.splice(index, 0, draggedItemContent);
      setPageOrder(newOrder);
    }
    dragItem.current = null; dragOverItem.current = null;
    setDraggedState(null); setDragOverState(null);
  };
  const handleDragEnd = () => {
    dragItem.current = null; dragOverItem.current = null;
    setDraggedState(null); setDragOverState(null);
  };

  const removePage = (index: number) => {
    if (pageOrder.length === 1) return;
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

  const handleOrganizeReset = () => {
    setPageOrder(Array.from({ length: totalPages }, (_, i) => i));
  };
  const handleSortByNumber = () => {
    setPageOrder([...pageOrder].sort((a, b) => a - b));
  };

  const isOriginalOrder = pageOrder.length === totalPages && pageOrder.every((p, i) => p === i);

  const handleOrganize = async () => {
    if (!file || isOriginalOrder) return;
    startProcessing();
    try {
      const reorderedBytes = await reorderPDFPages(file, pageOrder, setProgress);
      const blob = new Blob([reorderedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      const a = document.createElement('a'); a.href = url; a.download = `${file.name.replace('.pdf', '')}_organized.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de la réorganisation.');
    }
  };

  const getPageColor = (originalPageIndex: number) => `hsl(${(originalPageIndex * 30) % 360}, 70%, 55%)`;

  const workspacePreview = file && (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '2rem', alignContent: 'start', width: '100%' }}>
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
            onDrop={(e) => handleElementDrop(e, displayIndex)}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => setHoveredIndex(displayIndex)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="pdf-page-card"
            style={{
              cursor: 'grab', width: '100%', height: '220px',
              opacity: isDragging ? 0.4 : 1, transform: isDragging ? 'scale(0.95)' : isDragOver ? 'scale(1.05)' : 'none',
              border: isDragOver ? `3px solid ${TOOL_COLOR}` : '2px solid transparent',
              boxShadow: isDragOver ? `0 0 0 3px rgba(167, 139, 250, 0.3), 0 10px 25px rgba(0,0,0,0.15)` : undefined,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', userSelect: 'none', padding: 0
            }}
          >
            {hoveredIndex === displayIndex && pageOrder.length > 1 && (
              <div 
                onClick={(e) => { e.stopPropagation(); removePage(displayIndex); }}
                style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 20, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', padding: '4px', color: '#ef4444', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Supprimer la page"
              >
                <X size={16} />
              </div>
            )}
            <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 10, color: 'var(--color-text-tertiary)', opacity: 0.5, display: hoveredIndex === displayIndex ? 'none' : 'block' }}>
              <GripVertical size={16} />
            </div>
            <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 10, backgroundColor: TOOL_COLOR, color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
              {displayIndex + 1}
            </div>
            <div className="pdf-page-header" style={{ backgroundColor: pageColor }}>
              Page {originalPageIdx + 1}
            </div>
            <div className="pdf-page-content" style={{ pointerEvents: 'none' }}>
              <div className="pdf-page-line"></div>
              <div className="pdf-page-line"></div>
              <div className="pdf-page-line short"></div>
              <div className="pdf-page-line short"></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--glass-bg)', borderTop: '1px solid var(--glass-border)' }}>
              <button onClick={(e) => { e.stopPropagation(); movePage(displayIndex, 'left'); }} disabled={displayIndex === 0} style={{ background: 'none', border: 'none', cursor: displayIndex === 0 ? 'not-allowed' : 'pointer', color: displayIndex === 0 ? '#cbd5e1' : TOOL_COLOR, fontSize: '1.2rem' }} title="Déplacer vers la gauche">◀</button>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Page {originalPageIdx + 1}</span>
              <button onClick={(e) => { e.stopPropagation(); movePage(displayIndex, 'right'); }} disabled={displayIndex === pageOrder.length - 1} style={{ background: 'none', border: 'none', cursor: displayIndex === pageOrder.length - 1 ? 'not-allowed' : 'pointer', color: displayIndex === pageOrder.length - 1 ? '#cbd5e1' : TOOL_COLOR, fontSize: '1.2rem' }} title="Déplacer vers la droite">▶</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const workspaceSidebar = file && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>Fichiers :</span>
          <button onClick={handleOrganizeReset} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={14} /> Réinitialiser tout
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <GripVertical size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>{totalPages} pages</p>
          </div>
        </div>
      </div>
      <div style={{ padding: '1.25rem', background: `rgba(167, 139, 250, 0.1)`, border: `2px dashed ${TOOL_COLOR}`, borderRadius: '12px', textAlign: 'center' }}>
        <h3 style={{ color: TOOL_COLOR, marginBottom: '8px', fontSize: '1.1rem' }}>
          {isOriginalOrder ? 'Ordre original' : 'Ordre modifié'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>
          Glissez-déposez les pages dans l&apos;espace de travail pour les réorganiser.
        </p>
      </div>
      <button className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }} onClick={handleSortByNumber}>
        <ArrowDownNarrowWide size={18} /> Trier les fichiers par numéro
      </button>
    </div>
  );

  return (
    <ToolLayout
      slug="organize-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={reset}
      onDrop={onDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Réorganisation en cours..."
      successMessage="🎉 Les pages ont été réorganisées !"
      successSubtitle="Votre nouveau document PDF est prêt."
      actionLabel="Organiser"
      onAction={handleOrganize}
      actionDisabled={isOriginalOrder}
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment organiser un PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez votre fichier PDF ou glissez-déposez-le.</li>
            <li>Réorganisez les pages par glisser-déposer dans l&apos;espace de travail.</li>
            <li>Utilisez le bouton « Trier par numéro » pour remettre les pages dans l&apos;ordre.</li>
            <li>Cliquez sur « Organiser » pour générer votre nouveau PDF réordonné.</li>
            <li>Le téléchargement de votre fichier se lancera automatiquement.</li>
          </ol>
        </div>
      }
    />
  );
}
