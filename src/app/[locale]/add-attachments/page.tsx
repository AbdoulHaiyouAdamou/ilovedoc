'use client';
import SEO from '@/components/common/SEO';
import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { addAttachmentsToPdf } from '@/features/pdf/attachments';
import { Paperclip, CheckCircle, ArrowRight, X } from 'lucide-react';

const TOOL_COLOR = '#8b5cf6';
const GRADIENT = 'linear-gradient(to right, #8b5cf6, #7c3aed)';

export default function AddAttachmentsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) { setFile(acceptedFiles[0]); setResultUrl(null); setError(null); }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const handleAddAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeAttachment = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!file || attachments.length === 0) return;
    setIsProcessing(true); setError(null); setProgress(0);
    try {
      const interval = setInterval(() => setProgress(p => Math.min(p + 20, 90)), 150);
      const blob = await addAttachmentsToPdf(file, attachments);
      clearInterval(interval); setProgress(100);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.pdf$/i, '_with_attachments.pdf');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally { setIsProcessing(false); }
  };

  if (!file) {
    return (<>
      <SEO slug="add-attachments" />
      <Header />
      <main className="tool-page-layout" style={{ padding: 0 }}>
        <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>Pièces jointes PDF</h1>
          <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: 800, textAlign: 'center', lineHeight: 1.5 }}>
            Intégrez des fichiers en pièces jointes directement dans votre document PDF.
          </p>
          <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <input {...getInputProps()} />
            <button style={{ backgroundColor: TOOL_COLOR, color: 'white', border: 'none', padding: '1.8rem 4rem', fontSize: '1.8rem', fontWeight: 'bold', borderRadius: 12, boxShadow: `0 10px 25px ${TOOL_COLOR}66`, cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Sélectionner le fichier PDF
            </button>
            <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>ou déposez le PDF ici</p>
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
        </main>
      <Footer />
    </>);
  }

  if (isProcessing || resultUrl) {
    return (<>
      <Header />
      <main className="tool-page-layout"><div className="container" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        {isProcessing ? (
          <div className="glass" style={{ padding: '4rem', borderRadius: '1rem' }}><h2>Intégration en cours...</h2>
            <div className="progress-container" style={{ marginTop: '2rem' }}><div className="progress"><div className="progress-bar" style={{ width: `${progress}%`, backgroundImage: GRADIENT }} /></div>
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{progress}%</p></div></div>
        ) : (
          <div className="result-container glass" style={{ padding: '4rem', borderRadius: '1rem' }}>
            <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><CheckCircle size={64} color={TOOL_COLOR} /></div>
            <h2>🎉 Pièces jointes ajoutées !</h2>
            <p style={{ marginBottom: '2rem' }}>{attachments.length} fichier(s) intégré(s).</p>
            <a href={resultUrl!} download className="btn btn-primary btn-xl" style={{ backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT }}>Télécharger le PDF</a>
            <div style={{ marginTop: '2rem' }}><button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); setAttachments([]); }}>Recommencer</button></div>
          </div>
        )}
      </div></main><Footer /></>);
  }

  return (<>
    <Header />
    <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ maxWidth: '728px', margin: '0 auto' }}>
          <AdUnit slot="ad-workspace-top" format="horizontal" />
        </div>
      </div>
      <div className="workspace">
      <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
        <div className="pdf-page-card" style={{ width: 300, height: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
          <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>{file.name}</div>
          <div className="pdf-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 8 }}>
            <Paperclip size={60} color={TOOL_COLOR} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{attachments.length} pièce(s) jointe(s)</span>
          </div>
        </div>
      </div>
      <div className="workspace-sidebar">
        <div className="workspace-sidebar-header">
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: TOOL_COLOR }}><Paperclip size={24} /> Pièces jointes</h2>
        </div>
        <div className="workspace-sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '1rem', borderRadius: 8, border: `2px dashed ${TOOL_COLOR}`, cursor: 'pointer', color: TOOL_COLOR, fontWeight: 600 }}>
            <Paperclip size={18} /> Ajouter des fichiers
            <input type="file" multiple onChange={handleAddAttachments} style={{ display: 'none' }} />
          </label>
          {attachments.map((att, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{att.name}</span>
              <button onClick={() => removeAttachment(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={16} /></button>
            </div>
          ))}
        </div>
        <div className="workspace-sidebar-footer">
          {error && <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 10 }}>{error}</div>}
          <button className="btn btn-primary btn-xl" disabled={attachments.length === 0} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 10, fontSize: '1.2rem', padding: '1rem', marginTop: '0.5rem', backgroundColor: TOOL_COLOR, borderColor: TOOL_COLOR, backgroundImage: GRADIENT, opacity: attachments.length === 0 ? 0.5 : 1 }} onClick={handleSubmit}>
            Intégrer les pièces jointes <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  </>);
}
