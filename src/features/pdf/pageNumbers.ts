import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type PageNumberPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type PageNumberFormat = 'page' | 'pageOfTotal' | 'dash';

export interface PageNumberOptions {
  position: PageNumberPosition;
  format: PageNumberFormat;
  fontSize: number;
  startFrom: number;
  margin: number;
  pageRange?: { from: number; to: number };
  onProgress?: (percent: number) => void;
}

function formatPageNumber(
  format: PageNumberFormat,
  currentPage: number,
  totalPages: number
): string {
  switch (format) {
    case 'page':
      return `${currentPage}`;
    case 'pageOfTotal':
      return `Page ${currentPage} sur ${totalPages}`;
    case 'dash':
      return `- ${currentPage} -`;
    default:
      return `${currentPage}`;
  }
}

export async function addPageNumbersToPDF(
  file: File,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const {
    position,
    format,
    fontSize,
    startFrom = 1,
    margin = 30,
    pageRange,
    onProgress,
  } = options;

  if (onProgress) onProgress(5);

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  if (onProgress) onProgress(15);

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(uint8Array, { ignoreEncryption: true });
  } catch (loadError) {
    throw new Error(
      'Impossible de charger ce fichier PDF. Il est peut-être corrompu ou protégé.'
    );
  }

  if (onProgress) onProgress(30);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  // Determine page range to number
  const rangeFrom = pageRange ? Math.max(1, pageRange.from) : 1;
  const rangeTo = pageRange ? Math.min(totalPages, pageRange.to) : totalPages;

  // Total pages to number (for the "Page X sur Y" format)
  const totalNumberedPages = rangeTo - rangeFrom + 1;

  if (onProgress) onProgress(40);

  for (let i = 0; i < totalPages; i++) {
    const pageIndex = i + 1; // 1-indexed

    // Skip pages outside range
    if (pageIndex < rangeFrom || pageIndex > rangeTo) continue;

    const page = pages[i];
    const { width, height } = page.getSize();

    // Calculate the display number
    const displayNumber = startFrom + (pageIndex - rangeFrom);
    const totalDisplay = startFrom + totalNumberedPages - 1;

    const text = formatPageNumber(format, displayNumber, totalDisplay);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // Calculate x position
    let x: number;
    if (position.endsWith('left')) {
      x = margin;
    } else if (position.endsWith('right')) {
      x = width - textWidth - margin;
    } else {
      // center
      x = (width - textWidth) / 2;
    }

    // Calculate y position
    let y: number;
    if (position.startsWith('top')) {
      y = height - margin - textHeight;
    } else {
      // bottom
      y = margin;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    if (onProgress) {
      const progressInLoop = 40 + Math.floor(((i + 1) / totalPages) * 45);
      onProgress(progressInLoop);
    }
  }

  if (onProgress) onProgress(90);

  pdfDoc.setTitle('Document numéroté - iLoveDoc');
  pdfDoc.setCreator('iLoveDoc');
  pdfDoc.setProducer('iLoveDoc - https://ilove-doc.com');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const resultBytes = await pdfDoc.save();

  if (onProgress) onProgress(100);

  return resultBytes;
}
