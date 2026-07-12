import { create } from "zustand";
import { persist } from "zustand/middleware";

// Persist to the DB after each action (lazy import breaks the cycle).
function save() {
  void import("./persistence").then((m) => m.saveState());
}

interface ProgressState {
  done: Record<string, boolean>;
  quizScores: Record<string, number>;
  exercisesDone: Record<string, boolean>;
  lastVisited: Record<string, number>;
  solvedChallenges: Record<string, number>;
  toggleDone: (lessonId: string) => void;
  setDone: (lessonId: string, value: boolean) => void;
  recordQuiz: (quizId: string, score: number) => void;
  recordExercise: (exerciseId: string, passed: boolean) => void;
  recordChallenge: (challengeId: string) => void;
  visit: (lessonKey: string) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      done: {},
      quizScores: {},
      exercisesDone: {},
      lastVisited: {},
      solvedChallenges: {},
      toggleDone: (id) => {
        set((s) => ({ done: { ...s.done, [id]: !s.done[id] } }));
        save();
      },
      setDone: (id, value) => {
        set((s) => ({ done: { ...s.done, [id]: value } }));
        save();
      },
      recordQuiz: (id, score) => {
        set((s) => ({
          quizScores: { ...s.quizScores, [id]: Math.max(score, s.quizScores[id] ?? 0) },
        }));
        save();
      },
      recordExercise: (id, passed) => {
        set((s) => {
          // Once passed, stay passed — never regress on a later failed attempt.
          if (s.exercisesDone[id] && !passed) return s;
          return { exercisesDone: { ...s.exercisesDone, [id]: passed } };
        });
        save();
      },
      recordChallenge: (id) => {
        set((s) => ({ solvedChallenges: { ...s.solvedChallenges, [id]: Date.now() } }));
        save();
      },
      visit: (key) => {
        set((s) => ({ lastVisited: { ...s.lastVisited, [key]: Date.now() } }));
        save();
      },
      reset: () => {
        set({ done: {}, quizScores: {}, exercisesDone: {}, lastVisited: {}, solvedChallenges: {} });
        save();
      },
    }),
    { name: "forge-progress" }
  )
);
