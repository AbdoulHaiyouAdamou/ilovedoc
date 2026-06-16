import { PDFDocument, PDFName, PDFDict, PDFRef } from 'pdf-lib';

/**
 * Remove all embedded images from a PDF document.
 * Replaces Image XObject references with empty streams.
 */
export async function removeImagesFromPdf(
  file: File,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  onProgress?.(10);

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  onProgress?.(30);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let p = 0; p < totalPages; p++) {
    const page = pages[p];
    const resources = page.node.lookup(PDFName.of('Resources'));
    if (!resources || !(resources instanceof PDFDict)) continue;

    const xObjects = resources.lookup(PDFName.of('XObject'));
    if (!xObjects || !(xObjects instanceof PDFDict)) continue;

    const entries = xObjects.entries();
    const keysToRemove: PDFName[] = [];

    for (const [name, ref] of entries) {
      const xObject = pdfDoc.context.lookup(ref);
      if (!xObject) continue;

      let dict: PDFDict | undefined;
      if ('dict' in (xObject as any)) {
        dict = (xObject as any).dict as PDFDict;
      } else if (xObject instanceof PDFDict) {
        dict = xObject;
      }

      if (!dict) continue;

      const subtype = dict.lookup(PDFName.of('Subtype'));
      if (subtype && subtype.toString() === '/Image') {
        keysToRemove.push(name);
      }
    }

    // Remove the image XObject entries
    for (const key of keysToRemove) {
      xObjects.delete(key);
    }

    onProgress?.(30 + Math.floor(((p + 1) / totalPages) * 50));
  }

  onProgress?.(85);
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100);

  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
