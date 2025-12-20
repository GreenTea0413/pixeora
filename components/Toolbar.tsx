'use client';

import { useCanvasStore } from '@/store/useCanvasStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Pencil, Eraser, PaintBucket, Pipette, Undo, Redo, Trash2 } from 'lucide-react';
import type { Tool } from '@/types';

const tools: { name: Tool; icon: React.ComponentType<{ size?: number }>; shortcut: string }[] = [
  { name: 'pen', icon: Pencil, shortcut: 'Q' },
  { name: 'eraser', icon: Eraser, shortcut: 'W' },
  { name: 'fill', icon: PaintBucket, shortcut: 'E' },
  { name: 'eyedropper', icon: Pipette, shortcut: 'R' },
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
    <div className="flex flex-col gap-3 p-3 bg-neutral-900 border border-neutral-700">
      {/* Tools */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xs font-pixel text-neutral-400 mb-1">{t.tools.title}</h3>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.name}
              onClick={() => setTool(tool.name)}
              className={`
                flex items-center justify-between gap-2 px-2 py-1.5 transition-all text-xs font-pixel
                ${
                  currentTool === tool.name
                    ? 'bg-green-600 text-white'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }
              `}
            >
              <div className="flex items-center gap-1.5">
                <Icon size={16} />
                <span>{getToolLabel(tool.name)}</span>
              </div>
              <span className="text-[10px] opacity-60">{tool.shortcut}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-700" />

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xs font-pixel text-neutral-400 mb-1">{t.actions.title}</h3>
        <button
          onClick={undo}
          className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-pixel transition-colors flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5">
            <Undo size={16} />
            <span>{t.actions.undo}</span>
          </div>
          <span className="text-[10px] opacity-60">A</span>
        </button>
        <button
          onClick={redo}
          className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-pixel transition-colors flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5">
            <Redo size={16} />
            <span>{t.actions.redo}</span>
          </div>
          <span className="text-[10px] opacity-60">S</span>
        </button>
        <button
          onClick={clearCanvas}
          className="px-2 py-1.5 bg-red-900 hover:bg-red-800 text-red-200 text-xs font-pixel transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 size={16} />
          <span>{t.actions.clear}</span>
        </button>
      </div>
    </div>
  );
}
