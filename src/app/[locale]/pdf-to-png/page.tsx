'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import { Palette, AlertCircle, Download, CheckCircle2, ChevronRight, Settings2, FilePlus } from 'lucide-react';
import { getToolBySlug } from '@/config/tools';
import AdUnit from '@/components/common/AdUnit';
import Head from 'next/head';
import Script from 'next/script';
import { convertPdfToImages } from '@/features/pdf/pdfToImage';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';

const tool = getToolBySlug('pdf-to-png')!;

export default function PdfToPngPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setIsDone(false);
      setDownloadUrl(null);
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
    setProgress(0);
    setError(null);

    try {
      const zipBlob = await convertPdfToImages(file, { format: 'png', quality }, setProgress);
      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
      setIsDone(true);
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la conversion.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setIsDone(false);
    setDownloadUrl(null);
    setProgress(0);
  };

  return (
    <>
      <SEO slug="pdf-to-png" />
      <Header />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="lazyOnload" />
      <main className="tool-page-layout" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* -- STATE 1: DROPZONE -- */}
        {!file && !isProcessing && !isDone && (
          <div style={{ minHeight: 'calc(100vh - 70px)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              {tTools('pdf-to-png.name')}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tTools('pdf-to-png.description')}
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: tool.color[0], 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: `0 10px 25px ${tool.color[0]}66`,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {tCommon('select_file')}
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>
                ou glissez-déposez le fichier ici
              </p>
            </div>
          </div>
        )}

        {/* -- STATE 2: WORKSPACE -- */}
        {file && !isProcessing && !isDone && (
          <div className="workspace">
            <div className="workspace-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="interval-block" style={{ maxWidth: '400px', padding: '2rem' }}>
                <div className="pdf-page-card" style={{ width: '220px', height: '300px', margin: '0 auto' }}>
                  <div className="pdf-page-header" style={{ backgroundColor: tool.color[0] }}>
                    {file.name}
                  </div>
                  <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: 'var(--glass-bg)' }}>
                    <Palette size={80} color={tool.color[0]} opacity={0.5} />
                  </div>
                  <div className="pdf-page-number">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              {error && (
                <div className="text-danger" style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                  <AlertCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
                  {error}
                </div>
              )}
            </div>

            <div className="workspace-sidebar">
              <h3 className="workspace-sidebar-title">
                <Settings2 size={20} />
                Options PDF en PNG
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <button
                  className="workspace-option-card active"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 12, 
                    padding: 16, 
                    background: 'var(--glass-bg)',
                    border: `2px solid ${tool.color[0]}`, 
                    borderRadius: 12, 
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ padding: 8, background: `${tool.color[0]}15`, borderRadius: 8 }}>
                    <Palette size={24} color={tool.color[0]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: tool.color[0], textTransform: 'uppercase', marginBottom: 4 }}>PAGE EN PNG</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Toutes les pages de ce PDF seront converties en un fichier PNG.</div>
                  </div>
                  <CheckCircle2 size={20} color={tool.color[0]} style={{ marginTop: 2 }} />
                </button>

                <button
                  className="workspace-option-card"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 12, 
                    padding: 16, 
                    background: 'transparent',
                    border: `1px solid var(--color-border)`, 
                    borderRadius: 12, 
                    textAlign: 'left',
                    cursor: 'pointer',
                    opacity: 0.6
                  }}
                  onClick={() => alert("L'extraction d'images natives est une fonctionnalité avancée en cours de développement. Le mode PAGE EN PNG sera utilisé.")}
                >
                  <div style={{ padding: 8, background: 'var(--color-surface-hover)', borderRadius: 8 }}>
                    <FilePlus size={24} color="var(--color-text-secondary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', marginBottom: 4 }}>EXTRAIRE IMAGES</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>Toutes les images incrustées dans le fichier PDF seront extraites sous forme d'images PNG.</div>
                  </div>
                </button>
              </div>

              <div className="workspace-option" style={{ marginBottom: 24 }}>
                <label className="workspace-option-label" style={{ fontWeight: 600, marginBottom: 12 }}>Qualité de l'image</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={() => setQuality('medium')}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 8,
                      border: quality === 'medium' ? `1px solid ${tool.color[0]}` : '1px solid var(--color-border)',
                      background: quality === 'medium' ? `${tool.color[0]}08` : 'var(--glass-bg)',
                      color: quality === 'medium' ? tool.color[0] : 'var(--color-text)',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Normal</span>
                    {quality === 'medium' && <span style={{ fontSize: 11, color: tool.color[0] }}>Recommandé</span>}
                  </button>
                  <button
                    onClick={() => setQuality('high')}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 8,
                      border: quality === 'high' ? `1px solid ${tool.color[0]}` : '1px solid var(--color-border)',
                      background: quality === 'high' ? `${tool.color[0]}08` : 'var(--glass-bg)',
                      color: quality === 'high' ? tool.color[0] : 'var(--color-text)',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Élevée</span>
                  </button>
                </div>
              </div>

              <div className="workspace-actions">
                <button
                  onClick={handleConvert}
                  className="btn btn-lg workspace-btn-main"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color[0]}, ${tool.color[1]})`,
                    color: 'white',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  Convertir en PNG <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -- STATE 3 & 4: PROCESSING / DONE -- */}
        {(isProcessing || isDone) && (
          <div className="tool-page-layout" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center', width: '100%'}}>
              {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Conversion en cours...</h2>
                  <p>Extraction des pages en PNG...</p>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, background: tool.color[0] }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{Math.round(progress)}%</p>
                  </div>
                </div>
              ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle2 size={64} color={tool.color[0]} />
                  </div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Vos images sont prêtes !</h2>
                  <p style={{marginBottom: '2rem'}}>Le PDF a été converti en images PNG avec succès.</p>
                  <a 
                    href={downloadUrl!} 
                    download={`${file?.name.replace('.pdf', '')}_images.zip`} 
                    className="btn btn-primary btn-xl gradient-bg"
                    style={{ background: `linear-gradient(135deg, ${tool.color[0]}, ${tool.color[1]})`, border: 'none', color: 'white' }}
                  >
                    <Download size={24} style={{ marginRight: 8 }} /> Télécharger l'archive ZIP
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" style={{ borderColor: tool.color[0], color: tool.color[0] }} onClick={reset}>
                      Convertir un autre PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="seo-content container-narrow">
          <AdUnit slot="ad-pdf-to-png-1" />
          <h2>Convertir PDF en PNG avec transparence</h2>
          <p>
            Extrayez facilement chaque page de votre document PDF en image PNG avec gestion de la transparence.
            Traitement 100% sécurisé dans le navigateur. Vos fichiers ne sont jamais envoyés sur nos serveurs.
          </p>
          <AdUnit slot="ad-pdf-to-png-2" />
        </div>
        </main>
      <Footer />
    </>
  );
}
