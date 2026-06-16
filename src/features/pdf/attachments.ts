import { PDFDocument, PDFName, PDFDict, PDFHexString, PDFArray, PDFString, PDFStream } from 'pdf-lib';

/**
 * Embed file attachments into a PDF document.
 * Uses the EmbeddedFiles name tree (PDF spec §7.11.3).
 */
export async function addAttachmentsToPdf(
  pdfFile: File,
  attachments: File[]
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const context = pdfDoc.context;

  for (const attachment of attachments) {
    const attBytes = new Uint8Array(await attachment.arrayBuffer());

    // Create the embedded file stream
    const fileStream = context.stream(attBytes, {
      Type: 'EmbeddedFile',
      Subtype: attachment.type || 'application/octet-stream',
    });
    const fileStreamRef = context.register(fileStream);

    // Create the file spec dictionary
    const fileSpec = context.obj({
      Type: 'Filespec',
      F: PDFString.of(attachment.name),
      UF: PDFHexString.fromText(attachment.name),
      EF: context.obj({ F: fileStreamRef }),
    });
    const fileSpecRef = context.register(fileSpec);

    // Add to the document's name tree (EmbeddedFiles)
    const catalog = pdfDoc.catalog;
    let namesDict = catalog.lookup(PDFName.of('Names'));
    
    if (!namesDict || !(namesDict instanceof PDFDict)) {
      namesDict = context.obj({});
      catalog.set(PDFName.of('Names'), context.register(namesDict as PDFDict));
      namesDict = catalog.lookup(PDFName.of('Names')) as PDFDict;
    }

    const namesDictTyped = namesDict as PDFDict;
    let embeddedFilesDict = namesDictTyped.lookup(PDFName.of('EmbeddedFiles'));

    if (!embeddedFilesDict || !(embeddedFilesDict instanceof PDFDict)) {
      const namesArray = context.obj([
        PDFHexString.fromText(attachment.name),
        fileSpecRef,
      ]);
      const newEFDict = context.obj({ Names: namesArray });
      namesDictTyped.set(PDFName.of('EmbeddedFiles'), context.register(newEFDict));
    } else {
      const efDict = embeddedFilesDict as PDFDict;
      let namesArray = efDict.lookup(PDFName.of('Names'));
      if (namesArray && namesArray instanceof PDFArray) {
        namesArray.push(PDFHexString.fromText(attachment.name));
        namesArray.push(fileSpecRef);
      } else {
        const newNamesArray = context.obj([
          PDFHexString.fromText(attachment.name),
          fileSpecRef,
        ]);
        efDict.set(PDFName.of('Names'), newNamesArray);
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}
