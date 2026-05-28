import { PDFDocument } from 'pdf-lib';

export interface RepairOptions {
  onProgress?: (percent: number) => void;
}

export async function repairPDF(file: File, options?: RepairOptions): Promise<Uint8Array> {
  if (options?.onProgress) options.onProgress(10);
  
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  if (options?.onProgress) options.onProgress(30);

  // Load the PDF, ignoring encryption and invalid objects
  // This often helps to recover corrupted PDFs by reading past errors
  const sourcePdf = await PDFDocument.load(uint8Array, { 
    ignoreEncryption: true,
    throwOnInvalidObject: false
  });
  
  if (options?.onProgress) options.onProgress(70);

  // Save the document to rebuild the XRef table and fix broken structure
  sourcePdf.setTitle('Document réparé - iLoveDoc');
  sourcePdf.setCreator('iLoveDoc');
  sourcePdf.setProducer('iLoveDoc - https://ilovedoc.com');
  sourcePdf.setCreationDate(new Date());
  sourcePdf.setModificationDate(new Date());
  
  const savedPdf = await sourcePdf.save();
  
  if (options?.onProgress) options.onProgress(100);
  
  return savedPdf;
}
