'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { convertPdfToPpt } from '@/features/pdf/office';
import Projector from 'lucide-react/dist/esm/icons/projector';
import Info from 'lucide-react/dist/esm/icons/info';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#ea580c'; // Orange for PPT

export default function PdfToPptPage() {
  const tTools = useTranslations('Tools');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const handleConvert = useCallback(async () => {
    if (!file) return;
    startProcessing();
    try {
      const progressInterval = setInterval(() => setProgress(p => Math.min(p + 10, 90)), 200);
      const result: Uint8Array = await convertPdfToPpt(file, (p: number) => setProgress(Math.min(Math.round(p), 95)));
      clearInterval(progressInterval);
      setProgress(100);

      const blob = new Blob([result as any], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '.pptx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de la conversion.');
    }
  }, [file, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: 300, height: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
      <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>{file.name}</div>
      <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <FileText size={80} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
      </div>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1.2rem', borderRadius: '12px', border: `2px solid ${TOOL_COLOR}40`, background: `${TOOL_COLOR}10` }}>
        <Info size={22} color={TOOL_COLOR} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
          Votre document PDF sera converti en fichier de présentation PowerPoint (.pptx).
        </p>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="pdf-to-ppt"
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
      processingLabel="Conversion en cours..."
      successMessage="🎉 Conversion PowerPoint terminée !"
      successSubtitle="Votre présentation est prête au téléchargement."
      actionLabel="Convertir en PPTX"
      onAction={handleConvert}
      downloadName={file ? file.name.replace(/\.pdf$/i, '.pptx') : undefined}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Convertir PDF en PPT gratuitement</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Notre convertisseur PDF en PowerPoint extrait le texte et la mise en page de vos documents PDF
            pour créer des présentations PPTX éditables. Chaque page de votre PDF est convertie en une diapositive.
            L'outil s'exécute localement dans votre navigateur pour une sécurité maximale et une confidentialité absolue de vos données.
          </p>
        </div>
      }
    />
  );
}
