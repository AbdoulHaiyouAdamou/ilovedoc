'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { sanitizePdf, SanitizeOptions } from '@/features/pdf/sanitize';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#10b981';

export default function SanitizePdfPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [options, setOptions] = useState<SanitizeOptions>({ removeJavaScript: true, removeLinks: true, removeMetadata: true, removeAttachments: true });
  const toggle = (key: keyof SanitizeOptions) => setOptions(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    startProcessing();
    try {
      const blob = await sanitizePdf(file, options, setProgress);
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      const a = document.createElement('a');
      a.href = url; a.download = file.name.replace(/\.pdf$/i, '_sanitized.pdf');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: unknown) {
      failProcessing(err instanceof Error ? err.message : 'Erreur.');
    }
  }, [file, options, startProcessing, finishProcessing, failProcessing, setProgress]);

  const sanitizeItems: { key: keyof SanitizeOptions; label: string; desc: string }[] = [
    { key: 'removeJavaScript', label: 'Supprimer le JavaScript', desc: 'Élimine les scripts potentiellement malveillants.' },
    { key: 'removeLinks', label: 'Supprimer les liens', desc: 'Retire les hyperliens et URLs cliquables.' },
    { key: 'removeMetadata', label: 'Supprimer les métadonnées', desc: 'Efface titre, auteur, sujet et données XMP.' },
    { key: 'removeAttachments', label: 'Supprimer les pièces jointes', desc: 'Retire les fichiers intégrés.' },
  ];

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: 300, height: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
      <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>{file.name}</div>
      <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <ShieldCheck size={80} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
      </div>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {sanitizeItems.map(item => (
        <label key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '1rem', borderRadius: 12, cursor: 'pointer', border: options[item.key] ? `2px solid ${TOOL_COLOR}` : '2px solid var(--glass-border)', background: options[item.key] ? `${TOOL_COLOR}10` : 'transparent', transition: 'all 0.2s' }}>
          <input type="checkbox" checked={options[item.key]} onChange={() => toggle(item.key)} style={{ accentColor: TOOL_COLOR, marginTop: 3 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
          </div>
        </label>
      ))}
    </div>
  );

  return (
    <ToolLayout
      slug="sanitize-pdf"
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
      processingLabel="Nettoyage en cours..."
      successMessage="🎉 PDF nettoyé !"
      successSubtitle="Votre document est désormais sécurisé."
      actionLabel="Nettoyer le PDF"
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
