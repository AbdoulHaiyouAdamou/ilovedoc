'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { convertPdfToWord } from '@/features/pdf/office';
import { FileText, CheckCircle, ArrowRight, Info } from 'lucide-react';

export default function PdfToWordPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('document.docx');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).pdfjsLib) return;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => { (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; };
    document.head.appendChild(s);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResultUrl(null);
      setError(null);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
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

      const result: Uint8Array = await convertPdfToWord(file, (p: number) => {
        setProgress(Math.min(Math.round(p), 95));
      });
      clearInterval(progressInterval);
      setProgress(100);

      const blob = new Blob([result as any], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      const outputName = file.name.replace(/\.pdf$/i, '') + '.docx';
      setResultFilename(outputName);

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

  if (!file) {
    return (
      <>
        <SEO slug="pdf-to-word" />
      <Header />
        <main className="tool-page-layout" style={{ padding: 0 }}>
          {/* Full-screen initial view */}
          <div style={{ 
            minHeight: 'calc(100vh - 70px)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              {tTools('pdf-to-word.name')}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tTools('pdf-to-word.description')}
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#2563eb', 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
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
            
            <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
               <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi convertir un PDF en Word ?</h2>
               <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                 Notre outil de conversion PDF en Word extrait intelligemment le texte de vos documents PDF et le convertit en un fichier Word (.docx) entièrement éditable. Idéal pour modifier un contrat, mettre à jour un CV, ou réutiliser le contenu d'un rapport. Le traitement se fait intégralement dans votre navigateur, garantissant une confidentialité totale de vos fichiers. Aucune donnée n'est envoyée vers un serveur distant.
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
          <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
             {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>Conversion en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(to right, #2563eb, #1d4ed8)' }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle size={64} color="#2563eb" />
                  </div>
                  <h2>🎉 Le PDF a été converti en Word !</h2>
                  <p style={{marginBottom: '2rem'}}>Votre document Word est prêt.</p>
                  <a href={resultUrl!} download={resultFilename} className="btn btn-primary btn-xl" style={{backgroundColor: '#2563eb', borderColor: '#2563eb', backgroundImage: 'linear-gradient(to right, #2563eb, #1d4ed8)'}}>
                    Télécharger le fichier Word
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); }}>Convertir un autre fichier</button>
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
        <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
           <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
              <div className="pdf-page-header" style={{backgroundColor: '#2563eb'}}>
                {file?.name}
              </div>
              <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                 <FileText size={80} color="#2563eb" style={{ opacity: 0.5 }} />
              </div>
           </div>
           
           <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
        </div>

        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#2563eb'}}>
              <FileText size={24} /> PDF en Word
            </h2>
          </div>
          <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             
             {/* Info card */}
             <div style={{
               display: 'flex',
               alignItems: 'flex-start',
               gap: '12px',
               padding: '1.5rem',
               borderRadius: '12px',
               border: '2px solid rgba(37, 99, 235, 0.3)',
               background: 'rgba(37, 99, 235, 0.05)',
             }}>
               <Info size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
               <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                 Le texte de votre PDF sera extrait et converti en document Word (.docx) éditable.
               </p>
             </div>

             <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
               <AdUnit slot="ad-workspace-sidebar" format="rectangle" />
             </div>
          </div>
          
          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px'}}>{error}</div>}

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
                backgroundColor: '#2563eb',
                borderColor: '#2563eb',
                backgroundImage: 'linear-gradient(to right, #2563eb, #1d4ed8)',
              }} 
              onClick={handleConvert}
            >
              Convertir en Word <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
