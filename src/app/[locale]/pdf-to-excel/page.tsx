'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { convertPdfToExcel } from '@/features/pdf/office';
import { Table, Info, FileText } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#16a34a'; // Green for Excel

export default function PdfToExcelPage() {
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
      const result: Uint8Array = await convertPdfToExcel(file, (p: number) => setProgress(Math.min(Math.round(p), 95)));
      clearInterval(progressInterval);
      setProgress(100);

      const blob = new Blob([result as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '.xlsx');
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
          Les tableaux de votre PDF seront détectés automatiquement et convertis en feuille de calcul Excel (.xlsx).
        </p>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="pdf-to-excel"
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
      successMessage="🎉 Conversion terminée !"
      successSubtitle="Votre fichier Excel est prêt."
      actionLabel="Convertir en Excel"
      onAction={handleConvert}
      downloadName={file ? file.name.replace(/\.pdf$/i, '.xlsx') : undefined}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Convertir PDF en Excel gratuitement</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Notre outil de conversion PDF en Excel détecte automatiquement les tableaux contenus dans vos documents PDF
            et les transforme en feuilles de calcul Excel (.xlsx) éditables. Idéal pour extraire des données financières,
            des inventaires, des rapports ou toute information structurée en tableau. Le traitement s'effectue
            entièrement dans votre navigateur, garantissant la confidentialité totale de vos données.
          </p>
        </div>
      }
    />
  );
}
