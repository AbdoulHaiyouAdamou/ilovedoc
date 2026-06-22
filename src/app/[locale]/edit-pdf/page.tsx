'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { applyEditAnnotations, PDFAnnotation } from '@/features/pdf/edit';
import { Type, ChevronLeft, ChevronRight, Plus, Trash2, FileText } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';
import AdUnit from '@/components/common/AdUnit';

const TOOL_COLOR = '#7c3aed';

export default function EditPdfPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop: handleDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  // PDF.js state
  const [canvasNode, setCanvasNode] = useState<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pageWidth, setPageWidth] = useState(595);
  const [pageHeight, setPageHeight] = useState(842);

  // Annotation state
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationColor, setAnnotationColor] = useState(TOOL_COLOR);
  const [annotationFontSize, setAnnotationFontSize] = useState(16);

  // Selection & dragging state
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1.0);

  // Load pdf.js from CDN
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      };
      document.head.appendChild(script);
    }
  }, []);

  // Load PDF document when file changes
  useEffect(() => {
    if (!file || !(window as any).pdfjsLib) return;

    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setPdfLoaded(true);
      } catch (err) {
        failProcessing('Impossible de lire ce fichier PDF.');
      }
    };

    const timer = setTimeout(loadPdf, 300);
    return () => clearTimeout(timer);
  }, [file, failProcessing]);

  // Render current page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasNode) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.2 * zoom });
        const context = canvasNode.getContext('2d');
        if (!context) return;

        canvasNode.width = viewport.width;
        canvasNode.height = viewport.height;
        setPageWidth(viewport.width);
        setPageHeight(viewport.height);

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
  }, [pdfDoc, canvasNode, currentPage, zoom]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleDrop(acceptedFiles);
      setAnnotations([]);
      setPdfLoaded(false);
      setPdfDoc(null);
      setSelectedIdx(null);
      setDraggedIdx(null);
    }
  }, [handleDrop]);

  const getEditingText = () => (selectedIdx !== null && annotations[selectedIdx]) ? annotations[selectedIdx].text || '' : annotationText;
  const getEditingColor = () => (selectedIdx !== null && annotations[selectedIdx]) ? annotations[selectedIdx].color || TOOL_COLOR : annotationColor;
  const getEditingFontSize = () => (selectedIdx !== null && annotations[selectedIdx]) ? annotations[selectedIdx].fontSize || 16 : annotationFontSize;

  const handleTextChange = (text: string) => selectedIdx !== null ? setAnnotations(prev => prev.map((ann, idx) => idx === selectedIdx ? { ...ann, text } : ann)) : setAnnotationText(text);
  const handleColorChange = (color: string) => selectedIdx !== null ? setAnnotations(prev => prev.map((ann, idx) => idx === selectedIdx ? { ...ann, color } : ann)) : setAnnotationColor(color);
  const handleFontSizeChange = (size: number) => selectedIdx !== null ? setAnnotations(prev => prev.map((ann, idx) => idx === selectedIdx ? { ...ann, fontSize: size } : ann)) : setAnnotationFontSize(size);

  const handleAddAnnotation = () => {
    const textVal = annotationText.trim() || 'Nouveau texte';
    const newAnnotation: PDFAnnotation = {
      type: 'text',
      pageIndex: currentPage - 1,
      x: pageWidth / (2 * 1.2 * zoom),
      y: pageHeight / (2 * 1.2 * zoom),
      text: textVal,
      fontSize: annotationFontSize,
      color: annotationColor,
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedIdx(annotations.length);
    setAnnotationText('');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains('canvas-overlay-area')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newAnnotation: PDFAnnotation = {
      type: 'text',
      pageIndex: currentPage - 1,
      x: x / (1.2 * zoom),
      y: (pageHeight - y) / (1.2 * zoom),
      text: 'Nouveau texte',
      fontSize: annotationFontSize,
      color: annotationColor,
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedIdx(annotations.length);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedIdx === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, pageWidth));
    const y = Math.max(0, Math.min(e.clientY - rect.top, pageHeight));

    setAnnotations(prev => prev.map((ann, idx) => idx === draggedIdx ? { ...ann, x: x / (1.2 * zoom), y: (pageHeight - y) / (1.2 * zoom) } : ann));
  };

  const handleMouseUp = () => setDraggedIdx(null);

  const handleRemoveAnnotation = (index: number) => {
    setAnnotations(prev => prev.filter((_, i) => i !== index));
    if (selectedIdx === index) setSelectedIdx(null);
  };

  const handleClearAll = () => { setAnnotations([]); setSelectedIdx(null); };

  const handleDownload = async () => {
    if (!file || annotations.length === 0) return;
    startProcessing();

    try {
      const progressInterval = setInterval(() => setProgress(p => Math.min(p + 10, 90)), 200);
      const result = await applyEditAnnotations(file, annotations, setProgress);
      clearInterval(progressInterval);
      setProgress(100);

      const blob = new Blob([result as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_edited.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de l\'édition.');
    }
  };

  const customWorkspace = (
    <div className="workspace" style={{ display: 'flex', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* LEFT COLUMN: Page Thumbnails Sidebar */}
      <div style={{ width: '160px', backgroundColor: 'var(--bg-color)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem', overflowY: 'auto', flexShrink: 0 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>Pages</h3>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <div 
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            style={{ width: '100px', height: '141px', border: currentPage === idx + 1 ? `2px solid ${TOOL_COLOR}` : '1px solid var(--glass-border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: currentPage === idx + 1 ? '0 10px 15px -3px rgba(124, 58, 237, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderRadius: '6px', transition: 'all 0.2s', flexShrink: 0, position: 'relative' }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: currentPage === idx + 1 ? TOOL_COLOR : '#64748b' }}>Page {idx + 1}</span>
          </div>
        ))}
      </div>

      {/* CENTER COLUMN: PDF Preview Panel */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-color-dark, #f1f5f9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ flex: 1, width: '100%', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          {!pdfLoaded ? (
            <div style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', background: '#fff', width: '400px', height: '560px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
              <FileText size={80} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '1rem' }}>Chargement du PDF...</p>
            </div>
          ) : (
            <div 
              className="canvas-overlay-area"
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ position: 'relative', width: `${pageWidth}px`, height: `${pageHeight}px`, boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', background: '#fff', cursor: 'text', userSelect: 'none', overflow: 'hidden', flexShrink: 0 }}
            >
              <canvas ref={setCanvasNode} style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />
              {annotations.map((ann, idx) => {
                if (ann.pageIndex !== currentPage - 1) return null;
                const isSelected = idx === selectedIdx;
                const left = ann.x * 1.2 * zoom;
                const top = pageHeight - (ann.y * 1.2 * zoom);
                
                return (
                  <div
                    key={idx}
                    onMouseDown={(e) => { e.stopPropagation(); setSelectedIdx(idx); setDraggedIdx(idx); }}
                    style={{ position: 'absolute', left: `${left}px`, top: `${top}px`, transform: 'translate(-50%, -50%)', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: `${(ann.fontSize || 16) * 1.2 * zoom}px`, color: ann.color || TOOL_COLOR, border: isSelected ? `2px dashed ${TOOL_COLOR}` : '1px solid transparent', padding: '4px 8px', borderRadius: '4px', cursor: 'move', whiteSpace: 'nowrap', userSelect: 'none', background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'transparent', zIndex: isSelected ? 50 : 10 }}
                  >
                    {ann.text}
                    {isSelected && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveAnnotation(idx); }}
                        style={{ position: 'absolute', top: '-12px', right: '-12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', lineHeight: 1 }}
                      >×</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div style={{ height: '50px', width: '100%', backgroundColor: 'var(--bg-color)', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '0 2rem', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage <= 1} style={{ background: 'none', border: 'none', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', color: currentPage <= 1 ? 'var(--text-muted)' : TOOL_COLOR, padding: '5px' }}>
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} style={{ background: 'none', border: 'none', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', color: currentPage >= totalPages ? 'var(--text-muted)' : TOOL_COLOR, padding: '5px' }}>
              <ChevronRight size={20} />
            </button>
          </div>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--glass-border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOOL_COLOR, fontWeight: 'bold', fontSize: '1.2rem', padding: '0 5px' }}>-</button>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', minWidth: '45px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2.0, z + 0.1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOOL_COLOR, fontWeight: 'bold', fontSize: '1.2rem', padding: '0 5px' }}>+</button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Sidebar */}
      <div className="workspace-sidebar" style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="workspace-sidebar-header">
          <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: TOOL_COLOR}}><Type size={24} /> Éditer</h2>
        </div>
        <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '8px' }}>Texte de l'annotation :</label>
            <input type="text" value={getEditingText()} onChange={(e) => handleTextChange(e.target.value)} placeholder="Tapez votre texte..." onKeyDown={(e) => { if (e.key === 'Enter') handleAddAnnotation(); }} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid var(--glass-border)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} onFocus={(e) => e.currentTarget.style.borderColor = TOOL_COLOR} onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '8px' }}>Couleur du texte :</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="color" value={getEditingColor()} onChange={(e) => handleColorChange(e.target.value)} style={{ width: '48px', height: '48px', border: '2px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer', padding: '2px', background: 'transparent' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{getEditingColor()}</span>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '8px' }}>Taille de police : <span style={{ color: TOOL_COLOR, fontWeight: '800' }}>{getEditingFontSize()}px</span></label>
            <input type="range" min="8" max="48" value={getEditingFontSize()} onChange={(e) => handleFontSizeChange(parseInt(e.target.value))} style={{ width: '100%', accentColor: TOOL_COLOR }} />
          </div>
          <button onClick={handleAddAnnotation} className="btn btn-outline" style={{ width: '100%', borderColor: TOOL_COLOR, color: TOOL_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Plus size={20} /> Ajouter un bloc de texte</button>
          
          {annotations.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Annotations ({annotations.length}) :</label>
                <button onClick={handleClearAll} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={14} /> Tout supprimer</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {annotations.map((ann, idx) => (
                  <div key={idx} onClick={() => setSelectedIdx(idx)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: selectedIdx === idx ? 'rgba(124, 58, 237, 0.1)' : 'var(--glass-bg)', border: selectedIdx === idx ? `1px solid ${TOOL_COLOR}` : '1px solid var(--glass-border)', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: ann.color || TOOL_COLOR, flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong style={{ color: 'var(--text-muted)' }}>P{ann.pageIndex + 1}</strong> {ann.text}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveAnnotation(idx); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}><AdUnit slot="ad-workspace-sidebar" format="rectangle" /></div>
        </div>
        <div className="workspace-sidebar-footer">
          {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px'}}>{error}</div>}
          <button className="btn btn-primary btn-xl" disabled={annotations.length === 0} style={{ width: '100%', backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR }} onClick={handleDownload}>
            Télécharger le PDF
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="edit-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { reset(); setAnnotations([]); setPdfDoc(null); setPdfLoaded(false); }}
      onDrop={onDrop}
      processingLabel="Édition en cours..."
      successMessage="🎉 Le PDF a été édité !"
      successSubtitle="Votre document modifié est prêt."
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Éditez vos PDF en toute simplicité</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Notre éditeur PDF vous permet d&apos;ajouter du texte directement sur vos documents. Personnalisez la couleur, la taille de police et la position de chaque annotation. L&apos;outil fonctionne entièrement dans votre navigateur pour garantir la confidentialité totale de vos fichiers. Aucune donnée n&apos;est envoyée sur un serveur. Parfait pour remplir des formulaires, ajouter des notes ou annoter des rapports.
          </p>
        </div>
      }
    >
      {customWorkspace}
    </ToolLayout>
  );
}
