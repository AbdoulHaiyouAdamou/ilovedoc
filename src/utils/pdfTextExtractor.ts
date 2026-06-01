/**
 * Helper to dynamically load pdf.js from CDN and extract text from a PDF file.
 *
 * The CDN script is loaded with Subresource Integrity (SRI) so a compromised
 * CDN cannot inject arbitrary code that would run against user documents.
 */

const PDFJS_VERSION = '3.4.120';
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

// SHA-384 SRI hashes for cdnjs pdf.js 3.4.120.
// IMPORTANT: verify these against https://cdnjs.com/libraries/pdf.js/3.4.120
// before deploying. Replace with the official published hashes.
const PDFJS_LIB_SRI = 'sha384-REPLACE_WITH_OFFICIAL_PDF_MIN_JS_HASH';
const PDFJS_WORKER_URL = `${PDFJS_BASE}/pdf.worker.min.js`;

interface PdfTextItem {
  str: string;
}

interface PdfJsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (params: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getTextContent: () => Promise<{ items: PdfTextItem[] }>;
      }>;
    }>;
  };
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  if (typeof window === 'undefined') return '';

  if (!window.pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${PDFJS_BASE}/pdf.min.js`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.integrity = PDFJS_LIB_SRI;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Échec du chargement de pdf.js depuis le CDN.'));
      document.head.appendChild(script);
    });
  }

  const pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) {
    throw new Error('pdf.js n\'a pas pu être initialisé.');
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += `--- PAGE ${i} ---\n${pageText}\n\n`;
  }

  return fullText;
}
