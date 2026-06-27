'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { splitPDFAdvanced, getPdfPageCount, SplitInterval } from '@/features/pdf/split';
import Plus from 'lucide-react/dist/esm/icons/plus';
import X from 'lucide-react/dist/esm/icons/x';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#7c3aed';

export default function SplitPDFPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop: handleDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [totalPages, setTotalPages] = useState<number>(0);
  const [intervals, setIntervals] = useState<SplitInterval[]>([]);
  const [mergeIntervals, setMergeIntervals] = useState(false);
  const [activeTab, setActiveTab] = useState<'intervalle' | 'pages'>('intervalle');
  const [isZipResult, setIsZipResult] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      handleDrop(acceptedFiles);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
        setIntervals([{ id: Date.now().toString(), start: 1, end: count }]);
      } catch (err) {
        failProcessing("Impossible de lire ce PDF. Il est peut-être corrompu.");
      }
    }
  }, [handleDrop, failProcessing]);

  const addInterval = () => {
    setIntervals([...intervals, { id: Date.now().toString(), start: 1, end: totalPages }]);
  };

  const removeInterval = (id: string) => {
    setIntervals(intervals.filter(i => i.id !== id));
  };

  const updateInterval = (id: string, field: 'start' | 'end', value: number) => {
    setIntervals(intervals.map(i => {
      if (i.id === id) {
        const val = Math.max(1, Math.min(totalPages, value));
        const updated = { ...i, [field]: val };
        if (field === 'start' && updated.start > updated.end) updated.end = updated.start;
        if (field === 'end' && updated.end < updated.start) updated.start = updated.end;
        return updated;
      }
      return i;
    }));
  };

  const handleSplit = async () => {
    if (!file) return;
    
    let finalIntervals = intervals;
    if (activeTab === 'pages') {
      finalIntervals = [];
      for (let i = 1; i <= totalPages; i++) {
        finalIntervals.push({ id: `page-${i}`, start: i, end: i });
      }
    } else {
      if (intervals.length === 0) return;
    }

    startProcessing();
    try {
      const actualMerge = activeTab === 'pages' ? false : mergeIntervals;
      const { blob, isZip } = await splitPDFAdvanced(file, finalIntervals, actualMerge, { onProgress: setProgress });
      const url = URL.createObjectURL(blob);
      setIsZipResult(isZip);
      finishProcessing(url);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = isZip ? `${file.name.replace('.pdf','')}_split.zip` : `${file.name.replace('.pdf','')}_merged.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de la division.');
    }
  };

  const handleReset = () => {
    reset();
    setActiveTab('intervalle');
    setMergeIntervals(false);
  };

  const workspacePreview = file && (
    <>
      {intervals.map((interval, idx) => (
        <div key={interval.id} className="interval-block" style={{ marginBottom: '2rem' }}>
          <div className="interval-label" style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Intervalle {idx + 1}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="pdf-page-card" style={{ width: 150, height: 210 }}>
              <div className="pdf-page-header" style={{backgroundColor: `hsl(${(idx * 45) % 360}, 70%, 50%)`}}>
                Page {interval.start}
              </div>
              <div className="pdf-page-content">
                <div className="pdf-page-line"></div>
                <div className="pdf-page-line"></div>
                <div className="pdf-page-line short"></div>
                <div className="pdf-page-line"></div>
              </div>
              <div className="pdf-page-number">{interval.start}</div>
            </div>

            {interval.end > interval.start && (
              <>
                <div className="interval-dots" style={{ fontSize: '2rem', color: '#ccc', letterSpacing: '4px' }}>...</div>
                <div className="pdf-page-card" style={{ width: 150, height: 210 }}>
                  <div className="pdf-page-header" style={{backgroundColor: `hsl(${(idx * 45 + 10) % 360}, 80%, 60%)`}}>
                    Page {interval.end}
                  </div>
                  <div className="pdf-page-content">
                    <div className="pdf-page-line"></div>
                    <div className="pdf-page-line short"></div>
                    <div className="pdf-page-line"></div>
                    <div className="pdf-page-line"></div>
                  </div>
                  <div className="pdf-page-number">{interval.end}</div>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="tabs" style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 4 }}>
        <div className={`tab ${activeTab === 'intervalle' ? 'active' : ''}`} onClick={() => setActiveTab('intervalle')} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', cursor: 'pointer', borderRadius: 8, background: activeTab === 'intervalle' ? 'white' : 'transparent', boxShadow: activeTab === 'intervalle' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', fontWeight: activeTab === 'intervalle' ? 'bold' : 'normal', color: activeTab === 'intervalle' ? TOOL_COLOR : 'inherit' }}>
          Intervalle
        </div>
        <div className={`tab ${activeTab === 'pages' ? 'active' : ''}`} onClick={() => setActiveTab('pages')} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', cursor: 'pointer', borderRadius: 8, background: activeTab === 'pages' ? 'white' : 'transparent', boxShadow: activeTab === 'pages' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', fontWeight: activeTab === 'pages' ? 'bold' : 'normal', color: activeTab === 'pages' ? TOOL_COLOR : 'inherit' }}>
          Pages
        </div>
      </div>

      {activeTab === 'intervalle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {intervals.map((interval, idx) => (
            <div key={interval.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Intervalle {idx + 1}</span>
                {intervals.length > 1 && (
                  <X size={16} style={{ cursor: 'pointer', color: '#e11d48' }} onClick={() => removeInterval(interval.id)} />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>de</span>
                <input type="number" style={{ width: 60, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--glass-border)' }} value={interval.start} onChange={(e) => updateInterval(interval.id, 'start', parseInt(e.target.value) || 1)} min={1} max={totalPages} />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>à</span>
                <input type="number" style={{ width: 60, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--glass-border)' }} value={interval.end} onChange={(e) => updateInterval(interval.id, 'end', parseInt(e.target.value) || 1)} min={1} max={totalPages} />
              </div>
            </div>
          ))}

          <button className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', color: TOOL_COLOR, borderColor: TOOL_COLOR }} onClick={addInterval}>
            <Plus size={18} /> Ajouter un intervalle
          </button>
          
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none', marginTop: '1rem' }}>
            <input type="checkbox" checked={mergeIntervals} onChange={(e) => setMergeIntervals(e.target.checked)} style={{ marginTop: '4px', transform: 'scale(1.2)', accentColor: TOOL_COLOR }} />
            <span>Fusionner tous les intervalles dans un seul fichier PDF.</span>
          </label>
        </div>
      )}

      {activeTab === 'pages' && (
        <div style={{ padding: '1.5rem', background: `${TOOL_COLOR}15`, border: `2px solid ${TOOL_COLOR}`, borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ color: TOOL_COLOR, marginBottom: '10px', fontSize: '1.1rem' }}>Extraire toutes les pages</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Le PDF sera divisé en {totalPages} fichiers séparés (un par page).
          </p>
        </div>
      )}
    </div>
  );

  return (
    <ToolLayout
      slug="split-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={handleReset}
      onDrop={onDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Découpage en cours..."
      successMessage="🎉 Le PDF a été divisé !"
      successSubtitle="Vos nouveaux fichiers sont prêts."
      actionLabel="Diviser PDF"
      onAction={handleSplit}
      downloadName={file ? (isZipResult ? `${file.name.replace('.pdf','')}_split.zip` : `${file.name.replace('.pdf','')}_merged.pdf`) : undefined}
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment diviser un fichier PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez votre fichier PDF ou glissez-déposez-le dans la zone ci-dessus.</li>
            <li>Définissez vos intervalles de pages dans l&apos;espace de travail.</li>
            <li>Cliquez sur &quot;Diviser PDF&quot; pour séparer ou extraire vos pages.</li>
            <li>Le téléchargement de votre fichier (ou archive ZIP) se lancera automatiquement.</li>
          </ol>
        </div>
      }
    />
  );
}
