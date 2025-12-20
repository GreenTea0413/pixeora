'use client';

import { useState } from 'react';
import { X, FolderOpen } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { SavedProject, SortOption } from '@/types';
import ProjectCard from './ProjectCard';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (project: SavedProject) => void;
}

export default function ProjectsModal({ isOpen, onClose, onLoadProject }: ProjectsModalProps) {
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { getProjects, deleteProject } = useProjectStore();
  const projects = getProjects(sortBy);

  const handleLoad = (project: SavedProject) => {
    onLoadProject(project);
    onClose();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteProject(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-700">
            <div>
              <h2 className="text-lg font-pixel text-white">저장된 프로젝트</h2>
              <p className="text-xs text-neutral-400 mt-1">{projects.length}/10 프로젝트</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-white text-xs focus:outline-none focus:border-neutral-500"
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="name">이름순</option>
              </select>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen size={48} className="text-neutral-600 mb-4" />
                <p className="text-neutral-400 font-pixel text-sm">저장된 프로젝트가 없습니다</p>
                <p className="text-neutral-500 text-xs mt-2">작품을 저장하고 나중에 다시 작업하세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onLoad={handleLoad}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-sm">
            <div className="p-4 border-b border-neutral-700">
              <h3 className="text-lg font-pixel text-white">프로젝트 삭제</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-neutral-300">
                이 프로젝트를 삭제하시겠습니까?
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                삭제된 프로젝트는 복구할 수 없습니다.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-700">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-pixel text-neutral-300 hover:text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-pixel transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
