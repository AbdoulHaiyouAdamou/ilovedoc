'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Globe, AlertCircle, ChevronRight } from 'lucide-react';
import { getToolBySlug } from '@/config/tools';
import Script from 'next/script';
import AdUnit from '@/components/common/AdUnit';
import { ToolLayout } from '@/components/tools';

const tool = getToolBySlug('html-to-pdf')!;

export default function HtmlToPdfPage() {
  const tTools = useTranslations('Tools');

  const [htmlContent, setHtmlContent] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [inputMode, setInputMode] = useState<'url' | 'code'>('code');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [format, setFormat] = useState<'a4' | 'letter' | 'legal'>('a4');

  const contentRef = useRef<HTMLDivElement>(null);

  const fetchUrl = async () => {
    if (!url) return;
    try {
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
        const base = document.createElement('base');
        base.href = url || window.location.origin;
        element.prepend(base);

        const opt = {
          margin: 10,
          filename: 'ilovedoc_html.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: 'mm', format: format, orientation: orientation }
        };

        // @ts-ignore
        const worker = window.html2pdf().set(opt).from(element);
        const pdfBlob = await worker.outputPdf('blob');

        const blobUrl = URL.createObjectURL(pdfBlob);
        setResultUrl(blobUrl);
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
    setResultUrl(null);
  };

  const phase = !htmlContent ? 'select' : isProcessing ? 'processing' : isDone ? 'result' : 'workspace';

  const customSelectDropzone = (
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
  );

  const workspacePreview = (
    <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', background: '#e2e8f0', flex: 1 }}>
       <div style={{ flex: 1, width: '100%', maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '4px', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '20px' }}>
         <div dangerouslySetInnerHTML={{ __html: htmlContent }} ref={contentRef} style={{ all: 'initial', fontFamily: 'sans-serif' }}></div>
       </div>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Convertir en PDF <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      <ToolLayout
        slug="html-to-pdf"
        phase={phase}
        file={null}
        isProcessing={isProcessing}
        progress={0}
        resultUrl={resultUrl}
        error={error}
        onReset={reset}
        onDrop={() => {}}
        accept={{}}
        maxFiles={1}
        customSelectDropzone={customSelectDropzone}
        workspacePreview={workspacePreview}
        workspaceSidebar={workspaceSidebar}
        processingLabel="Génération du PDF..."
        successMessage="🎉 Votre PDF est prêt !"
        successSubtitle="Le code HTML a été converti avec succès."
        downloadName="ilovedoc_html.pdf"
        actionLabel="Convertir en PDF"
        onAction={handleConvert}
        seoSection={
          <div className="seo-content container-narrow">
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Convertir HTML en PDF facilement</h2>
            <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>
              Transformez n'importe quel code HTML ou URL de page web en document PDF de haute qualité.
              Personnalisez l'orientation (portrait ou paysage) et la taille de la page (A4, Lettre, Légal).
              Tout le traitement est effectué directement dans votre navigateur web, garantissant la confidentialité
              de vos données.
            </p>
          </div>
        }
      />
    </>
  );
}
