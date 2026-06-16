'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { mergePDFs } from '@/features/pdf/merge';
import { FileUp, ArrowUp, ArrowDown, X, CheckCircle } from 'lucide-react';

export default function MergePDFPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setResultUrl(null);
    setError(null);
    setProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === files.length - 1)
    ) {
      return;
    }
    const newFiles = [...files];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFiles[index];
    newFiles[index] = newFiles[swapIndex];
    newFiles[swapIndex] = temp;
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const mergedBytes = await mergePDFs(files, {
        onProgress: (percent) => setProgress(percent)
      });
      
      const blob = new Blob([mergedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la fusion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment fusionner des fichiers PDF ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Glissez et déposez vos fichiers PDF dans la zone ci-dessus. Réorganisez-les si nécessaire, puis cliquez sur "Fusionner les PDF".'
        }
      },
      {
        '@type': 'Question',
        name: 'Est-ce gratuit de fusionner des PDF ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, l\'outil de fusion PDF de iLoveDoc est 100% gratuit et sans inscription.'
        }
      }
    ]
  };

  return (
    <>
      <SEO slug="merge-pdf" />
      <Header />
          <main className="tool-page-layout" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Full-screen initial view mimicking iLovePDF */}
        {!resultUrl && files.length === 0 ? (
          <>
            <div style={{ minHeight: 'calc(100vh - 70px)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
                Fusionner PDF
              </h1>
              <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
                Combinez plusieurs fichiers PDF en un seul document. C'est rapide, gratuit et sécurisé.
              </p>
              
              <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
                <input {...getInputProps()} />
                <button style={{
                  backgroundColor: '#7c3aed', 
                  color: 'white',
                  border: 'none',
                  padding: '1.8rem 4rem', 
                  fontSize: '1.8rem', 
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Sélectionner les fichiers PDF
                </button>
                <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>ou déposez les PDF ici</p>
              </div>
            </div>

            {/* Below the fold: SEO and Ads */}
            <div className="container" style={{ padding: '4rem 2rem' }}>
              <AdUnit slot="ad-top" format="horizontal" />
              <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment fusionner des fichiers PDF</h2>
                <ol className="steps-list">
                  <li>Sélectionnez vos fichiers PDF ou glissez-déposez-les dans la zone ci-dessus.</li>
                  <li>Réorganisez l'ordre des fichiers en utilisant les flèches si nécessaire.</li>
                  <li>Cliquez sur le bouton "Fusionner les PDF" pour lancer le processus.</li>
                  <li>Téléchargez votre nouveau fichier PDF fusionné.</li>
                </ol>
                <h3 style={{ marginTop: '2rem' }}>Pourquoi utiliser iLoveDoc ?</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>Notre outil fonctionne entièrement dans votre navigateur. Vos fichiers ne sont <strong>jamais</strong> envoyés sur nos serveurs, garantissant une confidentialité totale et un traitement ultra-rapide.</p>
              </section>
              <AdUnit slot="ad-bottom" format="horizontal" />
            </div>
          </>
        ) : (
          <div className="container" style={{ padding: '2rem 0' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            <div className="tool-container">
              {!resultUrl ? (
                <>
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
                    style={{ padding: '2rem' }}
                  >
                    <input {...getInputProps()} />
                    <div className="dropzone-content">
                      <span className="dropzone-icon" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                        <FileUp size={48} color="var(--primary-color, #7c3aed)" />
                      </span>
                      <button className="btn btn-primary btn-lg">
                        Ajouter plus de fichiers
                      </button>
                    </div>
                  </div>

                {files.length > 0 && (
                  <div className="file-manager glass">
                    <h3 className="file-manager-title">
                      Fichiers sélectionnés ({files.length})
                    </h3>
                    <ul className="file-list">
                      {files.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="file-item">
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatSize(file.size)}</span>
                          </div>
                          <div className="file-actions">
                            <button
                              className="btn-icon"
                              onClick={() => moveFile(index, 'up')}
                              disabled={index === 0}
                              title="Monter"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => moveFile(index, 'down')}
                              disabled={index === files.length - 1}
                              title="Descendre"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              className="btn-icon text-danger"
                              onClick={() => removeFile(index)}
                              title="Supprimer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {error && (
                      <div className="error-message toast toast-error">
                        {error}
                      </div>
                    )}

                    <div className="action-area">
                      {isProcessing ? (
                        <div className="progress-container">
                          <div className="progress">
                            <div
                              className="progress-bar gradient-bg"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p>Traitement en cours... {progress}%</p>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-xl gradient-bg"
                          onClick={handleMerge}
                          disabled={files.length < 2}
                        >
                          Fusionner les PDF
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="result-container glass">
                <div className="success-icon animation-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle size={64} color="#10b981" />
                </div>
                <h2>Vos PDF ont été fusionnés avec succès !</h2>
                <a
                  href={resultUrl}
                  download="ilovedoc-merged.pdf"
                  className="btn btn-primary btn-xl gradient-bg"
                >
                  Télécharger le PDF fusionné
                </a>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setFiles([]);
                    setResultUrl(null);
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  Fusionner d'autres fichiers
                </button>
              </div>
            )}
          </div>

          <AdUnit slot="ad-bottom" format="horizontal" />

          <section className="seo-content glass">
            <h2>Comment fusionner des fichiers PDF</h2>
            <ol className="steps-list">
              <li>Sélectionnez vos fichiers PDF ou glissez-déposez-les dans la zone ci-dessus.</li>
              <li>Réorganisez l'ordre des fichiers en utilisant les flèches si nécessaire.</li>
              <li>Cliquez sur le bouton "Fusionner les PDF" pour lancer le processus.</li>
              <li>Téléchargez votre nouveau fichier PDF fusionné.</li>
            </ol>
            
            <h3>Pourquoi utiliser iLoveDoc ?</h3>
            <p>Notre outil fonctionne entièrement dans votre navigateur. Vos fichiers ne sont <strong>jamais</strong> envoyés sur nos serveurs, garantissant une confidentialité totale et un traitement ultra-rapide.</p>
          </section>
        </div>
        )}
      </main>
      <Footer />
    </>
  );
}
