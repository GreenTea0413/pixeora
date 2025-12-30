import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Canvas, Tool, HistoryState, SavedProject } from '@/types';

interface CanvasStore {
  // Canvas state
  canvas: Canvas;
  canvasWidth: number;
  canvasHeight: number;
  pixelSize: number;

  // Zoom and Pan state
  zoom: number;
  panX: number;
  panY: number;

  // Tool state
  currentTool: Tool;
  currentColor: string;

  // Custom color palette
  savedColors: string[];

  // History (Undo/Redo)
  history: HistoryState[];
  historyIndex: number;

  // Actions
  setPixel: (x: number, y: number, color: string) => void;
  clearCanvas: () => void;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  addColorToPalette: (color: string) => void;
  removeColorFromPalette: (color: string) => void;
  undo: () => void;
  redo: () => void;
  initCanvas: (width: number, height: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
  resetView: () => void;
  loadProject: (project: SavedProject) => void;
  getPixelColor: (x: number, y: number) => string | null;
  fillArea: (x: number, y: number, newColor: string) => void;
}

const createEmptyCanvas = (width: number, height: number): Canvas => {
  return Array(height).fill(null).map(() =>
    Array(width).fill(null).map(() => ({ color: 'transparent' }))
  );
};

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      // Initial state
      canvas: createEmptyCanvas(32, 32),
      canvasWidth: 32,
      canvasHeight: 32,
      pixelSize: 16,
      zoom: 1,
      panX: 0,
      panY: 0,
      currentTool: 'pen',
      currentColor: '#000000',
      savedColors: [],
      history: [],
      historyIndex: -1,

  // Initialize canvas
  initCanvas: (width: number, height: number) => {
    const newCanvas = createEmptyCanvas(width, height);
    const maxDimension = Math.max(width, height);
    // 256 이상이면 픽셀 크기 5px 고정, 작은 캔버스는 자동 계산
    const newPixelSize = maxDimension >= 256 ? 5 : Math.max(1, Math.floor(1800 / maxDimension));

    set({
      canvas: newCanvas,
      canvasWidth: width,
      canvasHeight: height,
      pixelSize: newPixelSize,
      history: [{ canvas: newCanvas, timestamp: Date.now() }],
      historyIndex: 0,
    });
  },

  // Set pixel color
  setPixel: (x: number, y: number, color: string) => {
    const { canvas, canvasWidth, canvasHeight, history, historyIndex } = get();

    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) return;

    const newCanvas = canvas.map((row, rowIndex) =>
      row.map((pixel, colIndex) =>
        rowIndex === y && colIndex === x ? { color } : pixel
      )
    );

    const now = Date.now();
    const MERGE_THRESHOLD = 300; // Merge changes within 300ms

    // Check if we should merge with the last history entry
    const shouldMerge =
      history.length > 0 &&
      historyIndex === history.length - 1 &&
      now - history[historyIndex].timestamp < MERGE_THRESHOLD;

    if (shouldMerge) {
      // Update the last history entry instead of creating a new one
      const newHistory = [...history];
      newHistory[historyIndex] = { canvas: newCanvas, timestamp: now };

      set({
        canvas: newCanvas,
        history: newHistory,
      });
    } else {
      // Add new history entry
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ canvas: newCanvas, timestamp: now });

      set({
        canvas: newCanvas,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    }
  },

  // Clear canvas
  clearCanvas: () => {
    const { canvasWidth, canvasHeight } = get();
    const newCanvas = createEmptyCanvas(canvasWidth, canvasHeight);

    const newHistory = get().history.slice(0, get().historyIndex + 1);
    newHistory.push({ canvas: newCanvas, timestamp: Date.now() });

    set({
      canvas: newCanvas,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  // Set tool
  setTool: (tool: Tool) => set({ currentTool: tool }),

  // Set color
  setColor: (color: string) => set({ currentColor: color }),

  // Add color to palette
  addColorToPalette: (color: string) => {
    const { savedColors } = get();
    if (!savedColors.includes(color) && savedColors.length < 20) {
      set({ savedColors: [...savedColors, color] });
    }
  },

  // Remove color from palette
  removeColorFromPalette: (color: string) => {
    const { savedColors } = get();
    set({ savedColors: savedColors.filter((c) => c !== color) });
  },

  // Set canvas size
  setCanvasSize: (width: number, height: number) => {
    const newCanvas = createEmptyCanvas(width, height);
    const maxDimension = Math.max(width, height);
    // 256 이상이면 픽셀 크기 5px 고정, 작은 캔버스는 자동 계산
    const newPixelSize = maxDimension >= 256 ? 5 : Math.max(1, Math.floor(1800 / maxDimension));

    set({
      canvas: newCanvas,
      canvasWidth: width,
      canvasHeight: height,
      pixelSize: newPixelSize,
      history: [{ canvas: newCanvas, timestamp: Date.now() }],
      historyIndex: 0,
    });
  },

  // Undo
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        canvas: history[newIndex].canvas,
        historyIndex: newIndex,
      });
    }
  },

  // Redo
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        canvas: history[newIndex].canvas,
        historyIndex: newIndex,
      });
    }
  },

  // Set zoom level
  setZoom: (zoom: number) => {
    set({ zoom: Math.max(0.1, Math.min(10, zoom)) });
  },

  // Set pan offset
  setPan: (panX: number, panY: number) => {
    set({ panX, panY });
  },

  // Reset view
  resetView: () => {
    set({ zoom: 1, panX: 0, panY: 0 });
  },

  // Load project
  loadProject: (project: SavedProject) => {
    const maxDimension = Math.max(project.canvasWidth, project.canvasHeight);
    // 256 이상이면 픽셀 크기 5px 고정, 작은 캔버스는 자동 계산
    const newPixelSize = maxDimension >= 256 ? 5 : Math.max(1, Math.floor(1800 / maxDimension));

    set({
      canvas: project.canvas,
      canvasWidth: project.canvasWidth,
      canvasHeight: project.canvasHeight,
      pixelSize: newPixelSize,
      savedColors: project.savedColors || [],
      history: [{ canvas: project.canvas, timestamp: Date.now() }],
      historyIndex: 0,
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },

  // Get pixel color (for eyedropper)
  getPixelColor: (x: number, y: number) => {
    const { canvas, canvasWidth, canvasHeight } = get();

    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) {
      return null;
    }

    return canvas[y][x].color;
  },

  // Fill area (flood fill algorithm)
  fillArea: (x: number, y: number, newColor: string) => {
    const { canvas, canvasWidth, canvasHeight } = get();

    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) return;

    const targetColor = canvas[y][x].color;

    // Don't fill if the color is the same
    if (targetColor === newColor) return;

    // Create a copy of the canvas
    const newCanvas = canvas.map(row => row.map(pixel => ({ ...pixel })));

    // BFS flood fill
    const queue: [number, number][] = [[x, y]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [currentX, currentY] = queue.shift()!;
      const key = `${currentX},${currentY}`;

      if (visited.has(key)) continue;
      if (currentX < 0 || currentX >= canvasWidth || currentY < 0 || currentY >= canvasHeight) continue;
      if (newCanvas[currentY][currentX].color !== targetColor) continue;

      visited.add(key);
      newCanvas[currentY][currentX].color = newColor;

      // Add adjacent pixels
      queue.push([currentX + 1, currentY]);
      queue.push([currentX - 1, currentY]);
      queue.push([currentX, currentY + 1]);
      queue.push([currentX, currentY - 1]);
    }

    // Add to history
    const newHistory = get().history.slice(0, get().historyIndex + 1);
    newHistory.push({ canvas: newCanvas, timestamp: Date.now() });

    set({
      canvas: newCanvas,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
    }),
    {
      name: 'pixelket-canvas',
      partialize: (state) => ({ savedColors: state.savedColors }),
    }
  )
);
