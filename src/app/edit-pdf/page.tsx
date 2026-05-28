'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { applyEditAnnotations, PDFAnnotation } from '@/features/pdf/edit';
import { Type, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, Plus, Trash2, FileText } from 'lucide-react';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  const [annotationColor, setAnnotationColor] = useState('#7c3aed');
  const [annotationFontSize, setAnnotationFontSize] = useState(16);

  // Selection & dragging state
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1.0);

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

  // Load PDF document when file changes
  useEffect(() => {
    if (!file || !window.pdfjsLib) return;

    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setPdfLoaded(true);
      } catch (err) {
        setError('Impossible de lire ce fichier PDF.');
        setFile(null);
      }
    };

    // Small delay to ensure pdf.js is ready
    const timer = setTimeout(loadPdf, 300);
    return () => clearTimeout(timer);
  }, [file]);

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
      setFile(acceptedFiles[0]);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      setAnnotations([]);
      setPdfLoaded(false);
      setPdfDoc(null);
      setSelectedIdx(null);
      setDraggedIdx(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  // Get active editing values (either from selected annotation or sidebar defaults)
  const getEditingText = () => {
    if (selectedIdx !== null && annotations[selectedIdx]) {
      return annotations[selectedIdx].text || '';
    }
    return annotationText;
  };

  const getEditingColor = () => {
    if (selectedIdx !== null && annotations[selectedIdx]) {
      return annotations[selectedIdx].color || '#7c3aed';
    }
    return annotationColor;
  };

  const getEditingFontSize = () => {
    if (selectedIdx !== null && annotations[selectedIdx]) {
      return annotations[selectedIdx].fontSize || 16;
    }
    return annotationFontSize;
  };

  // Change handlers
  const handleTextChange = (text: string) => {
    if (selectedIdx !== null) {
      setAnnotations(prev => prev.map((ann, idx) => idx === selectedIdx ? { ...ann, text } : ann));
    } else {
      setAnnotationText(text);
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedIdx !== null) {
      setAnnotations(prev => prev.map((ann, idx) => idx === selectedIdx ? { ...ann, color } : ann));
    } else {
      setAnnotationColor(color);
    }
  };

  const handleFontSizeChange = (size: number) => {
    if (selectedIdx !== null) {
      setAnnotations(prev => prev.map((ann, idx) => idx === selectedIdx ? { ...ann, fontSize: size } : ann));
    } else {
      setAnnotationFontSize(size);
    }
  };

  const handleAddAnnotation = () => {
    const textVal = annotationText.trim() || 'Nouveau texte';
    const newAnnotation: PDFAnnotation = {
      type: 'text',
      pageIndex: currentPage - 1,
      x: pageWidth / (2 * 1.2 * zoom), // Center horizontally
      y: pageHeight / (2 * 1.2 * zoom), // Center vertically
      text: textVal,
      fontSize: annotationFontSize,
      color: annotationColor,
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedIdx(annotations.length);
    setAnnotationText('');
  };

  // Click on canvas container to place text
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent adding if we clicked an annotation
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains('canvas-overlay-area')) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pdfX = x / (1.2 * zoom);
    const pdfY = (pageHeight - y) / (1.2 * zoom);

    const newAnnotation: PDFAnnotation = {
      type: 'text',
      pageIndex: currentPage - 1,
      x: pdfX,
      y: pdfY,
      text: 'Nouveau texte',
      fontSize: annotationFontSize,
      color: annotationColor,
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedIdx(annotations.length);
  };

  // Drag handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedIdx === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = Math.max(0, Math.min(clientX, pageWidth));
    const y = Math.max(0, Math.min(clientY, pageHeight));

    const pdfX = x / (1.2 * zoom);
    const pdfY = (pageHeight - y) / (1.2 * zoom);

    setAnnotations(prev => prev.map((ann, idx) => {
      if (idx === draggedIdx) {
        return { ...ann, x: pdfX, y: pdfY };
      }
      return ann;
    }));
  };

  const handleMouseUp = () => {
    setDraggedIdx(null);
  };

  const handleRemoveAnnotation = (index: number) => {
    setAnnotations(prev => prev.filter((_, i) => i !== index));
    if (selectedIdx === index) setSelectedIdx(null);
  };

  const handleClearAll = () => {
    setAnnotations([]);
    setSelectedIdx(null);
  };

  const handleDownload = async () => {
    if (!file || annotations.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);

      const result = await applyEditAnnotations(file, annotations, (percent) => {
        setProgress(percent);
      });
      clearInterval(progressInterval);
      setProgress(100);

      const blob = new Blob([result as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_edited.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'édition.');
    } finally {
      setIsProcessing(false);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const currentPageAnnotations = annotations.filter(a => a.pageIndex === currentPage - 1);

  // ─── INITIAL STATE: no file selected ─────────────────────────────
  if (!file) {
    return (
      <>
        <SEO slug="edit-pdf" />
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
              Éditer PDF
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Éditez vos fichiers PDF en ligne : ajoutez du texte, changez les couleurs et les tailles de police. 100% gratuit et confidentiel.
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
                transition: 'transform 0.2s',
                backgroundImage: 'linear-gradient(to right, #7c3aed, #6d28d9)',
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
               <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Éditez vos PDF en toute simplicité</h2>
               <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                 Notre éditeur PDF vous permet d'ajouter du texte directement sur vos documents. Personnalisez la couleur, la taille de police et la position de chaque annotation. L'outil fonctionne entièrement dans votre navigateur pour garantir la confidentialité totale de vos fichiers. Aucune donnée n'est envoyée sur un serveur. Parfait pour remplir des formulaires, ajouter des notes ou annoter des rapports.
               </p>
            </div>
            
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── PROCESSING / RESULT STATE ───────────────────────────────────
  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
             {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>Édition en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(to right, #7c3aed, #6d28d9)' }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle size={64} color="#7c3aed" />
                  </div>
                  <h2>🎉 Le PDF a été édité !</h2>
                  <p style={{marginBottom: '2rem'}}>Votre document modifié est prêt.</p>
                  <a href={resultUrl!} download className="btn btn-primary btn-xl" style={{backgroundColor: '#7c3aed', borderColor: '#7c3aed', backgroundImage: 'linear-gradient(to right, #7c3aed, #6d28d9)'}}>
                    Télécharger le PDF
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); setAnnotations([]); setPdfDoc(null); setPdfLoaded(false); }}>Éditer un autre fichier</button>
                  </div>
                </div>
             )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── WORKSPACE STATE: file selected, editing ─────────────────────
  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace" style={{ display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: Page Thumbnails Sidebar */}
        <div style={{
          width: '160px',
          backgroundColor: 'var(--bg-color)',
          borderRight: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          overflowY: 'auto',
          flexShrink: 0
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>Pages</h3>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <div 
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              style={{
                width: '100px',
                height: '141px', // A4 aspect ratio 1:1.41
                border: currentPage === idx + 1 ? '2px solid #7c3aed' : '1px solid var(--glass-border)',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: currentPage === idx + 1 ? '0 10px 15px -3px rgba(124, 58, 237, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                borderRadius: '6px',
                transition: 'all 0.2s',
                flexShrink: 0,
                position: 'relative'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: currentPage === idx + 1 ? '#7c3aed' : '#64748b' }}>
                Page {idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* CENTER COLUMN: PDF Preview Panel with zoom / navigation bar at the bottom */}
        <div style={{
          flex: 1,
          backgroundColor: 'var(--bg-color-dark, #f1f5f9)', // Darker background to make PDF page pop
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Main scrollable viewport */}
          <div style={{
            flex: 1,
            width: '100%',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            {/* PDF Canvas with Interactive Overlay */}
            {!pdfLoaded ? (
              <div style={{ 
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)', 
                border: '1px solid var(--glass-border)',
                background: '#fff',
                width: '400px', height: '560px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem'
              }}>
                <FileText size={80} color="#7c3aed" style={{ opacity: 0.5 }} />
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '1rem' }}>Chargement du PDF...</p>
              </div>
            ) : (
              <div 
                className="canvas-overlay-area"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ 
                  position: 'relative', 
                  width: `${pageWidth}px`, 
                  height: `${pageHeight}px`,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.15)', 
                  border: '1px solid var(--glass-border)',
                  background: '#fff',
                  cursor: 'text',
                  userSelect: 'none',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <canvas 
                  ref={setCanvasNode} 
                  style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} 
                />
                {/* Interactive annotations overlay */}
                {annotations.map((ann, idx) => {
                  if (ann.pageIndex !== currentPage - 1) return null;
                  const isSelected = idx === selectedIdx;
                  const left = ann.x * 1.2 * zoom;
                  const top = pageHeight - (ann.y * 1.2 * zoom);
                  
                  return (
                    <div
                      key={idx}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelectedIdx(idx);
                        setDraggedIdx(idx);
                      }}
                      style={{
                        position: 'absolute',
                        left: `${left}px`,
                        top: `${top}px`,
                        transform: 'translate(-50%, -50%)',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontSize: `${(ann.fontSize || 16) * 1.2 * zoom}px`,
                        color: ann.color || '#7c3aed',
                        border: isSelected ? '2px dashed #7c3aed' : '1px solid transparent',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'move',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                        zIndex: isSelected ? 50 : 10,
                      }}
                    >
                      {ann.text}
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAnnotation(idx);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            right: '-12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            lineHeight: 1
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Toolbar for Zoom and Navigation */}
          <div style={{
            height: '50px',
            width: '100%',
            backgroundColor: 'var(--bg-color)',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            padding: '0 2rem',
            zIndex: 10
          }}>
            {/* Page navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                style={{
                  background: 'none', border: 'none', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  color: currentPage <= 1 ? 'var(--text-muted)' : '#7c3aed', padding: '5px'
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                style={{
                  background: 'none', border: 'none', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  color: currentPage >= totalPages ? 'var(--text-muted)' : '#7c3aed', padding: '5px'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Separator */}
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--glass-border)' }}></div>

            {/* Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#7c3aed', fontWeight: 'bold', fontSize: '1.2rem', padding: '0 5px'
                }}
              >
                -
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', minWidth: '45px', textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={() => setZoom(z => Math.min(2.0, z + 0.1))}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#7c3aed', fontWeight: 'bold', fontSize: '1.2rem', padding: '0 5px'
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#7c3aed'}}>
              <Type size={24} /> Éditer
            </h2>
          </div>
          <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Annotation text input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '8px' }}>
                Texte de l'annotation :
              </label>
              <input
                type="text"
                value={getEditingText()}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Tapez votre texte..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddAnnotation(); }}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  borderRadius: '8px', 
                  border: '2px solid var(--glass-border)', 
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              />
            </div>

            {/* Color picker */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '8px' }}>
                Couleur du texte :
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  value={getEditingColor()}
                  onChange={(e) => handleColorChange(e.target.value)}
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    border: '2px solid var(--glass-border)', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: '2px',
                    background: 'transparent',
                  }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {getEditingColor()}
                </span>
              </div>
            </div>

            {/* Font size slider */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-color)', marginBottom: '8px' }}>
                Taille de police : <span style={{ color: '#7c3aed', fontWeight: '800' }}>{getEditingFontSize()}px</span>
              </label>
              <input
                type="range"
                min="8"
                max="48"
                value={getEditingFontSize()}
                onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#7c3aed' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>8px</span>
                <span>48px</span>
              </div>
            </div>

            {/* Add Text button */}
            <button
              onClick={handleAddAnnotation}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: 'rgba(124, 58, 237, 0.1)',
                border: '2px dashed #7c3aed',
                borderRadius: '8px',
                color: '#7c3aed',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '1rem',
                transition: 'all 0.2s',
              }}
            >
              <Plus size={20} /> Ajouter un bloc de texte
            </button>

            {/* Annotations list */}
            {annotations.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
                    Annotations ({annotations.length}) :
                  </label>
                  <button 
                    onClick={handleClearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={14} /> Tout supprimer
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {annotations.map((ann, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: selectedIdx === idx ? 'rgba(124, 58, 237, 0.1)' : 'var(--glass-bg, rgba(255,255,255,0.05))',
                        border: selectedIdx === idx ? '1px solid #7c3aed' : '1px solid var(--glass-border)',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '3px',
                          backgroundColor: ann.color || '#7c3aed',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: 'var(--text-muted)' }}>P{ann.pageIndex + 1}</strong>{' '}
                        {ann.text}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', flexShrink: 0 }}>
                        {ann.fontSize}px
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveAnnotation(idx); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#ef4444',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <AdUnit slot="ad-workspace-sidebar" format="rectangle" />
            </div>
          </div>
          
          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px'}}>{error}</div>}

            <button 
              className="btn btn-primary btn-xl" 
              disabled={annotations.length === 0}
              style={{
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px', 
                fontSize: '1.2rem', 
                padding: '1rem', 
                marginTop: '0.5rem',
                backgroundColor: '#7c3aed',
                borderColor: '#7c3aed',
                backgroundImage: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                opacity: annotations.length === 0 ? 0.5 : 1,
                cursor: annotations.length === 0 ? 'not-allowed' : 'pointer',
              }} 
              onClick={handleDownload}
            >
              Télécharger le PDF édité <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
