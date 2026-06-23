import { PDFDocument } from 'pdf-lib';

export interface MergeOptions {
  onProgress?: (percent: number) => void;
}

/**
 * Merges multiple PDF files into a single PDF document.
 * All processing happens client-side using pdf-lib.
 *
 * @param files - Array of PDF File objects to merge
 * @param options - Optional configuration (progress callback)
 * @returns Uint8Array of the merged PDF bytes
 */
export async function mergePDFs(
  files: File[],
  options?: MergeOptions
): Promise<Uint8Array> {
  const { onProgress } = options ?? {};

  if (files.length < 2) {
    throw new Error('Au moins 2 fichiers PDF sont requis pour la fusion.');
  }

  // Create a new PDF document for the merged result
  const mergedPdf = await PDFDocument.create();

  const totalFiles = files.length;
  let processedFiles = 0;

  for (const file of files) {
    try {
      // Read the file as an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Load the source PDF document
      let sourcePdf: PDFDocument;
      try {
        sourcePdf = await PDFDocument.load(uint8Array, {
          ignoreEncryption: true,
        });
      } catch (loadError) {
        // Check if it's a password-protected PDF
        const errorMessage =
          loadError instanceof Error ? loadError.message : String(loadError);

        if (
          errorMessage.includes('encrypted') ||
          errorMessage.includes('password')
        ) {
          throw new Error(
            `Le fichier "${file.name}" est protégé par un mot de passe. Veuillez le déverrouiller avant de le fusionner.`
          );
        }

        throw new Error(
          `Le fichier "${file.name}" est corrompu ou n'est pas un fichier PDF valide.`
        );
      }

      // Copy all pages from the source document
      const pageCount = sourcePdf.getPageCount();
      const copiedPages = await mergedPdf.copyPages(
        sourcePdf,
        Array.from({ length: pageCount }, (_, i) => i)
      );

      // Add each copied page to the merged document
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }

      processedFiles++;

      // Report progress
      if (onProgress) {
        const percent = Math.round((processedFiles / totalFiles) * 100);
        onProgress(percent);
      }
    } catch (error) {
      // Re-throw our custom errors, wrap unknown ones
      if (error instanceof Error && error.message.startsWith('Le fichier')) {
        throw error;
      }
      throw new Error(
        `Erreur lors du traitement de "${file.name}": ${
          error instanceof Error ? error.message : 'Erreur inconnue'
        }`
      );
    }
  }

  // Set merged PDF metadata
  mergedPdf.setTitle('Document fusionné - iLoveDoc');
  mergedPdf.setCreator('iLoveDoc');
  mergedPdf.setProducer('iLoveDoc - https://ilove-doc.com');
  mergedPdf.setCreationDate(new Date());
  mergedPdf.setModificationDate(new Date());

  // Serialize the merged PDF to bytes
  const mergedBytes = await mergedPdf.save();

  if (onProgress) {
    onProgress(100);
  }

  return mergedBytes;
}
