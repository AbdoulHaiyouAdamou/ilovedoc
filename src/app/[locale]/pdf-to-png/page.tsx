'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { convertPdfToImages } from '@/features/pdf/pdfToImage';
import { Palette, FilePlus, CheckCircle2 } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#3b82f6'; // Blue for PNG

export default function PdfToPngPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');

  const handleConvert = useCallback(async () => {
    if (!file) return;
    startProcessing();
    try {
      const zipBlob = await convertPdfToImages(file, { format: 'png', quality }, setProgress);
      const url = URL.createObjectURL(zipBlob);
      finishProcessing(url);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '_images.zip');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || "Une erreur s'est produite lors de la conversion.");
    }
  }, [file, quality, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: 300, height: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
      <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>{file.name}</div>
      <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 8 }}>
        <Palette size={60} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Convertir en PNG</span>
      </div>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        className="workspace-option-card active"
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'var(--glass-bg)', border: `2px solid ${TOOL_COLOR}`, borderRadius: 12, textAlign: 'left', cursor: 'pointer' }}
      >
        <div style={{ padding: 8, background: `${TOOL_COLOR}15`, borderRadius: 8 }}>
          <Palette size={24} color={TOOL_COLOR} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TOOL_COLOR, textTransform: 'uppercase', marginBottom: 4 }}>PAGE EN PNG</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Toutes les pages de ce PDF seront converties.</div>
        </div>
        <CheckCircle2 size={20} color={TOOL_COLOR} style={{ marginTop: 2 }} />
      </button>

      <button
        className="workspace-option-card"
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'transparent', border: `1px solid var(--glass-border)`, borderRadius: 12, textAlign: 'left', cursor: 'pointer', opacity: 0.6 }}
        onClick={() => alert("L'extraction d'images natives est une fonctionnalité avancée en cours de développement.")}
      >
        <div style={{ padding: 8, background: 'var(--glass-bg)', borderRadius: 8 }}>
          <FilePlus size={24} color="var(--color-text-secondary)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>EXTRAIRE IMAGES</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Extraire les images incrustées.</div>
        </div>
      </button>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8, display: 'block' }}>Qualité de l'image</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setQuality('medium')} style={{ flex: 1, padding: '12px 8px', borderRadius: 8, border: quality === 'medium' ? `2px solid ${TOOL_COLOR}` : '1px solid var(--glass-border)', background: quality === 'medium' ? `${TOOL_COLOR}10` : 'transparent', color: quality === 'medium' ? TOOL_COLOR : 'var(--text-color)', fontWeight: 500, cursor: 'pointer' }}>Normal</button>
          <button onClick={() => setQuality('high')} style={{ flex: 1, padding: '12px 8px', borderRadius: 8, border: quality === 'high' ? `2px solid ${TOOL_COLOR}` : '1px solid var(--glass-border)', background: quality === 'high' ? `${TOOL_COLOR}10` : 'transparent', color: quality === 'high' ? TOOL_COLOR : 'var(--text-color)', fontWeight: 500, cursor: 'pointer' }}>Élevée</button>
        </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="pdf-to-png"
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
      successMessage="🎉 Vos images sont prêtes !"
      successSubtitle="Le PDF a été converti en images PNG avec succès."
      actionLabel="Convertir en PNG"
      onAction={handleConvert}
      downloadName={file ? file.name.replace(/\.pdf$/i, '_images.zip') : undefined}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Convertir PDF en PNG avec transparence</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Extrayez facilement chaque page de votre document PDF en image PNG avec gestion de la transparence.
            Traitement 100% sécurisé dans le navigateur. Vos fichiers ne sont jamais envoyés sur nos serveurs.
          </p>
        </div>
      }
    />
  );
}
