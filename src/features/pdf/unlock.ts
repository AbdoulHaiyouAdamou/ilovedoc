import { PDFDocument } from 'pdf-lib';

export interface UnlockOptions {
  password?: string;
  onProgress?: (percent: number) => void;
}

export async function unlockPDF(file: File, options?: UnlockOptions): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Update progress
  if (options?.onProgress) {
    options.onProgress(20);
  }

  let pdfDoc: PDFDocument;
  
  try {
    // Attempt to load the document with the provided password (if any)
    pdfDoc = await PDFDocument.load(uint8Array, { 
      password: options?.password,
      ignoreEncryption: false, // We want it to fail if it's encrypted and no/wrong password is provided
    } as any);
  } catch (error: any) {
    // pdf-lib throws specific errors for encrypted documents
    if (error.message && (error.message.includes('encrypted') || error.message.includes('password'))) {
      throw new Error('PASSWORD_REQUIRED');
    }
    throw new Error('Impossible de lire ce PDF. Il est peut-être corrompu ou utilise un chiffrement non supporté.');
  }

  if (options?.onProgress) {
    options.onProgress(60);
  }

  // Set metadata
  pdfDoc.setTitle('Document déverrouillé - iLoveDoc');
  pdfDoc.setCreator('iLoveDoc');
  pdfDoc.setProducer('iLoveDoc - https://ilovedoc.com');
  pdfDoc.setModificationDate(new Date());

  if (options?.onProgress) {
    options.onProgress(80);
  }

  // Save the document. Since we are not providing a userPassword or ownerPassword here,
  // the resulting document will be unencrypted.
  const savedBytes = await pdfDoc.save();

  if (options?.onProgress) {
    options.onProgress(100);
  }

  return savedBytes;
}
