import type { Module, Lesson } from "./types";
import { linearAlgebra } from "../modules/linear-algebra";
import { odin } from "../modules/odin";
import { proceduralMath } from "../modules/procedural-math";
import { physics } from "../modules/physics";
import { metal } from "../modules/metal";
import { rendering } from "../modules/rendering";

const raw: Module[] = [linearAlgebra, odin, proceduralMath, physics, metal, rendering];

/** Topologically sort modules by dependsOn so the curriculum reads in order. */
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

export const modules: Module[] = topoSort(raw);

export function getModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export interface LessonRef {
  module: Module;
  lesson: Lesson;
  index: number; // global index across the flattened curriculum
}

/** Flatten all lessons in curriculum order for prev/next navigation. */
export const allLessons: LessonRef[] = modules.flatMap((module) =>
  module.lessons.map((lesson, i) => ({ module, lesson, index: 0 + i }))
).map((ref, i) => ({ ...ref, index: i }));

export function findLesson(moduleId: string, lessonId: string): LessonRef | undefined {
  return allLessons.find((r) => r.module.id === moduleId && r.lesson.id === lessonId);
}

export function lessonPath(moduleId: string, lessonId: string): string {
  return `/m/${moduleId}/${lessonId}`;
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
