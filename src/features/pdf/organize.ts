import { PDFDocument } from 'pdf-lib';

export interface OrganizeOptions {
  pageOrder: number[]; // 0-indexed page indices in the desired new order
  onProgress?: (percent: number) => void;
}

/**
 * Reorders the pages of a PDF file according to the specified order.
 * All processing happens client-side using pdf-lib.
 *
 * @param file - PDF File object
 * @param pageOrder - Array of 0-based page indices in the desired order
 *                    e.g. [2, 0, 1] means page 3 first, then page 1, then page 2
 * @param onProgress - Optional progress callback (0-100)
 * @returns Uint8Array of the reordered PDF bytes
 */
export async function reorderPDFPages(
  file: File,
  pageOrder: number[],
  onProgress?: (percent: number) => void
): Promise<Uint8Array> {
  if (pageOrder.length === 0) {
    throw new Error('Aucune page spécifiée pour la réorganisation.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  let sourcePdf: PDFDocument;
  try {
    sourcePdf = await PDFDocument.load(uint8Array, {
      ignoreEncryption: true,
    });
  } catch (loadError) {
    const errorMessage =
      loadError instanceof Error ? loadError.message : String(loadError);

    if (
      errorMessage.includes('encrypted') ||
      errorMessage.includes('password')
    ) {
      throw new Error(
        `Le fichier "${file.name}" est protégé par un mot de passe. Veuillez le déverrouiller.`
      );
    }

    throw new Error(
      `Le fichier "${file.name}" est corrompu ou n'est pas un fichier PDF valide.`
    );
  }

  const totalPages = sourcePdf.getPageCount();

  // Validate that all indices are within range
  for (const idx of pageOrder) {
    if (idx < 0 || idx >= totalPages) {
      throw new Error(
        `Index de page invalide : ${idx}. Le document contient ${totalPages} pages.`
      );
    }
  }

  if (onProgress) onProgress(20);

  const resultPdf = await PDFDocument.create();

  if (onProgress) onProgress(30);

  // Copy pages in the specified order
  const copiedPages = await resultPdf.copyPages(sourcePdf, pageOrder);

  if (onProgress) onProgress(60);

  for (const page of copiedPages) {
    resultPdf.addPage(page);
  }

  if (onProgress) onProgress(80);

  resultPdf.setTitle('Document réorganisé - iLoveDoc');
  resultPdf.setCreator('iLoveDoc');
  resultPdf.setProducer('iLoveDoc - https://ilove-doc.com');
  resultPdf.setCreationDate(new Date());
  resultPdf.setModificationDate(new Date());

  const reorderedBytes = await resultPdf.save();

  if (onProgress) onProgress(100);

  return reorderedBytes;
}
