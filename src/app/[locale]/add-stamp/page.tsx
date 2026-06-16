'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { addStampToPdf, StampOptions } from '@/features/pdf/stamp';
import { Stamp, CheckCircle, ArrowRight, FileText } from 'lucide-react';

const TOOL_COLOR = '#f59e0b';
const GRADIENT = 'linear-gradient(to right, #f59e0b, #d97706)';

export default function AddStampPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stampText, setStampText] = useState('CONFIDENTIEL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [textColor, setTextColor] = useState('#ff0000');
  const [position, setPosition] = useState<StampOptions['position']>('cc');
  const [stampImage, setStampImage] = useState<File | null>(null);
  const [useImage, setUseImage] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResultUrl(null);
      setError(null);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const blob = await addStampToPdf(file, {
        text: stampText,
        fontSize,
        fontFamily: 'Arial',
        isBold: true,
        isItalic: false,
        textColor,
        opacity,
        rotation,
        position,
        pageRange: { from: 1, to: 9999 },
        stampImage: useImage ? stampImage : null,
        onProgress: setProgress,
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '_stamped.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsProcessing(false);
    }
  };

  const positions = [
    { value: 'tl', label: '↖' }, { value: 'tc', label: '↑' }, { value: 'tr', label: '↗' },
    { value: 'cl', label: '←' }, { value: 'cc', label: '•' }, { value: 'cr', label: '→' },
    { value: 'bl', label: '↙' }, { value: 'bc', label: '↓' }, { value: 'br', label: '↘' },
  ];

  if (!file) {
    return (
      <>
        <SEO slug="add-stamp" />
        <Header />
        <main className="tool-page-layout" style={{ padding: 0 }}>
          <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>Ajouter un tampon</h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: 800, textAlign: 'center', lineHeight: 1.5 }}>
              Apposez un tampon texte ou image sur toutes les pages de votre PDF.
            </p>
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{ backgroundColor: TOOL_COLOR, color: 'white', border: 'none', padding: '1.8rem 4rem', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: 12, boxShadow: `0 10px 25px ${TOOL_COLOR}66`, cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
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
      </>
    );
  }

  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            {isProcessing ? (
              <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <h2>Application du tampon...</h2>
                <div className="progress-container" style={{ marginTop: '2rem' }}>
                  <div className="progress"><div className="progress-bar" style={{ width: `${progress}%`, backgroundImage: GRADIENT }} /></div>
                  <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
                </div>
              </div>
            ) : (
              <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle size={64} color={TOOL_COLOR} />
                </div>
                <h2>🎉 Tampon ajouté !</h2>
                <p style={{ marginBottom: '2rem' }}>Votre document est prêt.</p>
                <a href={resultUrl!} download className="btn btn-primary btn-xl" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }}>Télécharger le PDF</a>
                <div style={{ marginTop: '2rem' }}>
                  <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); }}>Tamponner un autre fichier</button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
        <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
          <div className="pdf-page-card" style={{ width: 300, height: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
            <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>{file.name}</div>
            <div className="pdf-page-content" style={{ 
              display: 'flex', 
              alignItems: position.startsWith('t') ? 'flex-start' : position.startsWith('b') ? 'flex-end' : 'center', 
              justifyContent: position.endsWith('l') ? 'flex-start' : position.endsWith('r') ? 'flex-end' : 'center', 
              height: '100%', 
              position: 'relative',
              padding: '1rem'
            }}>
              {useImage && stampImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={URL.createObjectURL(stampImage)} alt="stamp" style={{ maxWidth: '50%', opacity, transform: `rotate(${rotation}deg)` }} />
              ) : (
                <span style={{ fontSize: fontSize * 0.4, fontWeight: 'bold', color: textColor, opacity, transform: `rotate(${rotation}deg)`, textAlign: 'center' }}>{stampText}</span>
              )}
            </div>
          </div>
        </div>
        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: TOOL_COLOR }}>
              <Stamp size={24} /> Tampon
            </h2>
          </div>
          <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', background: 'var(--glass-bg)', borderRadius: 8, padding: 4 }}>
              <button onClick={() => setUseImage(false)} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', background: !useImage ? TOOL_COLOR : 'transparent', color: !useImage ? 'white' : 'var(--text-color)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>Texte</button>
              <button onClick={() => setUseImage(true)} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', background: useImage ? TOOL_COLOR : 'transparent', color: useImage ? 'white' : 'var(--text-color)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>Image</button>
            </div>

            {!useImage ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Texte du tampon</label>
                  <input type="text" value={stampText} onChange={e => setStampText(e.target.value)}
                    style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Taille</label>
                    <input type="number" min={8} max={200} value={fontSize} onChange={e => setFontSize(+e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Couleur</label>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                      style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid var(--glass-border)', cursor: 'pointer' }} />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Image du tampon (PNG/JPG)</label>
                <input type="file" accept="image/png, image/jpeg" onChange={e => e.target.files && setStampImage(e.target.files[0])}
                  style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.8rem' }} />
                {stampImage && <p style={{ fontSize: '0.8rem', color: TOOL_COLOR, fontWeight: 'bold' }}>Image sélectionnée : {stampImage.name}</p>}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Opacité: {Math.round(opacity * 100)}%</label>
              <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={e => setOpacity(+e.target.value)} style={{ accentColor: TOOL_COLOR }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Rotation: {rotation}°</label>
              <input type="range" min={-180} max={180} step={5} value={rotation} onChange={e => setRotation(+e.target.value)} style={{ accentColor: TOOL_COLOR }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Position</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {positions.map(p => (
                  <button key={p.value} onClick={() => setPosition(p.value as StampOptions['position'])}
                    style={{ padding: '0.5rem', borderRadius: 6, border: position === p.value ? `2px solid ${TOOL_COLOR}` : '1px solid var(--glass-border)', background: position === p.value ? `${TOOL_COLOR}22` : 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 10 }}>{error}</div>}
            <button className="btn btn-primary btn-xl" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 10, fontSize: '1.2rem', padding: '1rem', marginTop: '0.5rem', backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }} onClick={handleSubmit}>
              Appliquer le tampon <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
