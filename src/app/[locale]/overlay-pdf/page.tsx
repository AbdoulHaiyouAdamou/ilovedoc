'use client';
import SEO from '@/components/common/SEO';
import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import AdUnit from '@/components/common/AdUnit';
import Footer from '@/components/common/Footer';
import { overlayPdfs, OverlayMode } from '@/features/pdf/overlay';
import { Copy, CheckCircle, ArrowRight } from 'lucide-react';

const TOOL_COLOR = '#a855f7';
const GRADIENT = 'linear-gradient(to right, #a855f7, #9333ea)';

export default function OverlayPdfPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [mode, setMode] = useState<OverlayMode>('above');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDropBase = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) { setBaseFile(acceptedFiles[0]); setResultUrl(null); setError(null); }
  }, []);
  const onDropOverlay = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) { setOverlayFile(acceptedFiles[0]); setResultUrl(null); setError(null); }
  }, []);
  const dzBase = useDropzone({ onDrop: onDropBase, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });
  const dzOverlay = useDropzone({ onDrop: onDropOverlay, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const handleSubmit = async () => {
    if (!baseFile || !overlayFile) return;
    setIsProcessing(true); setError(null); setProgress(0);
    try {
      const blob = await overlayPdfs(baseFile, overlayFile, mode, setProgress);
      const url = URL.createObjectURL(blob); setResultUrl(url);
      const a = document.createElement('a'); a.href = url; a.download = baseFile.name.replace(/\.pdf$/i, '_overlay.pdf');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setIsProcessing(false); }
  };

  if (!baseFile || !overlayFile) {
    return (<>
      <SEO slug="overlay-pdf" />
      <Header />
      <main className="tool-page-layout" style={{ padding: 0 }}>
        <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
              {tTools('overlay-pdf.name')}
            </h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: 800, textAlign: 'center', lineHeight: 1.5 }}>
              {tTools('overlay-pdf.description')}
            </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div {...dzBase.getRootProps()} style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', borderRadius: 16, border: `2px dashed ${baseFile ? TOOL_COLOR : 'var(--glass-border)'}`, minWidth: 250, background: baseFile ? `${TOOL_COLOR}10` : 'transparent' }}>
              <input {...dzBase.getInputProps()} />
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: TOOL_COLOR }}>📄 PDF de base</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>{baseFile ? baseFile.name : 'Déposez le PDF principal'}</p>
            </div>
            <div {...dzOverlay.getRootProps()} style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', borderRadius: 16, border: `2px dashed ${overlayFile ? TOOL_COLOR : 'var(--glass-border)'}`, minWidth: 250, background: overlayFile ? `${TOOL_COLOR}10` : 'transparent' }}>
              <input {...dzOverlay.getInputProps()} />
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: TOOL_COLOR }}>📋 PDF à superposer</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>{overlayFile ? overlayFile.name : 'Déposez le PDF overlay'}</p>
            </div>
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
        </main><Footer /></>);
  }

  if (isProcessing || resultUrl) {
    return (<><Header />
      <main className="tool-page-layout"><div className="container" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        {isProcessing ? (
          <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}><h2>Superposition en cours...</h2>
            <div className="progress-container" style={{ marginTop: '2rem' }}><div className="progress"><div className="progress-bar" style={{ width: `${progress}%`, backgroundImage: GRADIENT }} /></div>
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p></div></div>
        ) : (
          <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
            <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><CheckCircle size={64} color={TOOL_COLOR} /></div>
            <h2>🎉 PDF superposés !</h2>
            <p style={{ marginBottom: '2rem' }}>Votre document est prêt.</p>
            <a href={resultUrl!} download className="btn btn-primary btn-xl" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }}>Télécharger le PDF</a>
            <div style={{ marginTop: '2rem' }}><button className="btn btn-outline" onClick={() => { setBaseFile(null); setOverlayFile(null); setResultUrl(null); }}>Recommencer</button></div>
          </div>
        )}
      </div></main><Footer /></>);
  }

  return (<><Header />
    <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
      <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ position: 'relative', width: 250, height: 350 }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', borderRadius: 12, border: '2px solid var(--glass-border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.85rem' }}>PDF de base</div>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '80%', height: '80%', borderRadius: 12, border: `2px solid ${TOOL_COLOR}`, background: `${TOOL_COLOR}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TOOL_COLOR, fontSize: '0.85rem', fontWeight: 600 }}>Overlay</div>
        </div>
      </div>
      <div className="workspace-sidebar">
        <div className="workspace-sidebar-header">
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: TOOL_COLOR }}><Copy size={24} /> Superposition</h2>
        </div>
        <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <strong>Base :</strong> {baseFile.name}<br />
            <strong>Overlay :</strong> {overlayFile.name}
          </p>
          {(['above', 'below'] as const).map(m => (
            <label key={m} style={{ display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: 12, cursor: 'pointer', border: mode === m ? `2px solid ${TOOL_COLOR}` : '2px solid var(--glass-border)', background: mode === m ? `${TOOL_COLOR}15` : 'transparent', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: mode === m ? TOOL_COLOR : 'var(--text-color)' }}>{m === 'above' ? 'Au-dessus (premier plan)' : 'En-dessous (arrière-plan)'}</span>
                <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} style={{ accentColor: TOOL_COLOR }} />
              </div>
            </label>
          ))}
        </div>
        <div className="workspace-sidebar-footer">
          {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 10 }}>{error}</div>}
          <button className="btn btn-primary btn-xl" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 10, fontSize: '1.2rem', padding: '1rem', marginTop: '0.5rem', backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }} onClick={handleSubmit}>
            Superposer <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  </>);
}
