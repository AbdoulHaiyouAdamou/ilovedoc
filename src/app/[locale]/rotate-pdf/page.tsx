'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import RotateCw from 'lucide-react/dist/esm/icons/rotate-cw';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Info from 'lucide-react/dist/esm/icons/info';
import { rotatePDFPages, PageRotationMap, RotationDegrees } from '@/features/pdf/rotate';
import { getPdfPageCount } from '@/features/pdf/split';
import { ToolLayout, useToolState } from '@/components/tools';

const ACCENT = '#0ea5e9';
const ACCENT_DARK = '#0284c7';
const ACCENT_GRADIENT = `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})`;

export default function RotatePDFPage() {
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
  const [pageRotations, setPageRotations] = useState<PageRotationMap>({});

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onDrop(acceptedFiles);
      setPageRotations({});
      try {
        const count = await getPdfPageCount(acceptedFiles[0]);
        setTotalPages(count);
      } catch {
        failProcessing("Impossible de lire ce PDF. Il est peut-être corrompu.");
      }
    }
  };

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

  const handleRotate = useCallback(async () => {
    if (!file) return;
    const hasRotations = Object.keys(pageRotations).length > 0;
    if (!hasRotations) {
      failProcessing("Aucune rotation appliquée. Faites pivoter au moins une page.");
      return;
    }

    startProcessing();
    setProgress(0);

    try {
      const modifiedBytes = await rotatePDFPages(file, pageRotations, {
        onProgress: (p) => setProgress(p)
      });

      const blob = new Blob([modifiedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_rotated.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de la rotation.');
    }
  }, [file, pageRotations, startProcessing, finishProcessing, failProcessing, setProgress]);

  const rotatedCount = Object.keys(pageRotations).length;

  const getRotationLabel = (pageIndex: number): string | null => {
    const deg = pageRotations[pageIndex];
    if (!deg) return null;
    return `${deg}°`;
  };

  const workspacePreview = file && (
    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '2rem', alignContent: 'start' }}>
      {Array.from({ length: totalPages }).map((_, i) => {
        const rotation = pageRotations[i] || 0;
        const isRotated = rotation !== 0;
        return (
          <div
            key={i}
            onClick={() => rotateSinglePage(i)}
            style={{
              cursor: 'pointer',
              width: '100%',
              height: '220px',
              border: isRotated ? `3px solid ${ACCENT}` : '1px solid var(--glass-border)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'white'
            }}
          >
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

            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div style={{
                backgroundColor: `hsl(${(i * 30) % 360}, 70%, 55%)`,
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
            </div>

            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '8px',
              backgroundColor: isRotated ? `rgba(14, 165, 233, 0.08)` : 'transparent',
              color: isRotated ? ACCENT : 'var(--color-text-secondary)',
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

      {rotatedCount > 0 && (
        <button
          className="btn btn-outline"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
          onClick={resetAll}
        >
          <RotateCcw size={16} /> Réinitialiser tout
        </button>
      )}

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
          >
            <RotateCw size={28} />
            DROITE
          </button>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      slug="rotate-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { reset(); setPageRotations({}); setTotalPages(0); }}
      onDrop={handleDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Rotation en cours..."
      successMessage="Les pages ont été pivotées !"
      successSubtitle="Votre document modifié est prêt."
      actionLabel="Faire pivoter PDF"
      onAction={handleRotate}
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment pivoter un PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez votre fichier PDF ou glissez-déposez-le.</li>
            <li>Survolez une page et cliquez sur l'icône de rotation pour la faire pivoter de 90°.</li>
            <li>Utilisez les boutons « Droite » ou « Gauche » pour pivoter toutes les pages en un clic.</li>
            <li>Cliquez sur « Faire pivoter PDF » pour télécharger votre document modifié.</li>
          </ol>
        </div>
      }
    />
  );
}
