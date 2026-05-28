'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { signPDF } from '@/features/pdf/sign';
import { getPdfPageCount } from '@/features/pdf/split';
import { PenTool, ArrowRight, Trash2, ChevronDown, Plus } from 'lucide-react';

export default function SignPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [signatureFont, setSignatureFont] = useState('Brush Script MT, cursive');
  const [signatureColor, setSignatureColor] = useState('#000000');
  
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [signPage, setSignPage] = useState(1);
  const [signPosition, setSignPosition] = useState<'tr' | 'tl' | 'br' | 'bl' | 'cc'>('br');
  const [signWidth, setSignWidth] = useState(150);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
        setSignPage(count); // Default to last page
      } catch (err) {
        setError("Impossible de lire ce PDF.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const handleCreateSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.font = `40px ${signatureFont}`;
    ctx.fillStyle = signatureColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    if (signatureName.trim()) {
      ctx.fillText(signatureName, canvas.width / 2, canvas.height / 2);
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureBase64(dataUrl);
    }
    
    setIsModalOpen(false);
  };

  const handleSign = async () => {
    if (!file || !signatureBase64) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // Calculate approximate position. 
      // Typical A4 is 595 x 842 points.
      // Top-Left: x: 50, y: 750
      // Bottom-Right: x: 400, y: 50
      
      let x = 50, y = 50;
      const w = signWidth;
      const h = signWidth / 3; // Approx aspect ratio
      
      switch (signPosition) {
        case 'tl': x = 50; y = 750; break;
        case 'tr': x = 400; y = 750; break;
        case 'bl': x = 50; y = 100; break;
        case 'br': x = 400; y = 100; break;
        case 'cc': x = 220; y = 400; break;
      }

      const blob = new Blob([await signPDF(file, {
        signatureImageBase64: signatureBase64,
        position: { x, y, page: signPage - 1, width: w, height: h },
        onProgress: setProgress,
      }) as any], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_signed.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la signature.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <>
        <SEO slug="sign-pdf" />
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
              Signer PDF
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Signez vos documents PDF électroniquement avec une signature personnalisée.
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#4f46e5', 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
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

          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            
            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment signer un PDF</h2>
              <ol className="steps-list">
                <li>Sélectionnez votre fichier PDF ou glissez-déposez-le dans la zone ci-dessus.</li>
                <li>Créez votre signature personnalisée (texte, police, couleur).</li>
                <li>Choisissez la page et la position de votre signature.</li>
                <li>Cliquez sur "Signer" pour appliquer votre signature et télécharger le document.</li>
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
                  <h2>Signature en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(to right, #4f46e5, #6366f1)' }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>🎉 Le document a été signé !</h2>
                  <p style={{marginBottom: '2rem'}}>Votre document est prêt.</p>
                  <a href={resultUrl!} download className="btn btn-primary btn-xl gradient-bg" style={{backgroundColor: '#4f46e5', borderColor: '#4f46e5', backgroundImage: 'linear-gradient(to right, #4f46e5, #6366f1)'}}>
                    Télécharger le PDF
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); }}>Signer un autre fichier</button>
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
      
      <div className="workspace" style={{ background: '#f5f5f5', position: 'relative' }}>
        
        {/* Modale Création de Signature */}
        {isModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Créer une signature</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Texte de la signature</label>
                <input 
                  type="text" 
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Tapez votre nom..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1.1rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Police</label>
                  <select 
                    value={signatureFont}
                    onChange={(e) => setSignatureFont(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc' }}
                  >
                    <option value="Brush Script MT, cursive">Brush Script</option>
                    <option value="Caveat, cursive">Caveat</option>
                    <option value="Dancing Script, cursive">Dancing Script</option>
                    <option value="Georgia, serif">Georgia</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Couleur</label>
                  <select 
                    value={signatureColor}
                    onChange={(e) => setSignatureColor(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc' }}
                  >
                    <option value="#000000">Noir</option>
                    <option value="#1d4ed8">Bleu</option>
                    <option value="#b91c1c">Rouge</option>
                  </select>
                </div>
              </div>

              <div style={{ 
                border: '1px dashed #ccc', height: '150px', borderRadius: '8px', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb',
                position: 'relative', overflow: 'hidden'
              }}>
                {signatureName ? (
                   <span style={{ fontFamily: signatureFont, color: signatureColor, fontSize: '2.5rem' }}>
                     {signatureName}
                   </span>
                ) : (
                  <span style={{ color: '#aaa' }}>Aperçu</span>
                )}
                {/* Hidden canvas to generate base64 */}
                <canvas ref={canvasRef} width={400} height={150} style={{ display: 'none' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.8rem 1.5rem', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Annuler
                </button>
                <button 
                  onClick={handleCreateSignature}
                  disabled={!signatureName.trim()}
                  style={{ padding: '0.8rem 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', opacity: !signatureName.trim() ? 0.5 : 1 }}
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="workspace-preview" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2rem', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <div style={{ 
              background: '#fff', border: '1px solid #ddd', borderRadius: '4px', 
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
               <span style={{ fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
            </div>
            <button style={{ 
              background: '#fff', border: '1px solid #ddd', borderRadius: '4px', 
              padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} onClick={() => setFile(null)}>
              <Trash2 size={18} color="#666" />
            </button>
          </div>

          {/* Document Preview */}
          <div style={{ 
            width: '350px', height: '495px', background: '#fff', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative',
            display: 'flex', flexDirection: 'column', padding: '1rem',
            marginBottom: '2rem'
          }}>
            {/* Fake PDF Content */}
            <div style={{ width: '100%', height: '30px', background: '#e0f2fe', marginBottom: '1rem' }} />
            <div style={{ width: '80%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
            <div style={{ width: '90%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
            <div style={{ width: '70%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
            <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '2rem 0' }} />
            <div style={{ width: '85%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
            <div style={{ width: '60%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
            
            {/* Position Indicator */}
            {signatureBase64 && (
              <div style={{
                position: 'absolute',
                padding: '4px', border: '1px dashed #4f46e5',
                top: signPosition.startsWith('t') ? '20px' : signPosition.startsWith('b') ? 'calc(100% - 60px)' : 'calc(50% - 20px)',
                left: signPosition.endsWith('l') ? '20px' : signPosition.endsWith('r') ? 'calc(100% - 100px)' : 'calc(50% - 50px)',
                width: '80px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.8)'
              }}>
                 <img src={signatureBase64} alt="Sig" style={{ maxWidth: '100%', maxHeight: '100%' }} />
              </div>
            )}
          </div>
          
        </div>

        {/* Sidebar */}
        <div className="workspace-sidebar" style={{ width: '380px', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0, color: '#333' }}>Options de signature</h2>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Signature selection */}
            <div>
              <label style={{ display: 'block', fontSize: '1rem', fontWeight: 'bold', color: '#444', marginBottom: '12px' }}>
                Votre signature :
              </label>
              
              {signatureBase64 ? (
                <div style={{ 
                  border: '1px solid #4f46e5', borderRadius: '8px', padding: '1rem', 
                  display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', background: '#fff', padding: '1rem', borderRadius: '4px', border: '1px dashed #ccc' }}>
                     <img src={signatureBase64} alt="Votre signature" style={{ maxHeight: '80px', maxWidth: '100%' }} />
                  </div>
                  <button 
                    onClick={() => setSignatureBase64(null)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <Trash2 size={16} /> Supprimer
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={{ 
                    width: '100%', padding: '1.5rem', border: '2px dashed #cbd5e1', borderRadius: '8px',
                    background: '#f8fafc', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <PenTool size={32} />
                  Créer une signature
                </button>
              )}
            </div>

            {signatureBase64 && (
              <>
                {/* Pages */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                    Signer la page :
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="number" min="1" max={totalPages} value={signPage} 
                      onChange={(e) => setSignPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                      style={{ width: '80px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', outline: 'none' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>sur {totalPages}</span>
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                    Position :
                  </label>
                  <select 
                    value={signPosition}
                    onChange={(e) => setSignPosition(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}
                  >
                    <option value="br">Bas Droit</option>
                    <option value="bl">Bas Gauche</option>
                    <option value="tr">Haut Droit</option>
                    <option value="tl">Haut Gauche</option>
                    <option value="cc">Centre</option>
                  </select>
                </div>
                
                {/* Taille */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                    Taille :
                  </label>
                  <input 
                    type="range" min="100" max="400" value={signWidth}
                    onChange={(e) => setSignWidth(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#4f46e5' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                    <span>Petit</span>
                    <span>Grand</span>
                  </div>
                </div>
              </>
            )}
            
          </div>
          
          <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', background: '#fff' }}>
            {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px'}}>{error}</div>}
            
            <button 
              className="btn" 
              disabled={!signatureBase64}
              style={{
                width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', 
                fontSize: '1.2rem', padding: '1.2rem', fontWeight: 'bold',
                backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px',
                cursor: signatureBase64 ? 'pointer' : 'not-allowed', 
                boxShadow: signatureBase64 ? '0 4px 10px rgba(79, 70, 229, 0.3)' : 'none',
                opacity: signatureBase64 ? 1 : 0.5,
                transition: 'transform 0.1s'
              }} 
              onClick={handleSign}
              onMouseDown={(e) => signatureBase64 && (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => signatureBase64 && (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => signatureBase64 && (e.currentTarget.style.transform = 'scale(1)')}
            >
              Signer PDF <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
