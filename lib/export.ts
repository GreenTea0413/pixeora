import type { Canvas } from '@/types';

export type ExportFormat = 'png' | 'jpg';
export type ExportScale = 1 | 2 | 4 | 8;

interface ExportOptions {
  canvas: Canvas;
  width: number;
  height: number;
  format: ExportFormat;
  scale: ExportScale;
  filename?: string;
}

/**
 * Export canvas as an image file
 */
export function exportCanvas({
  canvas,
  width,
  height,
  format,
  scale,
  filename = 'pixeora-art'
}: ExportOptions): void {
  // Create a temporary canvas element
  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size with scale
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  tempCanvas.width = scaledWidth;
  tempCanvas.height = scaledHeight;

  // Disable image smoothing for pixel art
  ctx.imageSmoothingEnabled = false;

  // Fill with white background for JPG (JPG doesn't support transparency)
  if (format === 'jpg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, scaledWidth, scaledHeight);
  }

  // Draw each pixel scaled up
  canvas.forEach((row, y) => {
    row.forEach((pixel, x) => {
      if (pixel.color && pixel.color !== 'transparent') {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    });
  });

  // Convert to blob and download
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = format === 'jpg' ? 0.95 : undefined;

  tempCanvas.toBlob(
    (blob) => {
      if (!blob) {
        throw new Error('Failed to create blob');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    mimeType,
    quality
  );
}

/**
 * Get the file size estimate for export
 */
export function getEstimatedFileSize(
  width: number,
  height: number,
  scale: ExportScale,
  format: ExportFormat
): string {
  const pixels = width * height * scale * scale;

  // Rough estimates
  let bytes: number;
  if (format === 'png') {
    bytes = pixels * 4; // RGBA
  } else {
    bytes = pixels * 3 * 0.1; // JPG compression ~10%
  }

  // Convert to KB or MB
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
