'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useRef } from 'react';
import { Globe, AlertCircle, Download, CheckCircle2, ChevronRight, Settings2, FileCode } from 'lucide-react';
import { getToolBySlug } from '@/config/tools';
import AdUnit from '@/components/common/AdUnit';
import Script from 'next/script';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const tool = getToolBySlug('html-to-pdf')!;

export default function HtmlToPdfPage() {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [inputMode, setInputMode] = useState<'url' | 'code'>('code');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [format, setFormat] = useState<'a4' | 'letter' | 'legal'>('a4');

  const contentRef = useRef<HTMLDivElement>(null);

  const fetchUrl = async () => {
    if (!url) return;
    try {
      // Utilisation du proxy local Next.js pour récupérer le HTML sans erreur CORS
      const response = await fetch(`/api/fetch-html?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.contents) {
        setHtmlContent(data.contents);
        setInputMode('code');
        setError(null);
      } else {
        throw new Error(data.error || "Impossible de récupérer le contenu de cette URL.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération. Veuillez coller le code HTML directement.");
    }
  };

  const handleConvert = async () => {
    if (!htmlContent) return;
    setIsProcessing(true);
    setError(null);

    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.html2pdf) {
        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        // Fix relative links
        const base = document.createElement('base');
        base.href = url || window.location.origin;
        element.prepend(base);

        // Options
        const opt = {
          margin:       10,
          filename:     'ilovedoc_html.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, allowTaint: true },
          jsPDF:        { unit: 'mm', format: format, orientation: orientation }
        };

        // @ts-ignore
        const worker = window.html2pdf().set(opt).from(element);
        const pdfBlob = await worker.outputPdf('blob');
        
        const blobUrl = URL.createObjectURL(pdfBlob);
        setDownloadUrl(blobUrl);
        setIsDone(true);
      } else {
        throw new Error("La librairie de conversion n'est pas encore chargée.");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la conversion.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setHtmlContent('');
    setUrl('');
    setIsDone(false);
    setDownloadUrl(null);
  };

  return (
    <>
      <SEO slug="html-to-pdf" />
      <Header />
      {/* Script html2pdf.js */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      
      <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
        <main className="tool-page-layout" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* -- STATE 1: INPUT -- */}
        {!htmlContent && !isProcessing && !isDone && (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              {tool.name}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tool.description}
            </p>
            
            <div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '2rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                 <button 
                   style={{ flex: 1, padding: '1rem', background: inputMode === 'url' ? 'var(--color-surface-hover)' : 'transparent', borderBottom: inputMode === 'url' ? `2px solid ${tool.color[0]}` : 'none', fontWeight: 600, color: inputMode === 'url' ? tool.color[0] : 'var(--color-text)' }}
                   onClick={() => setInputMode('url')}
                 >
                   Depuis une URL
                 </button>
                 <button 
                   style={{ flex: 1, padding: '1rem', background: inputMode === 'code' ? 'var(--color-surface-hover)' : 'transparent', borderBottom: inputMode === 'code' ? `2px solid ${tool.color[0]}` : 'none', fontWeight: 600, color: inputMode === 'code' ? tool.color[0] : 'var(--color-text)' }}
                   onClick={() => setInputMode('code')}
                 >
                   Coller du HTML
                 </button>
              </div>

              {inputMode === 'url' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontWeight: 600 }}>Entrez l'URL du site internet</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="url" 
                      placeholder="https://fr.wikipedia.org/" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                    />
                    <button 
                      onClick={fetchUrl}
                      style={{ background: tool.color[0], color: 'white', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Ajouter
                    </button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Note : Certains sites bloquent la récupération via un navigateur en raison des règles CORS.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontWeight: 600 }}>Collez votre code HTML brut</label>
                  <textarea 
                    placeholder="<h1>Bonjour</h1><p>Ceci est un test.</p>" 
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    style={{ width: '100%', height: '150px', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem', fontFamily: 'monospace' }}
                  />
                </div>
              )}

              {error && (
                <div className="text-danger" style={{ marginTop: '1rem', fontWeight: 'bold', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
                  <AlertCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -- STATE 2: WORKSPACE -- */}
        {htmlContent && !isProcessing && !isDone && (
          <div className="workspace">
            <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', background: '#e2e8f0' }}>
               <div style={{ flex: 1, width: '100%', maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '4px', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '20px' }}>
                 <div dangerouslySetInnerHTML={{ __html: htmlContent }} ref={contentRef} style={{ all: 'initial', fontFamily: 'sans-serif' }}></div>
               </div>
            </div>

            <div className="workspace-sidebar" style={{ width: '350px' }}>
              <div className="workspace-sidebar-header">
                <h3 className="workspace-sidebar-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Globe size={20} />
                  HTML en PDF
                </h3>
              </div>
              
              <div className="workspace-sidebar-content" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Taille de la page</label>
                  <select 
                    value={format} 
                    onChange={(e) => setFormat(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--glass-bg)' }}
                  >
                    <option value="a4">A4 (210x297 mm)</option>
                    <option value="letter">Lettre (US)</option>
                    <option value="legal">Légal (US)</option>
                  </select>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Orientation</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      onClick={() => setOrientation('portrait')}
                      style={{
                        padding: '12px 8px', borderRadius: '8px',
                        border: orientation === 'portrait' ? `1px solid ${tool.color[0]}` : '1px solid var(--color-border)',
                        background: orientation === 'portrait' ? `${tool.color[0]}08` : 'var(--glass-bg)',
                        color: orientation === 'portrait' ? tool.color[0] : 'var(--color-text)',
                        fontWeight: 500, cursor: 'pointer'
                      }}
                    >
                      Portrait
                    </button>
                    <button
                      onClick={() => setOrientation('landscape')}
                      style={{
                        padding: '12px 8px', borderRadius: '8px',
                        border: orientation === 'landscape' ? `1px solid ${tool.color[0]}` : '1px solid var(--color-border)',
                        background: orientation === 'landscape' ? `${tool.color[0]}08` : 'var(--glass-bg)',
                        color: orientation === 'landscape' ? tool.color[0] : 'var(--color-text)',
                        fontWeight: 500, cursor: 'pointer'
                      }}
                    >
                      Paysage
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="text-danger" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                    <AlertCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
                    {error}
                  </div>
                )}
              </div>

              <div className="workspace-sidebar-footer" style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={handleConvert}
                  className="btn btn-lg workspace-btn-main"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color[0]}, ${tool.color[1]})`,
                    color: 'white',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  Convertir en PDF <ChevronRight size={20} />
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
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Génération du PDF...</h2>
                  <p>Rendu du HTML en cours...</p>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="loader" style={{ margin: '0 auto', borderTopColor: tool.color[0] }}></div>
                  </div>
                </div>
              ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle2 size={64} color={tool.color[0]} />
                  </div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Votre PDF est prêt !</h2>
                  <p style={{marginBottom: '2rem'}}>Le code HTML a été converti avec succès.</p>
                  <a 
                    href={downloadUrl!} 
                    download={`ilovedoc_html.pdf`} 
                    className="btn btn-primary btn-xl gradient-bg"
                    style={{ background: `linear-gradient(135deg, ${tool.color[0]}, ${tool.color[1]})`, border: 'none', color: 'white' }}
                  >
                    <Download size={24} style={{ marginRight: 8 }} /> Télécharger le PDF
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" style={{ borderColor: tool.color[0], color: tool.color[0] }} onClick={reset}>
                      Convertir un autre HTML
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="seo-content container-narrow">
          <AdUnit slot="ad-html-to-pdf-1" />
          <h2>Convertir HTML en PDF facilement</h2>
          <p>
            Transformez n'importe quel code HTML ou URL de page web en document PDF de haute qualité.
            Personnalisez l'orientation (portrait ou paysage) et la taille de la page (A4, Lettre, Légal).
            Tout le traitement est effectué directement dans votre navigateur web, garantissant la confidentialité
            de vos données.
          </p>
          <AdUnit slot="ad-html-to-pdf-2" />
        </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
