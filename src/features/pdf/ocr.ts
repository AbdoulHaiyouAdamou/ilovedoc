import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Helper to clean text for pdf-lib Helvetica encoding
function cleanForPdf(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'AE')
    .replace(/’/g, "'")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/«/g, '"')
    .replace(/»/g, '"')
    .replace(/\u00a0/g, ' ')
    .replace(/\u202f/g, ' ')
    .replace(/[^\x20-\x7E\n]/g, '?');
}

export async function runOcrOnPdf(
  file: File,
  language: string, // 'fra' or 'eng' or 'fra+eng'
  onProgress: (percent: number) => void
): Promise<{ text: string; pdfBytes: Uint8Array }> {
  // 1. Load pdf.js
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) throw new Error("La bibliothèque pdf.js n'est pas chargée.");

  // 2. Load Tesseract.js from CDN if not already loaded
  if (!(window as any).Tesseract) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Échec du chargement de Tesseract.js"));
      document.head.appendChild(script);
    });
  }

  const Tesseract = (window as any).Tesseract;
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  // Create Tesseract Worker
  const worker = await Tesseract.createWorker();
  await worker.loadLanguage(language);
  await worker.initialize(language);

  let fullText = '';
  const newPdf = await PDFDocument.create();
  const helveticaFont = await newPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await newPdf.embedFont(StandardFonts.HelveticaBold);

  // Process page by page
  for (let p = 1; p <= numPages; p++) {
    onProgress(Math.round(((p - 1) / numPages) * 100));

    // Render page to canvas
    const page = await pdfDoc.getPage(p);
    const scale = 2.0; // scale up for better OCR accuracy!
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');

    if (context) {
      await page.render({ canvasContext: context, viewport }).promise;

      // Run OCR on canvas image
      const result = await worker.recognize(canvas);
      const pageText = result.data.text;
      
      fullText += `--- PAGE ${p} ---\n${pageText}\n\n`;

      // Create new page in the searchable text PDF report
      let pdfPage = newPdf.addPage([595, 842]); // A4
      const { height } = pdfPage.getSize();
      
      // Header banner for OCR report page
      pdfPage.drawRectangle({
        x: 0,
        y: height - 50,
        width: 595,
        height: 50,
        color: rgb(0.05, 0.65, 0.9), // Sky blue #0ea5e9
      });
      pdfPage.drawText(cleanForPdf(`TEXTE RECONNU (OCR) - PAGE ${p}`), {
        x: 30,
        y: height - 30,
        size: 12,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });

      // Write text on page
      let y = height - 80;
      const lines = pageText.split('\n');

      for (let line of lines) {
        line = line.trim();
        if (!line) {
          y -= 10;
          continue;
        }

        if (y < 50) {
          pdfPage = newPdf.addPage([595, 842]);
          y = height - 50;
        }

        const words = line.split(' ');
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = helveticaFont.widthOfTextAtSize(cleanForPdf(testLine), 8);
          if (textWidth > 530) {
            pdfPage.drawText(cleanForPdf(currentLine), {
              x: 30,
              y,
              size: 8,
              font: helveticaFont,
              color: rgb(0.2, 0.2, 0.2),
            });
            y -= 12;
            currentLine = word;
            if (y < 50) {
              pdfPage = newPdf.addPage([595, 842]);
              y = height - 50;
            }
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          pdfPage.drawText(cleanForPdf(currentLine), {
            x: 30,
            y,
            size: 8,
            font: helveticaFont,
            color: rgb(0.2, 0.2, 0.2),
          });
          y -= 15;
        }
      }
    }
  }

  await worker.terminate();
  onProgress(100);

  const pdfBytes = await newPdf.save();
  return { text: fullText, pdfBytes };
}
