'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cropPDF } from '@/features/pdf/crop';
import { getPdfPageCount } from '@/features/pdf/split';
import { Crop } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#f43f5e';

export default function CropPDFPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop: handleDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [totalPages, setTotalPages] = useState<number>(0);
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [applyToAll, setApplyToAll] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      handleDrop(acceptedFiles);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
      } catch (err) {
        failProcessing("Impossible de lire ce PDF. Il est peut-être corrompu.");
      }
    }
  }, [handleDrop, failProcessing]);

  const handleMarginChange = (field: keyof typeof margins, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setMargins(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    startProcessing();
    try {
      const resultBytes = await cropPDF(file, {
        margins, applyToAll, currentPageIndex,
        onProgress: setProgress
      });
      const blob = new Blob([resultBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      const a = document.createElement('a'); a.href = url; a.download = `${file.name.replace('.pdf', '')}_rogne.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors du rognage.');
    }
  }, [file, margins, applyToAll, currentPageIndex, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
      <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', padding: '0' }}>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', backgroundColor: 'white' }}></div>
        {/* Visual representation of crop margins */}
        <div style={{
          position: 'absolute',
          top: `${margins.top}px`, bottom: `${margins.bottom}px`, left: `${margins.left}px`, right: `${margins.right}px`,
          border: `2px dashed ${TOOL_COLOR}`, backgroundColor: `${TOOL_COLOR}15`,
          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Crop color={TOOL_COLOR} size={48} opacity={0.5} />
        </div>
        {/* Some fake text lines to show context */}
        <div style={{ position: 'absolute', top: '40px', left: '40px', right: '40px' }}>
          <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px', width: '60%' }}></div>
          <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px' }}></div>
          <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px' }}></div>
          <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px', width: '80%' }}></div>
          <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px' }}></div>
          <div style={{ height: '8px', background: '#e2e8f0', marginBottom: '15px', width: '40%' }}></div>
        </div>
      </div>
      <div style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {totalPages > 1 && !applyToAll && (
          <>
            <button className="btn btn-outline" onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))} disabled={currentPageIndex === 0}>
              Précédent
            </button>
            <span>Page {currentPageIndex + 1} / {totalPages}</span>
            <button className="btn btn-outline" onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))} disabled={currentPageIndex === totalPages - 1}>
              Suivant
            </button>
          </>
        )}
        {applyToAll && <span>Aperçu du rognage (appliqué à {totalPages} pages)</span>}
      </div>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Pages à rogner</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="radio" checked={applyToAll} onChange={() => setApplyToAll(true)} style={{ accentColor: TOOL_COLOR }} />
            <span>Toutes les pages</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="radio" checked={!applyToAll} onChange={() => setApplyToAll(false)} style={{ accentColor: TOOL_COLOR }} />
            <span>Page actuelle</span>
          </label>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Marges de rognage (px)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {(['top', 'bottom', 'left', 'right'] as const).map(dir => (
            <div key={dir}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                {dir === 'top' ? 'Haut' : dir === 'bottom' ? 'Bas' : dir === 'left' ? 'Gauche' : 'Droite'}
              </label>
              <input
                type="number" value={margins[dir]} onChange={(e) => handleMarginChange(dir, e.target.value)} min={0}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--color-text)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="crop-pdf"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { reset(); setCurrentPageIndex(0); }}
      onDrop={onDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Rognage en cours..."
      successMessage="🎉 Le PDF a été rogné !"
      successSubtitle="Votre nouveau fichier est prêt."
      actionLabel="Rogner PDF"
      onAction={handleSubmit}
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment rogner un fichier PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez votre fichier PDF ou glissez-déposez-le dans la zone ci-dessus.</li>
            <li>Réglez les marges (haut, bas, gauche, droite) dans l&apos;espace de travail.</li>
            <li>Choisissez si vous souhaitez appliquer le rognage à toutes les pages ou seulement à la page actuelle.</li>
            <li>Cliquez sur &quot;Rogner PDF&quot; pour appliquer les modifications.</li>
          </ol>
        </div>
      }
    />
  );
}
