'use client';
import SEO from '@/components/common/SEO';

import React, { useState, useCallback , useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/common/Header';
import { useTranslations } from 'next-intl';
import Footer from '@/components/common/Footer';
import AdUnit from '@/components/common/AdUnit';
import { addWatermarkToPDF } from '@/features/pdf/watermark';
import { getPdfPageCount } from '@/features/pdf/split';
import { Type, Image as ImageIcon, ArrowRight, Bold, Italic, Underline, Trash2, Plus, ChevronDown, Layers, ArrowDownToLine } from 'lucide-react';

export default function AddWatermarkPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Advanced Watermark settings
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('iLovePDF');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  
  const [position, setPosition] = useState<'tl'|'tc'|'tr'|'cl'|'cc'|'cr'|'bl'|'bc'|'br'>('tl');
  const [isMosaic, setIsMosaic] = useState(false);
  
  const [opacity, setOpacity] = useState(1); // 1 = Aucune transparence
  const [rotation, setRotation] = useState(0); // 0 = Ne pas pivoter
  
  const [pageFrom, setPageFrom] = useState(1);
  const [pageTo, setPageTo] = useState(1);
  const [layer, setLayer] = useState<'above' | 'below'>('above');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setResultUrl(null);
      setError(null);
      setProgress(0);
      try {
        const count = await getPdfPageCount(selected);
        setTotalPages(count);
        setPageFrom(1);
        setPageTo(count);
      } catch (err) {
        setError("Impossible de lire ce PDF.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  const handleAddWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const blob = await addWatermarkToPDF(file, {
        text: watermarkText,
        fontSize: 60,
        opacity,
        rotation,
        position,
        isMosaic,
        pageRange: { from: pageFrom, to: pageTo },
        layer,
        fontFamily,
        isBold,
        isItalic,
        textColor,
        onProgress: (p) => setProgress(p),
      });
      
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'ajout du filigrane.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderGridCell = (pos: 'tl'|'tc'|'tr'|'cl'|'cc'|'cr'|'bl'|'bc'|'br') => {
    const isActive = position === pos && !isMosaic;
    return (
      <div 
        key={pos}
        onClick={() => { setPosition(pos); setIsMosaic(false); }}
        style={{
          width: '100%', height: '100%', border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative'
        }}
      >
        {isActive && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e53935' }} />}
      </div>
    );
  };

  if (!file) {
    return (
      <>
        <SEO slug="add-watermark" />
      <Header />
        <main className="tool-page-layout" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            minHeight: 'calc(100vh - 70px)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
              {tTools('add-watermark.name')}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5' }}>
              {tTools('add-watermark.description')}
            </p>
            
            <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <button style={{
                backgroundColor: '#e53935', 
                color: 'white',
                border: 'none',
                padding: '1.8rem 4rem', 
                fontSize: '1.8rem', 
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(229, 57, 53, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {tCommon('select_file')}
              </button>
              <p style={{ marginTop: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: '1.1rem' }}>{tCommon('or_drop')}</p>
            </div>
          </div>

          {/* Below the fold: SEO and Ads */}
          <div className="container" style={{ padding: '4rem 2rem' }}>
            <AdUnit slot="ad-top" format="horizontal" />
            
            <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment ajouter un filigrane sur un PDF</h2>
              <ol className="steps-list">
                <li>Sélectionnez votre fichier PDF ou glissez-déposez-le dans la zone ci-dessus.</li>
                <li>Personnalisez votre texte, sa taille, sa couleur et sa position dans l'espace de travail.</li>
                <li>Cliquez sur "Ajouter un filigrane" pour appliquer vos modifications.</li>
                <li>Le téléchargement de votre fichier sécurisé se lancera automatiquement.</li>
              </ol>
            </section>
            
            <AdUnit slot="ad-bottom" format="horizontal" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (isProcessing || resultUrl) {
    return (
      <>
        <Header />
        <main className="tool-page-layout">
          <div className="container" style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
             {isProcessing ? (
                <div className="glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>Ajout du filigrane...</h2>
                  <div className="progress-container" style={{marginTop: '2rem'}}>
                    <div className="progress">
                      <div className="progress-bar gradient-bg" style={{ width: `${progress}%`, backgroundImage: 'linear-gradient(to right, #e53935, #ef5350)' }}></div>
                    </div>
                    <p style={{marginTop: '1rem', fontWeight: 'bold'}}>{progress}%</p>
                  </div>
                </div>
             ) : (
                <div className="result-container glass" style={{padding: '4rem', borderRadius: '1rem'}}>
                  <h2>🎉 Le filigrane a été ajouté !</h2>
                  <p style={{marginBottom: '2rem'}}>Votre document est prêt.</p>
                  <a href={resultUrl!} download className="btn btn-primary btn-xl gradient-bg" style={{backgroundColor: '#e53935', borderColor: '#e53935', backgroundImage: 'linear-gradient(to right, #e53935, #ef5350)'}}>
                    Télécharger le PDF
                  </a>
                  <div style={{marginTop: '2rem'}}>
                    <button className="btn btn-outline" onClick={() => { setFile(null); setResultUrl(null); }}>Ajouter un filigrane à un autre fichier</button>
                  </div>
                </div>
             )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="workspace" style={{ background: '#f5f5f5' }}>
        <div className="workspace-preview" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2rem', overflowY: 'auto' }}>
          
          {/* File item toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <div style={{ 
              background: '#fff', border: '1px solid #ddd', borderRadius: '4px', 
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
               <span style={{ fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
               <ChevronDown size={16} color="#666" />
            </div>
            <button style={{ 
              background: '#fff', border: '1px solid #ddd', borderRadius: '4px', 
              padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} onClick={() => setFile(null)}>
              <Trash2 size={18} color="#666" />
            </button>
          </div>
          
          {/* Add file button floating */}
          <button style={{
            position: 'absolute', top: '2rem', right: '2rem',
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#e53935', color: '#fff', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(229, 57, 53, 0.4)',
            cursor: 'pointer'
          }}>
             <Plus size={24} />
          </button>

          {/* Document Preview */}
          <div style={{ 
            width: '350px', height: '495px', background: '#fff', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative',
            display: 'flex', flexDirection: 'column', padding: '1rem',
            marginBottom: '2rem'
          }}>
            {/* Fake PDF Content */}
            <div style={{ width: '100%', height: '30px', background: '#e0f2fe', marginBottom: '1rem' }} />
            <div style={{ width: '80%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
            <div style={{ width: '90%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
            <div style={{ width: '70%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
            
            {/* Watermark position indicator (Red dot) */}
            {!isMosaic && (
              <div style={{
                position: 'absolute',
                width: '24px', height: '24px', borderRadius: '50%', background: '#e53935',
                top: position.startsWith('t') ? '20px' : position.startsWith('b') ? 'calc(100% - 44px)' : 'calc(50% - 12px)',
                left: position.endsWith('l') ? '20px' : position.endsWith('r') ? 'calc(100% - 44px)' : 'calc(50% - 12px)',
                boxShadow: '0 0 0 4px rgba(229, 57, 53, 0.2)'
              }} />
            )}

            {isMosaic && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr',
                opacity: 0.5
              }}>
                 {Array.from({length: 6}).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#e53935' }} />
                    </div>
                 ))}
              </div>
            )}
          </div>
          
        </div>

        {/* Sidebar matching iLovePDF Exactly */}
        <div className="workspace-sidebar" style={{ width: '380px', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0, color: '#333' }}>Options de filigrane</h2>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setActiveTab('text')}
                style={{
                  flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  background: activeTab === 'text' ? '#f9fafb' : '#fff',
                  border: activeTab === 'text' ? '2px solid #22c55e' : '1px solid #e5e7eb',
                  borderRadius: '4px', cursor: 'pointer', position: 'relative'
                }}
              >
                {activeTab === 'text' && (
                  <div style={{ position: 'absolute', top: '8px', left: '8px', width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                )}
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', fontFamily: 'serif' }}>A</span>
                <span style={{ fontSize: '0.9rem', color: '#555' }}>Placer du texte</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('image')}
                style={{
                  flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  background: activeTab === 'image' ? '#f9fafb' : '#fff',
                  border: activeTab === 'image' ? '2px solid #22c55e' : '1px solid #e5e7eb',
                  borderRadius: '4px', cursor: 'pointer', opacity: 0.7
                }}
              >
                <ImageIcon size={36} color="#888" strokeWidth={1.5} />
                <span style={{ fontSize: '0.9rem', color: '#555' }}>Placer une image</span>
              </button>
            </div>

            {activeTab === 'text' && (
              <>
                {/* Texte Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                    Texte :
                  </label>
                  <input 
                    type="text" 
                    value={watermarkText} 
                    onChange={(e) => setWatermarkText(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1',
                      fontSize: '1rem', outline: 'none'
                    }}
                  />
                </div>

                {/* Format de texte Toolbar */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                    Format de texte :
                  </label>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', padding: '6px', 
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px',
                    gap: '4px', flexWrap: 'wrap'
                  }}>
                    <select 
                      value={fontFamily} 
                      onChange={(e) => setFontFamily(e.target.value)}
                      style={{ border: 'none', background: 'transparent', padding: '4px', outline: 'none', cursor: 'pointer', fontSize: '0.9rem', flex: 1, minWidth: '80px' }}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                    
                    <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }} />
                    
                    <button style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Tt</span> <ChevronDown size={14} />
                    </button>
                    
                    <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }} />
                    
                    <button onClick={() => setIsBold(!isBold)} style={{ background: isBold ? '#e2e8f0' : 'transparent', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Bold size={16} /></button>
                    <button onClick={() => setIsItalic(!isItalic)} style={{ background: isItalic ? '#e2e8f0' : 'transparent', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Italic size={16} /></button>
                    <button onClick={() => setIsUnderline(!isUnderline)} style={{ background: isUnderline ? '#e2e8f0' : 'transparent', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Underline size={16} /></button>
                    
                    <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }} />
                    
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px' }}>
                      <span style={{ fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: textColor, textDecorationThickness: '3px' }}>A</span>
                      <ChevronDown size={14} />
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }} />
                    </div>
                  </div>
                </div>

                {/* Position Grid & Mosaic */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                    Position :
                  </label>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    {/* 3x3 Grid */}
                    <div style={{ 
                      width: '60px', height: '80px', 
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr',
                      border: '1px solid #cbd5e1', background: '#fff'
                    }}>
                      {renderGridCell('tl')} {renderGridCell('tc')} {renderGridCell('tr')}
                      {renderGridCell('cl')} {renderGridCell('cc')} {renderGridCell('cr')}
                      {renderGridCell('bl')} {renderGridCell('bc')} {renderGridCell('br')}
                    </div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
                      <input 
                        type="checkbox" 
                        checked={isMosaic} 
                        onChange={(e) => setIsMosaic(e.target.checked)} 
                        style={{ width: '18px', height: '18px', accentColor: '#e53935' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: '#444' }}>Mosaïque</span>
                    </label>
                  </div>
                </div>

                {/* Dropdowns: Transparence & Rotation */}
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                      Transparence :
                    </label>
                    <select 
                      value={opacity} 
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', background: '#fff' }}
                    >
                      <option value={1}>Aucune transparence</option>
                      <option value={0.75}>25%</option>
                      <option value={0.5}>50%</option>
                      <option value={0.25}>75%</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                      Rotation :
                    </label>
                    <select 
                      value={rotation} 
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', background: '#fff' }}
                    >
                      <option value={0}>Ne pas pivoter</option>
                      <option value={45}>45 degrés</option>
                      <option value={90}>90 degrés</option>
                      <option value={180}>180 degrés</option>
                      <option value={270}>270 degrés</option>
                    </select>
                  </div>
                </div>

                {/* Pages */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                    Pages :
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem' }}>de la page</span>
                    <input 
                      type="number" min="1" max={totalPages} value={pageFrom} 
                      onChange={(e) => setPageFrom(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '60px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', outline: 'none' }}
                    />
                    <span style={{ fontSize: '0.9rem' }}>à</span>
                    <input 
                      type="number" min="1" max={totalPages} value={pageTo} 
                      onChange={(e) => setPageTo(Math.min(totalPages, parseInt(e.target.value) || totalPages))}
                      style={{ width: '60px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Couche */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>
                    Couche
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setLayer('above')}
                      style={{ 
                        flex: 1, padding: '15px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        background: layer === 'above' ? '#fffbfa' : '#f8fafc',
                        border: layer === 'above' ? '2px solid #e53935' : '1px solid #e2e8f0',
                        borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <Layers size={32} color={layer === 'above' ? '#e53935' : '#94a3b8'} />
                      <span style={{ fontSize: '0.8rem', color: layer === 'above' ? '#e53935' : '#64748b', textAlign: 'center' }}>Tout au long du<br/>contenu PDF</span>
                    </button>
                    <button 
                      onClick={() => setLayer('below')}
                      style={{ 
                        flex: 1, padding: '15px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        background: layer === 'below' ? '#fffbfa' : '#f8fafc',
                        border: layer === 'below' ? '2px solid #e53935' : '1px solid #e2e8f0',
                        borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <ArrowDownToLine size={32} color={layer === 'below' ? '#e53935' : '#94a3b8'} />
                      <span style={{ fontSize: '0.8rem', color: layer === 'below' ? '#e53935' : '#64748b', textAlign: 'center' }}>Au dessous du<br/>contenu PDF</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'image' && (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: '#888' }}>
                <ImageIcon size={48} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '1rem' }} />
                <p>La fonctionnalité Image arrive bientôt.</p>
              </div>
            )}
          </div>
          
          <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', background: '#fff' }}>
            {error && <div className="text-danger" style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px'}}>{error}</div>}
            
            <button 
              className="btn" 
              style={{
                width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', 
                fontSize: '1.2rem', padding: '1.2rem', fontWeight: 'bold',
                backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '8px',
                cursor: 'pointer', boxShadow: '0 4px 10px rgba(229, 57, 53, 0.3)',
                transition: 'transform 0.1s'
              }} 
              onClick={handleAddWatermark}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Ajouter un filigrane <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
