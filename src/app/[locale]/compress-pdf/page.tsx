'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { compressPdf } from '@/features/pdf/compress';
import { Minimize, CheckCircle, ArrowRight, Settings, FileText } from 'lucide-react';

export default function CompressPdfPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'medium' | 'low'>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResultUrl(null);
      setError(null);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);
      
      const result = await compressPdf(file, { level: compressionLevel });
      clearInterval(progressInterval);
      setProgress(100);
      
      const url = URL.createObjectURL(result);
      setResultUrl(url);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = result.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la compression.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <>
        <SEO slug="compress-pdf" />
      <Header />
        <main className="tool-page-layout" style={{ padding: 0 }}>
          {/* Full-screen initial view mimicking iLovePDF (No scrollbar on load) */}
          <div style={{ 
            minHeight: 'calc(100vh - 70px)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              Compresser PDF
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Réduisez la taille de vos fichiers PDF tout en conservant une qualité optimale.
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#10b981', 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Sélectionner le fichier PDF
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>ou déposez le PDF ici</p>
            </div>
          </div>

          {/* Below the fold: SEO and Ads (Preserved but hidden on initial load) */}
          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            
            <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
               <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi utiliser notre compresseur ?</h2>
               <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                 Notre outil de compression PDF vous permet de réduire considérablement la taille de vos documents lourds sans altérer la qualité visuelle. Que ce soit pour envoyer un dossier par e-mail, respecter les limites de téléchargement d'un formulaire administratif, ou simplement gagner de l'espace de stockage, notre algorithme intelligent préserve l'essentiel de vos fichiers tout en supprimant les données superflues. 100% hors-ligne pour garantir la confidentialité totale de vos informations.
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
          <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
             {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>Compression en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(to right, #10b981, #34d399)' }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle size={64} color="#10b981" />
                  </div>
                  <h2>🎉 Le PDF a été compressé !</h2>
                  <p style={{marginBottom: '2rem'}}>Votre document optimisé est prêt.</p>
                  <a href={resultUrl!} download className="btn btn-primary btn-xl" style={{backgroundColor: '#10b981', borderColor: '#10b981', backgroundImage: 'linear-gradient(to right, #10b981, #34d399)'}}>
                    Télécharger le PDF
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); }}>Compresser un autre fichier</button>
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
           <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
              <div className="pdf-page-header" style={{backgroundColor: '#10b981'}}>
                {file.name}
              </div>
              <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                 <FileText size={80} color="#10b981" style={{ opacity: 0.5 }} />
              </div>
           </div>
           
           <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
        </div>

        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#10b981'}}>
              <Minimize size={24} /> Compresser
            </h2>
          </div>
          <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             
             <label style={{
                display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '12px', cursor: 'pointer',
                border: compressionLevel === 'extreme' ? '2px solid #10b981' : '2px solid var(--glass-border)',
                background: compressionLevel === 'extreme' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                transition: 'all 0.2s'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: compressionLevel === 'extreme' ? '#10b981' : 'var(--text-color)' }}>Compression Extrême</span>
                  <input type="radio" name="level" checked={compressionLevel === 'extreme'} onChange={() => setCompressionLevel('extreme')} style={{ accentColor: '#10b981' }} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Moins bonne qualité, compression maximale.</span>
             </label>

             <label style={{
                display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '12px', cursor: 'pointer',
                border: compressionLevel === 'medium' ? '2px solid #10b981' : '2px solid var(--glass-border)',
                background: compressionLevel === 'medium' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                transition: 'all 0.2s'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: compressionLevel === 'medium' ? '#10b981' : 'var(--text-color)' }}>Compression Recommandée</span>
                  <input type="radio" name="level" checked={compressionLevel === 'medium'} onChange={() => setCompressionLevel('medium')} style={{ accentColor: '#10b981' }} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bonne qualité, bonne compression.</span>
             </label>

             <label style={{
                display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '12px', cursor: 'pointer',
                border: compressionLevel === 'low' ? '2px solid #10b981' : '2px solid var(--glass-border)',
                background: compressionLevel === 'low' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                transition: 'all 0.2s'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: compressionLevel === 'low' ? '#10b981' : 'var(--text-color)' }}>Faible Compression</span>
                  <input type="radio" name="level" checked={compressionLevel === 'low'} onChange={() => setCompressionLevel('low')} style={{ accentColor: '#10b981' }} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Haute qualité, moins de compression.</span>
             </label>

             <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
               <AdUnit slot="ad-workspace-sidebar" format="rectangle" />
             </div>
          </div>
          
          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px'}}>{error}</div>}

            <button 
              className="btn btn-primary btn-xl" 
              style={{
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px', 
                fontSize: '1.2rem', 
                padding: '1rem', 
                marginTop: '0.5rem',
                backgroundColor: '#10b981',
                borderColor: '#10b981',
                backgroundImage: 'linear-gradient(to right, #10b981, #34d399)',
              }} 
              onClick={handleCompress}
            >
              Compresser le PDF <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
