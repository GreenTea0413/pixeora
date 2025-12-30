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

    // Draw grid - adjust line width based on zoom to remain visible when zoomed
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = Math.max(0.5, 1 / zoom);

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
  }, [canvas, canvasWidth, canvasHeight, pixelSize, zoom]);

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

  // Handle zoom with Alt + mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Only zoom when Alt is pressed
    if (e.altKey) {
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

  // Get cursor style based on current tool (using exact Lucide icons from Toolbar)
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';

    switch (currentTool) {
      case 'pen':
        // Lucide Pencil icon - exact match with Toolbar
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\'%3E%3Cpath d=\'m21.174 6.812-1.061-1.06-1.061-1.061a1.414 1.414 0 0 0-2.001 0L3.842 17.901a2 2 0 0 0-.586 1.414v0l-.235 2.352a.5.5 0 0 0 .5.5l2.352-.235a2 2 0 0 0 1.414-.586L20.496 7.873a1.414 1.414 0 0 0 .678-1.061z\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m21.174 6.812-1.061-1.06-1.061-1.061a1.414 1.414 0 0 0-2.001 0L3.842 17.901a2 2 0 0 0-.586 1.414v0l-.235 2.352a.5.5 0 0 0 .5.5l2.352-.235a2 2 0 0 0 1.414-.586L20.496 7.873a1.414 1.414 0 0 0 .678-1.061z\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m15 5 4 4\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m15 5 4 4\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 2 20, crosshair';
      case 'eraser':
        // Lucide Eraser icon - exact match with Toolbar
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\'%3E%3Cpath d=\'m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.5L13 21\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.5L13 21\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M22 21H7\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M22 21H7\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m5 11 9 9\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m5 11 9 9\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 2 20, auto';
      case 'fill':
        // Lucide PaintBucket icon - exact match with Toolbar
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\'%3E%3Cpath d=\'M19 12H2\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M19 12H2\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m6 2 5 5\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m6 2 5 5\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 2 20, auto';
      case 'eyedropper':
        // Lucide Pipette icon - exact match with Toolbar
        return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\'%3E%3Cpath d=\'m2 22 1-1h3l9-9\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m2 22 1-1h3l9-9\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M3 21v-3l9-9\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'M3 21v-3l9-9\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l-3-3Z\' stroke=\'white\' stroke-width=\'3.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3Cpath d=\'m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l-3-3Z\' stroke=\'black\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 2 20, auto';
      default:
        return 'crosshair';
    }
  };

  // Prevent context menu and maintain cursor
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto bg-neutral-800 rounded"
      style={{ maxWidth: '1400px', maxHeight: '700px', width: '100%', height: '700px' }}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    >
      <div
        className="flex items-center justify-center p-8"
        style={{
          transform: `translate(${panX}px, ${panY}px)`,
          minWidth: '100%',
          minHeight: '100%',
        }}
        onContextMenu={handleContextMenu}
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
          onContextMenu={handleContextMenu}
        />
      </div>
    </div>
  );
}
