import type { Note } from "./notes";
import type { Book } from "./books";
import type { Space } from "./spaces";
import type { Project } from "./projects";
import type { Conversation } from "./conversations";
import { noteKind } from "./note-kind";
import { unifiedSpaces, type UnifiedSpace } from "./spaces-model";

export type ResultKind = "space" | "book" | "project" | "note" | "formula" | "mistake" | "code" | "quote" | "vocab" | "ai" | "conversation";

export interface KnowledgeResult {
  kind: ResultKind;
  title: string;
  detail?: string;
  /** Where to navigate: which collection view + id. */
  target: { view: "space" | "book" | "project"; id: string };
}

export interface SearchInputs {
  notes: Note[];
  books: Book[];
  spaces: Space[];
  projects: Project[];
  conversations: Conversation[];
}

/**
 * One search across the whole knowledge system. Every hit resolves to the
 * collection it lives in so results open the right Learning Space / Book /
 * Project — knowledge stays inside its source, never a flat feed.
 */
export function searchKnowledge(query: string, inputs: SearchInputs): KnowledgeResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const { notes, books, spaces, projects, conversations } = inputs;
  const results: KnowledgeResult[] = [];

  const uspaces = unifiedSpaces(spaces);
  const spaceById = new Map(uspaces.map((s) => [s.id, s]));
  const spaceByModule = new Map(uspaces.filter((s) => s.moduleId).map((s) => [s.moduleId!, s]));
  const bookById = new Map(books.map((b) => [b.id, b]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  const matches = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ").toLowerCase().includes(q);

  // Containers themselves.
  for (const s of uspaces) if (matches(s.title, s.source)) results.push({ kind: "space", title: s.title, detail: s.kind === "module" ? "Learning Space" : "Custom space", target: { view: "space", id: s.id } });
  for (const b of books) if (matches(b.title, b.author)) results.push({ kind: "book", title: b.title, detail: b.author, target: { view: "book", id: b.id } });
  for (const p of projects) if (matches(p.title, p.description)) results.push({ kind: "project", title: p.title, detail: "Project", target: { view: "project", id: p.id } });

  // Notes — resolve to their container and tag with their artifact kind.
  for (const n of notes) {
    if (!matches(n.body, n.title, n.word, n.meaning, n.example, n.chapter, ...(n.tags ?? []))) continue;
    const target = resolveNoteTarget(n, spaceById, spaceByModule, bookById, projectById);
    if (!target) continue;
    const k = noteKind(n);
    const kind: ResultKind =
      k === "formula" ? "formula" : k === "mistake" ? "mistake" : k === "code" ? "code"
      : k === "quote" ? "quote" : k === "vocab" ? "vocab" : k === "ai" ? "ai" : "note";
    results.push({
      kind,
      title: (k === "vocab" ? n.word : n.title) || n.body.replace(/[#*`$_]/g, "").slice(0, 60) || k,
      detail: containerName(target, spaceById, bookById, projectById),
      target,
    });
  }

  // Conversations.
  for (const c of conversations) {
    if (!matches(c.title, ...c.turns.map((t) => t.text))) continue;
    const space = c.spaceId ? spaceById.get(c.spaceId) : c.moduleId ? spaceByModule.get(c.moduleId) : undefined;
    if (!space) continue;
    results.push({ kind: "conversation", title: c.title, detail: space.title, target: { view: "space", id: space.id } });
  }

  return results.slice(0, 50);
}

function resolveNoteTarget(
  n: Note,
  spaceById: Map<string, UnifiedSpace>,
  spaceByModule: Map<string, UnifiedSpace>,
  bookById: Map<string, Book>,
  projectById: Map<string, Project>
): KnowledgeResult["target"] | null {
  if (n.bookId && bookById.has(n.bookId)) return { view: "book", id: n.bookId };
  if (n.projectId && projectById.has(n.projectId)) return { view: "project", id: n.projectId };
  if (n.spaceId && spaceById.has(n.spaceId)) return { view: "space", id: n.spaceId };
  if (n.moduleId && spaceByModule.has(n.moduleId)) return { view: "space", id: spaceByModule.get(n.moduleId)!.id };
  return null;
}

function containerName(
  target: KnowledgeResult["target"],
  spaceById: Map<string, UnifiedSpace>,
  bookById: Map<string, Book>,
  projectById: Map<string, Project>
): string {
  if (target.view === "book") return bookById.get(target.id)?.title ?? "";
  if (target.view === "project") return projectById.get(target.id)?.title ?? "";
  return spaceById.get(target.id)?.title ?? "";
}
