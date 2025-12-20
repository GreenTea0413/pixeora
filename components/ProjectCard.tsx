'use client';

import { Trash2 } from 'lucide-react';
import type { SavedProject } from '@/types';
import Image from 'next/image';

interface ProjectCardProps {
  project: SavedProject;
  onLoad: (project: SavedProject) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onLoad, onDelete }: ProjectCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? '방금 전' : `${minutes}분 전`;
      }
      return `${hours}시간 전`;
    } else if (days === 1) {
      return '어제';
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  return (
    <div
      onClick={() => onLoad(project)}
      className="group bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden cursor-pointer hover:border-neutral-500 transition-colors"
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-neutral-900 flex items-center justify-center p-4">
        <div className="relative w-full h-full">
          <Image
            src={project.thumbnail}
            alt={project.name}
            fill
            className="object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-pixel text-white truncate flex-1">
            {project.name}
          </h3>
          <button
            onClick={handleDelete}
            className="flex-shrink-0 text-neutral-500 hover:text-red-500 transition-colors"
            title="삭제"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>{project.canvasWidth} × {project.canvasHeight}</span>
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
