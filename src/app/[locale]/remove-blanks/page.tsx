'use client';
import SEO from '@/components/common/SEO';
import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import AdUnit from '@/components/common/AdUnit';
import Footer from '@/components/common/Footer';
import { removeBlankPages } from '@/features/pdf/removeBlanks';
import { FileX, CheckCircle, ArrowRight } from 'lucide-react';

const TOOL_COLOR = '#f97316';
const GRADIENT = 'linear-gradient(to right, #f97316, #ea580c)';

export default function RemoveBlanksPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultInfo, setResultInfo] = useState<{ removedCount: number; totalPages: number } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) { setFile(acceptedFiles[0]); setResultUrl(null); setError(null); setResultInfo(null); }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true); setError(null); setProgress(0);
    try {
      const result = await removeBlankPages(file, 200, setProgress);
      setResultInfo({ removedCount: result.removedCount, totalPages: result.totalPages });
      const url = URL.createObjectURL(result.blob); setResultUrl(url);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.pdf$/i, '_clean.pdf');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setIsProcessing(false); }
  };

  if (!file) {
    return (<>
      <SEO slug="remove-blanks" />
      <Header />
      <main className="tool-page-layout" style={{ padding: 0 }}>
        <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
              {tTools('remove-blanks.name')}
            </h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: 800, textAlign: 'center', lineHeight: 1.5 }}>
              {tTools('remove-blanks.description')}
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
          <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}><h2>Analyse des pages...</h2>
            <div className="progress-container" style={{ marginTop: '2rem' }}><div className="progress"><div className="progress-bar" style={{ width: `${progress}%`, backgroundImage: GRADIENT }} /></div>
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p></div></div>
        ) : (
          <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
            <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><CheckCircle size={64} color={TOOL_COLOR} /></div>
            <h2>🎉 Nettoyage terminé !</h2>
            {resultInfo && (
              <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                {resultInfo.removedCount > 0
                  ? `${resultInfo.removedCount} page(s) blanche(s) supprimée(s) sur ${resultInfo.totalPages} pages.`
                  : 'Aucune page blanche détectée — votre PDF est déjà propre !'}
              </p>
            )}
            <a href={resultUrl!} download className="btn btn-primary btn-xl" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }}>Télécharger le PDF</a>
            <div style={{ marginTop: '2rem' }}><button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); setResultInfo(null); }}>Recommencer</button></div>
          </div>
        )}
      </div></main><Footer /></>);
  }

  return (<><Header />
    <main className="tool-page-layout"><div className="container" style={{ maxWidth: 800, margin: '3rem auto', textAlign: 'center' }}>
      <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
        <FileX size={80} color={TOOL_COLOR} style={{ opacity: 0.5, marginBottom: '1.5rem' }} />
        <h2>Fichier : {file.name}</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem', marginBottom: '2rem' }}>
          L&apos;outil va analyser chaque page et supprimer automatiquement celles qui sont vides ou quasi-vides.
        </p>
        {error && <div className="text-danger" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
        <button className="btn btn-primary btn-xl" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT, display: 'inline-flex', gap: 10 }} onClick={handleSubmit}>
          Supprimer les pages blanches <ArrowRight size={24} />
        </button>
      </div>
    </div></main><Footer /></>);
}
