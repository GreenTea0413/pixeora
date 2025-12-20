export type Tool = 'pen' | 'eraser' | 'fill' | 'eyedropper';

export type Pixel = {
  color: string;
};

export type Canvas = Pixel[][];

export type CanvasSize = {
  width: number;
  height: number;
};

export type HistoryState = {
  canvas: Canvas;
  timestamp: number;
};

export type SavedProject = {
  id: string;
  name: string;
  canvas: Canvas;
  canvasWidth: number;
  canvasHeight: number;
  thumbnail: string; // base64 encoded image
  createdAt: number;
  updatedAt: number;
  savedColors?: string[];
};

export type SortOption = 'latest' | 'oldest' | 'name';
