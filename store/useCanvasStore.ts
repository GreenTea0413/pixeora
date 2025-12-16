import { create } from 'zustand';
import type { Canvas, Tool, HistoryState } from '@/types';

interface CanvasStore {
  // Canvas state
  canvas: Canvas;
  canvasWidth: number;
  canvasHeight: number;
  pixelSize: number;

  // Tool state
  currentTool: Tool;
  currentColor: string;

  // History (Undo/Redo)
  history: HistoryState[];
  historyIndex: number;

  // Actions
  setPixel: (x: number, y: number, color: string) => void;
  clearCanvas: () => void;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  undo: () => void;
  redo: () => void;
  initCanvas: (width: number, height: number) => void;
}

const createEmptyCanvas = (width: number, height: number): Canvas => {
  return Array(height).fill(null).map(() =>
    Array(width).fill(null).map(() => ({ color: 'transparent' }))
  );
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  // Initial state
  canvas: createEmptyCanvas(32, 32),
  canvasWidth: 32,
  canvasHeight: 32,
  pixelSize: 16,
  currentTool: 'pen',
  currentColor: '#000000',
  history: [],
  historyIndex: -1,

  // Initialize canvas
  initCanvas: (width: number, height: number) => {
    const newCanvas = createEmptyCanvas(width, height);
    set({
      canvas: newCanvas,
      canvasWidth: width,
      canvasHeight: height,
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

  // Set canvas size
  setCanvasSize: (width: number, height: number) => {
    const newCanvas = createEmptyCanvas(width, height);
    set({
      canvas: newCanvas,
      canvasWidth: width,
      canvasHeight: height,
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
}));
