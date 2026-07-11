import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  done: Record<string, boolean>;
  quizScores: Record<string, number>;
  lastVisited: Record<string, number>;
  solvedChallenges: Record<string, number>;
  toggleDone: (lessonId: string) => void;
  setDone: (lessonId: string, value: boolean) => void;
  recordQuiz: (quizId: string, score: number) => void;
  recordChallenge: (challengeId: string) => void;
  visit: (lessonKey: string) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      done: {},
      quizScores: {},
      lastVisited: {},
      solvedChallenges: {},
      toggleDone: (id) =>
        set((s) => ({ done: { ...s.done, [id]: !s.done[id] } })),
      setDone: (id, value) =>
        set((s) => ({ done: { ...s.done, [id]: value } })),
      recordQuiz: (id, score) =>
        set((s) => ({
          quizScores: { ...s.quizScores, [id]: Math.max(score, s.quizScores[id] ?? 0) },
        })),
      recordChallenge: (id) =>
        set((s) => ({ solvedChallenges: { ...s.solvedChallenges, [id]: Date.now() } })),
      visit: (key) =>
        set((s) => ({ lastVisited: { ...s.lastVisited, [key]: Date.now() } })),
      reset: () => set({ done: {}, quizScores: {}, lastVisited: {}, solvedChallenges: {} }),
    }),
    { name: "forge-progress" }
  )
);
