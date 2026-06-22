'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { multiPageLayout, LayoutMode } from '@/features/pdf/multiPageLayout';
import { LayoutGrid } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#14b8a6';

export default function MultiPageLayoutPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [mode, setMode] = useState<LayoutMode>('2-up');

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    startProcessing();
    try {
      const blob = await multiPageLayout(file, mode, setProgress);
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.pdf$/i, `_${mode}.pdf`);
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: unknown) {
      failProcessing(err instanceof Error ? err.message : 'Erreur.');
    }
  }, [file, mode, startProcessing, finishProcessing, failProcessing, setProgress]);

  const modes: { value: LayoutMode; label: string; desc: string }[] = [
    { value: '2-up', label: '2 pages/feuille', desc: '2 colonnes, 1 rangée' },
    { value: '4-up', label: '4 pages/feuille', desc: '2 colonnes, 2 rangées' },
    { value: '6-up', label: '6 pages/feuille', desc: '3 colonnes, 2 rangées' },
    { value: '9-up', label: '9 pages/feuille', desc: '3 colonnes, 3 rangées' },
  ];

  const workspacePreview = file && (
    <div style={{ width: 320, height: 220, border: '2px solid var(--glass-border)', borderRadius: 12, display: 'grid', gridTemplateColumns: `repeat(${mode === '6-up' || mode === '9-up' ? 3 : 2}, 1fr)`, gridTemplateRows: `repeat(${mode === '2-up' ? 1 : mode === '9-up' ? 3 : 2}, 1fr)`, gap: 4, padding: 8, background: 'white' }}>
      {Array.from({ length: parseInt(mode) }).map((_, i) => (
        <div key={i} style={{ border: '1px solid #ddd', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#999', background: '#f9f9f9' }}>
          P{i + 1}
        </div>
      ))}
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {modes.map(m => (
        <label key={m.value} style={{ display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: 12, cursor: 'pointer', border: mode === m.value ? `2px solid ${TOOL_COLOR}` : '2px solid var(--glass-border)', background: mode === m.value ? `${TOOL_COLOR}15` : 'transparent', transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 'bold', color: mode === m.value ? TOOL_COLOR : 'var(--text-color)' }}>{m.label}</span>
            <input type="radio" name="mode" checked={mode === m.value} onChange={() => setMode(m.value)} style={{ accentColor: TOOL_COLOR }} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.desc}</span>
        </label>
      ))}
    </div>
  );

  return (
    <ToolLayout
      slug="multi-page-layout"
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
      processingLabel="Mise en page en cours..."
      successMessage="🎉 Mise en page terminée !"
      successSubtitle="Votre PDF est prêt pour l'impression."
      actionLabel="Appliquer"
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
