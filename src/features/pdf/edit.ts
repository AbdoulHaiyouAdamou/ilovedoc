import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PDFAnnotation {
  type: 'text' | 'image';
  pageIndex: number;
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  color?: string; // Hex color e.g. '#7c3aed'
  imageDataUrl?: string; // base64 data url
  imageWidth?: number;
  imageHeight?: number;
}

// Convert Hex string color e.g. "#7c3aed" to RGB values between 0 and 1
function hexToRgb(hexColor?: string): { r: number; g: number; b: number } {
  if (!hexColor) return { r: 0, g: 0, b: 0 };
  const cleanHex = hexColor.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
  return {
    r: isNaN(r) ? 0 : r,
    g: isNaN(g) ? 0 : g,
    b: isNaN(b) ? 0 : b,
  };
}

export async function applyEditAnnotations(
  file: File,
  annotations: PDFAnnotation[],
  onProgress?: (percent: number) => void
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  if (onProgress) onProgress(20);

  for (let i = 0; i < annotations.length; i++) {
    const ann = annotations[i];
    if (ann.pageIndex < 0 || ann.pageIndex >= pages.length) continue;
    const page = pages[ann.pageIndex];

    if (onProgress) {
      onProgress(20 + Math.round((i / annotations.length) * 70));
    }

    if (ann.type === 'text' && ann.text) {
      const { r, g, b } = hexToRgb(ann.color);
      page.drawText(ann.text, {
        x: ann.x,
        y: ann.y,
        size: ann.fontSize || 12,
        font: helveticaFont,
        color: rgb(r, g, b),
      });
    } else if (ann.type === 'image' && ann.imageDataUrl) {
      try {
        const base64Data = ann.imageDataUrl.split(',')[1];
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        let embeddedImage;
        if (ann.imageDataUrl.includes('image/png')) {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        }

        page.drawImage(embeddedImage, {
          x: ann.x,
          y: ann.y,
          width: ann.imageWidth || 100,
          height: ann.imageHeight || 100,
        });
      } catch (err) {
        console.error("Failed to embed image annotation:", err);
      }
    }
  }

  if (onProgress) onProgress(100);
  return await pdfDoc.save();
}
