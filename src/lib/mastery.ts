import { getModule, moduleProgress, lessonKey } from "../content/registry";
import type { Note } from "./notes";
import { noteKind } from "./note-kind";
export const WEAK_THRESHOLD = 0.6;
export function conceptMastery(moduleId: string, done: Record<string, boolean>, quizScores: Record<string, number>, notes: Note[]): number {
    const module = getModule(moduleId);
    if (!module)
        return 0;
    const completion = moduleProgress(module, done);
    const scores = module.lessons
        .map((l) => quizScores[lessonKey(module.id, l.id)])
        .filter((s): s is number => typeof s === "number");
    const avgQuiz = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    const base = avgQuiz === null ? completion : 0.5 * completion + 0.5 * avgQuiz;
    const mistakeCount = notes.filter((n) => n.moduleId === moduleId && noteKind(n) === "mistake").length;
    const penalty = Math.min(0.3, mistakeCount * 0.08);
    return Math.max(0, Math.min(1, base - penalty));
}
export function isWeak(mastery: number): boolean {
    return mastery < WEAK_THRESHOLD;
}
