'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { convertPdfToPpt } from '@/features/pdf/office';
import { Projector, CheckCircle, ArrowRight, FileText, Info } from 'lucide-react';
import Script from 'next/script';

const TOOL_COLOR: [string, string] = ['#ea580c', '#c2410c'];

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function PdfToPptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('presentation.pptx');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).pdfjsLib) return;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.head.appendChild(s);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResultUrl(null);
      setError(null);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);

      const result: Uint8Array = await convertPdfToPpt(file, (p: number) => {
        setProgress(Math.min(Math.round(p), 95));
      });
      clearInterval(progressInterval);
      setProgress(100);

      const blob = new Blob([result as any], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      const outputName = file.name.replace(/\.pdf$/i, '') + '.pptx';
      setResultFilename(outputName);

      // Trigger automatic download
      const a = document.createElement('a');
      a.href = url;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResultUrl(null);
    setProgress(0);
    setError(null);
  };

  // -- STATE 1: INITIAL DROPZONE --
  if (!file && !isProcessing && !resultUrl) {
    return (
      <>
        <SEO slug="pdf-to-ppt" />
      <Header />
        <main className="tool-page-layout" style={{ padding: 0 }}>
          <div style={{
            minHeight: 'calc(100vh - 70px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              PDF en PowerPoint
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Convertissez vos fichiers PDF en présentations PowerPoint (.pptx). Structure et textes préservés.
            </p>

            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: TOOL_COLOR[0],
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(234, 88, 12, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                backgroundImage: `linear-gradient(to right, ${TOOL_COLOR[0]}, ${TOOL_COLOR[1]})`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Sélectionner le fichier PDF
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>
                ou glissez-déposez le fichier ici
              </p>
            </div>
          </div>

          {/* Below the fold: SEO and Ads */}
          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />

            <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Convertir PDF en PPT gratuitement</h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Notre convertisseur PDF en PowerPoint extrait le texte et la mise en page de vos documents PDF
                pour créer des présentations PPTX éditables. Chaque page de votre PDF est convertie en une diapositive.
                L'outil s'exécute localement dans votre navigateur pour une sécurité maximale et une confidentialité absolue de vos données.
              </p>
            </div>

            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // -- STATE 3 & 4: PROCESSING / DONE --
  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            {isProcessing ? (
              <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <h2>Conversion en cours...</h2>
                <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>Extraction des diapositives...</p>
                <div className="progress-container" style={{ marginTop: '2rem' }}>
                  <div className="progress">
                    <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: `linear-gradient(to right, ${TOOL_COLOR[0]}, ${TOOL_COLOR[1]})` }}></div>
                  </div>
                  <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
                </div>
              </div>
            ) : (
              <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle size={64} color={TOOL_COLOR[0]} />
                </div>
                <h2>🎉 Conversion PowerPoint terminée !</h2>
                <p style={{ marginBottom: '2rem' }}>Votre présentation est prête au téléchargement.</p>
                <a
                  href={resultUrl!}
                  download={resultFilename}
                  className="btn btn-primary btn-xl"
                  style={{
                    backgroundColor: TOOL_COLOR[0],
                    borderColor: TOOL_COLOR[0],
                    backgroundImage: `linear-gradient(to right, ${TOOL_COLOR[0]}, ${TOOL_COLOR[1]})`,
                    color: 'white',
                    border: 'none',
                  }}
                >
                  Télécharger le fichier PowerPoint
                </a>
                <div style={{ marginTop: '2rem' }}>
                  <button
                    className="btn btn-outline"
                    style={{ borderColor: TOOL_COLOR[0], color: TOOL_COLOR[0] }}
                    onClick={reset}
                  >
                    Convertir un autre fichier
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // -- STATE 2: WORKSPACE --
  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
        <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
          <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
            <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR[0] }}>
              {file?.name}
            </div>
            <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <FileText size={80} color={TOOL_COLOR[0]} style={{ opacity: 0.5 }} />
            </div>
            <div className="pdf-page-number">
              {((file?.size || 0) / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
        </div>

        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: TOOL_COLOR[0] }}>
              <Projector size={24} /> PDF en PowerPoint
            </h2>
          </div>
          <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Info card */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '1.2rem',
              borderRadius: '12px',
              border: `2px solid ${TOOL_COLOR[0]}`,
              background: `${TOOL_COLOR[0]}10`,
            }}>
              <div style={{ padding: '8px', background: `${TOOL_COLOR[0]}15`, borderRadius: '8px', flexShrink: 0 }}>
                <Info size={22} color={TOOL_COLOR[0]} />
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Votre document PDF sera converti en fichier de présentation PowerPoint (.pptx).
              </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <AdUnit slot="ad-workspace-sidebar" format="rectangle" />
            </div>
          </div>

          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>{error}</div>}

            <button
              className="btn btn-primary btn-xl"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '1.2rem',
                padding: '1rem',
                marginTop: '0.5rem',
                backgroundColor: TOOL_COLOR[0],
                borderColor: TOOL_COLOR[0],
                backgroundImage: `linear-gradient(to right, ${TOOL_COLOR[0]}, ${TOOL_COLOR[1]})`,
              }}
              onClick={handleConvert}
            >
              Convertir en PPTX <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
