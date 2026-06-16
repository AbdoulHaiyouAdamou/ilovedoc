import { PDFDocument } from 'pdf-lib';

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

/**
 * Read existing metadata from a PDF file.
 */
export async function readPdfMetadata(file: File): Promise<PdfMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const creationDate = pdfDoc.getCreationDate();
  const modDate = pdfDoc.getModificationDate();

  return {
    title: pdfDoc.getTitle() ?? '',
    author: pdfDoc.getAuthor() ?? '',
    subject: pdfDoc.getSubject() ?? '',
    keywords: (pdfDoc.getKeywords() ?? ''),
    creator: pdfDoc.getCreator() ?? '',
    producer: pdfDoc.getProducer() ?? '',
    creationDate: creationDate ? creationDate.toISOString().slice(0, 16) : '',
    modificationDate: modDate ? modDate.toISOString().slice(0, 16) : '',
  };
}

/**
 * Write metadata to a PDF and return the modified file as a Blob.
 */
export async function writePdfMetadata(
  file: File,
  metadata: PdfMetadata,
  deleteAll: boolean = false
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  if (deleteAll) {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
  } else {
    if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
    if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
    if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
    if (metadata.keywords !== undefined) {
      const kw = metadata.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      pdfDoc.setKeywords(kw);
    }
    if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);
    if (metadata.producer !== undefined) pdfDoc.setProducer(metadata.producer);
    if (metadata.creationDate) {
      pdfDoc.setCreationDate(new Date(metadata.creationDate));
    }
    if (metadata.modificationDate) {
      pdfDoc.setModificationDate(new Date(metadata.modificationDate));
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
