import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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
    .replace(/[^\x20-\x7E]/g, '?');
}

export async function generateSummaryPdf(
  originalFileName: string,
  length: string,
  tone: string,
  summaryMarkdown: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  
  // Header banner
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width,
    height: 80,
    color: rgb(0.49, 0.23, 0.93), // Purple #7c3aed
  });
  
  page.drawText(cleanForPdf('SYNTHESE INTELLIGENTE PAR IA - iLoveDoc'), {
    x: 30,
    y: height - 45,
    size: 16,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  page.drawText(cleanForPdf(`Document original : ${originalFileName}`), {
    x: 30,
    y: height - 65,
    size: 9,
    font: helveticaFont,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  let y = height - 120;
  
  page.drawText(cleanForPdf(`Synthese de niveau ${length} (${tone}) - Generee le ${new Date().toLocaleDateString('fr-FR')}`), {
    x: 30,
    y,
    size: 10,
    font: helveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  y -= 30;
  
  // Simple markdown renderer for PDF
  const lines = summaryMarkdown.split('\n');
  let pageNum = 1;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Page overflow check
    if (y < 60) {
      page.drawText(cleanForPdf(`Page ${pageNum}`), { x: 280, y: 30, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });
      page = pdfDoc.addPage([595, 842]);
      pageNum++;
      y = height - 60;
    }
    
    // Check if header
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '');
      const fontSize = level === 1 ? 16 : level === 2 ? 13 : 11;
      
      y -= (fontSize + 10);
      page.drawText(cleanForPdf(text), {
        x: 30,
        y,
        size: fontSize,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 5;
    } else if (line.startsWith('-') || line.startsWith('*')) {
      const text = line.replace(/^[-*]\s*/, '');
      y -= 15;
      page.drawCircle({ x: 38, y: y + 3, size: 2, color: rgb(0.49, 0.23, 0.93) });
      
      const words = text.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = helveticaFont.widthOfTextAtSize(cleanForPdf(testLine), 9);
        if (textWidth > 480) {
          page.drawText(cleanForPdf(currentLine), {
            x: 50,
            y,
            size: 9,
            font: helveticaFont,
            color: rgb(0.2, 0.2, 0.2),
          });
          y -= 12;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page.drawText(cleanForPdf(currentLine), {
          x: 50,
          y,
          size: 9,
          font: helveticaFont,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
      y -= 5;
    } else {
      y -= 15;
      const words = line.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = helveticaFont.widthOfTextAtSize(cleanForPdf(testLine), 9);
        if (textWidth > 500) {
          page.drawText(cleanForPdf(currentLine), {
            x: 30,
            y,
            size: 9,
            font: helveticaFont,
            color: rgb(0.2, 0.2, 0.2),
          });
          y -= 12;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page.drawText(cleanForPdf(currentLine), {
          x: 30,
          y,
          size: 9,
          font: helveticaFont,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
      y -= 5;
    }
  }
  
  // Footer
  page.drawText(cleanForPdf(`Page ${pageNum}`), { x: 280, y: 30, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });
  
  page.drawText(cleanForPdf('Rapport genere via iLoveDoc - 100% gratuit.'), {
    x: 180,
    y: 15,
    size: 7,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6),
  });
  
  return await pdfDoc.save();
}
