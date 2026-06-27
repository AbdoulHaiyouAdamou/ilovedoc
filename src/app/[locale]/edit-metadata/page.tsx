'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { readPdfMetadata, writePdfMetadata, PdfMetadata } from '@/features/pdf/metadata';
import Info from 'lucide-react/dist/esm/icons/info';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#0ea5e9';

export default function EditMetadataPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop: handleDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [deleteAll, setDeleteAll] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleDrop(acceptedFiles);
      const f = acceptedFiles[0];
      try {
        const meta = await readPdfMetadata(f);
        setMetadata(meta);
      } catch {
        failProcessing('Impossible de lire les métadonnées de ce PDF.');
      }
    }
  }, [handleDrop, failProcessing]);

  const updateField = (field: keyof PdfMetadata, value: string) => {
    if (metadata) setMetadata({ ...metadata, [field]: value });
  };

  const handleSubmit = useCallback(async () => {
    if (!file || !metadata) return;
    startProcessing();
    try {
      const interval = setInterval(() => setProgress(p => Math.min(p + 15, 90)), 150);
      const blob = await writePdfMetadata(file, metadata, deleteAll);
      clearInterval(interval);
      setProgress(100);
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '_metadata.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      failProcessing(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  }, [file, metadata, deleteAll, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: TOOL_COLOR }}>Aperçu des métadonnées actuelles</h3>
      {metadata && (
        <div style={{ width: '100%', fontSize: '0.95rem' }}>
          {Object.entries(metadata).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <strong style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</strong>
              <span style={{ color: 'var(--color-text-secondary)', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{val || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.8rem', borderRadius: 8, border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
        <input type="checkbox" checked={deleteAll} onChange={e => setDeleteAll(e.target.checked)} style={{ accentColor: TOOL_COLOR }} />
        <Trash2 size={16} /> Supprimer toutes les métadonnées
      </label>
      {!deleteAll && metadata && (
        <>
          {(['title', 'author', 'subject', 'keywords', 'creator', 'producer'] as const).map(field => (
            <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{field === 'title' ? 'Titre' : field === 'author' ? 'Auteur' : field === 'subject' ? 'Sujet' : field === 'keywords' ? 'Mots-clés' : field === 'creator' ? 'Créateur' : 'Producteur'}</label>
              <input type="text" value={metadata[field]} onChange={e => updateField(field, e.target.value)}
                style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.9rem' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Date création</label>
              <input type="datetime-local" value={metadata.creationDate} onChange={e => updateField('creationDate', e.target.value)}
                style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.85rem' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Date modification</label>
              <input type="datetime-local" value={metadata.modificationDate} onChange={e => updateField('modificationDate', e.target.value)}
                style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.85rem' }} />
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <ToolLayout
      slug="edit-metadata"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { reset(); setMetadata(null); }}
      onDrop={onDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Mise à jour en cours..."
      successMessage="🎉 Métadonnées mises à jour !"
      successSubtitle="Votre document est prêt."
      actionLabel="Mettre à jour"
      onAction={handleSubmit}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: 800 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi modifier les métadonnées ?</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
            Les métadonnées contiennent des informations importantes sur votre document : titre, auteur, sujet, mots-clés. Modifier ces informations améliore l&apos;organisation de vos fichiers, le référencement de vos documents et protège votre vie privée en supprimant les données sensibles.
          </p>
        </div>
      }
    />
  );
}
