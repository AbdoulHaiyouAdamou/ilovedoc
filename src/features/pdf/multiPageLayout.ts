import { PDFDocument } from 'pdf-lib';

export type LayoutMode = '2-up' | '4-up' | '6-up' | '9-up';

/**
 * Arrange multiple PDF pages onto fewer, larger pages (N-up layout).
 * Useful for printing booklets or saving paper.
 */
export async function multiPageLayout(
  file: File,
  mode: LayoutMode,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  onProgress?.(5);

  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const outDoc = await PDFDocument.create();

  onProgress?.(15);

  const srcPages = srcDoc.getPages();
  const totalSrcPages = srcPages.length;

  if (totalSrcPages === 0) {
    const pdfBytes = await outDoc.save();
    return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  }

  // Determine grid based on mode
  let cols: number, rows: number;
  switch (mode) {
    case '2-up': cols = 2; rows = 1; break;
    case '4-up': cols = 2; rows = 2; break;
    case '6-up': cols = 3; rows = 2; break;
    case '9-up': cols = 3; rows = 3; break;
    default: cols = 2; rows = 1;
  }

  const pagesPerSheet = cols * rows;

  // Use A4 landscape as output page size
  const outWidth = 841.89; // A4 landscape width in pt
  const outHeight = 595.28; // A4 landscape height in pt
  const cellWidth = outWidth / cols;
  const cellHeight = outHeight / rows;

  const copiedPages = await outDoc.copyPages(srcDoc, srcPages.map((_, i) => i));

  onProgress?.(40);

  for (let i = 0; i < totalSrcPages; i += pagesPerSheet) {
    const outPage = outDoc.addPage([outWidth, outHeight]);

    for (let slot = 0; slot < pagesPerSheet; slot++) {
      const srcIndex = i + slot;
      if (srcIndex >= totalSrcPages) break;

      const embedded = await outDoc.embedPage(copiedPages[srcIndex]);
      const { width: srcW, height: srcH } = embedded;

      // Calculate scale to fit in cell
      const scale = Math.min(cellWidth / srcW, cellHeight / srcH) * 0.95;
      const scaledW = srcW * scale;
      const scaledH = srcH * scale;

      // Calculate position in grid (top-left to bottom-right)
      const col = slot % cols;
      const row = Math.floor(slot / cols);

      const x = col * cellWidth + (cellWidth - scaledW) / 2;
      const y = outHeight - (row + 1) * cellHeight + (cellHeight - scaledH) / 2;

      outPage.drawPage(embedded, { x, y, width: scaledW, height: scaledH });
    }

    onProgress?.(40 + Math.floor(((i + pagesPerSheet) / totalSrcPages) * 50));
  }

  onProgress?.(95);
  const pdfBytes = await outDoc.save();
  onProgress?.(100);

  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
