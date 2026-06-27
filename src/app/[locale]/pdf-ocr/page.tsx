'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { runOcrOnPdf } from '@/features/pdf/ocr';
import ScanText from 'lucide-react/dist/esm/icons/scan-text';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Copy from 'lucide-react/dist/esm/icons/copy';
import Download from 'lucide-react/dist/esm/icons/download';
import Info from 'lucide-react/dist/esm/icons/info';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import { ToolLayout, useToolState } from '@/components/tools';
import AdUnit from '@/components/common/AdUnit';
import Script from 'next/script';

const ACCENT = '#0ea5e9';

export default function PdfOcrPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');

  const {
    file,
    phase,
    isProcessing,
    progress,
    error,
    onDrop,
    reset,
    startProcessing,
    setProgress,
    failProcessing
  } = useToolState();

  const [language, setLanguage] = useState<string>('fra');
  const [resultText, setResultText] = useState<string | null>(null);
  const [resultPdfBytes, setResultPdfBytes] = useState<Uint8Array | null>(null);
  const [copied, setCopied] = useState(false);

  // Override phase if we have a result
  const currentPhase = resultText !== null ? 'result' : phase;

  // Load pdf.js from CDN
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleOcr = async () => {
    if (!file) return;
    startProcessing();
    setCopied(false);
    setResultText(null);
    setResultPdfBytes(null);
    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 2, 90));
      }, 500);

      const result = await runOcrOnPdf(file, language, (p: number) => {
        setProgress(p);
      });
      clearInterval(progressInterval);
      setProgress(100);

      setResultText(result.text);
      setResultPdfBytes(result.pdfBytes);
      // We don't call finishProcessing because we handle result state manually
    } catch (err: any) {
      failProcessing(err.message || "Une erreur est survenue lors de l'OCR.");
    }
  };

  const handleDownload = () => {
    if (!resultPdfBytes || !file) return;
    const blob = new Blob([resultPdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}_ocr.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      failProcessing('Impossible de copier le texte dans le presse-papier.');
    }
  };

  const customReset = () => {
    reset();
    setResultText(null);
    setResultPdfBytes(null);
    setCopied(false);
  };

  const workspacePreview = (
    <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
       <div className="pdf-page-card" style={{ width: '300px', height: '420px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
          <div className="pdf-page-header" style={{backgroundColor: ACCENT}}>
            {file?.name}
          </div>
          <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
             <FileText size={80} color={ACCENT} style={{ opacity: 0.5 }} />
          </div>
       </div>

       <AdUnit slot="ad-workspace-preview-bottom" format="horizontal" />
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div className="workspace-sidebar-header">
        <h2 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: ACCENT}}>
          <ScanText size={24} /> OCR PDF
        </h2>
      </div>
      <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, padding: '1rem', overflowY: 'auto' }}>
         <div>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Langue du document</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <label style={{
               display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: '12px', cursor: 'pointer',
               border: language === 'fra' ? `2px solid ${ACCENT}` : '2px solid var(--glass-border)',
               background: language === 'fra' ? `rgba(14, 165, 233, 0.1)` : 'transparent',
               transition: 'all 0.2s'
             }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <span style={{ fontWeight: 'bold', color: language === 'fra' ? ACCENT : 'var(--text-color)' }}>Français</span>
                 <input type="radio" name="language" checked={language === 'fra'} onChange={() => setLanguage('fra')} style={{ accentColor: ACCENT }} />
               </div>
             </label>

             <label style={{
               display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: '12px', cursor: 'pointer',
               border: language === 'eng' ? `2px solid ${ACCENT}` : '2px solid var(--glass-border)',
               background: language === 'eng' ? `rgba(14, 165, 233, 0.1)` : 'transparent',
               transition: 'all 0.2s'
             }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <span style={{ fontWeight: 'bold', color: language === 'eng' ? ACCENT : 'var(--text-color)' }}>English</span>
                 <input type="radio" name="language" checked={language === 'eng'} onChange={() => setLanguage('eng')} style={{ accentColor: ACCENT }} />
               </div>
             </label>

             <label style={{
               display: 'flex', flexDirection: 'column', padding: '1.2rem', borderRadius: '12px', cursor: 'pointer',
               border: language === 'fra+eng' ? `2px solid ${ACCENT}` : '2px solid var(--glass-border)',
               background: language === 'fra+eng' ? `rgba(14, 165, 233, 0.1)` : 'transparent',
               transition: 'all 0.2s'
             }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <span style={{ fontWeight: 'bold', color: language === 'fra+eng' ? ACCENT : 'var(--text-color)' }}>Français + English</span>
                 <input type="radio" name="language" checked={language === 'fra+eng'} onChange={() => setLanguage('fra+eng')} style={{ accentColor: ACCENT }} />
               </div>
             </label>
           </div>
         </div>

         {/* Info note */}
         <div style={{
           display: 'flex',
           alignItems: 'flex-start',
           gap: '10px',
           padding: '1rem',
           borderRadius: '8px',
           backgroundColor: `rgba(14, 165, 233, 0.08)`,
           border: `1px solid rgba(14, 165, 233, 0.2)`,
           fontSize: '0.85rem',
           color: 'var(--color-text-secondary)',
           lineHeight: '1.5'
         }}>
           <Info size={18} color={ACCENT} style={{ flexShrink: 0, marginTop: '2px' }} />
           <span>L'OCR peut prendre quelques minutes selon la taille du document.</span>
         </div>
      </div>
    </div>
  );

  const customResult = (
    <div className="result-container glass" style={{padding: '3rem', borderRadius: '1rem'}}>
      <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <CheckCircle size={64} color={ACCENT} />
      </div>
      <h2>🎉 L'OCR est terminé !</h2>
      <p style={{marginBottom: '2rem', color: 'var(--color-text-secondary)'}}>Le texte a été extrait avec succès.</p>
      
      {/* Extracted text display */}
      <div style={{
        textAlign: 'left',
        maxHeight: '400px',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <pre style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          margin: 0,
          color: 'var(--color-text)'
        }}>
          <code>{resultText}</code>
        </pre>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-primary btn-xl" 
          style={{
            backgroundColor: ACCENT, 
            borderColor: ACCENT, 
            backgroundImage: `linear-gradient(to right, ${ACCENT}, #0284c7)`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={handleDownload}
        >
          <Download size={20} /> Télécharger le PDF
        </button>
        <button 
          className="btn btn-outline btn-xl" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={handleCopy}
        >
          <Copy size={20} /> {copied ? 'Copié !' : 'Copier le texte'}
        </button>
      </div>

      <div style={{marginTop: '2rem'}}>
        <button className="btn btn-outline" onClick={customReset}>Traiter un autre fichier</button>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="pdf-ocr"
      phase={currentPhase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={null}
      error={error}
      onReset={customReset}
      onDrop={onDrop}
      accept={{ 'application/pdf': ['.pdf'] }}
      maxFiles={1}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="OCR en cours..."
      successMessage="🎉 L'OCR est terminé !"
      successSubtitle="Le texte a été extrait avec succès."
      actionLabel="Lancer l'OCR"
      onAction={handleOcr}
      customResult={customResult}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
           <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Pourquoi utiliser notre outil OCR ?</h2>
           <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
             Notre outil de reconnaissance optique de caractères (OCR) transforme vos PDF scannés en documents consultables et indexables. Que vous ayez des documents numérisés, des factures scannées ou des archives papier digitalisées, notre moteur OCR extrait le texte avec précision en français et en anglais. Le traitement est 100% hors-ligne pour garantir la confidentialité totale de vos informations. Vous obtenez un PDF consultable ainsi que le texte extrait, prêt à être copié ou réutilisé.
           </p>
        </div>
      }
    />
  );
}
