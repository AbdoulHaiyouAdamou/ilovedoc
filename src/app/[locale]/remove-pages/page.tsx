'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import FileMinus from 'lucide-react/dist/esm/icons/file-minus';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import { removePagesFromPDF } from '@/features/pdf/remove';
import { getPdfPageCount } from '@/features/pdf/split';
import { ToolLayout, useToolState } from '@/components/tools';

const ACCENT = '#ef4444';
const ACCENT_DARK = '#dc2626';
const ACCENT_GRADIENT = `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})`;

export default function RemovePagesPage() {
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

  const [totalPages, setTotalPages] = useState<number>(0);
  const [deletedPages, setDeletedPages] = useState<number[]>([]);

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onDrop(acceptedFiles);
      setDeletedPages([]);
      try {
        const count = await getPdfPageCount(acceptedFiles[0]);
        setTotalPages(count);
      } catch {
        failProcessing("Impossible de lire ce PDF. Il est peut-être corrompu.");
      }
    }
  };

  const togglePage = (pageIndex: number) => {
    setDeletedPages(prev =>
      prev.includes(pageIndex)
        ? prev.filter(p => p !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  const handleRemove = useCallback(async () => {
    if (!file) return;
    if (deletedPages.length === totalPages) {
      failProcessing("Vous ne pouvez pas supprimer toutes les pages du document.");
      return;
    }
    if (deletedPages.length === 0) {
      failProcessing("Sélectionnez au moins une page à supprimer.");
      return;
    }

    startProcessing();
    setProgress(0);

    try {
      const modifiedBytes = await removePagesFromPDF(file, {
        pagesToRemove: deletedPages,
        onProgress: (p) => setProgress(p)
      });

      const blob = new Blob([modifiedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_removed.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de la suppression.');
    }
  }, [file, deletedPages, totalPages, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '2rem', alignContent: 'start', width: '100%' }}>
      {Array.from({ length: totalPages }).map((_, i) => {
        const isDeleted = deletedPages.includes(i);
        return (
          <div
            key={i}
            onClick={() => togglePage(i)}
            style={{
              cursor: 'pointer',
              width: '100%',
              height: '220px',
              border: isDeleted ? `3px solid ${ACCENT}` : '1px solid var(--glass-border)',
              opacity: isDeleted ? 0.6 : 1,
              transform: isDeleted ? 'scale(0.95)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'white'
            }}
          >
            {isDeleted && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}>
                <div style={{
                  backgroundColor: ACCENT,
                  color: 'white',
                  borderRadius: '50%',
                  padding: '10px',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                }}>
                  <Trash2 size={32} />
                </div>
              </div>
            )}
            <div style={{
              backgroundColor: isDeleted ? ACCENT : `hsl(${(i * 30) % 360}, 70%, 55%)`,
              padding: '10px',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}>
              Page {i + 1}
            </div>
            <div style={{ flex: 1, padding: '10px' }}>
              <div style={{ height: '8px', background: '#f1f5f9', marginBottom: '8px' }} />
              <div style={{ height: '8px', background: '#f1f5f9', marginBottom: '8px' }} />
              <div style={{ height: '8px', background: '#f1f5f9', marginBottom: '8px', width: '60%' }} />
              <div style={{ height: '8px', background: '#f1f5f9', marginBottom: '8px' }} />
              <div style={{ height: '8px', background: '#f1f5f9', marginBottom: '8px' }} />
            </div>
            <div style={{
              padding: '8px',
              backgroundColor: isDeleted ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              color: isDeleted ? ACCENT : 'var(--color-text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Page {i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );

  const workspaceSidebar = (
    <>
      <div style={{
        padding: '1.5rem',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '2px dashed #ef4444',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: ACCENT, marginBottom: '10px', fontSize: '1.2rem' }}>{deletedPages.length} pages sélectionnées</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Cliquez sur les pages dans l'espace de travail pour les marquer à supprimer.
        </p>
      </div>

      {deletedPages.length > 0 && (
        <button
          className="btn btn-outline"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
          onClick={() => setDeletedPages([])}
        >
          <RotateCcw size={16} /> Réinitialiser
        </button>
      )}
    </>
  );

  return (
    <ToolLayout
      slug="remove-pages"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { reset(); setDeletedPages([]); setTotalPages(0); }}
      onDrop={handleDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Suppression en cours..."
      successMessage="Les pages ont été supprimées !"
      successSubtitle="Votre nouveau document PDF est prêt."
      actionLabel="Supprimer les pages"
      onAction={handleRemove}
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment supprimer des pages d'un PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez votre fichier PDF ou glissez-déposez-le.</li>
            <li>Cliquez sur les pages que vous souhaitez supprimer dans l'espace de travail.</li>
            <li>Cliquez sur "Supprimer les pages" pour générer votre nouveau PDF allégé.</li>
            <li>Le téléchargement de votre fichier se lancera automatiquement.</li>
          </ol>
        </div>
      }
    />
  );
}
