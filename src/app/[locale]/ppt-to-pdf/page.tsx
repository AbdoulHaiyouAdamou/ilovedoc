'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { convertPptToPdf } from '@/features/pdf/office';
import { MonitorPlay, Info } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';
import AdUnit from '@/components/common/AdUnit';

const ACCENT = '#ea580c';

export default function PptToPdfPage() {
  const tTools = useTranslations('Tools');

  const {
    file,
    phase,
    isProcessing,
    progress,
    resultUrl,
    error,
    onDrop,
    reset,
    startProcessing,
    setProgress,
    finishProcessing,
    failProcessing
  } = useToolState();

  const handleConvert = async () => {
    if (!file) return;
    startProcessing();
    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);

      const result = await convertPptToPdf(file, (p) => setProgress(p));
      clearInterval(progressInterval);
      setProgress(100);

      const blob = new Blob([result as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const outputName = file.name.replace(/\.pptx$/i, '') + '.pdf';
      const a = document.createElement('a');
      a.href = url;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de la conversion.');
    }
  };

  const workspacePreview = (
    <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
       <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
          <div className="pdf-page-header" style={{ backgroundColor: ACCENT }}>
            {file?.name}
          </div>
          <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
             <MonitorPlay size={80} color={ACCENT} style={{ opacity: 0.5 }} />
          </div>
       </div>

       <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div className="workspace-sidebar-header">
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: ACCENT }}>
          <MonitorPlay size={24} /> PowerPoint en PDF
        </h2>
      </div>
      <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, padding: '1rem' }}>
         <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '1.5rem',
            borderRadius: '12px',
            border: `2px solid rgba(234, 88, 12, 0.3)`,
            background: 'rgba(234, 88, 12, 0.08)',
         }}>
            <Info size={22} color={ACCENT} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Votre présentation PowerPoint (.pptx) sera convertie en document PDF.
            </p>
         </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="ppt-to-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={reset}
      onDrop={onDrop}
      accept={{ 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] }}
      maxFiles={1}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Conversion en cours..."
      successMessage="🎉 La présentation a été convertie en PDF !"
      successSubtitle="Votre document PDF est prêt."
      downloadName={file ? file.name.replace(/\.pptx$/i, '') + '.pdf' : 'presentation.pdf'}
      actionLabel="Convertir en PDF"
      onAction={handleConvert}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
           <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi convertir PowerPoint en PDF ?</h2>
           <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
             Convertir vos présentations PowerPoint en PDF garantit que la mise en page et le contenu sont préservés sur tous les appareils. Les fichiers PDF sont universellement lisibles, plus légers et parfaits pour le partage professionnel. Notre outil fonctionne entièrement hors-ligne dans votre navigateur pour garantir la confidentialité totale de vos documents.
           </p>
        </div>
      }
    />
  );
}
