import { EXPORT_FORMATS } from './constants';

/**
 * Export SVG as PNG
 */
export function exportAsPNG(
  svgElement: SVGSVGElement,
  filename: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const scaleFactor = 2; // For better quality
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;

          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }

          const pngFile = canvas.toDataURL(EXPORT_FORMATS.PNG);
          downloadFile(pngFile, `${filename}.png`);
          resolve();
        } catch {
          reject(new Error('Failed to generate PNG'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = `data:${EXPORT_FORMATS.SVG};base64,${btoa(svgData)}`;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Export SVG
 */
export function exportAsSVG(svgElement: SVGSVGElement, filename: string): void {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: EXPORT_FORMATS.SVG });
  const url = URL.createObjectURL(blob);

  downloadFile(url, `${filename}.svg`);
  URL.revokeObjectURL(url);
}

/**
 * Download a file
 */
function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get safe filename from diagram name
 */
export function getSafeFilename(diagramName: string): string {
  return diagramName.trim() || 'mermaid-diagram';
}
