'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { FileX } from 'lucide-react';
import { removeBlankPages } from '@/features/pdf/removeBlanks';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#f97316';
const GRADIENT = 'linear-gradient(to right, #f97316, #ea580c)';

export default function RemoveBlanksPage() {
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

  const [resultInfo, setResultInfo] = useState<{ removedCount: number; totalPages: number } | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    startProcessing();
    setProgress(0);
    setResultInfo(null);

    try {
      const result = await removeBlankPages(file, 200, setProgress);
      setResultInfo({ removedCount: result.removedCount, totalPages: result.totalPages });
      const url = URL.createObjectURL(result.blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '_clean.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err instanceof Error ? err.message : 'Erreur.');
    }
  }, [file, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--wm)', borderColor: TOOL_COLOR }}>
      <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>
        {file.name}
      </div>
      <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <FileX size={80} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
      </div>
    </div>
  );

  const workspaceSidebar = (
    <>
      <div style={{ padding: '1.5rem', borderRadius: '12px', border: `2px solid ${TOOL_COLOR}4d`, background: `${TOOL_COLOR}0d` }}>
        <h3 style={{ marginBottom: '0.5rem', color: TOOL_COLOR }}>Suppression des pages blanches</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          L'outil va analyser chaque page et supprimer automatiquement celles qui sont vides ou quasi-vides.
        </p>
      </div>
    </>
  );

  return (
    <ToolLayout
      slug="remove-blanks"
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
      processingLabel="Analyse des pages..."
      successMessage="Nettoyage terminé !"
      successSubtitle={
        resultInfo
          ? resultInfo.removedCount > 0
            ? `${resultInfo.removedCount} page(s) blanche(s) supprimée(s) sur ${resultInfo.totalPages} pages.`
            : 'Aucune page blanche détectée — votre PDF est déjà propre !'
          : 'Votre document est prêt.'
      }
      actionLabel="Supprimer les pages blanches"
      onAction={handleSubmit}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Gérez vos PDF facilement</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Nos outils vous permettent de manipuler vos documents PDF en toute sécurité, directement dans votre navigateur. Aucune donnée n'est envoyée sur nos serveurs.
          </p>
        </div>
      }
    />
  );
}
