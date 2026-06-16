'use client';
import SEO from '@/components/common/SEO';
import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { extractImagesFromPdf, ExtractedImage } from '@/features/pdf/extractImages';
import { ImageDown, Download } from 'lucide-react';

const TOOL_COLOR = '#ec4899';
const GRADIENT = 'linear-gradient(to right, #ec4899, #db2777)';

export default function ExtractImagesPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f); setImages([]); setError(null); setIsProcessing(true); setProgress(0);
      try {
        const result = await extractImagesFromPdf(f, setProgress);
        setImages(result);
      } catch { setError('Impossible d\'extraire les images de ce PDF.'); }
      finally { setIsProcessing(false); }
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const downloadImage = (img: ExtractedImage) => {
    const blob = new Blob([img.data as unknown as BlobPart], { type: img.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = img.name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => { images.forEach(downloadImage); };

  if (!file) {
    return (<>
      <SEO slug="extract-images" />
      <Header />
      <main className="tool-page-layout" style={{ padding: 0 }}>
        <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>Extraire les images</h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: 800, textAlign: 'center', lineHeight: 1.5 }}>
            Extrayez toutes les images intégrées dans votre document PDF.
          </p>
          <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <input {...getInputProps()} />
            <button style={{ backgroundColor: TOOL_COLOR, color: 'white', border: 'none', padding: '1.8rem 4rem', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: 12, boxShadow: `0 10px 25px ${TOOL_COLOR}66`, cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Sélectionner le fichier PDF
            </button>
            <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>ou déposez le PDF ici</p>
          </div>
        </div>
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
               <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Gérez vos PDF facilement</h2>
               <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                 Nos outils vous permettent de manipuler vos documents PDF en toute sécurité, directement dans votre navigateur. Aucune donnée n'est envoyée sur nos serveurs.
               </p>
            </div>
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
      <Footer />
    </>);
  }

  return (<>
    <Header />
    <main className="tool-page-layout">
      <div className="container" style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem' }}>
        {isProcessing ? (
          <div className="glass" style={{ padding: '4rem', borderRadius: '1rem', textAlign: 'center' }}>
            <h2>Extraction en cours...</h2>
            <div className="progress-container" style={{ marginTop: '2rem' }}>
              <div className="progress"><div className="progress-bar" style={{ width: `${progress}%`, backgroundImage: GRADIENT }} /></div>
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass" style={{ padding: '4rem', borderRadius: '1rem', textAlign: 'center' }}>
            <p className="text-danger" style={{ fontWeight: 'bold' }}>{error}</p>
            <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => { setFile(null); setError(null); }}>Réessayer</button>
          </div>
        ) : images.length === 0 ? (
          <div className="glass" style={{ padding: '4rem', borderRadius: '1rem', textAlign: 'center' }}>
            <h2>Aucune image trouvée</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>Ce PDF ne contient aucune image intégrée extractible.</p>
            <button className="btn btn-outline" style={{ marginTop: '1.5rem' }} onClick={() => { setFile(null); setImages([]); }}>Essayer un autre fichier</button>
          </div>
        ) : (
          <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10, color: TOOL_COLOR }}>
                <ImageDown size={24} /> {images.length} image(s) trouvée(s)
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }} onClick={downloadAll}>
                  <Download size={16} /> Tout télécharger
                </button>
                <button className="btn btn-outline" onClick={() => { setFile(null); setImages([]); }}>Nouveau fichier</button>
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
    </main>
    <Footer />
  </>);
}
