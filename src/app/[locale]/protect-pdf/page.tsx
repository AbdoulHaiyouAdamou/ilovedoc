'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { ToolLayout, useToolState } from '@/components/tools';

const ACCENT = '#dc2626';
const ACCENT_DARK = '#b91c1c';

export default function ProtectPdfPage() {
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

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [file]);

  const handleProtect = async () => {
    if (!file) return;
    if (password !== confirmPassword) {
      failProcessing("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 4) {
      failProcessing("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }

    startProcessing();
    setProgress(0);

    try {
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const encryptedBytes = await encryptPDF(fileBytes, password, password);

      const blob = new Blob([encryptedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_protege.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || "Une erreur s'est produite lors de la protection du PDF.");
    }
  };

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: '250px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ background: ACCENT, width: '100%', padding: '15px', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        Document PDF
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', color: '#64748b' }}>
        <Lock size={48} style={{ opacity: 0.2, position: 'absolute' }} />
        <span style={{ zIndex: 1, wordBreak: 'break-all' }}>{file.name}</span>
      </div>
    </div>
  );

  const workspaceSidebar = (
    <>
      <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        Définissez un mot de passe pour protéger votre fichier PDF
      </p>

      <div style={{ marginBottom: 16, position: 'relative' }}>
        <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 14 }} />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Saisir le mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: ACCENT }}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div style={{ marginBottom: 24, position: 'relative' }}>
        <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 14 }} />
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Répétez le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
        />
        <button
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: ACCENT }}
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', fontWeight: 'bold', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#ef4444' }}>
          <AlertCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
          {error}
        </div>
      )}
    </>
  );

  return (
    <ToolLayout
      slug="protect-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { reset(); setPassword(''); setConfirmPassword(''); }}
      onDrop={onDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Chiffrement en cours..."
      successMessage="PDF protégé avec succès !"
      successSubtitle="Votre fichier est maintenant sécurisé par un mot de passe."
      actionLabel="Protéger le PDF"
      onAction={handleProtect}
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Protéger un PDF avec un mot de passe</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Sécurisez vos documents PDF en ajoutant un mot de passe fort. 
            Empêchez l'accès non autorisé à vos fichiers sensibles. Le traitement est 100% sécurisé et 
            vos fichiers ne quittent jamais votre navigateur.
          </p>
        </div>
      }
    />
  );
}
