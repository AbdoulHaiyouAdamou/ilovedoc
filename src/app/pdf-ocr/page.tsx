'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { runOcrOnPdf } from '@/features/pdf/ocr';
import { ScanText, CheckCircle, ArrowRight, FileText, Copy, Download, Info } from 'lucide-react';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function PdfOcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('fra');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultText, setResultText] = useState<string | null>(null);
  const [resultPdfBytes, setResultPdfBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load pdf.js from CDN
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      };
      document.head.appendChild(script);
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResultText(null);
      setResultPdfBytes(null);
      setError(null);
      setProgress(0);
      setCopied(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const handleOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setCopied(false);
    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 2, 90));
      }, 500);

      const result = await runOcrOnPdf(file, language, (p: number) => {
        setProgress(p);
      });
      clearInterval(progressInterval);
      setProgress(100);

      setResultText(result.text);
      setResultPdfBytes(result.pdfBytes);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'OCR.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultPdfBytes || !file) return;
    const blob = new Blob([resultPdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}_ocr.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Impossible de copier le texte dans le presse-papier.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResultText(null);
    setResultPdfBytes(null);
    setError(null);
    setProgress(0);
    setCopied(false);
  };

  // State 1: No file selected
  if (!file) {
    return (
      <>
        <SEO slug="pdf-ocr" />
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
              OCR PDF
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Rendez vos PDF scannés consultables grâce à la reconnaissance optique de caractères (OCR). Français et anglais supportés.
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#0ea5e9', 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(14, 165, 233, 0.4)',
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
            
            <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
               <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi utiliser notre outil OCR ?</h2>
               <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                 Notre outil de reconnaissance optique de caractères (OCR) transforme vos PDF scannés en documents consultables et indexables. Que vous ayez des documents numérisés, des factures scannées ou des archives papier digitalisées, notre moteur OCR extrait le texte avec précision en français et en anglais. Le traitement est 100% hors-ligne pour garantir la confidentialité totale de vos informations. Vous obtenez un PDF consultable ainsi que le texte extrait, prêt à être copié ou réutilisé.
               </p>
            </div>
            
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 3: Processing or Result
  if (isProcessing || resultText !== null) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{maxWidth: '900px', margin: '0 auto', textAlign: 'center'}}>
             {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>OCR en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(to right, #0ea5e9, #0284c7)' }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                  <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    L&apos;OCR peut prendre quelques minutes selon la taille du document.
                  </p>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '3rem', borderRadius: '1rem'}}>
                  <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle size={64} color="#0ea5e9" />
                  </div>
                  <h2>🎉 L&apos;OCR est terminé !</h2>
                  <p style={{marginBottom: '2rem', color: 'var(--color-text-secondary)'}}>Le texte a été extrait avec succès.</p>
                  
                  {/* Extracted text display */}
                  <div style={{
                    textAlign: 'left',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-color)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      margin: 0,
                      color: 'var(--color-text)'
                    }}>
                      <code>{resultText}</code>
                    </pre>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-primary btn-xl" 
                      style={{
                        backgroundColor: '#0ea5e9', 
                        borderColor: '#0ea5e9', 
                        backgroundImage: 'linear-gradient(to right, #0ea5e9, #0284c7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={handleDownload}
                    >
                      <Download size={20} /> Télécharger le PDF
                    </button>
                    <button 
                      className="btn btn-outline btn-xl" 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={handleCopy}
                    >
                      <Copy size={20} /> {copied ? 'Copié !' : 'Copier le texte'}
                    </button>
                  </div>

                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" onClick={handleReset}>Traiter un autre fichier</button>
                  </div>
                </div>
             )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 2: Workspace (file selected, not yet processing)
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
              <div className="pdf-page-header" style={{backgroundColor: '#0ea5e9'}}>
                {file?.name}
              </div>
              <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                 <FileText size={80} color="#0ea5e9" style={{ opacity: 0.5 }} />
              </div>
           </div>
           
           <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
        </div>

        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#0ea5e9'}}>
              <ScanText size={24} /> OCR PDF
            </h2>
          </div>
          <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             
             <div>
               <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Langue du document</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <label style={{
                   display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: '12px', cursor: 'pointer',
                   border: language === 'fra' ? '2px solid #0ea5e9' : '2px solid var(--glass-border)',
                   background: language === 'fra' ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                   transition: 'all 0.2s'
                 }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <span style={{ fontWeight: 'bold', color: language === 'fra' ? '#0ea5e9' : 'var(--text-color)' }}>Français</span>
                     <input type="radio" name="language" checked={language === 'fra'} onChange={() => setLanguage('fra')} style={{ accentColor: '#0ea5e9' }} />
                   </div>
                 </label>

                 <label style={{
                   display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: '12px', cursor: 'pointer',
                   border: language === 'eng' ? '2px solid #0ea5e9' : '2px solid var(--glass-border)',
                   background: language === 'eng' ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                   transition: 'all 0.2s'
                 }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <span style={{ fontWeight: 'bold', color: language === 'eng' ? '#0ea5e9' : 'var(--text-color)' }}>English</span>
                     <input type="radio" name="language" checked={language === 'eng'} onChange={() => setLanguage('eng')} style={{ accentColor: '#0ea5e9' }} />
                   </div>
                 </label>

                 <label style={{
                   display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: '12px', cursor: 'pointer',
                   border: language === 'fra+eng' ? '2px solid #0ea5e9' : '2px solid var(--glass-border)',
                   background: language === 'fra+eng' ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                   transition: 'all 0.2s'
                 }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <span style={{ fontWeight: 'bold', color: language === 'fra+eng' ? '#0ea5e9' : 'var(--text-color)' }}>Français + English</span>
                     <input type="radio" name="language" checked={language === 'fra+eng'} onChange={() => setLanguage('fra+eng')} style={{ accentColor: '#0ea5e9' }} />
                   </div>
                 </label>
               </div>
             </div>

             {/* Info note */}
             <div style={{
               display: 'flex',
               alignItems: 'flex-start',
               gap: '10px',
               padding: '1rem',
               borderRadius: '8px',
               backgroundColor: 'rgba(14, 165, 233, 0.08)',
               border: '1px solid rgba(14, 165, 233, 0.2)',
               fontSize: '0.85rem',
               color: 'var(--color-text-secondary)',
               lineHeight: '1.5'
             }}>
               <Info size={18} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
               <span>L&apos;OCR peut prendre quelques minutes selon la taille du document.</span>
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
                backgroundColor: '#0ea5e9',
                borderColor: '#0ea5e9',
                backgroundImage: 'linear-gradient(to right, #0ea5e9, #0284c7)',
              }} 
              onClick={handleOcr}
            >
              Lancer l&apos;OCR <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
