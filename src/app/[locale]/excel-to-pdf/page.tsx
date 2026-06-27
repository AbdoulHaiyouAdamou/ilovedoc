'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { convertExcelToPdf } from '@/features/pdf/office';
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet';
import Info from 'lucide-react/dist/esm/icons/info';
import { ToolLayout, useToolState } from '@/components/tools';
import AdUnit from '@/components/common/AdUnit';

const ACCENT = '#16a34a';

export default function ExcelToPdfPage() {
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

      const result = await convertExcelToPdf(file, (p: number) => setProgress(p));
      clearInterval(progressInterval);
      setProgress(100);

      const blob = new Blob([result as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const outputName = file.name.replace(/\.xlsx$/i, '') + '.pdf';
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
             <FileSpreadsheet size={80} color={ACCENT} style={{ opacity: 0.5 }} />
          </div>
       </div>

       <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div className="workspace-sidebar-header">
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: ACCENT }}>
          <FileSpreadsheet size={24} /> Excel en PDF
        </h2>
      </div>
      <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, padding: '1rem' }}>
         <div style={{
           display: 'flex',
           alignItems: 'flex-start',
           gap: '12px',
           padding: '1.5rem',
           borderRadius: '12px',
           border: `2px solid ${ACCENT}`,
           background: 'rgba(22, 163, 74, 0.1)',
         }}>
           <Info size={22} color={ACCENT} style={{ flexShrink: 0, marginTop: '2px' }} />
           <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
             Votre classeur Excel (.xlsx) sera converti en un PDF avec les tableaux mis en forme.
           </span>
         </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="excel-to-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={reset}
      onDrop={onDrop}
      accept={{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }}
      maxFiles={1}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Conversion en cours..."
      successMessage="🎉 Le fichier Excel a été converti !"
      successSubtitle="Votre document PDF est prêt."
      downloadName={file ? file.name.replace(/\.xlsx$/i, '') + '.pdf' : 'document.pdf'}
      actionLabel="Convertir en PDF"
      onAction={handleConvert}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
           <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi convertir Excel en PDF ?</h2>
           <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
             Convertir vos fichiers Excel en PDF permet de préserver la mise en page de vos tableaux et de partager vos données en toute sécurité. Le format PDF est universel et garantit que vos documents seront affichés de la même manière sur tous les appareils. Notre outil conserve les bordures, les couleurs et la structure de vos feuilles de calcul pour un rendu professionnel. 100% hors-ligne pour garantir la confidentialité totale de vos informations.
           </p>
        </div>
      }
    />
  );
}
