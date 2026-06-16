import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export interface StampOptions {
  text: string;
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  textColor: string;
  opacity: number;
  rotation: number;
  position: 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br';
  pageRange: { from: number; to: number };
  stampImage?: File | null; // optional image stamp
  onProgress?: (percent: number) => void;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [0, 0, 0];
}

function getFontName(family: string, bold: boolean, italic: boolean) {
  if (family === 'Times New Roman') {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (family === 'Courier New') {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }
  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

function getPositionCoords(
  position: StampOptions['position'],
  pageWidth: number,
  pageHeight: number,
  objWidth: number,
  objHeight: number,
  margin: number = 40
): { x: number; y: number } {
  let x = pageWidth / 2 - objWidth / 2;
  let y = pageHeight / 2 - objHeight / 2;

  if (position.endsWith('l')) x = margin;
  if (position.endsWith('r')) x = pageWidth - objWidth - margin;
  if (position.startsWith('t')) y = pageHeight - objHeight - margin;
  if (position.startsWith('b')) y = margin;

  return { x, y };
}

export async function addStampToPdf(file: File, options: StampOptions): Promise<Blob> {
  const { text, fontSize, opacity, rotation, position, pageRange, stampImage, onProgress } = options;

  onProgress?.(10);

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  onProgress?.(30);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  // If an image stamp is provided
  if (stampImage) {
    const imgBuffer = await stampImage.arrayBuffer();
    const imgType = stampImage.type;
    let embeddedImg;
    if (imgType === 'image/png') {
      embeddedImg = await pdfDoc.embedPng(imgBuffer);
    } else {
      embeddedImg = await pdfDoc.embedJpg(imgBuffer);
    }

    const imgDims = embeddedImg.scale(0.5); // Scale to 50% by default

    for (let i = 0; i < totalPages; i++) {
      if (i + 1 < pageRange.from || i + 1 > pageRange.to) continue;
      const page = pages[i];
      const { width, height } = page.getSize();
      const { x, y } = getPositionCoords(position, width, height, imgDims.width, imgDims.height);

      page.drawImage(embeddedImg, {
        x,
        y,
        width: imgDims.width,
        height: imgDims.height,
        opacity,
        rotate: degrees(rotation),
      });

      onProgress?.(30 + Math.floor(((i + 1) / totalPages) * 50));
    }
  } else {
    // Text stamp
    const fontName = getFontName(options.fontFamily, options.isBold, options.isItalic);
    const font = await pdfDoc.embedFont(fontName);
    const [r, g, b] = hexToRgb(options.textColor);
    const color = rgb(r, g, b);

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    for (let i = 0; i < totalPages; i++) {
      if (i + 1 < pageRange.from || i + 1 > pageRange.to) continue;
      const page = pages[i];
      const { width, height } = page.getSize();
      const { x, y } = getPositionCoords(position, width, height, textWidth, textHeight);

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color,
        opacity,
        rotate: degrees(rotation),
      });

      onProgress?.(30 + Math.floor(((i + 1) / totalPages) * 50));
    }
  }

  onProgress?.(85);
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100);

  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
