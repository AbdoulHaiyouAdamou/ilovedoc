import { PDFDocument, rgb } from 'pdf-lib';

export interface RedactionRect {
  pageIndex: number;
  x: number;      // 0 to 1 (left)
  y: number;      // 0 to 1 (top)
  width: number;  // 0 to 1
  height: number; // 0 to 1
}

export interface RedactOptions {
  redactions: RedactionRect[];
  color?: 'black' | 'red' | 'white';
  onProgress?: (progress: number) => void;
}

export async function redactPDF(
  file: File,
  options: RedactOptions
): Promise<Uint8Array> {
  const { redactions, color = 'black', onProgress } = options;
  if (onProgress) onProgress(10);

  const arrayBuffer = await file.arrayBuffer();
  if (onProgress) onProgress(30);

  const pdfDoc = await PDFDocument.load(arrayBuffer);
  if (onProgress) onProgress(50);

  const pages = pdfDoc.getPages();

  // Map color names to pdf-lib rgb colors
  let pdfColor = rgb(0, 0, 0); // black
  if (color === 'red') {
    pdfColor = rgb(1, 0, 0);
  } else if (color === 'white') {
    pdfColor = rgb(1, 1, 1);
  }

  // Draw redaction boxes page by page
  redactions.forEach((rect, idx) => {
    if (rect.pageIndex < 0 || rect.pageIndex >= pages.length) return;
    
    const page = pages[rect.pageIndex];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Map screen coordinates (0-1, top-left origin) to pdf-lib coordinates (bottom-left origin)
    const x = rect.x * pageWidth;
    const width = rect.width * pageWidth;
    const height = rect.height * pageHeight;
    const y = (1 - rect.y - rect.height) * pageHeight;

    page.drawRectangle({
      x,
      y,
      width,
      height,
      color: pdfColor,
    });
  });

  if (onProgress) onProgress(80);

  const bytes = await pdfDoc.save();
  if (onProgress) onProgress(100);

  return bytes;
}
