import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export interface WatermarkOptions {
  text: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  textColor: string; // hex string e.g. "#000000"
  fontSize: number;
  opacity: number;
  rotation: number;
  position: 'tl'|'tc'|'tr'|'cl'|'cc'|'cr'|'bl'|'bc'|'br';
  isMosaic: boolean;
  pageRange: { from: number; to: number };
  layer: 'above' | 'below';
  onProgress?: (percent: number) => void;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [0, 0, 0];
}

function getFontName(family: string, bold: boolean, italic: boolean) {
  let name = StandardFonts.Helvetica;
  if (family === 'Times New Roman') {
    if (bold && italic) name = StandardFonts.TimesRomanBoldItalic;
    else if (bold) name = StandardFonts.TimesRomanBold;
    else if (italic) name = StandardFonts.TimesRomanItalic;
    else name = StandardFonts.TimesRoman;
  } else if (family === 'Courier New') {
    if (bold && italic) name = StandardFonts.CourierBoldOblique;
    else if (bold) name = StandardFonts.CourierBold;
    else if (italic) name = StandardFonts.CourierOblique;
    else name = StandardFonts.Courier;
  } else {
    // Arial / Helvetica
    if (bold && italic) name = StandardFonts.HelveticaBoldOblique;
    else if (bold) name = StandardFonts.HelveticaBold;
    else if (italic) name = StandardFonts.HelveticaOblique;
    else name = StandardFonts.Helvetica;
  }
  return name;
}

export async function addWatermarkToPDF(file: File, options: WatermarkOptions): Promise<Blob> {
  const { 
    text, fontSize, opacity, rotation, position, isMosaic, 
    pageRange, textColor, fontFamily, isBold, isItalic, onProgress 
  } = options;
  
  if (onProgress) onProgress(10);

  const arrayBuffer = await file.arrayBuffer();
  
  if (onProgress) onProgress(30);

  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const fontName = getFontName(fontFamily, isBold, isItalic);
  const font = await pdfDoc.embedFont(fontName);
  
  if (onProgress) onProgress(50);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  
  const colorArray = hexToRgb(textColor);
  const color = rgb(colorArray[0], colorArray[1], colorArray[2]);

  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const textHeight = font.heightAtSize(fontSize);
  const theta = rotation * Math.PI / 180;

  for (let i = 0; i < totalPages; i++) {
    // Respect page range (1-indexed)
    if (i + 1 < pageRange.from || i + 1 > pageRange.to) continue;

    const page = pages[i];
    const { width, height } = page.getSize();
    
    // Calculate center points to draw
    let centers: {cx: number, cy: number}[] = [];

    if (isMosaic) {
      // 2 columns, 3 rows for mosaic
      centers = [
        { cx: width * 0.25, cy: height * 0.83 },
        { cx: width * 0.75, cy: height * 0.83 },
        { cx: width * 0.25, cy: height * 0.5 },
        { cx: width * 0.75, cy: height * 0.5 },
        { cx: width * 0.25, cy: height * 0.17 },
        { cx: width * 0.75, cy: height * 0.17 }
      ];
    } else {
      const margin = 50;
      let cx = width / 2;
      let cy = height / 2;

      // X alignment
      if (position.endsWith('l')) cx = Math.max(textWidth / 2, margin);
      if (position.endsWith('r')) cx = Math.min(width - textWidth / 2, width - margin);
      
      // Y alignment
      if (position.startsWith('t')) cy = Math.min(height - textHeight / 2, height - margin);
      if (position.startsWith('b')) cy = Math.max(textHeight / 2, margin);

      centers = [{ cx, cy }];
    }

    for (const { cx, cy } of centers) {
      // Calculate origin (x,y) from center (cx,cy) taking rotation into account
      // The origin is bottom-left of the text bounding box.
      const dx = -textWidth / 2;
      const dy = -textHeight / 2;
      
      // Rotate offset
      const rx = dx * Math.cos(theta) - dy * Math.sin(theta);
      const ry = dx * Math.sin(theta) + dy * Math.cos(theta);
      
      const x = cx + rx;
      const y = cy + ry;

      page.drawText(text, {
        x, y,
        size: fontSize,
        font: font,
        color: color,
        opacity: opacity,
        rotate: degrees(rotation),
      });
    }
    
    if (onProgress) {
      onProgress(50 + Math.floor(((i + 1) / totalPages) * 30));
    }
  }
  
  if (onProgress) onProgress(85);

  const pdfBytes = await pdfDoc.save();
  
  if (onProgress) onProgress(100);

  return new Blob([pdfBytes as any], { type: 'application/pdf' });
}
