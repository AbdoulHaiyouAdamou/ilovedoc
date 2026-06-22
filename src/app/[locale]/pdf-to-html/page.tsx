'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Script from 'next/script';
import { Globe, Info, FileText } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#f97316'; // Orange HTML

export default function PdfToHtmlPage() {
  const tTools = useTranslations('Tools');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const handleConvert = useCallback(async () => {
    if (!file) return;
    startProcessing();

    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error("La librairie PDF.js n'est pas chargée. Veuillez rafraîchir la page.");
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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
          const x = tx[4] * 1.5;
          const fontSize = Math.abs(tx[0]) * 1.5;
          const y = pageHeight - tx[5] * 1.5 - (fontSize * 0.85);

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
    .doc-info { display: flex; flex-direction: column; }
    .doc-title { font-weight: 700; font-size: 15px; color: #1a202c; }
    .doc-meta { font-size: 12px; color: #718096; margin-top: 2px; }
    .print-btn {
      background-color: #f97316; color: white; border: none; padding: 8px 16px;
      font-size: 13px; font-weight: 600; border-radius: 6px; cursor: pointer;
      transition: background 0.2s;
    }
    .print-btn:hover { background-color: #ea580c; }
    .pages-container { padding: 20px; display: flex; flex-direction: column; align-items: center; }
    .page { page-break-after: always; font-family: Arial, Helvetica, sans-serif; line-height: 1; }
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
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '.html');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || 'Une erreur est survenue lors de la conversion.');
    }
  }, [file, startProcessing, finishProcessing, failProcessing, setProgress]);

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: 300, height: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
      <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>{file.name}</div>
      <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <FileText size={80} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
      </div>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1.2rem', borderRadius: '12px', border: `2px solid ${TOOL_COLOR}40`, background: `${TOOL_COLOR}10` }}>
        <Info size={22} color={TOOL_COLOR} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
          Le texte de chaque page du PDF sera extrait avec sa position d'origine et converti en une page web HTML avec un positionnement fidèle à la mise en page originale.
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', gap: '0.5rem' }}>
        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>🔒 100% Confidentiel</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          La conversion s'effectue entièrement dans votre navigateur. Aucun fichier n'est envoyé sur un serveur.
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="lazyOnload" />
      <ToolLayout
        slug="pdf-to-html"
        phase={phase}
        file={file}
        isProcessing={isProcessing}
        progress={progress}
        resultUrl={resultUrl}
        error={error}
        onReset={reset}
        onDrop={onDrop}
        workspacePreview={workspacePreview}
        workspaceSidebar={workspaceSidebar}
        processingLabel="Conversion en cours..."
        successMessage="🎉 Le fichier HTML est prêt !"
        successSubtitle="Votre PDF a été converti en page web HTML avec succès."
        actionLabel="Convertir en HTML"
        onAction={handleConvert}
        downloadName={file ? file.name.replace(/\.pdf$/i, '.html') : undefined}
        seoSection={
          <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Convertir PDF en HTML en ligne</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
              Notre outil de conversion PDF en HTML transforme vos documents PDF en pages web prêtes à l'emploi. Le texte et la mise en page sont préservés grâce à un positionnement précis. Le traitement s'effectue entièrement dans votre navigateur, garantissant la confidentialité totale de vos fichiers. Aucun téléchargement sur un serveur distant, aucune inscription requise.
            </p>
          </div>
        }
      />
    </>
  );
}
