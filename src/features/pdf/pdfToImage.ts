import JSZip from 'jszip';

export interface PdfToImageOptions {
  format: 'jpg' | 'png';
  quality: 'high' | 'medium' | 'low'; // scale: 3, 2, 1
}

export async function convertPdfToImages(
  file: File,
  options: PdfToImageOptions,
  onProgress: (progress: number) => void
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        throw new Error('La librairie PDF.js n\'est pas chargée.');
      }
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const zip = new JSZip();
      
      const scale = options.quality === 'high' ? 3 : options.quality === 'medium' ? 2 : 1;
      const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
      const ext = options.format;

      // We use a single canvas for all pages to save memory
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Impossible de créer le canvas 2D');

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Draw white background for JPG
        if (options.format === 'jpg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        const dataUrl = canvas.toDataURL(mimeType, options.format === 'jpg' ? 0.9 : undefined);
        const base64Data = dataUrl.split(',')[1];
        
        const pageNumStr = i.toString().padStart(Math.max(3, numPages.toString().length), '0');
        const filename = `${file.name.replace(/\.[^/.]+$/, "")}_page_${pageNumStr}.${ext}`;
        
        zip.file(filename, base64Data, { base64: true });
        
        onProgress((i / numPages) * 100);
      }

      // Generate ZIP
      onProgress(99);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      resolve(zipBlob);

    } catch (err) {
      console.error(err);
      reject(new Error('Erreur lors de la conversion du PDF en images.'));
    }
  });
}
