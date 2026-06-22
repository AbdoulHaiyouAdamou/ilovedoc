'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Lock, Unlock } from 'lucide-react';
import { getPdfInfo, PdfInfo } from '@/features/pdf/pdfInfo';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#6366f1';
const GRADIENT = 'linear-gradient(to right, #6366f1, #4f46e5)';

export default function PdfInfoPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file,
    phase,
    onDrop,
    reset,
  } = useToolState();

  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setError(null);
      setLoading(true);
      setInfo(null);
      try {
        const result = await getPdfInfo(f);
        setInfo(result);
      } catch {
        setError('Impossible de lire les informations de ce PDF.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (file) {
      handleDrop([file]);
    }
  }, [file]);

  const infoRows: { label: string; value: string; icon?: React.ReactNode }[] = info ? [
    { label: 'Nom du fichier', value: info.fileName },
    { label: 'Taille', value: info.fileSizeFormatted },
    { label: 'Nombre de pages', value: String(info.pageCount) },
    { label: 'Version PDF', value: info.pdfVersion },
    { label: 'Dimensions (pt)', value: `${info.pageWidthPt} × ${info.pageHeightPt}` },
    { label: 'Dimensions (mm)', value: `${info.pageWidthMm} × ${info.pageHeightMm}` },
    { label: 'Chiffré', value: info.isEncrypted ? 'Oui' : 'Non', icon: info.isEncrypted ? <Lock size={16} color="#ef4444" /> : <Unlock size={16} color="#10b981" /> },
    { label: 'Titre', value: info.title || '—' },
    { label: 'Auteur', value: info.author || '—' },
    { label: 'Sujet', value: info.subject || '—' },
    { label: 'Mots-clés', value: info.keywords || '—' },
    { label: 'Créateur', value: info.creator || '—' },
    { label: 'Producteur', value: info.producer || '—' },
    { label: 'Date de création', value: info.creationDate || '—' },
    { label: 'Date de modification', value: info.modificationDate || '—' },
  ] : [];

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
      <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>
        {file.name}
      </div>
      <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <FileText size={80} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
      </div>
    </div>
  );

  const workspaceSidebar = (
    <>
      {info ? (
        <div style={{ padding: '1.5rem', borderRadius: '12px', border: `2px solid ${TOOL_COLOR}4d`, background: `${TOOL_COLOR}0d` }}>
          <h3 style={{ marginBottom: '1rem', color: TOOL_COLOR }}>Propriétés du PDF</h3>
          {infoRows.map((row, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>{row.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: '0.85rem', maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>
                {row.icon} {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Chargement des informations du PDF...
        </p>
      )}
    </>
  );

  return (
    <div>
      <ToolLayout
        slug="pdf-info"
        phase={phase}
        file={file}
        isProcessing={false}
        progress={0}
        resultUrl={null}
        error={error}
        onReset={() => { reset(); setInfo(null); setError(null); }}
        onDrop={(files) => {
          onDrop(files);
          handleDrop(files);
        }}
        workspacePreview={workspacePreview}
        workspaceSidebar={workspaceSidebar}
        processingLabel="Analyse en cours..."
        successMessage=""
        successSubtitle=""
        actionLabel="OK"
        onAction={() => {}}
        seoSection={
          <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi utiliser notre outil d'informations ?</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Comprendre la structure technique de vos documents PDF vous aide à les optimiser correctement. Notre outil analyse votre fichier et affiche toutes les métadonnées importantes : taille, nombre de pages, version, dimensions, et bien plus. Entièrement côté client pour préserver votre confidentialité.
            </p>
          </div>
        }
      />
    </div>
  );
}
