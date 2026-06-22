'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { extractPagesFromPDF } from '@/features/pdf/extract';
import { getPdfPageCount } from '@/features/pdf/split';
import { Check, CheckSquare, RotateCcw } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const ACCENT = '#8b5cf6';
const ACCENT_LIGHT = '#a78bfa';

export default function ExtractPagesPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop: handleDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]); // 0-indexed

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      handleDrop(acceptedFiles);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
      } catch (err) {
        failProcessing("Impossible de lire ce PDF. Il est peut-être corrompu.");
      }
    }
  }, [handleDrop, failProcessing]);

  const togglePage = (pageIndex: number) => {
    setSelectedPages(prev =>
      prev.includes(pageIndex)
        ? prev.filter(p => p !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  const selectAll = () => setSelectedPages(Array.from({ length: totalPages }, (_, i) => i));
  const resetSelection = () => setSelectedPages([]);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    if (selectedPages.length === 0) {
      failProcessing("Sélectionnez au moins une page à extraire.");
      return;
    }
    startProcessing();
    try {
      const extractedBytes = await extractPagesFromPDF(file, {
        pagesToExtract: selectedPages,
        onProgress: setProgress
      });
      const blob = new Blob([extractedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      const a = document.createElement('a'); a.href = url; a.download = `${file.name.replace('.pdf', '')}_extracted.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de l\'extraction.');
    }
  }, [file, selectedPages, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '2rem', alignContent: 'start', width: '100%' }}>
      {Array.from({ length: totalPages }).map((_, i) => {
        const isSelected = selectedPages.includes(i);
        return (
          <div
            key={i}
            className="pdf-page-card"
            onClick={() => togglePage(i)}
            style={{
              cursor: 'pointer', width: '100%', height: '220px',
              border: isSelected ? `3px solid ${ACCENT}` : 'none',
              transform: isSelected ? 'scale(0.97)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative', padding: 0
            }}
          >
            {isSelected && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(139, 92, 246, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ backgroundColor: ACCENT, color: 'white', borderRadius: '50%', padding: '10px', boxShadow: `0 4px 10px rgba(139, 92, 246, 0.3)` }}>
                  <Check size={32} />
                </div>
              </div>
            )}
            <div className="pdf-page-header" style={{ backgroundColor: isSelected ? ACCENT : `hsl(${(i * 30) % 360}, 70%, 55%)` }}>
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
            <div className="pdf-page-number" style={{ backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.1)' : undefined, color: isSelected ? ACCENT : undefined }}>Page {i + 1}</div>
          </div>
        );
      })}
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', border: `2px dashed ${ACCENT}`, borderRadius: '12px', textAlign: 'center' }}>
        <h3 style={{ color: ACCENT, marginBottom: '10px', fontSize: '1.2rem' }}>{selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} sélectionnée{selectedPages.length !== 1 ? 's' : ''}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-tertiary)' }}>Cliquez sur les pages que vous souhaitez extraire.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }} onClick={selectAll}>
          <CheckSquare size={16} /> Sélectionner tout
        </button>
        <button className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }} onClick={resetSelection} disabled={selectedPages.length === 0}>
          <RotateCcw size={16} /> Réinitialiser
        </button>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="extract-pages"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { reset(); setSelectedPages([]); }}
      onDrop={onDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Extraction en cours..."
      successMessage="🎉 Les pages ont été extraites !"
      successSubtitle="Votre nouveau document PDF est prêt."
      actionLabel="Extraire les pages"
      onAction={handleSubmit}
      actionDisabled={selectedPages.length === 0}
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment extraire des pages d&apos;un PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez votre fichier PDF ou glissez-déposez-le.</li>
            <li>Cliquez sur les pages que vous souhaitez extraire dans l&apos;espace de travail.</li>
            <li>Cliquez sur &quot;Extraire les pages&quot; pour générer un nouveau PDF contenant uniquement les pages sélectionnées.</li>
            <li>Le téléchargement de votre fichier se lancera automatiquement.</li>
          </ol>
        </div>
      }
    />
  );
}
