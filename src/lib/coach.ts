import { modules, allLessons, lessonKey, type LessonRef } from "../content/registry";
import { computeStats } from "./stats";
const DAY = 24 * 60 * 60 * 1000;
export interface CoachSignals {
    streak: number;
    staleLessons: LessonRef[];
    weakModules: {
        module: string;
        score: number;
    }[];
    next: LessonRef | undefined;
    daysIdle: number | null;
}
function computeStreak(lastVisited: Record<string, number>, now: number): number {
    const days = new Set<number>();
    for (const ts of Object.values(lastVisited)) {
        days.add(Math.floor(ts / DAY));
    }
    if (days.size === 0)
        return 0;
    let streak = 0;
    let cursor = Math.floor(now / DAY);
    if (!days.has(cursor))
        cursor -= 1;
    while (days.has(cursor)) {
        streak++;
        cursor--;
    }
    return streak;
}
export function computeCoachSignals(done: Record<string, boolean>, quizScores: Record<string, number>, lastVisited: Record<string, number>, now: number): CoachSignals {
    const stats = computeStats(done, quizScores);
    const weakModules: {
        module: string;
        score: number;
    }[] = [];
    for (const m of modules) {
        const scores = m.lessons
            .map((l) => quizScores[lessonKey(m.id, l.id)])
            .filter((s): s is number => typeof s === "number");
        if (scores.length) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            if (avg < 0.6)
                weakModules.push({ module: m.title, score: avg });
        }
    }
    weakModules.sort((a, b) => a.score - b.score);
    const staleLessons = allLessons.filter((r) => {
        const key = lessonKey(r.module.id, r.lesson.id);
        const last = lastVisited[key];
        return last && !done[key] && now - last > 5 * DAY;
    });
    const times = Object.values(lastVisited);
    const daysIdle = times.length ? Math.floor((now - Math.max(...times)) / DAY) : null;
    return {
        streak: computeStreak(lastVisited, now),
        staleLessons,
        weakModules,
        next: stats.nextRef,
        daysIdle,
    };
}
export function ruleBasedRecommendation(sig: CoachSignals): string {
    if (sig.weakModules.length) {
        const w = sig.weakModules[0];
        return `Your quiz scores in ${w.module} are low (${Math.round(w.score * 100)}%). Re-read those lessons and retake the quizzes before moving on.`;
    }
    if (sig.staleLessons.length) {
        return `You started "${sig.staleLessons[0].lesson.title}" a while back but didn't finish it. Pick it up again to keep the thread.`;
    }
    if (sig.next) {
        return `You're on track. Next up: "${sig.next.lesson.title}" in ${sig.next.module.title}.`;
    }
    return "You've cleared the whole curriculum. Revisit any module to keep it sharp, or go build.";
}
export function coachPrompt(sig: CoachSignals): string {
    const weak = sig.weakModules.length
        ? sig.weakModules.map((w) => `${w.module} (${Math.round(w.score * 100)}%)`).join(", ")
        : "none";
    const stale = sig.staleLessons.length
        ? sig.staleLessons.map((r) => r.lesson.title).slice(0, 5).join(", ")
        : "none";
    return [
        "You are a concise study coach for a course on building a 3D game engine in Odin + Metal.",
        "Given the learner's state, give ONE short, encouraging, concrete recommendation (2-3 sentences max).",
        "Be specific about what to study or review next. Do not use markdown headers or lists.",
        "",
        `Study streak: ${sig.streak} day(s).`,
        `Days since last activity: ${sig.daysIdle ?? "n/a"}.`,
        `Weak modules (avg quiz < 60%): ${weak}.`,
        `Started-but-unfinished lessons: ${stale}.`,
        `Next unstarted lesson: ${sig.next ? `${sig.next.lesson.title} (${sig.next.module.title})` : "none — course complete"}.`,
    ].join("\n");
}
