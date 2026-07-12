import { create } from "zustand";
import { persist } from "zustand/middleware";

// Persist to the DB after each action (lazy import breaks the cycle).
function save() {
  void import("./persistence").then((m) => m.saveState());
}

/**
 * A single insight the AI tutor captured about the learner. These form a living
 * "tutor task list": what the learner struggled with, what to review, what to
 * learn next, and gaps the course should fill. The list is shown to the learner
 * (Profile) and later mined to generate/improve course content.
 */
export type TutorTaskKind = "struggle" | "review" | "next" | "content-gap";

export interface TutorTask {
  id: string;
  kind: TutorTaskKind;
  /** Short, actionable text. */
  text: string;
  /** Where it came from — module/lesson id or title. */
  source?: string;
  /** Related concept/topic, for grouping + content generation. */
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

/** Normalize for near-duplicate detection. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const useTutor = create<TutorState>()(
  persist(
    (set) => ({
      tasks: [],
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
          // Newest first, capped so the list stays useful.
          return { tasks: [...fresh, ...s.tasks].slice(0, 200) };
        });
        save();
      },
      toggleTask: (id) => {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
        save();
      },
      removeTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        save();
      },
      clearDone: () => {
        set((s) => ({ tasks: s.tasks.filter((t) => !t.done) }));
        save();
      },
      clearAll: () => {
        set({ tasks: [] });
        save();
      },
    }),
    { name: "forge-tutor" }
  )
);

export const TUTOR_KIND_META: Record<TutorTaskKind, { label: string; short: string }> = {
  struggle: { label: "Where you're struggling", short: "Struggle" },
  review: { label: "Worth reviewing", short: "Review" },
  next: { label: "Recommended next", short: "Next" },
  "content-gap": { label: "Gaps for the course to fill", short: "Content gap" },
};
