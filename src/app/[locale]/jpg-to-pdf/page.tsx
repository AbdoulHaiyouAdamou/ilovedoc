'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { imagesToPdf } from '@/features/pdf/jpgToPdf';
import ImageIcon from 'lucide-react/dist/esm/icons/image';
import GripVertical from 'lucide-react/dist/esm/icons/grip-vertical';
import X from 'lucide-react/dist/esm/icons/x';
import { ToolLayout } from '@/components/tools';

const ACCENT = '#f59e0b';

export default function JpgToPdfPage({ slug = 'jpg-to-pdf' }: { slug?: string }) {
  const tTools = useTranslations('Tools');
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [margin, setMargin] = useState<'none' | 'small' | 'big'>('none');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggedState, setDraggedState] = useState<number | null>(null);
  const [dragOverState, setDragOverState] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setResultUrl(null);
      setError(null);
      setProgress(0);

      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);

      const newPreviews = { ...previews };
      acceptedFiles.forEach(file => {
        const key = `${file.name}-${file.lastModified}-${file.size}`;
        if (!newPreviews[key]) {
          newPreviews[key] = URL.createObjectURL(file);
        }
      });
      setPreviews(newPreviews);
    }
  }, [files, previews]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    },
    noClick: files.length > 0
  });

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setDraggedState(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragItem.current !== null && dragItem.current !== index) {
      dragOverItem.current = index;
      setDragOverState(index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragItem.current !== null && dragItem.current !== index) {
      const newFiles = [...files];
      const draggedFile = newFiles[dragItem.current];
      newFiles.splice(dragItem.current, 1);
      newFiles.splice(index, 0, draggedFile);
      setFiles(newFiles);
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedState(null);
    setDragOverState(null);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedState(null);
    setDragOverState(null);
  };

  const removeImage = (index: number) => {
    const newFiles = [...files];
    const removed = newFiles.splice(index, 1)[0];
    setFiles(newFiles);
    
    const key = `${removed.name}-${removed.lastModified}-${removed.size}`;
    if (previews[key]) {
      URL.revokeObjectURL(previews[key]);
      const newPreviews = { ...previews };
      delete newPreviews[key];
      setPreviews(newPreviews);
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index > 0) {
      const newFiles = [...files];
      const temp = newFiles[index];
      newFiles[index] = newFiles[index - 1];
      newFiles[index - 1] = temp;
      setFiles(newFiles);
    } else if (direction === 'right' && index < files.length - 1) {
      const newFiles = [...files];
      const temp = newFiles[index];
      newFiles[index] = newFiles[index + 1];
      newFiles[index + 1] = temp;
      setFiles(newFiles);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const pdfBytes = await imagesToPdf(files, {
        orientation,
        pageSize,
        margin,
        onProgress: setProgress
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ilovedoc_images.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const phase = files.length === 0 
    ? 'select' 
    : (isProcessing ? 'processing' : (resultUrl ? 'result' : 'workspace'));

  const workspacePreview = (
    <div className="workspace-preview" {...getRootProps()} style={{
      padding: '2rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '2rem',
      alignContent: 'start',
      flex: 1,
      outline: 'none',
      overflowY: 'auto'
    }}>
      <input {...getInputProps()} />
      {files.map((file, displayIndex) => {
        const isDragging = draggedState === displayIndex;
        const isDragOver = dragOverState === displayIndex;
        const key = `${file.name}-${file.lastModified}-${file.size}`;
        const previewUrl = previews[key];

        return (
          <div
            key={`img-${displayIndex}-${key}`}
            draggable
            onDragStart={(e) => handleDragStart(e, displayIndex)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, displayIndex)}
            onDrop={(e) => handleDrop(e, displayIndex)}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => setHoveredIndex(displayIndex)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="pdf-page-card"
            style={{
              cursor: 'grab',
              width: '100%',
              height: '220px',
              opacity: isDragging ? 0.4 : 1,
              transform: isDragging ? 'scale(0.95)' : isDragOver ? 'scale(1.05)' : 'none',
              border: isDragOver ? `3px solid ${ACCENT}` : '2px solid transparent',
              boxShadow: isDragOver
                ? `0 0 0 3px rgba(245, 158, 11, 0.3), 0 10px 25px rgba(0,0,0,0.15)`
                : undefined,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              userSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {hoveredIndex === displayIndex && (
              <div 
                onClick={(e) => { e.stopPropagation(); removeImage(displayIndex); }}
                style={{
                  position: 'absolute', top: '6px', right: '6px', zIndex: 20,
                  backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '50%',
                  padding: '4px', color: '#ef4444', cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Supprimer l'image"
              >
                <X size={16} />
              </div>
            )}

            <div style={{
              position: 'absolute', top: '6px', right: '6px', zIndex: 10,
              color: 'white', textShadow: '0 0 2px black', opacity: 0.8,
              display: hoveredIndex === displayIndex ? 'none' : 'block'
            }}>
              <GripVertical size={16} />
            </div>

            <div style={{
              position: 'absolute', top: '6px', left: '6px', zIndex: 10,
              backgroundColor: ACCENT, color: 'white', width: '24px', height: '24px',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}>
              {displayIndex + 1}
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'hidden' }}>
              {previewUrl ? (
                <img src={previewUrl} alt={file.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
              ) : (
                <div style={{ color: 'var(--color-text-tertiary)' }}><ImageIcon size={48} /></div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--glass-bg)', borderTop: '1px solid var(--glass-border)' }}>
              <button
                onClick={(e) => { e.stopPropagation(); moveImage(displayIndex, 'left'); }}
                disabled={displayIndex === 0}
                style={{ background: 'none', border: 'none', cursor: displayIndex === 0 ? 'not-allowed' : 'pointer', color: displayIndex === 0 ? '#cbd5e1' : ACCENT, fontSize: '1.2rem' }}
                title="Déplacer vers la gauche"
              >◀</button>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
                {file.name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); moveImage(displayIndex, 'right'); }}
                disabled={displayIndex === files.length - 1}
                style={{ background: 'none', border: 'none', cursor: displayIndex === files.length - 1 ? 'not-allowed' : 'pointer', color: displayIndex === files.length - 1 ? '#cbd5e1' : ACCENT, fontSize: '1.2rem' }}
                title="Déplacer vers la droite"
              >▶</button>
            </div>
          </div>
        );
      })}

      <div
        onClick={(e) => { e.stopPropagation(); open(); }}
        style={{
          width: '100%', height: '220px', border: `2px dashed var(--glass-border)`,
          borderRadius: '12px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          color: 'var(--color-text-tertiary)', backgroundColor: 'var(--glass-bg)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>+</div>
        <div style={{ fontWeight: '600' }}>Ajouter</div>
      </div>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div className="workspace-sidebar-header">
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: ACCENT }}>
          <ImageIcon size={24} /> Options pour Image en PDF
        </h2>
      </div>

      <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>Images sélectionnées:</span>
          <span style={{ fontWeight: 'bold', color: ACCENT, fontSize: '1.1rem' }}>{files.length}</span>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Orientation de la page</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: orientation === 'portrait' ? `2px solid ${ACCENT}` : '1px solid var(--glass-border)', backgroundColor: orientation === 'portrait' ? `rgba(245, 158, 11, 0.1)` : 'var(--glass-bg)', color: orientation === 'portrait' ? ACCENT : 'var(--color-text-secondary)', fontWeight: orientation === 'portrait' ? 'bold' : 'normal', cursor: 'pointer' }}
              onClick={() => setOrientation('portrait')}
            >Portrait</button>
            <button
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: orientation === 'landscape' ? `2px solid ${ACCENT}` : '1px solid var(--glass-border)', backgroundColor: orientation === 'landscape' ? `rgba(245, 158, 11, 0.1)` : 'var(--glass-bg)', color: orientation === 'landscape' ? ACCENT : 'var(--color-text-secondary)', fontWeight: orientation === 'landscape' ? 'bold' : 'normal', cursor: 'pointer' }}
              onClick={() => setOrientation('landscape')}
            >Paysage</button>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Taille de la page</label>
          <select 
            value={pageSize} onChange={(e) => setPageSize(e.target.value as any)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--glass-bg)', color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none' }}
          >
            <option value="a4">A4 (297x210 mm)</option>
            <option value="letter">Lettre US (215x279 mm)</option>
            <option value="fit">Ajusté à l'image</option>
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Marge</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              style={{ flex: 1, padding: '8px 5px', borderRadius: '8px', border: margin === 'none' ? `2px solid ${ACCENT}` : '1px solid var(--glass-border)', backgroundColor: margin === 'none' ? `rgba(245, 158, 11, 0.1)` : 'var(--glass-bg)', color: margin === 'none' ? ACCENT : 'var(--color-text-secondary)', fontWeight: margin === 'none' ? 'bold' : 'normal', fontSize: '0.9rem', cursor: 'pointer' }}
              onClick={() => setMargin('none')}
            >Aucune</button>
            <button
              style={{ flex: 1, padding: '8px 5px', borderRadius: '8px', border: margin === 'small' ? `2px solid ${ACCENT}` : '1px solid var(--glass-border)', backgroundColor: margin === 'small' ? `rgba(245, 158, 11, 0.1)` : 'var(--glass-bg)', color: margin === 'small' ? ACCENT : 'var(--color-text-secondary)', fontWeight: margin === 'small' ? 'bold' : 'normal', fontSize: '0.9rem', cursor: 'pointer' }}
              onClick={() => setMargin('small')}
            >Petite</button>
            <button
              style={{ flex: 1, padding: '8px 5px', borderRadius: '8px', border: margin === 'big' ? `2px solid ${ACCENT}` : '1px solid var(--glass-border)', backgroundColor: margin === 'big' ? `rgba(245, 158, 11, 0.1)` : 'var(--glass-bg)', color: margin === 'big' ? ACCENT : 'var(--color-text-secondary)', fontWeight: margin === 'big' ? 'bold' : 'normal', fontSize: '0.9rem', cursor: 'pointer' }}
              onClick={() => setMargin('big')}
            >Grande</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="jpg-to-pdf"
      phase={phase}
      file={files[0] || null} // Used as dummy to satisfy type if needed, though 'phase' overrides
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={() => { setFiles([]); setResultUrl(null); }}
      onDrop={onDrop}
      accept={{ 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] }}
      maxFiles={50} // Multiple files
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Conversion en cours..."
      successMessage="🎉 Les images ont été converties !"
      successSubtitle="Votre document PDF est prêt."
      downloadName="ilovedoc_images.pdf"
      actionLabel="Convertir en PDF"
      onAction={handleConvert}
      actionDisabled={files.length === 0}
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment convertir des images en PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez vos images JPG ou PNG ou glissez-déposez-les.</li>
            <li>Réorganisez l'ordre des images si nécessaire.</li>
            <li>Configurez les options d'orientation, de taille de page et de marges.</li>
            <li>Cliquez sur « Convertir en PDF » pour générer votre document.</li>
            <li>Le téléchargement de votre fichier PDF commencera automatiquement.</li>
          </ol>
        </div>
      }
    />
  );
}
