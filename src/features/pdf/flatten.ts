import { PDFDocument } from 'pdf-lib';

export interface FlattenOptions {
  onProgress?: (percent: number) => void;
}

export async function flattenPDF(
  file: File,
  options?: FlattenOptions
): Promise<Uint8Array> {
  const { onProgress } = options ?? {};

  if (onProgress) onProgress(10);

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  if (onProgress) onProgress(30);

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(uint8Array, { ignoreEncryption: true });
  } catch (loadError) {
    throw new Error(
      'Impossible de charger ce fichier PDF. Il est peut-être corrompu ou protégé.'
    );
  }

  if (onProgress) onProgress(50);

  const form = pdfDoc.getForm();
  form.flatten();

  if (onProgress) onProgress(80);

  pdfDoc.setTitle('Document aplati - iLoveDoc');
  pdfDoc.setCreator('iLoveDoc');
  pdfDoc.setProducer('iLoveDoc - https://ilovedoc.com');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const resultBytes = await pdfDoc.save();

  if (onProgress) onProgress(100);

  return resultBytes;
}
