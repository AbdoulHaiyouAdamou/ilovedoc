'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import ImageOff from 'lucide-react/dist/esm/icons/image-off';
import { removeImagesFromPdf } from '@/features/pdf/removeImages';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#ef4444';
const GRADIENT = 'linear-gradient(to right, #ef4444, #dc2626)';

export default function RemoveImagesPage() {
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

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    startProcessing();
    setProgress(0);

    try {
      const blob = await removeImagesFromPdf(file, setProgress);
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '_no_images.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err instanceof Error ? err.message : 'Erreur.');
    }
  }, [file, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
      <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>
        {file.name}
      </div>
      <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <ImageOff size={80} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
      </div>
    </div>
  );

  const workspaceSidebar = (
    <>
      <div style={{ padding: '1.5rem', borderRadius: '12px', border: `2px solid ${TOOL_COLOR}4d`, background: `${TOOL_COLOR}0d` }}>
        <h3 style={{ marginBottom: '0.5rem', color: TOOL_COLOR }}>Suppression des images</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          Toutes les images de ce PDF seront supprimées. Le texte et les annotations seront conservés.
        </p>
      </div>
    </>
  );

  return (
    <ToolLayout
      slug="remove-images"
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
      processingLabel="Suppression des images..."
      successMessage="Images supprimées !"
      successSubtitle="Votre PDF allégé est prêt."
      actionLabel="Supprimer les images"
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
