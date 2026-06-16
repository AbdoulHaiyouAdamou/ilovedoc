'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { getPdfPageCount } from '@/features/pdf/split';
import { GitCompare, ArrowRight, Upload, AlignLeft, Layers, Search } from 'lucide-react';
import type { DiffChange } from '@/features/pdf/compare';

// Word-level diff helper using LCS (Longest Common Subsequence)
function diffWords(textA: string, textB: string): Array<{ added?: boolean, removed?: boolean, value: string }> {
  const wordsA = textA.split(/\s+/).filter(Boolean);
  const wordsB = textB.split(/\s+/).filter(Boolean);
  
  const n = wordsA.length;
  const m = wordsB.length;
  const dp: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (wordsA[i - 1] === wordsB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const result: Array<{ added?: boolean, removed?: boolean, value: string }> = [];
  let i = n, j = m;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      result.unshift({ value: wordsA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ added: true, value: wordsB[j - 1] });
      j--;
    } else {
      result.unshift({ removed: true, value: wordsA[i - 1] });
      i--;
    }
  }
  
  return result;
}

// Group word-level diffs into larger modifications/additions/deletions
function getChanges(diff: Array<{ added?: boolean, removed?: boolean, value: string }>, pageNum: number): DiffChange[] {
  const changes: DiffChange[] = [];
  let idx = 0;
  while (idx < diff.length) {
    const item = diff[idx];
    if (item.removed) {
      const removedWords: string[] = [];
      while (idx < diff.length && diff[idx].removed) {
        removedWords.push(diff[idx].value);
        idx++;
      }
      if (idx < diff.length && diff[idx].added) {
        const addedWords: string[] = [];
        while (idx < diff.length && diff[idx].added) {
          addedWords.push(diff[idx].value);
          idx++;
        }
        changes.push({
          type: 'modification',
          originalText: removedWords.join(' '),
          text: addedWords.join(' '),
          page: pageNum
        });
      } else {
        changes.push({
          type: 'deletion',
          text: removedWords.join(' '),
          page: pageNum
        });
      }
    } else if (item.added) {
      const addedWords: string[] = [];
      while (idx < diff.length && diff[idx].added) {
        addedWords.push(diff[idx].value);
        idx++;
      }
      changes.push({
        type: 'addition',
        text: addedWords.join(' '),
        page: pageNum
      });
    } else {
      idx++;
    }
  }
  return changes;
}

export default function ComparePDFPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [pagesA, setPagesA] = useState<number>(0);
  const [pagesB, setPagesB] = useState<number>(0);
  
  const [pdfDocA, setPdfDocA] = useState<any>(null);
  const [pdfDocB, setPdfDocB] = useState<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  const [compareMode, setCompareMode] = useState<'text' | 'visual'>('text');
  const [searchText, setSearchText] = useState('');
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diffChanges, setDiffChanges] = useState<DiffChange[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const [canvasNodeA, setCanvasNodeA] = useState<HTMLCanvasElement | null>(null);
  const [canvasNodeB, setCanvasNodeB] = useState<HTMLCanvasElement | null>(null);

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

  // Load PDF A
  useEffect(() => {
    if (!fileA || !pdfjsLoaded) return;
    const loadPdf = async () => {
      try {
        const count = await getPdfPageCount(fileA);
        setPagesA(count);
        
        const arrayBuffer = await fileA.arrayBuffer();
        const pdfjsLib = (window as any).pdfjsLib;
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDocA(pdf);
      } catch (err) {
        setError("Erreur lors de la lecture du PDF A.");
      }
    };
    loadPdf();
  }, [fileA, pdfjsLoaded]);

  // Load PDF B
  useEffect(() => {
    if (!fileB || !pdfjsLoaded) return;
    const loadPdf = async () => {
      try {
        const count = await getPdfPageCount(fileB);
        setPagesB(count);
        
        const arrayBuffer = await fileB.arrayBuffer();
        const pdfjsLib = (window as any).pdfjsLib;
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDocB(pdf);
      } catch (err) {
        setError("Erreur lors de la lecture du PDF B.");
      }
    };
    loadPdf();
  }, [fileB, pdfjsLoaded]);

  // Extract text and compute differences
  useEffect(() => {
    if (!pdfDocA || !pdfDocB) {
      setDiffChanges([]);
      return;
    }

    const runComparison = async () => {
      setIsComparing(true);
      setError(null);
      try {
        const changesList: DiffChange[] = [];
        const maxPage = Math.max(pdfDocA.numPages, pdfDocB.numPages);
        
        for (let p = 1; p <= maxPage; p++) {
          let textA = '';
          let textB = '';

          if (p <= pdfDocA.numPages) {
            try {
              const page = await pdfDocA.getPage(p);
              const textContent = await page.getTextContent();
              textA = textContent.items.map((item: any) => item.str).join(' ');
            } catch (err) {
              console.error(`Error reading docA page ${p}`, err);
            }
          }

          if (p <= pdfDocB.numPages) {
            try {
              const page = await pdfDocB.getPage(p);
              const textContent = await page.getTextContent();
              textB = textContent.items.map((item: any) => item.str).join(' ');
            } catch (err) {
              console.error(`Error reading docB page ${p}`, err);
            }
          }

          if (textA.trim() !== textB.trim()) {
            if (p > pdfDocA.numPages) {
              changesList.push({
                type: 'addition',
                text: textB.trim() || 'Page entière ajoutée',
                page: p
              });
            } else if (p > pdfDocB.numPages) {
              changesList.push({
                type: 'deletion',
                text: textA.trim() || 'Page entière supprimée',
                page: p
              });
            } else {
              const diffs = diffWords(textA, textB);
              const pageChanges = getChanges(diffs, p);
              changesList.push(...pageChanges);
            }
          }
        }
        setDiffChanges(changesList);
      } catch (err) {
        console.error("Comparison error:", err);
        setError("Impossible de finaliser la comparaison automatique du texte.");
      } finally {
        setIsComparing(false);
      }
    };

    runComparison();
  }, [pdfDocA, pdfDocB]);

  // Render Page
  const renderPages = useCallback(async () => {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) return;

    if (pdfDocA && canvasNodeA) {
      try {
        const maxPage = pdfDocA.numPages;
        if (currentPageIndex < maxPage) {
          const page = await pdfDocA.getPage(currentPageIndex + 1);
          const viewport = page.getViewport({ scale: 0.8 });
          const canvas = canvasNodeA;
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
          }
        } else {
          const canvas = canvasNodeA;
          const context = canvas.getContext('2d');
          if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (pdfDocB && canvasNodeB) {
      try {
        const maxPage = pdfDocB.numPages;
        if (currentPageIndex < maxPage) {
          const page = await pdfDocB.getPage(currentPageIndex + 1);
          const viewport = page.getViewport({ scale: 0.8 });
          const canvas = canvasNodeB;
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
          }
        } else {
          const canvas = canvasNodeB;
          const context = canvas.getContext('2d');
          if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [pdfDocA, pdfDocB, currentPageIndex, canvasNodeA, canvasNodeB]);

  useEffect(() => {
    renderPages();
  }, [renderPages]);

  const onDropA = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFileA(accepted[0]);
      setError(null);
    }
  }, []);

  const onDropB = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFileB(accepted[0]);
      setError(null);
    }
  }, []);

  const dropzoneA = useDropzone({ onDrop: onDropA, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });
  const dropzoneB = useDropzone({ onDrop: onDropB, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const maxPages = Math.max(pagesA, pagesB);

  // Generate comparison PDF report
  const generateReport = async () => {
    if (!fileA || !fileB) return;
    setIsComparing(true);
    try {
      const { generateComparisonPdf } = await import('@/features/pdf/compare');
      const pdfBytes = await generateComparisonPdf(
        fileA.name,
        fileA.size,
        pagesA,
        fileB.name,
        fileB.size,
        pagesB,
        compareMode,
        filteredChanges
      );
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_comparaison_${fileA.name.replace('.pdf', '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la génération du rapport PDF.");
    } finally {
      setIsComparing(false);
    }
  };

  const isReady = fileA && fileB;

  // Filter changes based on search query
  const filteredChanges = diffChanges.filter(c => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    const matchesText = c.text.toLowerCase().includes(q);
    const matchesOriginal = c.originalText ? c.originalText.toLowerCase().includes(q) : false;
    return matchesText || matchesOriginal;
  });

  return (
    <>
      <SEO slug="compare-pdf" />
      <Header />
      
      {!isReady ? (
        <main className="tool-page-layout" style={{ padding: '2rem 1rem' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
              Comparer deux fichiers PDF
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>
              Déposez vos deux fichiers PDF pour comparer leur contenu textuel ou structurel et identifier les différences.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
              
              {/* Dropzone A */}
              <div
                {...dropzoneA.getRootProps()}
                style={{
                  border: '3px dashed #ef4444',
                  borderRadius: '16px',
                  padding: '4rem 2rem',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <input {...dropzoneA.getInputProps()} />
                <Upload size={48} color="#ef4444" />
                <h3 style={{ fontSize: '1.4rem' }}>{fileA ? fileA.name : 'Sélectionner le PDF principal'}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  {fileA ? `${(fileA.size / 1024).toFixed(1)} KB` : 'ou glissez-déposez le fichier ici'}
                </p>
              </div>

              {/* Dropzone B */}
              <div
                {...dropzoneB.getRootProps()}
                style={{
                  border: '3px dashed #ef4444',
                  borderRadius: '16px',
                  padding: '4rem 2rem',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <input {...dropzoneB.getInputProps()} />
                <Upload size={48} color="#ef4444" />
                <h3 style={{ fontSize: '1.4rem' }}>{fileB ? fileB.name : 'Sélectionner le PDF à comparer'}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  {fileB ? `${(fileB.size / 1024).toFixed(1)} KB` : 'ou glissez-déposez le fichier ici'}
                </p>
              </div>

            </div>

            {error && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>}

            <AdUnit slot="ad-top" format="horizontal" />

            {/* SEO section */}
            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2>Comment comparer deux fichiers PDF ?</h2>
              <ol className="steps-list">
                <li>Sélectionnez ou glissez-déposez votre document PDF principal dans la zone gauche.</li>
                <li>Sélectionnez ou glissez-déposez le PDF modifié ou à comparer dans la zone droite.</li>
                <li>Le système va synchroniser le défilement et lancer automatiquement l'analyse textuelle sémantique.</li>
                <li>Consultez la liste des modifications détectées en temps réel dans la barre latérale.</li>
                <li>Téléchargez le rapport final détaillé des différences sous forme de fichier PDF.</li>
              </ol>
            </section>

          </div>
        </main>
      ) : (
        /* Workspace layout */
        <>
          <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
            <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
              <AdUnit slot="ad-workspace-top" format="horizontal" />
            </div>
          </div>

          <div className="workspace">
            {/* Side-by-Side viewer */}
            <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1.5rem', overflowY: 'auto' }}>
              
              {/* Pagination controls */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                  disabled={currentPageIndex === 0}
                >
                  Précédent
                </button>
                <span style={{ fontWeight: 'bold' }}>
                  Page {currentPageIndex + 1} / {maxPages}
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentPageIndex(p => Math.min(maxPages - 1, p + 1))}
                  disabled={currentPageIndex === maxPages - 1}
                >
                  Suivant
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', alignItems: 'start' }}>
                {/* Column A */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h4 style={{ marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', width: '100%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    A: {fileA.name}
                  </h4>
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
                    width: '100%',
                    aspectRatio: '1 / 1.414'
                  }}>
                    <canvas ref={setCanvasNodeA} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
                  </div>
                </div>

                {/* Column B */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h4 style={{ marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', width: '100%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    B: {fileB.name}
                  </h4>
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
                    width: '100%',
                    aspectRatio: '1 / 1.414'
                  }}>
                    <canvas ref={setCanvasNodeB} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar controls */}
            <div className="workspace-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="workspace-sidebar-header">
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <GitCompare size={24} /> Comparer PDF
                </h2>
              </div>

              <div className="workspace-sidebar-content" style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Compare Mode Tabs */}
                <div style={{ display: 'flex', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setCompareMode('text')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: 'none',
                      backgroundColor: compareMode === 'text' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      color: compareMode === 'text' ? '#ef4444' : 'var(--color-text-secondary)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <AlignLeft size={16} /> Texte sémantique
                  </button>
                  <button
                    onClick={() => setCompareMode('visual')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: 'none',
                      backgroundColor: compareMode === 'visual' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      color: compareMode === 'visual' ? '#ef4444' : 'var(--color-text-secondary)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Layers size={16} /> Superposition
                  </button>
                </div>

                <div style={{
                  padding: '0.8rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)'
                }}>
                  {compareMode === 'text'
                    ? "Comparer les modifications de texte entre deux PDF."
                    : "Superposez visuellement les pages des deux PDF pour identifier les déplacements de blocs."}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                    Chercher dans le texte
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Chercher dans les documents..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 8px 8px 32px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-color)',
                        color: 'var(--color-text)',
                        fontSize: '0.9rem'
                      }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-tertiary)' }} />
                  </div>
                </div>

                {/* Change Report List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Rapport de changement ({filteredChanges.length})</span>
                    {isComparing && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Analyse...</span>}
                  </h3>

                  {filteredChanges.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '5px' }}>
                      {isComparing ? 'Analyse du contenu des documents...' : 'Aucune différence de texte détectée.'}
                    </p>
                  ) : (
                    <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                      {Array.from(new Set(filteredChanges.map(c => c.page))).sort((a,b) => a-b).map(pageNum => (
                        <div key={pageNum} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            Page {pageNum}
                          </h4>
                          
                          {filteredChanges.filter(c => c.page === pageNum).map((change, cIdx) => (
                            <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px', background: 'var(--color-surface)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: change.type === 'addition' ? '#10b981' : change.type === 'deletion' ? '#ef4444' : '#3b82f6' }}>
                                {change.type === 'addition' ? 'Ajouter' : change.type === 'deletion' ? 'Supprimer' : 'Modifier'}
                              </div>

                              {(change.type === 'deletion' || change.type === 'modification') && (
                                <div style={{
                                  backgroundColor: '#fef2f2',
                                  borderLeft: '3px solid #ef4444',
                                  padding: '5px 8px',
                                  borderRadius: '0 4px 4px 0',
                                  fontSize: '0.75rem',
                                  color: '#991b1b',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <span style={{ overflowWrap: 'anywhere' }}>
                                    <strong>Existant</strong><br />
                                    {change.type === 'modification' ? change.originalText : change.text}
                                  </span>
                                  <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 'bold', marginLeft: '5px' }}>
                                    -{change.type === 'modification' ? change.originalText?.length : change.text.length}
                                  </span>
                                </div>
                              )}

                              {(change.type === 'addition' || change.type === 'modification') && (
                                <div style={{
                                  backgroundColor: '#f0fdf4',
                                  borderLeft: '3px solid #10b981',
                                  padding: '5px 8px',
                                  borderRadius: '0 4px 4px 0',
                                  fontSize: '0.75rem',
                                  color: '#166534',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <span style={{ overflowWrap: 'anywhere' }}>
                                    <strong>Nouveau</strong><br />
                                    {change.text}
                                  </span>
                                  <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 'bold', marginLeft: '5px' }}>
                                    +{change.text.length}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ads Unit */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  <AdUnit slot="ad-workspace-sidebar" format="rectangle" />
                </div>
              </div>

              <div className="workspace-sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{error}</p>}
                
                <button
                  className="btn btn-xl"
                  onClick={generateReport}
                  disabled={isComparing}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.1rem',
                    padding: '0.8rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Télécharger le rapport <ArrowRight size={20} />
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setFileA(null);
                    setFileB(null);
                    setPdfDocA(null);
                    setPdfDocB(null);
                    setDiffChanges([]);
                  }}
                  style={{ width: '100%', marginTop: '8px', padding: '0.6rem' }}
                >
                  Comparer d'autres fichiers
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}
