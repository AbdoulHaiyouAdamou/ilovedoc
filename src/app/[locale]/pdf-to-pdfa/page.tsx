'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { convertToPdfa } from '@/features/pdf/toPdfa';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Info from 'lucide-react/dist/esm/icons/info';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#0d9488'; // Teal for PDF/A

export default function PdfToPdfaPage() {
  const tTools = useTranslations('Tools');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [conformance, setConformance] = useState<'pdfa-1b' | 'pdfa-2b'>('pdfa-2b');
  const [password, setPassword] = useState<string>('');
  const [needsPassword, setNeedsPassword] = useState<boolean>(false);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setPassword('');
    setNeedsPassword(false);
    onDrop(acceptedFiles);
  }, [onDrop]);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    startProcessing();
    try {
      const resultBytes = await convertToPdfa(file, {
        conformance,
        password: password || undefined,
        onProgress: (p) => setProgress(p)
      });

      const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '_pdfa.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      if (err.message === 'PASSWORD_REQUIRED') {
        setNeedsPassword(true);
        failProcessing("Ce fichier est protégé. Veuillez saisir le mot de passe pour le convertir.");
      } else {
        failProcessing(err.message || 'Une erreur est survenue lors de la conversion.');
      }
    }
  }, [file, conformance, password, startProcessing, finishProcessing, failProcessing, setProgress]);

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
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>
          Niveau de conformité PDF/A
        </label>
        <select
          value={conformance}
          onChange={(e) => setConformance(e.target.value as any)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--color-text)', fontSize: '14px' }}
        >
          <option value="pdfa-2b">PDF/A-2b (Recommandé - Standard moderne)</option>
          <option value="pdfa-1b">PDF/A-1b (Ancien standard - Plus strict)</option>
        </select>
      </div>

      {needsPassword && (
        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text)' }}>
            Mot de passe du document :
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez le mot de passe..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--color-text)', fontSize: '14px' }}
            onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
          />
        </div>
      )}

      <div style={{ padding: '1rem', backgroundColor: `${TOOL_COLOR}15`, border: `1px solid ${TOOL_COLOR}40`, borderRadius: '8px', fontSize: '13px', lineHeight: '1.5', color: 'var(--color-text-secondary)' }}>
        💡 Le niveau <strong>B (Basic)</strong> assure que le contenu visuel du PDF sera reproduit de manière fiable à long terme. C'est le format le plus couramment accepté pour le dépôt légal des documents.
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="pdf-to-pdfa"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={reset}
      onDrop={handleDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Conversion en PDF/A en cours..."
      successMessage="🎉 Conversion PDF/A réussie !"
      successSubtitle="Votre document est maintenant conforme aux standards d'archivage à long terme."
      actionLabel="Convertir en PDF/A"
      onAction={handleConvert}
      downloadName={file ? file.name.replace(/\.pdf$/i, '_pdfa.pdf') : undefined}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Qu'est-ce que le format PDF/A et comment l'obtenir</h2>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
            Le PDF/A est une version normalisée ISO du format PDF conçue pour la conservation et l'archivage à long terme des documents électroniques. Contrairement au PDF standard, le PDF/A garantit qu'un document pourra être ouvert et affiché exactement de la même manière dans plusieurs décennies, en interdisant les fonctionnalités dynamiques, les polices non incorporées ou les scripts externes.
          </p>
        </div>
      }
    />
  );
}
