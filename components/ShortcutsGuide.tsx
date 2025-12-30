'use client';

import { useLanguageStore } from '@/store/useLanguageStore';
import { Pencil, Eraser, PaintBucket, Pipette, Undo, Redo } from 'lucide-react';

const shortcuts = [
  { key: 'Q', icon: Pencil, labelKey: 'pen' as const },
  { key: 'W', icon: Eraser, labelKey: 'eraser' as const },
  { key: 'E', icon: PaintBucket, labelKey: 'fill' as const },
  { key: 'R', icon: Pipette, labelKey: 'eyedropper' as const },
  { key: 'A', icon: Undo, labelKey: 'undo' as const },
  { key: 'S', icon: Redo, labelKey: 'redo' as const },
];

export default function ShortcutsGuide() {
  const { t } = useLanguageStore();

  const getLabel = (labelKey: string) => {
    switch (labelKey) {
      case 'pen':
        return t.tools.pen;
      case 'eraser':
        return t.tools.eraser;
      case 'fill':
        return t.tools.fill;
      case 'eyedropper':
        return t.tools.eyedropper;
      case 'undo':
        return t.actions.undo;
      case 'redo':
        return t.actions.redo;
      default:
        return labelKey;
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded px-4 py-3">
      <div className="flex flex-wrap items-center gap-4 justify-center">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <div
              key={shortcut.key}
              className="flex items-center gap-2 text-neutral-300"
            >
              <Icon size={14} className="text-neutral-400" />
              <span className="text-xs font-pixel">{getLabel(shortcut.labelKey)}</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-[10px] font-pixel text-neutral-400">
                {shortcut.key}
              </kbd>
            </div>
          );
        })}
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="text-xs font-pixel">확대/축소</span>
          <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-[10px] font-pixel text-neutral-400">
            Alt + 휠
          </kbd>
        </div>
      </div>
    </div>
  );
}
