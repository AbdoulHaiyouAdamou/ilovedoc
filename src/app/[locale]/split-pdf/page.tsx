'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { splitPDFAdvanced, getPdfPageCount, SplitInterval } from '@/features/pdf/split';
import { Scissors, Plus, X, ArrowRight, Settings } from 'lucide-react';

export default function SplitPDFPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [intervals, setIntervals] = useState<SplitInterval[]>([]);
  const [mergeIntervals, setMergeIntervals] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; isZip: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'intervalle' | 'pages'>('intervalle');

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
        setIntervals([{ id: Date.now().toString(), start: 1, end: count }]);
      } catch (err) {
        setError("Impossible de lire ce PDF. Il est peut-être corrompu.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const addInterval = () => {
    setIntervals([...intervals, { id: Date.now().toString(), start: 1, end: totalPages }]);
  };

  const removeInterval = (id: string) => {
    setIntervals(intervals.filter(i => i.id !== id));
  };

  const updateInterval = (id: string, field: 'start' | 'end', value: number) => {
    setIntervals(intervals.map(i => {
      if (i.id === id) {
        const val = Math.max(1, Math.min(totalPages, value));
        const updated = { ...i, [field]: val };
        // Ensure start <= end
        if (field === 'start' && updated.start > updated.end) updated.end = updated.start;
        if (field === 'end' && updated.end < updated.start) updated.start = updated.end;
        return updated;
      }
      return i;
    }));
  };

  const handleSplit = async () => {
    if (!file) return;
    
    let finalIntervals = intervals;
    
    // Si on est dans l'onglet "Pages", on extrait toutes les pages individuellement
    if (activeTab === 'pages') {
      finalIntervals = [];
      for (let i = 1; i <= totalPages; i++) {
        finalIntervals.push({ id: `page-${i}`, start: i, end: i });
      }
    } else {
      if (intervals.length === 0) return;
    }

    setIsProcessing(true); setError(null); setProgress(0);
    try {
      const actualMerge = activeTab === 'pages' ? false : mergeIntervals;
      const { blob, isZip } = await splitPDFAdvanced(file, finalIntervals, actualMerge, {
        onProgress: (p) => setProgress(p)
      });
      const url = URL.createObjectURL(blob);
      setResult({ url, isZip });
      
      // Téléchargement automatique
      const a = document.createElement('a');
      a.href = url;
      a.download = isZip ? `${file.name.replace('.pdf','')}_split.zip` : `${file.name.replace('.pdf','')}_merged.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la division.');
    } finally {
      setIsProcessing(false);
    }
  };

  // If no file, show classic Dropzone page
  if (!file) {
    return (
      <>
        <SEO slug="split-pdf" />
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
              {tTools('split-pdf.name')}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tTools('split-pdf.description')}
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#7c3aed', 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4)',
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
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment diviser un fichier PDF</h2>
              <ol className="steps-list">
                <li>Sélectionnez votre fichier PDF ou glissez-déposez-le dans la zone ci-dessus.</li>
                <li>Définissez vos intervalles de pages dans l'espace de travail.</li>
                <li>Cliquez sur "Diviser PDF" pour séparer ou extraire vos pages.</li>
                <li>Le téléchargement de votre fichier (ou archive ZIP) se lancera automatiquement.</li>
              </ol>
            </section>
            
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // If processing or result, show result screen
  if (isProcessing || result) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
             {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>Découpage en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>🎉 Le PDF a été divisé !</h2>
                  <p style={{marginBottom: '2rem'}}>Vos nouveaux fichiers sont prêts.</p>
                  <a href={result?.url} download={result?.isZip ? `${file.name.replace('.pdf','')}_split.zip` : `${file.name.replace('.pdf','')}_merged.pdf`} className="btn btn-primary btn-xl gradient-bg">
                    Télécharger {result?.isZip ? 'le ZIP' : 'le PDF'}
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" onClick={() => { setFile(null); setResult(null); }}>Diviser un autre fichier</button>
                  </div>
                </div>
             )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Workspace Layout (iLovePDF Style)
  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
        {/* Left pane: Preview */}
        <div className="workspace-preview">
          {intervals.map((interval, idx) => (
            <div key={interval.id} className="interval-block">
              <div className="interval-label">Intervalle {idx + 1}</div>
              
              {/* Start Page Card */}
              <div className="pdf-page-card">
                <div className="pdf-page-header" style={{backgroundColor: `hsl(${(idx * 45) % 360}, 70%, 50%)`}}>
                  Document 1 - Page {interval.start}
                </div>
                <div className="pdf-page-content">
                  <div className="pdf-page-line"></div>
                  <div className="pdf-page-line"></div>
                  <div className="pdf-page-line short"></div>
                  <div className="pdf-page-line"></div>
                </div>
                <div className="pdf-page-number">{interval.start}</div>
              </div>

              {/* Dots if multiple pages */}
              {interval.end > interval.start && (
                 <>
                   <div className="interval-dots">...</div>
                   {/* End Page Card */}
                   <div className="pdf-page-card">
                    <div className="pdf-page-header" style={{backgroundColor: `hsl(${(idx * 45 + 10) % 360}, 80%, 60%)`}}>
                      Document 1 - Page {interval.end}
                    </div>
                    <div className="pdf-page-content">
                      <div className="pdf-page-line"></div>
                      <div className="pdf-page-line short"></div>
                      <div className="pdf-page-line"></div>
                      <div className="pdf-page-line"></div>
                    </div>
                    <div className="pdf-page-number">{interval.end}</div>
                  </div>
                 </>
              )}
            </div>
          ))}
        </div>

        {/* Right pane: Sidebar */}
        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
              <Settings size={24} /> Diviser
            </h2>
          </div>
          <div className="workspace-sidebar-content">
            <div className="tabs">
              <div className={`tab ${activeTab === 'intervalle' ? 'active' : ''}`} onClick={() => setActiveTab('intervalle')}>
                Intervalle
              </div>
              <div className={`tab ${activeTab === 'pages' ? 'active' : ''}`} onClick={() => setActiveTab('pages')}>
                Pages
              </div>
            </div>

            {activeTab === 'intervalle' && (
              <>
                <div style={{display: 'flex', gap: '10px', marginBottom: '1rem'}}>
                  <button className="btn btn-outline" style={{flex: 1, borderColor: 'var(--primary-color)', color: 'var(--primary-color)'}}>Personnaliser</button>
                  <button className="btn btn-outline" style={{flex: 1}} disabled title="Bientôt disponible">Fixe</button>
                </div>

                {intervals.map((interval, idx) => (
                  <div key={interval.id} style={{marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', position: 'relative'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                      <span style={{fontWeight: 'bold', fontSize: '0.9rem'}}>Intervalle {idx + 1}</span>
                      {intervals.length > 1 && (
                        <X size={16} style={{cursor: 'pointer', color: '#e11d48'}} onClick={() => removeInterval(interval.id)} />
                      )}
                    </div>
                    <div className="interval-row">
                      <span style={{fontSize:'0.8rem'}}>de la page</span>
                      <input type="number" className="interval-input" value={interval.start} onChange={(e) => updateInterval(interval.id, 'start', parseInt(e.target.value) || 1)} min={1} max={totalPages} />
                      <span style={{fontSize:'0.8rem'}}>à</span>
                      <input type="number" className="interval-input" value={interval.end} onChange={(e) => updateInterval(interval.id, 'end', parseInt(e.target.value) || 1)} min={1} max={totalPages} />
                    </div>
                  </div>
                ))}

                <button className="btn btn-outline" style={{width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', color: 'var(--primary-color)'}} onClick={addInterval}>
                  <Plus size={18} /> Ajouter un intervalle
                </button>
              </>
            )}

            {activeTab === 'pages' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
                <div style={{padding: '1.5rem', background: 'rgba(124, 58, 237, 0.1)', border: '2px solid var(--primary-color)', borderRadius: '8px', textAlign: 'center'}}>
                  <h3 style={{color: 'var(--primary-color)', marginBottom: '10px', fontSize: '1.1rem'}}>Extraire toutes les pages</h3>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                    Le PDF sera divisé en {totalPages} fichiers séparés (un par page).
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="workspace-sidebar-footer">
            {activeTab === 'intervalle' && (
              <label style={{display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none'}}>
                <input type="checkbox" checked={mergeIntervals} onChange={(e) => setMergeIntervals(e.target.checked)} style={{marginTop: '4px', transform: 'scale(1.2)'}} />
                <span>Fusionner tous les intervalles dans un seul fichier PDF.</span>
              </label>
            )}

            {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold'}}>{error}</div>}

            <button className="btn btn-primary btn-xl gradient-bg" style={{width: '100%', display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '1.2rem', padding: '1rem', marginTop: '0.5rem'}} onClick={handleSplit}>
              Diviser PDF <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
