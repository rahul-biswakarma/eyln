import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";

function save(patch: Record<string, unknown>) {
  writeCloudState(getCurrentUid(), patch);
}

export type TutorTaskKind = "struggle" | "review" | "next" | "content-gap";

export interface TutorTask {
  id: string;
  kind: TutorTaskKind;
  text: string;
  source?: string;
  topic?: string;
  createdAt: number;
  done: boolean;
}

interface TutorState {
  tasks: TutorTask[];
  addTasks: (tasks: Array<Omit<TutorTask, "id" | "createdAt" | "done">>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearDone: () => void;
  clearAll: () => void;
}

let seq = 0;
const uid = () => `t-${Date.now().toString(36)}-${(seq++).toString(36)}`;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const EMPTY_TUTOR = { tasks: [] as TutorTask[] };

export const useTutor = create<TutorState>()((set) => ({
  ...EMPTY_TUTOR,

  addTasks: (incoming) => {
    set((s) => {
      const seen = new Set(s.tasks.map((t) => `${t.kind}|${norm(t.text)}`));
      const now = Date.now();
      const fresh: TutorTask[] = [];
      for (const t of incoming) {
        const text = t.text.trim();
        if (!text) continue;
        const key = `${t.kind}|${norm(text)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        fresh.push({ ...t, text, id: uid(), createdAt: now, done: false });
      }
      if (fresh.length === 0) return s;
      const tasks = [...fresh, ...s.tasks].slice(0, 200);
      save({ tutorTasks: tasks });
      return { tasks };
    });
  },
  toggleTask: (id) => {
    set((s) => {
      const tasks = s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      save({ tutorTasks: tasks });
      return { tasks };
    });
  },
  removeTask: (id) => {
    set((s) => {
      const tasks = s.tasks.filter((t) => t.id !== id);
      save({ tutorTasks: tasks });
      return { tasks };
    });
  },
  clearDone: () => {
    set((s) => {
      const tasks = s.tasks.filter((t) => !t.done);
      save({ tutorTasks: tasks });
      return { tasks };
    });
  },
  clearAll: () => {
    set(EMPTY_TUTOR);
    save({ tutorTasks: [] });
  },
}));

/** Replace the store contents with cloud data — used only by lib/sync.ts. */
export function hydrateTutor(data: { tasks?: TutorTask[] } | null) {
  useTutor.setState({ tasks: data?.tasks ?? [] });
}

export const TUTOR_KIND_META: Record<TutorTaskKind, { label: string; short: string }> = {
  struggle: { label: "Where you're struggling", short: "Struggle" },
  review: { label: "Worth reviewing", short: "Review" },
  next: { label: "Recommended next", short: "Next" },
  "content-gap": { label: "Gaps for the course to fill", short: "Content gap" },
};
