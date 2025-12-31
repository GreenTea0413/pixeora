'use client';

import { useState, useEffect } from 'react';
import Canvas from '@/components/Canvas';
import ColorPicker from '@/components/ColorPicker';
import CanvasSettings from '@/components/CanvasSettings';
import ShortcutsGuide from '@/components/ShortcutsGuide';
import LanguageSelector from '@/components/LanguageSelector';
import SaveModal from '@/components/SaveModal';
import ProjectsModal from '@/components/ProjectsModal';
import ExportModal from '@/components/ExportModal';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Download, Save, FolderOpen } from 'lucide-react';
import type { SavedProject } from '@/types';

export default function Home() {
  const { t } = useLanguageStore();
  const { loadProject, setTool, undo, redo } = useCanvasStore();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleLoadProject = (project: SavedProject) => {
    loadProject(project);
  };

  // Keyboard shortcuts (using e.code for Korean keyboard support)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ignore if any modal is open
      if (isSaveModalOpen || isProjectsModalOpen || isExportModalOpen) {
        return;
      }

      // Ignore if Alt/Cmd/Alt is pressed (to avoid conflicts with browser shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Use e.code instead of e.key for Korean keyboard support
      switch (e.code) {
        case 'KeyQ':
          setTool('pen');
          e.preventDefault();
          break;
        case 'KeyW':
          setTool('eraser');
          e.preventDefault();
          break;
        case 'KeyE':
          setTool('fill');
          e.preventDefault();
          break;
        case 'KeyR':
          setTool('eyedropper');
          e.preventDefault();
          break;
        case 'KeyA':
          undo();
          e.preventDefault();
          break;
        case 'KeyS':
          redo();
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, undo, redo, isSaveModalOpen, isProjectsModalOpen, isExportModalOpen]);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-pixel text-white tracking-wider">
                {t.header.title}
              </h1>
              <p className="text-xs text-gray-400 mt-2">{t.header.subtitle}</p>
            </div>
            <div className="flex gap-2 items-center">
              <LanguageSelector />
              <button
                onClick={() => setIsProjectsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-pixel transition-colors flex items-center justify-center gap-1.5"
              >
                <FolderOpen size={16} />
                <span>불러오기</span>
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-pixel transition-colors flex items-center justify-center gap-1.5"
              >
                <Download size={16} />
                <span>{t.header.export}</span>
              </button>
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-pixel transition-colors flex items-center justify-center gap-1.5"
              >
                <Save size={16} />
                <span>{t.header.save}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-2 py-8">
        <div className="max-w-[1800px] mx-auto space-y-4">
          {/* Shortcuts Guide */}
          <ShortcutsGuide />

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
            {/* Center - Canvas */}
            <div className="flex flex-col items-center">
              <div className="bg-neutral-900 rounded-lg border border-neutral-700 p-2">
                <Canvas />
              </div>
            </div>

            {/* Right Sidebar - Color Picker + Canvas Settings */}
            <div className="lg:sticky lg:top-8 lg:self-start space-y-3">
              <ColorPicker />
              <CanvasSettings />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-2 py-8 text-center text-xs text-neutral-600 font-pixel">
        <p>{t.footer.text}</p>
      </footer>

      {/* Modals */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        onLoadProject={handleLoadProject}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
