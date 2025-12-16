'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useLanguageStore } from '@/store/useLanguageStore';

const presetColors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00',
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
];

export default function ColorPicker() {
  const { currentColor, setColor } = useCanvasStore();
  const { t } = useLanguageStore();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="panel flex flex-col gap-4">
      <h3 className="text-pixel-label">{t.color.title}</h3>

      {/* Current Color */}
      <div className="flex items-center gap-3">
        <div
          className="w-16 h-16 border-2 border-gray-600 cursor-pointer"
          style={{ backgroundColor: currentColor }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 font-pixel">{t.color.hex}</span>
          <span className="text-sm font-pixel text-gray-300">{currentColor}</span>
        </div>
      </div>

      {/* Color Picker */}
      {showPicker && (
        <div className="mt-2">
          <HexColorPicker color={currentColor} onChange={setColor} />
        </div>
      )}

      {/* Preset Colors */}
      <div>
        <h4 className="text-sm font-pixel text-gray-500 mb-2">{t.color.presets}</h4>
        <div className="grid grid-cols-4 gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              onClick={() => setColor(color)}
              className={`
                w-10 h-10 border-2 transition-all
                ${
                  currentColor === color
                    ? 'border-green-500 scale-110'
                    : 'border-gray-600 hover:scale-105'
                }
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
