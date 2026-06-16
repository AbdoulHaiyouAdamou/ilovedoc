'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { readPdfMetadata, writePdfMetadata, PdfMetadata } from '@/features/pdf/metadata';
import { Info, CheckCircle, ArrowRight, Trash2 } from 'lucide-react';

const TOOL_COLOR = '#0ea5e9';
const GRADIENT = 'linear-gradient(to right, #0ea5e9, #0284c7)';

export default function EditMetadataPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteAll, setDeleteAll] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      try {
        const meta = await readPdfMetadata(f);
        setMetadata(meta);
      } catch {
        setError('Impossible de lire les métadonnées de ce PDF.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const updateField = (field: keyof PdfMetadata, value: string) => {
    if (metadata) setMetadata({ ...metadata, [field]: value });
  };

  const handleSubmit = async () => {
    if (!file || !metadata) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const interval = setInterval(() => setProgress(p => Math.min(p + 15, 90)), 150);
      const blob = await writePdfMetadata(file, metadata, deleteAll);
      clearInterval(interval);
      setProgress(100);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '_metadata.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <>
        <SEO slug="edit-metadata" />
        <Header />
        <main className="tool-page-layout" style={{ padding: 0 }}>
          <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>Modifier les métadonnées</h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: 800, textAlign: 'center', lineHeight: 1.5 }}>
              Modifiez le titre, l&apos;auteur, le sujet et les mots-clés de votre document PDF.
            </p>
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{ backgroundColor: TOOL_COLOR, color: 'white', border: 'none', padding: '1.8rem 4rem', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: 12, boxShadow: `0 10px 25px ${TOOL_COLOR}66`, cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                Sélectionner le fichier PDF
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>ou déposez le PDF ici</p>
            </div>
          </div>
          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: 800 }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi modifier les métadonnées ?</h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Les métadonnées contiennent des informations importantes sur votre document : titre, auteur, sujet, mots-clés. Modifier ces informations améliore l&apos;organisation de vos fichiers, le référencement de vos documents et protège votre vie privée en supprimant les données sensibles.
              </p>
            </div>
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            {isProcessing ? (
              <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <h2>Mise à jour en cours...</h2>
                <div className="progress-container" style={{ marginTop: '2rem' }}>
                  <div className="progress"><div className="progress-bar" style={{ width: `${progress}%`, backgroundImage: GRADIENT }} /></div>
                  <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
                </div>
              </div>
            ) : (
              <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle size={64} color={TOOL_COLOR} />
                </div>
                <h2>🎉 Métadonnées mises à jour !</h2>
                <p style={{ marginBottom: '2rem' }}>Votre document est prêt.</p>
                <a href={resultUrl!} download className="btn btn-primary btn-xl" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }}>Télécharger le PDF</a>
                <div style={{ marginTop: '2rem' }}>
                  <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); setMetadata(null); }}>Modifier un autre fichier</button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: 728, margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
        <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
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
        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: TOOL_COLOR }}>
              <Info size={24} /> Métadonnées
            </h2>
          </div>
          <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
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
          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 10 }}>{error}</div>}
            <button className="btn btn-primary btn-xl" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 10, fontSize: '1.2rem', padding: '1rem', marginTop: '0.5rem', backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }} onClick={handleSubmit}>
              Mettre à jour <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
