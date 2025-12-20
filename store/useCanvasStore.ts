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
    const maxDisplaySize = 800;
    const maxDimension = Math.max(width, height);
    const newPixelSize = Math.max(1, Math.floor(maxDisplaySize / maxDimension));

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
    const { canvas, canvasWidth, canvasHeight } = get();

    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) return;

    const newCanvas = canvas.map((row, rowIndex) =>
      row.map((pixel, colIndex) =>
        rowIndex === y && colIndex === x ? { color } : pixel
      )
    );

    // Add to history
    const newHistory = get().history.slice(0, get().historyIndex + 1);
    newHistory.push({ canvas: newCanvas, timestamp: Date.now() });

    set({
      canvas: newCanvas,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
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
    // 최대 표시 크기를 800px로 유지하고 픽셀 크기 자동 조정
    const maxDisplaySize = 800;
    const maxDimension = Math.max(width, height);
    const newPixelSize = Math.max(1, Math.floor(maxDisplaySize / maxDimension));

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
    const maxDisplaySize = 800;
    const maxDimension = Math.max(project.canvasWidth, project.canvasHeight);
    const newPixelSize = Math.max(1, Math.floor(maxDisplaySize / maxDimension));

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
    }),
    {
      name: 'pixeora-canvas',
      partialize: (state) => ({ savedColors: state.savedColors }),
    }
  )
);
