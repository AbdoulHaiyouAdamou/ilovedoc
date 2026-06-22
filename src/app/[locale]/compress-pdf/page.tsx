'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Minimize, FileText } from 'lucide-react';
import { compressPdf } from '@/features/pdf/compress';
import { ToolLayout, useToolState } from '@/components/tools';

export default function CompressPdfPage() {
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

  const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'medium' | 'low'>('medium');
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    startProcessing();
    progressInterval.current = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 200);

    try {
      const result = await compressPdf(file, { level: compressionLevel });
      if (progressInterval.current) clearInterval(progressInterval.current);
      const downloadName = file.name.replace(/\.pdf$/i, '_compressed.pdf');
      const resultFile = new File([result], downloadName, { type: 'application/pdf' });
      const url = URL.createObjectURL(resultFile);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      failProcessing(err.message || 'Une erreur est survenue lors de la compression.');
    }
  }, [file, compressionLevel, startProcessing, finishProcessing, failProcessing, setProgress]);

  const ACCENT = '#10b981';

  const workspacePreview = file && (
    <div
      className="pdf-page-card"
      style={{
        width: '300px',
        height: '420px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="pdf-page-header" style={{ backgroundColor: ACCENT }}>
        {file.name}
      </div>
      <div
        className="pdf-page-content"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
      >
        <FileText size={80} color={ACCENT} style={{ opacity: 0.5 }} />
      </div>
    </div>
  );

  const workspaceSidebar = (
    <>
      {(['extreme', 'medium', 'low'] as const).map((level) => {
        const labels: Record<string, { title: string; desc: string }> = {
          extreme: {
            title: 'Compression Extrême',
            desc: 'Moins bonne qualité, compression maximale.',
          },
          medium: {
            title: 'Compression Recommandée',
            desc: 'Bonne qualité, bonne compression.',
          },
          low: {
            title: 'Faible Compression',
            desc: 'Haute qualité, moins de compression.',
          },
        };
        const isSelected = compressionLevel === level;
        return (
          <label
            key={level}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              borderRadius: '12px',
              cursor: 'pointer',
              border: isSelected ? `2px solid ${ACCENT}` : '2px solid var(--glass-border)',
              background: isSelected ? `${ACCENT}1a` : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontWeight: 'bold', color: isSelected ? ACCENT : 'var(--text-color)' }}>
                {labels[level].title}
              </span>
              <input
                type="radio"
                name="level"
                checked={isSelected}
                onChange={() => setCompressionLevel(level)}
                style={{ accentColor: ACCENT }}
              />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {labels[level].desc}
            </span>
          </label>
        );
      })}
    </>
  );

  return (
    <ToolLayout
      slug="compress-pdf"
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
      processingLabel="Compression en cours..."
      successMessage="Le PDF a été compressé !"
      successSubtitle="Votre document optimisé est prêt."
      actionLabel="Compresser le PDF"
      onAction={handleCompress}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi utiliser notre compresseur ?</h2>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: 1.8,
              fontSize: '1.1rem',
            }}
          >
            Notre outil de compression PDF vous permet de réduire considérablement la taille de vos
            documents lourds sans altérer la qualité visuelle. Que ce soit pour envoyer un dossier par
            e-mail, respecter les limites de téléchargement d'un formulaire administratif, ou
            simplement gagner de l'espace de stockage, notre algorithme intelligent préserve
            l'essentiel de vos fichiers tout en supprimant les données superflues. 100%
            hors-ligne pour garantir la confidentialité totale de vos informations.
          </p>
        </div>
      }
    />
  );
}
