import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Clean text for PDF rendering
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

// 1. Convert PDF to Word (.docx)
export async function convertPdfToWord(file: File, onProgress?: (p: number) => void): Promise<Uint8Array> {
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) throw new Error("La bibliothèque pdf.js n'est pas chargée.");

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const paragraphsList: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(Math.round((i / numPages) * 80));
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    paragraphsList.push(...pageText.split(/\s{2,}/)); // split by double spaces to infer paragraphs
  }

  // Create Docx
  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphsList.map(text => new Paragraph({
        children: [new TextRun({ text: text.trim(), size: 24 })]
      }))
    }]
  });

  if (onProgress) onProgress(90);
  const docxBlob = await Packer.toBlob(doc);
  if (onProgress) onProgress(100);

  return new Uint8Array(await docxBlob.arrayBuffer());
}

// 2. Convert PDF to Excel (.xlsx)
export async function convertPdfToExcel(file: File, onProgress?: (p: number) => void): Promise<Uint8Array> {
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) throw new Error("La bibliothèque pdf.js n'est pas chargée.");

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const rows: string[][] = [];

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(Math.round((i / numPages) * 80));
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group text items by Y coordinate (rows)
    const yGroups: Record<number, any[]> = {};
    textContent.items.forEach((item: any) => {
      const y = Math.round(item.transform[5]);
      if (!yGroups[y]) yGroups[y] = [];
      yGroups[y].push(item);
    });

    // Sort Y keys descending (top to bottom)
    const sortedY = Object.keys(yGroups).map(Number).sort((a, b) => b - a);
    sortedY.forEach(y => {
      // Sort items by X coordinate (columns)
      const items = yGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
      const row = items.map(item => item.str.trim()).filter(Boolean);
      if (row.length > 0) {
        rows.push(row);
      }
    });
  }

  // Generate Excel workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  if (onProgress) onProgress(95);
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  if (onProgress) onProgress(100);

  return new Uint8Array(excelBuffer);
}

// 3. Convert PDF to PowerPoint (.pptx)
export async function convertPdfToPpt(file: File, onProgress?: (p: number) => void): Promise<Uint8Array> {
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) throw new Error("La bibliothèque pdf.js n'est pas chargée.");

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const pptx = new pptxgen();

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(Math.round((i / numPages) * 80));
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');

    const slide = pptx.addSlide();
    slide.addText(`Page ${i}`, { x: 0.5, y: 0.3, fontSize: 16, bold: true, color: '333333' });
    slide.addText(pageText.trim(), { x: 0.5, y: 1.0, w: 9.0, h: 4.5, fontSize: 11, color: '555555' });
  }

  if (onProgress) onProgress(95);
  const pptxBuffer = await pptx.write({ outputType: 'arraybuffer' });
  if (onProgress) onProgress(100);

  return new Uint8Array(pptxBuffer as ArrayBuffer);
}

// 4. Convert Word (.docx) to PDF
export async function convertWordToPdf(file: File, onProgress?: (p: number) => void): Promise<Uint8Array> {
  if (onProgress) onProgress(20);
  const arrayBuffer = await file.arrayBuffer();
  
  // Use mammoth to extract text
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;

  if (onProgress) onProgress(60);

  // Generate PDF from text
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  // Draw header
  page.drawRectangle({ x: 0, y: height - 50, width, height: 50, color: rgb(0.15, 0.38, 0.92) });
  page.drawText(cleanForPdf(file.name.replace('.docx', '')), { x: 30, y: height - 30, size: 14, font: fontBold, color: rgb(1, 1, 1) });

  let y = height - 80;
  const lines = text.split('\n');

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      y -= 12;
      continue;
    }

    if (y < 50) {
      page = pdfDoc.addPage([595, 842]);
      y = height - 50;
    }

    const words = line.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(cleanForPdf(testLine), 10);
      if (textWidth > 535) {
        page.drawText(cleanForPdf(currentLine), { x: 30, y, size: 10, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
        currentLine = word;
        if (y < 50) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 50;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      page.drawText(cleanForPdf(currentLine), { x: 30, y, size: 10, font, color: rgb(0.15, 0.15, 0.15) });
      y -= 18;
    }
  }

  if (onProgress) onProgress(100);
  return await pdfDoc.save();
}

// 5. Convert Excel (.xlsx) to PDF
export async function convertExcelToPdf(file: File, onProgress?: (p: number) => void): Promise<Uint8Array> {
  if (onProgress) onProgress(20);
  const arrayBuffer = await file.arrayBuffer();
  
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  
  // Convert sheet to 2D array
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

  if (onProgress) onProgress(60);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Landscape orientation is better for spreadsheets!
  let page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  // Draw header
  page.drawRectangle({ x: 0, y: height - 50, width, height: 50, color: rgb(0.08, 0.63, 0.29) });
  page.drawText(cleanForPdf(`Classeur Excel - ${sheetName}`), { x: 30, y: height - 32, size: 14, font: fontBold, color: rgb(1, 1, 1) });

  let y = height - 80;
  // Find maximum columns across all rows to determine proper column widths
  const maxCols = Math.max(1, ...rows.map(r => r?.length || 0));
  const colWidth = Math.floor((width - 60) / maxCols);

  // Helper to dynamically fit text within the column width
  const fitCellText = (text: string, isBold: boolean) => {
    const cleaned = cleanForPdf(text);
    const activeFont = isBold ? fontBold : font;
    const padding = 10;
    const maxWidth = colWidth - padding;
    
    // If the text fits completely, return it
    if (activeFont.widthOfTextAtSize(cleaned, 8) <= maxWidth) {
      return cleaned;
    }
    
    // Binary search for the maximum characters that fit with "..."
    let low = 0;
    let high = cleaned.length;
    let resultText = '...';
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const testText = cleaned.slice(0, mid) + '...';
      if (activeFont.widthOfTextAtSize(testText, 8) <= maxWidth) {
        resultText = testText;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return resultText;
  };

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (y < 40) {
      page = pdfDoc.addPage([842, 595]);
      y = height - 50;
    }

    // Draw row grid line
    page.drawLine({
      start: { x: 30, y: y + 10 },
      end: { x: width - 30, y: y + 10 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8)
    });

    for (let c = 0; c < row.length; c++) {
      const cellValue = String(row[c] !== undefined ? row[c] : '');
      const isBold = r === 0;
      const cellText = fitCellText(cellValue, isBold);
      
      page.drawText(cellText, {
        x: 35 + c * colWidth,
        y: y - 2,
        size: 8,
        font: isBold ? fontBold : font,
        color: rgb(0.1, 0.1, 0.1)
      });
    }

    y -= 20;
  }

  // Draw bottom line
  page.drawLine({
    start: { x: 30, y: y + 10 },
    end: { x: width - 30, y: y + 10 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8)
  });

  if (onProgress) onProgress(100);
  return await pdfDoc.save();
}

// 6. Convert PowerPoint (.pptx) to PDF
export async function convertPptToPdf(file: File, onProgress?: (p: number) => void): Promise<Uint8Array> {
  if (onProgress) onProgress(10);
  const arrayBuffer = await file.arrayBuffer();

  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Find slide files
  const slideFiles: { name: string; num: number }[] = [];
  zip.forEach((relativePath, fileObj) => {
    const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
    if (match) {
      slideFiles.push({ name: relativePath, num: parseInt(match[1], 10) });
    }
  });

  // Sort slides numerically
  slideFiles.sort((a, b) => a.num - b.num);

  if (slideFiles.length === 0) {
    throw new Error("Aucune diapositive n'a été trouvée dans le fichier PowerPoint.");
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const numSlides = slideFiles.length;

  for (let i = 0; i < numSlides; i++) {
    if (onProgress) onProgress(Math.round(10 + (i / numSlides) * 80));
    const slideFile = slideFiles[i];
    const xmlText = await zip.file(slideFile.name)?.async('string');
    
    // Create a new landscape page for each slide
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    // Clean background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.98, 0.98, 0.98)
    });

    // Draw slide background/border (orange matching the PPT theme)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.91, 0.34, 0.1),
      borderWidth: 2,
      color: rgb(1, 1, 1)
    });

    // Slide footer (page number/slide number)
    page.drawText(cleanForPdf(`Diapositive ${i + 1} / ${numSlides}`), {
      x: width - 150,
      y: 35,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });

    if (xmlText) {
      const parser = new DOMParser();
      const xmlDocObj = parser.parseFromString(xmlText, "text/xml");
      
      const shapes = xmlDocObj.getElementsByTagName("p:sp");
      let yOffset = height - 80;
      let hasTitle = false;

      for (let s = 0; s < shapes.length; s++) {
        const shape = shapes[s];
        const paragraphs = shape.getElementsByTagName("a:p");
        
        for (let p = 0; p < paragraphs.length; p++) {
          const para = paragraphs[p];
          const textNodes = para.getElementsByTagName("a:t");
          const paraText = Array.from(textNodes)
            .map(node => node.textContent || '')
            .join('')
            .trim();

          if (!paraText) continue;

          // Make the first significant line a bold title
          const isTitle = !hasTitle && (paraText.length < 80);
          const fontSize = isTitle ? 24 : 14;
          const activeFont = isTitle ? fontBold : font;
          const textColor = isTitle ? rgb(0.91, 0.34, 0.1) : rgb(0.2, 0.2, 0.2);

          if (isTitle) {
            hasTitle = true;
          }

          // Split line to fit page width
          const words = paraText.split(' ');
          let currentLine = '';
          const maxTextWidth = width - 100;

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = activeFont.widthOfTextAtSize(cleanForPdf(testLine), fontSize);
            if (textWidth > maxTextWidth) {
              if (yOffset < 60) break;
              page.drawText(cleanForPdf(currentLine), {
                x: 50,
                y: yOffset,
                size: fontSize,
                font: activeFont,
                color: textColor
              });
              yOffset -= fontSize + 6;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine && yOffset >= 60) {
            page.drawText(cleanForPdf(currentLine), {
              x: 50,
              y: yOffset,
              size: fontSize,
              font: activeFont,
              color: textColor
            });
            yOffset -= fontSize + (isTitle ? 20 : 10);
          }
        }
      }
    }
  }

  if (onProgress) onProgress(100);
  return await pdfDoc.save();
}
