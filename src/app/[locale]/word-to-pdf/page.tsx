'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { convertWordToPdf } from '@/features/pdf/office';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Info from 'lucide-react/dist/esm/icons/info';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import { ToolLayout, useToolState } from '@/components/tools';
import AdUnit from '@/components/common/AdUnit';

const ACCENT = '#2563eb';

export default function WordToPdfPage() {
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

      const result = await convertWordToPdf(file, (p: number) => setProgress(Math.min(p, 90)));
      clearInterval(progressInterval);
      setProgress(100);

      const blob = new Blob([result as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const outputName = file.name.replace(/\.docx$/i, '') + '.pdf';
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
             <FileText size={80} color={ACCENT} style={{ opacity: 0.5 }} />
          </div>
       </div>

       <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div className="workspace-sidebar-header">
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: ACCENT }}>
          <BookOpen size={24} /> Word en PDF
        </h2>
      </div>
      <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, padding: '1rem' }}>
         <div style={{
            padding: '1.5rem',
            borderRadius: '12px',
            border: `2px solid rgba(37, 99, 235, 0.3)`,
            background: 'rgba(37, 99, 235, 0.05)',
         }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Votre document Word (.docx) sera converti en un fichier PDF structuré et mis en page.
            </p>
         </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="word-to-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={reset}
      onDrop={onDrop}
      accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }}
      maxFiles={1}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Conversion en cours..."
      successMessage="🎉 Le document a été converti en PDF !"
      successSubtitle="Votre fichier PDF est prêt."
      downloadName={file ? file.name.replace(/\.docx$/i, '') + '.pdf' : 'document.pdf'}
      actionLabel="Convertir en PDF"
      onAction={handleConvert}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
           <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi convertir Word en PDF ?</h2>
           <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
             Le format PDF garantit que votre mise en page, vos polices et vos images restent intacts quel que soit l'appareil ou le système d'exploitation utilisé pour ouvrir le document. Convertir vos fichiers Word en PDF est idéal pour partager des rapports, des CV, des contrats ou tout document officiel. Notre outil préserve fidèlement la structure de votre document original. 100% hors-ligne pour garantir la confidentialité totale de vos informations.
           </p>
        </div>
      }
    />
  );
}
