'use client';

import { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const {
    canvas,
    canvasWidth,
    canvasHeight,
    pixelSize,
    zoom,
    panX,
    panY,
    currentTool,
    currentColor,
    setPixel,
    initCanvas,
    setZoom,
    setPan,
    setColor,
    getPixelColor,
    fillArea,
  } = useCanvasStore();

  // Initialize canvas on mount
  useEffect(() => {
    initCanvas(32, 32);
  }, [initCanvas]);

  // Render canvas
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth * pixelSize, canvasHeight * pixelSize);

    // Draw grid
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= canvasWidth; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, canvasHeight * pixelSize);
      ctx.stroke();
    }

    for (let i = 0; i <= canvasHeight; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(canvasWidth * pixelSize, i * pixelSize);
      ctx.stroke();
    }

    // Draw pixels
    canvas.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel.color !== 'transparent') {
          ctx.fillStyle = pixel.color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      });
    });
  }, [canvas, canvasWidth, canvasHeight, pixelSize]);

  // Get pixel coordinates with zoom adjustment
  const getPixelCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return null;

    const rect = canvasElement.getBoundingClientRect();
    // Adjust for zoom
    const x = Math.floor((e.clientX - rect.left) / (pixelSize * zoom));
    const y = Math.floor((e.clientY - rect.top) / (pixelSize * zoom));

    return { x, y };
  };

  // Handle zoom with Ctrl/Cmd + mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Only zoom when Ctrl or Cmd is pressed
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = zoom * delta;
      setZoom(newZoom);
    }
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Middle mouse button or Shift + left mouse button for panning
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    // Normal drawing
    if (e.button === 0 && !isPanning) {
      const coords = getPixelCoordinates(e);
      if (!coords) return;

      // Eyedropper tool - pick color
      if (currentTool === 'eyedropper') {
        const color = getPixelColor(coords.x, coords.y);
        if (color && color !== 'transparent') {
          setColor(color);
        }
        return;
      }

      // Fill tool - flood fill
      if (currentTool === 'fill') {
        fillArea(coords.x, coords.y, currentColor);
        return;
      }

      // Pen and Eraser tools
      setIsDrawing(true);
      const color = currentTool === 'eraser' ? 'transparent' : currentColor;
      setPixel(coords.x, coords.y, color);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(panX + deltaX, panY + deltaY);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;

    const coords = getPixelCoordinates(e);
    if (coords) {
      const color = currentTool === 'eraser' ? 'transparent' : currentColor;
      setPixel(coords.x, coords.y, color);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  // Get cursor style based on current tool
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';

    switch (currentTool) {
      case 'pen':
        // Simple pencil icon - clean and minimal
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\'%3E%3Cpath d=\'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z\' stroke=\'white\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z\' stroke=\'black\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 1 17, crosshair';
      case 'eraser':
        // Clean eraser icon
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\'%3E%3Cpath d=\'M7 21h10M5 11l9-9 7 7-9 9H5l5-5z\' stroke=\'white\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M7 21h10M5 11l9-9 7 7-9 9H5l5-5z\' stroke=\'black\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 2 18, auto';
      case 'fill':
        // Paint bucket icon - simplified
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\'%3E%3Cpath d=\'M10 10l-6.2 6.2a2 2 0 00-.5.8l-1.3 4.4c-.1.4.3.8.7.6l4.4-1.3c.3-.1.6-.3.8-.5L14 14m-1-1l4.4-4.3a1 1 0 111.4 1.4L14.4 14.6m3.6-8.6l4 4\' stroke=\'white\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M10 10l-6.2 6.2a2 2 0 00-.5.8l-1.3 4.4c-.1.4.3.8.7.6l4.4-1.3c.3-.1.6-.3.8-.5L14 14m-1-1l4.4-4.3a1 1 0 111.4 1.4L14.4 14.6m3.6-8.6l4 4\' stroke=\'black\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 2 18, auto';
      case 'eyedropper':
        // Eyedropper icon - clean lines
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\'%3E%3Cpath d=\'M2 22l1-1h3l9-9m-3-3l3.4-3.4a2 2 0 012.8 2.8L14 12\' stroke=\'white\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M2 22l1-1h3l9-9m-3-3l3.4-3.4a2 2 0 012.8 2.8L14 12\' stroke=\'black\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 2 18, auto';
      default:
        return 'crosshair';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto bg-neutral-800 rounded"
      style={{ maxWidth: '1400px', maxHeight: '900px', width: '100%', height: '700px' }}
      onWheel={handleWheel}
    >
      <div
        className="flex items-center justify-center p-8"
        style={{
          transform: `translate(${panX}px, ${panY}px)`,
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth * pixelSize}
          height={canvasHeight * pixelSize}
          className="border-2 border-neutral-300 shadow-lg bg-white"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            cursor: getCursorStyle(),
            imageRendering: 'pixelated',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
}
