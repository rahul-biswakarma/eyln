import type { Module, Lesson, TrackId } from "./types";
import { tracks, DEFAULT_TRACK } from "./tracks";

import { linearAlgebra } from "../modules/linear-algebra";
import { odin } from "../modules/odin";
import { proceduralMath } from "../modules/procedural-math";
import { physics } from "../modules/physics";
import { metal } from "../modules/metal";
import { rendering } from "../modules/rendering";
import { lighting } from "../modules/lighting";
import { textures } from "../modules/textures";
import { optimization } from "../modules/optimization";

import { dsaModules } from "../modules/dsa";

import { mathModules } from "../modules/math";

const engineModules: Module[] = [
  linearAlgebra, odin, proceduralMath, physics, metal, rendering,
  lighting, textures, optimization,
].map((m) => ({ ...m, track: "engine" as TrackId }));

const raw: Module[] = [...engineModules, ...dsaModules, ...mathModules];

function topoSort(mods: Module[]): Module[] {
  const byId = new Map(mods.map((m) => [m.id, m]));
  const visited = new Set<string>();
  const out: Module[] = [];
  const visit = (m: Module) => {
    if (visited.has(m.id)) return;
    visited.add(m.id);
    for (const dep of m.dependsOn) {
      const d = byId.get(dep);
      if (d) visit(d);
    }
    out.push(m);
  };
  mods.forEach(visit);
  return out;
}

export const modules: Module[] = tracks.flatMap((t) =>
  topoSort(raw.filter((m) => (m.track ?? DEFAULT_TRACK) === t.id))
);

export function getModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function modulesForTrack(trackId: TrackId): Module[] {
  return modules.filter((m) => (m.track ?? DEFAULT_TRACK) === trackId);
}

export function trackIdOf(module: Module): TrackId {
  return module.track ?? DEFAULT_TRACK;
}

export interface LessonRef {
  module: Module;
  lesson: Lesson;
  index: number; 
}

export const allLessons: LessonRef[] = modules
  .flatMap((module) => module.lessons.map((lesson) => ({ module, lesson, index: 0 })))
  .map((ref, i) => ({ ...ref, index: i }));

export function lessonsForTrack(trackId: TrackId): LessonRef[] {
  return allLessons.filter((r) => (r.module.track ?? DEFAULT_TRACK) === trackId);
}

export function findLesson(moduleId: string, lessonId: string): LessonRef | undefined {
  return allLessons.find((r) => r.module.id === moduleId && r.lesson.id === lessonId);
}

export function lessonPath(moduleId: string, lessonId: string): string {
  return `/m/${moduleId}/${lessonId}`;
}

export function questionaryPath(moduleId: string): string {
  return `/m/${moduleId}/questionary`;
}

/** Does a module have any quizzes or exercises to collect into a questionary? */
export function moduleHasQuestionary(module: Module): boolean {
  return module.lessons.some(
    (l) => (l.quiz?.questions.length ?? 0) > 0 || (l.exercises?.length ?? 0) > 0
  );
}

export function moduleProgress(module: Module, done: Record<string, boolean>): number {
  if (module.lessons.length === 0) return 0;
  const n = module.lessons.filter((l) => done[`${module.id}/${l.id}`]).length;
  return n / module.lessons.length;
}

export const lessonKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`;

/** Total estimated minutes across a module's lessons. */
export function moduleMinutes(module: Module): number {
  return module.lessons.reduce((sum, l) => sum + l.minutes, 0);
}

export interface Difficulty {
  level: 1 | 2 | 3;
  label: string;
}

/** Difficulty derived from dependency depth — foundational modules gate the rest. */
export function moduleDifficulty(module: Module): Difficulty {
  const depth = module.dependsOn.length;
  if (depth === 0) return { level: 1, label: "Foundational" };
  if (depth === 1) return { level: 2, label: "Intermediate" };
  return { level: 3, label: "Advanced" };
}

/** Human-readable prerequisite module titles. */
export function modulePrereqTitles(module: Module): string[] {
  return module.dependsOn
    .map((id) => getModule(id)?.title)
    .filter((t): t is string => !!t);
}

/** The next unstarted lesson within a track (for per-track "continue"). */
export function nextLessonInTrack(
  trackId: TrackId,
  done: Record<string, boolean>
): LessonRef | undefined {
  const lessons = lessonsForTrack(trackId);
  return (
    lessons.find((r) => !done[lessonKey(r.module.id, r.lesson.id)]) ?? lessons[0]
  );
}
