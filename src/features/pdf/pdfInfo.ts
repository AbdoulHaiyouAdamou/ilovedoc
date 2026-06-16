import { PDFDocument } from 'pdf-lib';

export interface PdfInfo {
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  pageCount: number;
  pdfVersion: string;
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
  isEncrypted: boolean;
  pageWidthPt: number;
  pageHeightPt: number;
  pageWidthMm: string;
  pageHeightMm: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 octets';
  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getPdfInfo(file: File): Promise<PdfInfo> {
  const arrayBuffer = await file.arrayBuffer();

  let isEncrypted = false;
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(arrayBuffer);
  } catch {
    // If loading fails, try with ignoreEncryption
    pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    isEncrypted = true;
  }

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage ? firstPage.getSize() : { width: 0, height: 0 };

  // Convert points to mm (1pt = 0.3528mm)
  const ptToMm = 0.3528;

  const creationDate = pdfDoc.getCreationDate();
  const modDate = pdfDoc.getModificationDate();

  // Try to get PDF version from raw bytes
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 20));
  const headerStr = new TextDecoder('ascii').decode(headerBytes);
  const versionMatch = headerStr.match(/%PDF-(\d+\.\d+)/);

  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    fileSizeFormatted: formatBytes(file.size),
    pageCount: pages.length,
    pdfVersion: versionMatch ? versionMatch[1] : 'Inconnu',
    title: pdfDoc.getTitle() ?? '',
    author: pdfDoc.getAuthor() ?? '',
    subject: pdfDoc.getSubject() ?? '',
    keywords: pdfDoc.getKeywords() ?? '',
    creator: pdfDoc.getCreator() ?? '',
    producer: pdfDoc.getProducer() ?? '',
    creationDate: creationDate ? creationDate.toLocaleString('fr-FR') : '',
    modificationDate: modDate ? modDate.toLocaleString('fr-FR') : '',
    isEncrypted,
    pageWidthPt: Math.round(width),
    pageHeightPt: Math.round(height),
    pageWidthMm: (width * ptToMm).toFixed(1),
    pageHeightMm: (height * ptToMm).toFixed(1),
  };
}
