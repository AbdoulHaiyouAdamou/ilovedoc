'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Info from 'lucide-react/dist/esm/icons/info';
import { flattenPDF } from '@/features/pdf/flatten';
import { ToolLayout, useToolState } from '@/components/tools';

const ACCENT = '#06b6d4';
const ACCENT_DARK = '#0891b2';
const ACCENT_GRADIENT = `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})`;

export default function FlattenPdfPage() {
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

  const handleFlatten = useCallback(async () => {
    if (!file) return;
    startProcessing();
    setProgress(0);

    try {
      const resultBytes = await flattenPDF(file, {
        onProgress: (p) => setProgress(p)
      });

      const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.[^/.]+$/, "") + '_flattened.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de l\'aplatissement.');
    }
  }, [file, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
      <div className="pdf-page-header" style={{ backgroundColor: ACCENT }}>
        {file.name}
      </div>
      <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <FileText size={80} color={ACCENT} style={{ opacity: 0.5 }} />
      </div>
    </div>
  );

  const workspaceSidebar = (
    <>
      <div style={{
        padding: '1.2rem',
        background: `rgba(6, 182, 212, 0.08)`,
        border: `1px solid rgba(6, 182, 212, 0.25)`,
        borderRadius: '12px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}>
        <Info size={20} color={ACCENT} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
          L'aplatissement fusionne tous les éléments interactifs (comme les formulaires remplis et les annotations) avec le contenu du document, les rendant inaltérables.
        </p>
      </div>
    </>
  );

  return (
    <ToolLayout
      slug="flatten-pdf"
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
      processingLabel="Aplatissement en cours..."
      successMessage="Le PDF a été aplati !"
      successSubtitle="Votre document est prêt à être téléchargé."
      actionLabel="Aplatir PDF"
      onAction={handleFlatten}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi aplatir un PDF ?</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Aplatir un PDF empêche la modification ultérieure de vos formulaires remplis ou annotations. Cela fusionne tous les éléments interactifs avec le contenu principal de la page. C'est particulièrement utile avant de partager des documents contenant des signatures ou des données sensibles.
          </p>
        </div>
      }
    />
  );
}
