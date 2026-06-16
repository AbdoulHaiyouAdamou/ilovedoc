'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FormInput, AlertCircle, Download, CheckCircle2, ChevronRight, Settings2, FileText, Type } from 'lucide-react';
import { getToolBySlug } from '@/config/tools';
import AdUnit from '@/components/common/AdUnit';
import Script from 'next/script';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import { extractPdfFields, fillPdfFields, PdfFieldInfo } from '@/features/pdf/fillForm';

const tool = getToolBySlug('fill-pdf-form')!;

export default function FillPdfFormPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [fields, setFields] = useState<PdfFieldInfo[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [flatten, setFlatten] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setError(null);
      setIsDone(false);
      setDownloadUrl(null);
      
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      try {
        const extractedFields = await extractPdfFields(selected);
        setFields(extractedFields);
        
        // Initialize values
        const initialValues: Record<string, any> = {};
        extractedFields.forEach(f => {
          initialValues[f.name] = f.value;
        });
        setFieldValues(initialValues);
      } catch (err: any) {
        setError("Impossible d'analyser les champs de ce PDF. Il est peut-être protégé ou ne contient pas de formulaire standard (AcroForm).");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleFill = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const filledBytes = await fillPdfFields(file, fieldValues, flatten, {
        onProgress: (p) => setProgress(p)
      });
      const blob = new Blob([filledBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsDone(true);
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors du remplissage.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setFields([]);
    setFieldValues({});
    setIsDone(false);
    setDownloadUrl(null);
    setProgress(0);
  };

  const handleValueChange = (name: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <SEO slug="fill-pdf-form" />
      <Header />
      <main className="tool-page-layout" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* -- STATE 1: DROPZONE -- */}
        {!file && !isProcessing && !isDone && (
          <div style={{ minHeight: 'calc(100vh - 70px)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              {tTools('fill-pdf-form.name')}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tTools('fill-pdf-form.description')}
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
                {tCommon('select_file')}
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>
                ou glissez-déposez le PDF ici
              </p>
            </div>
          </div>
        )}

        {/* -- STATE 2: WORKSPACE -- */}
        {file && !isProcessing && !isDone && (
          <div className="workspace">
            <div className="workspace-preview" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              {previewUrl && (
                <div style={{ flex: 1, width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                   <object data={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} type="application/pdf" width="100%" height="100%">
                     <p>Aperçu PDF non disponible.</p>
                   </object>
                </div>
              )}
            </div>

            <div className="workspace-sidebar" style={{ width: '400px' }}>
              <div className="workspace-sidebar-header">
                <h3 className="workspace-sidebar-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <FormInput size={20} />
                  Liste des champs ({fields.length})
                </h3>
              </div>
              
              <div className="workspace-sidebar-content" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                {error && (
                  <div className="text-danger" style={{ marginBottom: '1rem', fontWeight: 'bold', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
                    <AlertCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
                    {error}
                  </div>
                )}

                {fields.length === 0 && !error ? (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem 0' }}>
                    <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>Ce document ne comporte aucun champ de formulaire modifiable.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {fields.map((f, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Type size={14} /> {f.name}
                        </label>
                        
                        {f.type === 'TextField' && (
                           <input 
                             type="text" 
                             value={fieldValues[f.name] || ''} 
                             onChange={(e) => handleValueChange(f.name, e.target.value)}
                             style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', width: '100%' }}
                           />
                        )}

                        {f.type === 'CheckBox' && (
                           <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                             <input 
                               type="checkbox" 
                               checked={!!fieldValues[f.name]} 
                               onChange={(e) => handleValueChange(f.name, e.target.checked)}
                               style={{ transform: 'scale(1.2)' }}
                             />
                             <span style={{ fontSize: '0.9rem' }}>Coché</span>
                           </label>
                        )}

                        {(f.type === 'Dropdown' || f.type === 'OptionList') && f.options && (
                           <select 
                             value={fieldValues[f.name] || ''} 
                             onChange={(e) => handleValueChange(f.name, e.target.value)}
                             style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', width: '100%' }}
                           >
                             <option value="">-- Sélectionner --</option>
                             {f.options.map(opt => (
                               <option key={opt} value={opt}>{opt}</option>
                             ))}
                           </select>
                        )}

                        {f.type === 'RadioGroup' && f.options && (
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                             {f.options.map(opt => (
                               <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                 <input 
                                   type="radio" 
                                   name={f.name} 
                                   value={opt} 
                                   checked={fieldValues[f.name] === opt} 
                                   onChange={(e) => handleValueChange(f.name, e.target.value)}
                                 />
                                 <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                               </label>
                             ))}
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="workspace-sidebar-footer" style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                 <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1rem', userSelect: 'none' }}>
                  <input type="checkbox" checked={flatten} onChange={(e) => setFlatten(e.target.checked)} style={{marginTop: '4px', transform: 'scale(1.2)'}} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>Aplatir (Empêcher toute modification ultérieure)</span>
                </label>

                <button
                  onClick={handleFill}
                  disabled={fields.length === 0}
                  className="btn btn-lg workspace-btn-main"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color[0]}, ${tool.color[1]})`,
                    color: 'white',
                    width: '100%',
                    justifyContent: 'center',
                    opacity: fields.length === 0 ? 0.5 : 1
                  }}
                >
                  Remplir le formulaire <ChevronRight size={20} />
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
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Remplissage en cours...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, background: tool.color[0] }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{Math.round(progress)}%</p>
                  </div>
                </div>
              ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <CheckCircle2 size={64} color={tool.color[0]} />
                  </div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Le PDF a été rempli !</h2>
                  <p style={{marginBottom: '2rem'}}>Vos données ont été enregistrées dans le document.</p>
                  <a 
                    href={downloadUrl!} 
                    download={`${file?.name.replace('.pdf', '')}_rempli.pdf`} 
                    className="btn btn-primary btn-xl gradient-bg"
                    style={{ background: `linear-gradient(135deg, ${tool.color[0]}, ${tool.color[1]})`, border: 'none', color: 'white' }}
                  >
                    <Download size={24} style={{ marginRight: 8 }} /> Télécharger le PDF
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" style={{ borderColor: tool.color[0], color: tool.color[0] }} onClick={reset}>
                      Remplir un autre PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="seo-content container-narrow">
          <AdUnit slot="ad-fill-pdf-1" />
          <h2>Remplir un formulaire PDF gratuitement</h2>
          <p>
            Complétez facilement vos documents PDF interactifs en ligne. Remplissez les champs texte, 
            cochez les cases et sélectionnez les options des listes déroulantes, puis téléchargez 
            votre PDF rempli en un clic. Fonctionnement 100% sécurisé et local.
          </p>
          <AdUnit slot="ad-fill-pdf-2" />
        </div>
        </main>
      <Footer />
    </>
  );
}
