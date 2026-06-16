'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { getPdfInfo, PdfInfo } from '@/features/pdf/pdfInfo';
import { FileText, CheckCircle, Lock, Unlock } from 'lucide-react';

const TOOL_COLOR = '#6366f1';
const GRADIENT = 'linear-gradient(to right, #6366f1, #4f46e5)';

export default function PdfInfoPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      setError(null);
      setLoading(true);
      try {
        const result = await getPdfInfo(f);
        setInfo(result);
      } catch {
        setError('Impossible de lire les informations de ce PDF.');
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  if (!file) {
    return (
      <>
        <SEO slug="pdf-info" />
        <Header />
        <main className="tool-page-layout" style={{ padding: 0 }}>
          <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
              {tTools('pdf-info.name')}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: 800, textAlign: 'center', lineHeight: 1.5 }}>
              {tTools('pdf-info.description')}
            </p>
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{ backgroundColor: TOOL_COLOR, color: 'white', border: 'none', padding: '1.8rem 4rem', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: 12, boxShadow: `0 10px 25px ${TOOL_COLOR}66`, cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                {tCommon('select_file')}
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>{tCommon('or_drop')}</p>
            </div>
          </div>
          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

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

  return (
    <>
      <Header />
      <main className="tool-page-layout">
        <div className="container" style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
          {loading ? (
            <div className="glass" style={{ padding: '4rem', borderRadius: '1rem', textAlign: 'center' }}>
              <h2>Analyse en cours...</h2>
            </div>
          ) : error ? (
            <div className="glass" style={{ padding: '4rem', borderRadius: '1rem', textAlign: 'center' }}>
              <p className="text-danger" style={{ fontWeight: 'bold' }}>{error}</p>
            </div>
          ) : info ? (
            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10, color: TOOL_COLOR }}>
                <FileText size={28} /> Propriétés du PDF
              </h2>
              <div style={{ display: 'grid', gap: 0 }}>
                {infoRows.map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{row.label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>
                      {row.icon} {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="btn btn-outline" onClick={() => { setFile(null); setInfo(null); }}>Analyser un autre fichier</button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
