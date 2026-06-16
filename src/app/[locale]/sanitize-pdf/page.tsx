'use client';
import SEO from '@/components/common/SEO';
import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import AdUnit from '@/components/common/AdUnit';
import Footer from '@/components/common/Footer';
import { sanitizePdf, SanitizeOptions } from '@/features/pdf/sanitize';
import { ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';

const TOOL_COLOR = '#10b981';
const GRADIENT = 'linear-gradient(to right, #10b981, #059669)';

export default function SanitizePdfPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<SanitizeOptions>({ removeJavaScript: true, removeLinks: true, removeMetadata: true, removeAttachments: true });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) { setFile(acceptedFiles[0]); setResultUrl(null); setError(null); }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const toggle = (key: keyof SanitizeOptions) => setOptions(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true); setError(null); setProgress(0);
    try {
      const blob = await sanitizePdf(file, options, setProgress);
      const url = URL.createObjectURL(blob); setResultUrl(url);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.pdf$/i, '_sanitized.pdf');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setIsProcessing(false); }
  };

  const sanitizeItems: { key: keyof SanitizeOptions; label: string; desc: string }[] = [
    { key: 'removeJavaScript', label: 'Supprimer le JavaScript', desc: 'Élimine les scripts potentiellement malveillants.' },
    { key: 'removeLinks', label: 'Supprimer les liens', desc: 'Retire les hyperliens et URLs cliquables.' },
    { key: 'removeMetadata', label: 'Supprimer les métadonnées', desc: 'Efface titre, auteur, sujet et données XMP.' },
    { key: 'removeAttachments', label: 'Supprimer les pièces jointes', desc: 'Retire les fichiers intégrés.' },
  ];

  if (!file) {
    return (<>
      <SEO slug="sanitize-pdf" />
      <Header />
      <main className="tool-page-layout" style={{ padding: 0 }}>
        <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
              {tTools('sanitize-pdf.name')}
            </h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: 800, textAlign: 'center', lineHeight: 1.5 }}>
              {tTools('sanitize-pdf.description')}
            </p>
          <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <input {...getInputProps()} />
            <button style={{ backgroundColor: TOOL_COLOR, color: 'white', border: 'none', padding: '1.8rem 4rem', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: 12, boxShadow: `0 10px 25px ${TOOL_COLOR}66`, cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              {tCommon('select_file')}
            </button>
            <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>{tCommon('or_drop')}</p>
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
          <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}><h2>Nettoyage en cours...</h2>
            <div className="progress-container" style={{ marginTop: '2rem' }}><div className="progress"><div className="progress-bar" style={{ width: `${progress}%`, backgroundImage: GRADIENT }} /></div>
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p></div></div>
        ) : (
          <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
            <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><CheckCircle size={64} color={TOOL_COLOR} /></div>
            <h2>🎉 PDF nettoyé !</h2>
            <p style={{ marginBottom: '2rem' }}>Votre document est désormais sécurisé.</p>
            <a href={resultUrl!} download className="btn btn-primary btn-xl" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }}>Télécharger le PDF</a>
            <div style={{ marginTop: '2rem' }}><button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); }}>Recommencer</button></div>
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
      <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
        <div className="pdf-page-card" style={{ width: 300, height: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
          <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>{file.name}</div>
          <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <ShieldCheck size={80} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
          </div>
        </div>
      </div>
      <div className="workspace-sidebar">
        <div className="workspace-sidebar-header">
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: TOOL_COLOR }}><ShieldCheck size={24} /> Nettoyage</h2>
        </div>
        <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {sanitizeItems.map(item => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '1rem', borderRadius: 12, cursor: 'pointer', border: options[item.key] ? `2px solid ${TOOL_COLOR}` : '2px solid var(--glass-border)', background: options[item.key] ? `${TOOL_COLOR}10` : 'transparent', transition: 'all 0.2s' }}>
              <input type="checkbox" checked={options[item.key]} onChange={() => toggle(item.key)} style={{ accentColor: TOOL_COLOR, marginTop: 3 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="workspace-sidebar-footer">
          {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 10 }}>{error}</div>}
          <button className="btn btn-primary btn-xl" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 10, fontSize: '1.2rem', padding: '1rem', marginTop: '0.5rem', backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }} onClick={handleSubmit}>
            Nettoyer le PDF <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  </>);
}
