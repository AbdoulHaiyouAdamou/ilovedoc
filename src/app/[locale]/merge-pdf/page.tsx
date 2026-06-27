'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { mergePDFs } from '@/features/pdf/merge';
import FileUp from 'lucide-react/dist/esm/icons/file-up';
import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up';
import ArrowDown from 'lucide-react/dist/esm/icons/arrow-down';
import X from 'lucide-react/dist/esm/icons/x';
import { ToolLayout } from '@/components/tools';
import type { ToolPhase } from '@/components/tools/ToolLayout';

const TOOL_COLOR = '#7c3aed';

export default function MergePDFPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const phase: ToolPhase = files.length === 0
    ? 'select'
    : isProcessing
      ? 'processing'
      : resultUrl
        ? 'result'
        : 'workspace';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setResultUrl(null);
    setError(null);
    setProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) return;
    const newFiles = [...files];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFiles[index];
    newFiles[index] = newFiles[swapIndex];
    newFiles[swapIndex] = temp;
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true); setError(null); setProgress(0);
    try {
      const mergedBytes = await mergePDFs(files, { onProgress: setProgress });
      const blob = new Blob([mergedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la fusion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const reset = () => {
    setFiles([]);
    setResultUrl(null);
    setIsProcessing(false);
    setProgress(0);
  };

  const customWorkspace = (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="tool-container">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`} style={{ padding: '2rem' }}>
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <span className="dropzone-icon" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <FileUp size={48} color={TOOL_COLOR} />
            </span>
            <button className="btn btn-primary btn-lg" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR }}>Ajouter plus de fichiers</button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="file-manager glass" style={{ marginTop: '2rem' }}>
            <h3 className="file-manager-title">Fichiers sélectionnés ({files.length})</h3>
            <ul className="file-list">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatSize(file.size)}</span>
                  </div>
                  <div className="file-actions">
                    <button className="btn-icon" onClick={() => moveFile(index, 'up')} disabled={index === 0} title="Monter"><ArrowUp size={16} /></button>
                    <button className="btn-icon" onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} title="Descendre"><ArrowDown size={16} /></button>
                    <button className="btn-icon text-danger" onClick={() => removeFile(index)} title="Supprimer"><X size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>

            {error && <div className="error-message toast toast-error" style={{ marginTop: '1rem' }}>{error}</div>}

            <div className="action-area" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                className="btn btn-primary btn-xl"
                onClick={handleMerge}
                disabled={files.length < 2}
                style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: `linear-gradient(to right, ${TOOL_COLOR}, #6d28d9)` }}
              >
                Fusionner les PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="merge-pdf"
      phase={phase}
      file={files[0] || null} // Dummy to satisfy types, not actually used in select
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={reset}
      onDrop={onDrop}
      accept={{ 'application/pdf': ['.pdf'] }}
      maxFiles={100} // Merge supports many files
      processingLabel="Fusion en cours..."
      successMessage="Vos PDF ont été fusionnés avec succès !"
      actionLabel="Fusionner les PDF"
      downloadName="ilovedoc-merged.pdf"
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment fusionner des fichiers PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez vos fichiers PDF ou glissez-déposez-les dans la zone ci-dessus.</li>
            <li>Réorganisez l&apos;ordre des fichiers en utilisant les flèches si nécessaire.</li>
            <li>Cliquez sur le bouton &quot;Fusionner les PDF&quot; pour lancer le processus.</li>
            <li>Téléchargez votre nouveau fichier PDF fusionné.</li>
          </ol>
          <h3 style={{ marginTop: '2rem' }}>Pourquoi utiliser iLoveDoc ?</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Notre outil fonctionne entièrement dans votre navigateur. Vos fichiers ne sont <strong>jamais</strong> envoyés sur nos serveurs, garantissant une confidentialité totale et un traitement ultra-rapide.</p>
        </div>
      }
    >
      {/* For merge-pdf, we pass custom children to replace the WorkspaceLayout entirely */}
      {customWorkspace}
    </ToolLayout>
  );
}
