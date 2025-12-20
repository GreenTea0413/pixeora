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
        return 'crosshair';
      case 'eraser':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'%3E%3Cpath d=\'m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.5L13 21\'/%3E%3Cpath d=\'M22 21H7\'/%3E%3Cpath d=\'m5 11 9 9\'/%3E%3C/svg%3E") 2 18, auto';
      case 'fill':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'white\' stroke=\'black\' stroke-width=\'1.5\'%3E%3Cpath d=\'m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982\'/%3E%3Cpath d=\'m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353\'/%3E%3Cpath d=\'m15 5 4 4\'/%3E%3Cpath d=\'m2 22 1-1\'/%3E%3C/svg%3E") 2 18, auto';
      case 'eyedropper':
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'%3E%3Cpath d=\'m2 22 1-1h3l9-9\'/%3E%3Cpath d=\'M3 21v-3l9-9\'/%3E%3Cpath d=\'m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l-3-3Z\'/%3E%3C/svg%3E") 2 18, auto';
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
