'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { extractTextFromPDF } from '@/utils/pdfTextExtractor';
import { MessageSquare, ArrowRight, Bot, Send, ZoomIn, ZoomOut, Sparkles, Copy, Download } from 'lucide-react';

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

export default function AiPdfChatPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pdfText, setPdfText] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Chat states
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // PDF Renderer states
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

  // Load PDF document in workspace
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

  // Render current page to canvas
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

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setChatMessages([]);
      setError(null);
      setProgress(0);
      setIsProcessing(true);
      
      try {
        setProgress(30);
        const text = await extractTextFromPDF(selected);
        setPdfText(text);
        
        const count = text.split('--- PAGE').length - 1;
        setTotalPages(count || 1);
        
        setProgress(100);
        setIsProcessing(false);
        
        // Add welcome message
        setChatMessages([
          { role: 'model', text: `Bonjour ! J'ai lu votre document **${selected.name}** (${count} pages). De quoi souhaitez-vous discuter aujourd'hui ? Posez-moi vos questions !` }
        ]);
      } catch (err: any) {
        setError(err.message || "Erreur de chargement du PDF.");
        setFile(null);
        setIsProcessing(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1
  });

  const handleSendChatMessage = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim() || isChatSending) return;

    if (!overrideText) setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsChatSending(true);

    try {
      // Format chat history for Groq
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
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la communication avec le modèle.');

      const responseText = data.choices[0].message.content;
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'model', text: `Erreur : ${err.message}` }]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleDownload = async () => {
    if (!file || chatMessages.length === 0) return;
    try {
      const { generateAiReportPdf } = await import('@/features/pdf/aiReport');
      
      const chatMarkdown = chatMessages.map(msg => {
        const sender = msg.role === 'user' ? 'Utilisateur' : 'Assistant IA';
        return `### ${sender}\n${msg.text}\n`;
      }).join('\n');

      const pdfBytes = await generateAiReportPdf(
        `DISCUSSION AVEC LE PDF`,
        `Document original : ${file.name}`,
        `Historique des echanges`,
        chatMarkdown,
        '#6366f1'
      );
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `discussion_${file.name.replace('.pdf', '')}.pdf`;
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
        <SEO slug="ai-pdf-chat" />
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
              Chatter avec votre PDF
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Posez des questions interactives, extrayez des faits ou demandez des explications précises sur vos documents PDF.
            </p>

            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
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
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment chatter avec des fichiers PDF</h2>
              <ol className="steps-list">
                <li>Déposez votre document PDF.</li>
                <li>Le système va extraire le texte et charger les pages visuellement.</li>
                <li>Posez des questions en langage naturel dans la boîte de discussion à droite.</li>
                <li>Le robot Llama 3.3 scannera instantanément tout le document pour y répondre de façon rigoureuse.</li>
              </ol>
            </section>
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // State 2: Processing state
  if (isProcessing) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
              <h2>Indexation du PDF en cours...</h2>
              <div className="progress-container" style={{ marginTop: '2rem' }}>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${progress}%`, backgroundColor: '#6366f1' }}></div>
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

  // State 3: Interactive Workspace
  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>

      <div className="workspace" style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
        
        {/* Left Side: Document visualizer */}
        <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', overflowY: 'auto' }}>
          
          {/* Zoom controls */}
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

        {/* Right Side: Conversation Thread */}
        <div style={{
          width: '450px',
          borderLeft: '1px solid var(--glass-border)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          
          <div style={{
            padding: '1.2rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>
              <MessageSquare size={20} color="#6366f1" /> Discussion PDF
            </h3>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {chatMessages.length > 0 && (
                <button onClick={handleDownload} className="icon-btn" style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--color-text)' }} title="Télécharger la discussion en PDF">
                  <Download size={14} />
                </button>
              )}
              <button
                onClick={() => {
                  setFile(null);
                  setChatMessages([]);
                  setPdfDoc(null);
                }}
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                Changer de PDF
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {chatMessages.length > 1 && (
              <div style={{ padding: '0 0 1rem 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '0.5rem' }}>
                <button
                  onClick={handleDownload}
                  className="btn btn-xl"
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0.8rem',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Download size={18} /> Télécharger la discussion en PDF
                </button>
              </div>
            )}
            
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: msg.role === 'user' ? '#6366f1' : 'var(--bg-color)',
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
                <Bot size={14} className="animation-bounce" /> L'IA analyse votre question...
              </div>
            )}

            {/* Suggested starting questions when fresh conversation */}
            {chatMessages.length === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                  Questions suggérées :
                </span>
                {[
                  "Fais-moi un résumé en 3 points clés.",
                  "Quels sont les détails importants à retenir ?",
                  "Y a-t-il des termes complexes dans le texte ?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChatMessage(q)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      backgroundColor: 'transparent',
                      color: '#6366f1',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {q} <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            )}

            <div ref={chatBottomRef}></div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <AdUnit slot="ad-workspace-chat" format="horizontal" />
            </div>
          </div>

          {/* Text Input area */}
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
                backgroundColor: '#6366f1',
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
