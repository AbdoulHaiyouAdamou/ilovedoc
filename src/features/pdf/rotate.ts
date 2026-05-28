import { PDFDocument, degrees } from 'pdf-lib';

export type RotationDegrees = 0 | 90 | 180 | 270;

/**
 * Map of 0-based page indices to their desired rotation in degrees.
 * Only pages present in this map will be rotated.
 */
export type PageRotationMap = Record<number, RotationDegrees>;

export interface RotateOptions {
  onProgress?: (percent: number) => void;
}

/**
 * Rotate specific pages of a PDF according to the provided rotation map.
 * Each rotation value is ADDED to the page's current rotation.
 */
export async function rotatePDFPages(
  file: File,
  rotations: PageRotationMap,
  options?: RotateOptions
): Promise<Uint8Array> {
  const { onProgress } = options ?? {};

  if (onProgress) onProgress(5);

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  if (onProgress) onProgress(15);

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(uint8Array, { ignoreEncryption: true });
  } catch (loadError) {
    throw new Error(
      'Impossible de charger ce fichier PDF. Il est peut-être corrompu ou protégé.'
    );
  }

  if (onProgress) onProgress(30);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  const indicesToRotate = Object.keys(rotations).map(Number);

  if (indicesToRotate.length === 0) {
    throw new Error('Aucune rotation spécifiée.');
  }

  for (let i = 0; i < indicesToRotate.length; i++) {
    const pageIndex = indicesToRotate[i];

    if (pageIndex < 0 || pageIndex >= totalPages) continue;

    const page = pages[pageIndex];
    const currentRotation = page.getRotation().angle;
    const additionalRotation = rotations[pageIndex];
    const newRotation = ((currentRotation + additionalRotation) % 360) as RotationDegrees;

    page.setRotation(degrees(newRotation));

    if (onProgress) {
      const progress = 30 + Math.round(((i + 1) / indicesToRotate.length) * 50);
      onProgress(progress);
    }
  }

  if (onProgress) onProgress(85);

  // Set metadata
  pdfDoc.setTitle('Document modifié - iLoveDoc');
  pdfDoc.setCreator('iLoveDoc');
  pdfDoc.setProducer('iLoveDoc - https://ilovedoc.com');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const resultBytes = await pdfDoc.save();

  if (onProgress) onProgress(100);

  return resultBytes;
}

/**
 * Convenience helper: rotate ALL pages by the same amount.
 */
export async function rotateAllPages(
  file: File,
  degreesToRotate: RotationDegrees,
  options?: RotateOptions
): Promise<Uint8Array> {
  const { onProgress } = options ?? {};

  if (onProgress) onProgress(5);

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(uint8Array, { ignoreEncryption: true });
  } catch {
    throw new Error(
      'Impossible de charger ce fichier PDF. Il est peut-être corrompu ou protégé.'
    );
  }

  if (onProgress) onProgress(20);

  const totalPages = pdfDoc.getPageCount();
  const rotations: PageRotationMap = {};

  for (let i = 0; i < totalPages; i++) {
    rotations[i] = degreesToRotate;
  }

  // Re-create a file from the same buffer to avoid double-load overhead
  // Instead, just apply rotations directly here
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const currentRotation = page.getRotation().angle;
    const newRotation = ((currentRotation + degreesToRotate) % 360) as RotationDegrees;
    page.setRotation(degrees(newRotation));

    if (onProgress) {
      const progress = 20 + Math.round(((i + 1) / pages.length) * 60);
      onProgress(progress);
    }
  }

  if (onProgress) onProgress(85);

  pdfDoc.setTitle('Document modifié - iLoveDoc');
  pdfDoc.setCreator('iLoveDoc');
  pdfDoc.setProducer('iLoveDoc - https://ilovedoc.com');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const resultBytes = await pdfDoc.save();

  if (onProgress) onProgress(100);

  return resultBytes;
}
