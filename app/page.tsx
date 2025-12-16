'use client';

import Canvas from '@/components/Canvas';
import Toolbar from '@/components/Toolbar';
import ColorPicker from '@/components/ColorPicker';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguageStore } from '@/store/useLanguageStore';

export default function Home() {
  const { t } = useLanguageStore();
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-pixel text-white tracking-wider">
                {t.header.title}
              </h1>
              <p className="text-sm text-gray-400 mt-2">{t.header.subtitle}</p>
            </div>
            <div className="flex gap-2 items-center">
              <LanguageSelector />
              <button className="btn-primary text-sm">
                {t.header.export}
              </button>
              <button className="btn-secondary text-sm">
                {t.header.save}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Toolbar />
          </div>

          {/* Center - Canvas */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <Canvas />
            </div>

            {/* Canvas Info */}
            <div className="mt-4 text-center text-sm text-gray-500 font-pixel">
              <p>{t.canvas.info}</p>
            </div>
          </div>

          {/* Right Sidebar - Color Picker */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <ColorPicker />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-sm text-gray-600 font-pixel">
        <p>{t.footer.text}</p>
      </footer>
    </div>
  );
}
