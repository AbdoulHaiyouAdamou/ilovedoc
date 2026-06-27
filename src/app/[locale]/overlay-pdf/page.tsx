'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { overlayPdfs, OverlayMode } from '@/features/pdf/overlay';
import Copy from 'lucide-react/dist/esm/icons/copy';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#a855f7';

export default function OverlayPdfPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    isProcessing, progress, resultUrl, error,
    reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [mode, setMode] = useState<OverlayMode>('above');

  let customPhase: any = 'select';
  if (isProcessing) customPhase = 'processing';
  else if (resultUrl) customPhase = 'result';
  else if (baseFile && overlayFile) customPhase = 'workspace';

  const onDropBase = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setBaseFile(acceptedFiles[0]);
  }, []);
  const onDropOverlay = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setOverlayFile(acceptedFiles[0]);
  }, []);
  
  const dzBase = useDropzone({ onDrop: onDropBase, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });
  const dzOverlay = useDropzone({ onDrop: onDropOverlay, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const handleSubmit = useCallback(async () => {
    if (!baseFile || !overlayFile) return;
    startProcessing();
    try {
      const blob = await overlayPdfs(baseFile, overlayFile, mode, setProgress);
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      const a = document.createElement('a'); a.href = url; a.download = baseFile.name.replace(/\.pdf$/i, '_overlay.pdf');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: unknown) {
      failProcessing(err instanceof Error ? err.message : 'Erreur.');
    }
  }, [baseFile, overlayFile, mode, startProcessing, finishProcessing, failProcessing, setProgress]);

  const handleReset = () => {
    reset();
    setBaseFile(null);
    setOverlayFile(null);
  };

  const selectDropzone = (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div {...dzBase.getRootProps()} style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', borderRadius: 16, border: `2px dashed ${baseFile ? TOOL_COLOR : 'var(--glass-border)'}`, minWidth: 250, background: baseFile ? `${TOOL_COLOR}10` : 'transparent' }}>
        <input {...dzBase.getInputProps()} />
        <p style={{ fontWeight: 700, fontSize: '1.1rem', color: TOOL_COLOR }}>📄 PDF de base</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>{baseFile ? baseFile.name : 'Déposez le PDF principal'}</p>
      </div>
      <div {...dzOverlay.getRootProps()} style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', borderRadius: 16, border: `2px dashed ${overlayFile ? TOOL_COLOR : 'var(--glass-border)'}`, minWidth: 250, background: overlayFile ? `${TOOL_COLOR}10` : 'transparent' }}>
        <input {...dzOverlay.getInputProps()} />
        <p style={{ fontWeight: 700, fontSize: '1.1rem', color: TOOL_COLOR }}>📋 PDF à superposer</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>{overlayFile ? overlayFile.name : 'Déposez le PDF overlay'}</p>
      </div>
    </div>
  );

  const workspacePreview = (baseFile && overlayFile) && (
    <div style={{ position: 'relative', width: 250, height: 350 }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', borderRadius: 12, border: '2px solid var(--glass-border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.85rem' }}>PDF de base</div>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '80%', height: '80%', borderRadius: 12, border: `2px solid ${TOOL_COLOR}`, background: `${TOOL_COLOR}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TOOL_COLOR, fontSize: '0.85rem', fontWeight: 600 }}>Overlay</div>
    </div>
  );

  const workspaceSidebar = (baseFile && overlayFile) && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
        <strong>Base :</strong> {baseFile.name}<br />
        <strong>Overlay :</strong> {overlayFile.name}
      </p>
      {(['above', 'below'] as const).map(m => (
        <label key={m} style={{ display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: 12, cursor: 'pointer', border: mode === m ? `2px solid ${TOOL_COLOR}` : '2px solid var(--glass-border)', background: mode === m ? `${TOOL_COLOR}15` : 'transparent', transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', color: mode === m ? TOOL_COLOR : 'var(--text-color)' }}>{m === 'above' ? 'Au-dessus (premier plan)' : 'En-dessous (arrière-plan)'}</span>
            <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} style={{ accentColor: TOOL_COLOR }} />
          </div>
        </label>
      ))}
    </div>
  );

  return (
    <ToolLayout
      slug="overlay-pdf"
      phase={customPhase}
      file={baseFile} // Just pass one to satisfy props, but we override select UI
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={handleReset}
      onDrop={onDropBase} // Dummy
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Superposition en cours..."
      successMessage="🎉 PDF superposés !"
      successSubtitle="Votre document est prêt."
      actionLabel="Superposer"
      onAction={handleSubmit}
      customSelectDropzone={selectDropzone}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Gérez vos PDF facilement</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Nos outils vous permettent de manipuler vos documents PDF en toute sécurité, directement dans votre navigateur. Aucune donnée n&apos;est envoyée sur nos serveurs.
          </p>
        </div>
      }
    />
  );
}
