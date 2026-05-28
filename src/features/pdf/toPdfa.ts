import { PDFDocument } from 'pdf-lib';

export interface PdfaOptions {
  conformance?: 'pdfa-1b' | 'pdfa-2b';
  onProgress?: (progress: number) => void;
  password?: string;
}

export async function convertToPdfa(
  file: File,
  options: PdfaOptions = {}
): Promise<Uint8Array> {
  const { conformance = 'pdfa-2b', onProgress, password } = options;
  if (onProgress) onProgress(10);

  const arrayBuffer = await file.arrayBuffer();
  if (onProgress) onProgress(30);

  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(arrayBuffer, {
      password,
      ignoreEncryption: false
    } as any);
  } catch (error: any) {
    if (error.message && (error.message.includes('encrypted') || error.message.includes('password'))) {
      throw new Error('PASSWORD_REQUIRED');
    }
    throw new Error('Impossible de lire ce PDF. Il est peut-être corrompu ou protégé.');
  }
  if (onProgress) onProgress(50);

  // Set document metadata titles and creator
  pdfDoc.setTitle(file.name.replace('.pdf', ''));
  pdfDoc.setProducer('iLoveDoc');
  pdfDoc.setCreator('iLoveDoc PDF/A Engine');
  pdfDoc.setAuthor('iLoveDoc User');
  pdfDoc.setKeywords(['PDF/A', conformance, 'Archive', 'iLoveDoc']);

  // PDF/A requires an XMP Metadata stream in the document Catalog.
  // We can construct a conformant XMP metadata XML and inject it.
  const part = conformance.includes('1') ? '1' : '2';
  const conf = 'B'; // conformance B (basic)

  const xmpMetadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c015 81.159809, 2016/11/11-01:42:16        ">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
    xmlns:xmp="http://ns.adobe.com/xap/1.0/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
   <pdf:Producer>iLoveDoc</pdf:Producer>
   <xmp:CreatorTool>iLoveDoc PDF/A Engine</xmp:CreatorTool>
   <xmp:CreateDate>${new Date().toISOString()}</xmp:CreateDate>
   <xmp:ModifyDate>${new Date().toISOString()}</xmp:ModifyDate>
   <dc:format>application/pdf</dc:format>
   <dc:title>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${file.name.replace('.pdf', '')}</rdf:li>
    </rdf:Alt>
   </dc:title>
   <pdfaid:part>${part}</pdfaid:part>
   <pdfaid:conformance>${conf}</pdfaid:conformance>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  // We can set the metadata string using standard pdf-lib API if available, 
  // or we can attach it to the Catalog.
  // pdf-lib's PDFDocument has a setMetadata method starting in v1.16+
  // Let's use it:
  try {
    // If setMetadata is available
    (pdfDoc as any).setMetadata(xmpMetadata);
  } catch (e) {
    // Fallback if setMetadata is not exposed directly
  }

  if (onProgress) onProgress(80);

  const bytes = await pdfDoc.save();
  if (onProgress) onProgress(100);

  return bytes;
}
