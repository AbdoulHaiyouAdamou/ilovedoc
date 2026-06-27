'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import AdUnit from '@/components/common/AdUnit';
import { extractTextFromPDF } from '@/utils/pdfTextExtractor';
import Bot from 'lucide-react/dist/esm/icons/bot';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Settings from 'lucide-react/dist/esm/icons/settings';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Send from 'lucide-react/dist/esm/icons/send';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Copy from 'lucide-react/dist/esm/icons/copy';
import Download from 'lucide-react/dist/esm/icons/download';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ZoomOut from 'lucide-react/dist/esm/icons/zoom-out';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import { ToolLayout } from '@/components/tools';

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

const ACCENT = '#7c3aed';

export default function AiPdfSummaryPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');

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
    if (!file || !pdfjsLoaded || showConfig) return;

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
  }, [file, pdfjsLoaded, showConfig]);

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
        ACCENT
      );
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${file.name.replace('.pdf', '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la generation du PDF.");
    }
  };

  const reset = () => {
    setFile(null);
    setSummary('');
    setChatMessages([]);
    setPdfDoc(null);
    setShowConfig(false);
  };

  const phase = !file ? 'select' : isProcessing ? 'processing' : 'workspace';

  const configModal = showConfig ? (
    <div className="container" style={{ maxWidth: '600px', margin: '4rem auto' }}>
      <div className="glass" style={{ padding: '3rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings color={ACCENT} size={28} /> Paramètres de Résumé IA
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
                  border: length === l ? `2px solid ${ACCENT}` : '1px solid var(--glass-border)',
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
            backgroundColor: ACCENT,
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
  ) : null;

  const workspacePreview = (
    <div className="workspace-preview" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', overflowY: 'auto' }}>
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
          Page {currentPageIndex + 1} / {totalPages || 1}
        </span>
        <button
          className="btn btn-outline"
          onClick={() => setCurrentPageIndex(p => Math.min((totalPages || 1) - 1, p + 1))}
          disabled={currentPageIndex === (totalPages || 1) - 1}
          style={{ padding: '6px 12px' }}
        >
          Suivant
        </button>
      </div>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header tab/actions */}
      <div className="workspace-sidebar-header" style={{
        padding: '1.2rem',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>
          <Bot size={20} color={ACCENT} /> Résumé Intelligent
        </h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={handleCopy} className="icon-btn" style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--color-text)' }} title="Copier le résumé">
            <Copy size={16} />
          </button>
          <button onClick={handleDownload} className="icon-btn" style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--color-text)' }} title="Télécharger en PDF">
            <Download size={16} />
          </button>
          <button
            onClick={reset}
            className="btn btn-outline"
            style={{ padding: '4px 10px', fontSize: '11px', marginLeft: '6px' }}
          >
            Changer
          </button>
        </div>
      </div>

      {/* Scrollable Chat & Summary area */}
      <div className="workspace-sidebar-content" style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* The generated Summary */}
        <div className="glass" style={{ padding: '1.2rem', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.03)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: ACCENT, fontSize: '12px', fontWeight: 'bold' }}>
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
                backgroundColor: ACCENT,
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
                  border: `1px solid rgba(124, 58, 237, 0.2)`,
                  backgroundColor: 'transparent',
                  color: ACCENT,
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
                  backgroundColor: msg.role === 'user' ? ACCENT : 'var(--bg-color)',
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
      <div className="workspace-sidebar-footer" style={{
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
            backgroundColor: ACCENT,
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
  );

  return (
    <ToolLayout
      slug="ai-pdf-summary"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={null}
      error={error}
      onReset={reset}
      onDrop={onDrop}
      accept={{ 'application/pdf': ['.pdf'] }}
      maxFiles={1}
      workspacePreview={showConfig ? null : workspacePreview}
      workspaceSidebar={showConfig ? null : workspaceSidebar}
      processingLabel="L'IA analyse votre document..."
      successMessage=""
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
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
        </div>
      }
    >
      {showConfig ? configModal : null}
    </ToolLayout>
  );
}
