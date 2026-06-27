'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import { repairPDF } from '@/features/pdf/repair';
import { ToolLayout, useToolState } from '@/components/tools';

const ACCENT = '#f59e0b';
const ACCENT_DARK = '#d97706';
const ACCENT_GRADIENT = `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})`;

export default function RepairPdfPage() {
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

  const handleRepair = useCallback(async () => {
    if (!file) return;
    startProcessing();
    setProgress(0);

    try {
      const result = await repairPDF(file, {
        onProgress: (p) => setProgress(p)
      });

      const blob = new Blob([result as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `repare_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de la réparation.');
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
      <div style={{ padding: '1.5rem', borderRadius: '12px', border: '2px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
        <h3 style={{ marginBottom: '0.5rem', color: ACCENT }}>Analyse et réparation</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          Nous allons tenter de récupérer le contenu de votre PDF endommagé en ignorant les erreurs de structure et en reconstruisant le fichier.
        </p>
      </div>
    </>
  );

  return (
    <ToolLayout
      slug="repair-pdf"
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
      processingLabel="Réparation en cours..."
      successMessage="Le PDF a été réparé !"
      successSubtitle="Votre document est prêt à être téléchargé."
      actionLabel="Réparer le PDF"
      onAction={handleRepair}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment réparer un PDF corrompu ?</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Il arrive parfois que des fichiers PDF soient endommagés suite à un téléchargement incomplet, un problème de disque ou une erreur de logiciel. Notre outil analyse la structure interne de votre document PDF corrompu et tente de la reconstruire. En ignorant les objets invalides et en régénérant les tables de références croisées (XRefs), nous pouvons souvent récupérer le contenu intact. L'opération s'effectue entièrement dans votre navigateur pour garantir la confidentialité de vos documents.
          </p>
        </div>
      }
    />
  );
}
