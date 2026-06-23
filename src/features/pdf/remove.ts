import { PDFDocument } from 'pdf-lib';

export interface RemoveOptions {
  pagesToRemove: number[]; // 0-indexed page numbers to remove
  onProgress?: (percent: number) => void;
}

/**
 * Removes selected pages from a PDF file.
 * All processing happens client-side using pdf-lib.
 *
 * @param file - PDF File object
 * @param options - Configuration including pages to remove and progress callback
 * @returns Uint8Array of the modified PDF bytes
 */
export async function removePagesFromPDF(
  file: File,
  options: RemoveOptions
): Promise<Uint8Array> {
  const { pagesToRemove, onProgress } = options;

  if (pagesToRemove.length === 0) {
    throw new Error('Aucune page sélectionnée pour la suppression.');
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
  
  // To remove pages, we copy the pages we WANT to keep to a new document
  const pagesToKeep = [];
  for (let i = 0; i < totalPages; i++) {
    if (!pagesToRemove.includes(i)) {
      pagesToKeep.push(i);
    }
  }

  if (pagesToKeep.length === 0) {
    throw new Error('Vous ne pouvez pas supprimer toutes les pages du document.');
  }

  const resultPdf = await PDFDocument.create();
  
  if (onProgress) onProgress(30);

  const copiedPages = await resultPdf.copyPages(sourcePdf, pagesToKeep);
  
  if (onProgress) onProgress(60);

  for (const page of copiedPages) {
    resultPdf.addPage(page);
  }

  if (onProgress) onProgress(80);

  resultPdf.setTitle(`Document modifié - iLoveDoc`);
  resultPdf.setCreator('iLoveDoc');
  resultPdf.setProducer('iLoveDoc - https://ilove-doc.com');
  resultPdf.setCreationDate(new Date());
  resultPdf.setModificationDate(new Date());

  const modifiedBytes = await resultPdf.save();

  if (onProgress) onProgress(100);

  return modifiedBytes;
}
