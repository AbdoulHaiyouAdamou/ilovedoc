'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { unlockPDF } from '@/features/pdf/unlock';
import { getPdfPageCount } from '@/features/pdf/split';
import { Lock, Unlock, ArrowRight, Settings, CheckCircle, File, KeyRound } from 'lucide-react';

export default function UnlockPdfPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [needsPassword, setNeedsPassword] = useState<boolean>(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      setPassword('');
      setNeedsPassword(false);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
      } catch (err) {
        // En cas d'erreur (ex: chiffrement lourd), on garde 1 page par défaut
        setTotalPages(1);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const handleUnlock = async () => {
    if (!file) return;

    setIsProcessing(true); 
    setError(null); 
    setProgress(0);
    try {
      const modifiedBytes = await unlockPDF(file, {
        password: password || undefined,
        onProgress: (p) => setProgress(p)
      });
      
      const blob = new Blob([modifiedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf','')}_unlocked.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err: any) {
      if (err.message === 'PASSWORD_REQUIRED') {
        setNeedsPassword(true);
        setError("Ce fichier est protégé. Veuillez saisir le mot de passe pour le déverrouiller.");
      } else {
        setError(err.message || 'Une erreur est survenue lors du déverrouillage.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <>
        <SEO slug="unlock-pdf" />
      <Header />
        <main className="tool-page-layout" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            minHeight: 'calc(100vh - 70px)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              {tTools('unlock-pdf.name')}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tTools('unlock-pdf.description')}
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#16a34a', 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(22, 163, 74, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {tCommon('select_file')}
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>{tCommon('or_drop')}</p>
            </div>
          </div>

          {/* Below the fold: SEO and Ads */}
          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            
            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment déverrouiller un PDF</h2>
              <ol className="steps-list">
                <li>Sélectionnez votre document PDF sécurisé.</li>
                <li>Si votre fichier est protégé par un mot de passe utilisateur, saisissez-le.</li>
                <li>Cliquez sur le bouton "Déverrouiller PDF".</li>
                <li>Téléchargez votre fichier PDF sans mot de passe ni restrictions.</li>
              </ol>
            </section>
            
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
          <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
             {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>Déverrouillage en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(to right, #16a34a, #22c55e)' }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle size={64} color="#16a34a" />
                  </div>
                  <h2>🎉 Le PDF a été déverrouillé !</h2>
                  <p style={{marginBottom: '2rem'}}>Votre document n'a plus de mot de passe ni de restrictions.</p>
                  <a href={resultUrl!} download={`${file.name.replace('.pdf','')}_unlocked.pdf`} className="btn btn-primary btn-xl" style={{backgroundColor: '#16a34a', borderColor: '#16a34a', backgroundImage: 'linear-gradient(to right, #16a34a, #22c55e)'}}>
                    Télécharger le PDF
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); setNeedsPassword(false); setPassword(''); }}>Traiter un autre fichier</button>
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
        <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignContent: 'start', justifyContent: 'center' }}>
          <div className="pdf-page-card" style={{
            width: '200px',
            height: '280px',
            border: 'none',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="pdf-page-header" style={{ backgroundColor: '#16a34a' }}>
              Fichier Protégé
            </div>
            <div className="pdf-page-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
               <Lock size={64} color="#16a34a" opacity={0.8} />
            </div>
            <div className="pdf-page-number" style={{ borderTop: '1px solid var(--glass-border)', padding: '10px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
              {file.name}
            </div>
          </div>
        </div>

        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#16a34a'}}>
              <Unlock size={24} /> Déverrouiller
            </h2>
          </div>
          <div className="workspace-sidebar-content">
            <div style={{
              padding: '1.5rem', 
              background: 'rgba(22, 163, 74, 0.1)', 
              border: '2px dashed #16a34a', 
              borderRadius: '12px', 
              textAlign: 'center'
            }}>
              <h3 style={{color: '#16a34a', marginBottom: '10px', fontSize: '1.2rem'}}>Prêt à déverrouiller</h3>
              <p style={{fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: needsPassword ? '1rem' : '0'}}>
                Cliquez sur le bouton ci-dessous pour retirer la protection du document.
              </p>

              {needsPassword && (
                <div style={{ marginTop: '1rem', textAlign: 'left' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    Mot de passe du document :
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez le mot de passe..."
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 35px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        backgroundColor: 'var(--bg-color)',
                        color: 'var(--color-text-primary)'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUnlock();
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem'}}>{error}</div>}

            <button 
              className="btn btn-primary btn-xl" 
              style={{
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px', 
                fontSize: '1.2rem', 
                padding: '1rem', 
                backgroundColor: '#16a34a',
                borderColor: '#16a34a',
                backgroundImage: 'linear-gradient(to right, #16a34a, #22c55e)'
              }} 
              onClick={handleUnlock}
            >
              Déverrouiller PDF <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
