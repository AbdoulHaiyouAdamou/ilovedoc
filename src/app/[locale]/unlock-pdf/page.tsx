'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Unlock from 'lucide-react/dist/esm/icons/unlock';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import KeyRound from 'lucide-react/dist/esm/icons/key-round';
import { unlockPDF } from '@/features/pdf/unlock';
import { getPdfPageCount } from '@/features/pdf/split';
import { ToolLayout, useToolState } from '@/components/tools';

const ACCENT = '#16a34a';
const ACCENT_DARK = '#15803d';

export default function UnlockPdfPage() {
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

  const [totalPages, setTotalPages] = useState<number>(1);
  const [password, setPassword] = useState<string>('');
  const [needsPassword, setNeedsPassword] = useState<boolean>(false);

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onDrop(acceptedFiles);
      setPassword('');
      setNeedsPassword(false);
      try {
        const count = await getPdfPageCount(acceptedFiles[0]);
        setTotalPages(count);
      } catch {
        setTotalPages(1);
      }
    }
  }, [onDrop]);

  const handleUnlock = useCallback(async () => {
    if (!file) return;
    startProcessing();
    try {
      const modifiedBytes = await unlockPDF(file, {
        password: password || undefined,
        onProgress: (p) => setProgress(p),
      });
      const blob = new Blob([modifiedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_unlocked.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      if (err.message === 'PASSWORD_REQUIRED') {
        setNeedsPassword(true);
        failProcessing("Ce fichier est protégé. Veuillez saisir le mot de passe pour le déverrouiller.");
      } else {
        failProcessing(err.message || 'Une erreur est survenue lors du déverrouillage.');
      }
    }
  }, [file, password, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div
      className="pdf-page-card"
      style={{
        width: '200px',
        height: '280px',
        border: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="pdf-page-header" style={{ backgroundColor: ACCENT }}>
        Fichier Protégé
      </div>
      <div
        className="pdf-page-content"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}
      >
        <Lock size={64} color={ACCENT} opacity={0.8} />
      </div>
      <div
        className="pdf-page-number"
        style={{
          borderTop: '1px solid var(--glass-border)',
          padding: '10px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          wordBreak: 'break-all',
        }}
      >
        {file.name}
      </div>
    </div>
  );

  const workspaceSidebar = (
    <>
      <div
        style={{
          padding: '1.5rem',
          background: 'rgba(22, 163, 74, 0.1)',
          border: '2px dashed #16a34a',
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ color: ACCENT, marginBottom: '10px', fontSize: '1.2rem' }}>Prêt à déverrouiller</h3>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--color-text-secondary)',
            marginBottom: needsPassword ? '1rem' : '0',
          }}
        >
          Cliquez sur le bouton ci-dessous pour retirer la protection du document.
        </p>
        {needsPassword && (
          <div style={{ marginTop: '1rem', textAlign: 'left' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: 'var(--color-text-primary)',
              }}
            >
              Mot de passe du document :
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound
                size={18}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-tertiary)',
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe..."
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 35px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--color-text-primary)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUnlock();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <ToolLayout
      slug="unlock-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => {
        reset();
        setNeedsPassword(false);
        setPassword('');
      }}
      onDrop={handleDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Déverrouillage en cours..."
      successMessage="Le PDF a été déverrouillé !"
      successSubtitle="Votre document n'a plus de mot de passe ni de restrictions."
      actionLabel="Déverrouiller PDF"
      onAction={handleUnlock}
      seoSection={
        <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment déverrouiller un PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez votre document PDF sécurisé.</li>
            <li>Si votre fichier est protégé par un mot de passe utilisateur, saisissez-le.</li>
            <li>Cliquez sur le bouton "Déverrouiller PDF".</li>
            <li>Téléchargez votre fichier PDF sans mot de passe ni restrictions.</li>
          </ol>
        </section>
      }
    />
  );
}
