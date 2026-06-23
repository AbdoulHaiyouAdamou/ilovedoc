import { PDFDocument } from 'pdf-lib';

export interface CropOptions {
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  applyToAll: boolean;
  currentPageIndex?: number;
  onProgress?: (percent: number) => void;
}

export async function cropPDF(file: File, options: CropOptions): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(uint8Array, { ignoreEncryption: true });
  } catch (error) {
    console.error('Error loading PDF for cropping:', error);
    throw new Error('Impossible de charger le fichier PDF. Il est peut-être corrompu ou protégé.');
  }

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  const { margins, applyToAll, currentPageIndex = 0 } = options;

  options.onProgress?.(10);

  for (let i = 0; i < totalPages; i++) {
    if (applyToAll || i === currentPageIndex) {
      const page = pages[i];
      // Use getCropBox if it exists, fallback to getMediaBox or default page sizes
      const { x, y, width, height } = page.getCropBox() || page.getMediaBox() || { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() };

      // Make sure we don't crop more than the page size
      const newLeft = Math.max(0, margins.left);
      const newRight = Math.max(0, margins.right);
      const newTop = Math.max(0, margins.top);
      const newBottom = Math.max(0, margins.bottom);

      if (newLeft + newRight < width && newTop + newBottom < height) {
        const newX = x + newLeft;
        const newY = y + newBottom;
        const newWidth = width - newLeft - newRight;
        const newHeight = height - newTop - newBottom;

        page.setCropBox(newX, newY, newWidth, newHeight);
        
        // Set MediaBox exactly to the new CropBox to ensure the physical page size matches the cropped area
        page.setMediaBox(newX, newY, newWidth, newHeight);
      }
    }
    options.onProgress?.(10 + Math.round(((i + 1) / totalPages) * 80));
  }

  pdfDoc.setTitle('Document rogné - iLoveDoc');
  pdfDoc.setCreator('iLoveDoc');
  pdfDoc.setProducer('iLoveDoc - https://ilove-doc.com');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  const savedPdf = await pdfDoc.save();
  options.onProgress?.(100);
  
  return savedPdf;
}
