import { useProgress } from "./progress";
import { modules, allLessons, moduleProgress, lessonKey } from "../content/registry";

/**
 * Build a compact, privacy-local summary of the learner's state for grounding
 * the AI tutor: overall progress, weakest quizzes, and recent wrong answers
 * pulled from the attempt log. Kept short so it fits comfortably in a prompt.
 */
export function buildLearnerContext(): string {
  const { done, quizScores, attempts } = useProgress.getState();

  const totalLessons = allLessons.length;
  const lessonsDone = allLessons.filter((r) => done[lessonKey(r.module.id, r.lesson.id)]).length;

  const lines: string[] = [];
  lines.push(`Progress: ${lessonsDone}/${totalLessons} lessons complete.`);

  // Modules in progress (started but not finished).
  const inProgress = modules
    .map((m) => ({ m, p: moduleProgress(m, done) }))
    .filter(({ p }) => p > 0 && p < 1)
    .slice(0, 4)
    .map(({ m, p }) => `${m.title} (${Math.round(p * 100)}%)`);
  if (inProgress.length) lines.push(`In progress: ${inProgress.join(", ")}.`);

  // Weakest quiz scores.
  const weak = Object.entries(quizScores)
    .filter(([, v]) => v < 0.8)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([key, v]) => `${lessonTitleFor(key)} (${Math.round(v * 100)}%)`);
  if (weak.length) lines.push(`Lower quiz scores: ${weak.join(", ")}.`);

  // Recent wrong answers from the attempt log.
  const wrong: string[] = [];
  for (const [itemId, list] of Object.entries(attempts)) {
    const last = list[list.length - 1];
    if (last && !last.correct) {
      wrong.push(`"${itemId}" — answered "${truncate(last.answer, 40)}" (incorrect)`);
    }
    if (wrong.length >= 6) break;
  }
  if (wrong.length) lines.push(`Recent incorrect attempts:\n- ${wrong.join("\n- ")}`);

  return lines.join("\n");
}

function truncate(s: string, n: number): string {
  const t = (s ?? "").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function lessonTitleFor(key: string): string {
  const ref = allLessons.find((r) => lessonKey(r.module.id, r.lesson.id) === key);
  return ref ? ref.lesson.title : key;
}
