import { PDFDocument } from 'pdf-lib';

export type OverlayMode = 'below' | 'above';

/**
 * Overlay one PDF on top of (or behind) another.
 * The overlay PDF pages are stamped onto the base PDF pages.
 * If the overlay has fewer pages, its last page repeats for remaining base pages.
 */
export async function overlayPdfs(
  baseFile: File,
  overlayFile: File,
  mode: OverlayMode = 'above',
  onProgress?: (percent: number) => void
): Promise<Blob> {
  onProgress?.(5);

  const [baseBuffer, overlayBuffer] = await Promise.all([
    baseFile.arrayBuffer(),
    overlayFile.arrayBuffer(),
  ]);

  const baseDoc = await PDFDocument.load(baseBuffer);
  const overlayDoc = await PDFDocument.load(overlayBuffer);

  onProgress?.(20);

  const basePages = baseDoc.getPages();
  const overlayPages = overlayDoc.getPages();
  const totalBase = basePages.length;
  const totalOverlay = overlayPages.length;

  if (totalOverlay === 0 || totalBase === 0) {
    const pdfBytes = await baseDoc.save();
    return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  }

  // Copy overlay pages into the base doc
  const overlayIndices = overlayPages.map((_, i) => i);
  const copiedOverlay = await baseDoc.copyPages(overlayDoc, overlayIndices);

  onProgress?.(40);

  if (mode === 'above') {
    // Stamp overlay on top of base pages
    for (let i = 0; i < totalBase; i++) {
      const overlayIdx = Math.min(i, totalOverlay - 1);
      const embeddedOverlay = await baseDoc.embedPage(copiedOverlay[overlayIdx]);
      const basePage = basePages[i];
      const { width, height } = basePage.getSize();

      basePage.drawPage(embeddedOverlay, {
        x: 0,
        y: 0,
        width,
        height,
      });

      onProgress?.(40 + Math.floor(((i + 1) / totalBase) * 50));
    }
  } else {
    // Place overlay BELOW base content:
    // Strategy: create a new doc where we embed the overlay first, then the base page on top
    const outDoc = await PDFDocument.create();
    const baseCopied = await outDoc.copyPages(baseDoc, basePages.map((_, i) => i));
    const overlayCopied = await outDoc.copyPages(overlayDoc, overlayIndices);

    for (let i = 0; i < totalBase; i++) {
      const overlayIdx = Math.min(i, totalOverlay - 1);
      const basePage = baseCopied[i];
      const { width, height } = basePage.getSize();

      const newPage = outDoc.addPage([width, height]);

      // Draw overlay first (background)
      const embeddedOverlay = await outDoc.embedPage(overlayCopied[overlayIdx]);
      newPage.drawPage(embeddedOverlay, { x: 0, y: 0, width, height });

      // Draw base on top (foreground)
      const embeddedBase = await outDoc.embedPage(basePage);
      newPage.drawPage(embeddedBase, { x: 0, y: 0, width, height });

      onProgress?.(40 + Math.floor(((i + 1) / totalBase) * 50));
    }

    onProgress?.(95);
    const pdfBytes = await outDoc.save();
    onProgress?.(100);
    return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  }

  onProgress?.(95);
  const pdfBytes = await baseDoc.save();
  onProgress?.(100);

  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
