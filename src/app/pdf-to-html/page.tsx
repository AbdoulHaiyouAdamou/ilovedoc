'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import Script from 'next/script';
import { Globe, CheckCircle, ArrowRight, FileText, Info } from 'lucide-react';

export default function PdfToHtmlPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResultUrl(null);
      setResultFilename('');
      setError(null);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error("La librairie PDF.js n'est pas chargée. Veuillez rafraîchir la page.");
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      let pagesHtml = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const textContent = await page.getTextContent();

        const pageWidth = viewport.width;
        const pageHeight = viewport.height;

        let spansHtml = '';

        for (const item of textContent.items) {
          if (!item.str || item.str.trim() === '') continue;

          const tx = item.transform;
          // transform[4] = x, transform[5] = y (from bottom-left origin in PDF)
          const x = tx[4] * 1.5;
          const fontSize = Math.abs(tx[0]) * 1.5;
          // Correct baseline offset: subtract font height from top coordinate
          const y = pageHeight - tx[5] * 1.5 - (fontSize * 0.85);

          // Escape HTML special characters
          const escaped = item.str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

          spansHtml += `      <span style="position:absolute;left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;font-size:${fontSize.toFixed(1)}px;white-space:pre;font-family:inherit;line-height:1;">${escaped}</span>\n`;
        }

        pagesHtml += `    <div class="page" style="width:${pageWidth.toFixed(0)}px;height:${pageHeight.toFixed(0)}px;position:relative;overflow:hidden;margin:30px auto;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,0.1);border-radius:8px;">\n`;
        pagesHtml += `      <div class="page-number" style="position:absolute;bottom:12px;right:16px;font-size:11px;color:#a0aec0;font-family:sans-serif;user-select:none;">Page ${i}</div>\n`;
        pagesHtml += spansHtml;
        pagesHtml += `    </div>\n`;

        setProgress(Math.round((i / numPages) * 95));
      }

      const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name.replace(/\.pdf$/i, '')} - Converti par iLoveDoc</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7fafc;
      padding: 0;
      color: #2d3748;
    }
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .doc-info {
      display: flex;
      flex-direction: column;
    }
    .doc-title {
      font-weight: 700;
      font-size: 15px;
      color: #1a202c;
    }
    .doc-meta {
      font-size: 12px;
      color: #718096;
      margin-top: 2px;
    }
    .print-btn {
      background-color: #f97316;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .print-btn:hover {
      background-color: #ea580c;
    }
    .pages-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .page {
      page-break-after: always;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .top-bar { display: none; }
      .pages-container { padding: 0; }
      .page { box-shadow: none; border: none; margin: 0 !important; border-radius: 0 !important; page-break-after: always; }
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="doc-info">
      <span class="doc-title">${file.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
      <span class="doc-meta">Converti en HTML par iLoveDoc &bull; ${numPages} page${numPages > 1 ? 's' : ''}</span>
    </div>
    <button class="print-btn" onclick="window.print()">Imprimer / Sauvegarder</button>
  </div>
  <div class="pages-container">
    ${pagesHtml}
  </div>
</body>
</html>`;

      setProgress(100);

      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const outputName = file.name.replace(/\.pdf$/i, '.html');

      setResultUrl(url);
      setResultFilename(outputName);

      // Auto-trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResultUrl(null);
    setResultFilename('');
    setError(null);
    setProgress(0);
  };

  // ── STATE 1: Initial / No file ────────────────────────────────────────
  if (!file) {
    return (
      <>
        <SEO slug="pdf-to-html" />
      <Header />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="lazyOnload" />
        <main className="tool-page-layout" style={{ padding: 0 }}>
          <div style={{
            minHeight: 'calc(100vh - 70px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              PDF en HTML
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              Convertissez vos fichiers PDF en pages web HTML. Conservez la mise en page et le texte. 100% gratuit.
            </p>

            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(249, 115, 22, 0.4)',
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

            <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Convertir PDF en HTML en ligne</h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                Notre outil de conversion PDF en HTML transforme vos documents PDF en pages web prêtes à l&apos;emploi. Le texte et la mise en page sont préservés grâce à un positionnement précis. Le traitement s&apos;effectue entièrement dans votre navigateur, garantissant la confidentialité totale de vos fichiers. Aucun téléchargement sur un serveur distant, aucune inscription requise.
              </p>
            </div>

            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── STATE 3: Processing or Result ─────────────────────────────────────
  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="lazyOnload" />
        <main className="tool-page-layout">
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            {isProcessing ? (
              <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <h2>Conversion en cours...</h2>
                <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>Extraction du texte et génération du HTML...</p>
                <div className="progress-container" style={{ marginTop: '2rem' }}>
                  <div className="progress">
                    <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(to right, #f97316, #ea580c)' }}></div>
                  </div>
                  <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p>
                </div>
              </div>
            ) : (
              <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
                <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle size={64} color="#f97316" />
                </div>
                <h2>🎉 Le fichier HTML est prêt !</h2>
                <p style={{ marginBottom: '2rem' }}>Votre PDF a été converti en page web HTML avec succès.</p>
                <a
                  href={resultUrl!}
                  download={resultFilename}
                  className="btn btn-primary btn-xl"
                  style={{
                    backgroundColor: '#f97316',
                    borderColor: '#f97316',
                    backgroundImage: 'linear-gradient(to right, #f97316, #ea580c)',
                    color: 'white'
                  }}
                >
                  Télécharger le fichier HTML
                </a>
                <div style={{ marginTop: '2rem' }}>
                  <button className="btn btn-outline" onClick={reset}>
                    Convertir un autre fichier
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── STATE 2: Workspace (file selected) ────────────────────────────────
  return (
    <>
      <Header />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="lazyOnload" />
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
        <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
          <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
            <div className="pdf-page-header" style={{ backgroundColor: '#f97316' }}>
              {file.name}
            </div>
            <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <FileText size={80} color="#f97316" style={{ opacity: 0.5 }} />
            </div>
            <div className="pdf-page-number">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>

          <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
        </div>

        <div className="workspace-sidebar">
          <div className="workspace-sidebar-header">
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#f97316' }}>
              <Globe size={24} /> PDF en HTML
            </h2>
          </div>
          <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '2px solid rgba(249, 115, 22, 0.3)',
              background: 'rgba(249, 115, 22, 0.05)',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={20} color="#f97316" />
                <span style={{ fontWeight: 'bold', color: '#f97316' }}>Comment ça marche</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                Le texte de chaque page du PDF sera extrait avec sa position d&apos;origine et converti en une page web HTML avec un positionnement fidèle à la mise en page originale.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1.2rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              gap: '0.5rem'
            }}>
              <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>📄 Fichier sélectionné</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>{file.name}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1.2rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              gap: '0.5rem'
            }}>
              <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>🔒 100% Confidentiel</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                La conversion s&apos;effectue entièrement dans votre navigateur. Aucun fichier n&apos;est envoyé sur un serveur.
              </span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <AdUnit slot="ad-workspace-sidebar" format="rectangle" />
            </div>
          </div>

          <div className="workspace-sidebar-footer">
            {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>{error}</div>}

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
                backgroundColor: '#f97316',
                borderColor: '#f97316',
                backgroundImage: 'linear-gradient(to right, #f97316, #ea580c)',
              }}
              onClick={handleConvert}
            >
              Convertir en HTML <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
