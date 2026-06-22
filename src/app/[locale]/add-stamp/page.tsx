'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { addStampToPdf, StampOptions } from '@/features/pdf/stamp';
import { Stamp, FileText } from 'lucide-react';
import { ToolLayout, useToolState } from '@/components/tools';

const TOOL_COLOR = '#f59e0b';

export default function AddStampPage() {
  const tTools = useTranslations('Tools');
  const tCommon = useTranslations('Common');
  const {
    file, isProcessing, progress, resultUrl, error, phase,
    onDrop, reset, startProcessing, finishProcessing, failProcessing, setProgress,
  } = useToolState();

  const [stampText, setStampText] = useState('CONFIDENTIEL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [textColor, setTextColor] = useState('#ff0000');
  const [position, setPosition] = useState<StampOptions['position']>('cc');
  const [stampImage, setStampImage] = useState<File | null>(null);
  const [useImage, setUseImage] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    startProcessing();
    try {
      const blob = await addStampToPdf(file, {
        text: stampText, fontSize, fontFamily: 'Arial', isBold: true, isItalic: false,
        textColor, opacity, rotation, position,
        pageRange: { from: 1, to: 9999 },
        stampImage: useImage ? stampImage : null,
        onProgress: setProgress,
      });
      const url = URL.createObjectURL(blob);
      finishProcessing(url);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '_stamped.pdf');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err: unknown) {
      failProcessing(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  }, [file, stampText, fontSize, textColor, opacity, rotation, position, useImage, stampImage, startProcessing, finishProcessing, failProcessing, setProgress]);

  const positions = [
    { value: 'tl', label: '↖' }, { value: 'tc', label: '↑' }, { value: 'tr', label: '↗' },
    { value: 'cl', label: '←' }, { value: 'cc', label: '•' }, { value: 'cr', label: '→' },
    { value: 'bl', label: '↙' }, { value: 'bc', label: '↓' }, { value: 'br', label: '↘' },
  ];

  const workspacePreview = file && (
    <div className="pdf-page-card" style={{ width: 300, height: 420, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
      <div className="pdf-page-header" style={{ backgroundColor: TOOL_COLOR }}>{file.name}</div>
      <div className="pdf-page-content" style={{
        display: 'flex',
        alignItems: position.startsWith('t') ? 'flex-start' : position.startsWith('b') ? 'flex-end' : 'center',
        justifyContent: position.endsWith('l') ? 'flex-start' : position.endsWith('r') ? 'flex-end' : 'center',
        height: '100%', position: 'relative', padding: '1rem'
      }}>
        {useImage && stampImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={URL.createObjectURL(stampImage)} alt="stamp" style={{ maxWidth: '50%', opacity, transform: `rotate(${rotation}deg)` }} />
        ) : (
          <span style={{ fontSize: fontSize * 0.4, fontWeight: 'bold', color: textColor, opacity, transform: `rotate(${rotation}deg)`, textAlign: 'center' }}>{stampText}</span>
        )}
      </div>
    </div>
  );

  const workspaceSidebar = (
    <>
      <div style={{ display: 'flex', background: 'var(--glass-bg)', borderRadius: 8, padding: 4 }}>
        <button onClick={() => setUseImage(false)} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', background: !useImage ? TOOL_COLOR : 'transparent', color: !useImage ? 'white' : 'var(--text-color)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>Texte</button>
        <button onClick={() => setUseImage(true)} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', background: useImage ? TOOL_COLOR : 'transparent', color: useImage ? 'white' : 'var(--text-color)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>Image</button>
      </div>
      {!useImage ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Texte du tampon</label>
            <input type="text" value={stampText} onChange={e => setStampText(e.target.value)}
              style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Taille</label>
              <input type="number" min={8} max={200} value={fontSize} onChange={e => setFontSize(+e.target.value)}
                style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Couleur</label>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid var(--glass-border)', cursor: 'pointer' }} />
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Image du tampon (PNG/JPG)</label>
          <input type="file" accept="image/png, image/jpeg" onChange={e => e.target.files && setStampImage(e.target.files[0])}
            style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '0.8rem' }} />
          {stampImage && <p style={{ fontSize: '0.8rem', color: TOOL_COLOR, fontWeight: 'bold' }}>Image sélectionnée : {stampImage.name}</p>}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Opacité: {Math.round(opacity * 100)}%</label>
        <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={e => setOpacity(+e.target.value)} style={{ accentColor: TOOL_COLOR }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Rotation: {rotation}°</label>
        <input type="range" min={-180} max={180} step={5} value={rotation} onChange={e => setRotation(+e.target.value)} style={{ accentColor: TOOL_COLOR }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Position</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {positions.map(p => (
            <button key={p.value} onClick={() => setPosition(p.value as StampOptions['position'])}
              style={{ padding: '0.5rem', borderRadius: 6, border: position === p.value ? `2px solid ${TOOL_COLOR}` : '1px solid var(--glass-border)', background: position === p.value ? `${TOOL_COLOR}22` : 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      slug="add-stamp"
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
      processingLabel="Application du tampon..."
      successMessage="🎉 Tampon ajouté !"
      successSubtitle="Votre document est prêt."
      actionLabel="Appliquer le tampon"
      onAction={handleSubmit}
      seoSection={
        <div style={{ margin: '4rem auto', textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Gérez vos PDF facilement</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
            Nos outils vous permettent de manipuler vos documents PDF en toute sécurité, directement dans votre navigateur. Aucune donnée n&apos;est envoyée sur nos serveurs.
          </p>
        </div>
      }
    />
  );
}
