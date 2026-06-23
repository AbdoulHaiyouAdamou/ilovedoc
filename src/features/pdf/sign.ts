import { PDFDocument } from 'pdf-lib';

export interface SignOptions {
  signatureImageBase64: string;
  position: {
    x: number;
    y: number;
    page: number; // 0-indexed
    width: number;
    height: number;
  };
  onProgress?: (percent: number) => void;
}

export async function signPDF(file: File, options: SignOptions): Promise<Uint8Array> {
  const { signatureImageBase64, position, onProgress } = options;
  
  if (onProgress) onProgress(10);
  
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  if (onProgress) onProgress(30);
  
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(uint8Array, { ignoreEncryption: true });
  } catch (loadError) {
    throw new Error("Impossible de charger le document PDF.");
  }
  
  if (onProgress) onProgress(50);
  
  // Clean up the base64 string
  const base64Data = signatureImageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
  
  let signatureImage;
  if (signatureImageBase64.startsWith('data:image/png')) {
    signatureImage = await pdfDoc.embedPng(base64Data);
  } else {
    // Assume JPEG if not PNG
    signatureImage = await pdfDoc.embedJpg(base64Data);
  }
  
  if (onProgress) onProgress(70);

  const pages = pdfDoc.getPages();
  const targetPageIndex = Math.max(0, Math.min(position.page, pages.length - 1));
  const page = pages[targetPageIndex];
  
  // Draw the image
  page.drawImage(signatureImage, {
    x: position.x,
    y: position.y,
    width: position.width,
    height: position.height,
  });
  
  if (onProgress) onProgress(80);
  
  pdfDoc.setTitle('Document signé - iLoveDoc');
  pdfDoc.setCreator('iLoveDoc');
  pdfDoc.setProducer('iLoveDoc - https://ilove-doc.com');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());
  
  const savedPdf = await pdfDoc.save();
  
  if (onProgress) onProgress(100);
  
  return savedPdf;
}
