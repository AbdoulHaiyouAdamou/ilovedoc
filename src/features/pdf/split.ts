import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export interface SplitInterval {
  id: string;
  start: number; // 1-indexed
  end: number;   // 1-indexed
}

export async function splitPDFAdvanced(
  file: File,
  intervals: SplitInterval[],
  mergeIntervals: boolean,
  options?: { onProgress?: (progress: number) => void }
): Promise<{ blob: Blob; isZip: boolean }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  if (mergeIntervals || intervals.length === 1) {
    // Merge all specified intervals into a SINGLE PDF (or just output the single interval)
    const newPdf = await PDFDocument.create();
    
    // Collect all page indices to copy
    const pagesToCopy: number[] = [];
    for (const interval of intervals) {
      const start = Math.max(1, interval.start);
      const end = Math.min(totalPages, interval.end);
      for (let i = start; i <= end; i++) {
        pagesToCopy.push(i - 1); // 0-indexed
      }
    }
    
    if (pagesToCopy.length === 0) throw new Error("Aucune page sélectionnée.");
    
    if (options?.onProgress) options.onProgress(30);

    const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
    copiedPages.forEach((page) => newPdf.addPage(page));
    
    if (options?.onProgress) options.onProgress(70);
    
    const pdfBytes = await newPdf.save();
    
    if (options?.onProgress) options.onProgress(100);
    
    return { blob: new Blob([pdfBytes as any], { type: 'application/pdf' }), isZip: false };
  } else {
    // Generate a ZIP containing one PDF PER interval
    const zip = new JSZip();
    const baseName = file.name.replace(/\.pdf$/i, '');
    
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const start = Math.max(1, interval.start);
      const end = Math.min(totalPages, interval.end);
      
      const newPdf = await PDFDocument.create();
      const pagesToCopy: number[] = [];
      for (let p = start; p <= end; p++) {
        pagesToCopy.push(p - 1);
      }
      
      if (pagesToCopy.length > 0) {
        const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();
        
        // Name: file_1-5.pdf or file_3.pdf
        const fileName = start === end ? `${baseName}_${start}.pdf` : `${baseName}_${start}-${end}.pdf`;
        zip.file(fileName, pdfBytes);
      }
      
      if (options?.onProgress) {
        options.onProgress(Math.round(((i + 1) / intervals.length) * 50));
      }
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' }, (metadata) => {
      if (options?.onProgress) options.onProgress(50 + Math.round(metadata.percent / 2));
    });
    
    return { blob: zipBlob, isZip: true };
  }
}

export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdfDoc.getPageCount();
}
