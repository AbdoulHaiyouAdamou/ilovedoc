'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { addWatermarkToPDF } from '@/features/pdf/watermark';
import { getPdfPageCount } from '@/features/pdf/split';
import Type from 'lucide-react/dist/esm/icons/type';
import ImageIcon from 'lucide-react/dist/esm/icons/image';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Bold from 'lucide-react/dist/esm/icons/bold';
import Italic from 'lucide-react/dist/esm/icons/italic';
import Underline from 'lucide-react/dist/esm/icons/underline';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Plus from 'lucide-react/dist/esm/icons/plus';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Layers from 'lucide-react/dist/esm/icons/layers';
import ArrowDownToLine from 'lucide-react/dist/esm/icons/arrow-down-to-line';
import { ToolLayout, useToolState } from '@/components/tools';

const ACCENT = '#06b6d4';
const ACCENT_DARK = '#0891b2';

export default function AddWatermarkPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file,
    isProcessing,
    progress,
    resultUrl,
    error,
    phase,
    onDrop,
    reset,
    startProcessing,
    finishProcessing,
    failProcessing,
    setProgress,
  } = useToolState();

  const [totalPages, setTotalPages] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('iLovePDF');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [position, setPosition] = useState<'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br'>('tl');
  const [isMosaic, setIsMosaic] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageFrom, setPageFrom] = useState(1);
  const [pageTo, setPageTo] = useState(1);
  const [layer, setLayer] = useState<'above' | 'below'>('above');

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
        try {
          const count = await getPdfPageCount(acceptedFiles[0]);
          setTotalPages(count);
          setPageFrom(1);
          setPageTo(count);
        } catch (err) {
          failProcessing("Impossible de lire ce PDF.");
        }
      }
    },
    [onDrop, failProcessing]
  );

  const handleAddWatermark = useCallback(async () => {
    if (!file) return;
    startProcessing();
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
      finishProcessing(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}_watermarked.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      failProcessing(err.message || "Une erreur est survenue lors de l'ajout du filigrane.");
    }
  }, [file, watermarkText, opacity, rotation, position, isMosaic, pageFrom, pageTo, layer, fontFamily, isBold, isItalic, textColor, startProcessing, finishProcessing, failProcessing, setProgress]);

  const renderGridCell = (pos: 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br') => {
    const isActive = position === pos && !isMosaic;
    return (
      <div
        key={pos}
        onClick={() => {
          setPosition(pos);
          setIsMosaic(false);
        }}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {isActive && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />}
      </div>
    );
  };

  const workspacePreview = file && (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
          <ChevronDown size={16} color="#666" />
        </div>
        <button
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => reset()}
        >
          <Trash2 size={18} color="#666" />
        </button>
      </div>

      <div
        style={{
          width: '350px',
          height: '495px',
          background: '#fff',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ width: '100%', height: '30px', background: '#e0f2fe', marginBottom: '1rem' }} />
        <div style={{ width: '80%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
        <div style={{ width: '90%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />
        <div style={{ width: '70%', height: '10px', background: '#f1f5f9', marginBottom: '8px' }} />

        {!isMosaic && (
          <div
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: ACCENT,
              top: position.startsWith('t') ? '20px' : position.startsWith('b') ? 'calc(100% - 44px)' : 'calc(50% - 12px)',
              left: position.endsWith('l') ? '20px' : position.endsWith('r') ? 'calc(100% - 44px)' : 'calc(50% - 12px)',
              boxShadow: '0 0 0 4px rgba(6, 182, 212, 0.2)',
            }}
          />
        )}

        {isMosaic && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
              opacity: 0.5,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: ACCENT }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const workspaceSidebar = (
    <>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveTab('text')}
          style={{
            flex: 1,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'text' ? '#f9fafb' : '#fff',
            border: activeTab === 'text' ? `2px solid ${ACCENT}` : '1px solid #e5e7eb',
            borderRadius: '4px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          {activeTab === 'text' && (
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: ACCENT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', fontFamily: 'serif' }}>A</span>
          <span style={{ fontSize: '0.9rem', color: '#555' }}>Placer du texte</span>
        </button>
        <button
          onClick={() => setActiveTab('image')}
          style={{
            flex: 1,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'image' ? '#f9fafb' : '#fff',
            border: activeTab === 'image' ? `2px solid ${ACCENT}` : '1px solid #e5e7eb',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: 0.7,
          }}
        >
          <ImageIcon size={36} color="#888" strokeWidth={1.5} />
          <span style={{ fontSize: '0.9rem', color: '#555' }}>Placer une image</span>
        </button>
      </div>

      {activeTab === 'text' && (
        <>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>Texte :</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>Format de texte :</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                gap: '4px',
                flexWrap: 'wrap',
              }}
            >
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
              <button onClick={() => setIsBold(!isBold)} style={{ background: isBold ? '#e2e8f0' : 'transparent', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                <Bold size={16} />
              </button>
              <button onClick={() => setIsItalic(!isItalic)} style={{ background: isItalic ? '#e2e8f0' : 'transparent', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                <Italic size={16} />
              </button>
              <button onClick={() => setIsUnderline(!isUnderline)} style={{ background: isUnderline ? '#e2e8f0' : 'transparent', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                <Underline size={16} />
              </button>
              <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 4px' }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px' }}>
                <span style={{ fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: textColor, textDecorationThickness: '3px' }}>A</span>
                <ChevronDown size={14} />
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>Position :</label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '60px',
                  height: '80px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gridTemplateRows: '1fr 1fr 1fr',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                }}
              >
                {renderGridCell('tl')} {renderGridCell('tc')} {renderGridCell('tr')}
                {renderGridCell('cl')} {renderGridCell('cc')} {renderGridCell('cr')}
                {renderGridCell('bl')} {renderGridCell('bc')} {renderGridCell('br')}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '10px' }}>
                <input type="checkbox" checked={isMosaic} onChange={(e) => setIsMosaic(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: ACCENT }} />
                <span style={{ fontSize: '0.9rem', color: '#444' }}>Mosaïque</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>Transparence :</label>
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
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>Rotation :</label>
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

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>Pages :</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem' }}>de la page</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={pageFrom}
                onChange={(e) => setPageFrom(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '60px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', outline: 'none' }}
              />
              <span style={{ fontSize: '0.9rem' }}>à</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={pageTo}
                onChange={(e) => setPageTo(Math.min(totalPages, parseInt(e.target.value) || totalPages))}
                style={{ width: '60px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#444', marginBottom: '8px' }}>Couche</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setLayer('above')}
                style={{
                  flex: 1,
                  padding: '15px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  background: layer === 'above' ? '#fffbfa' : '#f8fafc',
                  border: layer === 'above' ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Layers size={32} color={layer === 'above' ? ACCENT : '#94a3b8'} />
                <span style={{ fontSize: '0.8rem', color: layer === 'above' ? ACCENT : '#64748b', textAlign: 'center' }}>
                  Tout au long du
                  <br />
                  contenu PDF
                </span>
              </button>
              <button
                onClick={() => setLayer('below')}
                style={{
                  flex: 1,
                  padding: '15px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  background: layer === 'below' ? '#fffbfa' : '#f8fafc',
                  border: layer === 'below' ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <ArrowDownToLine size={32} color={layer === 'below' ? ACCENT : '#94a3b8'} />
                <span style={{ fontSize: '0.8rem', color: layer === 'below' ? ACCENT : '#64748b', textAlign: 'center' }}>
                  Au dessous du
                  <br />
                  contenu PDF
                </span>
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
    </>
  );

  return (
    <ToolLayout
      slug="add-watermark"
      phase={phase}
      file={file}
      isProcessing={isProcessing}
      progress={progress}
      resultUrl={resultUrl}
      error={error}
      onReset={reset}
      onDrop={handleDrop}
      workspacePreview={workspacePreview}
      workspaceSidebar={workspaceSidebar}
      processingLabel="Ajout du filigrane..."
      successMessage="Le filigrane a été ajouté !"
      successSubtitle="Votre document est prêt."
      actionLabel="Ajouter un filigrane"
      onAction={handleAddWatermark}
      seoSection={
        <section className="seo-content glass" style={{ margin: '4rem auto', maxWidth: '800px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Comment ajouter un filigrane sur un PDF</h2>
          <ol className="steps-list">
            <li>Sélectionnez votre fichier PDF ou glissez-déposez-le dans la zone ci-dessus.</li>
            <li>Personnalisez votre texte, sa taille, sa couleur et sa position dans l'espace de travail.</li>
            <li>Cliquez sur "Ajouter un filigrane" pour appliquer vos modifications.</li>
            <li>Le téléchargement de votre fichier sécurisé se lancera automatiquement.</li>
          </ol>
        </section>
      }
    />
  );
}
