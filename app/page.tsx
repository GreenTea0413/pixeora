import Canvas from '@/components/Canvas';
import Toolbar from '@/components/Toolbar';
import ColorPicker from '@/components/ColorPicker';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Pixeora
              </h1>
              <p className="text-sm text-gray-600 mt-1">Free Pixel Art Editor</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                Export PNG
              </button>
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                Save
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
            <div className="bg-white rounded-lg shadow-xl p-4">
              <Canvas />
            </div>

            {/* Canvas Info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>32 × 32 pixels | Click and drag to draw</p>
            </div>
          </div>

          {/* Right Sidebar - Color Picker */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <ColorPicker />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-sm text-gray-500">
        <p>Made with ❤️ by Pixeora | Free Pixel Art Editor</p>
      </footer>
    </div>
  );
}
