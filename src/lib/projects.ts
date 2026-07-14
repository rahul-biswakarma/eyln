import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";

function save(patch: Record<string, unknown>) {
  writeCloudState(getCurrentUid(), patch);
}

export type ProjectStatus = "active" | "shipped" | "paused" | "idea";

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  description?: string;
  repoUrl?: string;
  accent?: string;
  createdAt: number;
  updatedAt: number;
}

interface ProjectsState {
  projects: Project[];
  addProject: (p: Omit<Project, "id" | "createdAt" | "updatedAt">) => string;
  updateProject: (id: string, patch: Partial<Pick<Project, "title" | "status" | "description" | "repoUrl" | "accent">>) => void;
  deleteProject: (id: string) => void;
}

let seq = 0;
const uid = () => `pj-${Date.now().toString(36)}-${(seq++).toString(36)}`;

const EMPTY_PROJECTS = { projects: [] as Project[] };

export const useProjects = create<ProjectsState>()((set) => ({
  ...EMPTY_PROJECTS,
  addProject: (p) => {
    const now = Date.now();
    const id = uid();
    set((st) => {
      const projects = [{ ...p, id, createdAt: now, updatedAt: now }, ...st.projects];
      save({ projects });
      return { projects };
    });
    return id;
  },
  updateProject: (id, patch) => {
    set((st) => {
      const projects = st.projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p));
      save({ projects });
      return { projects };
    });
  },
  deleteProject: (id) => {
    set((st) => {
      const projects = st.projects.filter((p) => p.id !== id);
      save({ projects });
      return { projects };
    });
  },
}));

export function hydrateProjects(data: { projects?: Project[] } | null) {
  useProjects.setState({ projects: data?.projects ?? [] });
}
