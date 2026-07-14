import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";

function save(patch: Record<string, unknown>) {
  writeCloudState(getCurrentUid(), patch);
}

export type SpaceKind = "course" | "playlist" | "subject" | "topic" | "other";

/**
 * A user-created Learning Space (CS50, a YouTube playlist, a research topic…).
 * Built-in curriculum modules are ALSO surfaced as spaces at read time
 * (see lib/spaces-model.ts) — those are not stored here.
 */
export interface Space {
  id: string;
  title: string;
  kind: SpaceKind;
  description?: string;
  source?: string; // URL or provider (Udemy, YouTube, university…)
  accent?: string;
  lessonsPlanned?: number; // optional target for progress on custom spaces
  lessonsDone?: number;
  createdAt: number;
  updatedAt: number;
}

interface SpacesState {
  spaces: Space[];
  addSpace: (s: Omit<Space, "id" | "createdAt" | "updatedAt">) => string;
  updateSpace: (id: string, patch: Partial<Pick<Space, "title" | "kind" | "description" | "source" | "accent" | "lessonsPlanned" | "lessonsDone">>) => void;
  deleteSpace: (id: string) => void;
}

let seq = 0;
const uid = () => `sp-${Date.now().toString(36)}-${(seq++).toString(36)}`;

const EMPTY_SPACES = { spaces: [] as Space[] };

export const useSpaces = create<SpacesState>()((set) => ({
  ...EMPTY_SPACES,
  addSpace: (s) => {
    const now = Date.now();
    const id = uid();
    set((st) => {
      const spaces = [{ ...s, id, createdAt: now, updatedAt: now }, ...st.spaces];
      save({ spaces });
      return { spaces };
    });
    return id;
  },
  updateSpace: (id, patch) => {
    set((st) => {
      const spaces = st.spaces.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s));
      save({ spaces });
      return { spaces };
    });
  },
  deleteSpace: (id) => {
    set((st) => {
      const spaces = st.spaces.filter((s) => s.id !== id);
      save({ spaces });
      return { spaces };
    });
  },
}));

export function hydrateSpaces(data: { spaces?: Space[] } | null) {
  useSpaces.setState({ spaces: data?.spaces ?? [] });
}
