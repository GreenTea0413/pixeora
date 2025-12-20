'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Download, FileImage } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { exportCanvas, getEstimatedFileSize, type ExportFormat, type ExportScale } from '@/lib/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState<ExportScale>(1);
  const [filename, setFilename] = useState('pixelket-art');
  const [isExporting, setIsExporting] = useState(false);

  const { canvas, canvasWidth, canvasHeight } = useCanvasStore();
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Update preview when format or scale changes
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;

    const previewCanvas = previewCanvasRef.current;
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    // Set preview canvas size (max 200px)
    const maxPreviewSize = 200;
    const scaledWidth = canvasWidth * scale;
    const scaledHeight = canvasHeight * scale;
    const previewScale = Math.min(maxPreviewSize / scaledWidth, maxPreviewSize / scaledHeight);

    previewCanvas.width = scaledWidth * previewScale;
    previewCanvas.height = scaledHeight * previewScale;

    // Clear canvas
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Fill with white background for JPG
    if (format === 'jpg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    // Disable image smoothing for pixel art
    ctx.imageSmoothingEnabled = false;

    // Draw pixels
    const pixelSize = scale * previewScale;
    canvas.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel.color && pixel.color !== 'transparent') {
          ctx.fillStyle = pixel.color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      });
    });
  }, [canvas, canvasWidth, canvasHeight, format, scale, isOpen]);

  const handleExport = () => {
    setIsExporting(true);

    try {
      exportCanvas({
        canvas,
        width: canvasWidth,
        height: canvasHeight,
        format,
        scale,
        filename: filename.trim() || 'pixelket-art',
      });

      // Close modal after a short delay
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
      alert('내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExporting) {
      handleExport();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const outputWidth = canvasWidth * scale;
  const outputHeight = canvasHeight * scale;
  const estimatedSize = getEstimatedFileSize(canvasWidth, canvasHeight, scale, format);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <FileImage size={20} className="text-green-500" />
            <h2 className="text-lg font-pixel text-white">이미지 내보내기</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex flex-col items-center">
            <label className="block text-sm font-pixel text-neutral-300 mb-2 self-start">
              미리보기
            </label>
            <div
              className="relative bg-neutral-800 rounded border border-neutral-700 p-4 flex items-center justify-center"
              style={{
                backgroundImage: format === 'png'
                  ? 'repeating-conic-gradient(#404040 0% 25%, #2a2a2a 0% 50%) 50% / 20px 20px'
                  : 'none'
              }}
            >
              <canvas
                ref={previewCanvasRef}
                className="max-w-[200px] max-h-[200px]"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {format === 'png' ? '체크보드: 투명 영역' : '흰색 배경 적용'}
            </p>
          </div>

          {/* Filename */}
          <div>
            <label htmlFor="filename" className="block text-sm font-pixel text-neutral-300 mb-2">
              파일 이름
            </label>
            <input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="pixelket-art"
              disabled={isExporting}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-neutral-500 disabled:opacity-50"
              maxLength={50}
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-pixel text-neutral-300 mb-2">
              파일 형식
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('png')}
                disabled={isExporting}
                className={`px-4 py-2 text-sm font-pixel border rounded transition-colors ${
                  format === 'png'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                } disabled:opacity-50`}
              >
                PNG (투명 배경)
              </button>
              <button
                onClick={() => setFormat('jpg')}
                disabled={isExporting}
                className={`px-4 py-2 text-sm font-pixel border rounded transition-colors ${
                  format === 'jpg'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                } disabled:opacity-50`}
              >
                JPG (흰색 배경)
              </button>
            </div>
          </div>

          {/* Scale */}
          <div>
            <label className="block text-sm font-pixel text-neutral-300 mb-2">
              크기 배율
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 4, 8] as ExportScale[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  disabled={isExporting}
                  className={`px-4 py-2 text-sm font-pixel border rounded transition-colors ${
                    scale === s
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                  } disabled:opacity-50`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Output info */}
          <div className="p-3 bg-neutral-800 rounded border border-neutral-700">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>출력 크기:</span>
              <span className="text-neutral-200">{outputWidth} × {outputHeight}px</span>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
              <span>예상 파일 크기:</span>
              <span className="text-neutral-200">{estimatedSize}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-700">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-pixel text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-pixel transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download size={16} />
            <span>{isExporting ? '내보내는 중...' : '내보내기'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
