'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { extractImagesFromPdf, ExtractedImage } from '@/features/pdf/extractImages';
import { ImageDown, Download } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#ec4899';
const GRADIENT = 'linear-gradient(to right, #ec4899, #db2777)';

export default function ExtractImagesPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, error, phase,
    onDrop: handleDrop, reset, startProcessing, failProcessing, setProgress, setIsProcessing,
  } = useToolState();

  const [images, setImages] = useState<ExtractedImage[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      handleDrop(acceptedFiles);
      setImages([]);
      startProcessing();
      try {
        const result = await extractImagesFromPdf(f, setProgress);
        setImages(result);
        setIsProcessing(false); // We use workspace phase to show the custom result UI
      } catch {
        failProcessing('Impossible d\'extraire les images de ce PDF.');
      }
    }
  }, [handleDrop, startProcessing, failProcessing, setProgress, setIsProcessing]);

  const downloadImage = (img: ExtractedImage) => {
    const blob = new Blob([img.data as unknown as BlobPart], { type: img.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = img.name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => images.forEach(downloadImage);

  const customResultScreen = (
    <div className="container" style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem' }}>
      {images.length === 0 ? (
        <div className="glass" style={{ padding: '4rem', borderRadius: '1rem', textAlign: 'center' }}>
          <h2>Aucune image trouvée</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>Ce PDF ne contient aucune image intégrée extractible.</p>
          <button className="btn btn-outline" style={{ marginTop: '1.5rem' }} onClick={() => { reset(); setImages([]); }}>Essayer un autre fichier</button>
        </div>
      ) : (
        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10, color: TOOL_COLOR }}>
              <ImageDown size={24} /> {images.length} image(s) trouvée(s)
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }} onClick={downloadAll}>
                <Download size={16} /> Tout télécharger
              </button>
              <button className="btn btn-outline" onClick={() => { reset(); setImages([]); }}>Nouveau fichier</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {images.map((img, idx) => {
              const url = URL.createObjectURL(new Blob([img.data as unknown as BlobPart], { type: img.mimeType }));
              return (
                <div key={idx} style={{ borderRadius: 12, border: '1px solid var(--glass-border)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => downloadImage(img)} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  <div style={{ width: '100%', height: 150, background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={img.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.name}</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{img.width}×{img.height}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ToolLayout
      slug="extract-images"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={null}
      error={error}
      onReset={() => { reset(); setImages([]); }}
      onDrop={onDrop}
      processingLabel="Extraction en cours..."
      successMessage=""
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Gérez vos PDF facilement</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Nos outils vous permettent de manipuler vos documents PDF en toute sécurité, directement dans votre navigateur. Aucune donnée n&apos;est envoyée sur nos serveurs.
          </p>
        </div>
      }
    >
      {/* We pass children which will be rendered in the workspace phase */}
      {customResultScreen}
    </ToolLayout>
  );
}
