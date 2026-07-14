import type { Module, PracticeTrackId } from "../content/types";
import { lessonKey, trackIdOf } from "../content/registry";
import { challengesForModule } from "../content/challenges";

const exKey = (moduleId: string, lessonId: string, exId: string) => `${moduleId}/${lessonId}/${exId}`;

export interface ProgressSlices {
  done: Record<string, boolean>;
  quizScores: Record<string, number>;
  exercisesDone: Record<string, boolean>;
  solvedChallenges: Record<string, number>;
}

/**
 * A lesson counts as "done" when it's marked complete AND — if it has a quiz or
 * exercises — those are cleared too. Mirrors the per-lesson `complete` in the
 * questionary page (src/pages/questionary/questionary.tsx).
 */
export function lessonComplete(module: Module, lesson: Module["lessons"][number], p: ProgressSlices): boolean {
  const key = lessonKey(module.id, lesson.id);
  const exercises = lesson.exercises ?? [];
  const exDone = exercises.every((ex) => p.exercisesDone[exKey(module.id, lesson.id, ex.id)]);
  const quizCount = lesson.quiz?.questions.length ?? 0;
  const quizPassed = quizCount === 0 || key in p.quizScores;
  return !!p.done[key] && exDone && quizPassed;
}

/**
 * A module is "complete" when every exercise is done, every quiz has been
 * attempted, and its capstone challenge (if any) is solved — the same
 * `chapterComplete` condition the questionary uses. Modules with no lessons
 * that carry work are never treated as complete (nothing to finish).
 */
export function moduleComplete(module: Module, p: ProgressSlices): boolean {
  const lessonsWithWork = module.lessons.filter(
    (l) => (l.quiz?.questions.length ?? 0) > 0 || (l.exercises?.length ?? 0) > 0
  );
  if (lessonsWithWork.length === 0) {
    // No questionary work — fall back to all lessons marked done.
    return module.lessons.length > 0 && module.lessons.every((l) => p.done[lessonKey(module.id, l.id)]);
  }

  const totalEx = lessonsWithWork.reduce((n, l) => n + (l.exercises?.length ?? 0), 0);
  const doneEx = lessonsWithWork.reduce(
    (n, l) => n + (l.exercises ?? []).filter((ex) => p.exercisesDone[exKey(module.id, l.id, ex.id)]).length,
    0
  );
  const quizLessons = lessonsWithWork.filter((l) => (l.quiz?.questions.length ?? 0) > 0);
  const attemptedQuizzes = quizLessons.filter((l) => lessonKey(module.id, l.id) in p.quizScores);

  const boss = challengesForModule(trackIdOf(module) as PracticeTrackId, module.title)[0];
  const bossSolved = boss ? !!p.solvedChallenges[boss.id] : true;

  const exercisesComplete = totalEx === 0 || doneEx === totalEx;
  const quizzesComplete = quizLessons.length === 0 || attemptedQuizzes.length === quizLessons.length;
  return exercisesComplete && quizzesComplete && bossSolved;
}
