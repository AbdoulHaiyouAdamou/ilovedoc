import { PDFDocument, PDFName, PDFRawStream, PDFDict } from 'pdf-lib';

/**
 * Detect and remove blank pages from a PDF.
 * A page is considered "blank" if it has no meaningful content streams
 * (very small content stream size and no images).
 */
export async function removeBlankPages(
  file: File,
  threshold: number = 200, // Bytes threshold for content stream
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; removedCount: number; totalPages: number }> {
  onProgress?.(10);

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  onProgress?.(20);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  const pagesToRemove: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    let isBlank = true;

    // Check content streams
    const contents = page.node.lookup(PDFName.of('Contents'));
    if (contents) {
      if (contents instanceof PDFRawStream) {
        const data = contents.getContents();
        // Check if the content stream has meaningful drawing operations
        const contentStr = new TextDecoder('latin1').decode(data);
        // A truly blank page has only whitespace, 'q'/'Q' operators, or very short stream
        const stripped = contentStr.replace(/\s+/g, '').replace(/[qQ]/g, '');
        if (stripped.length > threshold) {
          isBlank = false;
        }
      }
    }

    // Check for images in XObject resources
    if (isBlank) {
      const resources = page.node.lookup(PDFName.of('Resources'));
      if (resources && resources instanceof PDFDict) {
        const xObjects = resources.lookup(PDFName.of('XObject'));
        if (xObjects && xObjects instanceof PDFDict) {
          const entries = xObjects.entries();
          if (entries.length > 0) {
            isBlank = false;
          }
        }
      }
    }

    // Check for annotations (forms, links, etc.)
    if (isBlank) {
      const annots = page.node.lookup(PDFName.of('Annots'));
      if (annots) {
        isBlank = false;
      }
    }

    if (isBlank) {
      pagesToRemove.push(i);
    }

    onProgress?.(20 + Math.floor(((i + 1) / totalPages) * 50));
  }

  onProgress?.(75);

  // Remove pages in reverse order to maintain correct indices
  for (let i = pagesToRemove.length - 1; i >= 0; i--) {
    pdfDoc.removePage(pagesToRemove[i]);
  }

  // Ensure we don't create an empty document
  if (pdfDoc.getPageCount() === 0) {
    pdfDoc.addPage();
  }

  onProgress?.(90);
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100);

  return {
    blob: new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }),
    removedCount: pagesToRemove.length,
    totalPages,
  };
}
