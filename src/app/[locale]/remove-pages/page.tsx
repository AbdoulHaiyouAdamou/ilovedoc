'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { removePagesFromPDF } from '@/features/pdf/remove';
import { getPdfPageCount } from '@/features/pdf/split';
import { FileMinus, Trash2, ArrowRight, Settings, CheckCircle, RotateCcw } from 'lucide-react';

export default function RemovePagesPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [deletedPages, setDeletedPages] = useState<number[]>([]); // 0-indexed
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      setDeletedPages([]);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
      } catch (err) {
        setError("Impossible de lire ce PDF. Il est peut-être corrompu.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const togglePage = (pageIndex: number) => {
    setDeletedPages(prev => 
      prev.includes(pageIndex) 
        ? prev.filter(p => p !== pageIndex) 
        : [...prev, pageIndex]
    );
  };

  const handleRemove = async () => {
    if (!file) return;
    if (deletedPages.length === totalPages) {
      setError("Vous ne pouvez pas supprimer toutes les pages du document.");
      return;
    }
    if (deletedPages.length === 0) {
      setError("Sélectionnez au moins une page à supprimer.");
      return;
    }

    setIsProcessing(true); 
    setError(null); 
    setProgress(0);
    try {
      const modifiedBytes = await removePagesFromPDF(file, {
        pagesToRemove: deletedPages,
        onProgress: (p) => setProgress(p)
      });
      
      const blob = new Blob([modifiedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf','')}_removed.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la suppression.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <>
        <SEO slug="remove-pages" />
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
              {tTools('remove-pages.name')}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tTools('remove-pages.description')}
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#f43f5e', 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(244, 63, 94, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {tCommon('select_file')}
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>{tCommon('or_drop')}</p>
            </div>
          </div>

          {/* Below the fold: SEO and Ads */}
          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            
            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment supprimer des pages d'un PDF</h2>
              <ol className="steps-list">
                <li>Sélectionnez votre fichier PDF ou glissez-déposez-le.</li>
                <li>Cliquez sur les pages que vous souhaitez supprimer dans l'espace de travail.</li>
                <li>Cliquez sur "Supprimer les pages" pour générer votre nouveau PDF allégé.</li>
                <li>Le téléchargement de votre fichier se lancera automatiquement.</li>
              </ol>
            </section>
            
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
          <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
             {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>Suppression en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(to right, #f43f5e, #fb7185)' }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle size={64} color="#10b981" />
                  </div>
                  <h2>🎉 Les pages ont été supprimées !</h2>
                  <p style={{marginBottom: '2rem'}}>Votre nouveau document PDF est prêt.</p>
                  <a href={resultUrl!} download={`${file.name.replace('.pdf','')}_removed.pdf`} className="btn btn-primary btn-xl" style={{backgroundColor: '#f43f5e', borderColor: '#f43f5e', backgroundImage: 'linear-gradient(to right, #f43f5e, #fb7185)'}}>
                    Télécharger le PDF
                  </a>
                  <div style={{marginTop: '2rem'}}>
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

  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
        <div className="workspace-preview" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '2rem', alignContent: 'start' }}>
          {Array.from({ length: totalPages }).map((_, i) => {
            const isDeleted = deletedPages.includes(i);
            return (
              <div 
                key={i} 
                className="pdf-page-card" 
                onClick={() => togglePage(i)}
                style={{
                  cursor: 'pointer',
                  width: '100%',
                  height: '220px',
                  border: isDeleted ? '3px solid #f43f5e' : 'none',
                  opacity: isDeleted ? 0.6 : 1,
                  transform: isDeleted ? 'scale(0.95)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                {isDeleted && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(244, 63, 94, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}>
                    <div style={{
                      backgroundColor: '#f43f5e',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '10px',
                      boxShadow: '0 4px 10px rgba(244, 63, 94, 0.3)'
                    }}>
                      <Trash2 size={32} />
                    </div>
                  </div>
                )}
                <div className="pdf-page-header" style={{
                  backgroundColor: isDeleted ? '#f43f5e' : `hsl(${(i * 30) % 360}, 70%, 55%)`
                }}>
                  Page {i + 1}
                </div>
                <div className="pdf-page-content" style={{ pointerEvents: 'none' }}>
                  <div className="pdf-page-line"></div>
                  <div className="pdf-page-line"></div>
                  <div className="pdf-page-line short"></div>
                  <div className="pdf-page-line"></div>
                  <div className="pdf-page-line"></div>
                  <div className="pdf-page-line short"></div>
                </div>
                <div className="pdf-page-number" style={{
                  backgroundColor: isDeleted ? 'rgba(244, 63, 94, 0.1)' : undefined,
                  color: isDeleted ? '#f43f5e' : undefined
                }}>Page {i + 1}</div>
              </div>
            );
          })}
        </div>

        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#f43f5e'}}>
              <Settings size={24} /> Supprimer
            </h2>
          </div>
          <div className="workspace-sidebar-content">
            <div style={{
              padding: '1.5rem', 
              background: 'rgba(244, 63, 94, 0.1)', 
              border: '2px dashed #f43f5e', 
              borderRadius: '12px', 
              textAlign: 'center'
            }}>
              <h3 style={{color: '#f43f5e', marginBottom: '10px', fontSize: '1.2rem'}}>{deletedPages.length} pages sélectionnées</h3>
              <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                Cliquez sur les pages dans l'espace de travail pour les marquer à supprimer.
              </p>
            </div>
            {deletedPages.length > 0 && (
              <button 
                className="btn btn-outline" 
                style={{width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '8px'}}
                onClick={() => setDeletedPages([])}
              >
                <RotateCcw size={16} /> Réinitialiser
              </button>
            )}
          </div>
          
          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold'}}>{error}</div>}

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
                backgroundColor: '#f43f5e',
                borderColor: '#f43f5e',
                backgroundImage: 'linear-gradient(to right, #f43f5e, #fb7185)',
                opacity: deletedPages.length === 0 ? 0.7 : 1,
                cursor: deletedPages.length === 0 ? 'not-allowed' : 'pointer'
              }} 
              onClick={handleRemove}
              disabled={deletedPages.length === 0}
            >
              Supprimer les pages <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
