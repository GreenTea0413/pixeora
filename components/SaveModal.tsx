'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useProjectStore } from '@/store/useProjectStore';
import { generateThumbnail } from '@/lib/thumbnail';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveModal({ isOpen, onClose }: SaveModalProps) {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { canvas, canvasWidth, canvasHeight, savedColors } = useCanvasStore();
  const { saveProject, canSaveNewProject } = useProjectStore();

  const handleSave = () => {
    // Validate project name
    if (!projectName.trim()) {
      setError('프로젝트 이름을 입력해주세요.');
      return;
    }

    // Check if we can save
    if (!canSaveNewProject()) {
      setError('저장 공간이 가득 찼습니다. 기존 프로젝트를 삭제해주세요.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Generate thumbnail
      const thumbnail = generateThumbnail(canvas, canvasWidth, canvasHeight);

      // Save project
      const result = saveProject({
        name: projectName.trim(),
        canvas,
        canvasWidth,
        canvasHeight,
        thumbnail,
        savedColors,
      });

      if (result.success) {
        setProjectName('');
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const canSave = canSaveNewProject();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-lg font-pixel text-white">프로젝트 저장</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {!canSave && (
            <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-xs">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>저장 공간이 가득 찼습니다. (최대 10개) 기존 프로젝트를 삭제한 후 다시 시도해주세요.</p>
            </div>
          )}

          <div>
            <label htmlFor="project-name" className="block text-sm font-pixel text-neutral-300 mb-2">
              프로젝트 이름
            </label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="내 작품"
              disabled={!canSave || isSaving}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm focus:outline-none focus:border-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={50}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-xs">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-700">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-pixel text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isSaving || !projectName.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-pixel transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
