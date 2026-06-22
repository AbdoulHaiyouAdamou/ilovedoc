'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { addAttachmentsToPdf } from '@/features/pdf/attachments';
import { Paperclip, X } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#8b5cf6';

export default function AddAttachmentsPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [attachments, setAttachments] = useState<File[]>([]);

  const handleAddAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeAttachment = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = useCallback(async () => {
    if (!file || attachments.length === 0) return;
    startProcessing();
    try {
      const interval = setInterval(() => setProgress(p => Math.min(p + 20, 90)), 150);
      const blob = await addAttachmentsToPdf(file, attachments);
      clearInterval(interval); setProgress(100);
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.pdf$/i, '_with_attachments.pdf');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: unknown) {
      failProcessing(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  }, [file, attachments, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: 300, height: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
      <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>{file.name}</div>
      <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 8 }}>
        <Paperclip size={60} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{attachments.length} pièce(s) jointe(s)</span>
      </div>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '1rem', borderRadius: 8, border: `2px dashed ${TOOL_COLOR}`, cursor: 'pointer', color: TOOL_COLOR, fontWeight: 600 }}>
        <Paperclip size={18} /> Ajouter des fichiers
        <input type="file" multiple onChange={handleAddAttachments} style={{ display: 'none' }} />
      </label>
      {attachments.map((att, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{att.name}</span>
          <button onClick={() => removeAttachment(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={16} /></button>
        </div>
      ))}
    </div>
  );

  return (
    <ToolLayout
      slug="add-attachments"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { reset(); setAttachments([]); }}
      onDrop={onDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Intégration en cours..."
      successMessage="🎉 Pièces jointes ajoutées !"
      successSubtitle={`${attachments.length} fichier(s) intégré(s).`}
      actionLabel="Intégrer les pièces jointes"
      onAction={handleSubmit}
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
