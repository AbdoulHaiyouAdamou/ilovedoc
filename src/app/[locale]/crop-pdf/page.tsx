'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { cropPDF } from '@/features/pdf/crop';
import { getPdfPageCount } from '@/features/pdf/split'; // to get page count
import { Crop, Settings, ArrowRight } from 'lucide-react';

export default function CropPDFPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [applyToAll, setApplyToAll] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setResult(null);
      setError(null);
      setProgress(0);
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
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const handleMarginChange = (field: keyof typeof margins, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setMargins(prev => ({ ...prev, [field]: numValue }));
  };

  const handleCrop = async () => {
    if (!file) return;

    setIsProcessing(true); 
    setError(null); 
    setProgress(0);
    
    try {
      const resultBytes = await cropPDF(file, {
        margins,
        applyToAll,
        currentPageIndex,
        onProgress: (p) => setProgress(p)
      });
      
      const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult(url);
      
      // Téléchargement automatique
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf','')}_rogne.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du rognage.');
    } finally {
      setIsProcessing(false);
    }
  };

  // State 1: No file selected
  if (!file) {
    return (
      <>
        <SEO slug="crop-pdf" />
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
              {tTools('crop-pdf.name')}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tTools('crop-pdf.description')}
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

          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            
            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment rogner un fichier PDF</h2>
              <ol className="steps-list">
                <li>Sélectionnez votre fichier PDF ou glissez-déposez-le dans la zone ci-dessus.</li>
                <li>Réglez les marges (haut, bas, gauche, droite) dans l'espace de travail.</li>
                <li>Choisissez si vous souhaitez appliquer le rognage à toutes les pages ou seulement à la page actuelle.</li>
                <li>Cliquez sur "Rogner PDF" pour appliquer les modifications.</li>
              </ol>
            </section>
            
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 3: Processing/Result
  if (isProcessing || result) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
             {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>Rognage en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%`, backgroundColor: '#f43f5e' }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>🎉 Le PDF a été rogné !</h2>
                  <p style={{marginBottom: '2rem'}}>Votre nouveau fichier est prêt.</p>
                  <a href={result!} download={`${file.name.replace('.pdf','')}_rogne.pdf`} className="btn btn-xl" style={{ backgroundColor: '#f43f5e', color: 'white' }}>
                    Télécharger le PDF
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" onClick={() => { setFile(null); setResult(null); }}>Rogner un autre fichier</button>
                  </div>
                </div>
             )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 2: Workspace
  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
        <div className="workspace-preview" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', padding: '0' }}>
            <div style={{
              position: 'absolute',
              top: '0', left: '0', right: '0', bottom: '0',
              backgroundColor: 'white',
            }}></div>
            {/* Visual representation of crop margins */}
            <div style={{
              position: 'absolute',
              top: `${margins.top}px`,
              bottom: `${margins.bottom}px`,
              left: `${margins.left}px`,
              right: `${margins.right}px`,
              border: '2px dashed #f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Crop color="#f43f5e" size={48} opacity={0.5} />
            </div>
            {/* Some fake text lines to show context */}
            <div style={{ position: 'absolute', top: '40px', left: '40px', right: '40px' }}>
              <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px', width: '60%' }}></div>
              <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px' }}></div>
              <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px' }}></div>
              <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px', width: '80%' }}></div>
              <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px' }}></div>
              <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px', width: '40%' }}></div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {totalPages > 1 && !applyToAll && (
              <>
                <button className="btn btn-outline" onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))} disabled={currentPageIndex === 0}>
                  Précédent
                </button>
                <span>Page {currentPageIndex + 1} / {totalPages}</span>
                <button className="btn btn-outline" onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))} disabled={currentPageIndex === totalPages - 1}>
                  Suivant
                </button>
              </>
            )}
            {applyToAll && <span>Aperçu du rognage (appliqué à {totalPages} pages)</span>}
          </div>
        </div>

        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
              <Settings size={24} /> Rogner PDF
            </h2>
          </div>
          <div className="workspace-sidebar-content">
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Pages à rogner</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" checked={applyToAll} onChange={() => setApplyToAll(true)} />
                  <span>Toutes les pages</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" checked={!applyToAll} onChange={() => setApplyToAll(false)} />
                  <span>Page actuelle</span>
                </label>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Marges de rognage (px)</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>Haut</label>
                  <input 
                    type="number" 
                    value={margins.top} 
                    onChange={(e) => handleMarginChange('top', e.target.value)}
                    min={0}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--color-text)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>Bas</label>
                  <input 
                    type="number" 
                    value={margins.bottom} 
                    onChange={(e) => handleMarginChange('bottom', e.target.value)}
                    min={0}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--color-text)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>Gauche</label>
                  <input 
                    type="number" 
                    value={margins.left} 
                    onChange={(e) => handleMarginChange('left', e.target.value)}
                    min={0}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--color-text)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>Droite</label>
                  <input 
                    type="number" 
                    value={margins.right} 
                    onChange={(e) => handleMarginChange('right', e.target.value)}
                    min={0}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>
            </div>

          </div>
          
          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem'}}>{error}</div>}

            <button 
              className="btn btn-xl" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '1.2rem', padding: '1rem', backgroundColor: '#f43f5e', color: 'white', border: 'none' }} 
              onClick={handleCrop}
            >
              Rogner PDF <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
