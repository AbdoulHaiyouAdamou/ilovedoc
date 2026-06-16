import { PDFDocument, PDFName, PDFRawStream, PDFDict, PDFArray, PDFRef } from 'pdf-lib';

export interface ExtractedImage {
  name: string;
  data: Uint8Array;
  mimeType: string;
  width: number;
  height: number;
}

/**
 * Extract all embedded images from a PDF document.
 * Walks the raw PDF objects looking for XObject streams with Subtype /Image.
 */
export async function extractImagesFromPdf(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ExtractedImage[]> {
  onProgress?.(5);

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const context = pdfDoc.context;

  onProgress?.(15);

  const images: ExtractedImage[] = [];
  const seenRefs = new Set<string>();

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let p = 0; p < totalPages; p++) {
    const page = pages[p];
    const resources = page.node.lookup(PDFName.of('Resources'));
    if (!resources || !(resources instanceof PDFDict)) continue;

    const xObjects = resources.lookup(PDFName.of('XObject'));
    if (!xObjects || !(xObjects instanceof PDFDict)) continue;

    const entries = xObjects.entries();
    for (const [name, ref] of entries) {
      const refKey = ref instanceof PDFRef ? ref.toString() : name.toString();
      if (seenRefs.has(refKey)) continue;
      seenRefs.add(refKey);

      const xObject = context.lookup(ref);
      if (!xObject) continue;

      // Check if it's an Image XObject
      let dict: PDFDict | undefined;
      if (xObject instanceof PDFRawStream) {
        dict = xObject.dict;
      } else if (xObject instanceof PDFDict) {
        dict = xObject;
      }

      if (!dict) continue;

      const subtype = dict.lookup(PDFName.of('Subtype'));
      if (!subtype || subtype.toString() !== '/Image') continue;

      // Get image dimensions
      const widthObj = dict.lookup(PDFName.of('Width'));
      const heightObj = dict.lookup(PDFName.of('Height'));
      const width = widthObj ? parseInt(widthObj.toString()) : 0;
      const height = heightObj ? parseInt(heightObj.toString()) : 0;

      // Determine image type by Filter
      const filter = dict.lookup(PDFName.of('Filter'));
      const filterStr = filter ? filter.toString() : '';

      let mimeType = 'image/png';
      let extension = 'png';

      if (filterStr.includes('DCTDecode')) {
        mimeType = 'image/jpeg';
        extension = 'jpg';
      } else if (filterStr.includes('JPXDecode')) {
        mimeType = 'image/jp2';
        extension = 'jp2';
      }

      // Get raw image data
      if (xObject instanceof PDFRawStream) {
        const rawData = xObject.getContents();
        if (rawData.length > 0) {
          images.push({
            name: `image_p${p + 1}_${images.length + 1}.${extension}`,
            data: rawData,
            mimeType,
            width,
            height,
          });
        }
      }
    }

    onProgress?.(15 + Math.floor(((p + 1) / totalPages) * 70));
  }

  onProgress?.(100);
  return images;
}
