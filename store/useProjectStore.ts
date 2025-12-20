import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedProject, SortOption } from '@/types';

const MAX_PROJECTS = 10;

interface ProjectStore {
  projects: SavedProject[];
  currentProjectId: string | null;

  // Actions
  saveProject: (project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string };
  loadProject: (id: string) => SavedProject | null;
  deleteProject: (id: string) => void;
  getProjects: (sortBy?: SortOption) => SavedProject[];
  canSaveNewProject: () => boolean;
  setCurrentProjectId: (id: string | null) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,

      canSaveNewProject: () => {
        return get().projects.length < MAX_PROJECTS;
      },

      saveProject: (projectData) => {
        const { projects } = get();

        // Check if we can save a new project
        if (projects.length >= MAX_PROJECTS) {
          return {
            success: false,
            message: `저장 공간이 가득 찼습니다. 최대 ${MAX_PROJECTS}개까지만 저장할 수 있습니다. 기존 프로젝트를 삭제해주세요.`
          };
        }

        const now = Date.now();
        const newProject: SavedProject = {
          ...projectData,
          id: `project_${now}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };

        set({
          projects: [...projects, newProject],
          currentProjectId: newProject.id
        });

        return {
          success: true,
          message: '프로젝트가 저장되었습니다.'
        };
      },

      loadProject: (id) => {
        const project = get().projects.find(p => p.id === id);
        if (project) {
          set({ currentProjectId: id });
        }
        return project || null;
      },

      deleteProject: (id) => {
        const { projects, currentProjectId } = get();
        const newProjects = projects.filter(p => p.id !== id);

        set({
          projects: newProjects,
          currentProjectId: currentProjectId === id ? null : currentProjectId
        });
      },

      getProjects: (sortBy = 'latest') => {
        const projects = [...get().projects];

        switch (sortBy) {
          case 'latest':
            return projects.sort((a, b) => b.updatedAt - a.updatedAt);
          case 'oldest':
            return projects.sort((a, b) => a.updatedAt - b.updatedAt);
          case 'name':
            return projects.sort((a, b) => a.name.localeCompare(b.name));
          default:
            return projects;
        }
      },

      setCurrentProjectId: (id) => {
        set({ currentProjectId: id });
      },
    }),
    {
      name: 'pixeora-projects',
    }
  )
);
