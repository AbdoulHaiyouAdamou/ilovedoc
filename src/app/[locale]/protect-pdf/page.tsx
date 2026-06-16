'use client';
import SEO from '@/components/common/SEO';

import React, { useState , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import { Lock, AlertCircle, Download, CheckCircle2, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { getToolBySlug } from '@/config/tools';
import AdUnit from '@/components/common/AdUnit';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const tool = getToolBySlug('protect-pdf')!;

export default function ProtectPdfPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setIsDone(false);
      setDownloadUrl(null);
      setPassword('');
      setConfirmPassword('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleProtect = async () => {
    if (!file) return;
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Chiffrement réel du PDF (128-bit RC4) 100% côté client !
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const encryptedBytes = await encryptPDF(fileBytes, password, password);
      
      const blob = new Blob([encryptedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsDone(true);
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la protection du PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setIsDone(false);
    setDownloadUrl(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <SEO slug="protect-pdf" />
      <Header />
      
      <main className="tool-page-layout" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* -- STATE 1: DROPZONE -- */}
        {!file && !isProcessing && !isDone && (
          <div style={{ minHeight: 'calc(100vh - 70px)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              {tool.name}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tool.description}
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: tool.color[0], 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: `0 10px 25px ${tool.color[0]}66`,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Sélectionner le fichier PDF
              </button>
            </div>
          </div>
        )}

        {/* -- STATE 2: WORKSPACE -- */}
        {file && !isProcessing && !isDone && (
          <div className="workspace">
            <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
               
               <div className="pdf-page-card" style={{ width: '250px', height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: tool.color[0], width: '100%', padding: '15px', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    Document PDF
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    <Lock size={48} style={{ opacity: 0.2, position: 'absolute' }} />
                    <span style={{ zIndex: 1, wordBreak: 'break-all' }}>{file.name}</span>
                  </div>
               </div>

            </div>

            <div className="workspace-sidebar" style={{ width: '380px' }}>
              <div className="workspace-sidebar-header">
                <h3 className="workspace-sidebar-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  Protéger PDF
                </h3>
              </div>
              
              <div className="workspace-sidebar-content" style={{ padding: '2rem 1.5rem', flex: 1, overflowY: 'auto' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Définissez un mot de passe pour protéger votre fichier PDF
                </p>

                <div style={{ marginBottom: 16, position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 14 }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Saisir le mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: tool.color[0] }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div style={{ marginBottom: 24, position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 14 }} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 40px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                  />
                  <button 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: tool.color[0] }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {error && (
                  <div className="text-danger" style={{ marginBottom: '1rem', fontWeight: 'bold', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
                    <AlertCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
                    {error}
                  </div>
                )}
              </div>

              <div className="workspace-sidebar-footer" style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={handleProtect}
                  disabled={!password || !confirmPassword}
                  className="btn btn-lg workspace-btn-main"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color[0]}, ${tool.color[1]})`,
                    color: 'white',
                    width: '100%',
                    justifyContent: 'center',
                    opacity: (!password || !confirmPassword) ? 0.5 : 1
                  }}
                >
                  Protéger PDF <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -- STATE 3 & 4: PROCESSING / DONE -- */}
        {(isProcessing || isDone) && (
          <div className="tool-page-layout" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center', width: '100%'}}>
              {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Chiffrement en cours...</h2>
                  <p>Protection de votre document...</p>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="loader" style={{ margin: '0 auto', borderTopColor: tool.color[0] }}></div>
                  </div>
                </div>
              ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle2 size={64} color={tool.color[0]} />
                  </div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>PDF protégé avec succès !</h2>
                  <p style={{marginBottom: '2rem'}}>Votre fichier est maintenant sécurisé par un mot de passe.</p>
                  <a 
                    href={downloadUrl!} 
                    download={`${file?.name.replace('.pdf', '')}_protege.pdf`} 
                    className="btn btn-primary btn-xl gradient-bg"
                    style={{ background: `linear-gradient(135deg, ${tool.color[0]}, ${tool.color[1]})`, border: 'none', color: 'white' }}
                  >
                    <Download size={24} style={{ marginRight: 8 }} /> Télécharger le PDF protégé
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" style={{ borderColor: tool.color[0], color: tool.color[0] }} onClick={reset}>
                      Protéger un autre PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="seo-content container-narrow">
          <AdUnit slot="ad-protect-pdf-1" />
          <h2>Protéger un PDF avec un mot de passe</h2>
          <p>
            Sécurisez vos documents PDF en ajoutant un mot de passe fort. 
            Empêchez l'accès non autorisé à vos fichiers sensibles. Le traitement est 100% sécurisé et 
            vos fichiers ne quittent jamais votre navigateur.
          </p>
          <AdUnit slot="ad-protect-pdf-2" />
        </div>
        </main>
      <Footer />
    </>
  );
}
