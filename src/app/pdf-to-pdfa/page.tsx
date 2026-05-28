'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { convertToPdfa } from '@/features/pdf/toPdfa';
import { getPdfPageCount } from '@/features/pdf/split';
import { Archive, Settings, ArrowRight, CheckCircle, FileText } from 'lucide-react';

export default function PdfToPdfaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [conformance, setConformance] = useState<'pdfa-1b' | 'pdfa-2b'>('pdfa-2b');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [needsPassword, setNeedsPassword] = useState<boolean>(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      setPassword('');
      setNeedsPassword(false);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
      } catch (err) {
        setError("Impossible de lire ce PDF. Il est peut-être corrompu.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1
  });

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const resultBytes = await convertToPdfa(file, {
        conformance,
        password: password || undefined,
        onProgress: (p) => setProgress(p)
      });

      const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_pdfa.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      if (err.message === 'PASSWORD_REQUIRED') {
        setNeedsPassword(true);
        setError("Ce fichier est protégé. Veuillez saisir le mot de passe pour le convertir.");
      } else {
        setError(err.message || 'Une erreur est survenue lors de la conversion.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // State 1: Dropzone
  if (!file) {
    return (
      <>
        <SEO slug="pdf-to-pdfa" />
      <Header />
        <main className="tool-page-layout" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            minHeight: 'calc(100vh - 70px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              Convertir PDF en PDF/A
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Convertissez vos documents PDF au format PDF/A (standard ISO pour l'archivage à long terme).
            </p>

            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(13, 148, 136, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Sélectionner le fichier PDF
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>ou déposez le PDF ici</p>
            </div>
          </div>

          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Qu'est-ce que le format PDF/A et comment l'obtenir</h2>
              <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                Le PDF/A est une version normalisée ISO du format PDF conçue pour la conservation et l'archivage à long terme des documents électroniques. Contrairement au PDF standard, le PDF/A garantit qu'un document pourra être ouvert et affiché exactement de la même manière dans plusieurs décennies, en interdisant les fonctionnalités dynamiques, les polices non incorporées ou les scripts externes.
              </p>
              <ol className="steps-list">
                <li>Sélectionnez votre fichier PDF à archiver.</li>
                <li>Choisissez le niveau de conformité PDF/A (ex: PDF/A-2b pour la compatibilité standard).</li>
                <li>Cliquez sur "Convertir en PDF/A" pour injecter les balises de conformité de métadonnées.</li>
                <li>Téléchargez votre fichier archivé.</li>
              </ol>
            </section>
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 2: Processing/Result
  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            {isProcessing ? (
              <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <h2>Conversion en PDF/A en cours...</h2>
                <div className="progress-container" style={{ marginTop: '2rem' }}>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${progress}%`, backgroundColor: '#0d9488' }}></div>
                  </div>
                  <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
                </div>
              </div>
            ) : (
              <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle size={64} color="#10b981" />
                </div>
                <h2>🎉 Conversion PDF/A réussie !</h2>
                <p style={{ marginBottom: '2rem' }}>Votre document est maintenant conforme aux standards d'archivage à long terme.</p>
                <a href={resultUrl!} download={`${file.name.replace('.pdf', '')}_pdfa.pdf`} className="btn btn-xl" style={{ backgroundColor: '#0d9488', color: 'white' }}>
                  Télécharger le PDF/A
                </a>
                <div style={{ marginTop: '2rem' }}>
                  <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); }}>Traiter un autre fichier</button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 3: Workspace
  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>

      <div className="workspace">
        <div className="workspace-preview" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="pdf-page-card" style={{ width: '220px', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <FileText size={64} color="#0d9488" />
            <span style={{ fontSize: '14px', fontWeight: 'bold', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
              {totalPages} pages
            </span>
          </div>
        </div>

        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Settings size={24} /> Options PDF/A
            </h2>
          </div>

          <div className="workspace-sidebar-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>
                Niveau de conformité PDF/A
              </label>
              <select
                value={conformance}
                onChange={(e) => setConformance(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-color)',
                  color: 'var(--color-text)',
                  fontSize: '14px'
                }}
              >
                <option value="pdfa-2b">PDF/A-2b (Recommandé - Standard moderne)</option>
                <option value="pdfa-1b">PDF/A-1b (Ancien standard - Plus strict)</option>
              </select>
            </div>

            {needsPassword && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text)' }}>
                  Mot de passe du document :
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-color)',
                    color: 'var(--color-text)',
                    fontSize: '14px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConvert();
                    }
                  }}
                />
              </div>
            )}

            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(13, 148, 136, 0.05)',
              border: '1px solid rgba(13, 148, 136, 0.2)',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.5',
              color: 'var(--color-text-secondary)'
            }}>
              💡 Le niveau <strong>B (Basic)</strong> assure que le contenu visuel du PDF sera reproduit de manière fiable à long terme. C'est le format le plus couramment accepté pour le dépôt légal des documents.
            </div>

            {/* Ads placeholder */}
            <div style={{ marginTop: '2rem' }}>
              <AdUnit slot="ad-workspace-sidebar" format="rectangle" />
            </div>
          </div>

          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{error}</div>}

            <button
              className="btn btn-xl"
              onClick={handleConvert}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1.2rem',
                padding: '1rem',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Convertir en PDF/A <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
