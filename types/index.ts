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
