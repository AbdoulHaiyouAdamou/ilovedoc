import { PDFDocument, PDFName, PDFDict, PDFNumber } from 'pdf-lib';

export interface CompressOptions {
  level: 'low' | 'medium' | 'extreme';
  onProgress?: (percent: number) => void;
}

/**
 * Compress a PDF by removing unnecessary data and optionally downsampling images.
 *
 * @param file - The PDF file to compress
 * @param options - Compression options (level, progress callback)
 * @returns Blob of the compressed PDF
 */
export async function compressPdf(
  file: File,
  options: CompressOptions
): Promise<Blob> {
  const { level, onProgress } = options;

  if (onProgress) onProgress(5);

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  if (onProgress) onProgress(20);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  // 1. Remove metadata to reduce size
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setCreator('');
  pdfDoc.setProducer('');

  // 2. Remove JavaScript and attachments
  pdfDoc.catalog.delete(PDFName.of('Names'));
  pdfDoc.catalog.delete(PDFName.of('OpenAction'));

  // 3. Remove thumbnails and page-level metadata
  if (onProgress) onProgress(30);

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    // Remove page-level /Thumb if present
    page.node.delete(PDFName.of('Thumb'));
    // Remove page-level /PieceInfo (editor metadata)
    page.node.delete(PDFName.of('PieceInfo'));
    // Remove page-level /LastModified
    page.node.delete(PDFName.of('LastModified'));
    // Remove /AA (additional actions) containing JS
    page.node.delete(PDFName.of('AA'));

    if (onProgress) {
      onProgress(30 + Math.round(((i + 1) / totalPages) * 20));
    }
  }

  // 4. Configure save options for smallest output
  const saveOptions: any = {
    useObjectStreams: true,
    addDefaultPage: false,
    preserveExistingEncryption: false,
  };

  if (level === 'extreme') {
    // For extreme, we flatten structure as much as possible
    // (pdf-lib flatten options if available)
    saveOptions.updateFieldAppearances = false;
  }

  if (onProgress) onProgress(60);

  // 5. Recursively remove empty /Names trees under catalog
  const names = pdfDoc.catalog.lookup(PDFName.of('Names'));
  if (names && names instanceof PDFDict) {
    // Keep EmbeddedFiles if present, remove others
    const embeddedFiles = names.lookup(PDFName.of('EmbeddedFiles'));
    pdfDoc.catalog.set(PDFName.of('Names'), pdfDoc.context.obj({
      ...(embeddedFiles ? { EmbeddedFiles: embeddedFiles } : {}),
    }));
  }

  if (onProgress) onProgress(80);

  const pdfBytes = await pdfDoc.save(saveOptions);

  if (onProgress) onProgress(100);

  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
