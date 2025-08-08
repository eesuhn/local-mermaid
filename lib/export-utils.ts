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
      // Get the SVG dimensions
      const svgRect = svgElement.getBoundingClientRect();
      const viewBox = svgElement.viewBox.baseVal;

      // Use viewBox dimensions if available, otherwise use bounding rect
      const svgWidth = viewBox.width > 0 ? viewBox.width : svgRect.width;
      const svgHeight = viewBox.height > 0 ? viewBox.height : svgRect.height;

      // Calculate scale factor based on diagram size for high quality export
      // Smaller diagrams get higher scale, larger diagrams get optimized scale
      const maxDimension = Math.max(svgWidth, svgHeight);
      let scaleFactor: number;

      if (maxDimension <= 300) {
        scaleFactor = 4; // Very small diagrams - high quality
      } else if (maxDimension <= 600) {
        scaleFactor = 3; // Small diagrams - high quality
      } else if (maxDimension <= 1000) {
        scaleFactor = 2.5; // Medium diagrams - good quality
      } else if (maxDimension <= 1500) {
        scaleFactor = 2; // Large diagrams - balanced quality
      } else {
        scaleFactor = 1.5; // Very large diagrams - optimized for file size
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          // Set canvas dimensions based on actual SVG size and scale factor
          canvas.width = svgWidth * scaleFactor;
          canvas.height = svgHeight * scaleFactor;

          if (ctx) {
            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Fill with white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the image at the calculated size
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }

          const pngFile = canvas.toDataURL(EXPORT_FORMATS.PNG, 0.95); // High quality
          downloadFile(pngFile, `${filename}.png`);
          resolve();
        } catch {
          reject(new Error('Failed to generate PNG'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load SVG'));

      // Create a properly sized SVG data URL
      const svgWithSize =
        svgData.includes('width=') && svgData.includes('height=')
          ? svgData
          : svgData.replace(
              '<svg',
              `<svg width="${svgWidth}" height="${svgHeight}"`
            );

      img.src = `data:${EXPORT_FORMATS.SVG};base64,${btoa(svgWithSize)}`;
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
