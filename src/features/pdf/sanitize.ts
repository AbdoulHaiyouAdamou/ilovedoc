import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef } from 'pdf-lib';

export interface SanitizeOptions {
  removeJavaScript: boolean;
  removeLinks: boolean;
  removeMetadata: boolean;
  removeAttachments: boolean;
}

/**
 * Sanitize a PDF by removing potentially dangerous elements.
 * Inspired by Stirling-PDF's Sanitize tool.
 */
export async function sanitizePdf(
  file: File,
  options: SanitizeOptions,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  onProgress?.(10);

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const context = pdfDoc.context;

  onProgress?.(25);

  // 1. Remove metadata
  if (options.removeMetadata) {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator('');
    pdfDoc.setProducer('iLoveDoc');

    // Remove XMP metadata from catalog
    const catalog = pdfDoc.catalog;
    catalog.delete(PDFName.of('Metadata'));
  }

  onProgress?.(40);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let p = 0; p < totalPages; p++) {
    const page = pages[p];

    // 2. Remove JavaScript actions from pages
    if (options.removeJavaScript) {
      page.node.delete(PDFName.of('AA')); // Additional Actions
      
      // Remove OpenAction from catalog (document-level JS)
      if (p === 0) {
        pdfDoc.catalog.delete(PDFName.of('OpenAction'));
        pdfDoc.catalog.delete(PDFName.of('Names')); // Removes JS name tree too
      }
    }

    // 3. Remove links/annotations
    if (options.removeLinks) {
      const annots = page.node.lookup(PDFName.of('Annots'));
      if (annots && annots instanceof PDFArray) {
        // Filter: remove Link annotations, keep others (like form fields)
        const filtered: PDFRef[] = [];
        for (let i = 0; i < annots.size(); i++) {
          const annotRef = annots.get(i);
          const annot = context.lookup(annotRef);
          if (annot instanceof PDFDict) {
            const subtype = annot.lookup(PDFName.of('Subtype'));
            if (subtype && subtype.toString() === '/Link') {
              continue; // Skip links
            }
          }
          if (annotRef instanceof PDFRef) {
            filtered.push(annotRef);
          }
        }

        if (filtered.length === 0) {
          page.node.delete(PDFName.of('Annots'));
        } else {
          page.node.set(PDFName.of('Annots'), context.obj(filtered));
        }
      }
    }

    onProgress?.(40 + Math.floor(((p + 1) / totalPages) * 40));
  }

  // 4. Remove attachments
  if (options.removeAttachments) {
    const catalog = pdfDoc.catalog;
    const names = catalog.lookup(PDFName.of('Names'));
    if (names && names instanceof PDFDict) {
      names.delete(PDFName.of('EmbeddedFiles'));
    }
  }

  onProgress?.(85);
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100);

  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
