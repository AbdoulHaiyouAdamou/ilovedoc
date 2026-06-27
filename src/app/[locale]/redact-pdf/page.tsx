'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { redactPDF, RedactionRect } from '@/features/pdf/redact';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Search from 'lucide-react/dist/esm/icons/search';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import ZoomOut from 'lucide-react/dist/esm/icons/zoom-out';
import { ToolLayout, useToolState } from '@/components/tools';
import AdUnit from '@/components/common/AdUnit';

const TOOL_COLOR = '#1e293b';

export default function RedactPDFPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop: handleDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [redactions, setRedactions] = useState<RedactionRect[]>([]);
  const [color, setColor] = useState<'black' | 'red' | 'white'>('black');
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    script.onerror = () => failProcessing("Erreur lors du chargement de la bibliothèque de rendu PDF.");
    document.head.appendChild(script);
  }, [failProcessing]);

  // Load PDF document when file is dropped
  useEffect(() => {
    if (!file || !pdfjsLoaded) return;

    let active = true;
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = (window as any).pdfjsLib;
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (active) {
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPageIndex(0);
        }
      } catch (err) {
        if (active) failProcessing("Impossible de charger le PDF. Le fichier est peut-être protégé ou corrompu.");
      }
    };

    loadPdf();
    return () => { active = false; };
  }, [file, pdfjsLoaded, failProcessing]);

  // Render selected PDF page to canvas
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(currentPageIndex + 1);
      const viewport = page.getViewport({ scale: scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
      }
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  }, [pdfDoc, currentPageIndex, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleDrop(acceptedFiles);
      setRedactions([]);
      setPdfDoc(null);
    }
  }, [handleDrop]);

  // Handle drawing box selection
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !containerRef.current) return;
    setIsDrawing(false);

    const rect = containerRef.current.getBoundingClientRect();
    const xMin = Math.min(startPos.x, currentPos.x);
    const yMin = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(startPos.x - currentPos.x);
    const height = Math.abs(startPos.y - currentPos.y);

    if (width < 8 || height < 8) return;

    const newRedaction: RedactionRect = {
      pageIndex: currentPageIndex,
      x: xMin / rect.width,
      y: yMin / rect.height,
      width: width / rect.width,
      height: height / rect.height,
    };

    setRedactions(prev => [...prev, newRedaction]);
  };

  const removeRedaction = (index: number) => {
    setRedactions(prev => prev.filter((_, i) => i !== index));
  };

  const clearRedactionsOnCurrentPage = () => {
    setRedactions(prev => prev.filter(r => r.pageIndex !== currentPageIndex));
  };

  const handleProcess = async () => {
    if (!file || redactions.length === 0) return;

    startProcessing();

    try {
      const bytes = await redactPDF(file, {
        redactions,
        color,
        onProgress: setProgress,
      });

      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_censure.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de la censure.');
    }
  };

  const currentPageRedactions = redactions.filter(r => r.pageIndex === currentPageIndex);

  const customWorkspace = (
    <div className="workspace" style={{ display: 'flex', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* Left thumbnail panel */}
      <div style={{ width: '180px', borderRight: '1px solid var(--glass-border)', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', gap: '1rem', overflowY: 'auto', flexShrink: 0 }}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentPageIndex(i)}
            style={{ cursor: 'pointer', width: '120px', height: '160px', border: currentPageIndex === i ? '3px solid #ef4444' : '1px solid var(--glass-border)', borderRadius: '8px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative', transition: 'border-color 0.2s', flexShrink: 0 }}
          >
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>Page {i + 1}</span>
            {redactions.some(r => r.pageIndex === i) && (
              <div style={{ position: 'absolute', top: '5px', right: '5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            )}
          </div>
        ))}
      </div>

      {/* Center viewer */}
      <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--color-surface)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '1rem', alignItems: 'center' }}>
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)' }} title="Zoom arrière">
            <ZoomOut size={18} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 'bold', minWidth: '45px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)' }} title="Zoom avant">
            <ZoomIn size={18} />
          </button>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--glass-border)' }}></div>
          <button onClick={clearRedactionsOnCurrentPage} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }}>
            Effacer la page
          </button>
        </div>

        <div style={{ flex: 1, width: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', borderRadius: '4px', cursor: 'crosshair', userSelect: 'none', backgroundColor: 'white', flexShrink: 0, alignSelf: 'flex-start' }}
          >
            <canvas ref={canvasRef} style={{ display: 'block' }} />
            {currentPageRedactions.map((red, index) => {
              const globalIndex = redactions.findIndex(r => r === red);
              return (
                <div
                  key={index}
                  style={{ position: 'absolute', left: `${red.x * 100}%`, top: `${red.y * 100}%`, width: `${red.width * 100}%`, height: `${red.height * 100}%`, backgroundColor: color === 'black' ? 'rgba(0, 0, 0, 0.85)' : color === 'red' ? 'rgba(239, 68, 68, 0.75)' : 'rgba(255, 255, 255, 0.85)', border: '1.5px dashed #ef4444', pointerEvents: 'auto', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <button onClick={(e) => { e.stopPropagation(); removeRedaction(globalIndex); }} style={{ background: '#ef4444', border: 'none', color: 'white', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
            {isDrawing && (
              <div style={{ position: 'absolute', left: `${Math.min(startPos.x, currentPos.x)}px`, top: `${Math.min(startPos.y, currentPos.y)}px`, width: `${Math.abs(startPos.x - currentPos.x)}px`, height: `${Math.abs(startPos.y - currentPos.y)}px`, backgroundColor: 'rgba(239, 68, 68, 0.25)', border: '2px solid #ef4444', pointerEvents: 'none' }} />
            )}
          </div>
        </div>

        <div style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
          Page {currentPageIndex + 1} sur {totalPages}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="workspace-sidebar" style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="workspace-sidebar-header">
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#1e293b' }}>
            <EyeOff size={24} /> Censurer PDF
          </h2>
        </div>
        <div className="workspace-sidebar-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Chercher dans le texte</label>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Rechercher des mots à masquer..." value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--color-text)' }} />
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
            </div>
            {searchText && <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '6px' }}>💡 Faites glisser votre souris sur les mots trouvés pour dessiner un masque de censure précis.</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Couleur de censure</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['black', 'red', 'white'] as const).map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: color === c ? '2px solid #ef4444' : '1px solid var(--glass-border)', backgroundColor: c === 'black' ? '#000000' : c === 'red' ? '#ef4444' : '#ffffff', color: c === 'white' ? '#000' : '#fff', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {c === 'black' ? 'Noir' : c === 'red' ? 'Rouge' : 'Blanc'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Censures marquées ({redactions.length})</label>
            {redactions.length === 0 ? (
              <div style={{ padding: '1.5rem', background: 'rgba(30, 41, 59, 0.05)', border: '1px dashed var(--glass-border)', borderRadius: '12px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
                Sélectionnez et dessinez des rectangles de masquage directement sur le document pour commencer.
              </div>
            ) : (
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {redactions.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--glass-border)', fontSize: '13px' }}>
                    <span>Censure #{i + 1} (Page {r.pageIndex + 1})</span>
                    <button onClick={() => removeRedaction(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}><AdUnit slot="ad-workspace-sidebar" format="rectangle" /></div>
        </div>

        <div className="workspace-sidebar-footer">
          {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{error}</div>}
          <button className="btn btn-xl" onClick={handleProcess} disabled={redactions.length === 0} style={{ width: '100%', backgroundColor: redactions.length === 0 ? 'var(--color-text-tertiary)' : '#ef4444', color: 'white', border: 'none', cursor: redactions.length === 0 ? 'not-allowed' : 'pointer' }}>
            Censurer le document
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="redact-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { reset(); setRedactions([]); setPdfDoc(null); }}
      onDrop={onDrop}
      processingLabel="Censure en cours..."
      successMessage="🎉 Censure appliquée avec succès !"
      successSubtitle="Le texte sensible a été détruit et masqué de façon permanente."
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment caviarder un document PDF gratuitement</h2>
          <ol className="steps-list">
            <li>Sélectionnez ou déposez votre document PDF ci-dessus.</li>
            <li>Parcourez les pages et dessinez des rectangles noirs sur les zones de texte sensibles.</li>
            <li>Choisissez la couleur de masquage dans la barre latérale.</li>
            <li>Cliquez sur &quot;Censurer&quot; pour détruire définitivement le contenu masqué et téléchargez votre PDF anonymisé.</li>
          </ol>
        </div>
      }
    >
      {customWorkspace}
    </ToolLayout>
  );
}
