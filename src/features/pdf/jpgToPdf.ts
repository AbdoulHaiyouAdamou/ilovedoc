import { PDFDocument, PageSizes } from 'pdf-lib';

export interface ImagesToPdfOptions {
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'letter' | 'fit';
  margin: 'none' | 'small' | 'big';
  onProgress?: (percent: number) => void;
}

/**
 * Converts multiple JPG/PNG images into a single PDF document.
 */
export async function imagesToPdf(
  files: File[],
  options: ImagesToPdfOptions
): Promise<Uint8Array> {
  const { orientation, pageSize, margin, onProgress } = options;

  if (files.length === 0) {
    throw new Error('Au moins 1 image est requise pour la conversion.');
  }

  const pdfDoc = await PDFDocument.create();
  const totalFiles = files.length;
  let processedFiles = 0;

  // Determine margin size in points (1 pt = 1/72 inch)
  let marginSize = 0;
  if (margin === 'small') marginSize = 20;
  else if (margin === 'big') marginSize = 50;

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      let image;
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(uint8Array);
      } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(uint8Array);
      } else {
        throw new Error(`Format d'image non supporté: ${file.type}`);
      }

      const imageDims = image.scale(1);
      let pageWidth, pageHeight;

      if (pageSize === 'fit') {
        pageWidth = imageDims.width + marginSize * 2;
        pageHeight = imageDims.height + marginSize * 2;
      } else {
        const size = pageSize === 'letter' ? PageSizes.Letter : PageSizes.A4;
        pageWidth = orientation === 'landscape' ? size[1] : size[0];
        pageHeight = orientation === 'landscape' ? size[0] : size[1];
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const availableWidth = pageWidth - marginSize * 2;
      const availableHeight = pageHeight - marginSize * 2;

      // Calculate scale to fit image within available area
      const scaleX = availableWidth / imageDims.width;
      const scaleY = availableHeight / imageDims.height;
      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = imageDims.width * scale;
      const scaledHeight = imageDims.height * scale;

      // Center the image
      const x = marginSize + (availableWidth - scaledWidth) / 2;
      const y = marginSize + (availableHeight - scaledHeight) / 2;

      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });

      processedFiles++;

      if (onProgress) {
        const percent = Math.round((processedFiles / totalFiles) * 100);
        onProgress(percent);
      }
    } catch (error) {
      throw new Error(
        `Erreur lors du traitement de "${file.name}": ${
          error instanceof Error ? error.message : 'Erreur inconnue'
        }`
      );
    }
  }

  pdfDoc.setTitle('Images en PDF - iLoveDoc');
  pdfDoc.setCreator('iLoveDoc');
  pdfDoc.setProducer('iLoveDoc - https://ilovedoc.com');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const pdfBytes = await pdfDoc.save();

  if (onProgress) {
    onProgress(100);
  }

  return pdfBytes;
}
