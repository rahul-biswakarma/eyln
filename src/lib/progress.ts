import { create } from "zustand";
import { persist } from "zustand/middleware";
function save() {
    void import("./persistence").then((m) => m.saveState());
}
export interface Attempt {
    answer: string;
    correct: boolean;
    feedback?: string;
    at: number;
}
const MAX_ATTEMPTS_PER_ITEM = 25;
interface ProgressState {
    done: Record<string, boolean>;
    quizScores: Record<string, number>;
    exercisesDone: Record<string, boolean>;
    attempts: Record<string, Attempt[]>;
    lastVisited: Record<string, number>;
    solvedChallenges: Record<string, number>;
    toggleDone: (lessonId: string) => void;
    setDone: (lessonId: string, value: boolean) => void;
    recordQuiz: (quizId: string, score: number) => void;
    recordExercise: (exerciseId: string, passed: boolean) => void;
    logAttempt: (itemId: string, attempt: Attempt) => void;
    recordChallenge: (challengeId: string) => void;
    visit: (lessonKey: string) => void;
    reset: () => void;
}
export const useProgress = create<ProgressState>()(persist((set) => ({
    done: {},
    quizScores: {},
    exercisesDone: {},
    attempts: {},
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
            if (s.exercisesDone[id] && !passed)
                return s;
            return { exercisesDone: { ...s.exercisesDone, [id]: passed } };
        });
        save();
    },
    logAttempt: (itemId, attempt) => {
        set((s) => {
            const prev = s.attempts[itemId] ?? [];
            const next = [...prev, attempt].slice(-MAX_ATTEMPTS_PER_ITEM);
            return { attempts: { ...s.attempts, [itemId]: next } };
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
        set({ done: {}, quizScores: {}, exercisesDone: {}, attempts: {}, lastVisited: {}, solvedChallenges: {} });
        save();
    },
}), { name: "forge-progress" }));
