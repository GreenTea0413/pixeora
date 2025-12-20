import type { Canvas } from '@/types';

/**
 * Generate a thumbnail from canvas data
 * @param canvas - The canvas pixel data
 * @param width - Canvas width
 * @param height - Canvas height
 * @param thumbnailSize - Thumbnail size (default: 128)
 * @returns base64 encoded PNG image
 */
export function generateThumbnail(
  canvas: Canvas,
  width: number,
  height: number,
  thumbnailSize: number = 128
): string {
  // Create a temporary canvas element
  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size to actual pixel dimensions
  tempCanvas.width = width;
  tempCanvas.height = height;

  // Draw each pixel
  canvas.forEach((row, y) => {
    row.forEach((pixel, x) => {
      if (pixel.color && pixel.color !== 'transparent') {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });

  // Create thumbnail canvas
  const thumbnailCanvas = document.createElement('canvas');
  const thumbnailCtx = thumbnailCanvas.getContext('2d');

  if (!thumbnailCtx) {
    throw new Error('Failed to get thumbnail context');
  }

  thumbnailCanvas.width = thumbnailSize;
  thumbnailCanvas.height = thumbnailSize;

  // Disable image smoothing for pixel art
  thumbnailCtx.imageSmoothingEnabled = false;

  // Calculate scaling to fit thumbnail while maintaining aspect ratio
  const scale = Math.min(thumbnailSize / width, thumbnailSize / height);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const offsetX = (thumbnailSize - scaledWidth) / 2;
  const offsetY = (thumbnailSize - scaledHeight) / 2;

  // Draw scaled image centered in thumbnail
  thumbnailCtx.drawImage(
    tempCanvas,
    0, 0, width, height,
    offsetX, offsetY, scaledWidth, scaledHeight
  );

  // Convert to base64
  return thumbnailCanvas.toDataURL('image/png');
}
