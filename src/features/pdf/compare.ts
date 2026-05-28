import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface DiffChange {
  type: 'addition' | 'deletion' | 'modification';
  text: string;
  originalText?: string;
  page: number;
}

// Cleans strings to ensure they contain only standard printable ASCII characters
// to prevent standard Helvetica fonts from throwing WinAnsi encoding errors.
function cleanForPdf(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD') // Splits accented characters (e.g. é -> e + accent)
    .replace(/[\u0300-\u036f]/g, '') // Removes diacritics/accents
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'AE')
    .replace(/’/g, "'")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/«/g, '"')
    .replace(/»/g, '"')
    .replace(/\u00a0/g, ' ') // Non-breaking space
    .replace(/\u202f/g, ' ') // Narrow non-breaking space
    .replace(/[^\x20-\x7E]/g, '?'); // Everything else to '?'
}

export async function generateComparisonPdf(
  fileAName: string,
  fileASize: number,
  pagesA: number,
  fileBName: string,
  fileBSize: number,
  pagesB: number,
  compareMode: 'text' | 'visual',
  changes: DiffChange[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // PAGE 1: Executive Summary
  let page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  
  // Header banner
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: rgb(0.93, 0.27, 0.27), // red color for comparison
  });
  
  page.drawText(cleanForPdf('RAPPORT DE COMPARAISON PDF - iLoveDoc'), {
    x: 30,
    y: height - 45,
    size: 18,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  page.drawText(cleanForPdf('Document de synthese genere automatiquement'), {
    x: 30,
    y: height - 65,
    size: 10,
    font: helveticaFont,
    color: rgb(0.95, 0.95, 0.95),
  });
  
  let y = height - 120;
  
  page.drawText(cleanForPdf(`Genere le : ${new Date().toLocaleString('fr-FR')}`), {
    x: 30,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  y -= 30;
  
  // Section 1: Documents compares
  page.drawText(cleanForPdf('1. DOCUMENTS COMPARES'), {
    x: 30,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  
  y -= 5;
  page.drawLine({ start: { x: 30, y }, end: { x: width - 30, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  
  y -= 25;
  
  // Doc A Details
  page.drawText(cleanForPdf(`Document A (Original) :`), { x: 40, y, size: 10, font: helveticaBold });
  y -= 15;
  page.drawText(cleanForPdf(`- Nom : ${fileAName}`), { x: 50, y, size: 9, font: helveticaFont });
  y -= 12;
  page.drawText(cleanForPdf(`- Taille : ${(fileASize / 1024).toFixed(1)} KB`), { x: 50, y, size: 9, font: helveticaFont });
  y -= 12;
  page.drawText(cleanForPdf(`- Nombre de pages : ${pagesA}`), { x: 50, y, size: 9, font: helveticaFont });
  
  y -= 25;
  
  // Doc B Details
  page.drawText(cleanForPdf(`Document B (Modifie) :`), { x: 40, y, size: 10, font: helveticaBold });
  y -= 15;
  page.drawText(cleanForPdf(`- Nom : ${fileBName}`), { x: 50, y, size: 9, font: helveticaFont });
  y -= 12;
  page.drawText(cleanForPdf(`- Taille : ${(fileBSize / 1024).toFixed(1)} KB`), { x: 50, y, size: 9, font: helveticaFont });
  y -= 12;
  page.drawText(cleanForPdf(`- Nombre de pages : ${pagesB}`), { x: 50, y, size: 9, font: helveticaFont });
  
  y -= 35;
  
  // Section 2: Analyse globale
  page.drawText(cleanForPdf('2. SYNTHESE DE L\'ANALYSE'), {
    x: 30,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  
  y -= 5;
  page.drawLine({ start: { x: 30, y }, end: { x: width - 30, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  
  y -= 25;
  
  const sizeDiff = Math.abs(fileASize - fileBSize);
  const pageDiff = Math.abs(pagesA - pagesB);
  
  page.drawText(cleanForPdf(`- Difference de taille : ${sizeDiff.toLocaleString()} octets`), { x: 40, y, size: 9, font: helveticaFont });
  y -= 15;
  page.drawText(cleanForPdf(`- Difference de pages : ${pageDiff} page(s)`), { x: 40, y, size: 9, font: helveticaFont });
  y -= 15;
  page.drawText(cleanForPdf(`- Mode de comparaison : ${compareMode === 'text' ? 'Texte semantique' : 'Superposition visuelle'}`), { x: 40, y, size: 9, font: helveticaFont });
  y -= 15;
  page.drawText(cleanForPdf(`- Nombre de modifications detectees : ${changes.length}`), { x: 40, y, size: 9, font: helveticaBold });
  
  y -= 25;
  
  if (pagesA !== pagesB) {
    page.drawText(cleanForPdf(`Attention : Les documents n'ont pas le meme nombre de pages.`), { x: 40, y, size: 9, font: helveticaBold, color: rgb(0.9, 0.2, 0.2) });
  } else {
    page.drawText(cleanForPdf(`Confirmation : Les deux documents ont la meme structure de pages.`), { x: 40, y, size: 9, font: helveticaBold, color: rgb(0.1, 0.6, 0.2) });
  }
  
  y -= 40;
  
  // Section 3: Rapport detaille
  page.drawText(cleanForPdf('3. RAPPORT DETAILLE DES CHANGEMENTS'), {
    x: 30,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  
  y -= 5;
  page.drawLine({ start: { x: 30, y }, end: { x: width - 30, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  
  y -= 25;
  
  if (changes.length === 0) {
    page.drawText(cleanForPdf('Aucun changement de texte ou de structure n\'a ete identifie.'), { x: 40, y, size: 10, font: helveticaFont, color: rgb(0.3, 0.3, 0.3) });
  } else {
    // Draw table header
    page.drawRectangle({
      x: 30,
      y: y - 18,
      width: width - 60,
      height: 20,
      color: rgb(0.92, 0.92, 0.92),
    });
    
    page.drawText(cleanForPdf('Page'), { x: 40, y: y - 12, size: 9, font: helveticaBold });
    page.drawText(cleanForPdf('Action'), { x: 80, y: y - 12, size: 9, font: helveticaBold });
    page.drawText(cleanForPdf('Contenu / Modifications'), { x: 170, y: y - 12, size: 9, font: helveticaBold });
    
    y -= 20;
    
    let pageNum = 1;
    
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      
      // If we are getting close to the footer, add a new page
      if (y < 80) {
        // Draw page footer notice before leaving
        page.drawText(cleanForPdf(`Page ${pageNum}`), { x: 280, y: 30, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });
        
        page = pdfDoc.addPage([595, 842]);
        pageNum++;
        y = height - 50;
        
        // Draw page header
        page.drawRectangle({ x: 0, y: height - 40, width: width, height: 40, color: rgb(0.93, 0.27, 0.27) });
        page.drawText(cleanForPdf(`Rapport detaille - Page ${pageNum}`), { x: 30, y: height - 25, size: 12, font: helveticaBold, color: rgb(1, 1, 1) });
        
        y = height - 70;
        
        // Re-draw table header on new page
        page.drawRectangle({
          x: 30,
          y: y - 18,
          width: width - 60,
          height: 20,
          color: rgb(0.92, 0.92, 0.92),
        });
        page.drawText(cleanForPdf('Page'), { x: 40, y: y - 12, size: 9, font: helveticaBold });
        page.drawText(cleanForPdf('Action'), { x: 80, y: y - 12, size: 9, font: helveticaBold });
        page.drawText(cleanForPdf('Contenu / Modifications'), { x: 170, y: y - 12, size: 9, font: helveticaBold });
        y -= 20;
      }
      
      // Alternate row colors
      if (i % 2 === 1) {
        page.drawRectangle({
          x: 30,
          y: y - 18,
          width: width - 60,
          height: 18,
          color: rgb(0.97, 0.97, 0.97),
        });
      }
      
      page.drawText(cleanForPdf(`${change.page}`), { x: 40, y: y - 12, size: 9, font: helveticaFont });
      
      let actionText = 'Modification';
      let actionColor = rgb(0.2, 0.4, 0.8);
      if (change.type === 'addition') {
        actionText = 'Ajout';
        actionColor = rgb(0.1, 0.6, 0.2);
      } else if (change.type === 'deletion') {
        actionText = 'Suppression';
        actionColor = rgb(0.9, 0.2, 0.2);
      }
      
      page.drawText(cleanForPdf(actionText), { x: 80, y: y - 12, size: 9, font: helveticaBold, color: actionColor });
      
      let displayText = '';
      if (change.type === 'modification') {
        displayText = `Existant: "${change.originalText}" -> Nouveau: "${change.text}"`;
      } else {
        displayText = `"${change.text}"`;
      }
      
      page.drawText(cleanForPdf(truncateString(displayText, 75)), { x: 170, y: y - 12, size: 8, font: helveticaFont, color: rgb(0.1, 0.1, 0.1) });
      
      y -= 18;
    }
    
    // Draw final page footer notice
    page.drawText(cleanForPdf(`Page ${pageNum}`), { x: 280, y: 30, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });
  }
  
  // Footer text
  page.drawText(cleanForPdf('Rapport genere via iLoveDoc - 100% gratuit en ligne.'), {
    x: 180,
    y: 15,
    size: 7,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6)
  });
  
  return await pdfDoc.save();
}

function truncateString(str: string, num: number): string {
  if (str.length <= num) return str;
  return str.slice(0, num) + '...';
}
