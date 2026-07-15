import { modules, allLessons, moduleProgress, lessonKey, type LessonRef } from "../content/registry";
import { totalXpEarned } from "../content/challenges";

/**
 * The single source of truth for XP rates across the app. Challenge XP comes
 * from XP_BY_DIFFICULTY (via totalXpEarned); these cover the lesson-side work.
 * The dashboard, profile, and chapter-review all compute XP from these — no
 * more divergent formulas.
 */
export const XP_RATES = { lesson: 25, exercise: 20, quiz: 15 } as const;

export interface XpInputs {
    done: Record<string, boolean>;
    quizScores: Record<string, number>;
    exercisesDone: Record<string, boolean>;
    solvedChallenges: Record<string, number>;
}

/** Total XP earned across the whole curriculum. Idempotent — derived, not accumulated. */
export function computeXp(p: XpInputs): number {
    const lessons = allLessons.filter((r) => p.done[lessonKey(r.module.id, r.lesson.id)]).length;
    const exercises = Object.values(p.exercisesDone).filter(Boolean).length;
    const quiz = Object.values(p.quizScores).reduce((s, v) => s + Math.round(v * XP_RATES.quiz), 0);
    return (
        lessons * XP_RATES.lesson +
        exercises * XP_RATES.exercise +
        quiz +
        totalXpEarned(p.solvedChallenges)
    );
}
export interface DashStats {
    lessonsDone: number;
    totalLessons: number;
    overallPct: number;
    modulesStarted: number;
    modulesComplete: number;
    totalModules: number;
    minutesRemaining: number;
    minutesTotal: number;
    avgQuizScore: number | null;
    nextRef: LessonRef | undefined;
    perModuleDone: number[];
}
export function computeStats(done: Record<string, boolean>, quizScores: Record<string, number> = {}): DashStats {
    const totalLessons = allLessons.length;
    const lessonsDone = allLessons.filter((r) => done[lessonKey(r.module.id, r.lesson.id)]).length;
    let modulesStarted = 0;
    let modulesComplete = 0;
    const perModuleDone: number[] = [];
    for (const m of modules) {
        const p = moduleProgress(m, done);
        const n = m.lessons.filter((l) => done[lessonKey(m.id, l.id)]).length;
        perModuleDone.push(n);
        if (p > 0)
            modulesStarted++;
        if (p >= 1)
            modulesComplete++;
    }
    let minutesRemaining = 0;
    let minutesTotal = 0;
    for (const r of allLessons) {
        minutesTotal += r.lesson.minutes;
        if (!done[lessonKey(r.module.id, r.lesson.id)])
            minutesRemaining += r.lesson.minutes;
    }
    const scores = Object.values(quizScores);
    const avgQuizScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) : null;
    const nextRef = allLessons.find((r) => !done[lessonKey(r.module.id, r.lesson.id)]);
    return {
        lessonsDone,
        totalLessons,
        overallPct: totalLessons ? Math.round((lessonsDone / totalLessons) * 100) : 0,
        modulesStarted,
        modulesComplete,
        totalModules: modules.length,
        minutesRemaining,
        minutesTotal,
        avgQuizScore,
        nextRef,
        perModuleDone,
    };
}
export function formatMinutes(min: number): string {
    if (min < 60)
        return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
}
export interface ActivityItem {
    ref: LessonRef;
    when: number;
    done: boolean;
}
export function recentActivity(lastVisited: Record<string, number>, done: Record<string, boolean>, limit = 5): ActivityItem[] {
    return Object.entries(lastVisited)
        .map(([key, when]) => {
        const ref = allLessons.find((r) => lessonKey(r.module.id, r.lesson.id) === key);
        return ref ? { ref, when, done: !!done[key] } : null;
    })
        .filter((x): x is ActivityItem => x !== null)
        .sort((a, b) => b.when - a.when)
        .slice(0, limit);
}
export function relativeTime(ms: number, now: number): string {
    const s = Math.max(0, Math.floor((now - ms) / 1000));
    if (s < 60)
        return "just now";
    const m = Math.floor(s / 60);
    if (m < 60)
        return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)
        return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}
