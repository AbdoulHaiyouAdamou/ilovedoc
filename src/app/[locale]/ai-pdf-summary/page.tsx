'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { extractTextFromPDF } from '@/utils/pdfTextExtractor';
import { Bot, ArrowRight, Settings, FileText, Send, Sparkles, Copy, Download, ZoomIn, ZoomOut, MessageSquare } from 'lucide-react';

// Simple regex-based markdown parser to avoid external dependencies
function renderMarkdown(md: string) {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h4 style="font-size: 1.1rem; font-weight: bold; margin-top: 15px; margin-bottom: 8px; color: var(--color-text);">$1</h4>');
  html = html.replace(/^## (.*?)$/gm, '<h3 style="font-size: 1.3rem; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: var(--color-text);">$1</h3>');
  html = html.replace(/^# (.*?)$/gm, '<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: var(--color-text);">$1</h2>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: var(--color-text);">$1</strong>');

  // Bullet points
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: disc;">$1</li>');

  // Paragraphs / Linebreaks
  html = html.replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: html }} style={{ lineHeight: '1.6', fontSize: '14px', color: 'var(--color-text-secondary)' }} />;
}

export default function AiPdfSummaryPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pdfText, setPdfText] = useState<string>('');
  
  // Settings modal
  const [showConfig, setShowConfig] = useState(false);
  const [length, setLength] = useState<'court' | 'moyen' | 'long'>('moyen');
  const [tone, setTone] = useState<'professionnel' | 'simple' | 'académique'>('professionnel');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Results & Chat workspace
  const [summary, setSummary] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // PDF Renderer state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.8);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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

  // Load PDF for visual representation
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

  // Render Page
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
  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setSummary('');
      setChatMessages([]);
      setError(null);
      setProgress(0);
      try {
        const text = await extractTextFromPDF(selected);
        setPdfText(text);
        
        // Read page count
        const count = text.split('--- PAGE').length - 1;
        setTotalPages(count || 1);
        
        // Show parameters modal
        setShowConfig(true);
      } catch (err: any) {
        setError(err.message || "Impossible de lire ce PDF.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1
  });

  const handleGenerateSummary = async () => {
    setShowConfig(false);
    setIsProcessing(true);
    setProgress(20);
    setError(null);

    try {
      setProgress(40);
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfText,
          task: 'summary',
          length,
          tone
        })
      });

      setProgress(80);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la génération.');
      }

      setSummary(data.choices[0].message.content);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la synthèse.');
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendChatMessage = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim() || isChatSending) return;

    if (!overrideText) setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsChatSending(true);

    try {
      // Build messages history formatted for Groq
      const history = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      history.push({ role: 'user', content: textToSend });

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfText,
          task: 'chat',
          messages: history
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur chat.');

      const responseText = data.choices[0].message.content;
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'model', text: `Erreur: ${err.message}` }]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    alert('Résumé copié dans le presse-papiers !');
  };

  const handleDownload = async () => {
    if (!file) return;
    try {
      const { generateAiReportPdf } = await import('@/features/pdf/aiReport');
      const pdfBytes = await generateAiReportPdf(
        'SYNTHESE DU DOCUMENT',
        `Fichier original : ${file.name}`,
        `Synthese ${length} (${tone})`,
        summary,
        '#7c3aed'
      );
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${file.name.replace('.pdf', '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la generation du PDF.");
    }
  };

  // State 1: Dropzone
  if (!file) {
    return (
      <>
        <SEO slug="ai-pdf-summary" />
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
              Résumé PDF par IA
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Obtenez instantanément une synthèse claire et structurée de vos documents longs grâce à l'IA de Groq (Llama 3.3).
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
                Sélectionner le fichier PDF
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>ou déposez le PDF ici</p>
            </div>
          </div>

          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi résumer vos documents avec l'IA iLoveDoc</h2>
              <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                Notre outil de synthèse intelligent analyse le contenu intégral de vos PDF (rapports, livres, contrats) et en extrait les thèses et informations clés sous forme de points clairs. Grâce à la vitesse fulgurante de Groq, le traitement est quasi-instantané.
              </p>
              <ol className="steps-list">
                <li>Déposez votre document PDF.</li>
                <li>Choisissez la longueur (court, moyen ou long) et le ton de la synthèse.</li>
                <li>Lisez le résumé généré et téléchargez-le ou copiez-le en un clic.</li>
                <li>Posez des questions supplémentaires au PDF si des détails vous manquent !</li>
              </ol>
            </section>
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 2: Parameter configuration modal
  if (showConfig) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '600px', margin: '4rem auto' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '16px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings color="#7c3aed" size={28} /> Paramètres de Résumé IA
              </h2>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px' }}>Longueur du résumé</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {(['court', 'moyen', 'long'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: length === l ? '2px solid #7c3aed' : '1px solid var(--glass-border)',
                        backgroundColor: length === l ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                        color: 'var(--color-text)',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                        cursor: 'pointer'
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px' }}>Ton du résumé</h3>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-color)',
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  <option value="professionnel">Professionnel & Formel</option>
                  <option value="simple">Simple & Vulgarisé</option>
                  <option value="académique">Académique & Scientifique</option>
                </select>
              </div>

              <button
                className="btn btn-xl"
                onClick={handleGenerateSummary}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                Générer le résumé <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 3: Generating progress
  if (isProcessing) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Bot className="animation-bounce" color="#7c3aed" size={32} /> L'IA analyse votre document...
              </h2>
              <div className="progress-container" style={{ marginTop: '2rem' }}>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${progress}%`, backgroundColor: '#7c3aed' }}></div>
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

  // State 4: Conversational Workspace
  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>

      <div className="workspace" style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
        
        {/* Left main: PDF Page viewer */}
        <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', overflowY: 'auto' }}>
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

        {/* Right main sidebar: Conversational Summary */}
        <div style={{
          width: '450px',
          borderLeft: '1px solid var(--glass-border)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          
          {/* Header tab/actions */}
          <div style={{
            padding: '1.2rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>
              <Bot size={20} color="#7c3aed" /> Résumé Intelligent
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handleCopy} className="icon-btn" style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--color-text)' }} title="Copier le résumé">
                <Copy size={16} />
              </button>
              <button onClick={handleDownload} className="icon-btn" style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--color-text)' }} title="Télécharger en PDF">
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable Chat & Summary area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* The generated Summary */}
            <div className="glass" style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.03)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#7c3aed', fontSize: '12px', fontWeight: 'bold' }}>
                <Sparkles size={14} /> RÉSUMÉ GÉNÉRÉ
              </div>
              {renderMarkdown(summary)}
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
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <Download size={18} /> Télécharger le résumé en PDF
                </button>
              </div>
            </div>

            {/* Suggested Questions */}
            {chatMessages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                  Questions suggérées :
                </span>
                {[
                  "Quels sont les points clés de ce document ?",
                  "Y a-t-il des risques mentionnés ?",
                  "Quelle est la conclusion générale ?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChatMessage(q)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      backgroundColor: 'transparent',
                      color: '#7c3aed',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {q} <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            )}

            {/* Chat Dialogues */}
            {chatMessages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--glass-border)' }}></div>
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: msg.role === 'user' ? '#7c3aed' : 'var(--bg-color)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--color-text)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      fontSize: '13px',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)'
                    }}
                  >
                    {msg.role === 'model' ? (
                      renderMarkdown(msg.text)
                    ) : (
                      <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    )}
                  </div>
                ))}
                {isChatSending && (
                  <div style={{ alignSelf: 'flex-start', color: 'var(--color-text-tertiary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={14} className="animation-bounce" /> L'IA répond...
                  </div>
                )}
                <div ref={chatBottomRef}></div>
              </div>
            )}

            {/* Ads under chat inside workspace */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <AdUnit slot="ad-workspace-chat" format="horizontal" />
            </div>

          </div>

          {/* Chat input box at the bottom */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Posez toutes vos questions sur le document..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendChatMessage();
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-color)',
                color: 'var(--color-text)',
                fontSize: '13px'
              }}
            />
            <button
              onClick={() => handleSendChatMessage()}
              style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </div>

        </div>

      </div>
      <Footer />
    </>
  );
}
