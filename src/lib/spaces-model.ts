import { modules, allLessons, getModule, moduleProgress, lessonKey } from "../content/registry";
import type { Note } from "./notes";
import type { Space } from "./spaces";
import type { Conversation } from "./conversations";
import { noteKind } from "./note-kind";

const DAY = 24 * 60 * 60 * 1000;

/**
 * A Learning Space is either a built-in curriculum module or a user-created
 * space. Both are projected into this one shape so the UI treats them uniformly.
 * `id` is the module id for built-ins and the space id for custom ones.
 */
export interface UnifiedSpace {
  id: string;
  kind: "module" | "custom";
  title: string;
  icon?: string; // module icon id
  accent?: string;
  moduleId?: string; // set when kind === "module"
  source?: string;
}

export function unifiedSpaces(customSpaces: Space[]): UnifiedSpace[] {
  const built: UnifiedSpace[] = modules.map((m) => ({
    id: m.id, kind: "module", title: m.title, icon: m.icon, moduleId: m.id,
  }));
  const custom: UnifiedSpace[] = customSpaces.map((s) => ({
    id: s.id, kind: "custom", title: s.title, accent: s.accent, source: s.source,
  }));
  return [...built, ...custom];
}

export function findUnifiedSpace(id: string, customSpaces: Space[]): UnifiedSpace | undefined {
  return unifiedSpaces(customSpaces).find((s) => s.id === id);
}

/** True if a note belongs to this space (curriculum via moduleId, custom via spaceId). */
export function noteInSpace(note: Note, space: UnifiedSpace): boolean {
  return space.kind === "module" ? note.moduleId === space.moduleId : note.spaceId === space.id;
}

// ── Captures split by artifact kind ──────────────────────────────────────────

export interface SpaceCaptures {
  notes: Note[];     // plain notes + ideas
  formulas: Note[];
  mistakes: Note[];
  code: Note[];
  ai: Note[];        // pinned AI-insight notes
  all: Note[];
}

export function capturesForSpace(space: UnifiedSpace, allNotes: Note[]): SpaceCaptures {
  const all = allNotes.filter((n) => noteInSpace(n, space)).sort((a, b) => b.createdAt - a.createdAt);
  const notes: Note[] = [], formulas: Note[] = [], mistakes: Note[] = [], code: Note[] = [], ai: Note[] = [];
  for (const n of all) {
    switch (noteKind(n)) {
      case "formula": formulas.push(n); break;
      case "mistake": mistakes.push(n); break;
      case "code": code.push(n); break;
      case "ai": ai.push(n); break;
      default: notes.push(n); // note, idea, quote, vocab, voice
    }
  }
  return { notes, formulas, mistakes, code, ai, all };
}

// ── Stats ─────────────────────────────────────────────────────────────────

export interface SpaceStats {
  progress: number | null; // 0..1
  lessonsDone: number;
  lessonsTotal: number;
  noteCount: number;
  formulaCount: number;
  mistakeCount: number;
  codeCount: number;
  aiCount: number;
  bookmarkCount: number;
  streak: number;
  lastActivity: number | null;
}

export function spaceStats(
  space: UnifiedSpace,
  caps: SpaceCaptures,
  conversations: Conversation[],
  bookmarks: Record<string, number>,
  done: Record<string, boolean>,
  customSpace: Space | undefined,
  now: number
): SpaceStats {
  let progress: number | null = null;
  let lessonsDone = 0;
  let lessonsTotal = 0;

  if (space.kind === "module") {
    const m = getModule(space.moduleId!);
    if (m) {
      lessonsTotal = m.lessons.length;
      lessonsDone = m.lessons.filter((l) => done[lessonKey(m.id, l.id)]).length;
      progress = moduleProgress(m, done);
    }
  } else if (customSpace) {
    lessonsTotal = customSpace.lessonsPlanned ?? 0;
    lessonsDone = customSpace.lessonsDone ?? 0;
    progress = lessonsTotal > 0 ? Math.min(1, lessonsDone / lessonsTotal) : null;
  }

  const aiCount = caps.ai.length + conversationsForSpace(space, conversations).length;
  const bookmarkCount = bookmarksForSpace(space, bookmarks).length;

  // Streak: distinct capture days counting back from today.
  const days = new Set<number>();
  for (const n of caps.all) days.add(Math.floor(n.createdAt / DAY));
  let streak = 0;
  let cursor = Math.floor(now / DAY);
  if (!days.has(cursor)) cursor -= 1;
  while (days.has(cursor)) { streak++; cursor--; }

  const lastActivity = caps.all[0]?.createdAt ?? null;

  return {
    progress, lessonsDone, lessonsTotal,
    noteCount: caps.notes.length,
    formulaCount: caps.formulas.length,
    mistakeCount: caps.mistakes.length,
    codeCount: caps.code.length,
    aiCount,
    bookmarkCount,
    streak,
    lastActivity,
  };
}

// ── Related conversations & bookmarks ────────────────────────────────────────

export function conversationsForSpace(space: UnifiedSpace, conversations: Conversation[]): Conversation[] {
  return conversations
    .filter((c) => (space.kind === "module" ? c.moduleId === space.moduleId : c.spaceId === space.id))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Lesson bookmarks (keyed "moduleId/lessonId") that fall inside a module space. */
export function bookmarksForSpace(space: UnifiedSpace, bookmarks: Record<string, number>): Array<[string, number]> {
  if (space.kind !== "module") return [];
  return Object.entries(bookmarks)
    .filter(([key]) => key.startsWith(`${space.moduleId}/`))
    .sort((a, b) => b[1] - a[1]);
}

// ── Notes grouped by lesson ──────────────────────────────────────────────────

export interface LessonGroup {
  label: string;
  sort: number;
  notes: Note[];
}

/** Group a space's notes by lesson. Module spaces use the lesson title from the
 * curriculum; custom spaces use the free-text `lesson` field. */
export function groupNotesByLesson(space: UnifiedSpace, notes: Note[]): LessonGroup[] {
  const lessonOrder = new Map<string, number>();
  if (space.kind === "module") {
    allLessons
      .filter((r) => r.module.id === space.moduleId)
      .forEach((r, i) => lessonOrder.set(lessonKey(r.module.id, r.lesson.id), i));
  }
  const titleFor = (n: Note): { label: string; sort: number } => {
    if (n.lessonKey) {
      const ref = allLessons.find((r) => lessonKey(r.module.id, r.lesson.id) === n.lessonKey);
      if (ref) return { label: ref.lesson.title, sort: lessonOrder.get(n.lessonKey) ?? 500 };
    }
    if (n.lesson) return { label: n.lesson, sort: 400 };
    return { label: "Unfiled", sort: 999 };
  };
  const map = new Map<string, LessonGroup>();
  for (const n of notes) {
    const { label, sort } = titleFor(n);
    const g = map.get(label) ?? { label, sort, notes: [] };
    g.notes.push(n);
    map.set(label, g);
  }
  return Array.from(map.values()).sort((a, b) => a.sort - b.sort);
}

// ── Timeline ─────────────────────────────────────────────────────────────────

export type SpaceEventKind = "lesson" | "note" | "formula" | "mistake" | "code" | "ai" | "bookmark";
export interface SpaceEvent {
  kind: SpaceEventKind;
  at: number;
  label: string;
  detail?: string;
}

export function spaceTimeline(
  space: UnifiedSpace,
  caps: SpaceCaptures,
  conversations: Conversation[],
  bookmarks: Record<string, number>,
  lastVisited: Record<string, number>
): SpaceEvent[] {
  const events: SpaceEvent[] = [];

  for (const n of caps.all) {
    const k = noteKind(n);
    const kind: SpaceEventKind =
      k === "formula" ? "formula" : k === "mistake" ? "mistake" : k === "code" ? "code" : k === "ai" ? "ai" : "note";
    const label =
      kind === "formula" ? "Saved a formula" : kind === "mistake" ? "Logged a mistake"
      : kind === "code" ? "Saved a snippet" : kind === "ai" ? "Pinned an AI insight" : "Captured a note";
    events.push({ kind, at: n.createdAt, label, detail: (n.title || n.body).replace(/[#*`$_]/g, "").slice(0, 80) });
  }
  for (const c of conversationsForSpace(space, conversations)) {
    events.push({ kind: "ai", at: c.createdAt, label: "Asked the AI tutor", detail: c.title });
  }
  if (space.kind === "module") {
    for (const [key, at] of bookmarksForSpace(space, bookmarks)) {
      const ref = allLessons.find((r) => lessonKey(r.module.id, r.lesson.id) === key);
      events.push({ kind: "bookmark", at, label: "Bookmarked a lesson", detail: ref?.lesson.title });
    }
    // Lesson visits (from progress.lastVisited) that fall inside this module.
    for (const [key, at] of Object.entries(lastVisited)) {
      if (!key.startsWith(`${space.moduleId}/`)) continue;
      const ref = allLessons.find((r) => lessonKey(r.module.id, r.lesson.id) === key);
      if (ref) events.push({ kind: "lesson", at, label: "Studied a lesson", detail: ref.lesson.title });
    }
  }
  return events.sort((a, b) => a.at - b.at);
}
