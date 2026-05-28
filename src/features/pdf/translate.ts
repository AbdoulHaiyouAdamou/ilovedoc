import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Helper to normalize and sanitize strings for pdf-lib to prevent WinAnsi encoding crashes
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

interface PDFTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

interface Block {
  lines: PDFTextItem[];
}

function mergeLineItems(items: PDFTextItem[]): PDFTextItem[] {
  if (items.length === 0) return [];

  // Sort items by Y descending (top to bottom), then by X ascending (left to right)
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 3) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const merged: PDFTextItem[] = [];
  let current = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    // Check if on the same line
    const sameLine = Math.abs(current.y - next.y) <= 3;
    // Check if they are reasonably close horizontally
    const closeHorizontal = next.x - (current.x + current.width) < Math.max(current.fontSize, 10) * 3;

    if (sameLine && closeHorizontal) {
      const needsSpace = !current.str.endsWith(' ') && !next.str.startsWith(' ');
      current.str = current.str + (needsSpace ? ' ' : '') + next.str;
      current.width = (next.x + next.width) - current.x;
      current.height = Math.max(current.height, next.height);
      current.fontSize = Math.max(current.fontSize, next.fontSize);
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);
  return merged;
}

function groupLinesIntoBlocks(lines: PDFTextItem[]): Block[] {
  const n = lines.length;
  if (n === 0) return [];

  const parent = Array.from({ length: n }, (_, i) => i);

  function find(i: number): number {
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  }

  function union(i: number, j: number) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
    }
  }

  for (let i = 0; i < n; i++) {
    const a = lines[i];
    for (let j = i + 1; j < n; j++) {
      const b = lines[j];

      // Vertical distance between lines
      const distY = Math.abs(a.y - b.y);
      const maxGapY = Math.min(a.fontSize, b.fontSize) * 1.8;

      if (distY < maxGapY) {
        // Horizontal relationship:
        // Do they overlap horizontally, or are their X coordinates close?
        const overlapX = (a.x <= b.x + b.width) && (b.x <= a.x + a.width);
        const closeLeft = Math.abs(a.x - b.x) < 50;
        const closeRight = Math.abs((a.x + a.width) - (b.x + b.width)) < 50;

        if (overlapX || closeLeft || closeRight) {
          union(i, j);
        }
      }
    }
  }

  const groups: { [key: number]: PDFTextItem[] } = {};
  for (let i = 0; i < n; i++) {
    const root = find(i);
    if (!groups[root]) {
      groups[root] = [];
    }
    groups[root].push(lines[i]);
  }

  return Object.values(groups).map(g => ({
    lines: g.sort((a, b) => b.y - a.y) // Sort lines top-to-bottom within each block
  }));
}

function sortBlocks(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => {
    const aMinX = Math.min(...a.lines.map(l => l.x));
    const aMaxY = Math.max(...a.lines.map(l => l.y + Math.max(l.height || 0, l.fontSize)));
    const aMinY = Math.min(...a.lines.map(l => l.y));

    const bMinX = Math.min(...b.lines.map(l => l.x));
    const bMaxY = Math.max(...b.lines.map(l => l.y + Math.max(l.height || 0, l.fontSize)));
    const bMinY = Math.min(...b.lines.map(l => l.y));

    // If one block is significantly higher than the other, it comes first
    const verticalOverlap = Math.min(aMaxY, bMaxY) - Math.max(aMinY, bMinY);
    const aHeight = aMaxY - aMinY;
    const bHeight = bMaxY - bMinY;
    const minHeight = Math.min(aHeight, bHeight);

    if (verticalOverlap < minHeight * 0.3) {
      return bMaxY - aMaxY; // Higher Y first (top to bottom)
    }

    // Otherwise, they are side-by-side, so sort left-to-right (X ascending)
    return aMinX - bMinX;
  });
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    try {
      const width = font.widthOfTextAtSize(cleanForPdf(testLine), fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    } catch {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function translatePDFLayout(
  file: File,
  targetLanguage: string,
  onProgress: (percent: number) => void
): Promise<Uint8Array> {
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) {
    throw new Error("La bibliothèque pdf.js n'est pas chargée.");
  }

  // 1. Read PDF file as ArrayBuffer and load via pdf.js
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  // 2. Load the same file using pdf-lib to modify pages
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 3. Process page-by-page
  for (let p = 1; p <= numPages; p++) {
    onProgress(Math.round(((p - 1) / numPages) * 100));

    const page = await pdf.getPage(p);
    const textContent = await page.getTextContent();
    
    // Map text items and calculate positions
    const items: PDFTextItem[] = textContent.items.map((item: any) => {
      const x = item.transform[4];
      const y = item.transform[5];
      const width = item.width;
      const height = item.height;
      const fontSize = Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]);
      return {
        str: item.str,
        x,
        y,
        width,
        height,
        fontSize: isNaN(fontSize) || fontSize <= 0 ? 9 : fontSize
      };
    });

    // Filter printable/non-empty items
    const printableItemsRaw = items.filter(item => item.str.trim().length > 0);
    if (printableItemsRaw.length === 0) continue;

    // Merge adjacent text items on the same line
    const printableItems = mergeLineItems(printableItemsRaw);

    // Group and sort blocks of text (columns-aware)
    const blocks = sortBlocks(groupLinesIntoBlocks(printableItems));
    const stringsToTranslate = blocks.map(block => block.lines.map(l => l.str).join(' '));

    // Call API proxy to translate in batch
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfText: JSON.stringify(stringsToTranslate),
          task: 'translate-blocks',
          language: targetLanguage
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const responseText = data.choices[0].message.content;

      // Parse JSON from LLM response
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      let translatedStrings = Array.isArray(parsed) ? parsed : (parsed?.translations || []);

      // Double Verification Pass
      try {
        const verifyRes = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfText: JSON.stringify({
              original: stringsToTranslate,
              proposed: translatedStrings
            }),
            task: 'verify-translation',
            language: targetLanguage
          })
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          const verifyResponseText = verifyData.choices[0].message.content;
          const verifyCleanJson = verifyResponseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          const verifyParsed = JSON.parse(verifyCleanJson);
          const verifiedTranslations = Array.isArray(verifyParsed) ? verifyParsed : (verifyParsed?.translations || []);
          
          if (Array.isArray(verifiedTranslations) && verifiedTranslations.length === stringsToTranslate.length) {
            translatedStrings = verifiedTranslations;
          }
        }
      } catch (verifyErr) {
        console.error("Verification pass error:", verifyErr);
      }

      if (Array.isArray(translatedStrings) && translatedStrings.length > 0) {
        const libPage = pages[p - 1];

        blocks.forEach((block, idx) => {
          const translatedText = translatedStrings[idx] || block.lines.map(l => l.str).join(' ');

          // Mask original lines individually
          block.lines.forEach(line => {
            const rectHeight = Math.max(line.height || 0, line.fontSize * 1.25);
            const rectY = line.y - line.fontSize * 0.25;

            libPage.drawRectangle({
              x: line.x - 1,
              y: rectY,
              width: line.width + 2,
              height: rectHeight,
              color: rgb(1, 1, 1),
            });
          });

          // Calculate bounding box for drawing wrapped text
          const minX = Math.min(...block.lines.map(l => l.x));
          const maxX = Math.max(...block.lines.map(l => l.x + l.width));
          const minY = Math.min(...block.lines.map(l => l.y));
          const maxY = Math.max(...block.lines.map(l => l.y + Math.max(l.height || 0, l.fontSize)));

          const width = Math.max(50, maxX - minX);
          const height = Math.max(10, maxY - minY);

          const baseFontSize = Math.max(...block.lines.map(l => l.fontSize));

          // Draw wrapped text inside the bounding box
          let currentFontSize = baseFontSize;
          let wrappedLines = wrapText(translatedText, helveticaFont, currentFontSize, width);
          let totalHeight = wrappedLines.length * currentFontSize * 1.25;

          if (totalHeight > height && height > 0) {
            const scale = height / totalHeight;
            currentFontSize = Math.max(5, baseFontSize * scale);
            wrappedLines = wrapText(translatedText, helveticaFont, currentFontSize, width);
          }

          // Draw the wrapped lines
          wrappedLines.forEach((lineText, i) => {
            const cleanedText = cleanForPdf(lineText);
            const lineY = maxY - currentFontSize - i * (currentFontSize * 1.25);

            try {
              libPage.drawText(cleanedText, {
                x: minX,
                y: lineY,
                size: currentFontSize,
                font: helveticaFont,
                color: rgb(0.15, 0.15, 0.15),
              });
            } catch (err) {
              console.error("Error drawing text line:", err);
            }
          });
        });
      }
    } catch (err) {
      console.error(`Error translating page ${p}:`, err);
    }
  }

  onProgress(100);
  return await pdfDoc.save();
}
