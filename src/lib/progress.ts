import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  /** lessonId -> completed */
  done: Record<string, boolean>;
  /** quizId -> best score (0..1) */
  quizScores: Record<string, number>;
  /** lessonKey -> epoch ms of last visit (for the activity feed) */
  lastVisited: Record<string, number>;
  toggleDone: (lessonId: string) => void;
  setDone: (lessonId: string, value: boolean) => void;
  recordQuiz: (quizId: string, score: number) => void;
  visit: (lessonKey: string) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      done: {},
      quizScores: {},
      lastVisited: {},
      toggleDone: (id) =>
        set((s) => ({ done: { ...s.done, [id]: !s.done[id] } })),
      setDone: (id, value) =>
        set((s) => ({ done: { ...s.done, [id]: value } })),
      recordQuiz: (id, score) =>
        set((s) => ({
          quizScores: { ...s.quizScores, [id]: Math.max(score, s.quizScores[id] ?? 0) },
        })),
      visit: (key) =>
        set((s) => ({ lastVisited: { ...s.lastVisited, [key]: Date.now() } })),
      reset: () => set({ done: {}, quizScores: {}, lastVisited: {} }),
    }),
    { name: "forge-progress" }
  )
);
