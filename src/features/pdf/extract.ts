import { PDFDocument } from 'pdf-lib';

export interface ExtractOptions {
  pagesToExtract: number[]; // 0-indexed page numbers to keep
  onProgress?: (percent: number) => void;
}

/**
 * Extracts selected pages from a PDF file, creating a new PDF
 * containing ONLY the specified pages.
 * This is the inverse of removePagesFromPDF — instead of removing
 * selected pages, we keep ONLY the selected ones.
 *
 * @param file - PDF File object
 * @param options - Configuration including pages to extract and progress callback
 * @returns Uint8Array of the new PDF bytes
 */
export async function extractPagesFromPDF(
  file: File,
  options: ExtractOptions
): Promise<Uint8Array> {
  const { pagesToExtract, onProgress } = options;

  if (pagesToExtract.length === 0) {
    throw new Error('Aucune page sélectionnée pour l\'extraction.');
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

  // Validate page indices and sort them to maintain original order
  const validPages = pagesToExtract
    .filter(p => p >= 0 && p < totalPages)
    .sort((a, b) => a - b);

  if (validPages.length === 0) {
    throw new Error('Aucune page valide sélectionnée pour l\'extraction.');
  }

  if (onProgress) onProgress(20);

  const resultPdf = await PDFDocument.create();

  if (onProgress) onProgress(30);

  const copiedPages = await resultPdf.copyPages(sourcePdf, validPages);

  if (onProgress) onProgress(60);

  for (const page of copiedPages) {
    resultPdf.addPage(page);
  }

  if (onProgress) onProgress(80);

  resultPdf.setTitle('Document modifié - iLoveDoc');
  resultPdf.setCreator('iLoveDoc');
  resultPdf.setProducer('iLoveDoc - https://ilove-doc.com');
  resultPdf.setCreationDate(new Date());
  resultPdf.setModificationDate(new Date());

  const extractedBytes = await resultPdf.save();

  if (onProgress) onProgress(100);

  return extractedBytes;
}
