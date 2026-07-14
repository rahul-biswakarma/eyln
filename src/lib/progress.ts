import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";
function save(patch: Record<string, unknown>) {
    writeCloudState(getCurrentUid(), patch);
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
const EMPTY_PROGRESS = {
    done: {},
    quizScores: {},
    exercisesDone: {},
    attempts: {},
    lastVisited: {},
    solvedChallenges: {},
};
export const useProgress = create<ProgressState>()((set) => ({
    ...EMPTY_PROGRESS,
    toggleDone: (id) => {
        set((s) => {
            const done = { ...s.done, [id]: !s.done[id] };
            save({ done });
            return { done };
        });
    },
    setDone: (id, value) => {
        set((s) => {
            const done = { ...s.done, [id]: value };
            save({ done });
            return { done };
        });
    },
    recordQuiz: (id, score) => {
        set((s) => {
            const quizScores = { ...s.quizScores, [id]: Math.max(score, s.quizScores[id] ?? 0) };
            save({ quizScores });
            return { quizScores };
        });
    },
    recordExercise: (id, passed) => {
        set((s) => {
            if (s.exercisesDone[id] && !passed)
                return s;
            const exercisesDone = { ...s.exercisesDone, [id]: passed };
            save({ exercisesDone });
            return { exercisesDone };
        });
    },
    logAttempt: (itemId, attempt) => {
        set((s) => {
            const prev = s.attempts[itemId] ?? [];
            const next = [...prev, attempt].slice(-MAX_ATTEMPTS_PER_ITEM);
            const attempts = { ...s.attempts, [itemId]: next };
            save({ attempts });
            return { attempts };
        });
    },
    recordChallenge: (id) => {
        set((s) => {
            const solvedChallenges = { ...s.solvedChallenges, [id]: Date.now() };
            save({ solvedChallenges });
            return { solvedChallenges };
        });
    },
    visit: (key) => {
        set((s) => {
            const lastVisited = { ...s.lastVisited, [key]: Date.now() };
            save({ lastVisited });
            return { lastVisited };
        });
    },
    reset: () => {
        set(EMPTY_PROGRESS);
        save(EMPTY_PROGRESS);
    },
}));
export function hydrateProgress(data: Partial<ProgressState> | null) {
    useProgress.setState({ ...EMPTY_PROGRESS, ...data });
}
