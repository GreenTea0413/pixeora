'use client';

import { useCanvasStore } from '@/store/useCanvasStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import type { Tool } from '@/types';

const tools: { name: Tool; icon: string }[] = [
  { name: 'pen', icon: '✏️' },
  { name: 'eraser', icon: '🧹' },
  { name: 'fill', icon: '🪣' },
  { name: 'eyedropper', icon: '💧' },
];

export default function Toolbar() {
  const { currentTool, setTool, clearCanvas, undo, redo } = useCanvasStore();
  const { t } = useLanguageStore();

  const getToolLabel = (toolName: Tool) => {
    switch (toolName) {
      case 'pen':
        return t.tools.pen;
      case 'eraser':
        return t.tools.eraser;
      case 'fill':
        return t.tools.fill;
      case 'eyedropper':
        return t.tools.eyedropper;
    }
  };

  return (
    <div className="panel flex flex-col gap-4">
      {/* Tools */}
      <div className="flex flex-col gap-2">
        <h3 className="text-pixel-label mb-2">{t.tools.title}</h3>
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => setTool(tool.name)}
            className={`
              flex items-center gap-2 px-3 py-2 transition-all text-sm font-pixel
              ${
                currentTool === tool.name
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }
            `}
          >
            <span className="text-lg">{tool.icon}</span>
            <span>{getToolLabel(tool.name)}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <h3 className="text-pixel-label mb-2">{t.actions.title}</h3>
        <button
          onClick={undo}
          className="btn-secondary text-sm"
        >
          {t.actions.undo}
        </button>
        <button
          onClick={redo}
          className="btn-secondary text-sm"
        >
          {t.actions.redo}
        </button>
        <button
          onClick={clearCanvas}
          className="btn-danger text-sm"
        >
          {t.actions.clear}
        </button>
      </div>
    </div>
  );
}
