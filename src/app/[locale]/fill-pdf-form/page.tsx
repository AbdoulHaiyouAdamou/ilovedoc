'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { extractPdfFields, fillPdfFields, PdfFieldInfo } from '@/features/pdf/fillForm';
import { FormInput, FileText, Type } from 'lucide-react';
import { getToolBySlug } from '@/config/tools';
import { ToolLayout, useToolState } from '@/components/tools';

const tool = getToolBySlug('fill-pdf-form')!;

export default function FillPdfFormPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop: handleDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<PdfFieldInfo[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [flatten, setFlatten] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      handleDrop(acceptedFiles);
      
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      try {
        const extractedFields = await extractPdfFields(selected);
        setFields(extractedFields);
        
        const initialValues: Record<string, any> = {};
        extractedFields.forEach(f => {
          initialValues[f.name] = f.value;
        });
        setFieldValues(initialValues);
      } catch (err: any) {
        failProcessing("Impossible d'analyser les champs de ce PDF. Il est peut-être protégé ou ne contient pas de formulaire standard (AcroForm).");
      }
    }
  }, [handleDrop, failProcessing]);

  const handleFill = async () => {
    if (!file) return;
    startProcessing();

    try {
      const filledBytes = await fillPdfFields(file, fieldValues, flatten, { onProgress: setProgress });
      const blob = new Blob([filledBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_rempli.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || "Une erreur s'est produite lors du remplissage.");
    }
  };

  const handleReset = () => {
    reset();
    setPreviewUrl(null);
    setFields([]);
    setFieldValues({});
  };

  const handleValueChange = (name: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [name]: value }));
  };

  const workspacePreview = previewUrl && (
    <div style={{ flex: 1, width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <object data={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} type="application/pdf" width="100%" height="100%" style={{ minHeight: '600px' }}>
        <p>Aperçu PDF non disponible.</p>
      </object>
    </div>
  );

  const workspaceSidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div className="workspace-sidebar-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
        <h3 className="workspace-sidebar-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <FormInput size={20} />
          Liste des champs ({fields.length})
        </h3>
      </div>
      
      <div className="workspace-sidebar-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', width: '100%', outline: 'none' }}
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
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', width: '100%', outline: 'none' }}
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

      <div className="workspace-sidebar-footer" style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1rem', userSelect: 'none' }}>
          <input type="checkbox" checked={flatten} onChange={(e) => setFlatten(e.target.checked)} style={{marginTop: '4px', transform: 'scale(1.2)'}} />
          <span style={{ color: 'var(--color-text-secondary)' }}>Aplatir (Empêcher toute modification ultérieure)</span>
        </label>
      </div>
    </div>
  );

  return (
    <ToolLayout
      slug="fill-pdf-form"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={handleReset}
      onDrop={onDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Remplissage en cours..."
      successMessage="🎉 Le PDF a été rempli !"
      successSubtitle="Vos données ont été enregistrées dans le document."
      actionLabel="Remplir le formulaire"
      onAction={handleFill}
      actionDisabled={fields.length === 0}
      seoSection={
        <div style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Remplir un formulaire PDF gratuitement</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Complétez facilement vos documents PDF interactifs en ligne. Remplissez les champs texte, 
            cochez les cases et sélectionnez les options des listes déroulantes, puis téléchargez 
            votre PDF rempli en un clic. Fonctionnement 100% sécurisé et local.
          </p>
        </div>
      }
    />
  );
}
