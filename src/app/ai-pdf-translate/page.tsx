'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { extractTextFromPDF } from '@/utils/pdfTextExtractor';
import { translatePDFLayout } from '@/features/pdf/translate';
import { Languages, ArrowRight, Settings, FileText, Bot, Copy, Download, ZoomIn, ZoomOut, CheckCircle } from 'lucide-react';

function renderMarkdown(md: string) {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^### (.*?)$/gm, '<h4 style="font-size: 1.1rem; font-weight: bold; margin-top: 15px; margin-bottom: 8px; color: var(--color-text);">$1</h4>');
  html = html.replace(/^## (.*?)$/gm, '<h3 style="font-size: 1.3rem; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: var(--color-text);">$1</h3>');
  html = html.replace(/^# (.*?)$/gm, '<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: var(--color-text);">$1</h2>');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: var(--color-text);">$1</strong>');
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: disc;">$1</li>');
  html = html.replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: html }} style={{ lineHeight: '1.6', fontSize: '14px', color: 'var(--color-text-secondary)' }} />;
}

export default function AiPdfTranslatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pdfText, setPdfText] = useState<string>('');

  // Settings states
  const [showConfig, setShowConfig] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>('Anglais');
  const [outputMode, setOutputMode] = useState<'layout' | 'text'>('layout');
  const [resultPdfBytes, setResultPdfBytes] = useState<Uint8Array | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [translation, setTranslation] = useState<string>('');

  // PDF render states
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.8);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);

  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);

  // Load pdf.js dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).pdfjsLib) {
      setPdfjsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      setPdfjsLoaded(true);
    };
    script.onerror = () => {
      setError("Erreur lors du chargement de la bibliothèque de rendu PDF.");
    };
    document.head.appendChild(script);
  }, []);

  // Load PDF in workspace
  useEffect(() => {
    if (!file || !pdfjsLoaded) return;
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = (window as any).pdfjsLib;
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
      } catch (err) {
        console.error('Error loading pdf in workspace:', err);
      }
    };
    loadPdf();
  }, [file, pdfjsLoaded]);

  // Render Page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasNode) return;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(currentPageIndex + 1);
        const viewport = page.getViewport({ scale: scale });
        const context = canvasNode.getContext('2d');

        if (context) {
          canvasNode.width = viewport.width;
          canvasNode.height = viewport.height;
          await page.render({ canvasContext: context, viewport: viewport }).promise;
        }
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };
    render();
  }, [pdfDoc, currentPageIndex, scale, canvasNode]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setTranslation('');
      setResultPdfBytes(null);
      setError(null);
      setProgress(0);
      try {
        const text = await extractTextFromPDF(selected);
        setPdfText(text);
        
        const count = text.split('--- PAGE').length - 1;
        setTotalPages(count || 1);
        
        setShowConfig(true);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du PDF.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1
  });

  const handleTranslate = async () => {
    setShowConfig(false);
    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      if (outputMode === 'layout') {
        setProgress(20);
        const pdfBytes = await translatePDFLayout(file!, targetLanguage, (p) => {
          setProgress(20 + Math.round(p * 0.75));
        });
        
        setResultPdfBytes(pdfBytes);
        
        // Re-load the translated PDF in the visualizer to show the result
        const pdfjsLib = (window as any).pdfjsLib;
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setCurrentPageIndex(0);
        
        setProgress(100);
        setIsProcessing(false);
      } else {
        setProgress(40);
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfText,
            task: 'translate',
            language: targetLanguage
          })
        });

        setProgress(80);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors de la traduction.');

        setTranslation(data.choices[0].message.content);
        setProgress(100);
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de la traduction.');
      setFile(null);
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (outputMode === 'layout') return;
    navigator.clipboard.writeText(translation);
    alert('Traduction copiée dans le presse-papiers !');
  };

  const handleDownload = async () => {
    if (!file) return;
    try {
      let pdfBytes: Uint8Array;
      if (outputMode === 'layout' && resultPdfBytes) {
        pdfBytes = resultPdfBytes;
      } else {
        const { generateAiReportPdf } = await import('@/features/pdf/aiReport');
        pdfBytes = await generateAiReportPdf(
          `TRADUCTION EN ${targetLanguage.toUpperCase()}`,
          `Fichier original : ${file.name}`,
          `Traduction realisee par IA`,
          translation,
          '#0ea5e9'
        );
      }
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traduction_${targetLanguage}_${file.name.replace('.pdf', '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la generation du PDF.");
    }
  };

  const languagesList = [
    'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais',
    'Arabe', 'Chinois', 'Russe', 'Japonais', 'Polonais'
  ];

  // State 1: Dropzone
  if (!file) {
    return (
      <>
        <SEO slug="ai-pdf-translate" />
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
              Traduire PDF par IA
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Traduisez automatiquement et instantanément vos documents PDF dans plus de 10 langues avec l'IA.
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
            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment traduire un fichier PDF en ligne</h2>
              <ol className="steps-list">
                <li>Sélectionnez ou déposez votre document PDF.</li>
                <li>Choisissez la langue de destination (ex: Anglais, Espagnol).</li>
                <li>Cliquez sur "Traduire" pour lancer le traitement par l'IA Llama 3.3.</li>
                <li>Visualisez le texte traduit et téléchargez-le sous forme de document structuré.</li>
              </ol>
            </section>
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 2: Parameter configuration
  if (showConfig) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '600px', margin: '4rem auto' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings color="#0ea5e9" size={28} /> Options de traduction
              </h2>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px' }}>
                  Langue de destination
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-color)',
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '20px'
                  }}
                >
                  {languagesList.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>

                <label style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>
                  Format de traduction du PDF
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: outputMode === 'layout' ? '2px solid #0ea5e9' : '1px solid var(--glass-border)',
                    backgroundColor: outputMode === 'layout' ? 'rgba(14, 165, 233, 0.05)' : 'transparent',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="outputMode"
                      checked={outputMode === 'layout'}
                      onChange={() => setOutputMode('layout')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', color: 'var(--color-text)' }}>
                        Conserver la mise en page d&apos;origine (Recommandé) 🖼️
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        Traduit et remplace le texte directement sur le document d&apos;origine. Les images, styles, graphiques et arborescences sont intégralement conservés (similaire à la traduction visuelle Google/Gemini).
                      </span>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: outputMode === 'text' ? '2px solid #0ea5e9' : '1px solid var(--glass-border)',
                    backgroundColor: outputMode === 'text' ? 'rgba(14, 165, 233, 0.05)' : 'transparent',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="outputMode"
                      checked={outputMode === 'text'}
                      onChange={() => setOutputMode('text')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', color: 'var(--color-text)' }}>
                        Texte uniquement (Rapport brut) 📄
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        Génère un nouveau PDF contenant uniquement la traduction textuelle sous forme de rapport structuré Markdown. Idéal pour copier-coller ou relire le texte brut.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                className="btn btn-xl"
                onClick={handleTranslate}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                Traduire le document <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 3: Translating progress
  if (isProcessing) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Bot className="animation-bounce" color="#0ea5e9" size={32} /> L'IA traduit votre document en {targetLanguage}...
              </h2>
              <div className="progress-container" style={{ marginTop: '2rem' }}>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${progress}%`, backgroundColor: '#0ea5e9' }}></div>
                </div>
                <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 4: Result Workspace
  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>

      <div className="workspace translation-workspace">
        
        {/* Left Side: Document visualizer */}
        <div className="translation-preview">
          
          <div style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: 'var(--color-surface)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '1rem',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setScale(s => Math.max(0.4, s - 0.1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)' }}
            >
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(1.5, s + 0.1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)' }}
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <div style={{
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            borderRadius: '4px',
            border: '1px solid rgba(0,0,0,0.1)',
            overflow: 'hidden',
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0px',
            margin: 'auto 0',
            width: '100%',
            maxWidth: `${595 * scale}px`,
            aspectRatio: '1 / 1.414'
          }}>
            <canvas ref={setCanvasNode} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
              disabled={currentPageIndex === 0}
              style={{ padding: '6px 12px' }}
            >
              Précédent
            </button>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
              Page {currentPageIndex + 1} / {totalPages}
            </span>
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPageIndex(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPageIndex === totalPages - 1}
              style={{ padding: '6px 12px' }}
            >
              Suivant
            </button>
          </div>
        </div>

        {/* Right Side: Translation display */}
        <div className="translation-sidebar">
          
          <div style={{
            padding: '1.2rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>
              <Languages size={20} color="#0ea5e9" /> Traduction ({targetLanguage})
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handleCopy} className="icon-btn" style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--color-text)' }} title="Copier la traduction">
                <Copy size={16} />
              </button>
              <button onClick={handleDownload} className="icon-btn" style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--color-text)' }} title="Télécharger en PDF">
                <Download size={16} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {outputMode === 'layout' ? (
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.2)', textAlign: 'center' }}>
                <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                  Traduction terminée !
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Le document traduit conserve toute la mise en page d'origine (styles, images, arborescence). L'aperçu est visible à gauche.
                </p>
                <button
                  onClick={handleDownload}
                  className="btn btn-xl"
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                  }}
                >
                  <Download size={18} /> Télécharger le PDF Traduit
                </button>
              </div>
            ) : (
              <div className="glass" style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.03)', border: '1px solid rgba(14, 165, 233, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#0ea5e9', fontSize: '12px', fontWeight: 'bold' }}>
                  <CheckCircle size={14} /> TEXTE TRADUIT
                </div>
                {renderMarkdown(translation)}
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <button
                    onClick={handleDownload}
                    className="btn btn-xl"
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      padding: '0.8rem',
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                    }}
                  >
                    <Download size={18} /> Télécharger la traduction en PDF
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <AdUnit slot="ad-workspace-sidebar" format="rectangle" />
            </div>

          </div>

          <div style={{
            padding: '1.2rem',
            borderTop: '1px solid var(--glass-border)',
            textAlign: 'center'
          }}>
            <button
              onClick={() => {
                setFile(null);
                setTranslation('');
                setPdfDoc(null);
              }}
              className="btn btn-outline"
              style={{ width: '100%' }}
            >
              Traduire un autre document
            </button>
          </div>

        </div>

      </div>
      <Footer />
    </>
  );
}
